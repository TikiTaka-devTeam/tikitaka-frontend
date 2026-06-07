const MIN_BUBBLE_WIDTH = 150;
const MAX_BUBBLE_WIDTH = 350;

export function getBubbleWidth(text, placeholder) {
  const target = text || placeholder;

  const textWidth = Array.from(target).reduce((sum, char) => {
    if (char === " ") return sum + 4;
    if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(char)) return sum + 13;
    if (/[A-Z]/.test(char)) return sum + 8;
    if (/[a-z0-9]/.test(char)) return sum + 7;
    return sum + 8;
  }, 0);

  return Math.min(
    MAX_BUBBLE_WIDTH,
    Math.max(MIN_BUBBLE_WIDTH, textWidth + 76),
  );
}
