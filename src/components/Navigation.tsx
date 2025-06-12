import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TopNavigationDropdown } from "@/components/ui/top-navigation-dropdown";
import { 
  Home, 
  MessageSquare, 
  BookOpen, 
  Brain,
  TrendingUp, 
  Target, 
  User, 
  Mic, 
  Book, 
  Users, 
  Volume2,
  Shield
} from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/practice", icon: MessageSquare, label: "Practice" },
    { path: "/lessons", icon: BookOpen, label: "Lessons" },
    { path: "/analysis", icon: Brain, label: "AI Analysis" },
    { path: "/progress", icon: TrendingUp, label: "Progress" },
    { path: "/accuracy", icon: Target, label: "Accuracy" },
    { path: "/pronunciation", icon: Mic, label: "Pronunciation" },
    { path: "/vocabulary", icon: Book, label: "Vocabulary" },
    { path: "/classroom", icon: Users, label: "Classroom" },
    { path: "/premium-voice", icon: Volume2, label: "Voice Chat", badge: "Premium" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/compliance", icon: Shield, label: "Compliance" },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/">
                <img
                  className="h-8 w-auto"
                  src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg"
                  alt="Workflow"
                />
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`hover:bg-gray-100 text-gray-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                      location.pathname === item.path
                        ? "bg-gray-200 text-gray-800"
                        : ""
                    }`}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.label}
                    {item.badge && (
                      <Badge variant="secondary" className="ml-1">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <TopNavigationDropdown />
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <Button
              onClick={toggleMenu}
              className="bg-gray-50 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="bg-gray-50 hover:bg-gray-200 text-gray-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              {item.label}
              {item.badge && (
                <Badge variant="secondary" className="ml-1">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="px-5">
            <TopNavigationDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
