import "./globals.css";

export const metadata = {
  title: "Sri Annamayya Cars | Used Cars in Madanapalle, Annamayya District, A.P.",
  description:
    "Sri Annamayya Cars — all types of pre-owned cars, buying and selling. Opp. Royal Arabia Restaurant, New By-Pass Punganur Road, Madanapalle 517325, Annamayya District, A.P. Call 94417 75216.",
  icons: { icon: "/favicon.png" },
};

export const viewport = { themeColor: "#060a14", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
