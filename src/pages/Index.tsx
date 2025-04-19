import React from 'react';
import DownloadCopyrightDeposit from '@/components/copyright/DownloadCopyrightDeposit';
import { Button } from "@/components/ui/button"
import { CalendarDays, Rocket } from "lucide-react"
import { Link } from "react-router-dom"

const Index = () => {
  return (
    <div className="container mx-auto py-8">
      <DownloadCopyrightDeposit />
      <h1 className="text-3xl font-bold mb-4">Welcome to Palavox</h1>
      <p className="text-gray-600 mb-6">
        Your personal AI language learning companion. Start your journey to fluency today.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/practice" className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
          <div className="flex items-center mb-4">
            <Rocket className="text-blue-500 mr-2" size={20} />
            <h2 className="text-xl font-semibold">Practice with AI</h2>
          </div>
          <p className="text-gray-500">Engage in interactive conversations and improve your language skills.</p>
        </Link>

        <Link to="/language-selection" className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
          <div className="flex items-center mb-4">
            <CalendarDays className="text-green-500 mr-2" size={20} />
            <h2 className="text-xl font-semibold">Set Learning Goals</h2>
          </div>
          <p className="text-gray-500">Define your learning objectives and track your progress.</p>
        </Link>

        <Link to="/voice-chat" className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
          <div className="flex items-center mb-4">
            {/* You can replace FileText with a more appropriate icon */}
            <CalendarDays className="text-green-500 mr-2" size={20} />
            <h2 className="text-xl font-semibold">Voice Chat</h2>
          </div>
          <p className="text-gray-500">Have real-time voice conversations with AI.</p>
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-3">Get Started</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <Button asChild variant="outline">
            <Link to="/language-selection">Choose Languages</Link>
          </Button>
          <Button asChild>
            <Link to="/practice">Start Practicing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
