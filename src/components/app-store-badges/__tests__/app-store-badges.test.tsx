/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { AppStoreBadges } from "../app-store-badges";

describe("AppStoreBadges — device detection", () => {
  describe("with forced platform (test override)", () => {
    it("renders only Apple badge for iOS", () => {
      render(<AppStoreBadges forcePlatform="ios" />);

      expect(
        screen.getByAltText("Baixar na App Store"),
      ).toBeInTheDocument();
      expect(
        screen.queryByAltText("Disponível no Google Play"),
      ).not.toBeInTheDocument();
    });

    it("renders only Google badge for Android", () => {
      render(<AppStoreBadges forcePlatform="android" />);

      expect(
        screen.getByAltText("Disponível no Google Play"),
      ).toBeInTheDocument();
      expect(
        screen.queryByAltText("Baixar na App Store"),
      ).not.toBeInTheDocument();
    });

    it("renders BOTH badges + desktop hint for desktop", () => {
      render(<AppStoreBadges forcePlatform="desktop" />);

      expect(screen.getByAltText("Baixar na App Store")).toBeInTheDocument();
      expect(
        screen.getByAltText("Disponível no Google Play"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/abra esta página no seu dispositivo móvel/i),
      ).toBeInTheDocument();
    });

    it("respects custom heading prop", () => {
      render(
        <AppStoreBadges
          forcePlatform="desktop"
          heading="Heading customizado"
        />,
      );

      expect(screen.getByText("Heading customizado")).toBeInTheDocument();
    });
  });

  describe("with auto-detection (User-Agent based)", () => {
    const originalUA = navigator.userAgent;

    function setUA(ua: string) {
      Object.defineProperty(navigator, "userAgent", {
        value: ua,
        configurable: true,
      });
    }

    afterEach(() => {
      setUA(originalUA);
    });

    it("detects iOS from iPhone UA", () => {
      setUA(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      );
      render(<AppStoreBadges />);

      expect(
        screen.getByAltText("Baixar na App Store"),
      ).toBeInTheDocument();
      expect(
        screen.queryByAltText("Disponível no Google Play"),
      ).not.toBeInTheDocument();
    });

    it("detects Android from Android UA", () => {
      setUA(
        "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36",
      );
      render(<AppStoreBadges />);

      expect(
        screen.getByAltText("Disponível no Google Play"),
      ).toBeInTheDocument();
      expect(
        screen.queryByAltText("Baixar na App Store"),
      ).not.toBeInTheDocument();
    });

    it("falls back to desktop (both badges) when UA doesn't match mobile", () => {
      setUA(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120",
      );
      render(<AppStoreBadges />);

      expect(screen.getByAltText("Baixar na App Store")).toBeInTheDocument();
      expect(
        screen.getByAltText("Disponível no Google Play"),
      ).toBeInTheDocument();
    });
  });
});
