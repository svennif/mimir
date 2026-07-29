import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { db } from "../db";
import { Sidebar } from "../components/Sidebar";
import { Metadata } from "next";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: 'Mirmir',
  description: 'Notetaking app for Sven Ingar Frantzen',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tree = await db.query.pages.findMany({
    where: { parentId: { isNull: true }, deletedAt: { isNull: true } },
    orderBy: { position: "asc" },
    with: {
      children: {
        where: { deletedAt: { isNull: true } },
        orderBy: { position: "asc" },
      },
    },
  });

  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body className="flex size-full items-start bg-canvas font-sans text-ink antialiased">
        <Sidebar tree={tree} />
        <div className="flex h-full min-w-0 flex-1 flex-col items-start overflow-clip pt-3.5 pr-4 pb-4 pl-1">
          {children}
        </div>
      </body>
    </html>
  );
}