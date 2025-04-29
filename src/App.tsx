
import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet
} from "react-router-dom";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import Practice from "@/pages/Practice";
import VoiceChat from "@/pages/VoiceChat";
import PremiumVoiceChat from "@/pages/PremiumVoiceChat";
import Progress from "@/pages/Progress";
import Profile from "@/pages/Profile";
import Certificates from "@/pages/Certificates";
import NotFound from "@/pages/NotFound";
import SafetyPolicy from "@/pages/SafetyPolicy";
import TeacherClasses from "@/pages/TeacherClasses";
import StudentClass from "@/pages/StudentClass";
import Settings from "@/pages/Settings";
import { LocalizationProvider } from "@/context/LocalizationContext";

function App() {
  return (
    <LocalizationProvider>
      <RouterProvider
        router={createBrowserRouter([
          {
            path: "/",
            element: <Layout><Outlet /></Layout>,
            errorElement: <NotFound />,
            children: [
              { index: true, element: <Index /> },
              { path: "practice", element: <Practice /> },
              { path: "voice-chat", element: <VoiceChat /> },
              { path: "premium-voice-chat", element: <PremiumVoiceChat /> },
              { path: "progress", element: <Progress /> },
              { path: "profile", element: <Profile /> },
              { path: "certificates", element: <Certificates /> },
              { path: "safety-policy", element: <SafetyPolicy /> },
              { path: "teacher/classes", element: <TeacherClasses /> },
              { path: "student/class", element: <StudentClass /> },
              { path: "settings", element: <Settings /> }
            ],
          },
        ])}
      />
    </LocalizationProvider>
  );
}

export default App;
