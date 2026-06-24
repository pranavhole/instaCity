import { getLoginUrl } from "@/lib/api";

export async function startInstagramLogin() {
  const { redirect_url: redirectUrl } = await getLoginUrl();
  window.location.href = redirectUrl;
}
