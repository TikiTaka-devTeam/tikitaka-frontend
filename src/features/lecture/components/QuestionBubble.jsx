// src/features/lecture/components/QuestionBubble.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import QuestionArrowIcon from "../../../assets/icons/lecture/question_arrow.svg?react";

const MIN_BUBBLE_WIDTH = 150;
const MAX_BUBBLE_WIDTH = 350;

function getEstimatedTextWidth(text) {
  const target = text || "질문을 입력하세요";

  return Array.from(target).reduce((sum, char) => {
    if (char === " ") return sum + 4;
    if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(char)) return sum + 13;
    if (/[A-Z]/.test(char)) return sum + 8;
    if (/[a-z0-9]/.test(char)) return sum + 7;
    return sum + 8;
  }, 0);
}

function QuestionBubble({
  draft,
  question,
  selected = false,
  onSubmit,
  onCancel,
}) {
  const isSaved = Boolean(question);
  const data = question ?? draft;

  const [value, setValue] = useState(data?.content ?? "");
  const textareaRef = useRef(null);
  const hasSubmittedRef = useRef(false);

  const bubbleWidth = useMemo(() => {
    const text = isSaved ? data?.content ?? "" : value.trim();
    const textWidth = getEstimatedTextWidth(text);

    return Math.min(
      MAX_BUBBLE_WIDTH,
      Math.max(MIN_BUBBLE_WIDTH, textWidth + 76),
    );
  }, [value, data?.content, isSaved]);

  useEffect(() => {
    setValue(data?.content ?? "");
    hasSubmittedRef.current = false;

    if (!isSaved) {
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
        resizeTextarea();
      });
    }
  }, [data?.id, data?.content, isSaved]);

  useEffect(() => {
    resizeTextarea();
  }, [value, bubbleWidth]);

  if (!data) return null;

  function resizeTextarea() {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  function submitQuestion() {
    if (isSaved || hasSubmittedRef.current) return;

    const text = value.trim();

    if (!text) {
      onCancel?.();
      return;
    }

    hasSubmittedRef.current = true;
    onSubmit?.(text);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitQuestion();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onCancel?.();
    }
  }

  return (
    <div
      className={`question-bubble ${selected ? "is-selected" : ""}`}
      style={{
        left: `${data.x * 100}%`,
        top: `${data.y * 100}%`,
      }}
    >
      <QuestionArrowIcon className="question-bubble__arrow" />

      <div
        className="question-bubble__box"
        style={{
          width: `${bubbleWidth}px`,
        }}
      >
        {isSaved ? (
          <p className="question-bubble__text">{data.content}</p>
        ) : (
          <>
            <button
              type="button"
              className="question-bubble__close"
              aria-label="질문 작성 취소"
              onMouseDown={(event) => {
                event.preventDefault();
                onCancel?.();
              }}
            >
              ×
            </button>

            <textarea
              ref={textareaRef}
              className="question-bubble__textarea"
              value={value}
              placeholder="질문을 입력하세요"
              rows={1}
              wrap="soft"
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={submitQuestion}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default QuestionBubble;