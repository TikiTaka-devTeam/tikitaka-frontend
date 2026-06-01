import { apiClient } from "../../../lib/api/client.js";

const ROLE_LABELS = {
  STUDENT: "학생",
  PROFESSOR: "교수",
};

const DAY_LABELS = {
  MONDAY: "MON",
  TUESDAY: "TUE",
  WEDNESDAY: "WED",
  THURSDAY: "THU",
  FRIDAY: "FRI",
};

const DASHBOARD_COLOR_PALETTE = ["#5544D8", "#2350B2", "#2766EC", "#22C55E", "#E67E7E"];

function getColorBySpaceId(spaceId) {
  if (!spaceId) {
    return DASHBOARD_COLOR_PALETTE[0];
  }

  const hash = [...spaceId].reduce((accumulator, character) => {
    return accumulator + character.charCodeAt(0);
  }, 0);

  return DASHBOARD_COLOR_PALETTE[hash % DASHBOARD_COLOR_PALETTE.length];
}

function parseTime(time) {
  const [hour = "9", minute = "0"] = String(time ?? "09:00").split(":");

  return {
    hour: Number(hour),
    minute: Number(minute),
  };
}

function mapProfile(profile) {
  return {
    ...profile,
    role_label: ROLE_LABELS[profile?.role] ?? profile?.role ?? "사용자",
    unread_notification_count: profile?.unread_notification_count ?? 0,
  };
}

function mapColorizedSpaces(spaces) {
  if (!Array.isArray(spaces)) {
    return [];
  }

  return spaces.map((space) => ({
    ...space,
    color: space.color || getColorBySpaceId(space.space_id),
  }));
}

function mapSchedules(schedules, colorBySpaceId) {
  if (!Array.isArray(schedules)) {
    return [];
  }

  return schedules.map((schedule) => {
    const { hour: startHour, minute: startMinute } = parseTime(schedule.start_time);
    const { hour: endHour, minute: endMinute } = parseTime(schedule.end_time);

    return {
      ...schedule,
      day: DAY_LABELS[schedule.day] ?? schedule.day,
      start_hour: startHour,
      start_minute: startMinute,
      end_hour: endHour,
      end_minute: endMinute,
      color: colorBySpaceId[schedule.space_id] ?? getColorBySpaceId(schedule.space_id),
    };
  });
}

function mapNextSpace(nextSpace, colorBySpaceId) {
  if (!nextSpace) {
    return null;
  }

  return {
    ...nextSpace,
    color: colorBySpaceId[nextSpace.space_id] ?? getColorBySpaceId(nextSpace.space_id),
  };
}

export async function fetchDashboardData() {
  const [profileResult, recentSpacesResult, schedulesResult, nextSpaceResult] =
    await Promise.allSettled([
      apiClient.get("/users"),
      apiClient.get("/dashboard/recent-spaces"),
      apiClient.get("/dashboard/schedules"),
      apiClient.get("/dashboard/next-space"),
    ]);

  if (profileResult.status !== "fulfilled") {
    throw profileResult.reason;
  }

  const recentSpacesResponse =
    recentSpacesResult.status === "fulfilled" ? recentSpacesResult.value : { data: [] };
  const schedulesResponse =
    schedulesResult.status === "fulfilled" ? schedulesResult.value : { data: [] };
  const nextSpaceResponse =
    nextSpaceResult.status === "fulfilled" ? nextSpaceResult.value : { data: null };

  const recentSpaces = mapColorizedSpaces(recentSpacesResponse.data);
  const colorBySpaceId = recentSpaces.reduce((accumulator, space) => {
    accumulator[space.space_id] = space.color;
    return accumulator;
  }, {});

  return {
    profile: mapProfile(profileResult.value.data),
    recentSpaces,
    schedules: mapSchedules(schedulesResponse.data, colorBySpaceId),
    nextSpace: mapNextSpace(nextSpaceResponse.data, colorBySpaceId),
  };
}

export async function fetchMySpaces() {
  const response = await apiClient.get("/spaces");

  return mapColorizedSpaces(response.data);
}
