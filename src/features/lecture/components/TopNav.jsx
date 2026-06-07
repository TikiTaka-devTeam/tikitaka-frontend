// features/lecture/components/TopNav.jsx
import BackIcon from "../../../assets/icons/lecture/arrow_back.svg?react";
import UndoIcon from "../../../assets/icons/lecture/undo.svg?react";
import RedoIcon from "../../../assets/icons/lecture/redo.svg?react";
import DownloadIcon from "../../../assets/icons/lecture/download.svg?react";
import MoreIcon from "../../../assets/icons/lecture/more.svg?react";
import useDrawingStore from "../stores/useDrawingStore.js";

function TopNav({
  title = "강의자료",
  documents = [],
  activeDocId,
  onBack,
  onSelectDoc,
  onCloseDoc,
  onDownload,
  onMore,
}) {
  const undo = useDrawingStore((s) => s.undo);
  const redo = useDrawingStore((s) => s.redo);
  const canUndo = useDrawingStore((s) => s.strokes.length > 0);
  const canRedo = useDrawingStore((s) => s.redoStack.length > 0);

  return (
    <>
      <header className="lecture-topnav">
        <div className="lecture-topnav__left">
          <button
            type="button"
            className="lecture-topnav__back"
            onClick={onBack}
            aria-label="뒤로가기"
            title="뒤로가기"
          >
            <BackIcon className="lecture-topnav__back-icon" />
          </button>

          <h1 className="lecture-topnav__title" title={title}>
            {title}
          </h1>
        </div>

        <div className="lecture-topnav__actions">
          <button
            type="button"
            className="lecture-topnav__icon-btn"
            onClick={undo}
            disabled={!canUndo}
            aria-label="실행취소"
            title="실행취소"
          >
            <UndoIcon className="lecture-topnav__icon lecture-topnav__icon--history" />
          </button>

          <button
            type="button"
            className="lecture-topnav__icon-btn"
            onClick={redo}
            disabled={!canRedo}
            aria-label="다시실행"
            title="다시실행"
          >
            <RedoIcon className="lecture-topnav__icon lecture-topnav__icon--history" />
          </button>

          <button
            type="button"
            className="lecture-topnav__icon-btn lecture-topnav__icon-btn--sm"
            onClick={onDownload}
            aria-label="저장"
            title="저장"
          >
            <DownloadIcon className="lecture-topnav__icon" />
          </button>

          <button
            type="button"
            className="lecture-topnav__icon-btn lecture-topnav__icon-btn--sm"
            onClick={onMore}
            aria-label="더보기"
            title="더보기"
          >
            <MoreIcon className="lecture-topnav__icon" />
          </button>
        </div>
      </header>

      {documents.length > 0 && (
        <nav className="lecture-tabs" aria-label="강의자료 탭">
          <div className="lecture-tabs__inner">
            {documents.map((doc) => {
              const docId = doc.document_id ?? doc.id;
              const docTitle = doc.title ?? "제목 없는 강의자료";
              const isActive = docId === activeDocId;

              return (
                <div
                  key={docId}
                  className={`lecture-tabs__tab ${isActive ? "is-active" : ""}`}
                >
                  <button
                    type="button"
                    className="lecture-tabs__select"
                    onClick={() => onSelectDoc?.(docId)}
                    title={docTitle}
                  >
                    <span className="lecture-tabs__label">{docTitle}</span>
                  </button>

                  {onCloseDoc && (
                    <button
                      type="button"
                      className="lecture-tabs__close"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseDoc(docId);
                      }}
                      aria-label={`${docTitle} 탭 닫기`}
                      title="탭 닫기"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}

export default TopNav;