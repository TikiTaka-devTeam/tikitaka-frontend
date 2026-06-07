// src/features/lecture/hooks/useCanvas.js
import { useEffect, useRef } from "react";
import useDrawingStore, { TOOLS } from "../stores/useDrawingStore.js";

const LIVE_STROKE_INTERVAL_MS = 50;

function createStrokeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `live-stroke-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function useCanvas(canvasRef, options = {}) {
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const parent = canvas.parentElement;
    if (!parent) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let W = 0;
    let H = 0;

    let drawing = null;
    let isPointerDown = false;
    let activeTool = null;
    let activePointerId = null;
    let lastErasePoint = null;
    let lastLiveStrokeSentAt = 0;

    function drawStroke(stroke) {
      if (
        !stroke ||
        !Array.isArray(stroke.points) ||
        stroke.points.length === 0
      ) {
        return;
      }

      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = stroke.color || "#1c1c1e";

      if (stroke.tool === TOOLS.HIGHLIGHTER) {
        ctx.globalAlpha = 0.32;
        ctx.lineWidth = (stroke.thickness || 4) * 4;
      } else {
        ctx.globalAlpha = 1;
        ctx.lineWidth = stroke.thickness || 4;
      }

      ctx.beginPath();

      const first = stroke.points[0];
      ctx.moveTo(first.x * W, first.y * H);

      if (stroke.points.length === 1) {
        ctx.lineTo(first.x * W + 0.01, first.y * H + 0.01);
      } else if (stroke.points.length === 2) {
        const second = stroke.points[1];
        ctx.lineTo(second.x * W, second.y * H);
      } else {
        for (let i = 1; i < stroke.points.length - 1; i += 1) {
          const current = stroke.points[i];
          const next = stroke.points[i + 1];

          const midX = ((current.x + next.x) / 2) * W;
          const midY = ((current.y + next.y) / 2) * H;

          ctx.quadraticCurveTo(current.x * W, current.y * H, midX, midY);
        }

        const last = stroke.points[stroke.points.length - 1];
        ctx.lineTo(last.x * W, last.y * H);
      }

      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    function redraw() {
      ctx.clearRect(0, 0, W, H);

      const { strokes } = useDrawingStore.getState();

      strokes.forEach(drawStroke);

      if (drawing) {
        drawStroke(drawing);
      }
    }

    function resizeCanvas() {
      const cssW = parent.offsetWidth;
      const cssH = parent.offsetHeight;

      if (cssW === 0 || cssH === 0) return;

      const dpr = window.devicePixelRatio || 1;

      W = cssW;
      H = cssH;

      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      redraw();
    }

    function getPoint(event) {
      const rect = canvas.getBoundingClientRect();

      return {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      };
    }

    function emitLiveStroke(phase, stroke, force = false) {
      if (!stroke) return;

      const callback = optionsRef.current?.onLiveStrokeChange;

      if (typeof callback !== "function") {
        return;
      }

      const now = Date.now();

      if (!force && now - lastLiveStrokeSentAt < LIVE_STROKE_INTERVAL_MS) {
        return;
      }

      lastLiveStrokeSentAt = now;

      callback({
        phase,
        stroke: {
          ...stroke,
          points: [...(stroke.points ?? [])],
        },
      });
    }

    function getEraserTolerance() {
      const { thicknessByTool } = useDrawingStore.getState();
      const eraserThickness = thicknessByTool?.[TOOLS.ERASER] ?? 16;

      return Math.max(0.06, eraserThickness / 180);
    }

    function buildErasePath(fromPoint, toPoint) {
      if (!fromPoint) {
        return [toPoint];
      }

      const dx = toPoint.x - fromPoint.x;
      const dy = toPoint.y - fromPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const step = 0.001;
      const count = Math.max(1, Math.ceil(distance / step));

      const path = [];

      for (let i = 0; i <= count; i += 1) {
        path.push({
          x: fromPoint.x + (dx * i) / count,
          y: fromPoint.y + (dy * i) / count,
        });
      }

      return path;
    }

    function eraseBetweenPoints(fromPoint, toPoint) {
      const state = useDrawingStore.getState();
      const tolerance = getEraserTolerance();
      const path = buildErasePath(fromPoint, toPoint);

      if (typeof state.erasePath === "function") {
        state.erasePath(path, tolerance);
        return;
      }

      path.forEach((point) => {
        state.eraseAt?.(point, tolerance);
      });
    }

    function resetPointerState() {
      drawing = null;
      isPointerDown = false;
      activeTool = null;
      activePointerId = null;
      lastErasePoint = null;
      lastLiveStrokeSentAt = 0;
    }

    function saveCurrentDrawing() {
      if (!drawing) return;

      const finishedStroke = {
        ...drawing,
        points: [...drawing.points],
      };

      emitLiveStroke("end", finishedStroke, true);

      useDrawingStore.getState().addStroke(finishedStroke);
      drawing = null;
    }

    function finishPointer(event) {
      if (!isPointerDown) return;

      event?.preventDefault?.();

      if (
        event &&
        canvas.releasePointerCapture &&
        event.pointerId !== undefined &&
        canvas.hasPointerCapture?.(event.pointerId)
      ) {
        try {
          canvas.releasePointerCapture(event.pointerId);
        } catch {
          // ignore
        }
      }

      saveCurrentDrawing();
      resetPointerState();
      redraw();
    }

    function handlePointerDown(event) {
      if (event.button !== undefined && event.button !== 0) return;

      if (isPointerDown) {
        saveCurrentDrawing();
        resetPointerState();
        redraw();
      }

      const state = useDrawingStore.getState();
      const { tool, color, thicknessByTool } = state;

      if (!tool) return;

      event.preventDefault();

      const point = getPoint(event);

      if (tool === TOOLS.QUESTION) {
        optionsRef.current?.onQuestionPoint?.(point);
        return;
      }

      if (tool === TOOLS.PROFESSOR_NOTE) {
        optionsRef.current?.onProfessorNotePoint?.(point);
        return;
      }

      isPointerDown = true;
      activeTool = tool;
      activePointerId = event.pointerId;

      if (canvas.setPointerCapture) {
        try {
          canvas.setPointerCapture(event.pointerId);
        } catch {
          // ignore
        }
      }

      if (activeTool === TOOLS.ERASER) {
        lastErasePoint = point;
        eraseBetweenPoints(null, point);
        redraw();
        return;
      }

      if (activeTool !== TOOLS.PEN && activeTool !== TOOLS.HIGHLIGHTER) {
        resetPointerState();
        return;
      }

      const liveStrokeId = createStrokeId();

      drawing = {
        id: liveStrokeId,
        strokeId: liveStrokeId,
        scope: "shared",
        tool: activeTool,
        color,
        thickness: thicknessByTool?.[activeTool] ?? 4,
        points: [point],
      };

      emitLiveStroke("start", drawing, true);
      redraw();
    }

    function handlePointerMove(event) {
      if (!isPointerDown) return;

      if (
        activePointerId !== null &&
        event.pointerId !== undefined &&
        event.pointerId !== activePointerId
      ) {
        return;
      }

      if (activeTool === TOOLS.ERASER) {
        event.preventDefault();

        const point = getPoint(event);
        eraseBetweenPoints(lastErasePoint, point);
        lastErasePoint = point;
        redraw();
        return;
      }

      if (event.buttons !== undefined && event.buttons !== 1) {
        finishPointer(event);
        return;
      }

      event.preventDefault();

      if (!drawing) return;

      const point = getPoint(event);
      drawing.points.push(point);

      emitLiveStroke("update", drawing);
      redraw();
    }

    function handlePointerUp(event) {
      finishPointer(event);
    }

    function handlePointerCancel(event) {
      finishPointer(event);
    }

    function handleMouseUp(event) {
      finishPointer(event);
    }

    function handleBlur() {
      if (!isPointerDown) return;

      saveCurrentDrawing();
      resetPointerState();
      redraw();
    }

    canvas.style.touchAction = "none";

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerCancel);
    canvas.addEventListener("pointerleave", handlePointerUp);

    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("blur", handleBlur);

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(parent);

    const unsubscribe = useDrawingStore.subscribe(redraw);

    resizeCanvas();

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerCancel);
      canvas.removeEventListener("pointerleave", handlePointerUp);

      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("blur", handleBlur);

      resizeObserver.disconnect();
      unsubscribe();
    };
  }, [canvasRef]);
}
