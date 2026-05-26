const tabs = [
  { label: "대시보드", active: true },
  { label: "space", active: false },
];

function DashboardTabs() {
  return (
    <nav className="dashboard-tabs" aria-label="대시보드 메뉴">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          type="button"
          className={`dashboard-tabs__item ${tab.active ? "is-active" : ""}`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

export default DashboardTabs;
