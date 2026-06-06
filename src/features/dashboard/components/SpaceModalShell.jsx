import { useEffect } from "react";
import { createPortal } from "react-dom";
import "../styles/space-modal-shell.css";

function CloseIcon() {
  return (
    <svg
      className="space-modal__close-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6.4 5.34a.75.75 0 0 1 1.06 0L12 9.88l4.54-4.54a.75.75 0 1 1 1.06 1.06L13.06 10.94l4.54 4.54a.75.75 0 0 1-1.06 1.06L12 12l-4.54 4.54a.75.75 0 1 1-1.06-1.06l4.54-4.54L6.4 6.4a.75.75 0 0 1 0-1.06Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SpaceModalShell({
  isOpen,
  title,
  titleId,
  onClose,
  onOverlayClick,
  overlayClassName = "",
  panelClassName = "",
  leftClassName = "",
  rightClassName = "",
  leftContent,
  children,
}) {
  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return undefined;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;

    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <div
      className={`space-modal ${overlayClassName}`.trim()}
      role="presentation"
      onMouseDown={onOverlayClick}
    >
      <section
        className={`space-modal__panel ${panelClassName}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="space-modal__close"
          onClick={onClose}
          aria-label="닫기"
        >
          <CloseIcon />
        </button>

        <div className={`space-modal__left ${leftClassName}`.trim()}>
          {leftContent}
        </div>

        <div className={`space-modal__right ${rightClassName}`.trim()}>
          {title ? (
            <h2 id={titleId} className="space-modal__title">
              {title}
            </h2>
          ) : null}
          {children}
        </div>
      </section>
    </div>
  );

  if (typeof document === "undefined") {
    return modalContent;
  }

  return createPortal(modalContent, document.body);
}

export default SpaceModalShell;
