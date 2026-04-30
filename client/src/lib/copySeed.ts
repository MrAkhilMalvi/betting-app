export const copy = (text?: string | null) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
};