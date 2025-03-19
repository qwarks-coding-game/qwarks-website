"use client";

import React, { useRef, useEffect } from "react";

// @ts-ignore
export default function VisualizerCanvas({ match, ...props }) {
  const canvasRef = useRef(null);
  const lastTickRef = useRef(performance.now());
  // Consolidated state stored in a ref:
  const canvasState = useRef({
    keysDown: {},
    cameraOffset: [0, 0],
    cameraZoom: 1,
    roundNum: 0,
    energySources: {},
    rounds: [],
    teams: [],
    matchLoaded: false,
    autorun: false,
  });

  // Initialize match data if available:
  useEffect(() => {
    if (!match || !match.rounds || !match.rounds[0]) return;
    // Directly store match data in canvasState current:
    canvasState.current.energySources = match.rounds[0].energySources || {};
    canvasState.current.rounds = match.rounds;
    canvasState.current.teams = match.teams || [];
    canvasState.current.roundNum = 0;
    canvasState.current.matchLoaded = true;
    canvasState.current.autorun = false;
  }, [match]);

  const getFontForText = (text, overrideZoom = 0) => {
    const zoom = overrideZoom > 0 ? overrideZoom : canvasState.current.cameraZoom;
    if (zoom === 1) {
      if (text.length < 3) {
        return "32px Arial";
      } else if (text.length < 5) {
        return "16px Arial";
      }
      return "8px Arial";
    } else if (zoom === 2) {
      if (text.length < 3) {
        return "16px Arial";
      } else if (text.length < 5) {
        return "8px Arial";
      }
      return "4px Arial";
    } else if (zoom === 3) {
      if (text.length < 3) {
        return "8px Arial";
      } else if (text.length < 5) {
        return "4px Arial";
      }
      return "2px Arial";
    } else {
      return "2px Arial";
    }
  };

  const numToText = (num) => {
    num = Math.round(num * 100) / 100;
    if (num > 1e24) {
      return `${(num / 1e24).toFixed(2)}e+24`;
    } else if (num > 1e21) {
      return `${(num / 1e21).toFixed(2)}e+21`;
    } else if (num > 1e18) {
      return `${(num / 1e18).toFixed(2)}e+18`;
    } else if (num > 1e15) {
      return `${(num / 1e15).toFixed(2)}e+15`;
    } else if (num > 1e12) {
      return `${(num / 1e12).toFixed(2)}T`;
    } else if (num > 1e9) {
      return `${(num / 1e9).toFixed(2)}B`;
    } else if (num > 1e6) {
      return `${(num / 1e6).toFixed(2)}M`;
    } else if (num > 1e3) {
      return `${(num / 1e3).toFixed(2)}K`;
    }
    return num.toString();
  };

  /**
   * @typedef {Object} DrawProps
   * @property {CanvasRenderingContext2D} ctx
   * @property {number} frameCount
   */
  /**
   * Draw function for rendering on the canvas.
   * @param {DrawProps} props
   */
  const draw = ({ ctx, frameCount }) => {
    const { cameraZoom, cameraOffset, energySources, matchLoaded, roundNum } = canvasState.current;
    const ZOOM_DIVISOR = Math.pow(2, cameraZoom - 1);
    const DRAW_SIZE = Math.floor(50 / ZOOM_DIVISOR);

    // Clear the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    var delta = (performance.now() - lastTickRef.current) / 1000;
    lastTickRef.current = performance.now();

    if (!matchLoaded) return;
    
    // Update camera offset based on pressed keys (stored in canvasState.current.keysDown)
    if (canvasState.current.keysDown["ArrowLeft"]) {
      canvasState.current.cameraOffset = [
        canvasState.current.cameraOffset[0] - 500 * delta,
        canvasState.current.cameraOffset[1]
      ];
    }
    if (canvasState.current.keysDown["ArrowRight"]) {
      canvasState.current.cameraOffset = [
        canvasState.current.cameraOffset[0] + 500 * delta,
        canvasState.current.cameraOffset[1]
      ];
    }
    if (canvasState.current.keysDown["ArrowUp"]) {
      canvasState.current.cameraOffset = [
        canvasState.current.cameraOffset[0],
        canvasState.current.cameraOffset[1] - 500 * delta
      ];
    }
    if (canvasState.current.keysDown["ArrowDown"]) {
      canvasState.current.cameraOffset = [
        canvasState.current.cameraOffset[0],
        canvasState.current.cameraOffset[1] + 500 * delta
      ];
    }

    if (canvasState.current.autorun) {
      let nextRound = canvasState.current.roundNum + 1;
      if (nextRound < canvasState.current.rounds.length) {
        canvasState.current.roundNum = nextRound;
      }
    }

    // Draw energy sources using updated state:
    ctx.strokeStyle = "#FFFFFF";
    Object.entries(energySources).forEach(([loc, income]) => {
      var [x, y] = loc.split(",");
      var xPos = (x-0.5) * DRAW_SIZE - canvasState.current.cameraOffset[0];
      var yPos = (y-0.5) * DRAW_SIZE - canvasState.current.cameraOffset[1];
      ctx.lineWidth = Math.ceil(income / 5 / ZOOM_DIVISOR);
      ctx.strokeRect(xPos, yPos, DRAW_SIZE, DRAW_SIZE);
    });
    canvasState.current.rounds[canvasState.current.roundNum].qwarks.forEach((qwark) => {
      qwark.actions.forEach((action) => {
        ctx.strokeStyle = {
          "attack": "#ff0000",
          "boost": "#0000ff",
          "collect": "#00ff00",
          "sense": "#ffffff",
          "transfer": "#ff00ff",
          "spawn": "#00ffff",
        }[action[0]];
        ctx.lineWidth = Math.ceil(4/ZOOM_DIVISOR);
        ctx.beginPath();
        ctx.moveTo(qwark.x * DRAW_SIZE - canvasState.current.cameraOffset[0], qwark.y * DRAW_SIZE - canvasState.current.cameraOffset[1]);
        ctx.lineTo(action[1][0] * DRAW_SIZE - canvasState.current.cameraOffset[0], action[1][1] * DRAW_SIZE - canvasState.current.cameraOffset[1]);
        ctx.stroke();
      });
    });

    var stats = {};
  
    var hover = null;
    canvasState.current.rounds[canvasState.current.roundNum].qwarks.forEach((qwark) => {
      if (!Object.keys(stats).includes(qwark.teamid)) {
        stats[qwark.teamid] = {
          qwarks: 0,
          energy: 0,
          electrons: 0,
          energyLevel: 0
        }
      }
      var teamColor = (255, 255, 255);
      for (var team of canvasState.current.teams) {
        if (team[0] == qwark.teamid) {
          teamColor = team[1];
          break;
        }
      }
      
      // units themseslves
      ctx.fillStyle = `rgba(${team[1].join(",")}, 255)`;
      ctx.beginPath();
      ctx.arc(qwark.x * DRAW_SIZE - canvasState.current.cameraOffset[0], qwark.y * DRAW_SIZE - canvasState.current.cameraOffset[1], DRAW_SIZE / 2 - 2, 0, 2 * Math.PI);
      ctx.fill();

      // energy indicators
      ctx.globalAlpha = 1/4;
      var size = DRAW_SIZE + (Math.sqrt(qwark.energy) * 5 / ZOOM_DIVISOR)
      ctx.beginPath();
      ctx.arc(qwark.x * DRAW_SIZE - canvasState.current.cameraOffset[0], qwark.y * DRAW_SIZE - canvasState.current.cameraOffset[1], size / 2 - 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.globalAlpha = 1;

      // energy number
      ctx.fillStyle = "#000000";
      var text = numToText(qwark.energy);
      ctx.font = getFontForText(text);
      var renderSize = ctx.measureText(text);
      ctx.fillText(text, 
        qwark.x * DRAW_SIZE - renderSize.width / 2 - canvasState.current.cameraOffset[0],
        qwark.y * DRAW_SIZE + (renderSize.actualBoundingBoxAscent+renderSize.actualBoundingBoxDescent)/2 - canvasState.current.cameraOffset[1]
      );
      // TODO: check for hover
    });

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "16px Arial";
    ctx.fillText(`Round: ${roundNum}/${canvasState.current.rounds.length}`, 10, 20);
  };

  // Animation loop and rendering – now with minimal dependencies.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let frameCount = 0;
    let animationFrameId;

    // Handle initial canvas size
    const { width, height } = canvas.getBoundingClientRect();
    const { devicePixelRatio: ratio = 1 } = window;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.scale(ratio, ratio);

    canvas.textBaseline = "middle";
    canvas.textAlign = "center";

    const render = () => {
      frameCount++;
      draw({ ctx: context, frameCount });
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Keyboard controls for camera movement, zoom, and round progression.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (e) => {
      canvasState.current.keysDown[e.key] = true;
    };

    const handleKeyUp = (e) => {
      delete canvasState.current.keysDown[e.key];

      // Handle single-press keys here
      if (e.key.toLowerCase() === "z") {
        let newZoom = canvasState.current.cameraZoom + 1;
        canvasState.current.cameraZoom = newZoom > 4 ? 1 : newZoom;
      }
      if (e.key.toLowerCase() === "a") {
        canvasState.current.autorun = !canvasState.current.autorun;
      }
      if (e.key === " ") {
        let nextRound = canvasState.current.roundNum + 1;
        if (nextRound < canvasState.current.rounds.length) {
          canvasState.current.roundNum = nextRound;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return <canvas ref={canvasRef} {...props} />;
}
