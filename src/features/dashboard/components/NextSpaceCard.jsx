function NextSpaceCard({ nextSpace }) {
  return (
    <article className={`next-space-card theme-${nextSpace.color}`}>
      <div className="next-space-card__time">◔ {nextSpace.start_time}</div>
      <div className="next-space-card__meta">{nextSpace.semester}</div>
      <h2>{nextSpace.space_name}</h2>
      <p>
        실무중심산학협력프로젝트1(캡스톤디자인-CE) - {nextSpace.professor_name}
      </p>
    </article>
  );
}

export default NextSpaceCard;
