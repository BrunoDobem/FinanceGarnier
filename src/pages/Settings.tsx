import { useState } from "react";
import { CheckCircle2, GlobeIcon, Moon, PlusCircle, Sun, Trash2, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "@/providers/ThemeProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { useToast } from "@/components/ui/use-toast";
import { LanguageSelect } from "@/components/LanguageSelect";
import { ThemeToggle } from "@/components/ThemeToggle";
import { type Language } from "@/translations";
import { CategoryManager } from "@/components/CategoryManager";
import { CreditCardManager } from "@/components/CreditCardManager";

const languageNames: Record<Language, string> = {
  "pt-BR": "Português (Brasil)",
  "en-US": "English (US)",
  "es-ES": "Español",
  "fr-FR": "Français",
  "de-DE": "Deutsch"
};

const currencies = [
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [currency, setCurrency] = useState("BRL");

  const handleExportData = () => {
    toast({
      title: "Data exported",
      description: "Your financial data has been exported",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion requested",
      description: "Your account deletion request has been submitted",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t("settings")}</h1>
        <p className="text-muted-foreground">
          {t("manage_settings")}
        </p>
      </div>

      <div className="grid gap-8">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              <span>{t("user_preferences")}</span>
            </CardTitle>
            <CardDescription>
              {t("configure_appearance")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="language">{t("language")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("select_language")}
                </p>
              </div>
              <RadioGroup
                value={language}
                onValueChange={(value) => setLanguage(value as Language)}
                className="grid grid-cols-1 md:grid-cols-2 gap-2"
              >
                {Object.entries(languageNames).map(([code, name]) => (
                  <div
                    key={code}
                    className="flex items-center space-x-2 rounded-md border p-3 hover:bg-accent transition-colors"
                  >
                    <RadioGroupItem value={code} id={`language-${code}`} />
                    <Label htmlFor={`language-${code}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <GlobeIcon className="h-4 w-4 text-muted-foreground" />
                        {name}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="theme">{t("theme")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("choose_theme")}
                </p>
              </div>
              <RadioGroup
                value={theme}
                onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
                className="grid grid-cols-1 md:grid-cols-3 gap-2"
              >
                <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-accent transition-colors">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-muted-foreground" />
                      {t("light")}
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-accent transition-colors">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-muted-foreground" />
                      {t("dark")}
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-accent transition-colors">
                  <RadioGroupItem value="system" id="theme-system" />
                  <Label htmlFor="theme-system" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="relative">
                        <Sun className="h-4 w-4 text-muted-foreground" />
                        <Moon className="absolute h-4 w-4 text-muted-foreground -top-0.5 -right-0.5 opacity-30" />
                      </span>
                      {t("system")}
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="currency">{t("currency")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("set_currency")}
                </p>
              </div>
              <RadioGroup
                value={currency}
                onValueChange={setCurrency}
                className="grid grid-cols-1 md:grid-cols-2 gap-2"
              >
                {currencies.map((curr) => (
                  <div
                    key={curr.code}
                    className="flex items-center space-x-2 rounded-md border p-3 hover:bg-accent transition-colors"
                  >
                    <RadioGroupItem value={curr.code} id={`currency-${curr.code}`} />
                    <Label htmlFor={`currency-${curr.code}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{curr.symbol}</span>
                        {curr.name}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 md:grid-cols-2">
          <CategoryManager />
          <CreditCardManager />
        </div>
      </div>
    </div>
  );
}
