
import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "@/components/Layout";

// Lazy-loaded page components
const Index = lazy(() => import("@/pages/Index"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Practice = lazy(() => import("@/pages/Practice"));
const Progress = lazy(() => import("@/pages/Progress"));
const VoiceChat = lazy(() => import("@/pages/VoiceChat"));
const Profile = lazy(() => import("@/pages/Profile"));
const Lessons = lazy(() => import("@/pages/Lessons"));
const ExampleData = lazy(() => import("@/pages/ExampleData"));
const SafetyPolicy = lazy(() => import("@/pages/SafetyPolicy"));
const Settings = lazy(() => import("@/pages/Settings"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const ReadingCertification = lazy(() => import("@/pages/ReadingCertification"));
const WritingCertification = lazy(() => import("@/pages/WritingCertification"));
const Certificates = lazy(() => import("@/pages/Certificates"));
const PremiumVoiceChat = lazy(() => import("@/pages/PremiumVoiceChat"));
const TestTiers = lazy(() => import("@/pages/TestTiers")); // Add the new page

// Create router with routes
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "practice",
        element: <Practice />,
      },
      {
        path: "progress",
        element: <Progress />,
      },
      {
        path: "voice-chat",
        element: <VoiceChat />,
      },
      {
        path: "premium-voice-chat",
        element: <PremiumVoiceChat />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "lessons",
        element: <Lessons />,
      },
      {
        path: "reading-certification",
        element: <ReadingCertification />,
      },
      {
        path: "writing-certification",
        element: <WritingCertification />,
      },
      {
        path: "certificates",
        element: <Certificates />,
      },
      {
        path: "example-data",
        element: <ExampleData />,
      },
      {
        path: "safety-policy",
        element: <SafetyPolicy />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "admin",
        element: <AdminDashboard />,
      },
      {
        path: "test-tiers", // Add the new route
        element: <TestTiers />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
