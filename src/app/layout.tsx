import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import { auth0 } from "@/lib/auth0";
import { AuthSync } from "@/components/auth/AuthSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ŽIŽCON",
  description: "Festival deskovek na Zizkově",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth0.getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <Auth0Provider user={session?.user}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <AuthSync />
            <main className="flex-1 w-full mx-auto py-8 flex flex-col gap-16">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}
