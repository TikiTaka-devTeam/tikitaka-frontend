function getHeroStyle(color) {
  if (!color) {
    return undefined;
  }

  return {
    background: `linear-gradient(135deg, ${color} 0%, rgba(255, 255, 255, 0.2) 180%)`,
  };
}

function NextSpaceCard({ nextSpace }) {
  if (!nextSpace) {
    return (
      <article className="next-space-card">
        <div className="next-space-card__empty">
          <p>{"\uC624\uB298\uC740 \uAC15\uC758\uAC00 \uC5C6\uB124\uC694."}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="next-space-card">
      <div className="next-space-card__hero" style={getHeroStyle(nextSpace.color)}>
        <div className="next-space-card__time">{nextSpace.start_time}</div>
        <div className="next-space-card__meta">{nextSpace.semester}</div>
        <h2>{nextSpace.space_name}</h2>
      </div>

      <div className="next-space-card__footer">
        <p>{[nextSpace.nickname, nextSpace.professor_name].filter(Boolean).join(" - ")}</p>
      </div>
    </article>
  );
}

export default NextSpaceCard;
