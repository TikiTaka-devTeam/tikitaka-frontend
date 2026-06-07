// src/features/lecture/stores/useDrawingStore.js
import { create } from "zustand";

export const TOOLS = {
  PEN: "PEN",
  ERASER: "ERASER",
  HIGHLIGHTER: "HIGHLIGHTER",
  SHAPE: "SHAPE",
  LASSO: "LASSO",
  IMAGE: "IMAGE",
  KEYBOARD: "KEYBOARD",
  QUESTION: "Q_POINT",
  LIST: "Q_LIST",
  FIXER: "FIXER",
  PROFESSOR_NOTE: "FIXER",
};

export const THICKNESS_MIN = 1;
export const THICKNESS_MAX = 20;

function round(value) {
  return Math.round(value * 10000) / 10000;
}

function clampThickness(value) {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return 4;
  }

  return Math.min(THICKNESS_MAX, Math.max(THICKNESS_MIN, numberValue));
}

function finalizePoints(points) {
  if (!Array.isArray(points)) {
    return [];
  }

  return points
    .filter((point) => {
      return (
        point && typeof point.x === "number" && typeof point.y === "number"
      );
    })
    .map((point) => ({
      x: round(point.x),
      y: round(point.y),
    }));
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `stroke-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSavedStrokeId(stroke) {
  return stroke?.strokeId ?? stroke?.stroke_id ?? null;
}

function getStrokeKey(stroke) {
  return String(
    stroke?.strokeId ??
      stroke?.stroke_id ??
      stroke?.id ??
      `${stroke?.tool}-${stroke?.strokeOrder}`,
  );
}

function getTargetKey(target) {
  if (!target) return "";

  if (typeof target === "string") {
    return target;
  }

  return getStrokeKey(target);
}

function hasSavedStrokeId(stroke) {
  return Boolean(getSavedStrokeId(stroke));
}

function normalizeDeletedStroke(stroke) {
  const savedStrokeId = getSavedStrokeId(stroke);

  return {
    ...stroke,
    id: stroke?.id ?? savedStrokeId,
    strokeId: savedStrokeId,
    scope: stroke?.scope || "shared",
  };
}

function normalizeIncomingStroke(stroke) {
  if (!stroke) return null;

  const savedStrokeId =
    stroke.strokeId ?? stroke.stroke_id ?? stroke.id ?? null;
  const points = finalizePoints(stroke.points);

  if (
    stroke.tool !== TOOLS.PEN &&
    stroke.tool !== TOOLS.HIGHLIGHTER &&
    stroke.tool !== TOOLS.FIXER
  ) {
    return null;
  }

  if (points.length === 0) {
    return null;
  }

  return {
    ...stroke,
    id: stroke.id ?? savedStrokeId ?? createId(),
    strokeId: savedStrokeId,
    scope: stroke.scope || "shared",
    content: stroke.content ?? "",
    color: stroke.color ?? "#1c1c1e",
    thickness: clampThickness(stroke.thickness ?? 4),
    strokeOrder:
      typeof stroke.strokeOrder === "number"
        ? stroke.strokeOrder
        : Number(stroke.stroke_order ?? 0),
    strokeSeq: stroke.strokeSeq ?? stroke.stroke_seq,
    points,
  };
}

function distanceToSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  if (dx === 0 && dy === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * dx + (point.y - start.y) * dy) /
        (dx * dx + dy * dy),
    ),
  );

  const projection = {
    x: start.x + t * dx,
    y: start.y + t * dy,
  };

  return Math.hypot(point.x - projection.x, point.y - projection.y);
}

function isStrokeHitByErasePath(stroke, erasePath, tolerance) {
  if (
    !stroke ||
    !Array.isArray(stroke.points) ||
    stroke.points.length === 0 ||
    !Array.isArray(erasePath) ||
    erasePath.length === 0
  ) {
    return false;
  }

  if (erasePath.length === 1) {
    const erasePoint = erasePath[0];

    return stroke.points.some((strokePoint) => {
      return (
        Math.hypot(strokePoint.x - erasePoint.x, strokePoint.y - erasePoint.y) <
        tolerance
      );
    });
  }

  return stroke.points.some((strokePoint) => {
    for (let i = 0; i < erasePath.length - 1; i += 1) {
      const start = erasePath[i];
      const end = erasePath[i + 1];

      if (distanceToSegment(strokePoint, start, end) < tolerance) {
        return true;
      }
    }

    return false;
  });
}

const useDrawingStore = create((set, get) => ({
  tool: null,
  color: "#1c1c1e",

  thicknessByTool: {
    [TOOLS.PEN]: 4,
    [TOOLS.HIGHLIGHTER]: 12,
    [TOOLS.ERASER]: 16,
  },

  strokes: [],
  redoStack: [],
  pendingSave: [],
  pendingDelete: [],

  setTool: (tool) => {
    set((state) => ({
      tool: state.tool === tool ? null : tool,
    }));
  },

  setColor: (color) => {
    set({ color });
  },

  setThickness: (value) => {
    set((state) => {
      if (!state.tool) {
        return state;
      }

      return {
        thicknessByTool: {
          ...state.thicknessByTool,
          [state.tool]: clampThickness(value),
        },
      };
    });
  },

  loadStrokes: (strokes = []) => {
    const normalizedStrokes = Array.isArray(strokes)
      ? strokes.map((stroke) => {
          const savedStrokeId =
            stroke.strokeId ?? stroke.stroke_id ?? stroke.id ?? null;

          return {
            ...stroke,
            id: stroke.id ?? savedStrokeId ?? createId(),
            strokeId: savedStrokeId,
            scope: stroke.scope || "shared",
          };
        })
      : [];

    set({
      strokes: normalizedStrokes,
      redoStack: [],
      pendingSave: [],
      pendingDelete: [],
    });
  },

  upsertStrokeWithoutPending: (incomingStroke) => {
    const normalizedStroke = normalizeIncomingStroke(incomingStroke);

    if (!normalizedStroke) {
      return;
    }

    const incomingKey = getStrokeKey(normalizedStroke);

    set((state) => {
      const existingIndex = state.strokes.findIndex((stroke) => {
        return getStrokeKey(stroke) === incomingKey;
      });

      if (existingIndex < 0) {
        return {
          strokes: [...state.strokes, normalizedStroke],
        };
      }

      const nextStrokes = [...state.strokes];
      nextStrokes[existingIndex] = {
        ...nextStrokes[existingIndex],
        ...normalizedStroke,
      };

      return {
        strokes: nextStrokes,
      };
    });
  },

  addStroke: (strokeOrPoints) => {
    const state = get();
    const { tool, color, thicknessByTool } = state;

    let stroke = null;

    if (
      strokeOrPoints &&
      typeof strokeOrPoints === "object" &&
      Array.isArray(strokeOrPoints.points)
    ) {
      if (
        strokeOrPoints.tool !== TOOLS.PEN &&
        strokeOrPoints.tool !== TOOLS.HIGHLIGHTER
      ) {
        return;
      }

      const points = finalizePoints(strokeOrPoints.points);

      if (points.length === 0) {
        return;
      }

      const savedStrokeId =
        strokeOrPoints.strokeId ?? strokeOrPoints.stroke_id ?? null;

      stroke = {
        id: strokeOrPoints.id ?? savedStrokeId ?? createId(),
        strokeId: savedStrokeId,
        scope: strokeOrPoints.scope,
        tool: strokeOrPoints.tool,
        content: strokeOrPoints.content ?? "",
        color: strokeOrPoints.color ?? color,
        thickness: clampThickness(
          strokeOrPoints.thickness ?? thicknessByTool[strokeOrPoints.tool] ?? 4,
        ),
        strokeOrder:
          typeof strokeOrPoints.strokeOrder === "number"
            ? strokeOrPoints.strokeOrder
            : state.strokes.length,
        strokeSeq: strokeOrPoints.strokeSeq ?? strokeOrPoints.stroke_seq,
        points,
      };
    }

    if (Array.isArray(strokeOrPoints)) {
      if (tool !== TOOLS.PEN && tool !== TOOLS.HIGHLIGHTER) {
        return;
      }

      const points = finalizePoints(strokeOrPoints);

      if (points.length === 0) {
        return;
      }

      stroke = {
        id: createId(),
        strokeId: null,
        tool,
        content: "",
        color,
        thickness: clampThickness(thicknessByTool[tool] ?? 4),
        strokeOrder: state.strokes.length,
        points,
      };
    }

    if (!stroke) {
      return;
    }

    set((currentState) => ({
      strokes: [...currentState.strokes, stroke],
      redoStack: [],
      pendingSave: [...currentState.pendingSave, stroke],
    }));
  },

  removeStrokeById: (target) => {
    const targetKey = getTargetKey(target);

    if (!targetKey) return;

    set((state) => ({
      strokes: state.strokes.filter(
        (stroke) => getStrokeKey(stroke) !== targetKey,
      ),
      pendingSave: state.pendingSave.filter(
        (stroke) => getStrokeKey(stroke) !== targetKey,
      ),
      pendingDelete: state.pendingDelete.filter(
        (stroke) => getStrokeKey(stroke) !== targetKey,
      ),
      redoStack: state.redoStack.filter(
        (stroke) => getStrokeKey(stroke) !== targetKey,
      ),
    }));
  },

  removeStrokeWithoutPending: (target) => {
    const targetKey = getTargetKey(target);

    if (!targetKey) return;

    set((state) => ({
      strokes: state.strokes.filter(
        (stroke) => getStrokeKey(stroke) !== targetKey,
      ),
      pendingSave: state.pendingSave.filter(
        (stroke) => getStrokeKey(stroke) !== targetKey,
      ),
      redoStack: state.redoStack.filter(
        (stroke) => getStrokeKey(stroke) !== targetKey,
      ),
    }));
  },

  eraseAt: (point, tolerance = 0.06) => {
    get().erasePath([point], tolerance);
  },

  erasePath: (pathPoints, tolerance = 0.06) => {
    const erasePath = finalizePoints(pathPoints);

    if (erasePath.length === 0) {
      return;
    }

    const currentStrokes = get().strokes;

    const deletedStrokes = currentStrokes.filter((stroke) =>
      isStrokeHitByErasePath(stroke, erasePath, tolerance),
    );

    if (deletedStrokes.length === 0) {
      return;
    }

    const deletedKeys = new Set(deletedStrokes.map(getStrokeKey));

    const nextStrokes = currentStrokes.filter((stroke) => {
      return !deletedKeys.has(getStrokeKey(stroke));
    });

    const savedDeletedStrokes = deletedStrokes
      .filter(hasSavedStrokeId)
      .map(normalizeDeletedStroke);

    set((state) => ({
      strokes: nextStrokes,
      redoStack: [],
      pendingDelete: [...state.pendingDelete, ...savedDeletedStrokes],
      pendingSave: state.pendingSave.filter((stroke) => {
        return !deletedKeys.has(getStrokeKey(stroke));
      }),
    }));
  },

  undo: () => {
    set((state) => {
      if (state.strokes.length === 0) {
        return state;
      }

      const lastStroke = state.strokes[state.strokes.length - 1];

      return {
        strokes: state.strokes.slice(0, -1),
        redoStack: [...state.redoStack, lastStroke],
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.redoStack.length === 0) {
        return state;
      }

      const lastStroke = state.redoStack[state.redoStack.length - 1];

      return {
        redoStack: state.redoStack.slice(0, -1),
        strokes: [...state.strokes, lastStroke],
        pendingSave: [...state.pendingSave, lastStroke],
      };
    });
  },

  clearPending: () => {
    set({
      pendingSave: [],
    });
  },

  clearPendingDelete: () => {
    set({
      pendingDelete: [],
    });
  },
}));

export default useDrawingStore;
