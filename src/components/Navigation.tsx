
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Book, MessageSquare, LayoutDashboard, Award, BarChart, Menu, X } from "lucide-react";
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
    <>
      {/* Mobile menu toggle button */}
      <div className="fixed top-0 right-0 z-50 md:hidden p-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-700"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav className={`
        fixed bottom-0 left-0 w-full md:relative md:w-64 
        bg-white/90 backdrop-blur-lg border-t md:border-r md:border-t-0 md:h-screen 
        z-40 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-y-0' : 'md:translate-y-0 translate-y-[calc(100%-4rem)]'}
      `}>
        <div className="p-4">
          <Link 
            to="/" 
            className="hidden md:flex items-center space-x-2 mb-8"
            onClick={() => setIsOpen(false)}
          >
            <span className="font-bold text-2xl text-lingua-primary">Lingua.AI</span>
          </Link>
          
          <div className="flex md:flex-col justify-around md:justify-start md:space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Icon className="h-5 w-5 md:mr-2" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
