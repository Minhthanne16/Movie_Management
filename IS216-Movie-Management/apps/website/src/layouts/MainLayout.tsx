import React from "react";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";


interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="max-w-400 mx-auto min-h-screen flex flex-col">
      <Header />
      <main className="grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
