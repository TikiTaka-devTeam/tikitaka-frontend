import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import SignupTermsPage from "../features/auth/pages/SignupTermsPage.jsx";
import DashboardPage from "../features/dashboard/pages/DashboardPage.jsx";
import StudentSpacePage from "../features/spaces/pages/StudentSpacePage.jsx";

function App() {
  const accessToken = localStorage.getItem("tikitaka_access_token");

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
          accessToken ? <StudentSpacePage /> : <Navigate to="/login" replace />
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
