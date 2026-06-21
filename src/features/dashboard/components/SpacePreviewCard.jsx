import {
  buildSpaceGradient,
  resolveSpaceGradient,
} from "../data/spaceThemes.js";
import "../styles/space-preview-card.css";

function getPreviewStyle({ gradient, startColor, endColor, color }) {
  if (gradient) {
    return { background: gradient };
  }

  if (startColor && endColor) {
    return { background: buildSpaceGradient(startColor, endColor) };
  }

  if (color) {
    return { background: resolveSpaceGradient(color) };
  }

  return undefined;
}

function SpacePreviewCard({
  semester,
  title,
  subtitle,
  gradient,
  startColor,
  endColor,
  color,
  variant = "list",
  className = "",
}) {
  const variantClass = `space-preview-card--${variant}`;

  return (
    <div className={`space-preview-card ${variantClass} ${className}`.trim()}>
      <div
        className="space-preview-card__hero"
        style={getPreviewStyle({ gradient, startColor, endColor, color })}
      >
        <div className="space-preview-card__meta">{semester}</div>
        <strong>{title}</strong>
      </div>

      <div className="space-preview-card__footer">
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

export default SpacePreviewCard;
