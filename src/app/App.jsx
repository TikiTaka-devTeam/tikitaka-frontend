import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import SignupTermsPage from "../features/auth/pages/SignupTermsPage.jsx";
import DashboardPage from "../features/dashboard/pages/DashboardPage.jsx";
import StudentSpacePage from "../features/spaces/pages/StudentSpacePage.jsx";
import ProfessorSpacePage from "../features/spaces/pages/ProfessorSpacePage.jsx";

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
          ) : (
            <Navigate to="/dashboard" replace />
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
