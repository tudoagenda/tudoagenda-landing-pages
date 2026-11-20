import type { DeviceOs, InAppBrowser } from "@/lib/analytics/dataLayer";

type NavigatorLike = Pick<Navigator, "userAgent" | "platform" | "maxTouchPoints">;

function currentNavigator(): NavigatorLike | undefined {
  return typeof navigator === "undefined" ? undefined : navigator;
}

/**
 * Aparelho da visitante, pelo User-Agent. Só no cliente. iPad com Safari se
 * apresenta como Mac: entra como iOS quando o "Mac" tem tela de toque.
 */
export function detectDeviceOs(
  nav: NavigatorLike | undefined = currentNavigator(),
): DeviceOs {
  if (!nav) return "desktop";
  const ua = nav.userAgent || "";
  if (
    /iPhone|iPad|iPod/i.test(ua) ||
    (nav.platform === "MacIntel" && nav.maxTouchPoints > 1)
  ) {
    return "ios";
  }
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

/** Navegador interno do Instagram ou do Facebook, de onde vêm os anúncios. */
export function detectInAppBrowser(
  nav: Pick<Navigator, "userAgent"> | undefined = currentNavigator(),
): InAppBrowser {
  const ua = nav?.userAgent || "";
  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV/i.test(ua)) return "facebook";
  return "none";
}
