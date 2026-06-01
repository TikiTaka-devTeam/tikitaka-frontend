import LoginPage from "../features/auth/pages/LoginPage.jsx";
import DashboardPage from "../features/dashboard/pages/DashboardPage.jsx";

function App() {
  const accessToken = localStorage.getItem("tikitaka_access_token");

  if (accessToken) {
    return <DashboardPage />;
  }

  return <LoginPage />;
}

export default App;
