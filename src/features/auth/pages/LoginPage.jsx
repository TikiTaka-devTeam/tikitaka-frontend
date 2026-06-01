import AuthBrandPanel from "../components/AuthBrandPanel.jsx";
import LoginForm from "../components/LoginForm.jsx";
import "../styles/login.css";

function LoginPage({ navigate }) {
  return (
    <main className="login-page">
      <AuthBrandPanel onSignUp={() => navigate("signup-terms")} />
      <LoginForm onSignUp={() => navigate("signup-terms")} />
    </main>
  );
}

export default LoginPage;
