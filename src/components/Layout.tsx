
import { ReactNode } from "react";
import Navigation from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lingua-secondary to-white">
      <div className="flex flex-col md:flex-row min-h-screen">
        <Navigation />
        <main className="flex-1 p-4 md:p-8 mb-16 md:mb-0 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
