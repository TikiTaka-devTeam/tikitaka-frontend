// src/api/lectureApi.js
import { apiRequest } from "./client.js";

function normalizeStrokeTool(tool) {
  if (tool === "PROFESSOR_NOTE") return "FIXER";
  return tool;
}

function normalizeStrokePayload(stroke, index = 0) {
  return {
    tool: normalizeStrokeTool(stroke.tool),
    points: stroke.points ?? [],
    content: stroke.content ?? "",
    color: stroke.color ?? "#000000",
    thickness: Number(stroke.thickness ?? 2),
    strokeOrder: Number(stroke.strokeOrder ?? index),
  };
}

function normalizeQuestionPayload(question) {
  return {
    private_stroke_id:
      question.privateStrokeId ?? question.private_stroke_id ?? null,
    content: question.content ?? "",
    is_anonymous: question.isAnonymous ?? question.is_anonymous ?? false,
    x_ratio: Number(question.x ?? question.xRatio ?? question.x_ratio ?? 0),
    y_ratio: Number(question.y ?? question.yRatio ?? question.y_ratio ?? 0),
  };
}

export function normalizeStrokeResponse(stroke) {
  return {
    id: stroke.strokeId ?? stroke.stroke_id ?? stroke.id,
    strokeId: stroke.strokeId ?? stroke.stroke_id ?? stroke.id,
    tool: stroke.tool,
    points: stroke.points ?? [],
    content: stroke.content ?? "",
    color: stroke.color ?? "#000000",
    thickness: Number(stroke.thickness ?? 2),
    strokeOrder: Number(stroke.strokeOrder ?? stroke.stroke_order ?? 0),
    strokeSeq: stroke.strokeSeq ?? stroke.stroke_seq,
  };
}

export function normalizeQuestionResponse(question, fallback = {}) {
  return {
    id:
      question.question_id ??
      question.questionId ??
      question.id ??
      fallback.id,

    documentId: fallback.documentId,

    slideId:
      question.slide_id ??
      question.slideId ??
      fallback.slideId,

    pageNumber: fallback.pageNumber,

    x:
      question.x_ratio ??
      question.xRatio ??
      fallback.x ??
      0,

    y:
      question.y_ratio ??
      question.yRatio ??
      fallback.y ??
      0,

    content: question.content ?? fallback.content ?? "",

    refinedContent:
      question.refined_content ??
      question.refinedContent ??
      fallback.refinedContent ??
      "",

    likeCount:
      question.like_count ??
      question.likeCount ??
      fallback.likeCount ??
      0,

    status: question.status ?? fallback.status ?? "PENDING",

    isRefined:
      question.is_refined ??
      question.isRefined ??
      fallback.isRefined ??
      false,

    createdAt:
      question.created_at ??
      question.createdAt ??
      fallback.createdAt ??
      new Date().toISOString(),
  };
}

export function normalizeDocumentSummary(document) {
  return {
    document_id: document.document_id ?? document.documentId,
    title: document.title ?? "강의자료",
    thumbnail_url: document.thumbnail_url ?? document.thumbnailUrl ?? "",
    pdf_url: document.pdf_url ?? document.pdfUrl ?? "",
    uploaded_at: document.uploaded_at ?? document.uploadedAt ?? null,
  };
}

export function normalizeSlideResponse(slide, index = 0) {
  return {
    slide_id: slide.slide_id ?? slide.slideId ?? slide.id,
    page_number: slide.page_number ?? slide.pageNumber ?? index + 1,
    image_url: slide.image_url ?? slide.imageUrl ?? "",
    is_replaced: slide.is_replaced ?? slide.isReplaced ?? false,
    is_deleted: slide.is_deleted ?? slide.isDeleted ?? false,
    original_slide_id: slide.original_slide_id ?? slide.originalSlideId ?? null,
    watermark: slide.watermark ?? null,
    width:
      slide.width ??
      slide.slide_width ??
      slide.slideWidth ??
      slide.original_width ??
      slide.originalWidth ??
      1210,
    height:
      slide.height ??
      slide.slide_height ??
      slide.slideHeight ??
      slide.original_height ??
      slide.originalHeight ??
      720,
  };
}

export function fetchSpaceDocuments(spaceId) {
  return apiRequest(`/api/v1/spaces/${spaceId}/documents`);
}

export function fetchDocumentSlides(documentId) {
  return apiRequest(`/api/v1/documents/${documentId}/slides`);
}

export function uploadLectureDocument(spaceId, { title, file }) {
  const formData = new FormData();

  formData.append("title", title);
  formData.append("file", file);

  return apiRequest(`/api/v1/spaces/${spaceId}/documents`, {
    method: "POST",
    body: formData,
  });
}

export function fetchPrivateStrokes(slideId) {
  return apiRequest(`/api/v1/slides/${slideId}/private-strokes`);
}

export function fetchSharedStrokes(slideId) {
  return apiRequest(`/api/v1/slides/${slideId}/shared-strokes`);
}

export async function fetchSlideStrokes(slideId) {
  const [sharedResponse, privateResponse] = await Promise.all([
    fetchSharedStrokes(slideId),
    fetchPrivateStrokes(slideId),
  ]);

  const sharedStrokes =
    sharedResponse?.isVisible === false
      ? []
      : (sharedResponse?.strokes ?? []).map((stroke) => ({
          ...normalizeStrokeResponse(stroke),
          scope: "shared",
        }));

  const privateStrokes = (privateResponse?.strokes ?? []).map((stroke) => ({
    ...normalizeStrokeResponse(stroke),
    scope: "private",
  }));

  return [...sharedStrokes, ...privateStrokes].sort(
    (a, b) =>
      (a.strokeOrder ?? 0) - (b.strokeOrder ?? 0) ||
      (a.strokeSeq ?? 0) - (b.strokeSeq ?? 0),
  );
}

export function savePrivateStrokes(slideId, strokes) {
  return apiRequest(`/api/v1/slides/${slideId}/private-strokes`, {
    method: "POST",
    body: JSON.stringify({
      strokes: strokes.map(normalizeStrokePayload),
    }),
  });
}

export function saveSharedStrokes(slideId, strokes) {
  return apiRequest(`/api/v1/slides/${slideId}/shared-strokes`, {
    method: "POST",
    body: JSON.stringify({
      strokes: strokes.map(normalizeStrokePayload),
    }),
  });
}

export function saveSlideStrokes(slideId, strokes, mode = "student") {
  if (mode === "professor") {
    return saveSharedStrokes(slideId, strokes);
  }

  return savePrivateStrokes(slideId, strokes);
}

export function saveSlideStroke(slideId, stroke, mode = "student") {
  return saveSlideStrokes(slideId, [stroke], mode);
}

export function deletePrivateStroke(strokeId) {
  return apiRequest(`/api/v1/private-strokes/${strokeId}`, {
    method: "PATCH",
  });
}

export function deleteSharedStroke(strokeId) {
  return apiRequest(`/api/v1/shared-strokes/${strokeId}`, {
    method: "PATCH",
  });
}

export function deleteSlideStroke(stroke) {
  if (stroke.scope === "shared") {
    return deleteSharedStroke(stroke.strokeId ?? stroke.id);
  }

  return deletePrivateStroke(stroke.strokeId ?? stroke.id);
}

export function fetchSlideQuestions(slideId) {
  return apiRequest(`/api/v1/slides/${slideId}/questions`);
}

export function createQuestion(slideId, question) {
  return apiRequest(`/api/v1/slides/${slideId}/questions`, {
    method: "POST",
    body: JSON.stringify(normalizeQuestionPayload(question)),
  });
}

export function fetchQuestionOverlay(slideId) {
  return apiRequest(`/api/v1/slides/${slideId}/questions/overlay`);
}

export function fetchQuestionDetail(questionId) {
  return apiRequest(`/api/v1/questions/${questionId}`);
}

export function createAnswer(questionId, answer) {
  return apiRequest(`/api/v1/questions/${questionId}/answer`, {
    method: "POST",
    body: JSON.stringify(answer),
  });
}