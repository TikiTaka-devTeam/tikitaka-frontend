import { useEffect, useRef, useState } from "react";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const DEFAULT_START_HOUR = 9;
const DEFAULT_END_HOUR = 17;
const DEFAULT_HEADER_HEIGHT = 28;
const DEFAULT_BOARD_HEIGHT = 460;
const MINUTES_PER_SLOT = 5;
const SLOTS_PER_HOUR = 60 / MINUTES_PER_SLOT;

function getLastVisibleHour(schedule) {
  const startHour = Number(schedule?.start_hour);
  const endHour = Number(schedule?.end_hour);
  const endMinute = Number(schedule?.end_minute);

  if (!Number.isFinite(startHour) || !Number.isFinite(endHour) || !Number.isFinite(endMinute)) {
    return DEFAULT_END_HOUR;
  }

  return Math.max(startHour, Math.ceil((endHour * 60 + endMinute) / 60) - 1);
}

function getVisibleHours(schedules) {
  const maxHour = schedules.reduce((latestHour, schedule) => {
    return Math.max(latestHour, getLastVisibleHour(schedule));
  }, DEFAULT_END_HOUR);

  return Array.from({ length: maxHour - DEFAULT_START_HOUR + 1 }, (_, index) => {
    return DEFAULT_START_HOUR + index;
  });
}

function toGridRow(schedule, startHour) {
  const startOffsetInMinutes =
    (schedule.start_hour - startHour) * 60 + schedule.start_minute;

  return Math.max(0, Math.floor(startOffsetInMinutes / MINUTES_PER_SLOT)) + 1;
}

function toGridSpan(schedule) {
  const startInMinutes = schedule.start_hour * 60 + schedule.start_minute;
  const endInMinutes = schedule.end_hour * 60 + schedule.end_minute;
  return Math.max(1, Math.ceil((endInMinutes - startInMinutes) / MINUTES_PER_SLOT));
}

function toGridColumn(day) {
  return DAYS.indexOf(day) + 1;
}

function WeeklySchedule({ schedules }) {
  const boardRef = useRef(null);
  const [boardMetrics, setBoardMetrics] = useState({
    boardHeight: DEFAULT_BOARD_HEIGHT,
    headerHeight: DEFAULT_HEADER_HEIGHT,
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const boardElement = boardRef.current;

    if (!boardElement) {
      return undefined;
    }

    const updateBoardMetrics = () => {
      const nextBoardHeight = boardElement.clientHeight || DEFAULT_BOARD_HEIGHT;
      const computedStyles = window.getComputedStyle(boardElement);
      const nextHeaderHeight =
        Number.parseFloat(computedStyles.getPropertyValue("--schedule-header-height")) ||
        DEFAULT_HEADER_HEIGHT;

      setBoardMetrics((currentMetrics) => {
        if (
          currentMetrics.boardHeight === nextBoardHeight &&
          currentMetrics.headerHeight === nextHeaderHeight
        ) {
          return currentMetrics;
        }

        return {
          boardHeight: nextBoardHeight,
          headerHeight: nextHeaderHeight,
        };
      });
    };

    updateBoardMetrics();

    if (typeof ResizeObserver === "function") {
      const resizeObserver = new ResizeObserver(updateBoardMetrics);
      resizeObserver.observe(boardElement);

      return () => {
        resizeObserver.disconnect();
      };
    }

    window.addEventListener("resize", updateBoardMetrics);

    return () => {
      window.removeEventListener("resize", updateBoardMetrics);
    };
  }, []);

  const hours = getVisibleHours(schedules);
  const { boardHeight, headerHeight } = boardMetrics;
  const hourHeight = (boardHeight - headerHeight) / hours.length;
  const slotHeight = hourHeight / SLOTS_PER_HOUR;
  const isCompact = hourHeight < 40;
  const boardStyle = {
    "--schedule-row-count": hours.length * SLOTS_PER_HOUR,
    "--schedule-hour-height": `${hourHeight}px`,
    "--schedule-slot-height": `${slotHeight}px`,
    "--schedule-block-padding": isCompact ? "2px 3px" : "3px 4px",
    "--schedule-block-font-size": isCompact ? "11px" : "12px",
  };

  return (
    <div ref={boardRef} className="schedule-board" style={boardStyle}>
      <div className="schedule-board__corner" />
      {DAYS.map((day) => (
        <div key={day} className="schedule-board__day">
          {day}
        </div>
      ))}

      {hours.map((hour) => (
        <div key={hour} className="schedule-board__hour">
          {hour}
        </div>
      ))}

      <div
        className="schedule-board__grid"
        style={{ gridRow: `2 / span ${hours.length}` }}
      >
        {DAYS.map((day) =>
          hours.map((hour, hourIndex) => (
            <div
              key={`${day}-${hour}`}
              className="schedule-board__cell"
              style={{
                gridColumn: toGridColumn(day),
                gridRow: `${hourIndex * SLOTS_PER_HOUR + 1} / span ${SLOTS_PER_HOUR}`,
              }}
            />
          )),
        )}

        {schedules.map((schedule) => (
          <article
            key={`${schedule.space_id}-${schedule.day}-${schedule.start_hour}`}
            className="schedule-block"
            style={{
              gridColumn: toGridColumn(schedule.day),
              gridRow: `${toGridRow(schedule, DEFAULT_START_HOUR)} / span ${toGridSpan(schedule)}`,
              background: schedule.color,
            }}
          >
            <strong>{schedule.space_name}</strong>
          </article>
        ))}

        {schedules.length === 0 ? (
          <p className="schedule-board__empty">표시할 시간표가 없습니다.</p>
        ) : null}
      </div>
    </div>
  );
}

export default WeeklySchedule;
