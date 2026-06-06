import SpacePreviewCard from "./SpacePreviewCard.jsx";
import "../styles/space-modal-preview-pane.css";

function SpaceModalPreviewPane({
  tone = "neutral",
  preview,
  children,
  className = "",
}) {
  return (
    <div className={`space-modal-preview-pane space-modal-preview-pane--${tone} ${className}`.trim()}>
      {preview ? (
        <div className="space-modal-preview-pane__preview">
          <SpacePreviewCard
            variant="preview"
            semester={preview.semester}
            title={preview.title}
            subtitle={preview.subtitle}
            startColor={preview.startColor}
            endColor={preview.endColor}
            gradient={preview.gradient}
            className="space-modal-preview-pane__card"
          />
        </div>
      ) : null}

      {children ? <div className="space-modal-preview-pane__extra">{children}</div> : null}
    </div>
  );
}

export default SpaceModalPreviewPane;
