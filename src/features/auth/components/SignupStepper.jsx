import "../styles/signupTerms.css";

function SignupStepper({ currentStep }) {
  const steps = ["약관 동의", "정보 입력", "가입 완료"];

  return (
    <div className="signup-stepper">
      {steps.map((step, index) => (
        <div
          key={step}
          className={`step-item ${
            currentStep === index + 1 ? "active" : ""
          }`}
        >
          <div className="step-circle">{index + 1}</div>
          <span>{step}</span>
        </div>
      ))}
    </div>
  );
}

export default SignupStepper;
