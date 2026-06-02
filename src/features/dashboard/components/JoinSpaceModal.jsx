import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_SPACE_THEME_ID,
  getSpaceThemeById,
} from "../data/spaceThemes.js";
import SpaceModalPreviewPane from "./SpaceModalPreviewPane.jsx";
import SpaceModalShell from "./SpaceModalShell.jsx";
import "../styles/join-space-modal.css";

const MOCK_FOUND_SPACES = {
  "26SY2A8": {
    name: "운영체제1분반(CE)",
    nickname: "운체",
    semester: "2026-1",
    professorName: "김승훈",
    sessions: ["월 10:30 - 12:00 / 수 13:30 - 15:00"],
  },
  "SPACE01": {
    name: "데이터분석과시각화",
    nickname: "데분시",
    semester: "2026-1",
    professorName: "이건석",
    sessions: ["화 09:00 - 10:30"],
  },
};

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
    sessions: Array.isArray(result.sessions) ? result.sessions : [],
  };
}

function resolveMockLookup(spaceCode) {
  const normalizedCode = spaceCode.trim().toUpperCase();

  if (!normalizedCode) {
    return null;
  }

  return normalizeLookupResult(normalizedCode, MOCK_FOUND_SPACES[normalizedCode]);
}

function JoinSpaceModal({ isOpen, onClose, onSubmit, onLookup }) {
  const [spaceCode, setSpaceCode] = useState("");
  const [lookupState, setLookupState] = useState("idle");
  const [foundSpace, setFoundSpace] = useState(null);
  const [isFinding, setIsFinding] = useState(false);
  const defaultTheme = useMemo(
    () => getSpaceThemeById(DEFAULT_SPACE_THEME_ID),
    [],
  );

  function resetState() {
    setSpaceCode("");
    setLookupState("idle");
    setFoundSpace(null);
    setIsFinding(false);
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
      const result = onLookup
        ? await onLookup(normalizedCode)
        : resolveMockLookup(normalizedCode);

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

  function handleSubmit(event) {
    event.preventDefault();

    if (!foundSpace) {
      return;
    }

    onSubmit?.({
      spaceCode: spaceCode.trim().toUpperCase(),
      space: foundSpace,
    });
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

  return (
    <SpaceModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title="Space 참가"
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
          <label className="join-space-modal__field">
            <FieldLabel required>Space 코드</FieldLabel>

            <div className="join-space-modal__code-row">
              <input
                type="text"
                value={spaceCode}
                onChange={handleCodeChange}
                autoComplete="off"
                spellCheck="false"
                placeholder=""
              />

              <button
                type="button"
                className="join-space-modal__find-button"
                disabled={!spaceCode.trim() || isFinding}
                onClick={handleFind}
              >
                {isFinding ? "찾는 중..." : "찾기"}
              </button>
            </div>
          </label>

          {lookupState === "not-found" ? (
            <p className="join-space-modal__helper join-space-modal__helper--error">
              Space를 찾지 못했어요. 코드를 다시 확인해주세요.
            </p>
          ) : null}

          {lookupState === "found" && foundSpace ? (
            <>
              <p className="join-space-modal__helper">Space를 찾았어요!</p>

              <div className="join-space-modal__details">
                <label className="join-space-modal__field">
                  <FieldLabel>Space 이름</FieldLabel>
                  <input type="text" value={foundSpace.name} readOnly />
                </label>

                <label className="join-space-modal__field">
                  <FieldLabel>학기</FieldLabel>
                  <input type="text" value={foundSpace.semester} readOnly />
                </label>

                <label className="join-space-modal__field">
                  <FieldLabel>정규 세션</FieldLabel>
                  <input
                    type="text"
                    value={foundSpace.sessions.join(" / ")}
                    readOnly
                  />
                </label>
              </div>

              <div className="join-space-modal__footer">
                <button type="submit" className="join-space-modal__submit">
                  Space 참가 요청하기
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
