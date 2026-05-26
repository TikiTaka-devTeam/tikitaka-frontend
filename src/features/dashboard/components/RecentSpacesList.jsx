function RecentSpacesList({ spaces }) {
  return (
    <section className="dashboard-section">
      <div className="section-title section-title--dark">최근 Spaces</div>

      <div className="panel-card recent-spaces">
        {spaces.map((space, index) => (
          <article
            key={space.space_id}
            className={`recent-space-item ${index < spaces.length - 1 ? "has-divider" : ""}`}
          >
            <span className={`recent-space-item__accent theme-${space.color}`} />
            <div className="recent-space-item__body">
              <strong>{space.name}</strong>
              <p>
                {space.description} - {space.professor_name}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default RecentSpacesList;
