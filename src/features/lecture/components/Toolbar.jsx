// src/features/lecture/components/Toolbar.jsx
import { useEffect, useRef, useState } from "react";
import ColorAddIcon from "../../../assets/icons/lecture/color_add.svg?react";
import ThicknessPopover from "./ThicknessPopover.jsx";
import { getToolbarList } from "../configs/toolbarConfig.js";
import useDrawingStore, { TOOLS } from "../stores/useDrawingStore.js";

const COLORS = [
  "#1c1c1e",
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
];

const COLOR_TOOLS = [TOOLS.PEN, TOOLS.HIGHLIGHTER];

const RIGHT_THICK_TOOLS = [TOOLS.PEN, TOOLS.HIGHLIGHTER];

const ERASER_POPOVER_TOOLS = [TOOLS.ERASER];

const BOX_ACTIVE_TOOLS = [
  TOOLS.SHAPE,
  TOOLS.LASSO,
  TOOLS.IMAGE,
  TOOLS.KEYBOARD,
  TOOLS.LIST,
];

function Toolbar({ mode = "student" }) {
  const tool = useDrawingStore((s) => s.tool);
  const color = useDrawingStore((s) => s.color);
  const thicknessByTool = useDrawingStore((s) => s.thicknessByTool);
  const setTool = useDrawingStore((s) => s.setTool);
  const setColor = useDrawingStore((s) => s.setColor);
  const setThickness = useDrawingStore((s) => s.setThickness);

  const [openPopover, setOpenPopover] = useState(null);
  const rootRef = useRef(null);

  const toolList = getToolbarList(mode);

  useEffect(() => {
    if (!openPopover) return undefined;

    function handleOutsideClick(e) {
      if (!rootRef.current?.contains(e.target)) {
        setOpenPopover(null);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [openPopover]);

  const thickness = tool ? thicknessByTool?.[tool] ?? 4 : 4;
  const showRightThickness = RIGHT_THICK_TOOLS.includes(tool);
  const showColor = COLOR_TOOLS.includes(tool);
  const isQuestionList = tool === TOOLS.LIST;

  function handleSelectTool(nextTool) {
    const isSameTool = nextTool === tool;

    if (isSameTool) {
      if (ERASER_POPOVER_TOOLS.includes(nextTool)) {
        setOpenPopover((prev) =>
          prev === "eraser-thickness" ? null : "eraser-thickness",
        );
        return;
      }

      if (RIGHT_THICK_TOOLS.includes(nextTool)) {
        setOpenPopover((prev) =>
          prev === "right-thickness" ? null : "right-thickness",
        );
        return;
      }

      setTool(null);
      setOpenPopover(null);
      return;
    }

    setTool(nextTool);
    setOpenPopover(null);
  }

  function handleSelectThickness(value) {
    setThickness(value);
  }

  function handleSelectColor(value) {
    setColor(value);
  }

  return (
    <section
      className="lecture-toolbar"
      ref={rootRef}
      aria-label="필기 도구 모음"
    >
      <div className="lecture-toolbar__scroll">
        <div className="lecture-toolbar__tools">
          {toolList.map(
            ({ key, Icon, ActiveIcon, label, toolClass, iconClass }) => {
              const active = tool === key;
              const useBoxActive = BOX_ACTIVE_TOOLS.includes(key);
              const RenderIcon = active && ActiveIcon ? ActiveIcon : Icon;
              const isEraser = key === TOOLS.ERASER;

              return (
                <div
                  key={key}
                  className={`lecture-toolbar__tool-wrap ${toolClass}`}
                >
                  <button
                    type="button"
                    title={label}
                    aria-label={label}
                    className={`lecture-toolbar__tool-btn ${toolClass} ${
                      active && useBoxActive ? "is-active" : ""
                    }`}
                    onClick={() => handleSelectTool(key)}
                  >
                    <RenderIcon
                      className={`lecture-toolbar__tool-icon ${iconClass}`}
                    />
                  </button>

                  {isEraser &&
                    tool === TOOLS.ERASER &&
                    openPopover === "eraser-thickness" && (
                      <ThicknessPopover
                        tool={tool}
                        thickness={thickness}
                        onChange={handleSelectThickness}
                      />
                    )}
                </div>
              );
            },
          )}
        </div>

        <span className="lecture-toolbar__divider" />

        <div className="lecture-toolbar__right-area">
          {isQuestionList ? (
            <button
              type="button"
              className="lecture-toolbar__question-all-btn"
              onClick={() => {
                // 질문 전체보기 기능 연결 예정
              }}
            >
              질문 전체보기
            </button>
          ) : (
            <>
              <div
                className={`lecture-toolbar__field lecture-toolbar__field--thickness ${
                  !showRightThickness ? "is-reserved" : ""
                }`}
              >
                <button
                  type="button"
                  className="lecture-toolbar__thickness-trigger"
                  onClick={() => {
                    if (!showRightThickness) return;

                    setOpenPopover((prev) =>
                      prev === "right-thickness" ? null : "right-thickness",
                    );
                  }}
                  aria-label="두께 선택"
                  title="두께 선택"
                  tabIndex={showRightThickness ? 0 : -1}
                >
                  <span className="lecture-toolbar__thickness-bar" />
                </button>

                {openPopover === "right-thickness" && showRightThickness && (
                  <ThicknessPopover
                    tool={tool}
                    thickness={thickness}
                    onChange={handleSelectThickness}
                  />
                )}
              </div>

              <div
                className={`lecture-toolbar__field lecture-toolbar__field--colors ${
                  !showColor ? "is-reserved" : ""
                }`}
              >
                <div className="lecture-toolbar__colors">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      title={c}
                      aria-label={`색상 ${c}`}
                      className={`lecture-toolbar__color-dot ${
                        color === c ? "is-active" : ""
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => {
                        if (!showColor) return;
                        handleSelectColor(c);
                      }}
                      tabIndex={showColor ? 0 : -1}
                    />
                  ))}

                  <button
                    type="button"
                    className={`lecture-toolbar__color-add ${
                      openPopover === "color" ? "is-active" : ""
                    }`}
                    title="색 추가"
                    aria-label="색 추가"
                    onClick={() => {
                      if (!showColor) return;

                      setOpenPopover((prev) =>
                        prev === "color" ? null : "color",
                      );
                    }}
                    tabIndex={showColor ? 0 : -1}
                  >
                    <ColorAddIcon className="lecture-toolbar__color-add-icon" />
                  </button>
                </div>

                {openPopover === "color" && showColor && (
                  <div className="lecture-toolbar__popover lecture-toolbar__popover--color">
                    <div className="lecture-toolbar__color-grid">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`lecture-toolbar__color-dot lecture-toolbar__color-dot--lg ${
                            color === c ? "is-active" : ""
                          }`}
                          style={{ backgroundColor: c }}
                          onClick={() => handleSelectColor(c)}
                          aria-label={`색상 ${c}`}
                        />
                      ))}

                      <label
                        className="lecture-toolbar__color-add lecture-toolbar__color-add--lg"
                        title="사용자 색상"
                      >
                        <ColorAddIcon className="lecture-toolbar__color-add-icon" />

                        <input
                          type="color"
                          value={color}
                          onChange={(e) => handleSelectColor(e.target.value)}
                          className="lecture-toolbar__color-input"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default Toolbar;
