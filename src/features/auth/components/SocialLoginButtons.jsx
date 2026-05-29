function SocialLoginButtons() {
  return (
    <div className="social-login-buttons">
      <button type="button" className="social-login-button social-login-button--google">
        <span className="social-login-button__google-mark" aria-hidden="true">
          G
        </span>
        <span>Continue with Google</span>
      </button>

      <button type="button" className="social-login-button social-login-button--kakao">
        <span className="social-login-button__kakao-mark" aria-hidden="true" />
        <span>{"카카오로 로그인"}</span>
      </button>
    </div>
  );
}

export default SocialLoginButtons;
