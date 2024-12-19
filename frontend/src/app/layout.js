import { Inter } from "next/font/google";
import Script from "next/script";

import "./globals.css";
import ClientWalletProvider from "./providers/WalletProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ViralMind.ai",
  description:
    "ViralMind.ai is the first decentralized platform for training and testing computer-use and game-playing AI agents. Users earn rewards by helping AI agents achieve specified goals.",
  openGraph: {
    title: "ViralMind.ai",
    description:
      "ViralMind.ai is the first decentralized platform for training and testing computer-use and game-playing AI agents. Users earn rewards by helping AI agents achieve specified goals.",
    images: [
      {
        url: "https://viralmind.ai/images/stoneLogo.png",
        width: 800,
        height: 800,
        alt: "Jailbreak Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ViralMind.ai",
    description:
      "ViralMind.ai is the first decentralized platform for training and testing computer-use and game-playing AI agents. Users earn rewards by helping AI agents achieve specified goals.",
    images: ["https://viralmind.ai/images/x_og.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          property="og:image"
          content="https://viralmind.ai/images/stoneLogo.png"
        />
        <meta
          name="twitter:image"
          content="https://viralmind.ai/images/x_og.jpg"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="robots" content="index, follow" />

        <link rel="icon" href="./favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="./favicon.ico" />
        <link rel="apple-touch-icon" href="./images/192.png" />
        <link rel="manifest" href="./manifest.json" />
      </head>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=G-TQ5Z1BBEGG`}
      />
      <Script
        id="ga-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TQ5Z1BBEGG', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <body className={inter.className}>
        <ClientWalletProvider>{children}</ClientWalletProvider>
      </body>
    </html>
  );
}
