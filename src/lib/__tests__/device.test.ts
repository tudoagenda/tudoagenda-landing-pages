import { detectDeviceOs, detectInAppBrowser } from "../device";

const UA = {
  iphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  iphoneInstagram:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21F90 Instagram 335.0.0.27.93 (iPhone15,2; iOS 17_5; pt_BR)",
  android:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
  androidFacebook:
    "Mozilla/5.0 (Linux; Android 14; SM-A546E Build/UP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/470.0.0.50.82;]",
  mac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  windows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
};

const nav = (userAgent: string, platform = "", maxTouchPoints = 0) => ({
  userAgent,
  platform,
  maxTouchPoints,
});

describe("detectDeviceOs", () => {
  it("iPhone vai para iOS, inclusive dentro do Instagram", () => {
    expect(detectDeviceOs(nav(UA.iphone, "iPhone", 5))).toBe("ios");
    expect(detectDeviceOs(nav(UA.iphoneInstagram, "iPhone", 5))).toBe("ios");
  });

  it("iPad com Safari (que se apresenta como Mac com toque) vai para iOS", () => {
    expect(detectDeviceOs(nav(UA.mac, "MacIntel", 5))).toBe("ios");
  });

  it("Android vai para Android, inclusive dentro do Facebook", () => {
    expect(detectDeviceOs(nav(UA.android, "Linux armv81", 5))).toBe("android");
    expect(detectDeviceOs(nav(UA.androidFacebook, "Linux armv81", 5))).toBe(
      "android",
    );
  });

  it("Mac sem toque e Windows são computador", () => {
    expect(detectDeviceOs(nav(UA.mac, "MacIntel", 0))).toBe("desktop");
    expect(detectDeviceOs(nav(UA.windows, "Win32", 0))).toBe("desktop");
    // Notebook Windows com tela de toque continua computador.
    expect(detectDeviceOs(nav(UA.windows, "Win32", 10))).toBe("desktop");
  });
});

describe("detectInAppBrowser", () => {
  it("reconhece o navegador interno do Instagram e do Facebook", () => {
    expect(detectInAppBrowser(nav(UA.iphoneInstagram))).toBe("instagram");
    expect(detectInAppBrowser(nav(UA.androidFacebook))).toBe("facebook");
  });

  it("navegador comum sai como none", () => {
    expect(detectInAppBrowser(nav(UA.iphone))).toBe("none");
    expect(detectInAppBrowser(nav(UA.android))).toBe("none");
    expect(detectInAppBrowser(nav(UA.mac))).toBe("none");
  });
});
