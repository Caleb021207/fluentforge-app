
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AuthRequiredState = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/");
  };

  return (
    <div className="text-center py-8">
      <h1 className="text-2xl font-bold mb-4">
        Preview mode
      </h1>
      <p className="mb-6">
        Authentication is temporarily optional while login is being fixed. You can keep using the app and sign in from the home page when needed.
      </p>
      <Button 
        onClick={handleSignIn} 
        className="bg-primary hover:bg-primary/90"
      >
        Go to app
      </Button>
    </div>
  );
};

export default AuthRequiredState;
