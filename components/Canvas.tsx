import React, { useState, useEffect, useRef } from 'react';
import type { Scene, Source, InteractionState } from '../types';
import SourceRenderer from './SourceRenderer';

interface CanvasProps {
  scene: Scene | undefined;
  isLocked: boolean;
  selectedSourceId: string | null;
  onSelectSource: (id: string | null) => void;
  onUpdateSourceStyle: (id: string, style: Partial<Source['style']>) => void;
  onUpdateSource: (id: string, updatedSource: Partial<Source> | ((s: Source) => Partial<Source>)) => void;
  onInteractionEnd: () => void;
  isSnapToGridEnabled: boolean;
  canvasScale?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  onSourceContextMenu?: (e: React.MouseEvent, sourceId: string) => void;
  onCanvasContextMenu?: (e: React.MouseEvent) => void;
  isMobileMode?: boolean;
  left?: number;
  top?: number;
  interfaceAnimations?: string;
  framerateLimit?: string;
  isTransitioning?: boolean;
  currentPlayingTransition?: any | null;
}

const GRID_SIZE = 20;

const Grid: React.FC = () => (
    <div className="absolute inset-0 w-full h-full" style={{
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
        `,
        zIndex: -1
    }}></div>
);

const Canvas: React.FC<CanvasProps> = ({ 
  scene, isLocked, selectedSourceId, onSelectSource, 
  onUpdateSourceStyle, onUpdateSource, onInteractionEnd, 
  isSnapToGridEnabled, canvasScale = 1, canvasWidth = 1920, canvasHeight = 1080,
  onSourceContextMenu, onCanvasContextMenu, isMobileMode = false, left, top,
  interfaceAnimations = 'enabled',
  framerateLimit = 'uncapped',
  isTransitioning = false,
  currentPlayingTransition = null
}) => {
  const [hoveredSourceId, setHoveredSourceId] = useState<string | null>(null);
  const [interaction, setInteraction] = useState<InteractionState>({ type: 'none', sourceId: null, startX: 0, startY: 0, startWidth: 0, startHeight: 0, startSourceX: 0, startSourceY: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  // Fix: Initialize useRef with null for better type safety and to avoid potential runtime errors.
  const animationFrameRef = useRef<number | null>(null);

  const onInteractionEndRef = useRef(onInteractionEnd);
  useEffect(() => {
    onInteractionEndRef.current = onInteractionEnd;
  }, [onInteractionEnd]);

  const prevSceneRef = useRef<Scene | undefined>(undefined);
  const [currentSceneId, setCurrentSceneId] = useState<string | undefined>(scene?.id);
  const [moveStyles, setMoveStyles] = useState<Record<string, Partial<Source['style']>>>({});
  const [triggerMove, setTriggerMove] = useState(false);
  const [outgoingSources, setOutgoingSources] = useState<Source[]>([]);

  useEffect(() => {
    if (!isTransitioning) {
      setOutgoingSources([]);
    }
  }, [isTransitioning]);

  // Synchronous phase layout matching to prevent 1-frame flash/disappearance.
  // By updating state synchronously during render, React repeats the render pass with the correct
  // matching overrides BEFORE the browser can paint the intermediate unshifted/unscaled state.
  if (scene && scene.id !== currentSceneId) {
    const prevScene = prevSceneRef.current;
    if (prevScene && currentPlayingTransition?.type === 'move' && isTransitioning) {
      const initialOverrideStyles: Record<string, Partial<Source['style']>> = {};
      const claimedPrevIds = new Set<string>();

      // Identify outgoing sources from prevScene that are not matched in the new scene
      const unclaimedPrev = prevScene.sources.filter(prevSrc => {
        const isMatched = scene.sources.some(newSrc => {
          return prevSrc.id === newSrc.id || 
            (prevSrc.type === newSrc.type && prevSrc.content === newSrc.content && newSrc.content) ||
            (prevSrc.name.trim().toLowerCase() === newSrc.name.trim().toLowerCase() && prevSrc.type === newSrc.type);
        });
        return !isMatched;
      });

      // Modify target values of outgoing sources so they exit out of view
      const outgoingWithExitTarget = unclaimedPrev.map(prevSrc => {
        const w = prevSrc.style.width ?? 100;
        const h = prevSrc.style.height ?? 100;
        const cx = (prevSrc.style.x ?? 0) + w / 2;
        const cy = (prevSrc.style.y ?? 0) + h / 2;
        
        const dLeft = cx;
        const dRight = canvasWidth - cx;
        const dTop = cy;
        const dBottom = canvasHeight - cy;
        
        const minD = Math.min(dLeft, dRight, dTop, dBottom);
        let targetX = prevSrc.style.x ?? 0;
        let targetY = prevSrc.style.y ?? 0;
        
        if (minD === dLeft) {
          targetX = -w - 150;
        } else if (minD === dRight) {
          targetX = canvasWidth + 150;
        } else if (minD === dTop) {
          targetY = -h - 150;
        } else {
          targetY = canvasHeight + 150;
        }

        // We override their starting transition styles to be their current positions
        initialOverrideStyles[prevSrc.id] = {
          x: prevSrc.style.x,
          y: prevSrc.style.y,
          width: w,
          height: h,
          opacity: prevSrc.style.opacity ?? 1,
          scale: prevSrc.style.scale ?? 1,
          rotation: prevSrc.style.rotation ?? 0,
          scaleX: prevSrc.style.scaleX ?? 1,
          scaleY: prevSrc.style.scaleY ?? 1,
        };

        return {
          ...prevSrc,
          style: {
            ...prevSrc.style,
            x: targetX,
            y: targetY,
            opacity: 0,
          }
        };
      });

      setOutgoingSources(outgoingWithExitTarget);

      scene.sources.forEach(newSrc => {
        const match = prevScene.sources.find(prevSrc => {
          if (claimedPrevIds.has(prevSrc.id)) return false;
          // Match by ID, same name & type, or same content & type (representing the exact same background source)
          return prevSrc.id === newSrc.id || 
            (prevSrc.type === newSrc.type && prevSrc.content === newSrc.content && newSrc.content) ||
            (prevSrc.name.trim().toLowerCase() === newSrc.name.trim().toLowerCase() && prevSrc.type === newSrc.type);
        });

        if (match) {
          claimedPrevIds.add(match.id);
          initialOverrideStyles[newSrc.id] = {
            x: match.style.x,
            y: match.style.y,
            width: match.style.width,
            height: match.style.height,
            opacity: match.style.opacity,
            scale: match.style.scale,
            rotation: match.style.rotation,
            scaleX: match.style.scaleX,
            scaleY: match.style.scaleY,
          };
        } else {
          // If not matched, fly in from outside the canvas view
          const w = newSrc.style.width ?? 100;
          const h = newSrc.style.height ?? 100;
          const cx = (newSrc.style.x ?? 0) + w / 2;
          const cy = (newSrc.style.y ?? 0) + h / 2;
          
          const dLeft = cx;
          const dRight = canvasWidth - cx;
          const dTop = cy;
          const dBottom = canvasHeight - cy;
          
          const minD = Math.min(dLeft, dRight, dTop, dBottom);
          let startX = newSrc.style.x ?? 0;
          let startY = newSrc.style.y ?? 0;
          
          if (minD === dLeft) {
            startX = -w - 150;
          } else if (minD === dRight) {
            startX = canvasWidth + 150;
          } else if (minD === dTop) {
            startY = -h - 150;
          } else {
            startY = canvasHeight + 150;
          }
          
          initialOverrideStyles[newSrc.id] = {
            x: startX,
            y: startY,
            width: w,
            height: h,
            opacity: 0,
            scale: newSrc.style.scale ?? 1,
            rotation: newSrc.style.rotation ?? 0,
            scaleX: newSrc.style.scaleX ?? 1,
            scaleY: newSrc.style.scaleY ?? 1,
          };
        }
      });

      if (Object.keys(initialOverrideStyles).length > 0) {
        setMoveStyles(initialOverrideStyles);
        setTriggerMove(true);
      } else {
        setMoveStyles({});
        setTriggerMove(false);
      }
    } else {
      setMoveStyles({});
      setTriggerMove(false);
      setOutgoingSources([]);
    }
    setCurrentSceneId(scene.id);
  }

  useEffect(() => {
    prevSceneRef.current = scene;
  }, [scene]);

  useEffect(() => {
    if (triggerMove) {
      const timer = setTimeout(() => {
        setMoveStyles({});
        setTriggerMove(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [triggerMove]);

  const handleMouseDown = (e: React.MouseEvent, source: Source, interactionType: InteractionState['type']) => {
    if (isLocked || source.locked) {
        onSelectSource(source.id);
        return;
    }
    e.preventDefault();
    e.stopPropagation();

    onSelectSource(source.id);
    
    if (interactionType === 'none') {
        setInteraction({ type: 'none', sourceId: source.id, startX: 0, startY: 0, startWidth: 0, startHeight: 0, startSourceX: 0, startSourceY: 0 });
        return;
    }

    setInteraction({
      type: interactionType,
      sourceId: source.id,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: source.style.width,
      startHeight: source.style.height,
      startSourceX: source.style.x,
      startSourceY: source.style.y,
    });
  };

  const handleTouchStart = (e: React.TouchEvent, source: Source, interactionType: InteractionState['type']) => {
    if (isLocked || source.locked) {
        onSelectSource(source.id);
        return;
    }
    e.stopPropagation();

    onSelectSource(source.id);
    
    if (interactionType === 'none') {
        setInteraction({ type: 'none', sourceId: source.id, startX: 0, startY: 0, startWidth: 0, startHeight: 0, startSourceX: 0, startSourceY: 0 });
        return;
    }

    const touch = e.touches[0];
    if (!touch) return;

    setInteraction({
      type: interactionType,
      sourceId: source.id,
      startX: touch.clientX,
      startY: touch.clientY,
      startWidth: source.style.width,
      startHeight: source.style.height,
      startSourceX: source.style.x,
      startSourceY: source.style.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (interaction.type === 'none' || !interaction.sourceId) return;
    e.preventDefault();

    if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
        const dx = (e.clientX - interaction.startX) / canvasScale;
        const dy = (e.clientY - interaction.startY) / canvasScale;

        let updates: Partial<Source['style']> = {};
        
        const snap = (value: number) => isSnapToGridEnabled ? Math.round(value / GRID_SIZE) * GRID_SIZE : value;

        switch (interaction.type) {
            case 'move':
                updates.x = snap(interaction.startSourceX + dx);
                updates.y = snap(interaction.startSourceY + dy);
                break;
            case 'resize-br':
                updates.width = snap(Math.max(50, interaction.startWidth + dx));
                updates.height = snap(Math.max(50, interaction.startHeight + dy));
                break;
            case 'resize-bl':
                updates.width = snap(Math.max(50, interaction.startWidth - dx));
                updates.height = snap(Math.max(50, interaction.startHeight + dy));
                updates.x = snap(interaction.startSourceX + dx);
                break;
            case 'resize-tr':
                updates.width = snap(Math.max(50, interaction.startWidth + dx));
                updates.height = snap(Math.max(50, interaction.startHeight - dy));
                updates.y = snap(interaction.startSourceY + dy);
                break;
            case 'resize-tl':
                updates.width = snap(Math.max(50, interaction.startWidth - dx));
                updates.height = snap(Math.max(50, interaction.startHeight - dy));
                updates.x = snap(interaction.startSourceX + dx);
                updates.y = snap(interaction.startSourceY + dy);
                break;
        }
        
        if (Object.keys(updates).length > 0) {
            onUpdateSourceStyle(interaction.sourceId!, updates);
        }
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (interaction.type === 'none' || !interaction.sourceId) return;
    if (e.cancelable) {
      e.preventDefault();
    }

    if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
        const touch = e.touches[0];
        if (!touch) return;
        const dx = (touch.clientX - interaction.startX) / canvasScale;
        const dy = (touch.clientY - interaction.startY) / canvasScale;

        let updates: Partial<Source['style']> = {};
        
        const snap = (value: number) => isSnapToGridEnabled ? Math.round(value / GRID_SIZE) * GRID_SIZE : value;

        switch (interaction.type) {
            case 'move':
                updates.x = snap(interaction.startSourceX + dx);
                updates.y = snap(interaction.startSourceY + dy);
                break;
            case 'resize-br':
                updates.width = snap(Math.max(50, interaction.startWidth + dx));
                updates.height = snap(Math.max(50, interaction.startHeight + dy));
                break;
            case 'resize-bl':
                updates.width = snap(Math.max(50, interaction.startWidth - dx));
                updates.height = snap(Math.max(50, interaction.startHeight + dy));
                updates.x = snap(interaction.startSourceX + dx);
                break;
            case 'resize-tr':
                updates.width = snap(Math.max(50, interaction.startWidth + dx));
                updates.height = snap(Math.max(50, interaction.startHeight - dy));
                updates.y = snap(interaction.startSourceY + dy);
                break;
            case 'resize-tl':
                updates.width = snap(Math.max(50, interaction.startWidth - dx));
                updates.height = snap(Math.max(50, interaction.startHeight - dy));
                updates.x = snap(interaction.startSourceX + dx);
                updates.y = snap(interaction.startSourceY + dy);
                break;
        }
        
        if (Object.keys(updates).length > 0) {
            onUpdateSourceStyle(interaction.sourceId!, updates);
        }
    });
  };

  const handleMouseUp = () => {
    if (interaction.type !== 'none' && interaction.sourceId) {
        onInteractionEndRef.current();
    }
    setInteraction({ type: 'none', sourceId: null, startX: 0, startY: 0, startWidth: 0, startHeight: 0, startSourceX: 0, startSourceY: 0 });
    if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
    }
  };
  
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || e.target === canvasRef.current) {
        onSelectSource(null);
    }
  };

  useEffect(() => {
    if (interaction.type !== 'none' && interaction.sourceId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp, { once: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp, { once: true });
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interaction, isSnapToGridEnabled]);

  if (!scene) {
    return <div className="w-full h-full flex items-center justify-center">Loading scene...</div>;
  }
  
  const isInteracting = interaction.type !== 'none';
  const interactingSourceId = interaction.sourceId;

  const curLeft = left !== undefined ? left : window.innerWidth / 2;
  const curTop = top !== undefined ? top : window.innerHeight / 2;
  const halfW = (canvasWidth * canvasScale) / 2;
  const halfH = (canvasHeight * canvasScale) / 2;

  const xStart = curLeft - halfW;
  const xEnd = curLeft + halfW;
  const yStart = curTop - halfH;
  const yEnd = curTop + halfH;

  return (
    <div 
        className="absolute inset-0 overflow-hidden select-none bg-black flex items-center justify-center"
        onClick={handleCanvasClick}
        onContextMenu={(e) => {
          if (e.target === e.currentTarget || (canvasRef.current && !canvasRef.current.contains(e.target as Node))) {
            e.preventDefault();
            if (onCanvasContextMenu) {
              onCanvasContextMenu(e);
            }
          }
        }}
    >
      {/* Matte Letterboxing / Pillarboxing Bars */}
      <div 
        className="absolute bg-black pointer-events-none z-30" 
        style={{ top: 0, bottom: 0, left: 0, width: Math.max(0, xStart) }}
      />
      <div 
        className="absolute bg-black pointer-events-none z-30" 
        style={{ top: 0, bottom: 0, left: `${Math.max(0, xEnd)}px`, right: 0 }}
      />
      <div 
        className="absolute bg-black pointer-events-none z-30" 
        style={{ top: 0, left: 0, right: 0, height: Math.max(0, yStart) }}
      />
      <div 
        className="absolute bg-black pointer-events-none z-30" 
        style={{ top: `${Math.max(0, yEnd)}px`, bottom: 0, left: 0, right: 0 }}
      />

      <div
          ref={canvasRef}
          className={`absolute origin-center ${interfaceAnimations === 'enabled' ? 'transition-all duration-300' : 'transition-none'}`}
          onContextMenu={(e) => {
            // If right-clicking empty space on canvas (not on any source)
            if (e.target === canvasRef.current) {
              e.preventDefault();
              if (onCanvasContextMenu) {
                onCanvasContextMenu(e);
              }
            }
          }}
          style={{
              left: left !== undefined ? `${left}px` : '50%',
              top: top !== undefined ? `${top}px` : '50%',
              width: canvasWidth,
              height: canvasHeight,
              transform: `translate(-50%, -50%) scale(${canvasScale})`,
              backgroundColor: scene.backgroundColor || '#000000',
              boxShadow: isLocked ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              overflow: 'hidden'
          }}
      >
        {isSnapToGridEnabled && <Grid />}
        {(() => {
          const usedKeys = new Set<string>();
          const activeSources = scene.sources.filter(source => source.visible);
          const allSourcesToRender = isTransitioning && currentPlayingTransition?.type === 'move'
            ? [...activeSources, ...outgoingSources]
            : activeSources;

          return allSourcesToRender
            .sort((a,b) => a.style.zIndex - b.style.zIndex)
            .map(source => {
              const overrideStyle = moveStyles[source.id];
              const renderSource = overrideStyle 
                ? { ...source, style: { ...source.style, ...overrideStyle } } 
                : source;

              let reactKey = `stable-source-${source.id}`;
              if (source.type === 'video' || source.type === 'image' || source.type === 'iframe') {
                const contentStr = typeof source.content === 'string' ? source.content.trim() : '';
                const nameStr = source.name.trim().toLowerCase();
                if (contentStr) {
                  const candidate = `stable-media-${source.type}-${nameStr}-${contentStr}`;
                  if (!usedKeys.has(candidate)) {
                    reactKey = candidate;
                  }
                }
              }
              usedKeys.add(reactKey);

              const isOutgoing = !scene.sources.some(s => s.id === source.id);

              return (
                <SourceRenderer
                  key={reactKey}
                  source={renderSource}
                  isLocked={isLocked || isOutgoing}
                  isSelected={!isOutgoing && selectedSourceId === source.id}
                  isHovered={!isOutgoing && hoveredSourceId === source.id}
                  isInteracting={!isOutgoing && isInteracting && interactingSourceId === source.id}
                  interactionType={interaction.type}
                  onMouseDown={(e, type) => !isOutgoing && handleMouseDown(e, source, type)}
                  onTouchStart={(e, type) => !isOutgoing && handleTouchStart(e, source, type)}
                  isMobileMode={isMobileMode}
                  onMouseEnter={() => !isOutgoing && !isInteracting && setHoveredSourceId(source.id)}
                  onMouseLeave={() => !isOutgoing && setHoveredSourceId(null)}
                  onUpdateStyle={(style) => !isOutgoing && onUpdateSourceStyle(source.id, style)}
                  onUpdate={(updates) => !isOutgoing && onUpdateSource(source.id, updates)}
                  onContextMenu={(e) => {
                    if (!isOutgoing && onSourceContextMenu) {
                      onSourceContextMenu(e, source.id);
                    }
                  }}
                  framerateLimit={framerateLimit}
                  isTransitioning={isTransitioning}
                  currentPlayingTransition={currentPlayingTransition}
                />
              );
            });
        })()}
      </div>
    </div>
  );
};

export default Canvas;
