import "./globals.css";
import { Providers } from "./providers";
import { Lexend } from 'next/font/google';

const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className={lexend.variable}>
      <head>
        <meta name="facebook-domain-verification" content="ejc4341iemcbhtlk85ih0f6fxxxf7b" />
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
        <link rel="preload" href="/agendabela-logo.png" as="image" type="image/png" />
        <link rel="preload" href="/gif-agendamento.gif" as="image" type="image/gif" />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TSM8GGL6"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
