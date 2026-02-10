import Cookies from "js-cookie";

export function getCSRFCookieValue(): string | undefined {
  return Cookies.get("csrf_token");
}
