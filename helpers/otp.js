const otpStore = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit

export const saveOtp = (phone, code) => {
  otpStore.set(phone, {
    code,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  });
};

export const verifyOtp = (phone, code) => {
  const entry = otpStore.get(phone);
  if (!entry) return { valid: false, reason: "No OTP found for this number" };
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return { valid: false, reason: "OTP has expired" };
  }
  if (entry.code !== code) return { valid: false, reason: "Incorrect OTP" };
  otpStore.delete(phone); // one-time use
  return { valid: true };
};

export const deleteOtp = (phone) => {
  otpStore.delete(phone);
};