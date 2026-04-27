export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const portalUrl =
    (import.meta.env.VITE_OAUTH_PORTAL_URL as string | undefined) ||
    "https://auth.manus.im";
  const appId = (import.meta.env.VITE_APP_ID as string | undefined) || "";
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);
  return `${portalUrl}?appId=${appId}&redirectUri=${encodeURIComponent(redirectUri)}&state=${state}`;
};
