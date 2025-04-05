
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelect } from "@/components/LanguageSelect";
import { useLanguage } from "@/providers/LanguageProvider";

export default function Login() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Login successful",
        description: "Welcome back to GarnierFinance",
      });
      navigate("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSelect />
      </div>
      
      <div className="w-full max-w-md animate-slide-in">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-primary">
            Garnier<span className="text-foreground">Finance</span>
          </h1>
          <p className="text-muted-foreground">{t("welcome")}</p>
        </div>
        
        <Card className="border-border/50 shadow-lg transition-all hover:shadow-xl">
          <CardHeader>
            <CardTitle>{t("login")}</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-all"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("password")}</Label>
                  <Button type="button" variant="link" className="p-0 h-auto text-xs">
                    {t("forgot_password")}
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="transition-all"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full transition-all" disabled={isLoading}>
                {isLoading ? "Loading..." : t("sign_in")}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
