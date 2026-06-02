import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_SPACE_THEME_ID,
  getSpaceThemeById,
} from "../data/spaceThemes.js";
import SpaceModalPreviewPane from "./SpaceModalPreviewPane.jsx";
import SpaceModalShell from "./SpaceModalShell.jsx";
import "../styles/join-space-modal.css";

function FieldLabel({ children, required = false }) {
  return (
    <span className="join-space-modal__field-label">
      {children}
      {required ? <em className="join-space-modal__required">*</em> : null}
    </span>
  );
}

function normalizeLookupResult(spaceCode, result) {
  if (!result) {
    return null;
  }

  return {
    code: result.code ?? spaceCode,
    name: result.name ?? "",
    nickname: result.nickname ?? "",
    semester: result.semester ?? "",
    professorName: result.professorName ?? result.professor_name ?? "",
    sessions: Array.isArray(result.sessions)
      ? result.sessions
      : Array.isArray(result.schedules)
        ? result.schedules
        : [],
  };
}

function JoinSpaceModal({ isOpen, onClose, onSubmit, onLookup }) {
  const [spaceCode, setSpaceCode] = useState("");
  const [lookupState, setLookupState] = useState("idle");
  const [foundSpace, setFoundSpace] = useState(null);
  const [isFinding, setIsFinding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultTheme = useMemo(
    () => getSpaceThemeById(DEFAULT_SPACE_THEME_ID),
    [],
  );

  function resetState() {
    setSpaceCode("");
    setLookupState("idle");
    setFoundSpace(null);
    setIsFinding(false);
    setIsSubmitting(false);
  }

  const handleClose = useCallback(() => {
    resetState();
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [handleClose, isOpen]);

  async function handleFind(event) {
    event.preventDefault();

    const normalizedCode = spaceCode.trim().toUpperCase();

    if (!normalizedCode) {
      return;
    }

    setIsFinding(true);

    try {
      const result = await onLookup?.(normalizedCode);

      const normalizedResult = normalizeLookupResult(normalizedCode, result);

      if (normalizedResult) {
        setFoundSpace(normalizedResult);
        setLookupState("found");
        return;
      }

      setFoundSpace(null);
      setLookupState("not-found");
    } catch {
      setFoundSpace(null);
      setLookupState("not-found");
    } finally {
      setIsFinding(false);
    }
  }

  function handleCodeChange(event) {
    setSpaceCode(event.target.value.toUpperCase());

    if (lookupState !== "idle") {
      setLookupState("idle");
      setFoundSpace(null);
    }
  }

  function handleCodeKeyDown(event) {
    if (event.key !== "Enter" || isFindButtonDisabled) {
      return;
    }

    event.preventDefault();
    handleFind(event);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!foundSpace || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit?.({
        spaceCode: spaceCode.trim().toUpperCase(),
        space: foundSpace,
      });
      handleClose();
    } catch {
      // Parent handler surfaces request failures to the user.
    } finally {
      setIsSubmitting(false);
    }
  }

  const preview =
    lookupState === "found" && foundSpace
      ? {
          semester: foundSpace.semester,
          title: foundSpace.nickname || foundSpace.name,
          subtitle: `${foundSpace.name} - ${foundSpace.professorName}`,
          startColor: defaultTheme.startColor,
          endColor: defaultTheme.endColor,
          gradient: defaultTheme.gradient,
        }
      : null;
  const isFindButtonDisabled =
    !spaceCode.trim() || isFinding || lookupState !== "idle";

  return (
    <SpaceModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title={"Space \uCC38\uAC00"}
      titleId="join-space-modal-title"
      overlayClassName="join-space-modal"
      panelClassName="join-space-modal__panel"
      leftClassName="join-space-modal__left"
      rightClassName="join-space-modal__right"
      leftContent={
        <SpaceModalPreviewPane
          tone="gradient"
          preview={preview}
          className="join-space-modal__preview-pane"
        />
      }
    >
      <form className="join-space-modal__content" onSubmit={handleSubmit}>
        <div className="join-space-modal__scroll">
          <div className="join-space-modal__code-row">
            <div className="join-space-modal__code-field">
              <FieldLabel required>{"Space \uCF54\uB4DC"}</FieldLabel>

              <input
                className="join-space-modal__code-input"
                type="text"
                value={spaceCode}
                onChange={handleCodeChange}
                onKeyDown={handleCodeKeyDown}
                autoComplete="off"
                spellCheck="false"
                placeholder=""
              />
            </div>

            <button
              type="button"
              className="join-space-modal__find-button"
              disabled={isFindButtonDisabled}
              onClick={handleFind}
            >
              {isFinding ? "\uCC3E\uB294 \uC911..." : "\uCC3E\uAE30"}
            </button>
          </div>

          {lookupState === "not-found" ? (
            <p className="join-space-modal__helper join-space-modal__helper--error">
              {"Space\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uCF54\uB4DC\uB97C \uB2E4\uC2DC \uD655\uC778\uD574\uC8FC\uC138\uC694."}
            </p>
          ) : null}

          {lookupState === "found" && foundSpace ? (
            <>
              <p className="join-space-modal__helper">
                {"Space\uB97C \uCC3E\uC558\uC2B5\uB2C8\uB2E4!"}
              </p>

              <div className="join-space-modal__details">
                <label className="join-space-modal__field">
                  <FieldLabel>{"Space \uC774\uB984"}</FieldLabel>
                  <input type="text" value={foundSpace.name} disabled />
                </label>

                <label className="join-space-modal__field">
                  <FieldLabel>{"\uD559\uAE30"}</FieldLabel>
                  <input type="text" value={foundSpace.semester} disabled />
                </label>

                <label className="join-space-modal__field">
                  <FieldLabel>{"\uC218\uC5C5 \uC138\uC158"}</FieldLabel>
                  <input
                    type="text"
                    value={foundSpace.sessions.join(" / ")}
                    disabled
                  />
                </label>
              </div>

              <div className="join-space-modal__footer">
                <button
                  type="submit"
                  className="join-space-modal__submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "\uC694\uCCAD \uBCF4\uB0B4\uB294 \uC911..."
                    : "Space \uCC38\uC5EC \uC694\uCCAD\uD558\uAE30"}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </form>
    </SpaceModalShell>
  );
}

export default JoinSpaceModal;
