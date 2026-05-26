import DashboardHeader from "../components/DashboardHeader.jsx";
import DashboardTabs from "../components/DashboardTabs.jsx";
import NextSpaceCard from "../components/NextSpaceCard.jsx";
import RecentSpacesList from "../components/RecentSpacesList.jsx";
import WeeklySchedule from "../components/WeeklySchedule.jsx";
import {
  professorNextSpace,
  professorProfile,
  professorRecentSpaces,
  professorSchedules,
} from "../mocks/professorDashboard.mock.js";
import "../styles/professor-dashboard.css";

function ProfessorDashboardPage() {
  return (
    <main className="professor-dashboard">
      <DashboardHeader profile={professorProfile} />

      <div className="professor-dashboard__layout">
        <section className="professor-dashboard__main">
          <div className="welcome-block">
            <p>어서오세요,</p>
            <h1>
              {professorProfile.name}({professorProfile.role_label})
            </h1>
          </div>

          <DashboardTabs />

          <NextSpaceCard nextSpace={professorNextSpace} />
          <RecentSpacesList spaces={professorRecentSpaces} />
        </section>

        <aside className="professor-dashboard__side">
          <WeeklySchedule schedules={professorSchedules} />
        </aside>
      </div>
    </main>
  );
}

export default ProfessorDashboardPage;
