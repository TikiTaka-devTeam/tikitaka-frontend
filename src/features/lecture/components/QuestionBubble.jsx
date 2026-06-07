// src/features/lecture/components/QuestionBubble.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import QuestionArrowIcon from "../../../assets/icons/lecture/question_arrow.svg?react";
import { getBubbleWidth } from "../utils/getBubbleWidth.js";

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
    return getBubbleWidth(text, "질문을 입력하세요");
  }, [value, data?.content, isSaved]);

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  useEffect(() => {
    hasSubmittedRef.current = false;

    if (!isSaved) {
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
        resizeTextarea();
      });
    }
  }, [data?.id, isSaved, resizeTextarea]);

  useEffect(() => {
    resizeTextarea();
  }, [value, bubbleWidth, resizeTextarea]);

  if (!data) return null;

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
