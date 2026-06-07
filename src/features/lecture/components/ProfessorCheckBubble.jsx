// src/features/lecture/components/ProfessorCheckBubble.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProfessorAlertIcon from "../../../assets/icons/lecture/professor_check_active.svg?react";
import ProfessorDoneIcon from "../../../assets/icons/lecture/professor_note_done.svg?react";
import { getBubbleWidth } from "../utils/getBubbleWidth.js";

function ProfessorCheckBubble({ draft, note, onSubmit, onCancel, onDone }) {
  const isSaved = Boolean(note);
  const data = note ?? draft;

  const [value, setValue] = useState(data?.content ?? "");
  const textareaRef = useRef(null);
  const hasSubmittedRef = useRef(false);

  const bubbleWidth = useMemo(() => {
    const text = isSaved ? data?.content ?? "" : value.trim();
    return getBubbleWidth(text, "수정사항을 입력하세요");
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
