export const formatRegId = (uid, userDetail) => {
  if (!uid) return "N/A";

  // take first 3 characters of UID
  const firstThree = uid.slice(0, 3).toUpperCase();

   const first = userDetail.firstName || "";
  const last = userDetail.lastName || "";
  const full = userDetail?.fullName || ""

  // initials (take first char of first and last name)
  const initials = 
    (first ? first[0].toUpperCase() : "") +
    (last ? last[0].toUpperCase() : "") + (full ? full[0].toUpperCase() : "");

  // convert each character to alphabet position (A=1, B=2, ..., Z=26)
  const mapped = firstThree
    .split("")
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return code - 64; // 'A' (65) → 1
      } else if (!isNaN(parseInt(ch))) {
        return ch; // keep numbers as they are
      }
      return "0"; // fallback for non-alphanumeric
    })
    .join("");

  // prefix with event code
  return `JVJ2007-${initials}-${mapped}`;
};