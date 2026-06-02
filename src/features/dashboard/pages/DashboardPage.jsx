import { useEffect, useState } from "react";
import ModeTabs from "../../../components/common/ModeTabs.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";
import MySpacesSection from "../components/MySpacesSection.jsx";
import NextSpaceCard from "../components/NextSpaceCard.jsx";
import RecentSpacesList from "../components/RecentSpacesList.jsx";
import WeeklySchedule from "../components/WeeklySchedule.jsx";
import { fetchDashboardData, fetchMySpaces } from "../api/dashboard.api.js";
import "../styles/dashboard.css";

const DASHBOARD_SECTION = "dashboard";
const SPACES_SECTION = "spaces";

const dashboardTabs = [
  { label: "대시보드", value: DASHBOARD_SECTION },
  { label: "space", value: SPACES_SECTION },
];

const emptyProfile = {
  name: "사용자",
  role_label: "사용자",
  unread_notification_count: 0,
};

function DashboardPage() {
  const [activeSection, setActiveSection] = useState(DASHBOARD_SECTION);
  const [profile, setProfile] = useState(emptyProfile);
  const [nextSpace, setNextSpace] = useState(null);
  const [recentSpaces, setRecentSpaces] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [mySpaces, setMySpaces] = useState([]);
  const [isLoadingMySpaces, setIsLoadingMySpaces] = useState(false);
  const [mySpacesError, setMySpacesError] = useState("");
  const [hasLoadedMySpaces, setHasLoadedMySpaces] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoadingDashboard(true);

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
          setIsLoadingDashboard(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  async function loadMySpaces() {
    setIsLoadingMySpaces(true);
    setMySpacesError("");

    try {
      const data = await fetchMySpaces();
      setMySpaces(Array.isArray(data) ? data : []);
      setHasLoadedMySpaces(true);
    } catch {
      setMySpacesError("스페이스 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoadingMySpaces(false);
    }
  }

  function handleSectionChange(nextSection) {
    setActiveSection(nextSection);

    if (nextSection === SPACES_SECTION && !hasLoadedMySpaces && !isLoadingMySpaces) {
      void loadMySpaces();
    }
  }

  const tabItems = dashboardTabs.map((tab) => ({
    ...tab,
    active: tab.value === activeSection,
  }));

  const greeting =
    activeSection === SPACES_SECTION ? `반갑습니다, ${profile.name}님` : "어서 오세요!";

  return (
    <main className="dashboard-page">
      <DashboardHeader profile={profile} />

      <div className="welcome-block">
        <p>{greeting}</p>
        {activeSection === SPACES_SECTION ? (
          <h1>My Spaces</h1>
        ) : (
          <h1>
            <span className="welcome-block__title-main">{profile.name}</span>
            <span className="welcome-block__title-role">({profile.role_label})</span>
          </h1>
        )}
      </div>

      <ModeTabs items={tabItems} onChange={handleSectionChange} />

      {activeSection === DASHBOARD_SECTION ? (
        <>
          {isLoadingDashboard ? (
            <section className="dashboard-feedback-panel">
              <p>대시보드 데이터를 불러오는 중입니다.</p>
            </section>
          ) : null}

          <section className="dashboard-overview">
            <div className="dashboard-overview__main">
              <div className="section-title">
                {nextSpace ? "다음 강의까지 " : "다음 강의 일정"}
                {nextSpace ? <span>{nextSpace.remain_time}분</span> : null}
              </div>
              <NextSpaceCard nextSpace={nextSpace} />
              <RecentSpacesList spaces={recentSpaces} />
            </div>

            <aside className="dashboard-overview__side">
              <div className="section-title section-title--dark">시간표</div>
              <WeeklySchedule schedules={schedules} />
            </aside>
          </section>
        </>
      ) : (
        <MySpacesSection
          spaces={mySpaces}
          isLoading={isLoadingMySpaces}
          errorMessage={mySpacesError}
          onRetry={loadMySpaces}
          onSelectSpace={() => {}}
          ownerName={profile.name}
          userRole={profile.role}
          onSpaceCreated={(space) => setMySpaces((prevSpaces) => [space, ...prevSpaces])}
        />
      )}
    </main>
  );
}

export default DashboardPage;
