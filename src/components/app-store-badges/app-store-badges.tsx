"use client";

import { useEffect, useState } from "react";

type Platform = "ios" | "android" | "desktop" | "unknown";

/**
 * Detecta a plataforma a partir do User-Agent atual do navegador.
 * Client-only — sempre rodar dentro de useEffect ou após mount.
 */
function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

/**
 * URLs default — apontam pra TestFlight enquanto pré-launch. Quando o app
 * estiver listado nas lojas públicas, basta atualizar as env vars
 * `NEXT_PUBLIC_APP_STORE_URL` e `NEXT_PUBLIC_PLAY_STORE_URL` sem code
 * change.
 */
const DEFAULT_IOS_URL =
  process.env.NEXT_PUBLIC_APP_STORE_URL ??
  "https://testflight.apple.com/join/PLACEHOLDER";
const DEFAULT_ANDROID_URL =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL ??
  "https://play.google.com/store/apps/details?id=com.tudoagenda.agendabela";

interface AppStoreBadgesProps {
  /**
   * Tom textual mostrado acima dos badges. Em desktop, override automático
   * pra um QR code ainda mostrará esse título.
   */
  heading?: string;
  /**
   * Force a platform to render — útil em tests ou previews. Quando ausente,
   * detecta via User-Agent no client.
   */
  forcePlatform?: Platform;
  className?: string;
}

/**
 * Renderiza badges oficiais Apple App Store / Google Play conforme a
 * plataforma do usuário. iOS-only mostra só Apple; Android-only só Google;
 * desktop mostra ambos. Os badges seguem as guidelines oficiais (proporção,
 * altura mínima, sem alterar cores).
 *
 * - Apple Marketing Resources: https://developer.apple.com/app-store/marketing/guidelines/
 * - Google Brand Guidelines: https://play.google.com/intl/en_us/badges/
 */
export function AppStoreBadges({
  heading = "Baixe o app Meu Salão:",
  forcePlatform,
  className,
}: AppStoreBadgesProps) {
  const [platform, setPlatform] = useState<Platform>(
    forcePlatform ?? "unknown",
  );

  useEffect(() => {
    if (forcePlatform) {
      setPlatform(forcePlatform);
      return;
    }
    setPlatform(detectPlatform());
  }, [forcePlatform]);

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
            href={DEFAULT_IOS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
            aria-label="Baixar na App Store"
          >
            {/* Apple-fornecido SVG, hospedado por eles — sempre atualizado */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
              alt="Baixar na App Store"
              height={48}
              style={{ height: 48, width: "auto" }}
            />
          </a>
        )}
        {showAndroid && (
          <a
            href={DEFAULT_ANDROID_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
            aria-label="Disponível no Google Play"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://play.google.com/intl/en_us/badges/static/images/badges/pt-br_badge_web_generic.png"
              alt="Disponível no Google Play"
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
