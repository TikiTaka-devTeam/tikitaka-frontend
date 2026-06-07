// src/features/lecture/api/lectureSocket.js
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function getTokenHeader() {
  const token = localStorage.getItem("tikitaka_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function createTempId(prefix = "socket") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeSocketStroke(payload) {
  const strokeData = payload.stroke ?? payload;

  const strokeId =
    payload.strokeId ??
    payload.stroke_id ??
    strokeData.strokeId ??
    strokeData.stroke_id ??
    strokeData.id ??
    createTempId("stroke");

  return {
    id: strokeId,
    strokeId,
    tool: strokeData.tool,
    points: strokeData.points ?? [],
    color: strokeData.color ?? "#000000",
    thickness: Number(strokeData.thickness ?? 2),
    content: strokeData.content ?? "",
    strokeOrder: Number(strokeData.strokeOrder ?? strokeData.stroke_order ?? 0),
    strokeSeq: payload.strokeSeq ?? payload.stroke_seq,
    scope: "shared",
  };
}

function normalizeSocketDelete(payload) {
  const strokeData = payload.stroke ?? {};

  const strokeId =
    payload.strokeId ??
    payload.stroke_id ??
    payload.id ??
    strokeData.strokeId ??
    strokeData.stroke_id ??
    strokeData.id;

  return {
    id: strokeId,
    strokeId,
    strokeSeq: payload.strokeSeq ?? payload.stroke_seq,
    scope: "shared",
  };
}

function normalizeSocketQuestion(payload) {
  const question = payload.question ?? payload;

  return {
    id:
      question.question_id ??
      question.questionId ??
      question.id ??
      createTempId("question"),

    documentId:
      question.document_id ??
      question.documentId ??
      payload.documentId ??
      payload.document_id,

    slideId:
      question.slide_id ??
      question.slideId ??
      payload.slideId ??
      payload.slide_id,

    pageNumber:
      question.page_number ??
      question.pageNumber ??
      payload.pageNumber ??
      payload.page_number,

    x: question.x_ratio ?? question.xRatio ?? question.x ?? 0,
    y: question.y_ratio ?? question.yRatio ?? question.y ?? 0,

    content: question.content ?? "",

    refinedContent:
      question.refined_content ??
      question.refinedContent ??
      "",

    likeCount:
      question.like_count ??
      question.likeCount ??
      0,

    status: question.status ?? "PENDING",

    isRefined:
      question.is_refined ??
      question.isRefined ??
      false,

    createdAt:
      question.created_at ??
      question.createdAt ??
      new Date().toISOString(),
  };
}

function ackStroke(client, { spaceId, slideId, strokeSeq }) {
  if (!client?.connected || strokeSeq == null) return;

  client.publish({
    destination: `/app/spaces/${spaceId}/slides/${slideId}/ack`,
    headers: getTokenHeader(),
    body: JSON.stringify({
      lastReceivedStrokeSeq: strokeSeq,
    }),
  });
}

export function createLectureSocket({
  spaceId,
  slideId,
  onSharedStroke,
  onSharedStrokeDelete,
  onQuestionCreated,
  onConnect,
  onError,
}) {
  const client = new Client({
    webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
    connectHeaders: getTokenHeader(),
    reconnectDelay: 3000,

    onConnect: () => {
      client.subscribe(
        `/topic/spaces/${spaceId}/slides/${slideId}/shared-strokes`,
        (message) => {
          const payload = JSON.parse(message.body);
          const type = payload.type;

          if (
            type === "SHARED_STROKE_DELETE" ||
            type === "SHARED_STROKE_DELETED"
          ) {
            const deletedStroke = normalizeSocketDelete(payload);
            onSharedStrokeDelete?.(deletedStroke, payload);

            ackStroke(client, {
              spaceId,
              slideId,
              strokeSeq: payload.strokeSeq ?? payload.stroke_seq,
            });

            return;
          }

          const stroke = normalizeSocketStroke(payload);
          onSharedStroke?.(stroke, payload);

          ackStroke(client, {
            spaceId,
            slideId,
            strokeSeq: payload.strokeSeq ?? payload.stroke_seq,
          });
        },
      );

      client.subscribe(
        `/topic/spaces/${spaceId}/slides/${slideId}/questions`,
        (message) => {
          const payload = JSON.parse(message.body);
          const question = normalizeSocketQuestion(payload);

          onQuestionCreated?.(question, payload);
        },
      );

      onConnect?.();
    },

    onStompError: (frame) => {
      onError?.(frame);
    },

    onWebSocketError: (error) => {
      onError?.(error);
    },
  });

  client.activate();

  return client;
}

export function sendSharedStroke(client, { spaceId, slideId, stroke }) {
  if (!client?.connected) return;

  const strokeId = stroke.strokeId ?? stroke.stroke_id ?? stroke.id;

  if (!strokeId) {
    return;
  }

  client.publish({
    destination: `/app/spaces/${spaceId}/slides/${slideId}/shared-strokes`,
    headers: getTokenHeader(),
    body: JSON.stringify({
      type: "SHARED_STROKE_CREATE",
      slideId,
      strokeId,
      stroke: {
        strokeId,
        tool: stroke.tool,
        points: stroke.points ?? [],
        color: stroke.color ?? "#000000",
        thickness: Number(stroke.thickness ?? 2),
        content: stroke.content ?? "",
        strokeOrder: Number(stroke.strokeOrder ?? 0),
      },
    }),
  });
}

export function sendSharedStrokeDelete(client, { spaceId, slideId, stroke }) {
  if (!client?.connected) return;

  const strokeId = stroke.strokeId ?? stroke.stroke_id ?? stroke.id;

  if (!strokeId) {
    return;
  }

  client.publish({
    destination: `/app/spaces/${spaceId}/slides/${slideId}/shared-strokes`,
    headers: getTokenHeader(),
    body: JSON.stringify({
      type: "SHARED_STROKE_DELETE",
      slideId,
      strokeId,
      stroke: {
        strokeId,
      },
    }),
  });
}

export function sendQuestionCreated(client, { spaceId, slideId, question }) {
  if (!client?.connected) return;

  client.publish({
    destination: `/app/spaces/${spaceId}/slides/${slideId}/questions`,
    headers: getTokenHeader(),
    body: JSON.stringify({
      type: "QUESTION_CREATED",
      slideId,
      question,
    }),
  });
}

export function requestStrokeResync(
  client,
  { spaceId, slideId, lastReceivedStrokeSeq = 0 },
) {
  if (!client?.connected) return;

  client.publish({
    destination: `/app/spaces/${spaceId}/slides/${slideId}/resync`,
    headers: getTokenHeader(),
    body: JSON.stringify({
      lastReceivedStrokeSeq,
    }),
  });
}