import { useState } from "react";
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import SignupTermsPage from "../features/auth/pages/SignupTermsPage.jsx";
import DashboardPage from "../features/dashboard/pages/DashboardPage.jsx";

function App() {
  const [page, setPage] = useState("login");
  const accessToken = localStorage.getItem("tikitaka_access_token");

  if (accessToken) {
    return <DashboardPage />;
  }

  if (page === "signup-terms") {
    return <SignupTermsPage navigate={setPage} />;
  }

  return <LoginPage navigate={setPage} />;
}

export default App;
