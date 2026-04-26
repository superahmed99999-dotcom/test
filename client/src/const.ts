export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  // Redirect to local OTP signup page since Manus OAuth portal is not reachable on Railway
  return "/signup";
};
