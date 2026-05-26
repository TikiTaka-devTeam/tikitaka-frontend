import ModeTabs from "../../../components/common/ModeTabs.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";
import NextSpaceCard from "../components/NextSpaceCard.jsx";
import RecentSpacesList from "../components/RecentSpacesList.jsx";
import WeeklySchedule from "../components/WeeklySchedule.jsx";
import {
  dashboardNextSpace,
  dashboardProfile,
  dashboardRecentSpaces,
  dashboardSchedules,
} from "../mocks/dashboard.mock.js";
import "../styles/dashboard.css";

const dashboardTabs = [
  { label: "\uB300\uC2DC\uBCF4\uB4DC", active: true },
  { label: "space", active: false },
];

function DashboardPage() {
  return (
    <main className="dashboard-page">
      <DashboardHeader profile={dashboardProfile} />

      <div className="welcome-block">
        <p>{"\uC5B4\uC11C\uC624\uC138\uC694,"}</p>
        <h1>
          {dashboardProfile.name}({dashboardProfile.role_label})
        </h1>
      </div>

      <ModeTabs items={dashboardTabs} />

      <section className="dashboard-overview">
        <div className="dashboard-overview__main">
          <div className="section-title">
            {"\uB2E4\uC74C \uAC15\uC758\uAE4C\uC9C0 "}
            <span>{dashboardNextSpace.remain_time}{"\uBD84"}</span>
          </div>
          <NextSpaceCard nextSpace={dashboardNextSpace} />
          <RecentSpacesList spaces={dashboardRecentSpaces} />
        </div>

        <aside className="dashboard-overview__side">
          <div className="section-title section-title--dark">
            {"\uC2DC\uAC04\uD45C"}
          </div>
          <WeeklySchedule schedules={dashboardSchedules} />
        </aside>
      </section>
    </main>
  );
}

export default DashboardPage;
