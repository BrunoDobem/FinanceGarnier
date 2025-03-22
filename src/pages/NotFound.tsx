
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/LanguageProvider";

export default function NotFound() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30 animate-fade-in">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <p className="text-xl mt-4 mb-6">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate("/")}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
