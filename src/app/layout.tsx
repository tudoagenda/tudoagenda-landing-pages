import "./globals.css";
import { Providers } from "./providers";
import type { Metadata } from "next";
import localFont from "next/font/local";

const defante = localFont({
  src: "./fonts/defante.otf",
  display: "swap",
  variable: "--font-defante",
});

const aguilar = localFont({
  src: "./fonts/aguilar-playful-display.woff2",
  display: "swap",
  variable: "--font-aguilar",
});

const siteUrl = "https://tudoagenda.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tudo Agenda | SaaS verticais com agentes para pequenos negócios",
    template: "%s | Tudo Agenda",
  },
  description:
    "A Tudo Agenda cria SaaS verticais com agentes digitais para pequenos negócios venderem mais, organizarem a operação e reduzirem trabalho manual.",
  applicationName: "Tudo Agenda",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Tudo Agenda",
    title: "Tudo Agenda | SaaS verticais com agentes para pequenos negócios",
    description:
      "Soluções para pequenos negócios que precisam vender mais, organizar a operação e liberar tempo do trabalho manual.",
    images: [
      {
        url: "/brand/tudo-agenda/favicon.png",
        width: 512,
        height: 512,
        alt: "Tudo Agenda",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Tudo Agenda | SaaS verticais com agentes para pequenos negócios",
    description:
      "SaaS verticais com agentes digitais para pequenos negócios.",
    images: ["/brand/tudo-agenda/favicon.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      className={`${defante.variable} ${aguilar.variable}`}
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
