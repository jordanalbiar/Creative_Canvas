
import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Scene, Source, SourceType, Theme, CodeContent, Filters, SceneTransition, SceneTransitionType, ActionLogEntry } from './types';
import Canvas from './components/Canvas';
import UI, { WelcomeOverlay, themes } from './components/UI';

const logoWidth = 512;
const logoHeight = 261;
const smallLogoWidth = logoWidth * 0.6;
const smallLogoHeight = logoHeight * 0.6;

const defaultFilters: Filters = {
  hue: 0,
  blur: 0,
  sharpness: 0,
  shape: 'none',
};

const matrixRainJS = `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = 'ABCDEFGHIJKLMNOPQRSTUVXYZ';
const fontSize = 10;
const columns = canvas.width / fontSize;

// Instead of just tracking the Y position (drops), 
// we will track both the Y position and the length of the trail
const drops = Array.from({ length: columns }, () => ({
    y: Math.random() * -100, // Start above the screen randomly
    speed: Math.random() * 0.5 + 0.5 // Varied speeds look nicer
}));

function draw() {
    // 1. Clear the canvas completely so it stays transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < drops.length; i++) {
        const drop = drops[i];
        
        // 2. Loop backwards to draw the trail behind the head of the drop
        const trailLength = 15; 
        for (let j = 0; j < trailLength; j++) {
            const trailY = drop.y - j;
            if (trailY < 0) continue; // Don't draw off-screen

            // Calculate opacity: the head (j=0) is bright, the tail (j=14) fades out
            const opacity = 1 - (j / trailLength);
            
            const text = letters[Math.floor(Math.random() * letters.length)];
            
            // Apply the opacity to the green color
            ctx.fillStyle = \`rgba(0, 255, 0, \${opacity})\`;
            ctx.fillText(text, i * fontSize, trailY * fontSize);
        }

        // Move the drop down
        drop.y += drop.speed;

        // Reset drop to the top if it goes off screen
        if (drop.y * fontSize > canvas.height && Math.random() > 0.975) {
            drop.y = 0;
        }
    }
}

const interval = setInterval(draw, 33);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});`;

const defaultSourceStyle: Omit<Source['style'], 'x' | 'y' | 'width' | 'height' | 'zIndex'> = {
    opacity: 1,
    scale: 1,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    resizeBehavior: 'static',
    boxShadow: false,
    shadowColor: '#000000',
    shadowBlur: 15,
    stroke: false,
    strokeColor: '#ffffff',
    strokeWidth: 2,
    fontSize: 16,
    textColor: '#ffffff',
    fontWeight: 'normal',
    textAlign: 'left',
    loop: true,
    playbackRate: 1,
    volume: 1,
    muted: true,
    slideDuration: 5,
    chromaKey: {
        enabled: false,
        color: '#00ff00',
        sensitivity: 20,
    },
    colorKey: {
        enabled: false,
        color: '#ff00ff',
        sensitivity: 20,
    },
    filters: { ...defaultFilters },
    brushColor: '#ffffff',
    brushSize: 5,
};

const initialScenes: Scene[] = [
  {
    "id": "scene-1",
    "name": "Main Scene",
    "icon": "🎬",
    "backgroundColor": "#000000",
    "sources": [
      {
        "id": "default-background",
        "type": "image",
        "name": "Background",
        "visible": true,
        "locked": false,
        "content": "https://i.imgur.com/hYM563K.png",
        "style": {
          ...defaultSourceStyle,
          "opacity": 1,
          "scale": 1,
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1,
          "resizeBehavior": "fill",
          "boxShadow": false,
          "shadowColor": "#000000",
          "shadowBlur": 15,
          "stroke": false,
          "strokeColor": "#ffffff",
          "strokeWidth": 2,
          "fontSize": 16,
          "textColor": "#ffffff",
          "fontWeight": "normal",
          "textAlign": "left",
          "loop": true,
          "playbackRate": 1,
          "volume": 1,
          "muted": true,
          "slideDuration": 5,
          "chromaKey": {
            "enabled": false,
            "color": "#00ff00",
            "sensitivity": 20
          },
          "colorKey": {
            "enabled": false,
            "color": "#ff00ff",
            "sensitivity": 20
          },
          "filters": {
            "hue": 0,
            "blur": 0,
            "sharpness": 0,
            "shape": "none"
          },
          "brushColor": "#ffffff",
          "brushSize": 5,
          "x": 0,
          "y": 0,
          "width": 1920,
          "height": 1080,
          "zIndex": 0
        }
      },
      {
        "id": "default-logo",
        "type": "image",
        "name": "Logo",
        "visible": true,
        "locked": false,
        "content": "https://i.imgur.com/vXi6tuT.png",
        "style": {
          ...defaultSourceStyle,
          "opacity": 1,
          "scale": 1,
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1,
          "resizeBehavior": "center",
          "boxShadow": false,
          "shadowColor": "rgba(0,0,0,0.5)",
          "shadowBlur": 20,
          "stroke": false,
          "strokeColor": "#ffffff",
          "strokeWidth": 2,
          "fontSize": 16,
          "textColor": "#ffffff",
          "fontWeight": "normal",
          "textAlign": "left",
          "loop": true,
          "playbackRate": 1,
          "volume": 1,
          "muted": true,
          "slideDuration": 5,
          "chromaKey": {
            "enabled": false,
            "color": "#00ff00",
            "sensitivity": 20
          },
          "colorKey": {
            "enabled": true,
            "color": "#292929",
            "sensitivity": 25
          },
          "filters": {
            "hue": 0,
            "blur": 0,
            "sharpness": 0,
            "shape": "none"
          },
          "brushColor": "#ffffff",
          "brushSize": 5,
          "x": 1359.328471248247,
          "y": 777.4927769985975,
          "width": 537.6,
          "height": 274.05,
          "zIndex": 1
        }
      },
      {
        "id": "default-video-animation",
        "type": "video",
        "name": "Video Example",
        "visible": true,
        "locked": false,
        "content": "https://i.imgur.com/Vh2UVFw.mp4",
        "style": {
          ...defaultSourceStyle,
          "opacity": 1,
          "scale": 1,
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1,
          "resizeBehavior": "static",
          "boxShadow": false,
          "shadowColor": "#000000",
          "shadowBlur": 15,
          "stroke": false,
          "strokeColor": "#ffffff",
          "strokeWidth": 2,
          "fontSize": 16,
          "textColor": "#ffffff",
          "fontWeight": "normal",
          "textAlign": "left",
          "loop": true,
          "playbackRate": 1,
          "volume": 1,
          "muted": true,
          "slideDuration": 5,
          "chromaKey": {
            "enabled": false,
            "color": "#00ff00",
            "sensitivity": 20
          },
          "colorKey": {
            "enabled": true,
            "color": "#000000",
            "sensitivity": 30
          },
          "filters": {
            "hue": 0,
            "blur": 0,
            "sharpness": 0,
            "shape": "none"
          },
          "brushColor": "#ffffff",
          "brushSize": 5,
          "x": 1089.438990182328,
          "y": 845.7924263674614,
          "width": 308.44319775596074,
          "height": 197.671809256662,
          "zIndex": 2
        }
      }
    ]
  },
  {
    "id": "scene-2",
    "name": "Code Example",
    "icon": "💻",
    "backgroundColor": "#000000",
    "sources": [
      {
        "id": "scene2-background",
        "type": "image",
        "name": "Background",
        "visible": true,
        "locked": false,
        "content": "https://i.imgur.com/hYM563K.png",
        "style": {
          ...defaultSourceStyle,
          "opacity": 1,
          "scale": 1,
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1,
          "resizeBehavior": "fill",
          "boxShadow": false,
          "shadowColor": "#000000",
          "shadowBlur": 15,
          "stroke": false,
          "strokeColor": "#ffffff",
          "strokeWidth": 2,
          "fontSize": 16,
          "textColor": "#ffffff",
          "fontWeight": "normal",
          "textAlign": "left",
          "loop": true,
          "playbackRate": 1,
          "volume": 1,
          "muted": true,
          "slideDuration": 5,
          "chromaKey": {
            "enabled": false,
            "color": "#00ff00",
            "sensitivity": 20
          },
          "colorKey": {
            "enabled": false,
            "color": "#ff00ff",
            "sensitivity": 20
          },
          "filters": {
            "hue": 0,
            "blur": 0,
            "sharpness": 0,
            "shape": "none"
          },
          "brushColor": "#ffffff",
          "brushSize": 5,
          "x": 0,
          "y": 5.385694249649369,
          "width": 1920,
          "height": 1080,
          "zIndex": 0
        }
      },
      {
        "id": "scene2-logo",
        "type": "image",
        "name": "Small Logo",
        "visible": true,
        "locked": false,
        "content": "https://i.imgur.com/vXi6tuT.png",
        "style": {
          ...defaultSourceStyle,
          "opacity": 1,
          "scale": 1,
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1,
          "resizeBehavior": "static",
          "boxShadow": false,
          "shadowColor": "#000000",
          "shadowBlur": 15,
          "stroke": false,
          "strokeColor": "#ffffff",
          "strokeWidth": 2,
          "fontSize": 16,
          "textColor": "#ffffff",
          "fontWeight": "normal",
          "textAlign": "left",
          "loop": true,
          "playbackRate": 1,
          "volume": 1,
          "muted": true,
          "slideDuration": 5,
          "chromaKey": {
            "enabled": false,
            "color": "#00ff00",
            "sensitivity": 20
          },
          "colorKey": {
            "enabled": true,
            "color": "#292929",
            "sensitivity": 25
          },
          "filters": {
            "hue": 0,
            "blur": 0,
            "sharpness": 0,
            "shape": "none"
          },
          "brushColor": "#ffffff",
          "brushSize": 5,
          "x": 1291.6552594670404,
          "y": 94.72117812061711,
          "width": 502.692286115007,
          "height": 274.0782608695652,
          "zIndex": 1
        }
      },
      {
        "id": "source-1762634820820",
        "type": "text",
        "name": "New Text",
        "visible": true,
        "locked": false,
        "content": "A dynamic canvas application to create and manage scenes with various media sources like images, videos, text, and browser iframes. Features a toggleable UI for source and scene management, and interactive, editable sources on the canvas.\n\n",
        "style": {
          ...defaultSourceStyle,
          "opacity": 1,
          "scale": 1,
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1,
          "resizeBehavior": "static",
          "boxShadow": false,
          "shadowColor": "#000000",
          "shadowBlur": 15,
          "stroke": false,
          "strokeColor": "#ffffff",
          "strokeWidth": 2,
          "fontSize": 43,
          "textColor": "#ffffff",
          "fontWeight": "normal",
          "textAlign": "center",
          "loop": true,
          "playbackRate": 1,
          "volume": 1,
          "muted": true,
          "slideDuration": 5,
          "chromaKey": {
            "enabled": false,
            "color": "#00ff00",
            "sensitivity": 20
          },
          "colorKey": {
            "enabled": false,
            "color": "#ff00ff",
            "sensitivity": 20
          },
          "filters": {
            "hue": 0,
            "blur": 0,
            "sharpness": 0,
            "shape": "none"
          },
          "brushColor": "#ffffff",
          "brushSize": 5,
          "x": 1295.7194950911642,
          "y": 418.1921458625526,
          "width": 478.40673211781206,
          "height": 568.0631136044881,
          "zIndex": 2,
          "fontFamily": "superscript"
        }
      },
      {
        "id": "source-1762634998835",
        "type": "code",
        "name": "Code Example",
        "visible": true,
        "locked": false,
        "content": {
          "html": "<canvas id=\"canvas\"></canvas>",
          "css": "body, html { margin: 0; padding: 0; overflow: hidden; background-color: transparent; } canvas { display: block; }",
          "js": "const canvas = document.getElementById('canvas');\nconst ctx = canvas.getContext('2d');\ncanvas.width = window.innerWidth;\ncanvas.height = window.innerHeight;\n\nconst letters = 'ABCDEFGHIJKLMNOPQRSTUVXYZ';\nconst fontSize = 7;\nconst columns = canvas.width / fontSize;\n\nconst drops = Array.from({ length: columns }, () => ({\n    y: Math.random() * -100, // Start above the screen randomly\n    speed: (Math.random() * 0.5 + 0.5) * 1.6 // Varied speeds look nicer\n}));\n\nfunction draw() {\n    // 1. Clear the canvas completely so it stays transparent\n    ctx.clearRect(0, 0, canvas.width, canvas.height);\n\n    for (let i = 0; i < drops.length; i++) {\n        const drop = drops[i];\n        \n        // 2. Loop backwards to draw the trail behind the head of the drop\n        const trailLength = 15; \n        for (let j = 0; j < trailLength; j++) {\n            const trailY = drop.y - j;\n            if (trailY < 0) continue; // Don't draw off-screen\n\n            // Calculate opacity: the head (j=0) is bright, the tail (j=14) fades out\n            const opacity = 1 - (j / trailLength);\n            \n            const text = letters[Math.floor(Math.random() * letters.length)];\n            \n            // Apply the opacity to the custom color using globalAlpha\n            ctx.save();\n            ctx.globalAlpha = opacity;\n            ctx.fillStyle = '#00ff00';\n            ctx.fillText(text, i * fontSize, trailY * fontSize);\n            ctx.restore();\n        }\n\n        // Move the drop down\n        drop.y += drop.speed;\n\n        // Reset drop to the top if it goes off screen\n        if (drop.y * fontSize > canvas.height && Math.random() > 0.975) {\n            drop.y = 0;\n        }\n    }\n}\n\nconst interval = setInterval(draw, 33);\n\nwindow.addEventListener('resize', () => {\n    canvas.width = window.innerWidth;\n    canvas.height = window.innerHeight;\n});"
        },
        "style": {
          ...defaultSourceStyle,
          "opacity": 1,
          "scale": 1,
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1,
          "resizeBehavior": "static",
          "boxShadow": true,
          "shadowColor": "#000000",
          "shadowBlur": 48,
          "stroke": true,
          "strokeColor": "#ffffff",
          "strokeWidth": 2,
          "fontSize": 16,
          "textColor": "#ffffff",
          "fontWeight": "normal",
          "textAlign": "left",
          "loop": true,
          "playbackRate": 1,
          "volume": 1,
          "muted": true,
          "slideDuration": 5,
          "chromaKey": {
            "enabled": false,
            "color": "#00ff00",
            "sensitivity": 20
          },
          "colorKey": {
            "enabled": false,
            "color": "#ff00ff",
            "sensitivity": 20
          },
          "filters": {
            "hue": 0,
            "blur": 0,
            "sharpness": 0,
            "shape": "none"
          },
          "brushColor": "#ffffff",
          "brushSize": 5,
          "x": 236.85834502103788,
          "y": 204.9929873772791,
          "width": 837.6998597475456,
          "height": 293.015427769986,
          "zIndex": 3,
          "codeSize": 7,
          "codeSpeed": 1.6,
          "codeColor": "#00ff00"
        }
      },
      {
        "id": "source-1781286682955-205524",
        "type": "code",
        "name": "New Code",
        "visible": true,
        "locked": false,
        "content": {
          "html": "<canvas id=\"canvas\"></canvas>",
          "css": "body { background-color: transparent; margin: 0; overflow: hidden; canvas { display: block; }",
          "js": "const canvas = document.getElementById('canvas');\nconst ctx = canvas.getContext('2d');\nlet particles = [];\nfunction resize() {\n    canvas.width = window.innerWidth;\n    canvas.height = window.innerHeight;\n    particles = [];\n    const particleCount = 200;\n    for (let i = 0; i < particleCount; i++) {\n        particles.push({\n            x: Math.random() * canvas.width,\n            y: Math.random() * canvas.height,\n            radius: Math.random() * 4 + 1,\n            speed: (Math.random() * 2 + 1) * 1,\n        });\n    }\n}\nfunction animate() {\n    requestAnimationFrame(animate);\n    ctx.clearRect(0, 0, canvas.width, canvas.height);\n    particles.forEach(p => {\n        p.y += p.speed;\n        if (p.y > canvas.height) {\n            p.y = -p.radius;\n            p.x = Math.random() * canvas.width;\n        }\n        ctx.beginPath();\n        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);\n        ctx.fillStyle = '#ffffff';\n        ctx.fill();\n    });\n}\nwindow.addEventListener('resize', resize);\nresize();\nanimate();"
        },
        "style": {
          ...defaultSourceStyle,
          "opacity": 1,
          "scale": 1,
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1,
          "resizeBehavior": "static",
          "boxShadow": true,
          "shadowColor": "#000000",
          "shadowBlur": 53,
          "stroke": true,
          "strokeColor": "#ffffff",
          "strokeWidth": 2,
          "fontSize": 16,
          "textColor": "#ffffff",
          "fontWeight": "normal",
          "textAlign": "left",
          "loop": true,
          "playbackRate": 1,
          "volume": 1,
          "muted": true,
          "slideDuration": 5,
          "chromaKey": {
            "enabled": false,
            "color": "#00ff00",
            "sensitivity": 20
          },
          "colorKey": {
            "enabled": false,
            "color": "#ff00ff",
            "sensitivity": 20
          },
          "filters": {
            "hue": 0,
            "blur": 0,
            "sharpness": 0,
            "shape": "none"
          },
          "brushColor": "#ffffff",
          "brushSize": 5,
          "x": 243.02945301542775,
          "y": 606.6058906030855,
          "width": 846.9004207573632,
          "height": 297.6437587657784,
          "zIndex": 4,
          "codeSize": 4,
          "codeSpeed": 1,
          "codeColor": "#ffffff"
        }
      },
      {
        "id": "default-video-animation",
        "type": "video",
        "name": "Video Example",
        "visible": true,
        "locked": false,
        "content": "https://i.imgur.com/Vh2UVFw.mp4",
        "style": {
          ...defaultSourceStyle,
          "opacity": 1,
          "scale": 1,
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1,
          "resizeBehavior": "static",
          "boxShadow": false,
          "shadowColor": "#000000",
          "shadowBlur": 15,
          "stroke": false,
          "strokeColor": "#ffffff",
          "strokeWidth": 2,
          "fontSize": 16,
          "textColor": "#ffffff",
          "fontWeight": "normal",
          "textAlign": "left",
          "loop": true,
          "playbackRate": 1,
          "volume": 1,
          "muted": true,
          "slideDuration": 5,
          "chromaKey": {
            "enabled": false,
            "color": "#00ff00",
            "sensitivity": 20
          },
          "colorKey": {
            "enabled": true,
            "color": "#000000",
            "sensitivity": 30
          },
          "filters": {
            "hue": 0,
            "blur": 0,
            "sharpness": 0,
            "shape": "none"
          },
          "brushColor": "#ffffff",
          "brushSize": 5,
          "x": 244.27068723702666,
          "y": 606.9004207573632,
          "width": 400,
          "height": 300,
          "zIndex": 5
        }
      }
    ]
  },
  {
    "id": "scene-3",
    "name": "Background Scene",
    "icon": "🖼️",
    "backgroundColor": "#000000",
    "sources": [
      {
        "id": "scene3-background",
        "type": "image",
        "name": "Background",
        "visible": true,
        "locked": false,
        "content": "https://i.imgur.com/hYM563K.png",
        "style": {
          ...defaultSourceStyle,
          "opacity": 1,
          "scale": 1,
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1,
          "resizeBehavior": "fill",
          "boxShadow": false,
          "shadowColor": "#000000",
          "shadowBlur": 15,
          "stroke": false,
          "strokeColor": "#ffffff",
          "strokeWidth": 2,
          "fontSize": 16,
          "textColor": "#ffffff",
          "fontWeight": "normal",
          "textAlign": "left",
          "loop": true,
          "playbackRate": 1,
          "volume": 1,
          "muted": true,
          "slideDuration": 5,
          "chromaKey": {
            "enabled": false,
            "color": "#00ff00",
            "sensitivity": 20
          },
          "colorKey": {
            "enabled": false,
            "color": "#ff00ff",
            "sensitivity": 20
          },
          "filters": {
            "hue": 0,
            "blur": 0,
            "sharpness": 0,
            "shape": "none"
          },
          "brushColor": "#ffffff",
          "brushSize": 5,
          "x": 0,
          "y": 0,
          "width": 1920,
          "height": 1080,
          "zIndex": 0
        }
      },
      {
        "id": "scene3-greenscreen-video",
        "type": "video",
        "name": "Video Example",
        "visible": true,
        "locked": false,
        "content": "https://i.imgur.com/Vh2UVFw.mp4",
        "style": {
          ...defaultSourceStyle,
          "opacity": 1,
          "scale": 1,
          "rotation": 0,
          "scaleX": -1,
          "scaleY": 1,
          "resizeBehavior": "center",
          "boxShadow": false,
          "shadowColor": "#000000",
          "shadowBlur": 15,
          "stroke": false,
          "strokeColor": "#ffffff",
          "strokeWidth": 2,
          "fontSize": 16,
          "textColor": "#ffffff",
          "fontWeight": "normal",
          "textAlign": "left",
          "loop": true,
          "playbackRate": 1,
          "volume": 1,
          "muted": true,
          "slideDuration": 5,
          "chromaKey": {
            "enabled": false,
            "color": "#00ff00",
            "sensitivity": 20
          },
          "colorKey": {
            "enabled": true,
            "color": "#000000",
            "sensitivity": 30
          },
          "filters": {
            "hue": 0,
            "blur": 0,
            "sharpness": 0,
            "shape": "none"
          },
          "brushColor": "#ffffff",
          "brushSize": 5,
          "width": 938.569424964937,
          "height": 663.5343618513324,
          "x": 929.649368863955,
          "y": 381.92145862552604,
          "zIndex": 1
        }
      },
      {
        "id": "default-logo",
        "type": "image",
        "name": "Logo",
        "visible": true,
        "locked": false,
        "content": "https://i.imgur.com/vXi6tuT.png",
        "style": {
          ...defaultSourceStyle,
          "opacity": 1,
          "scale": 1,
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1,
          "resizeBehavior": "center",
          "boxShadow": false,
          "shadowColor": "rgba(0,0,0,0.5)",
          "shadowBlur": 20,
          "stroke": false,
          "strokeColor": "#ffffff",
          "strokeWidth": 2,
          "fontSize": 16,
          "textColor": "#ffffff",
          "fontWeight": "normal",
          "textAlign": "left",
          "loop": true,
          "playbackRate": 1,
          "volume": 1,
          "muted": true,
          "slideDuration": 5,
          "chromaKey": {
            "enabled": false,
            "color": "#00ff00",
            "sensitivity": 20
          },
          "colorKey": {
            "enabled": true,
            "color": "#292929",
            "sensitivity": 25
          },
          "filters": {
            "hue": 0,
            "blur": 0,
            "sharpness": 0,
            "shape": "none"
          },
          "brushColor": "#ffffff",
          "brushSize": 5,
          "x": 45.21907433380102,
          "y": 50.42405329593271,
          "width": 860.7416549789622,
          "height": 511.02054698457226,
          "zIndex": 2
        }
      }
    ]
  },
  {
    "id": "scene-blank",
    "name": "Blank",
    "icon": "⬛",
    "backgroundColor": "#000000",
    "sources": []
  }
];


const App: React.FC = () => {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);
  const [history, setHistory] = useState<Scene[][]>([initialScenes]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [activeSceneId, setActiveSceneId] = useState<string>('scene-1');
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [filteringSourceId, setFilteringSourceId] = useState<string | null>(null);
  const [isUIVisible, setUIVisible] = useState(true);
  const [isSnapToGridEnabled, setSnapToGridEnabled] = useState(false);
  const [isWelcomeVisible, setWelcomeVisible] = useState(true);
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'dark';
  });
  const [scrollbarColor, setScrollbarColor] = useState<string>(() => {
    return localStorage.getItem('scrollbarColor') || '#6366f1';
  });

  const [performancePreset, setPerformancePreset] = useState<string>(() => {
    return localStorage.getItem('performancePreset') || 'high';
  });
  const [framerateLimit, setFramerateLimit] = useState<string>(() => {
    return localStorage.getItem('framerateLimit') || 'uncapped';
  });
  const [renderScale, setRenderScale] = useState<string>(() => {
    return localStorage.getItem('renderScale') || '1.0';
  });
  const [interfaceAnimations, setInterfaceAnimations] = useState<string>(() => {
    return localStorage.getItem('interfaceAnimations') || 'enabled';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--scrollbar-thumb', scrollbarColor);
    localStorage.setItem('scrollbarColor', scrollbarColor);
  }, [scrollbarColor]);

  useEffect(() => {
    localStorage.setItem('performancePreset', performancePreset);
  }, [performancePreset]);

  useEffect(() => {
    localStorage.setItem('framerateLimit', framerateLimit);
  }, [framerateLimit]);

  useEffect(() => {
    localStorage.setItem('renderScale', renderScale);
  }, [renderScale]);

  useEffect(() => {
    localStorage.setItem('interfaceAnimations', interfaceAnimations);
  }, [interfaceAnimations]);
  const [activeTab, setActiveTab] = useState('sources');
  const [canvasResolution, setCanvasResolution] = useState<string>(() => {
    return localStorage.getItem('canvasResolution') || '1080';
  });

  useEffect(() => {
    localStorage.setItem('canvasResolution', canvasResolution);
  }, [canvasResolution]);

  const [isAutoHideEnabled, setAutoHideEnabled] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    sourceId: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    sourceId: ''
  });
  const [isAddingScene, setIsAddingScene] = useState(false);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [sourceToDelete, setSourceToDelete] = useState<string | null>(null);
  const [copiedSource, setCopiedSource] = useState<Source | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [isHotkeysEnabled, setHotkeysEnabled] = useState<boolean>(true);
  const [centerHotkey, setCenterHotkey] = useState<string>('shift+f');
  const [fullscreenHotkey, setFullscreenHotkey] = useState<string>('shift+s');
  const [lockHotkey, setLockHotkey] = useState<string>('shift+l');
  const [visibilityHotkey, setVisibilityHotkey] = useState<string>('shift+v');

  const [contextMenuTheme, setContextMenuTheme] = useState<'match' | Theme>(() => {
    const saved = localStorage.getItem('contextMenuTheme');
    return (saved as 'match' | Theme) || 'match';
  });

  const [sceneHotkeys, setSceneHotkeys] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('sceneHotkeys');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('contextMenuTheme', contextMenuTheme);
  }, [contextMenuTheme]);

  useEffect(() => {
    localStorage.setItem('sceneHotkeys', JSON.stringify(sceneHotkeys));
  }, [sceneHotkeys]);

  const handleSetSceneHotkey = (sceneId: string, hotkey: string) => {
    setSceneHotkeys(prev => ({
      ...prev,
      [sceneId]: hotkey
    }));
    logAction(`Bound hotkey "${hotkey}" to scene ID "${sceneId}"`);
  };


  const [sceneTransition, setSceneTransition] = useState<SceneTransition>(() => {
    try {
      const saved = localStorage.getItem('sceneTransition');
      return saved ? JSON.parse(saved) : { type: 'move', speed: 5000, style: 'ease-in-out' };
    } catch {
      return { type: 'move', speed: 5000, style: 'ease-in-out' };
    }
  });

  useEffect(() => {
    localStorage.setItem('sceneTransition', JSON.stringify(sceneTransition));
  }, [sceneTransition]);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentPlayingTransition, setCurrentPlayingTransition] = useState<SceneTransition | null>(null);
  const stingerVideoRef = useRef<HTMLVideoElement>(null);
  const transitionTimer1Ref = useRef<any>(null);
  const transitionTimer2Ref = useRef<any>(null);
  const stingerCleanupRef = useRef<(() => void) | null>(null);

  const [isPoppedOut, setIsPoppedOut] = useState<boolean>(true);
  const [panelWidth, setPanelWidth] = useState<number>(400);
  const [isHoveredOverLeft, setIsHoveredOverLeft] = useState<boolean>(false);
  const [isMobileMode, setMobileMode] = useState<boolean>(() => {
    return localStorage.getItem('isMobileMode') === 'true';
  });

  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);
  const [previewScalingMode, setPreviewScalingMode] = useState<'fit' | '100' | '75' | '50' | '25'>('fit');
  
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const prevWindowSize = useRef({ width: window.innerWidth, height: window.innerHeight });
  
  const getResolutionDimensions = (res: string) => {
    switch (res) {
      case '240': return { width: 426, height: 240 };
      case '480': return { width: 854, height: 480 };
      case '720': return { width: 1280, height: 720 };
      case '1080': return { width: 1920, height: 1080 };
      case '2k': return { width: 2560, height: 1440 };
      case '4k': return { width: 3840, height: 2160 };
      default: return { width: 1920, height: 1080 };
    }
  };

  const isDashboardOccupyingSpace = isUIVisible && !isPoppedOut && (!isAutoHideEnabled || isHoveredOverLeft);
  const remainingWidth = isDashboardOccupyingSpace ? windowSize.width - panelWidth : windowSize.width;

  const { width: canvasWidth, height: canvasHeight } = getResolutionDimensions(canvasResolution);
  const margin = 45;
  const maxW = Math.max(200, remainingWidth - margin);
  const maxH = Math.max(200, windowSize.height - margin);
  const canvasScaleFit = Math.min(maxW / canvasWidth, maxH / canvasHeight);

  let canvasScale = canvasScaleFit;
  if (previewScalingMode === '100') canvasScale = 1.0;
  else if (previewScalingMode === '75') canvasScale = 0.75;
  else if (previewScalingMode === '50') canvasScale = 0.5;
  else if (previewScalingMode === '25') canvasScale = 0.25;

  const canvasLeft = isDashboardOccupyingSpace ? panelWidth + remainingWidth / 2 : windowSize.width / 2;
  const canvasTop = windowSize.height / 2;

  const activeScene = scenes.find(scene => scene.id === activeSceneId);
  const selectedSource = activeScene?.sources.find(s => s.id === selectedSourceId);
  const filteringSource = activeScene?.sources.find(s => s.id === filteringSourceId);
  const editingScene = scenes.find(s => s.id === editingSceneId);

  useEffect(() => {
    if (filteringSourceId && activeTab !== 'filters') {
      // Don't auto-switch, just make sure it's available.
    } else if (!filteringSourceId && activeTab === 'filters') {
      setActiveTab('sources');
    }
  }, [filteringSourceId, activeTab]);

  useEffect(() => {
    if (!selectedSourceId && activeTab === 'settings') {
        setActiveTab('sources');
    }
  }, [selectedSourceId, activeTab]);


  const logAction = useCallback((message: string) => {
    setActionLog(prevLog => [
        { timestamp: Date.now(), message },
        ...prevLog.slice(0, 199) // Keep last 200 actions
    ]);
    
    try {
      const saved = localStorage.getItem('creative_canvas_feature_usages');
      const featureCounters = saved ? JSON.parse(saved) : {};
      const msg = message.toLowerCase();
      let key = 'Source Customization';
      
      if (msg.includes('scene') || msg.includes('layout') || msg.includes('transition')) {
        key = 'Scene Management & Transitions';
      } else if (msg.includes('position') || msg.includes('center') || msg.includes('fullscreen') || msg.includes('interaction')) {
        key = 'Source Positioning & Canvas Layout';
      } else if (msg.includes('copy') || msg.includes('paste')) {
        key = 'Clipboard Operations (Copy/Paste)';
      } else if (msg.includes('filter') || msg.includes('chroma') || msg.includes('colorkey')) {
        key = 'Applying Chroma/Color Filters';
      } else if (msg.includes('export') || msg.includes('import') || msg.includes('backup')) {
        key = 'Workspace Exports/Imports';
      } else if (msg.includes('theme') || msg.includes('hotkey') || msg.includes('mobile') || msg.includes('grid')) {
        key = 'Interface & Theme Configurations';
      }
      
      featureCounters[key] = (featureCounters[key] || 0) + 1;
      localStorage.setItem('creative_canvas_feature_usages', JSON.stringify(featureCounters));
    } catch {
      // Ignore
    }
  }, []);

  const clearActionLog = () => {
    setActionLog([]);
    logAction("Log cleared.");
  }


  const setScenesWithHistory = useCallback((newScenes: Scene[] | ((prevScenes: Scene[]) => Scene[]), actionMessage?: string) => {
    setScenes(prevScenes => {
      const resolvedScenes = typeof newScenes === 'function' ? newScenes(prevScenes) : newScenes;
      const targetCompare = history[historyIndex] || prevScenes;
      if (JSON.stringify(resolvedScenes) === JSON.stringify(targetCompare)) return prevScenes;

      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(resolvedScenes);
      // Update history in state safely
      setTimeout(() => {
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        if (actionMessage) logAction(actionMessage);
      }, 0);

      return resolvedScenes;
    });
  }, [history, historyIndex, logAction]);

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setScenes(history[newIndex]);
      logAction("Undo action performed.");
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setScenes(history[newIndex]);
      logAction("Redo action performed.");
    }
  };
  
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const updateSource = useCallback((sourceId: string, updatedSource: Partial<Source> | ((s: Source) => Partial<Source>)) => {
    let actionMessage = `Updated source ${sourceId}.`;
    
    const resolvedUpdate = typeof updatedSource === 'function' 
        ? updatedSource(scenes.find(s => s.id === activeSceneId)?.sources.find(src => src.id === sourceId)!)
        : updatedSource;

    if ('name' in resolvedUpdate) actionMessage = `Renamed source ${sourceId} to "${resolvedUpdate.name}".`;
    if ('visible' in resolvedUpdate) actionMessage = `${resolvedUpdate.visible ? 'Shown' : 'Hid'} source ${sourceId}.`;
    if ('locked' in resolvedUpdate) actionMessage = `${resolvedUpdate.locked ? 'Locked' : 'Unlocked'} source ${sourceId}.`;

    setScenesWithHistory(prevScenes =>
      prevScenes.map(scene =>
        scene.id === activeSceneId
          ? {
              ...scene,
              sources: scene.sources.map(source =>
                source.id === sourceId
                  ? { ...source, ...resolvedUpdate }
                  : source
              ),
            }
          : scene
      ),
      actionMessage
    );
  }, [activeSceneId, setScenesWithHistory, scenes]);

  const updateSourceStyle = useCallback((sourceId: string, updatedStyle: Partial<Source['style']>) => {
     setScenes(prevScenes =>
      prevScenes.map(scene =>
        scene.id === activeSceneId
          ? {
              ...scene,
              sources: scene.sources.map(source =>
                source.id === sourceId
                  ? { ...source, style: { ...source.style, ...updatedStyle } }
                  : source
              ),
            }
          : scene
      )
    );
  }, [activeSceneId]);
  
  const handleInteractionEnd = useCallback(() => {
    logAction("Finished canvas interaction (move/resize).");
    setScenesWithHistory(scenes);
  }, [scenes, setScenesWithHistory, logAction]);

  const addSource = async (type: SourceType) => {
    const activeSceneSources = scenes.find(s => s.id === activeSceneId)?.sources || [];
    let newSource: Source;
    let sourceTypeNameForLog: string = type;

    // Calculate bounding box: 50% of the canvas size and centered
    let targetWidth = canvasWidth * 0.5;
    let targetHeight = canvasHeight * 0.5;
    let targetX = (canvasWidth - targetWidth) / 2;
    let targetY = (canvasHeight - targetHeight) / 2;

    if (type === 'paint' || type === 'visualizer') {
      targetWidth = canvasWidth;
      targetHeight = canvasHeight;
      targetX = 0;
      targetY = 0;
    }

    const fitToBoundingBox = (origW: number, origH: number, maxW: number, maxH: number) => {
      const ratio = origW / origH;
      let fitW = maxW;
      let fitH = maxW / ratio;
      if (fitH > maxH) {
        fitH = maxH;
        fitW = maxH * ratio;
      }
      return { width: fitW, height: fitH };
    };

    if (type === 'iframe') {
        sourceTypeNameForLog = 'Web';
        const webUrl = '';
        newSource = {
            id: `source-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
            type: 'iframe',
            name: 'Web Source',
            visible: true,
            locked: false,
            content: webUrl,
            style: {
                ...defaultSourceStyle,
                x: targetX,
                y: targetY,
                width: targetWidth,
                height: targetHeight,
                zIndex: Math.max(0, ...activeSceneSources.map(src => src.style.zIndex)) + 1,
            }
        };
    } else if (type === 'youtube') {
        sourceTypeNameForLog = 'YouTube';
        const ytUrl = '';
        newSource = {
            id: `source-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
            type: 'youtube',
            name: 'YouTube Player',
            visible: true,
            locked: false,
            content: ytUrl,
            style: {
                ...defaultSourceStyle,
                x: targetX,
                y: targetY,
                width: targetWidth,
                height: targetHeight,
                zIndex: Math.max(0, ...activeSceneSources.map(src => src.style.zIndex)) + 1,
            }
        };
    } else if (type === 'twitch') {
        sourceTypeNameForLog = 'Twitch';
        newSource = {
            id: `source-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
            type: 'twitch',
            name: 'Twitch Player',
            visible: true,
            locked: false,
            content: { 
                channel: 'albiar', 
                parent: window.location.hostname || 'localhost',
                urlInput: 'https://www.twitch.tv/albiar',
                layout: 'video-with-chat',
                autoplay: true,
                muted: false,
                theme: 'dark'
            },
            style: {
                ...defaultSourceStyle,
                x: targetX,
                y: targetY,
                width: targetWidth,
                height: targetHeight,
                zIndex: Math.max(0, ...activeSceneSources.map(src => src.style.zIndex)) + 1,
            }
        };
    } else if (type === 'image') {
        const imageUrl = '';

        const getAspectForImage = (url: string): Promise<{ width: number; height: number }> => {
          return new Promise((resolve) => {
            if (!url) {
              resolve({ width: 400, height: 300 });
              return;
            }
            const img = new Image();
            img.src = url;
            img.onload = () => resolve({ width: img.naturalWidth || 400, height: img.naturalHeight || 300 });
            img.onerror = () => resolve({ width: 400, height: 300 });
          });
        };

        const dims = await getAspectForImage(imageUrl);
        const fitDims = fitToBoundingBox(dims.width, dims.height, targetWidth, targetHeight);
        targetWidth = fitDims.width;
        targetHeight = fitDims.height;
        targetX = (canvasWidth - targetWidth) / 2;
        targetY = (canvasHeight - targetHeight) / 2;

        newSource = {
          id: `source-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
          type: 'image',
          name: 'Image Source',
          visible: true,
          locked: false,
          content: imageUrl,
          style: {
            ...defaultSourceStyle,
            x: targetX,
            y: targetY,
            width: targetWidth,
            height: targetHeight,
            zIndex: Math.max(0, ...activeSceneSources.map(src => src.style.zIndex)) + 1,
            colorKey: { enabled: true, color: '#000000', sensitivity: 20 }
          }
        };
    } else if (type === 'video') {
        const videoUrl = 'https://i.imgur.com/Vh2UVFw.mp4';

        const getAspectForVideo = (url: string): Promise<{ width: number; height: number }> => {
          return new Promise((resolve) => {
            if (!url) {
              resolve({ width: 640, height: 360 });
              return;
            }
            const video = document.createElement('video');
            video.src = url;
            video.onloadedmetadata = () => resolve({ width: video.videoWidth || 640, height: video.videoHeight || 360 });
            video.onerror = () => resolve({ width: 640, height: 360 });
          });
        };

        const dims = await getAspectForVideo(videoUrl);
        const fitDims = fitToBoundingBox(dims.width, dims.height, targetWidth, targetHeight);
        targetWidth = fitDims.width;
        targetHeight = fitDims.height;
        targetX = (canvasWidth - targetWidth) / 2;
        targetY = (canvasHeight - targetHeight) / 2;

        newSource = {
          id: `source-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
          type: 'video',
          name: 'Video Source',
          visible: true,
          locked: false,
          content: videoUrl,
          style: {
            ...defaultSourceStyle,
            x: targetX,
            y: targetY,
            width: targetWidth,
            height: targetHeight,
            zIndex: Math.max(0, ...activeSceneSources.map(src => src.style.zIndex)) + 1,
            loop: true,
            playbackRate: 1,
            volume: 1,
            muted: true,
          }
        };
    } else {
        let content: Source['content'] = '';

        if (type === 'text') content = 'New Text';
        if (type === 'color') content = '#4a5568';
        if (type === 'gallery') content = [];
        if (type === 'paint') content = '';
        if (type === 'camera') content = '';
        if (type === 'capture') content = '';
        if (type === 'visualizer') content = 'visualizer';
        if (type === 'emoji') {
            content = '🚀';
        }
        if (type === 'code') {
            content = {
                html: '<canvas id="canvas"></canvas>',
                css: `body { margin: 0; background-color: transparent; overflow: hidden; }\ncanvas { display: block; }`,
                js: `// JS code here. Access canvas with: document.getElementById('canvas');`
            } as CodeContent;
        }

        const isVisualizer = type === 'visualizer';

        newSource = {
          id: `source-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
          type: type,
          name: type === 'emoji' ? 'Emoji' : isVisualizer ? 'Audio Visualizer' : `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          visible: true,
          locked: false,
          content: content,
          style: {
            ...defaultSourceStyle,
            x: targetX,
            y: targetY,
            width: targetWidth,
            height: targetHeight,
            zIndex: Math.max(0, ...activeSceneSources.map(src => src.style.zIndex)) + 1,
            ...(isVisualizer && {
              visualizerStyle: 'bars',
              visualizerColor: '#3b82f6',
              innerGlow: true,
              innerGlowColor: '#3b82f6',
              innerGlowBlur: 15,
              visualizerTransparent: true,
            }),
            ...(type === 'emoji' && {
              fontSize: 120,
              textAlign: 'center',
            })
          }
        };
    }
    
    setScenesWithHistory(prevScenes => prevScenes.map(scene =>
      scene.id === activeSceneId
      ? {...scene, sources: [...scene.sources, newSource]}
      : scene
    ), `Added new ${sourceTypeNameForLog} source.`);
    
    setSelectedSourceId(newSource.id);
    setActiveTab('settings');
  };
  
  const deleteSource = (sourceId: string) => {
    const sourceName = scenes.find(s => s.id === activeSceneId)?.sources.find(src => src.id === sourceId)?.name;
    setScenesWithHistory(prevScenes => prevScenes.map(scene =>
      scene.id === activeSceneId
      ? {...scene, sources: scene.sources.filter(s => s.id !== sourceId)}
      : scene
    ), `Deleted source: ${sourceName || sourceId}`);
    if(selectedSourceId === sourceId) {
      setSelectedSourceId(null);
    }
  };

  const reorderSources = (orderedSourceIds: string[]) => {
      setScenesWithHistory(prevScenes =>
        prevScenes.map(scene => {
          if (scene.id !== activeSceneId) return scene;
          
          const maxZIndex = scene.sources.length;
          const newSources = scene.sources.map(source => {
            const newIndex = orderedSourceIds.findIndex(id => id === source.id);
            const newZIndex = maxZIndex - newIndex;
            return {
              ...source,
              style: {
                ...source.style,
                zIndex: newZIndex,
              }
            };
          });

          return { ...scene, sources: newSources };
        }),
        "Reordered sources."
      );
    };

    const updateSourceLayer = (sourceId: string, direction: 'up' | 'down') => {
        setScenesWithHistory(prevScenes => {
            const newScenes = [...prevScenes];
            const sceneIndex = newScenes.findIndex(s => s.id === activeSceneId);
            if (sceneIndex === -1) return prevScenes;

            const scene = newScenes[sceneIndex];
            const sourcesSorted = [...scene.sources].sort((a, b) => a.style.zIndex - b.style.zIndex);
            const currentIndex = sourcesSorted.findIndex(s => s.id === sourceId);

            if (currentIndex === -1) return prevScenes;

            let otherIndex = -1;
            if (direction === 'up' && currentIndex < sourcesSorted.length - 1) {
                otherIndex = currentIndex + 1;
            } else if (direction === 'down' && currentIndex > 0) {
                otherIndex = currentIndex - 1;
            }

            if (otherIndex === -1) return prevScenes;
            
            const sourceToMove = sourcesSorted[currentIndex];
            const otherSource = sourcesSorted[otherIndex];

            const newSources = scene.sources.map(s => {
                if (s.id === sourceToMove.id) {
                    return { ...s, style: { ...s.style, zIndex: otherSource.style.zIndex } };
                }
                if (s.id === otherSource.id) {
                    return { ...s, style: { ...s.style, zIndex: sourceToMove.style.zIndex } };
                }
                return s;
            });

            newScenes[sceneIndex] = { ...scene, sources: newSources };
            return newScenes;
        }, `Moved source ${sourceId} ${direction}.`);
    };

  const toggleSourceVisibility = (sourceId: string) => {
    updateSource(sourceId, s => ({ visible: !s.visible }));
  };
  
  const toggleSourceLock = (sourceId: string) => {
    updateSource(sourceId, s => ({ locked: !s.locked }));
  };

  const centerSource = (sourceId: string) => {
    const source = scenes.flatMap(s => s.sources).find(s => s.id === sourceId);
    if (!source) return;
    const newX = canvasWidth / 2 - source.style.width / 2;
    const newY = canvasHeight / 2 - source.style.height / 2;
    updateSource(sourceId, s => ({ style: { ...s.style, x: newX, y: newY } }));
    logAction(`Centered source ${sourceId}.`);
  };

  const fullscreenSource = (sourceId: string) => {
    updateSource(sourceId, s => {
      const isCurrentlyFullscreen = 
        s.style.x === 0 &&
        s.style.y === 0 &&
        s.style.width === canvasWidth &&
        s.style.height === canvasHeight;

      if (isCurrentlyFullscreen) {
        logAction(`Restored source ${sourceId} from fullscreen.`);
        if (s.preFullscreenStyle) {
          const { x, y, width, height } = s.preFullscreenStyle;
          return { style: { ...s.style, x, y, width, height } };
        }
        return {}; 
      } else {
        logAction(`Made source ${sourceId} fullscreen.`);
        const preFullscreenStyle = { x: s.style.x, y: s.style.y, width: s.style.width, height: s.style.height };
        return {
          preFullscreenStyle,
          style: { ...s.style, x: 0, y: 0, width: canvasWidth, height: canvasHeight },
        };
      }
    });
  };
  
  const handleConfirmAddScene = (name: string, icon: string) => {
    const newSceneId = `scene-${Date.now()}`;
    const newScene: Scene = {
      id: newSceneId,
      name,
      icon,
      sources: [],
      backgroundColor: '#000000',
    };
    setScenesWithHistory([...scenes, newScene], `Added new scene: ${name}`);
    setActiveSceneId(newSceneId);
    setIsAddingScene(false);
  };
  
  const deleteScene = (sceneId: string) => {
    if (scenes.length <= 1) {
      alert("You cannot delete the last scene.");
      return;
    }
    const sceneName = scenes.find(s => s.id === sceneId)?.name;
    const newScenes = scenes.filter(s => s.id !== sceneId);
    setScenesWithHistory(newScenes, `Deleted scene: ${sceneName || sceneId}`);
    if (activeSceneId === sceneId) {
      handleSetActiveScene(newScenes[0].id);
    }
  };

  const updateScene = (sceneId: string, updates: Partial<Scene>) => {
    if (updates.backgroundColor) {
        logAction(`Changed background color for scene ${sceneId}.`);
    }
    if (updates.name || updates.icon) {
        logAction(`Updated scene: ${updates.name || scenes.find(s=>s.id === sceneId)?.name}`)
    }
    setScenesWithHistory(prevScenes => prevScenes.map(s => s.id === sceneId ? { ...s, ...updates } : s));
  };

  const handleDuplicateScene = (sceneId: string) => {
    const sceneToDuplicate = scenes.find(s => s.id === sceneId);
    if (!sceneToDuplicate) return;

    const newSceneId = `scene-${Date.now()}`;
    // Preserve the source IDs so React can reuse components across scene transitions (no unmounting/re-loading flash)
    const duplicatedSources: Source[] = sceneToDuplicate.sources.map(src => {
      return {
        ...src,
      };
    });

    const duplicatedScene: Scene = {
      ...sceneToDuplicate,
      id: newSceneId,
      name: `${sceneToDuplicate.name} (Copy)`,
      sources: duplicatedSources,
    };

    setScenesWithHistory([...scenes, duplicatedScene], `Duplicated scene: ${sceneToDuplicate.name}`);
    setActiveSceneId(newSceneId);
  };

  const handleCopySource = useCallback((sourceId: string) => {
    const src = scenes.find(s => s.id === activeSceneId)?.sources.find(x => x.id === sourceId);
    if (src) {
      setCopiedSource(src);
      logAction(`Copied source: ${src.name}`);
    }
  }, [activeSceneId, scenes, logAction]);

  const handlePasteSource = useCallback(() => {
    if (!copiedSource) return;
    
    const activeSc = scenes.find(s => s.id === activeSceneId);
    if (!activeSc) return;

    const idExists = activeSc.sources.some(s => s.id === copiedSource.id);
    const newId = idExists ? `source-${Date.now()}-${Math.floor(Math.random() * 1000000)}` : copiedSource.id;
    
    const pastedSource: Source = {
      ...copiedSource,
      id: newId,
      name: idExists ? `${copiedSource.name} (Copy)` : copiedSource.name,
      style: idExists ? {
        ...copiedSource.style,
        x: copiedSource.style.x + 30,
        y: copiedSource.style.y + 30,
        zIndex: Math.max(0, ...activeSc.sources.map(src => src.style.zIndex)) + 1,
      } : {
        ...copiedSource.style,
        zIndex: Math.max(0, ...activeSc.sources.map(src => src.style.zIndex)) + 1,
      }
    };

    setScenesWithHistory(prevScenes => prevScenes.map(sc => {
      if (sc.id === activeSceneId) {
        return {
          ...sc,
          sources: [...sc.sources, pastedSource]
        };
      }
      return sc;
    }), `Pasted source: ${pastedSource.name}`);

    setSelectedSourceId(newId);
  }, [copiedSource, activeSceneId, scenes, setScenesWithHistory, logAction, setSelectedSourceId]);
  
  const handleSetActiveScene = (sceneId: string) => {
    if (sceneId === activeSceneId) return;
    
    // Clear any previous transition timers or video handlers for instant responsiveness
    if (transitionTimer1Ref.current) {
      clearTimeout(transitionTimer1Ref.current);
      transitionTimer1Ref.current = null;
    }
    if (transitionTimer2Ref.current) {
      clearTimeout(transitionTimer2Ref.current);
      transitionTimer2Ref.current = null;
    }
    if (stingerCleanupRef.current) {
      try {
        stingerCleanupRef.current();
      } catch (e) {}
      stingerCleanupRef.current = null;
    }

    setIsTransitioning(false);
    setCurrentPlayingTransition(null);
    
    const targetScene = scenes.find(s => s.id === sceneId);
    if (!targetScene) return;

    // Use scene-specific override transition if available; fallback to global default style transition
    const activeTransition = targetScene.transition || sceneTransition;
    logAction(`Switched layout view to scene: ${targetScene.name || sceneId} using ${activeTransition.type || 'cut'} transition.`);
    
    const transitionDuration = activeTransition.speed ?? 500;
    setCurrentPlayingTransition(activeTransition);

    switch (activeTransition.type) {
        case 'fade':
            setIsTransitioning(true);
            transitionTimer1Ref.current = setTimeout(() => {
                setActiveSceneId(sceneId);
                transitionTimer2Ref.current = setTimeout(() => {
                    setIsTransitioning(false);
                    setCurrentPlayingTransition(null);
                }, 50);
            }, transitionDuration);
            break;
        case 'move':
            setIsTransitioning(true);
            setActiveSceneId(sceneId);
            transitionTimer1Ref.current = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentPlayingTransition(null);
            }, transitionDuration);
            break;
        case 'stinger':
            if (activeTransition.stingerFile && stingerVideoRef.current) {
                setIsTransitioning(true);
                const video = stingerVideoRef.current;

                video.playbackRate = activeTransition.stingerSpeed || 1.0;
                
                const startSec = activeTransition.stingerStart || 0;
                const stopSec = activeTransition.stingerStop;

                const onTimeUpdate = () => {
                    const durationToUse = stopSec ? (stopSec - startSec) : video.duration;
                    const midwayPt = startSec + (durationToUse / 2);

                    if (video.currentTime >= midwayPt) {
                        setActiveSceneId(sceneId);
                    }
                    if (stopSec && video.currentTime >= stopSec) {
                        video.pause();
                        onEnded();
                    }
                };

                const onEnded = () => {
                    setIsTransitioning(false);
                    setCurrentPlayingTransition(null);
                    video.removeEventListener('ended', onEnded);
                    video.removeEventListener('timeupdate', onTimeUpdate);
                    stingerCleanupRef.current = null;
                };

                const cleanup = () => {
                    video.pause();
                    video.removeEventListener('ended', onEnded);
                    video.removeEventListener('timeupdate', onTimeUpdate);
                };
                stingerCleanupRef.current = cleanup;

                video.addEventListener('timeupdate', onTimeUpdate);
                video.addEventListener('ended', onEnded);
                video.currentTime = startSec;
                video.play().catch(e => {
                    setActiveSceneId(sceneId);
                    setIsTransitioning(false);
                    setCurrentPlayingTransition(null);
                    if (stingerCleanupRef.current === cleanup) {
                        stingerCleanupRef.current = null;
                    }
                });
            } else {
                setActiveSceneId(sceneId);
                setCurrentPlayingTransition(null);
            }
            break;
        case 'cut':
        default:
            setActiveSceneId(sceneId);
            setCurrentPlayingTransition(null);
            break;
    }
  };

  const exportToFile = (content: object, fileName: string) => {
    const jsonString = JSON.stringify(content, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFromFile = (onFileRead: (content: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onFileRead(e.target?.result as string);
            };
            reader.readAsText(file);
        }
        document.body.removeChild(input);
    };
    input.click();
    // In case the user cancels the file dialog without picking a file,
    // we also remove the input after a short delay so it doesn't linger in DOM.
    setTimeout(() => {
      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
    }, 60000);
  };

  const exportSources = () => {
    const scene = scenes.find(s => s.id === activeSceneId);
    if (scene) {
        exportToFile(scene.sources, 'sources.json');
        logAction(`Exported sources for scene ${scene.name}.`);
    }
  };

  const importSources = () => {
    handleImportFromFile((content) => {
        try {
            const importedSources = JSON.parse(content) as Source[];
            if (!Array.isArray(importedSources)) throw new Error("Invalid format");
            
            setScenesWithHistory(prev => prev.map(scene => {
              if (scene.id === activeSceneId) {
                const existingIds = new Set(scene.sources.map(s => s.id));
                const processedSources = importedSources.map(src => {
                  const idCollision = existingIds.has(src.id);
                  const uniqueId = idCollision
                    ? `source-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
                    : src.id;
                  existingIds.add(uniqueId);
                  return {
                    ...src,
                    id: uniqueId,
                    name: idCollision ? `${src.name} (Copy)` : src.name
                  };
                });
                return {
                  ...scene,
                  sources: [...scene.sources, ...processedSources]
                };
              }
              return scene;
            }), `Imported ${importedSources.length} sources.`);
        } catch (e) {
            alert("Failed to import sources. Invalid file format.");
            logAction("Failed to import sources.");
        }
    });
  };

  const exportProject = () => {
      const projectData = {
          type: 'creative_canvas_project',
          scenes,
          sceneTransition,
          canvasResolution,
          theme,
          scrollbarColor,
          isMobileMode,
          framerateLimit,
          renderScale,
          interfaceAnimations,
          contextMenuTheme
      };
      exportToFile(projectData, 'project.json');
      logAction("Exported entire project with transition and canvas settings.");
  };

  const importProject = () => {
    setConfirmModal({
      isOpen: true,
      title: "Replace Entire Project",
      message: "This will replace your entire project. All current scenes will be overwritten. Proceed with file selection?",
      onConfirm: () => {
        setConfirmModal(null);
        handleImportFromFile((content) => {
            try {
                const parsed = JSON.parse(content);
                let importedScenes: Scene[] = [];
                if (Array.isArray(parsed)) {
                    importedScenes = parsed;
                } else if (parsed && parsed.type === 'creative_canvas_project') {
                    importedScenes = parsed.scenes;
                    if (parsed.sceneTransition) setSceneTransition(parsed.sceneTransition);
                    if (parsed.theme) setTheme(parsed.theme);
                    if (parsed.scrollbarColor) setScrollbarColor(parsed.scrollbarColor);
                    if (parsed.canvasResolution) setCanvasResolution(parsed.canvasResolution);
                    if (parsed.isMobileMode !== undefined) setMobileMode(parsed.isMobileMode);
                    if (parsed.framerateLimit) setFramerateLimit(parsed.framerateLimit);
                    if (parsed.renderScale) setRenderScale(parsed.renderScale);
                    if (parsed.interfaceAnimations) setInterfaceAnimations(parsed.interfaceAnimations);
                    if (parsed.contextMenuTheme) setContextMenuTheme(parsed.contextMenuTheme);
                } else if (parsed && (parsed.scenes || parsed.sources)) {
                    importedScenes = parsed.scenes || [];
                } else {
                    throw new Error("Invalid format");
                }
                
                if (!importedScenes || importedScenes.length === 0) throw new Error("No scenes found");
                setScenesWithHistory(importedScenes, "Imported project from file.");
                setActiveSceneId(importedScenes[0].id);
                setSelectedSourceId(null);
                logAction("Imported complete project including matching scene transitions and settings.");
            } catch (e) {
                alert("Failed to import project. Invalid file format.");
                logAction("Failed to import project.");
            }
        });
      }
    });
  };

  const exportCanvasSettings = () => {
    const settings = {
      type: 'canvas_settings_only',
      theme,
      scrollbarColor,
      canvasResolution,
      isMobileMode,
      centerHotkey,
      fullscreenHotkey,
      lockHotkey,
      visibilityHotkey,
      performancePreset,
      framerateLimit,
      renderScale,
      interfaceAnimations,
      contextMenuTheme,
      sceneHotkeys,
      sceneTransition
    };
    exportToFile(settings, 'canvas-settings.json');
    logAction("Exported Canvas individual settings and global transitions.");
  };

  const importCanvasSettings = () => {
    handleImportFromFile((content) => {
      try {
        const parsed = JSON.parse(content);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.scrollbarColor) setScrollbarColor(parsed.scrollbarColor);
        if (parsed.canvasResolution) setCanvasResolution(parsed.canvasResolution);
        if (parsed.isMobileMode !== undefined) setMobileMode(parsed.isMobileMode);
        if (parsed.centerHotkey) setCenterHotkey(parsed.centerHotkey);
        if (parsed.fullscreenHotkey) setFullscreenHotkey(parsed.fullscreenHotkey);
        if (parsed.lockHotkey) setLockHotkey(parsed.lockHotkey);
        if (parsed.visibilityHotkey) setVisibilityHotkey(parsed.visibilityHotkey);
        if (parsed.performancePreset) setPerformancePreset(parsed.performancePreset);
        if (parsed.framerateLimit) setFramerateLimit(parsed.framerateLimit);
        if (parsed.renderScale) setRenderScale(parsed.renderScale);
        if (parsed.interfaceAnimations) setInterfaceAnimations(parsed.interfaceAnimations);
        if (parsed.contextMenuTheme) setContextMenuTheme(parsed.contextMenuTheme);
        if (parsed.sceneHotkeys) setSceneHotkeys(parsed.sceneHotkeys);
        if (parsed.sceneTransition) setSceneTransition(parsed.sceneTransition);
        
        logAction("Imported Canvas individual settings and transitions successfully.");
        alert("Canvas Settings & Transitions Imported successfully!");
      } catch (e) {
        alert("Failed to import canvas settings. Invalid format.");
        logAction("Failed to import canvas settings.");
      }
    });
  };

  const exportMasterBackup = () => {
    const backup = {
      type: 'creative_canvas_master_backup',
      version: '1.0',
      scenes,
      activeSceneId,
      theme,
      scrollbarColor,
      canvasResolution,
      isMobileMode,
      centerHotkey,
      fullscreenHotkey,
      lockHotkey,
      visibilityHotkey,
      performancePreset,
      framerateLimit,
      renderScale,
      interfaceAnimations,
      contextMenuTheme,
      sceneHotkeys,
      sceneTransition
    };
    exportToFile(backup, 'creative-canvas-full-backup.json');
    logAction("Exported ENTIRE Creative Canvas master workspace, setup, and transitions.");
  };

  const importMasterBackup = () => {
    setConfirmModal({
      isOpen: true,
      title: "Restore Master Backup",
      message: "This will overwrite all active scenes, sources, layers, hotkeys, and performance parameters. Proceed with file selection?",
      onConfirm: () => {
        setConfirmModal(null);
        handleImportFromFile((content) => {
          try {
            const parsed = JSON.parse(content);
            if (parsed.type !== 'creative_canvas_master_backup') {
              throw new Error("Invalid backup signature");
            }
            if (Array.isArray(parsed.scenes)) {
              setScenesWithHistory(parsed.scenes, "Imported full master workspace.");
              if (parsed.activeSceneId) setActiveSceneId(parsed.activeSceneId);
            }
            if (parsed.theme) setTheme(parsed.theme);
            if (parsed.scrollbarColor) setScrollbarColor(parsed.scrollbarColor);
            if (parsed.canvasResolution) setCanvasResolution(parsed.canvasResolution);
            if (parsed.isMobileMode !== undefined) setMobileMode(parsed.isMobileMode);
            if (parsed.centerHotkey) setCenterHotkey(parsed.centerHotkey);
            if (parsed.fullscreenHotkey) setFullscreenHotkey(parsed.fullscreenHotkey);
            if (parsed.lockHotkey) setLockHotkey(parsed.lockHotkey);
            if (parsed.visibilityHotkey) setVisibilityHotkey(parsed.visibilityHotkey);
            if (parsed.performancePreset) setPerformancePreset(parsed.performancePreset);
            if (parsed.framerateLimit) setFramerateLimit(parsed.framerateLimit);
            if (parsed.renderScale) setRenderScale(parsed.renderScale);
            if (parsed.interfaceAnimations) setInterfaceAnimations(parsed.interfaceAnimations);
            if (parsed.contextMenuTheme) setContextMenuTheme(parsed.contextMenuTheme);
            if (parsed.sceneHotkeys) setSceneHotkeys(parsed.sceneHotkeys);
            if (parsed.sceneTransition) setSceneTransition(parsed.sceneTransition);

            logAction("Imported ENTIRE master Creative Canvas workspace setup and transitions.");
            alert("Creative Canvas Workspace Fully Restored!");
          } catch (e) {
            alert("Failed to restore master backup. Invalid or corrupt file format.");
            logAction("Failed to restore master backup.");
          }
        });
      }
    });
  };

  const updateSourceStyleWithHistory = (sourceId: string, style: Partial<Source['style']>) => {
    updateSource(sourceId, s => ({ style: {...s.style, ...style} }));
    logAction(`Updated style for source ${sourceId}.`);
  };

  const handleOpenEditSceneModal = (sceneId: string) => {
    setEditingSceneId(sceneId);
  };

  const handleCloseEditSceneModal = () => {
      setEditingSceneId(null);
  };

  const handleConfirmEditScene = (sceneId: string, name: string, icon: string) => {
      updateScene(sceneId, { name, icon });
      setEditingSceneId(null);
  };

  const handleSourceContextMenu = useCallback((e: React.MouseEvent, sourceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const menuWidth = 256;
    const menuHeight = 420;
    
    let x = e.clientX;
    let y = e.clientY;
    
    if (x + menuWidth > window.innerWidth) {
      x = Math.max(10, window.innerWidth - menuWidth - 10);
    }
    if (y + menuHeight > window.innerHeight) {
      y = Math.max(10, window.innerHeight - menuHeight - 10);
    }
    
    setContextMenu({
      visible: true,
      x,
      y,
      sourceId,
    });
  }, []);

  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const menuWidth = 256;
    const menuHeight = 180;
    
    let x = e.clientX;
    let y = e.clientY;
    
    if (x + menuWidth > window.innerWidth) {
      x = Math.max(10, window.innerWidth - menuWidth - 10);
    }
    if (y + menuHeight > window.innerHeight) {
      y = Math.max(10, window.innerHeight - menuHeight - 10);
    }
    
    setContextMenu({
      visible: true,
      x,
      y,
      sourceId: '', // Empty means background context menu
    });
  }, []);

  useEffect(() => {
    const handleCloseMenu = () => {
      setContextMenu(prev => prev.visible ? { ...prev, visible: false } : prev);
    };
    window.addEventListener('click', handleCloseMenu);
    window.addEventListener('contextmenu', handleCloseMenu);
    return () => {
      window.removeEventListener('click', handleCloseMenu);
      window.removeEventListener('contextmenu', handleCloseMenu);
    };
  }, []);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    logAction("Application loaded.");
  }, [logAction]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.getAttribute('contenteditable') === 'true'
      )) {
        return;
      }

      if (e.key === 'Delete' && selectedSourceId) {
        setSourceToDelete(selectedSourceId);
        return;
      }

      if (!isHotkeysEnabled) return;

      if (e.shiftKey) {
        // Shift + 1 to 9
        const isDigit = /^Digit[1-9]$/.test(e.code) || /^[1-9]$/.test(e.key);
        if (isDigit) {
          const match = e.code.match(/\d/) || e.key.match(/\d/);
          if (match) {
            e.preventDefault();
            const sceneIndex = parseInt(match[0], 10) - 1;
            if (scenes[sceneIndex]) {
              handleSetActiveScene(scenes[sceneIndex].id);
            }
            return;
          }
        }
        // Shift + 0
        if (e.code === 'Digit0' || e.key === '0') {
          e.preventDefault();
          const newSceneId = `scene-${Date.now()}`;
          const newSceneName = `Scene ${scenes.length + 1}`;
          const newScene: Scene = {
            id: newSceneId,
            name: newSceneName,
            icon: '🎬',
            sources: [],
            backgroundColor: '#000000',
          };
          setScenesWithHistory([...scenes, newScene], `Added new scene: ${newSceneName}`);
          handleSetActiveScene(newSceneId);
          return;
        }
      }

      const keysPressed: string[] = [];
      if (e.ctrlKey) keysPressed.push('ctrl');
      if (e.metaKey) keysPressed.push('meta');
      if (e.altKey) keysPressed.push('alt');
      if (e.shiftKey) keysPressed.push('shift');
      
      const keyName = e.key.toLowerCase();
      if (keyName !== 'control' && keyName !== 'shift' && keyName !== 'alt' && keyName !== 'meta') {
        keysPressed.push(keyName);
      }
      
      const pressedString = keysPressed.join('+');
      const normalize = (val: string) => val.toLowerCase().replace(/\s+/g, '');

      // Check scene switch hotkeys first (can switch scene even with no selected source)
      let matchedSceneId: string | null = null;
      Object.entries(sceneHotkeys).forEach(([sceneId, hotkey]) => {
        if (hotkey && normalize(hotkey) === normalize(pressedString)) {
          matchedSceneId = sceneId;
        }
      });

      if (matchedSceneId) {
        e.preventDefault();
        handleSetActiveScene(matchedSceneId);
        return;
      }

      if (!selectedSourceId) return;

      // Handle Arrow key precision movement for selected source
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(keyName)) {
        e.preventDefault();
        const activeScene = scenes.find(s => s.id === activeSceneId);
        const selectedSource = activeScene?.sources.find(s => s.id === selectedSourceId);
        if (selectedSource && !selectedSource.locked) {
          const step = e.shiftKey ? 25 : 5;
          const currentX = selectedSource.style.x ?? 0;
          const currentY = selectedSource.style.y ?? 0;
          let newX = currentX;
          let newY = currentY;
          if (keyName === 'arrowleft') newX -= step;
          if (keyName === 'arrowright') newX += step;
          if (keyName === 'arrowup') newY -= step;
          if (keyName === 'arrowdown') newY += step;
          
          updateSourceStyle(selectedSourceId, { x: newX, y: newY });
        }
        return;
      }

      if (normalize(centerHotkey) === normalize(pressedString)) {
        e.preventDefault();
        centerSource(selectedSourceId);
      } else if (normalize(fullscreenHotkey) === normalize(pressedString)) {
        e.preventDefault();
        fullscreenSource(selectedSourceId);
      } else if (normalize(lockHotkey) === normalize(pressedString)) {
        e.preventDefault();
        toggleSourceLock(selectedSourceId);
      } else if (normalize(visibilityHotkey) === normalize(pressedString)) {
        e.preventDefault();
        toggleSourceVisibility(selectedSourceId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isHotkeysEnabled,
    selectedSourceId,
    centerHotkey,
    fullscreenHotkey,
    lockHotkey,
    visibilityHotkey,
    scenes,
    activeSceneId,
    updateSourceStyle,
    sceneHotkeys,
    handleSetActiveScene,
    setScenesWithHistory
  ]);

  return (
    <div className={`w-screen h-screen overflow-hidden text-white font-sans antialiased relative ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
      <Canvas
        scene={activeScene}
        isLocked={!isUIVisible}
        selectedSourceId={selectedSourceId}
        onSelectSource={(id) => {
            setSelectedSourceId(id);
            if (id) {
                logAction(`Selected source ${id}.`);
            }
        }}
        onUpdateSourceStyle={updateSourceStyle}
        onUpdateSource={updateSource}
        onInteractionEnd={handleInteractionEnd}
        isSnapToGridEnabled={isSnapToGridEnabled}
        canvasScale={canvasScale}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        onSourceContextMenu={handleSourceContextMenu}
        onCanvasContextMenu={handleCanvasContextMenu}
        isMobileMode={isMobileMode}
        left={canvasLeft}
        top={canvasTop}
        interfaceAnimations={interfaceAnimations}
        framerateLimit={framerateLimit}
        isTransitioning={isTransitioning}
        currentPlayingTransition={currentPlayingTransition}
      />
       <div 
         className={`fixed inset-0 z-[60000] pointer-events-none`}
         style={{
           transition: currentPlayingTransition?.type === 'fade' ? `opacity ${currentPlayingTransition?.speed ?? 500}ms ${currentPlayingTransition?.style ?? 'ease-in-out'}` : 'none',
           backgroundColor: currentPlayingTransition?.color || '#000000',
           opacity: isTransitioning && currentPlayingTransition?.type === 'fade' ? 1 : 0
         }}
       />
      {currentPlayingTransition?.type === 'stinger' && currentPlayingTransition.stingerFile && (
        <div 
          className={`fixed inset-0 z-[60000] pointer-events-none`}
          style={{
            transition: 'opacity 200ms ease',
            opacity: isTransitioning ? 1 : 0
          }}
        >
          <video ref={stingerVideoRef} src={currentPlayingTransition.stingerFile} className="w-full h-full object-cover" muted />
        </div>
      )}
      <UI
        isVisible={isUIVisible}
        onToggleVisibility={() => { setUIVisible(v => !v); setSelectedSourceId(null); }}
        isWelcomeVisible={isWelcomeVisible}
        onCloseWelcome={() => setWelcomeVisible(false)}
        scenes={scenes}
        activeScene={activeScene}
        onSetActiveScene={handleSetActiveScene}
        isAddingScene={isAddingScene}
        onAddScene={() => setIsAddingScene(true)}
        onConfirmAddScene={handleConfirmAddScene}
        onCancelAddScene={() => setIsAddingScene(false)}
        onDeleteScene={deleteScene}
        onUpdateScene={updateScene}
        onAddSource={addSource}
        onDeleteSource={deleteSource}
        onUpdateSourceLayer={updateSourceLayer}
        onImportSources={importSources}
        onExportSources={exportSources}
        onImportProject={importProject}
        onExportProject={exportProject}
        onCenterSource={centerSource}
        onFullscreenSource={fullscreenSource}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        selectedSource={selectedSource}
        onUpdateSource={updateSource}
        onSelectSource={setSelectedSourceId}
        isSnapToGridEnabled={isSnapToGridEnabled}
        onToggleSnapToGrid={() => setSnapToGridEnabled(v => !v)}
        theme={theme}
        onSetTheme={setTheme}
        filteringSource={filteringSource}
        onOpenFilterPanel={(id) => setFilteringSourceId(id)}
        onCloseFilterPanel={() => setFilteringSourceId(null)}
        onUpdateSourceStyle={updateSourceStyleWithHistory}
        onToggleSourceVisibility={toggleSourceVisibility}
        onToggleSourceLock={toggleSourceLock}
        onReorderSources={reorderSources}
        sceneTransition={sceneTransition}
        onSetSceneTransition={setSceneTransition}
        actionLog={actionLog}
        onClearActionLog={clearActionLog}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        editingScene={editingScene}
        onOpenEditSceneModal={handleOpenEditSceneModal}
        onDuplicateScene={handleDuplicateScene}
        onCloseEditSceneModal={handleCloseEditSceneModal}
        onConfirmEditScene={handleConfirmEditScene}
        sourceToDelete={sourceToDelete}
        onConfirmDelete={() => {
            if (sourceToDelete) deleteSource(sourceToDelete);
            setSourceToDelete(null);
        }}
        onCancelDelete={() => setSourceToDelete(null)}
        isHotkeysEnabled={isHotkeysEnabled}
        onToggleHotkeys={() => setHotkeysEnabled(val => !val)}
        centerHotkey={centerHotkey}
        onSetCenterHotkey={setCenterHotkey}
        fullscreenHotkey={fullscreenHotkey}
        onSetFullscreenHotkey={setFullscreenHotkey}
        lockHotkey={lockHotkey}
        onSetLockHotkey={setLockHotkey}
        visibilityHotkey={visibilityHotkey}
        onSetVisibilityHotkey={setVisibilityHotkey}
        canvasResolution={canvasResolution}
        onSetCanvasResolution={setCanvasResolution}
        isAutoHideEnabled={isAutoHideEnabled}
        onToggleAutoHide={() => setAutoHideEnabled(v => !v)}
        onSourceContextMenu={handleSourceContextMenu}
        isMobileMode={isMobileMode}
        onToggleMobileMode={() => {
            const newVal = !isMobileMode;
            setMobileMode(newVal);
            localStorage.setItem('isMobileMode', String(newVal));
            logAction(`Touch Mobile Mode toggled ${newVal ? 'ON' : 'OFF'}.`);
        }}
        isPoppedOut={isPoppedOut}
        onTogglePoppedOut={() => setIsPoppedOut(!isPoppedOut)}
        panelWidth={panelWidth}
        onPanelWidthChange={setPanelWidth}
        isHoveredOverLeft={isHoveredOverLeft}
        onHoveredOverLeftChange={setIsHoveredOverLeft}
        scrollbarColor={scrollbarColor}
        onSetScrollbarColor={setScrollbarColor}
        performancePreset={performancePreset}
        onSetPerformancePreset={setPerformancePreset}
        framerateLimit={framerateLimit}
        onSetFramerateLimit={setFramerateLimit}
        renderScale={renderScale}
        onSetRenderScale={setRenderScale}
        interfaceAnimations={interfaceAnimations}
        onSetInterfaceAnimations={setInterfaceAnimations}
        onExportCanvasSettings={exportCanvasSettings}
        onImportCanvasSettings={importCanvasSettings}
        onExportMasterBackup={exportMasterBackup}
        onImportMasterBackup={importMasterBackup}
        copiedSource={copiedSource}
        onCopySource={handleCopySource}
        onPasteSource={handlePasteSource}
        contextMenuTheme={contextMenuTheme}
        onSetContextMenuTheme={setContextMenuTheme}
        sceneHotkeys={sceneHotkeys}
        onSetSceneHotkey={handleSetSceneHotkey}
      />

      {contextMenu.visible && (() => {
        const contextMenuSource = activeScene?.sources.find(s => s.id === contextMenu.sourceId);
        const effectiveTheme = contextMenuTheme === 'match' ? theme : contextMenuTheme;
        const cmThemes = themes[effectiveTheme] || themes.dark;
        const hoverClass = cmThemes.itemHover || 'hover:bg-indigo-650 hover:text-white';
        const fallbackText = effectiveTheme === 'light' ? 'text-zinc-800' : 'text-zinc-100';

        return (
          <div 
            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
            className={`fixed z-[99999] w-64 rounded-lg shadow-2xl border p-1.5 flex flex-col font-sans select-none pointer-events-auto ${cmThemes.bg || 'bg-[#18181b]'} ${cmThemes.border || 'border-zinc-700/80'} ${cmThemes.text || 'text-zinc-100'}`}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            {contextMenuSource ? (
              <>
                <div className={`px-2 py-1 text-[11px] font-bold text-gray-400 border-b ${cmThemes.border || 'border-zinc-700/50'} mb-1 flex items-center gap-1.5 uppercase tracking-wider`}>
                  <span>⚙️ {contextMenuSource.name}</span>
                </div>

                {/* Quick Fit Toggles */}
                <button 
                  onClick={() => { centerSource(contextMenuSource.id); setContextMenu(c => ({...c, visible: false})); }}
                  className={`w-full text-left text-xs px-2 py-1 ${hoverClass} rounded transition-colors flex items-center gap-1.5 font-medium cursor-pointer`}
                >
                  🎯 Center Source
                </button>
                <button 
                  onClick={() => { fullscreenSource(contextMenuSource.id); setContextMenu(c => ({...c, visible: false})); }}
                  className={`w-full text-left text-xs px-2 py-1 ${hoverClass} rounded transition-colors flex items-center gap-1.5 font-medium cursor-pointer`}
                >
                  📺 Fit to Canvas
                </button>

                <hr className={`${cmThemes.border || 'border-zinc-700/50'} my-1 opacity-50`} />

                {/* Position Numeric Edits */}
                <div className="px-2 py-0.5 text-[10px] text-gray-400 uppercase tracking-widest font-semibold font-mono">Position</div>
                <div className="flex items-center gap-2 px-2 py-1">
                  <span className="text-[10px] text-gray-500 font-mono w-4">X:</span>
                  <input 
                    type="number"
                    value={Math.round(contextMenuSource.style.x)}
                    onChange={e => updateSourceStyle(contextMenuSource.id, { x: parseInt(e.target.value) || 0 })}
                    className={`w-14 text-center text-xs p-0.5 rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${cmThemes.inputBg || 'bg-zinc-800'} ${cmThemes.border || 'border-zinc-700'} ${cmThemes.text || 'text-white'}`}
                  />
                  <span className="text-[10px] text-gray-500 font-mono w-4">Y:</span>
                  <input 
                    type="number"
                    value={Math.round(contextMenuSource.style.y)}
                    onChange={e => updateSourceStyle(contextMenuSource.id, { y: parseInt(e.target.value) || 0 })}
                    className={`w-14 text-center text-xs p-0.5 rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${cmThemes.inputBg || 'bg-zinc-800'} ${cmThemes.border || 'border-zinc-700'} ${cmThemes.text || 'text-white'}`}
                  />
                </div>

                <div className="px-2 py-0.5 text-[10px] text-gray-400 uppercase tracking-widest font-semibold font-mono">Dimensions</div>
                <div className="flex items-center gap-2 px-2 py-1">
                  <span className="text-[10px] text-gray-500 font-mono w-4">W:</span>
                  <input 
                    type="number"
                    value={Math.round(contextMenuSource.style.width)}
                    onChange={e => updateSourceStyle(contextMenuSource.id, { width: Math.max(10, parseInt(e.target.value) || 10) })}
                    className={`w-14 text-center text-xs p-0.5 rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${cmThemes.inputBg || 'bg-zinc-800'} ${cmThemes.border || 'border-zinc-700'} ${cmThemes.text || 'text-white'}`}
                  />
                  <span className="text-[10px] text-gray-500 font-mono w-4">H:</span>
                  <input 
                    type="number"
                    value={Math.round(contextMenuSource.style.height)}
                    onChange={e => updateSourceStyle(contextMenuSource.id, { height: Math.max(10, parseInt(e.target.value) || 10) })}
                    className={`w-14 text-center text-xs p-0.5 rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${cmThemes.inputBg || 'bg-zinc-800'} ${cmThemes.border || 'border-zinc-700'} ${cmThemes.text || 'text-white'}`}
                  />
                </div>

                <hr className={`${cmThemes.border || 'border-zinc-700/50'} my-1 opacity-50`} />

                {/* Quick Action Toggles */}
                <button 
                  onClick={() => { toggleSourceLock(contextMenuSource.id); setContextMenu(c => ({...c, visible: false})); }}
                  className={`w-full text-left text-xs px-2 py-1 ${hoverClass} rounded transition-colors flex items-center gap-1.5 font-medium cursor-pointer`}
                >
                  {contextMenuSource.locked ? '🔓 Unlock Source' : '🔒 Lock Source'}
                </button>
                <button 
                  onClick={() => { toggleSourceVisibility(contextMenuSource.id); setContextMenu(c => ({...c, visible: false})); }}
                  className={`w-full text-left text-xs px-2 py-1 ${hoverClass} rounded transition-colors flex items-center gap-1.5 font-medium cursor-pointer`}
                >
                  {contextMenuSource.visible ? '👁️ Hide Source' : '👁️ Show Source'}
                </button>
                <button 
                  onClick={() => { 
                    const currentScaleX = contextMenuSource.style.scaleX === -1 ? 1 : -1;
                    updateSourceStyle(contextMenuSource.id, { scaleX: currentScaleX }); 
                    setContextMenu(c => ({...c, visible: false})); 
                  }}
                  className={`w-full text-left text-xs px-2 py-1 rounded transition-colors flex items-center justify-between font-medium cursor-pointer ${contextMenuSource.style.scaleX === -1 ? 'bg-indigo-650/30 text-indigo-400 font-semibold' : hoverClass}`}
                >
                  <span className="flex items-center gap-1.5">↔️ Flip Horizontally</span>
                  {contextMenuSource.style.scaleX === -1 && <span className="text-[9px] bg-indigo-500/20 px-1 py-0.5 rounded font-bold">Flipped</span>}
                </button>
                <button 
                  onClick={() => { 
                    const currentScaleY = contextMenuSource.style.scaleY === -1 ? 1 : -1;
                    updateSourceStyle(contextMenuSource.id, { scaleY: currentScaleY }); 
                    setContextMenu(c => ({...c, visible: false})); 
                  }}
                  className={`w-full text-left text-xs px-2 py-1 rounded transition-colors flex items-center justify-between font-medium cursor-pointer ${contextMenuSource.style.scaleY === -1 ? 'bg-indigo-650/30 text-indigo-400 font-semibold' : hoverClass}`}
                >
                  <span className="flex items-center gap-1.5">↕️ Flip Vertically</span>
                  {contextMenuSource.style.scaleY === -1 && <span className="text-[9px] bg-indigo-500/20 px-1 py-0.5 rounded font-bold">Flipped</span>}
                </button>
                <button 
                  onClick={() => { setFilteringSourceId(contextMenuSource.id); setContextMenu(c => ({...c, visible: false})); }}
                  className={`w-full text-left text-xs px-2 py-1 ${hoverClass} rounded transition-colors flex items-center gap-1.5 font-medium cursor-pointer`}
                >
                  🎨 Edit Filters
                </button>
                <button 
                  onClick={() => { 
                    setSelectedSourceId(contextMenuSource.id); 
                    setActiveTab('settings'); 
                    setContextMenu(c => ({...c, visible: false})); 
                  }}
                  className={`w-full text-left text-xs px-2 py-1 ${hoverClass} rounded transition-colors flex items-center gap-1.5 font-medium cursor-pointer`}
                >
                  ⚙️ Edit Source
                </button>

                <hr className={`${cmThemes.border || 'border-zinc-700/50'} my-1 opacity-50`} />

                {/* Delete Action */}
                <button 
                  onClick={() => { setSourceToDelete(contextMenuSource.id); setContextMenu(c => ({...c, visible: false})); }}
                  className={`w-full text-left text-xs px-2 py-1 text-red-500 ${hoverClass === 'hover:bg-gray-150' ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-red-600 hover:text-white'} rounded transition-colors flex items-center gap-1.5 font-semibold cursor-pointer`}
                >
                  🗑️ Delete Source
                </button>

                <hr className={`${cmThemes.border || 'border-zinc-700/50'} my-1 opacity-50`} />

                {/* Copy / Paste Actions */}
                <button 
                  onClick={() => { handleCopySource(contextMenuSource.id); setContextMenu(c => ({...c, visible: false})); }}
                  className={`w-full text-left text-xs px-2 py-1 ${hoverClass} rounded transition-colors flex items-center gap-1.5 font-medium cursor-pointer`}
                >
                  📋 Copy Source
                </button>
                {copiedSource && (
                  <button 
                    onClick={() => { handlePasteSource(); setContextMenu(c => ({...c, visible: false})); }}
                    className={`w-full text-left text-xs px-2 py-1 ${hoverClass} rounded transition-colors flex items-center gap-1.5 font-medium cursor-pointer`}
                    title={`Paste ${copiedSource.name} inside active scene`}
                  >
                    📋 Paste Source
                  </button>
                )}
                
                <hr className={`${cmThemes.border || 'border-zinc-700/50'} my-1.5 opacity-50`} />
              </>
            ) : (
              <>
                <div className={`px-2 py-1 text-[11px] font-bold text-indigo-400 border-b ${cmThemes.border || 'border-zinc-700/50'} mb-1 flex items-center gap-1.5 uppercase tracking-wider`}>
                  <span>📺 Stage Workspace</span>
                </div>
                <button 
                  onClick={() => { setUIVisible(prev => !prev); setContextMenu(c => ({...c, visible: false})); }}
                  className={`w-full text-left text-xs px-2 py-1 ${hoverClass} rounded transition-colors flex items-center gap-1.5 font-medium cursor-pointer`}
                >
                  {isUIVisible ? '🔒 Hide Custom Panels' : '🔓 Show Custom Panels'}
                </button>
                <button 
                  onClick={() => { setSnapToGridEnabled(prev => !prev); setContextMenu(c => ({...c, visible: false})); }}
                  className={`w-full text-left text-xs px-2 py-1 ${hoverClass} rounded transition-colors flex items-center gap-1.5 font-medium cursor-pointer`}
                >
                  {isSnapToGridEnabled ? '📴 Disable Grid Snapping' : '🔛 Enable Grid Snapping'}
                </button>
                
                <div className="px-2 py-1.5 mt-1.5 border-t border-zinc-750/30">
                  <div className="text-[9.5px] text-zinc-400 font-bold uppercase mb-1 flex items-center justify-between">
                    <span>🎨 Stage Color</span>
                    <span className="text-[9px] text-indigo-400 font-mono">
                      {scenes.find(s => s.id === activeSceneId)?.backgroundColor || '#000000'}
                    </span>
                  </div>
                  
                  {/* Preset swatches */}
                  <div className="grid grid-cols-4 gap-1.5 mb-1.5 pt-0.5">
                    {[
                      { hex: '#000000', title: 'Black' },
                      { hex: '#1e1e24', title: 'Charcoal' },
                      { hex: '#0a0e17', title: 'Deep Space' },
                      { hex: '#141a17', title: 'Forest' },
                      { hex: '#240a15', title: 'Wine Maroon' },
                      { hex: '#111322', title: 'Midnight Indigo' },
                      { hex: '#7f8c8d', title: 'Silver Gray' },
                      { hex: '#ffffff', title: 'White' }
                    ].map(col => (
                      <button
                        key={col.hex}
                        onClick={() => {
                          updateScene(activeSceneId, { backgroundColor: col.hex });
                        }}
                        title={col.title}
                        className={`w-5.5 h-5.5 rounded-full border border-zinc-700 bg-transparent hover:scale-110 active:scale-95 transition cursor-pointer`}
                        style={{ backgroundColor: col.hex }}
                      />
                    ))}
                  </div>

                  {/* Real-time custom color input picker */}
                  <div className="flex items-center gap-1">
                    <input 
                      type="color" 
                      value={scenes.find(s => s.id === activeSceneId)?.backgroundColor || '#000000'}
                      onChange={(e) => {
                        updateScene(activeSceneId, { backgroundColor: e.target.value });
                      }}
                      className="w-full h-6 rounded cursor-pointer border border-zinc-700 bg-zinc-900 p-0"
                      title="Custom color input"
                    />
                  </div>
                </div>

                {copiedSource && (
                  <>
                    <hr className={`${cmThemes.border || 'border-zinc-700/50'} my-1 opacity-50`} />
                    <button 
                      onClick={() => { handlePasteSource(); setContextMenu(c => ({...c, visible: false})); }}
                      className={`w-full text-left text-xs px-2 py-1 text-emerald-500 hover:text-white hover:bg-emerald-600 rounded transition-colors flex items-center gap-1.5 font-semibold cursor-pointer`}
                      title={`Paste copied source: ${copiedSource.name}`}
                    >
                      📋 Paste Source ({copiedSource.name})
                    </button>
                  </>
                )}
                <hr className={`${cmThemes.border || 'border-zinc-700/50'} my-1.5 opacity-50`} />
              </>
            )}

            {/* Scale Viewport - Flyout Submenu */}
            <hr className={`${cmThemes.border || 'border-zinc-700/50'} my-1 opacity-50`} />
            <div className="relative group/scale">
              <button 
                className={`w-full text-left text-xs px-2 py-1.5 ${hoverClass} rounded transition-colors flex items-center justify-between font-medium cursor-pointer`}
              >
                <span className="flex items-center gap-1.5">🔍 Preview Scale</span>
                <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                  {previewScalingMode === 'fit' ? 'Fit' : `${previewScalingMode}%`}
                  <span>▶</span>
                </span>
              </button>

              {/* Flyout Submenu Card */}
              <div 
                className={`absolute left-full top-[-6px] ml-1 hidden group-hover/scale:flex flex-col w-48 rounded-lg shadow-2xl border p-1.5 ${cmThemes.bg || 'bg-[#18181b]'} ${cmThemes.border || 'border-zinc-700/80'} ${cmThemes.text || 'text-zinc-100'}`}
              >
                {[
                  { value: 'fit', label: '🔍 Scale to Fit (Window)' },
                  { value: '100', label: '🔍 100% Scale' },
                  { value: '75', label: '🔍 75% Scale' },
                  { value: '50', label: '🔍 50% Scale' },
                  { value: '25', label: '🔍 25% Scale' }
                ].map(opt => (
                  <button 
                    key={opt.value}
                    onClick={() => { setPreviewScalingMode(opt.value as any); setContextMenu(c => ({...c, visible: false})); }}
                    className={`w-full text-left text-[11px] px-2 py-1.5 ${hoverClass} rounded transition-colors flex items-center justify-between font-medium cursor-pointer`}
                  >
                    <span className="flex-1">{opt.label}</span>
                    {previewScalingMode === opt.value && <span className="text-[10px] text-indigo-400 font-bold font-mono">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
      
      {isWelcomeVisible && (
        <WelcomeOverlay 
          onClose={() => setWelcomeVisible(false)} 
          theme={theme} 
        />
      )}

      {confirmModal && confirmModal.isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/80 z-[190000] pointer-events-auto cursor-pointer" 
            onClick={() => setConfirmModal(null)} 
          />
          <div 
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 200000,
            }}
            className={`rounded-lg shadow-2xl max-w-sm w-full p-6 border pointer-events-auto text-left flex flex-col ${themes[theme]?.bg || 'bg-gray-800'} ${themes[theme]?.border || 'border-gray-700'} ${themes[theme]?.text || 'text-white'}`}
          >
            <div className="border-b border-gray-700/30 pb-2 mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
                ⚠️ {confirmModal.title}
              </h2>
            </div>
            
            <p className="text-xs md:text-sm leading-relaxed mb-6 font-medium">
              {confirmModal.message}
            </p>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setConfirmModal(null)} 
                className={`px-4 py-2 text-xs rounded font-bold cursor-pointer transition-all ${themes[theme]?.buttonSecondary || 'bg-gray-600 hover:bg-gray-500 text-white'}`}
              >
                No, Cancel
              </button>
              <button 
                onClick={() => {
                  confirmModal.onConfirm();
                }} 
                className="px-4 py-2 text-xs rounded font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-all active:scale-95"
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
