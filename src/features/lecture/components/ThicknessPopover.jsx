// features/lecture/components/ThicknessPopover.jsx
import { TOOLS } from "../stores/useDrawingStore.js";

const PEN_OPTIONS = [
  { value: 2, label: "0.3 mm", type: "thin" },
  { value: 4, label: "0.5 mm", type: "middle" },
  { value: 7, label: "0.8 mm", type: "thick" },
];

const HIGHLIGHTER_OPTIONS = [
  { value: 2, label: "0.3 mm", size: 8 },
  { value: 4, label: "0.5 mm", size: 16 },
  { value: 7, label: "0.8 mm", size: 24 },
];

function getActiveLabel(options, thickness) {
  return (
    options.find((item) => item.value === thickness)?.label ?? options[0].label
  );
}

function ThicknessPopover({ tool, thickness, onChange }) {
  const isEraser = tool === TOOLS.ERASER;
  const isHighlighter = tool === TOOLS.HIGHLIGHTER;

  if (isEraser) {
    return (
      <div className="thickness-popover thickness-popover--eraser">
        <input
          type="range"
          min="4"
          max="24"
          value={thickness}
          onChange={(e) => onChange?.(Number(e.target.value))}
          className="thickness-popover__eraser-range"
          aria-label="지우개 크기 조절"
        />
      </div>
    );
  }

  if (isHighlighter) {
    return (
      <div className="thickness-popover thickness-popover--pen">
        <div className="thickness-popover__top">
          <span className="thickness-popover__label">
            {getActiveLabel(HIGHLIGHTER_OPTIONS, thickness)}
          </span>

          <input
            type="range"
            min="2"
            max="7"
            step="1"
            value={thickness}
            onChange={(e) => onChange?.(Number(e.target.value))}
            className="thickness-popover__range"
            aria-label="형광펜 굵기 조절"
          />
        </div>

        <div className="thickness-popover__circles">
          {HIGHLIGHTER_OPTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`thickness-popover__circle-btn ${
                thickness === item.value ? "is-active" : ""
              }`}
              onClick={() => onChange?.(item.value)}
              aria-label={`${item.label} 형광펜 굵기 선택`}
            >
              <span
                className="thickness-popover__circle"
                style={{
                  width: `${item.size}px`,
                  height: `${item.size}px`,
                }}
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="thickness-popover thickness-popover--pen">
      <div className="thickness-popover__top">
        <span className="thickness-popover__label">
          {getActiveLabel(PEN_OPTIONS, thickness)}
        </span>

        <input
          type="range"
          min="2"
          max="7"
          step="1"
          value={thickness}
          onChange={(e) => onChange?.(Number(e.target.value))}
          className="thickness-popover__range"
          aria-label="펜 굵기 조절"
        />
      </div>

      <div className="thickness-popover__lines">
        {PEN_OPTIONS.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`thickness-popover__line-btn ${
              thickness === item.value ? "is-active" : ""
            }`}
            onClick={() => onChange?.(item.value)}
            aria-label={`${item.label} 펜 굵기 선택`}
          >
            <span
              className={`thickness-popover__line thickness-popover__line--${item.type}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default ThicknessPopover;