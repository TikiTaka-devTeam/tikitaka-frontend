import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import SignupCompletePage from "../features/auth/pages/SignupCompletePage.jsx";
import SignupInformPage from "../features/auth/pages/SignupInformPage.jsx";
import SignupTermsPage from "../features/auth/pages/SignupTermsPage.jsx";
import DashboardPage from "../features/dashboard/pages/DashboardPage.jsx";
import StudentSpacePage from "../features/spaces/pages/StudentSpacePage.jsx";
import ProfessorSpacePage from "../features/spaces/pages/ProfessorSpacePage.jsx";
import ProfessorSpaceMemberPage from "../features/spaces/pages/ProfessorSpaceMemberPage.jsx";
import StudentLecturePage from "../features/lecture/pages/StudentLecturePage.jsx";
import ProfessorLecturePage from "../features/lecture/pages/ProfessorLecturePage.jsx";

function App() {
  const accessToken = localStorage.getItem("tikitaka_access_token");
  const user = JSON.parse(localStorage.getItem("tikitaka_user") || "null");

  return (
    <Routes>
      <Route
        path="/login"
        element={
          accessToken ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      <Route
        path="/signup-terms"
        element={
          accessToken ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <SignupTermsPage />
          )
        }
      />

      <Route
        path="/signup-inform"
        element={
          accessToken ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <SignupInformPage />
          )
        }
      />

      <Route
        path="/signup-complete"
        element={
          accessToken ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <SignupCompletePage />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          accessToken ? <DashboardPage /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/spaces/:spaceId"
        element={
          accessToken && user?.role === "STUDENT" ? (
            <StudentSpacePage />
          ) : accessToken && user?.role === "PROFESSOR" ? (
            <ProfessorSpacePage />
          ) : accessToken ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/spaces/:spaceId/documents/:documentId"
        element={
          accessToken && user?.role === "PROFESSOR" ? (
            <ProfessorLecturePage />
          ) : accessToken && user?.role === "STUDENT" ? (
            <StudentLecturePage />
          ) : accessToken ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/spaces/:spaceId/members"
        element={
          accessToken && user?.role === "PROFESSOR" ? (
            <ProfessorSpaceMemberPage />
          ) : accessToken && user?.role === "STUDENT" ? (
            <Navigate
              to={`/spaces/${window.location.pathname.split("/")[2]}`}
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="*"
        element={
          accessToken ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;