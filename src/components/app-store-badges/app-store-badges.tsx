"use client";

import { useEffect, useState } from "react";
import {
  APP_STORE_URL,
  GOOGLE_PLAY_BASE_URL,
  STORE_BADGES,
  googlePlayUrl,
} from "@/config/app-stores";
import {
  getLandingAttribution,
  pushAgendaBelaMainEvent,
  type DeviceOs,
} from "@/lib/analytics/dataLayer";

type Platform = DeviceOs | "unknown";

/**
 * Detecta a plataforma a partir do User-Agent atual do navegador.
 * Client-only — sempre rodar dentro de useEffect ou após mount.
 */
function detectPlatform(): DeviceOs {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

interface AppStoreBadgesProps {
  /**
   * "detect" (padrão): mostra só o selo da loja do aparelho, depois do mount.
   * "footer": os dois selos sempre, renderizados no servidor, sem título.
   */
  variant?: "detect" | "footer";
  /** Tom textual mostrado acima dos badges (só na variante "detect"). */
  heading?: string;
  /**
   * Força a plataforma na variante "detect" — útil em tests ou previews.
   * Quando ausente, detecta via User-Agent no client.
   */
  forcePlatform?: Platform;
  /** Quando presente, o clique num selo sai como store_click com este cta_location. */
  ctaLocation?: string;
  className?: string;
}

/**
 * Selos oficiais Apple App Store / Google Play (links e arquivos em
 * src/config/app-stores.ts). Os selos seguem as guidelines oficiais
 * (proporção, altura mínima, sem alterar cores).
 *
 * - Apple Marketing Resources: https://developer.apple.com/app-store/marketing/guidelines/
 * - Google Brand Guidelines: https://play.google.com/intl/en_us/badges/
 */
export function AppStoreBadges({
  variant = "detect",
  heading = "Baixe o app Agenda Bela:",
  forcePlatform,
  ctaLocation,
  className,
}: AppStoreBadgesProps) {
  const [platform, setPlatform] = useState<Platform>(
    forcePlatform ?? "unknown",
  );
  // Sem atribuição no servidor; no client o link da Google Play ganha o referrer.
  const [androidHref, setAndroidHref] = useState<string>(GOOGLE_PLAY_BASE_URL);

  useEffect(() => {
    setPlatform(forcePlatform ?? detectPlatform());
    setAndroidHref(googlePlayUrl(getLandingAttribution()));
  }, [forcePlatform]);

  const track = (store: "app_store" | "google_play") => {
    if (!ctaLocation) return;
    pushAgendaBelaMainEvent({
      event: "store_click",
      store,
      cta_location: ctaLocation,
      device_os: detectPlatform(),
    });
  };

  if (variant === "footer") {
    return (
      <div
        className={
          className ??
          "flex flex-wrap items-center justify-center md:justify-start gap-3"
        }
      >
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("app_store")}
          className="inline-flex min-h-11 items-center rounded-[10px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-petroleo"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={STORE_BADGES.appStore.src}
            alt={STORE_BADGES.appStore.alt}
            width={STORE_BADGES.appStore.width}
            height={STORE_BADGES.appStore.height}
            className="block h-10 w-auto"
          />
        </a>
        <a
          href={androidHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("google_play")}
          className="inline-flex min-h-11 items-center rounded-[10px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-petroleo"
        >
          {/* PNG com respiro vertical: 52px = mesma altura visual dos 40px da Apple */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={STORE_BADGES.googlePlay.src}
            alt={STORE_BADGES.googlePlay.alt}
            width={STORE_BADGES.googlePlay.width}
            height={STORE_BADGES.googlePlay.height}
            className="block h-[52px] w-auto -my-1.5"
          />
        </a>
      </div>
    );
  }

  if (platform === "unknown") {
    // Pré-mount: render nothing pra evitar flash de FOUC entre layouts iOS/Android/desktop.
    return null;
  }

  const showIOS = platform === "ios" || platform === "desktop";
  const showAndroid = platform === "android" || platform === "desktop";

  return (
    <div className={className ?? "bg-purple-50 p-4 rounded-lg text-center"}>
      <p className="font-medium text-sm mb-3">{heading}</p>
      <div className="flex gap-2 justify-center items-center flex-wrap">
        {showIOS && (
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
            onClick={() => track("app_store")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={STORE_BADGES.appStore.src}
              alt={STORE_BADGES.appStore.alt}
              height={48}
              style={{ height: 48, width: "auto" }}
            />
          </a>
        )}
        {showAndroid && (
          <a
            href={androidHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
            onClick={() => track("google_play")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={STORE_BADGES.googlePlay.src}
              alt={STORE_BADGES.googlePlay.alt}
              height={64}
              style={{ height: 64, width: "auto" }}
            />
          </a>
        )}
      </div>
      {platform === "desktop" && (
        <p className="text-xs text-gray-500 mt-3">
          Para baixar pelo celular, abra esta página no seu dispositivo móvel.
        </p>
      )}
    </div>
  );
}
