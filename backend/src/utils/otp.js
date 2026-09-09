import crypto from "crypto";

export function generateOtp() {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
}

export function hashOtp(otp) {
  return crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");
}

export function compareOtp(
  otp,
  storedOtpHash
) {
  const hashedOtp = hashOtp(otp);

  const hashedOtpBuffer =
    Buffer.from(hashedOtp, "hex");

  const storedHashBuffer =
    Buffer.from(storedOtpHash, "hex");

  if (
    hashedOtpBuffer.length !==
    storedHashBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    hashedOtpBuffer,
    storedHashBuffer
  );
}

export function getOtpExpiryDate(
  minutes = 10
) {
  const expiryDate = new Date();

  expiryDate.setMinutes(
    expiryDate.getMinutes() + minutes
  );

  return expiryDate;
}