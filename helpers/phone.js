export const isValidPhone = (phone) =>
  /^\+?[1-9]\d{6,14}$/.test(phone.replace(/\s/g, ""));

export const toE164 = (phone) => {
  const cleaned = phone.replace(/\s/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("09")) return "+63" + cleaned.slice(1);
  return "+" + cleaned;
};