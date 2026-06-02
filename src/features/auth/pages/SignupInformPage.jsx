import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import SignupStepper from "../components/SignupStepper.jsx";
import { signup } from "../api/auth.api.js";

import hidePasswordIcon from "../../../assets/icons/HidePassword.svg";
import watchPasswordIcon from "../../../assets/icons/WatchPassword.svg";
import "../styles/signupInform.css";

const campusOptions = [
  "단국대학교 죽전캠퍼스",
  "단국대학교 천안캠퍼스",
  "서울대학교",
  "연세대학교",
  "고려대학교",
  "성균관대학교",
  "한양대학교",
  "중앙대학교",
  "경희대학교",
  "한국외국어대학교",
  "서울시립대학교",
  "숭실대학교",
  "인하대학교",
  "건국대학교",
  "동국대학교",
  "홍익대학교",
  "서강대학교",
  "이화여자대학교",
  "숙명여자대학교",
  "세종대학교",
  "광운대학교",
  "국민대학교",
  "상명대학교",
  "가천대학교",
  "명지대학교",
  "인제대학교",
  "안양대학교",
  "수원대학교"
];

const initialForm = {
  name: "",
  email: "",
  password: "",
  passwordConfirm: "",
  phonePrefix: "010",
  phoneNumber: "",
  verificationCode: "",
  role: "STUDENT",
  univ: "",
  major: "",
  memberIdNumber: "",
};

function formatPhoneNumber(prefix, number) {
  const digits = number.replace(/\D/g, "");

  if (digits.length === 8) {
    return `${prefix}-${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  return `${prefix}-${digits}`;
}

function SignupInformPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const passwordsMatch =
    form.password.length > 0 && form.password === form.passwordConfirm;

  const isValid = useMemo(
    () =>
      form.name.trim() &&
      form.email.trim() &&
      form.password &&
      passwordsMatch &&
      form.phoneNumber.trim() &&
      form.role &&
      form.univ &&
      form.major.trim() &&
      form.memberIdNumber.trim(),
    [form, passwordsMatch],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "phoneNumber" || name === "verificationCode"
          ? value.replace(/\D/g, "")
          : value,
    }));

    if (name === "email") {
      setEmailChecked(false);
    }

    if (name === "phoneNumber") {
      setPhoneVerified(false);
      setPhoneCodeSent(false);
    }
  };

  const handleEmailCheck = () => {
    if (!form.email.trim()) {
      setErrorMessage("이메일을 입력해주세요.");
      return;
    }

    setEmailChecked(true);
    setErrorMessage("");
  };

  const handleSendCode = () => {
    if (!form.phoneNumber.trim()) {
      setErrorMessage("휴대폰 번호를 입력해주세요.");
      return;
    }

    setPhoneCodeSent(true);
    setErrorMessage("");
  };

  const handleVerifyCode = () => {
    if (!form.verificationCode.trim()) {
      setErrorMessage("인증번호를 입력해주세요.");
      return;
    }

    setPhoneVerified(true);
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isValid) {
      setErrorMessage("필수 정보를 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await signup({
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
        univ: form.univ,
        major: form.major.trim(),
        role: form.role,
        phoneNumber: formatPhoneNumber(form.phonePrefix, form.phoneNumber),
        memberIdNumber: form.memberIdNumber.trim(),
      });

      alert("회원가입이 완료되었습니다.");
      navigate("/login", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "회원가입에 실패했습니다. 입력 정보를 확인해주세요.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="signup-inform-page">
      <form className="signup-inform-card" onSubmit={handleSubmit}>
        <h1>회원가입</h1>
        <div className="title-line-thick" />

        <SignupStepper currentStep={2} />

        <div className="section-title">정보 입력</div>
        <div className="title-line-thin" />

        <div className="signup-inform-scroll">
          <label className="signup-inform-field">
            <span>이름</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="실명을 입력해주세요. 수업 시 사용되는 이름입니다."
            />
          </label>

          <label className="signup-inform-field">
            <span>이메일</span>
            <div className="signup-inform-inline">
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="이메일을 입력해주세요."
              />
              <button
                className={`signup-inform-action ${
                  emailChecked ? "is-done" : ""
                }`}
                type="button"
                onClick={handleEmailCheck}
              >
                {emailChecked ? "완료" : "중복 확인"}
              </button>
            </div>
          </label>

          <label className="signup-inform-field">
            <span>비밀번호</span>
            <div className="signup-inform-password">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력해주세요."
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                <img
                  src={showPassword ? watchPasswordIcon : hidePasswordIcon}
                  alt=""
                />
              </button>
            </div>
          </label>

          <label className="signup-inform-field">
            <span>비밀번호 확인</span>
            <div className="signup-inform-password">
              <input
                name="passwordConfirm"
                type={showPasswordConfirm ? "text" : "password"}
                value={form.passwordConfirm}
                onChange={handleChange}
                placeholder="확인을 위하여 위와 동일하게 입력해주세요."
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm((prev) => !prev)}
                aria-label={
                  showPasswordConfirm ? "비밀번호 확인 숨기기" : "비밀번호 확인 보기"
                }
              >
                <img
                  src={
                    showPasswordConfirm ? watchPasswordIcon : hidePasswordIcon
                  }
                  alt=""
                />
              </button>
            </div>
          </label>

          <div className="signup-inform-field">
            <span>휴대폰 번호</span>
            <div className="signup-inform-phone">
              <select
                name="phonePrefix"
                value={form.phonePrefix}
                onChange={handleChange}
              >
                <option value="010">010</option>
                <option value="011">011</option>
                <option value="016">016</option>
              </select>
              <input
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                maxLength={8}
                placeholder="- 없이 입력해주세요."
              />
              <button
                className={`signup-inform-action ${
                  phoneCodeSent ? "is-done" : ""
                }`}
                type="button"
                onClick={handleSendCode}
              >
                {phoneCodeSent ? "인증번호 재전송" : "인증번호 전송"}
              </button>
            </div>
            {phoneCodeSent && (
              <div className="signup-inform-code">
                <input
                  name="verificationCode"
                  value={form.verificationCode}
                  onChange={handleChange}
                  placeholder="인증번호를 입력해주세요."
                />
                <button
                  className={`signup-inform-action ${
                    phoneVerified ? "is-done" : ""
                  }`}
                  type="button"
                  onClick={handleVerifyCode}
                >
                  {phoneVerified ? "인증 완료" : "인증번호 확인"}
                </button>
              </div>
            )}
          </div>

          <div className="signup-inform-role-row">
            <span>역할</span>
            <div className="signup-inform-role-options">
              <button
                className={form.role === "STUDENT" ? "is-selected" : ""}
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, role: "STUDENT" }))
                }
              >
                수강생
              </button>
              <button
                className={form.role === "PROFESSOR" ? "is-selected" : ""}
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, role: "PROFESSOR" }))
                }
              >
                관리자
              </button>
            </div>
          </div>

          <div className="signup-inform-grid">
            <label className="signup-inform-field">
              <span>학교</span>
              <select name="univ" value={form.univ} onChange={handleChange}>
                <option value="">학교를 선택해주세요.</option>
                {campusOptions.map((campus) => (
                  <option key={campus} value={campus}>
                    {campus}
                  </option>
                ))}
              </select>
            </label>

            <label className="signup-inform-field">
              <span>1전공</span>
              <input
                name="major"
                value={form.major}
                onChange={handleChange}
                placeholder="1전공을 입력해주세요. ex) 컴퓨터공학과"
              />
            </label>
          </div>

          <label className="signup-inform-field">
            <span>학번</span>
            <input
              name="memberIdNumber"
              value={form.memberIdNumber}
              onChange={handleChange}
              placeholder="학번을 입력해주세요. 강의자에게 표시되는 학번입니다."
            />
          </label>

          <div className="signup-inform-profile">
            <strong>프로필 사진 (선택)</strong>
            <p>로그인 후 다시 선택할 수 있습니다.</p>
          </div>
        </div>

        {errorMessage && (
          <p className="signup-inform-error" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="title-line-thin signup-inform-bottom-line" />

        <div className="button-group">
          <button
            className="prev-btn"
            type="button"
            onClick={() => navigate("/signup-terms")}
          >
            이전
          </button>
          <button
            className="next-btn"
            type="submit"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "처리 중" : "다음"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default SignupInformPage;
