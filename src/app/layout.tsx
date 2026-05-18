import "./globals.css";
import { Providers } from "./providers";
import { Fraunces, Inter, Space_Mono } from "next/font/google";

// Tipografia idêntica ao agendabela-mobile-app:
//   - Fraunces (stand-in para Defante) — display italic em headlines
//   - Inter — texto corpo
//   - Space Mono — eyebrows uppercase letter-spaced
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-mono",
  weight: ["400"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      className={`${fraunces.variable} ${inter.variable} ${spaceMono.variable}`}
    >
      <head>
        <meta name="facebook-domain-verification" content="ejc4341iemcbhtlk85ih0f6fxxxf7b" />
        <meta name="google-site-verification" content="DMHYDDq3HYq2eCbpCQsLPYTVWX5Svmrbdh0a0thP9Qc" />
        {/* Google Tag Manager — must be as high as possible in <head> for proper detection by Search Console, Tag Assistant, etc. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TSM8GGL6');`,
          }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TSM8GGL6"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
