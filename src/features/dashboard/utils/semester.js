const SEMESTER_SUFFIXES = ["1", "여름", "2", "겨울"];

export function getCurrentSemesterValue(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  if (month >= 3 && month <= 6) {
    return `${year}-1`;
  }

  if (month >= 7 && month <= 8) {
    return `${year}-여름`;
  }

  if (month >= 9 && month <= 12) {
    return `${year}-2`;
  }

  return `${year}-겨울`;
}

export function getCurrentYearSemesterOptions(now = new Date()) {
  const year = now.getFullYear();

  return SEMESTER_SUFFIXES.map((suffix) => ({
    value: `${year}-${suffix}`,
    label: `${year}-${suffix}`,
  }));
}
