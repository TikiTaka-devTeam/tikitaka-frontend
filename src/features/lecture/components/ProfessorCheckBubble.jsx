// src/features/lecture/components/ProfessorCheckBubble.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import ProfessorAlertIcon from "../../../assets/icons/lecture/professor_check_active.svg?react";
import ProfessorDoneIcon from "../../../assets/icons/lecture/professor_note_done.svg?react";

const MIN_BUBBLE_WIDTH = 150;
const MAX_BUBBLE_WIDTH = 350;

function getEstimatedTextWidth(text) {
  const target = text || "수정사항을 입력하세요";

  return Array.from(target).reduce((sum, char) => {
    if (char === " ") return sum + 4;
    if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(char)) return sum + 13;
    if (/[A-Z]/.test(char)) return sum + 8;
    if (/[a-z0-9]/.test(char)) return sum + 7;
    return sum + 8;
  }, 0);
}

function ProfessorCheckBubble({ draft, note, onSubmit, onCancel, onDone }) {
  const isSaved = Boolean(note);
  const data = note ?? draft;

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

  function submitNote() {
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
      submitNote();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onCancel?.();
    }
  }

  function handleCheckClick(event) {
    event.preventDefault();

    if (isSaved) {
      onDone?.(note.id);
      return;
    }

    submitNote();
  }

  return (
    <div
      className="professor-check-bubble"
      style={{
        left: `${data.x * 100}%`,
        top: `${data.y * 100}%`,
      }}
    >
      <ProfessorAlertIcon className="professor-check-bubble__icon" />

      <div
        className="professor-check-bubble__box"
        style={{
          width: `${bubbleWidth}px`,
        }}
      >
        <button
          type="button"
          className="professor-check-bubble__done"
          aria-label={isSaved ? "수정사항 완료" : "수정사항 저장"}
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleCheckClick}
        >
          <ProfessorDoneIcon className="professor-check-bubble__done-icon" />
        </button>

        {isSaved ? (
          <p className="professor-check-bubble__text">{data.content}</p>
        ) : (
          <textarea
            ref={textareaRef}
            className="professor-check-bubble__textarea"
            value={value}
            placeholder="수정사항을 입력하세요"
            rows={1}
            wrap="soft"
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={submitNote}
          />
        )}
      </div>
    </div>
  );
}

export default ProfessorCheckBubble;