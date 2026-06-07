function DashboardWelcomeBlock({ profile }) {
  return (
    <div className="welcome-block">
      <p>어서 오세요!</p>
      <h1>
        <span className="welcome-block__title-main">{profile?.name}</span>
        <span className="welcome-block__title-role">({profile?.role_label})</span>
      </h1>
    </div>
  );
}

export default DashboardWelcomeBlock;
