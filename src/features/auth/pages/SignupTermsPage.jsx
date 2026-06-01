import { useState } from "react";
import SignupStepper from "../components/SignupStepper";
import TermsSection from "../components/TermsSection";

import {
  serviceTerms,
  privacyTerms,
} from "../data/terms";

import "./signupTerms.css";

function SignupTermsPage() {
  const [serviceAgree, setServiceAgree] =
    useState(false);

  const [privacyAgree, setPrivacyAgree] =
    useState(false);

  const isValid =
    serviceAgree && privacyAgree;

  const handleNext = () => {
    if (!isValid) {
      alert("필수 약관에 동의해주세요.");
      return;
    }

    console.log("다음 단계 이동");
  };

  return (
    <div className="signup-container">
      <div className="signup-card">

        <h1>회원가입</h1>

        <SignupStepper currentStep={1} />

        <div className="section-title">
          약관 동의
        </div>

        <TermsSection
          title="서비스 이용 약관 동의"
          checked={serviceAgree}
          onChange={() =>
            setServiceAgree(!serviceAgree)
          }
          content={serviceTerms}
        />

        <TermsSection
          title="개인정보 수집 및 이용 약관 동의"
          checked={privacyAgree}
          onChange={() =>
            setPrivacyAgree(!privacyAgree)
          }
          content={privacyTerms}
        />

        <div className="button-group">
          <button className="prev-btn">
            이전
          </button>

          <button
            className="next-btn"
            disabled={!isValid}
            onClick={handleNext}
          >
            다음
          </button>
        </div>

      </div>
    </div>
  );
}

export default SignupTermsPage;