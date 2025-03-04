import "@styles/globals.css";
import "./styles.module.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import NavBar from "@comps/NavBar";
import { AuthProvider } from '@/contexts/AuthContext';
import AuthDebug from '@/components/AuthDebug';

//import AuthProvider from '~/lib/hooks/AuthProvider';

export const metadata: Metadata = {
  title: "Dealer's Choice Poker",
  description: "The only place to play poker your way.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }
  : Readonly<{ children: React.ReactNode }>) {

    return (
      <html lang="en" className={`${GeistSans.variable}`}>
        <body>
          <AuthProvider>
            <NavBar />
            {children}
            {/* Temporary debug component - remove before production */}
            <AuthDebug />
          </AuthProvider>
        </body>
        
      </html>
    );
}
