function RecentSpacesList({ spaces, onSelect }) {
  return (
    <section className="dashboard-section">
      <div className="section-title section-title--dark">최근 Spaces</div>

      <div className="panel-card recent-spaces">
        {spaces.length === 0 ? (
          <p className="dashboard-empty-copy">최근 접속한 Space가 없습니다.</p>
        ) : null}

        {spaces.map((space, index) => {
          const title = space.name;
          const subline = [space.nickname || space.name, space.professor_name]
            .filter(Boolean)
            .join(" - ");

          return (
            <button
              key={space.space_id}
              type="button"
              className={`recent-space-item ${index < spaces.length - 1 ? "has-divider" : ""}`}
              onClick={() => onSelect?.(space)}
            >
              <span
                className="recent-space-item__accent"
                style={{ background: space.color }}
              />
              <div className="recent-space-item__body">
                <strong>{title}</strong>
                <p>{subline}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default RecentSpacesList;
