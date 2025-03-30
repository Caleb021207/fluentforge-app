
import { ReactNode } from "react";
import Navigation from "./Navigation";
import { useNavigate, Routes, Route } from "react-router-dom";
import Index from "../pages/Index";
import NotFound from "../pages/NotFound";
import PlacementQuiz from "../pages/PlacementQuiz";
import Practice from "../pages/Practice";
import Certificates from "../pages/Certificates";
import ProgressPage from "../pages/Progress";
import ProfilePage from "../pages/Profile";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import LogoutButton from "./auth/LogoutButton";
import LanguageAvailabilityBanner from "./LanguageAvailabilityBanner";
import { useLocalization } from "@/context/LocalizationContext";
import { useAuth } from "@/context/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentLanguage } = useLocalization();

  return (
    <div className="min-h-screen bg-gradient-to-br from-lingua-secondary to-white overflow-x-hidden w-full">
      {user && (
        <div className="w-full bg-white border-b py-2 px-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="flex items-center">
            <span className="text-xs sm:text-sm text-gray-600 mr-1 sm:mr-2">
              {currentLanguage === "spanish" ? "Conectado como:" : "Signed in as:"}
            </span>
            <span className="font-medium text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">{user.email}</span>
          </div>
          <LogoutButton />
        </div>
      )}

      <div className="flex flex-col md:flex-row min-h-screen">
        <Navigation />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 mb-16 md:mb-0 md:ml-64 overflow-x-hidden w-full">
          <div className="max-w-full">
            {/* Add Language Availability Banner that will show on all pages except the home page */}
            {window.location.pathname !== "/" && <LanguageAvailabilityBanner />}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
