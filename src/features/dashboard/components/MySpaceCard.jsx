import SpacePreviewCard from "./SpacePreviewCard.jsx";
import { getCurrentSemesterValue } from "../utils/semester.js";

function MySpaceCard({ space, onSelect }) {
  const title = space.nickname || space.name || "스페이스";
  const subtitle = [space.name, space.professor_name].filter(Boolean).join(" - ");

  return (
    <button
      type="button"
      className="my-space-card"
      onClick={() => onSelect?.(space)}
    >
      <SpacePreviewCard
        variant="list"
        semester={space.semester || getCurrentSemesterValue()}
        title={title}
        subtitle={subtitle || "스페이스 열기"}
        gradient={space.gradient}
        startColor={space.startColor}
        endColor={space.endColor}
        color={space.color}
      />
    </button>
  );
}

export default MySpaceCard;
