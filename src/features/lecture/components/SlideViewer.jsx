// src/features/lecture/components/SlideViewer.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import useCanvas from "../hooks/useCanvas.js";
import QuestionBubble from "./QuestionBubble.jsx";
import ProfessorCheckBubble from "./ProfessorCheckBubble.jsx";

const DEFAULT_SLIDE_WIDTH = 1210;
const DEFAULT_SLIDE_HEIGHT = 720;

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
).replace(/\/$/, "");

function resolveImageUrl(url) {
  if (!url) return "";

  const value = String(url).trim();

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_BASE_URL}${value}`;
  }

  return `${API_BASE_URL}/${value}`;
}

function getSlideSize(slide) {
  const width =
    Number(slide?.width) ||
    Number(slide?.slide_width) ||
    Number(slide?.slideWidth) ||
    Number(slide?.original_width) ||
    Number(slide?.originalWidth) ||
    DEFAULT_SLIDE_WIDTH;

  const height =
    Number(slide?.height) ||
    Number(slide?.slide_height) ||
    Number(slide?.slideHeight) ||
    Number(slide?.original_height) ||
    Number(slide?.originalHeight) ||
    DEFAULT_SLIDE_HEIGHT;

  return {
    width: width > 0 ? width : DEFAULT_SLIDE_WIDTH,
    height: height > 0 ? height : DEFAULT_SLIDE_HEIGHT,
  };
}

function calculateContainSize(
  containerWidth,
  containerHeight,
  contentWidth,
  contentHeight,
) {
  if (
    containerWidth <= 0 ||
    containerHeight <= 0 ||
    contentWidth <= 0 ||
    contentHeight <= 0
  ) {
    return {
      width: 0,
      height: 0,
    };
  }

  const contentRatio = contentWidth / contentHeight;

  let frameWidth = containerWidth;
  let frameHeight = frameWidth / contentRatio;

  if (frameHeight > containerHeight) {
    frameHeight = containerHeight;
    frameWidth = frameHeight * contentRatio;
  }

  return {
    width: frameWidth,
    height: frameHeight,
  };
}

function SlideViewer({
  slide,
  imageUrl,
  onPrev,
  onNext,
  draftQuestion,
  questions = [],
  selectedQuestionId,
  draftProfessorNote,
  professorNotes = [],
  onQuestionPoint,
  onQuestionSubmit,
  onQuestionCancel,
  onProfessorNotePoint,
  onProfessorNoteSubmit,
  onProfessorNoteCancel,
  onProfessorNoteDone,
}) {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const swipe = useRef({ active: false, startX: 0 });

  const [frameSize, setFrameSize] = useState({
    width: 0,
    height: 0,
  });

  const slideSize = useMemo(() => getSlideSize(slide), [slide]);

  const selectedQuestion = questions.find(
    (question) => question.id === selectedQuestionId,
  );

  const resolvedImageUrl = resolveImageUrl(
    imageUrl ?? slide?.image_url ?? slide?.imageUrl ?? "",
  );

  useCanvas(canvasRef, {
    onQuestionPoint,
    onProfessorNotePoint,
  });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    function updateFrameSize() {
      const style = window.getComputedStyle(stage);

      const paddingLeft = parseFloat(style.paddingLeft) || 0;
      const paddingRight = parseFloat(style.paddingRight) || 0;
      const paddingTop = parseFloat(style.paddingTop) || 0;
      const paddingBottom = parseFloat(style.paddingBottom) || 0;

      const availableWidth = Math.max(
        0,
        stage.clientWidth - paddingLeft - paddingRight,
      );

      const availableHeight = Math.max(
        0,
        stage.clientHeight - paddingTop - paddingBottom,
      );

      const nextSize = calculateContainSize(
        availableWidth,
        availableHeight,
        slideSize.width,
        slideSize.height,
      );

      setFrameSize(nextSize);
    }

    const resizeObserver = new ResizeObserver(updateFrameSize);
    resizeObserver.observe(stage);

    updateFrameSize();

    window.addEventListener("resize", updateFrameSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateFrameSize);
    };
  }, [slideSize.width, slideSize.height]);

  function handlePointerDown(event) {
    if (event.pointerType !== "touch") return;

    if (frameRef.current?.contains(event.target)) return;

    swipe.current = {
      active: true,
      startX: event.clientX,
    };
  }

  function handlePointerUp(event) {
    if (!swipe.current.active) return;

    const dx = event.clientX - swipe.current.startX;
    swipe.current.active = false;

    const THRESHOLD = 60;

    if (dx <= -THRESHOLD) {
      onNext?.();
    } else if (dx >= THRESHOLD) {
      onPrev?.();
    }
  }

  return (
    <div
      className="lecture-stage"
      ref={stageRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        swipe.current.active = false;
      }}
    >
      <div
        className="lecture-stage__frame"
        ref={frameRef}
        style={{
          width: `${frameSize.width}px`,
          height: `${frameSize.height}px`,
        }}
      >
        {resolvedImageUrl ? (
          <img
            className="lecture-stage__image"
            src={resolvedImageUrl}
            alt="슬라이드"
            draggable={false}
          />
        ) : (
          <div className="lecture-stage__empty">슬라이드를 불러오는 중…</div>
        )}

        <canvas ref={canvasRef} className="lecture-stage__canvas" />

        {selectedQuestion && (
          <QuestionBubble question={selectedQuestion} selected />
        )}

        {draftQuestion && (
          <QuestionBubble
            draft={draftQuestion}
            onSubmit={onQuestionSubmit}
            onCancel={onQuestionCancel}
          />
        )}

        {professorNotes.map((note) => (
          <ProfessorCheckBubble
            key={note.id}
            note={note}
            onDone={onProfessorNoteDone}
          />
        ))}

        {draftProfessorNote && (
          <ProfessorCheckBubble
            draft={draftProfessorNote}
            onSubmit={onProfessorNoteSubmit}
            onCancel={onProfessorNoteCancel}
          />
        )}
      </div>
    </div>
  );
}

export default SlideViewer;