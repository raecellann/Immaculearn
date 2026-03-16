export default function isValidGmail(email) {
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
  return gmailRegex.test(email);
}
