
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Menu, X, Shield, Mic, Home, Headphones } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import LogoutButton from "./auth/LogoutButton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { useIsMobile } from "@/hooks/use-mobile";

// Translation map for navigation items
const navItemTranslations = {
  english: {
    "Text Practice": "Text Practice",
    "Unlimited Voice Practice": "Unlimited Voice Practice",
    "Premium Voice Chat": "Premium Voice Chat",
    "Admin": "Admin",
    "Home": "Home"
  },
  spanish: {
    "Text Practice": "Práctica de Texto",
    "Unlimited Voice Practice": "Práctica de Voz Ilimitada",
    "Premium Voice Chat": "Chat de Voz Premium",
    "Admin": "Admin",
    "Home": "Inicio"
  },
  portuguese: {
    "Text Practice": "Prática de Texto",
    "Unlimited Voice Practice": "Prática de Voz Ilimitada",
    "Premium Voice Chat": "Chat de Voz Premium",
    "Admin": "Admin",
    "Home": "Início"
  },
  korean: {
    "Text Practice": "텍스트 연습",
    "Unlimited Voice Practice": "무제한 음성 연습",
    "Premium Voice Chat": "프리미엄 음성 채팅",
    "Admin": "관리자",
    "Home": "홈"
  },
  arabic: {
    "Text Practice": "تدريب نصي",
    "Unlimited Voice Practice": "تدريب صوتي غير محدود",
    "Premium Voice Chat": "دردشة صوتية متميزة",
    "Admin": "المشرف",
    "Home": "الرئيسية"
  },
  mandarin: {
    "Text Practice": "文本练习",
    "Unlimited Voice Practice": "无限语音练习",
    "Premium Voice Chat": "高级语音聊天",
    "Admin": "管理员",
    "Home": "首页"
  },
  vietnamese: {
    "Text Practice": "Luyện tập văn bản",
    "Unlimited Voice Practice": "Luyện tập giọng nói không giới hạn",
    "Premium Voice Chat": "Trò chuyện bằng giọng nói cao cấp",
    "Admin": "Quản trị viên",
    "Home": "Trang chủ"
  },
  french: {
    "Text Practice": "Pratique de Texte",
    "Unlimited Voice Practice": "Pratique de Voix Illimitée",
    "Premium Voice Chat": "Chat Vocal Premium",
    "Admin": "Administrateur",
    "Home": "Accueil"
  },
  japanese: {
    "Text Practice": "テキスト練習",
    "Unlimited Voice Practice": "無制限音声練習",
    "Premium Voice Chat": "プレミアム音声チャット",
    "Admin": "管理者",
    "Home": "ホーム"
  }
};

const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { currentLanguage, t } = useLocalization();
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const loggedIn = !!data.session;
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAdmin(user?.email?.includes("admin") || false);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsLoggedIn(true);
        const user = session?.user;
        setIsAdmin(user?.email?.includes("admin") || false);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getTranslatedLabel = (label: string) => {
    const translations = navItemTranslations[currentLanguage as keyof typeof navItemTranslations] || navItemTranslations.english;
    return translations[label as keyof typeof translations] || label;
  };

  const navItems = [
    { icon: MessageSquare, label: "Text Practice", path: "/practice" },
    { icon: Mic, label: "Unlimited Voice Practice", path: "/voice-chat" },
    { icon: Headphones, label: "Premium Voice Chat", path: "/premium-voice-chat" },
  ];
  
  if (isAdmin) {
    navItems.push({ icon: Shield, label: "Admin", path: "/admin" });
  }

  if (isMobile) {
    navItems.unshift({ icon: Home, label: "Home", path: "/" });
  }

  return (
    <>
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
            <span className="font-bold text-2xl text-lingua-primary">Palavox</span>
          </Link>
          
          <div className="flex md:flex-col justify-around md:justify-start md:space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const translatedLabel = getTranslatedLabel(item.label);
              
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      isActive ? "bg-lingua-primary hover:bg-lingua-primary/90" : ""
                    }`}
                  >
                    <Icon className="h-5 w-5 md:mr-2" />
                    <span className="hidden md:inline">{translatedLabel}</span>
                  </Button>
                </Link>
              );
            })}
            
            {isLoggedIn && isOpen && (
              <div className="md:hidden mt-4 pt-4 border-t">
                <LogoutButton iconOnly={true} onClose={() => setIsOpen(false)} />
              </div>
            )}
          </div>
          
          {isLoggedIn && (
            <div className="hidden md:block mt-auto pt-4 border-t mt-8">
              <LogoutButton />
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
