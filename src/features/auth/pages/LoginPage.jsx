import AuthBrandPanel from "../components/AuthBrandPanel.jsx";
import LoginForm from "../components/LoginForm.jsx";
import "../styles/login.css";

function LoginPage() {
  return (
    <main className="login-page">
      <AuthBrandPanel />
      <LoginForm />
    </main>
  );
}

export default LoginPage;
