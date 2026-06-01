function formatLastAccessedAt(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getMonth() + 1}.${date.getDate()} 최근 접속`;
}

function RecentSpacesList({ spaces }) {
  return (
    <section className="dashboard-section">
      <div className="section-title section-title--dark">최근 Spaces</div>

      <div className="panel-card recent-spaces">
        {spaces.length === 0 ? (
          <p className="dashboard-empty-copy">최근 접속한 Space가 없습니다.</p>
        ) : null}

        {spaces.map((space, index) => {
          const subline = [space.nickname, space.professor_name].filter(Boolean).join(" · ");
          const lastAccessedAt = formatLastAccessedAt(space.last_accessed_at);

          return (
            <article
              key={space.space_id}
              className={`recent-space-item ${index < spaces.length - 1 ? "has-divider" : ""}`}
            >
              <span
                className="recent-space-item__accent"
                style={{ background: space.color }}
              />
              <div className="recent-space-item__body">
                <strong>{space.name}</strong>
                <p>{[subline, lastAccessedAt].filter(Boolean).join(" · ")}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default RecentSpacesList;
