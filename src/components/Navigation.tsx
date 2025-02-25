
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Book, MessageSquare, LayoutDashboard, Award, BarChart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: Book, label: "Lessons", path: "/lessons" },
    { icon: MessageSquare, label: "Practice", path: "/practice" },
    { icon: Award, label: "Certificates", path: "/certificates" },
    { icon: BarChart, label: "Progress", path: "/progress" },
    { icon: LayoutDashboard, label: "Dashboard", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full md:relative md:w-64 bg-white/80 backdrop-blur-lg border-t md:border-r md:border-t-0 md:h-screen z-50">
      <div className="p-4">
        <Link to="/" className="hidden md:flex items-center space-x-2 mb-8">
          <span className="font-bold text-2xl text-lingua-primary">Lingua.AI</span>
        </Link>
        <div className="flex md:flex-col justify-around md:justify-start md:space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <Icon className="h-5 w-5 mr-2" />
                  <span className="hidden md:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
