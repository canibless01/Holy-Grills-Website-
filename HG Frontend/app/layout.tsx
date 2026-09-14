import type { Metadata } from "next";
import "../src/index.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Holy Grills",
  description: "Holy Grills food ordering app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
