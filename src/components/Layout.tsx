
import { ReactNode } from "react";
import Navigation from "./Navigation";
import { Routes, Route } from "react-router-dom";
import Index from "../pages/Index";
import NotFound from "../pages/NotFound";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lingua-secondary to-white">
      <div className="flex flex-col md:flex-row min-h-screen">
        <Navigation />
        <main className="flex-1 p-4 md:p-8 mb-16 md:mb-0 md:ml-64">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Layout;
