export const dashboardProfile = {
  user_id: "prof-1",
  name: "김승훈",
  role: "PROFESSOR",
  role_label: "관리자",
  profile_url: "",
  unread_notification_count: 0,
};

export const dashboardNextSpace = {
  space_id: "space-1",
  nickname: "캡디",
  space_name: "캡스톤디자인(CE)",
  day: "WEDNESDAY",
  start_time: "10:30",
  end_time: "12:00",
  professor_name: "김승훈",
  semester: "2026-1",
  remain_time: 15,
  color: "sunset",
};

export const dashboardRecentSpaces = [
  {
    space_id: "space-1",
    name: "캡스톤디자인",
    nickname: "캡디",
    semester: "2026-1",
    professor_name: "김승훈",
    description: "실무중심산학협력프로젝트1(캡스톤디자인-CE)",
    color: "sunset",
  },
  {
    space_id: "space-2",
    name: "운영체제(CE)",
    nickname: "운체",
    semester: "2026-1",
    professor_name: "김승훈",
    description: "운영체제(CE) 1분반",
    color: "ocean",
  },
];

export const dashboardSchedules = [
  {
    space_id: "space-1",
    space_name: "캡스톤디자인",
    day: "WED",
    start_hour: 9,
    start_minute: 0,
    end_hour: 12,
    end_minute: 0,
    color: "indigo",
  },
  {
    space_id: "space-2",
    space_name: "운영체제",
    day: "THU",
    start_hour: 10,
    start_minute: 30,
    end_hour: 12,
    end_minute: 0,
    color: "blue",
  },
  {
    space_id: "space-3",
    space_name: "운영체제",
    day: "TUE",
    start_hour: 13,
    start_minute: 0,
    end_hour: 15,
    end_minute: 25,
    color: "blue",
  },
];
