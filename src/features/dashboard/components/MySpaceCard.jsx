function getCardHeroStyle(color) {
  if (!color) {
    return undefined;
  }

  return {
    background: `linear-gradient(115deg, ${color} 0%, rgba(255, 255, 255, 0.18) 100%)`,
  };
}

function MySpaceCard({ space, onSelect }) {
  const footer = [space.description, space.professor_name].filter(Boolean).join(" - ");

  return (
    <button
      type="button"
      className="my-space-card"
      onClick={() => onSelect?.(space)}
    >
      <div className="my-space-card__hero" style={getCardHeroStyle(space.color)}>
        <div className="my-space-card__meta">{space.semester}</div>
        <strong>{space.name}</strong>
      </div>

      <div className="my-space-card__footer">
        <p>{footer || space.nickname || "스페이스 열기"}</p>
      </div>
    </button>
  );
}

export default MySpaceCard;
