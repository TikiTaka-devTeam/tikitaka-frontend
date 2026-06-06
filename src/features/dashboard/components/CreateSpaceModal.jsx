import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_SPACE_THEME_ID,
  SPACE_THEME_PRESETS,
  buildSpaceGradient,
  getSpaceThemeById,
} from "../data/spaceThemes.js";
import {
  getCurrentSemesterValue,
  getCurrentYearSemesterOptions,
} from "../utils/semester.js";
import SpaceModalPreviewPane from "./SpaceModalPreviewPane.jsx";
import SpaceModalShell from "./SpaceModalShell.jsx";
import "../styles/create-space-modal.css";

const DAY_OPTIONS = [
  { label: "월", value: "MONDAY" },
  { label: "화", value: "TUESDAY" },
  { label: "수", value: "WEDNESDAY" },
  { label: "목", value: "THURSDAY" },
  { label: "금", value: "FRIDAY" },
  { label: "토", value: "SATURDAY" },
  { label: "일", value: "SUNDAY" },
];

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, index) =>
  String(index * 5).padStart(2, "0"),
);
const PERIOD_OPTIONS = ["AM", "PM"];

function createSchedule(values = {}) {
  return {
    id: crypto.randomUUID(),
    day: values.day ?? "MONDAY",
    start_time: values.start_time ?? "10:30",
    end_time: values.end_time ?? "12:00",
  };
}

function createInitialFormState() {
  return {
    name: "",
    nickname: "",
    semester: getCurrentSemesterValue(),
    themeId: DEFAULT_SPACE_THEME_ID,
    schedules: [createSchedule()],
  };
}

function toTimeParts(value) {
  const [hourText = "10", minute = "30"] = value.split(":");
  const hour24 = Number(hourText);
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;

  return {
    hour: hour12,
    minute,
    period,
  };
}

function toMilitaryTime({ hour, minute, period }) {
  let hour24 = hour % 12;

  if (period === "PM") {
    hour24 += 12;
  }

  return `${String(hour24).padStart(2, "0")}:${minute}`;
}

function formatDisplayTime(value) {
  const { hour, minute, period } = toTimeParts(value);
  return `${hour}:${minute} ${period}`;
}

function FieldLabel({ children, required = false }) {
  return (
    <span className="create-space-modal__field-label">
      {children}
      {required ? <em className="create-space-modal__required">*</em> : null}
    </span>
  );
}

function TimePickerField({ id, value, onChange, isOpen, onOpen, onClose }) {
  const rootRef = useRef(null);
  const { hour, minute, period } = toTimeParts(value);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen, onClose]);

  function updateTimePart(partName, nextValue) {
    onChange(
      toMilitaryTime({
        hour,
        minute,
        period,
        [partName]: nextValue,
      }),
    );
  }

  return (
    <div ref={rootRef} className="create-space-modal__time-field">
      <button
        type="button"
        className={`create-space-modal__time-trigger ${isOpen ? "is-open" : ""}`}
        onClick={() => (isOpen ? onClose() : onOpen())}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={id}
      >
        {formatDisplayTime(value)}
      </button>

      {isOpen ? (
        <div
          id={id}
          className="create-space-modal__time-picker"
          role="dialog"
          aria-label="시간 선택"
        >
          <div className="create-space-modal__time-column">
            {HOUR_OPTIONS.map((hourOption) => (
              <button
                key={hourOption}
                type="button"
                className={`create-space-modal__time-option ${
                  hourOption === hour ? "is-selected" : ""
                }`}
                onClick={() => updateTimePart("hour", hourOption)}
              >
                {hourOption}
              </button>
            ))}
          </div>

          <div className="create-space-modal__time-column">
            {MINUTE_OPTIONS.map((minuteOption) => (
              <button
                key={minuteOption}
                type="button"
                className={`create-space-modal__time-option ${
                  minuteOption === minute ? "is-selected" : ""
                }`}
                onClick={() => updateTimePart("minute", minuteOption)}
              >
                {minuteOption}
              </button>
            ))}
          </div>

          <div className="create-space-modal__time-column">
            {PERIOD_OPTIONS.map((periodOption) => (
              <button
                key={periodOption}
                type="button"
                className={`create-space-modal__time-option ${
                  periodOption === period ? "is-selected" : ""
                }`}
                onClick={() => updateTimePart("period", periodOption)}
              >
                {periodOption}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SemesterPickerField({ id, value, options, isOpen, onChange, onOpen, onClose }) {
  const rootRef = useRef(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen, onClose]);

  return (
    <div ref={rootRef} className="create-space-modal__select-field">
      <button
        type="button"
        id={`${id}-trigger`}
        className={`create-space-modal__select-trigger ${isOpen ? "is-open" : ""}`}
        onClick={() => (isOpen ? onClose() : onOpen())}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={id}
      >
        {selectedOption?.label ?? value}
      </button>

      {isOpen ? (
        <div
          id={id}
          className="create-space-modal__select-picker"
          role="listbox"
          aria-labelledby={`${id}-trigger`}
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`create-space-modal__select-option ${
                  isSelected ? "is-selected" : ""
                }`}
                onClick={() => {
                  onChange(option.value);
                  onClose();
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function CreateSpaceModal({ isOpen, onClose, onCreate, ownerName = "" }) {
  const [formState, setFormState] = useState(createInitialFormState);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCustomNickname, setHasCustomNickname] = useState(false);
  const [activeTimePicker, setActiveTimePicker] = useState(null);
  const [isSemesterPickerOpen, setIsSemesterPickerOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key !== "Escape") {
        return;
      }

      if (activeTimePicker) {
        setActiveTimePicker(null);
        return;
      }

      if (isSemesterPickerOpen) {
        setIsSemesterPickerOpen(false);
        return;
      }

      onClose?.();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTimePicker, isOpen, isSemesterPickerOpen, onClose]);

  const selectedTheme = useMemo(
    () => getSpaceThemeById(formState.themeId),
    [formState.themeId],
  );
  const semesterOptions = useMemo(() => getCurrentYearSemesterOptions(), []);
  const defaultSemester = useMemo(() => getCurrentSemesterValue(), []);

  function updateField(fieldName, value) {
    setFormState((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }));
  }

  function handleNameChange(value) {
    setFormState((prevState) => ({
      ...prevState,
      name: value,
      nickname: hasCustomNickname ? prevState.nickname : value,
    }));
  }

  function handleNicknameChange(value) {
    setHasCustomNickname(true);
    setFormState((prevState) => ({
      ...prevState,
      nickname: value,
    }));
  }

  function updateSchedule(scheduleId, fieldName, value) {
    setFormState((prevState) => ({
      ...prevState,
      schedules: prevState.schedules.map((schedule) =>
        schedule.id === scheduleId ? { ...schedule, [fieldName]: value } : schedule,
      ),
    }));
  }

  function addSchedule() {
    setFormState((prevState) => ({
      ...prevState,
      schedules: [
        ...prevState.schedules,
        createSchedule({
          day: "WEDNESDAY",
          start_time: "13:30",
          end_time: "15:00",
        }),
      ],
    }));
  }

  function removeSchedule(scheduleId) {
    setFormState((prevState) => {
      if (prevState.schedules.length === 1) {
        return prevState;
      }

      return {
        ...prevState,
        schedules: prevState.schedules.filter((schedule) => schedule.id !== scheduleId),
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formState.name.trim()) {
      setErrorMessage("스페이스 이름을 입력해 주세요.");
      return;
    }

    if (!formState.semester.trim()) {
      setErrorMessage("학기를 입력해 주세요.");
      return;
    }

    const hasInvalidSchedule = formState.schedules.some(
      (schedule) =>
        !schedule.day ||
        !schedule.start_time ||
        !schedule.end_time ||
        schedule.start_time >= schedule.end_time,
    );

    if (hasInvalidSchedule) {
      setErrorMessage("정규 세션 정보를 다시 확인해 주세요.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await onCreate?.({
        ...formState,
        theme: selectedTheme,
        gradient: buildSpaceGradient(selectedTheme.startColor, selectedTheme.endColor),
      });

      setFormState(createInitialFormState());
      setHasCustomNickname(false);
      setActiveTimePicker(null);
      setIsSemesterPickerOpen(false);
      onClose?.();
    } catch (error) {
      setErrorMessage(error?.message || "스페이스 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const preview = {
    semester: formState.semester.trim() || defaultSemester,
    title: formState.name.trim() || "Space 이름",
    subtitle: `${formState.nickname.trim() || "Space 별명"} - ${ownerName || "사용자"}`,
    startColor: selectedTheme.startColor,
    endColor: selectedTheme.endColor,
  };

  return (
    <SpaceModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Space 생성"
      titleId="create-space-title"
      overlayClassName="create-space-modal"
      panelClassName="create-space-modal__panel"
      leftClassName="create-space-modal__preview-column"
      rightClassName="create-space-modal__body"
      headerClassName="create-space-modal__header"
      contentClassName="create-space-modal__content-shell"
      leftContent={
        <SpaceModalPreviewPane
          tone="neutral"
          preview={preview}
          className="create-space-modal__preview-pane"
        >
          <div
            className="create-space-modal__theme-grid"
            role="list"
            aria-label="색상 테마 선택"
          >
            {SPACE_THEME_PRESETS.map((theme) => {
              const isSelected = theme.id === formState.themeId;

              return (
                <button
                  key={theme.id}
                  type="button"
                  role="listitem"
                  className={`create-space-modal__theme-swatch ${isSelected ? "is-selected" : ""}`}
                  style={{
                    background: buildSpaceGradient(theme.startColor, theme.endColor),
                  }}
                  onClick={() => updateField("themeId", theme.id)}
                  aria-pressed={isSelected}
                  aria-label={`${theme.id} 테마`}
                />
              );
            })}
          </div>
        </SpaceModalPreviewPane>
      }
    >
      <form className="create-space-modal__form" onSubmit={handleSubmit}>
        <div className="create-space-modal__scroll">
          <div className="create-space-modal__scroll-content">
          <label className="create-space-modal__field">
            <FieldLabel required>Space 이름</FieldLabel>
            <input
              type="text"
              value={formState.name}
              onChange={(event) => handleNameChange(event.target.value)}
            />
          </label>

          <label className="create-space-modal__field">
            <FieldLabel>Space 별명</FieldLabel>
            <input
              type="text"
              value={formState.nickname}
              onChange={(event) => handleNicknameChange(event.target.value)}
            />
          </label>

          <label className="create-space-modal__field">
            <FieldLabel required>학기</FieldLabel>
            <SemesterPickerField
              id="create-space-semester-picker"
              value={formState.semester}
              options={semesterOptions}
              isOpen={isSemesterPickerOpen}
              onChange={(nextValue) => updateField("semester", nextValue)}
              onOpen={() => {
                setActiveTimePicker(null);
                setIsSemesterPickerOpen(true);
              }}
              onClose={() => setIsSemesterPickerOpen(false)}
            />
          </label>

          <div className="create-space-modal__field-group">
            <FieldLabel required>정규 세션</FieldLabel>

            {formState.schedules.map((schedule, index) => (
              <div key={schedule.id} className="create-space-modal__session-card">
                <div className="create-space-modal__days">
                  {DAY_OPTIONS.map((dayOption) => (
                    <button
                      key={dayOption.value}
                      type="button"
                      className={`create-space-modal__day-chip ${
                        schedule.day === dayOption.value ? "is-active" : ""
                      }`}
                      onClick={() => updateSchedule(schedule.id, "day", dayOption.value)}
                    >
                      {dayOption.label}
                    </button>
                  ))}
                </div>

                <div className="create-space-modal__time-row">
                  <TimePickerField
                    id={`${schedule.id}-start-time-picker`}
                    value={schedule.start_time}
                    isOpen={
                      activeTimePicker?.scheduleId === schedule.id &&
                      activeTimePicker?.fieldName === "start_time"
                    }
                    onOpen={() =>
                      setActiveTimePicker({
                        scheduleId: schedule.id,
                        fieldName: "start_time",
                      })
                    }
                    onClose={() => setActiveTimePicker(null)}
                    onChange={(nextValue) =>
                      updateSchedule(schedule.id, "start_time", nextValue)
                    }
                  />

                  <span className="create-space-modal__time-separator">~</span>

                  <TimePickerField
                    id={`${schedule.id}-end-time-picker`}
                    value={schedule.end_time}
                    isOpen={
                      activeTimePicker?.scheduleId === schedule.id &&
                      activeTimePicker?.fieldName === "end_time"
                    }
                    onOpen={() =>
                      setActiveTimePicker({
                        scheduleId: schedule.id,
                        fieldName: "end_time",
                      })
                    }
                    onClose={() => setActiveTimePicker(null)}
                    onChange={(nextValue) =>
                      updateSchedule(schedule.id, "end_time", nextValue)
                    }
                  />
                </div>

                {index > 0 ? (
                  <button
                    type="button"
                    className="create-space-modal__remove-session"
                    onClick={() => removeSchedule(schedule.id)}
                  >
                    세션 삭제
                  </button>
                ) : null}
              </div>
            ))}

            <button
              type="button"
              className="create-space-modal__add-session"
              onClick={addSchedule}
            >
              + 추가
            </button>
          </div>

          </div>
        </div>

        <div className="create-space-modal__footer">
          {errorMessage ? <p className="create-space-modal__error">{errorMessage}</p> : null}
            <button
              type="submit"
              className="create-space-modal__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "저장 중..." : "저장"}
            </button>
          </div>
      </form>
    </SpaceModalShell>
  );
}

export default CreateSpaceModal;
