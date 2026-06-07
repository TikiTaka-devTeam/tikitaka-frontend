import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModeTabs from "../../../components/common/ModeTabs.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";
import DashboardWelcomeBlock from "../components/DashboardWelcomeBlock.jsx";
import MySpacesSection from "../components/MySpacesSection.jsx";
import NextSpaceCard from "../components/NextSpaceCard.jsx";
import RecentSpacesList from "../components/RecentSpacesList.jsx";
import WeeklySchedule from "../components/WeeklySchedule.jsx";
import { fetchDashboardData, fetchMySpaces } from "../api/dashboard.api.js";
import "../styles/dashboard.css";

const DASHBOARD_SECTION = "dashboard";
const SPACES_SECTION = "spaces";

const dashboardTabs = [
  { label: "\uB300\uC2DC\uBCF4\uB4DC", value: DASHBOARD_SECTION },
  { label: "space", value: SPACES_SECTION },
];

const emptyProfile = {
  name: "\uC0AC\uC6A9\uC790",
  role_label: "\uC0AC\uC6A9\uC790",
  unread_notification_count: 0,
};

function formatRemainingTime(value) {
  const minutes = Number(value);

  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "0\uBD84";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}\uBD84`;
  }

  if (remainingMinutes === 0) {
    return `${hours}\uC2DC\uAC04`;
  }

  return `${hours}\uC2DC\uAC04 ${remainingMinutes}\uBD84`;
}

function DashboardPage() {
  const navigate = useNavigate();
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
      setMySpacesError(
        "\uC2A4\uD398\uC774\uC2A4 \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
      );
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

  function handleSelectSpace(space) {
    const targetSpaceId = space?.space_id ?? space?.spaceId;

    if (!targetSpaceId) {
      return;
    }

    navigate(`/spaces/${targetSpaceId}`);
  }

  const tabItems = dashboardTabs.map((tab) => ({
    ...tab,
    active: tab.value === activeSection,
  }));

  return (
    <main className="dashboard-page">
      <DashboardHeader profile={profile} />

      <DashboardWelcomeBlock profile={profile} />

      <ModeTabs items={tabItems} onChange={handleSectionChange} />

      <div key={activeSection} className="dashboard-section-view">
        {activeSection === DASHBOARD_SECTION ? (
          <>
            {isLoadingDashboard ? (
              <section className="dashboard-feedback-panel">
                <p>
                  {
                    "\uB300\uC2DC\uBCF4\uB4DC \uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4."
                  }
                </p>
              </section>
            ) : null}

            <section className="dashboard-overview">
              <div className="dashboard-overview__main">
                <div className="section-title">
                  {nextSpace
                    ? "\uB2E4\uC74C \uAC15\uC758\uAE4C\uC9C0 "
                    : "\uB2E4\uC74C \uAC15\uC758 \uC77C\uC815"}
                  {nextSpace ? <span>{formatRemainingTime(nextSpace.remain_time)}</span> : null}
                </div>
                <NextSpaceCard nextSpace={nextSpace} onSelect={handleSelectSpace} />
                <RecentSpacesList spaces={recentSpaces} onSelect={handleSelectSpace} />
              </div>

              <aside className="dashboard-overview__side">
                <div className="section-title section-title--dark">
                  {"\uC2DC\uAC04\uD45C"}
                </div>
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
            onSelectSpace={handleSelectSpace}
            ownerName={profile.name}
            userRole={profile.role}
            onSpaceCreated={(space) => setMySpaces((prevSpaces) => [space, ...prevSpaces])}
          />
        )}
      </div>
    </main>
  );
}

export default DashboardPage;
