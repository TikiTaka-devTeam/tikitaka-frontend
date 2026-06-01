import { useEffect, useState } from "react";
import ModeTabs from "../../../components/common/ModeTabs.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";
import NextSpaceCard from "../components/NextSpaceCard.jsx";
import RecentSpacesList from "../components/RecentSpacesList.jsx";
import WeeklySchedule from "../components/WeeklySchedule.jsx";
import { fetchDashboardData } from "../api/dashboard.api.js";
import "../styles/dashboard.css";

const dashboardTabs = [
  { label: "\uB300\uC2DC\uBCF4\uB4DC", active: true },
  { label: "space", active: false },
];

const emptyProfile = {
  name: "사용자",
  role_label: "사용자",
  unread_notification_count: 0,
};

function DashboardPage() {
  const [profile, setProfile] = useState(emptyProfile);
  const [nextSpace, setNextSpace] = useState(null);
  const [recentSpaces, setRecentSpaces] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);

      try {
        const data = await fetchDashboardData();

        if (!isMounted) {
          return;
        }

        setProfile(data.profile ?? emptyProfile);
        setNextSpace(data.nextSpace ?? null);
        setRecentSpaces(data.recentSpaces ?? []);
        setSchedules(data.schedules ?? []);
      } catch {
        if (!isMounted) {
          return;
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="dashboard-page">
      <DashboardHeader profile={profile} />

      <div className="welcome-block">
        <p>{"\uC5B4\uC11C\uC624\uC138\uC694,"}</p>
        <h1>
          {profile.name}({profile.role_label})
        </h1>
      </div>

      <ModeTabs items={dashboardTabs} />

      {isLoading ? (
        <section className="dashboard-feedback-panel">
          <p>대시보드 데이터를 불러오는 중입니다.</p>
        </section>
      ) : null}

      <section className="dashboard-overview">
        <div className="dashboard-overview__main">
          <div className="section-title">
            {nextSpace
              ? "다음 강의까지 "
              : "다음 강의 일정"}
            {nextSpace ? <span>{nextSpace.remain_time}분</span> : null}
          </div>
          <NextSpaceCard nextSpace={nextSpace} />
          <RecentSpacesList spaces={recentSpaces} />
        </div>

        <aside className="dashboard-overview__side">
          <div className="section-title section-title--dark">
            {"\uC2DC\uAC04\uD45C"}
          </div>
          <WeeklySchedule schedules={schedules} />
        </aside>
      </section>
    </main>
  );
}

export default DashboardPage;
