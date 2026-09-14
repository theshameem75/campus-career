import { getBlocksClient } from "@/lib/blocks/client";
import { isLoginConfigured } from "@/lib/blocks/config";

const RETURN_TO_KEY = "campus-career:return-to";

function safeReturnTo(value: string): string {
  return value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

export async function startLogin(returnTo = "/dashboard"): Promise<void> {
  if (!isLoginConfigured()) {
    throw new Error("Login is not configured for this deployment.");
  }
  sessionStorage.setItem(RETURN_TO_KEY, safeReturnTo(returnTo));
  await getBlocksClient().auth.idp.redirectToProvider();
}

export async function completeLogin(callbackUrl: string) {
  const returnTo = safeReturnTo(
    sessionStorage.getItem(RETURN_TO_KEY) || "/dashboard",
  );
  sessionStorage.removeItem(RETURN_TO_KEY);
  const result = await getBlocksClient().auth.idp.callback(callbackUrl);
  if (result.error) {
    return {
      ok: false as const,
      message: result.error_description || result.error,
      returnTo,
    };
  }
  return { ok: true as const, returnTo };
}

export async function endSession(): Promise<void> {
  await getBlocksClient().auth.logout({});
}
