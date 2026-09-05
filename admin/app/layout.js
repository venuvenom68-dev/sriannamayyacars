import "./globals.css";

export const metadata = {
  title: "Owner Dashboard | Sri Annamayya Cars",
  description: "Private admin panel for Sri Annamayya Cars.",
  icons: { icon: "/favicon.png" },
  robots: { index: false, follow: false }, // keep the admin out of search engines
};

export const viewport = { themeColor: "#06090f", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
