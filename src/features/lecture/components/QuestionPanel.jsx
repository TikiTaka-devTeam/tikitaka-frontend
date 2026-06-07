// src/features/lecture/components/QuestionPanel.jsx
import QuestionListTitleIcon from "../../../assets/icons/lecture/question_list_title.svg?react";
import QuestionMoreIcon from "../../../assets/icons/lecture/question_more.svg?react";

function QuestionPanel({
  questions = [],
  selectedQuestionId = null,
  onSelectQuestion,
}) {
  const hasQuestions = questions.length > 0;

  return (
    <aside className="question-panel" aria-label="질문 리스트">
      <header className="question-panel__header">
        <div className="question-panel__title-row">
          <QuestionListTitleIcon className="question-panel__title-icon" />
          <h2 className="question-panel__title">질문 리스트</h2>
        </div>

        <div className="question-panel__divider" />
      </header>

      <div className="question-panel__body">
        {hasQuestions ? (
          <div className="question-panel__cards">
            {questions.map((question) => {
              const questionText =
                typeof question === "string"
                  ? question
                  : question.content ?? question.text ?? "";
              const questionKey =
                typeof question === "string"
                  ? question
                  : question.id ??
                    `${question.slideId}-${question.x}-${question.y}-${questionText}`;

              const isSelected =
                typeof question === "object" &&
                question.id === selectedQuestionId;

              return (
                <article
                  className={`question-card ${isSelected ? "is-selected" : ""}`}
                  key={questionKey}
                  onClick={() => {
                    if (typeof question === "object") {
                      onSelectQuestion?.(question);
                    }
                  }}
                >
                  <p className="question-card__text">{questionText}</p>

                  <button
                    type="button"
                    className="question-card__more"
                    aria-label="질문 더보기"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <QuestionMoreIcon className="question-card__more-icon" />
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="question-panel__empty">질문이 없습니다</div>
        )}
      </div>
    </aside>
  );
}

export default QuestionPanel;
