export const SPACE_THEME_PRESETS = [
  { id: "blush-violet", startColor: "#EC77AB", endColor: "#6654F1" },
  { id: "peach-indigo", startColor: "#FFC8A9", endColor: "#3B41C5" },
  { id: "cobalt-mint", startColor: "#2563EB", endColor: "#37ECBA" },
  { id: "violet-mist", startColor: "#6E45E2", endColor: "#88D3CE" },
  { id: "sky-cobalt", startColor: "#7AC5D8", endColor: "#2563EB" },
  { id: "aqua-periwinkle", startColor: "#48C6EF", endColor: "#6654F1" },
  { id: "midnight-aqua", startColor: "#2E1A72", endColor: "#63D5D3" },
  { id: "electric-violet", startColor: "#5B2BE0", endColor: "#5170FF" },
  { id: "slate-purple", startColor: "#43557A", endColor: "#5B4F8A" },
  { id: "deep-navy", startColor: "#263A58", endColor: "#5A739C" },
  { id: "indigo-blue", startColor: "#3B4D8B", endColor: "#4259B6" },
  { id: "cornflower", startColor: "#5D76C6", endColor: "#7B94E5" },
];

export const DEFAULT_SPACE_THEME_ID = SPACE_THEME_PRESETS[2].id;

export function buildSpaceGradient(startColor, endColor) {
  if (!startColor || !endColor) {
    return "";
  }

  return `linear-gradient(90deg, ${startColor} 0%, ${endColor} 100%)`;
}

export function getSpaceThemeByColor(color) {
  if (!color) {
    return null;
  }

  const normalizedColor = color.toLowerCase();

  return (
    SPACE_THEME_PRESETS.find(
      (theme) => theme.startColor.toLowerCase() === normalizedColor,
    ) ?? null
  );
}

export function resolveSpaceGradient(color) {
  const theme = getSpaceThemeByColor(color);

  if (theme) {
    return buildSpaceGradient(theme.startColor, theme.endColor);
  }

  if (color) {
    return `linear-gradient(115deg, ${color} 0%, rgba(255, 255, 255, 0.26) 100%)`;
  }

  const defaultTheme = getSpaceThemeById(DEFAULT_SPACE_THEME_ID);
  return buildSpaceGradient(defaultTheme.startColor, defaultTheme.endColor);
}

export function getSpaceThemeById(themeId) {
  return (
    SPACE_THEME_PRESETS.find((theme) => theme.id === themeId) ??
    SPACE_THEME_PRESETS.find((theme) => theme.id === DEFAULT_SPACE_THEME_ID)
  );
}
