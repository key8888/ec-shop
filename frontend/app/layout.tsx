import type { Metadata } from "next";
import { AuthProvider } from "@/features/auth/AuthContext";
import { CartProvider } from "@/features/cart/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "星野のペット用品",
  description: "ペット用品のオンラインショップ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main style={{ flex: 1, padding: "2rem", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
