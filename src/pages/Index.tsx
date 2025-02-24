
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 max-w-2xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-lingua-text mb-4">
            Welcome to <span className="text-lingua-primary">Lingua.AI</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            Your personal AI-powered language learning companion. Start your journey to fluency today.
          </p>
          <div className="space-x-4">
            <Link to="/lessons">
              <Button size="lg" className="bg-lingua-primary hover:bg-lingua-primary/90">
                Start Learning
              </Button>
            </Link>
            <Link to="/practice">
              <Button size="lg" variant="outline">
                Practice with AI
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
