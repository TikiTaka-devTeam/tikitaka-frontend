import { apiClient } from "../../../lib/api/client.js";
import { buildSpaceGradient } from "../data/spaceThemes.js";

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

function formatLookupDay(day) {
  const dayMap = {
    MONDAY: "월",
    TUESDAY: "화",
    WEDNESDAY: "수",
    THURSDAY: "목",
    FRIDAY: "금",
    SATURDAY: "토",
    SUNDAY: "일",
  };

  return dayMap[day] ?? day ?? "";
}

function formatLookupTimeRange(schedule) {
  const startTime = schedule?.start_time ?? schedule?.startTime ?? "";
  const endTime = schedule?.end_time ?? schedule?.endTime ?? "";
  const day = formatLookupDay(schedule?.day);

  return `${day} ${startTime} - ${endTime}`.trim();
}

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
    space_id: space.space_id ?? space.spaceId ?? "",
    professor_name: space.professor_name ?? space.professorName ?? "",
    last_accessed_at: space.last_accessed_at ?? space.lastAccessedAt ?? "",
    nickname: space.nickname || space.name || "",
    color: space.color || getColorBySpaceId(space.space_id ?? space.spaceId),
  }));
}

function mapSchedules(schedules, colorBySpaceId) {
  if (!Array.isArray(schedules)) {
    return [];
  }

  return schedules.map((schedule) => {
    const spaceId = schedule.space_id ?? schedule.spaceId;
    const startTime = schedule.start_time ?? schedule.startTime;
    const endTime = schedule.end_time ?? schedule.endTime;
    const { hour: startHour, minute: startMinute } = parseTime(startTime);
    const { hour: endHour, minute: endMinute } = parseTime(endTime);

    return {
      ...schedule,
      space_id: spaceId,
      space_name: schedule.space_name ?? schedule.spaceName,
      start_time: startTime,
      end_time: endTime,
      day: DAY_LABELS[schedule.day] ?? schedule.day,
      start_hour: startHour,
      start_minute: startMinute,
      end_hour: endHour,
      end_minute: endMinute,
      color: colorBySpaceId[spaceId] ?? getColorBySpaceId(spaceId),
    };
  });
}

function mapNextSpace(nextSpace, colorBySpaceId) {
  if (!nextSpace) {
    return null;
  }

  const spaceId = nextSpace.space_id ?? nextSpace.spaceId;
  const startTime = nextSpace.start_time ?? nextSpace.startTime;
  const professorName = nextSpace.professor_name ?? nextSpace.professorName;
  const spaceName = nextSpace.space_name ?? nextSpace.spaceName;
  const remainTime = nextSpace.remain_time ?? nextSpace.remainTime;

  return {
    ...nextSpace,
    space_id: spaceId,
    space_name: spaceName,
    start_time: startTime,
    professor_name: professorName,
    remain_time: remainTime,
    nickname: nextSpace.nickname || spaceName || "",
    color: colorBySpaceId[spaceId] ?? getColorBySpaceId(spaceId),
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
    const spaceId = space.space_id ?? space.spaceId;
    accumulator[spaceId] = space.color;
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

export async function createSpace(payload) {
  const response = await apiClient.post("/spaces", {
    name: payload.name,
    nickname: payload.nickname,
    semester: payload.semester,
    color: payload.theme?.startColor ?? payload.color,
    schedules: payload.schedules.map(({ day, start_time, end_time }) => ({
      day,
      start_time,
      end_time,
    })),
  });

  const createdSpace = response.data ?? {};
  const theme = payload.theme ?? null;

  return {
    ...createdSpace,
    space_id: createdSpace.space_id ?? createdSpace.spaceId ?? crypto.randomUUID(),
    name: createdSpace.name ?? payload.name,
    nickname: createdSpace.nickname ?? payload.nickname,
    semester: createdSpace.semester ?? payload.semester,
    professor_name:
      createdSpace.professor_name ??
      createdSpace.professorName ??
      payload.ownerName ??
      "",
    color: createdSpace.color ?? theme?.startColor ?? payload.color,
    startColor: theme?.startColor,
    endColor: theme?.endColor,
    gradient:
      payload.gradient ??
      (theme ? buildSpaceGradient(theme.startColor, theme.endColor) : undefined),
  };
}

export async function lookupSpaceByCode(spaceCode) {
  const response = await apiClient.get("/spaces/lookup", {
    params: {
      space_code: spaceCode,
    },
  });

  const foundSpace = response.data ?? {};
  const schedules = Array.isArray(foundSpace.schedules) ? foundSpace.schedules : [];

  return {
    code: foundSpace.space_code ?? foundSpace.spaceCode ?? spaceCode,
    name: foundSpace.name ?? "",
    nickname: foundSpace.nickname ?? "",
    semester: foundSpace.semester ?? "",
    professorName: foundSpace.professor_name ?? foundSpace.professorName ?? "",
    sessions: schedules.map(formatLookupTimeRange).filter(Boolean),
  };
}

export async function requestJoinSpace(spaceCode) {
  const response = await apiClient.post("/spaces/join", {
    space_code: spaceCode,
  });

  const joinedSpace = response.data ?? {};

  return {
    spaceMemberId: joinedSpace.space_member_id ?? joinedSpace.spaceMemberId ?? "",
    spaceId: joinedSpace.space_id ?? joinedSpace.spaceId ?? "",
    spaceName: joinedSpace.space_name ?? joinedSpace.spaceName ?? "",
    validity: joinedSpace.validity ?? "",
  };
}
