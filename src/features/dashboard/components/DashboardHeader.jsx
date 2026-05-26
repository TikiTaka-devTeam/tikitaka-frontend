function DashboardHeader({ profile }) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header__logo">tikitaka</div>

      <div className="dashboard-header__actions">
        <button type="button" className="icon-button" aria-label="알림">
          <span className="icon-button__symbol">○</span>
          {profile.unread_notification_count > 0 ? (
            <span className="icon-button__badge" aria-hidden="true" />
          ) : null}
        </button>

        <button type="button" className="avatar-button" aria-label="프로필">
          <span className="avatar-button__face">새싹</span>
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;
