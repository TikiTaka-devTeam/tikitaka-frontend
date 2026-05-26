const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

function toGridRow(schedule) {
  return schedule.start_hour - 9 + 1;
}

function toGridSpan(schedule) {
  const startInMinutes = schedule.start_hour * 60 + schedule.start_minute;
  const endInMinutes = schedule.end_hour * 60 + schedule.end_minute;
  return Math.max(1, Math.round((endInMinutes - startInMinutes) / 60));
}

function toGridColumn(day) {
  return DAYS.indexOf(day) + 1;
}

function WeeklySchedule({ schedules }) {
  return (
    <div className="schedule-board">
      <div className="schedule-board__corner" />
      {DAYS.map((day) => (
        <div key={day} className="schedule-board__day">
          {day}
        </div>
      ))}

      {HOURS.map((hour) => (
        <div key={hour} className="schedule-board__hour">
          {hour}
        </div>
      ))}

      <div className="schedule-board__grid">
        {DAYS.map((day) =>
          HOURS.map((hour) => (
            <div key={`${day}-${hour}`} className="schedule-board__cell" />
          )),
        )}

        {schedules.map((schedule) => (
          <article
            key={`${schedule.space_id}-${schedule.day}-${schedule.start_hour}`}
            className={`schedule-block theme-${schedule.color}`}
            style={{
              gridColumn: toGridColumn(schedule.day),
              gridRow: `${toGridRow(schedule)} / span ${toGridSpan(schedule)}`,
            }}
          >
            <strong>{schedule.space_name}</strong>
          </article>
        ))}
      </div>
    </div>
  );
}

export default WeeklySchedule;
