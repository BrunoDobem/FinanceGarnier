import { 
  BarChart4, 
  CreditCard, 
  DollarSign, 
  Home,
  LogIn,
  LogOut,
  PlusCircle,
  Settings, 
  Calendar, 
  Menu, 
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelect } from "@/components/LanguageSelect";
import { useLanguage } from "@/providers/LanguageProvider";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean;
}

export function AppSidebar({ isCollapsed, className }: SidebarProps) {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navItems = [
    {
      icon: Home,
      label: t("dashboard"),
      href: "/",
    },
    {
      icon: Calendar,
      label: t("subscriptions"),
      href: "/subscriptions",
    },
    {
      icon: CreditCard,
      label: t("credit_expenses"),
      href: "/credit-expenses",
    },
    {
      icon: DollarSign,
      label: t("cash_expenses"),
      href: "/cash-expenses",
    },
    {
      icon: PlusCircle,
      label: t("income"),
      href: "/income",
    },
    {
      icon: BarChart4,
      label: t("dashboard"),
      href: "/dashboard",
    },
    {
      icon: Settings,
      label: t("settings"),
      href: "/settings",
    },
    {
      icon: LogIn,
      label: t("login"),
      href: "/login",
    },
  ];

  const SidebarContent = (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="py-2 md:py-4">
        <div className="px-2 md:px-3 py-2">
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
            {!isCollapsed && (
              <Link to="/" className="flex items-center gap-2 font-semibold text-lg md:text-xl animate-fade-in">
                <span className="text-primary">Garnier</span>
                <span>Finance</span>
              </Link>
            )}
            {isCollapsed && (
              <Link to="/" className="flex items-center justify-center">
                <span className="text-primary font-bold text-xl">G</span>
              </Link>
            )}
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2 md:px-3 py-2 text-sm transition-all hover:text-primary",
                isActive(item.href)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground",
                isCollapsed && "justify-center"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <item.icon className={cn("h-4 w-4 md:h-5 md:w-5", isActive(item.href) ? "text-primary" : "text-muted-foreground")} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto p-2 md:p-4 border-t border-border/40">
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between gap-2")}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSelect />
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            className={cn("h-8 w-8 md:h-9 md:w-9 rounded-full", isCollapsed && "mt-2 md:mt-4")}
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden border-r border-border/40 bg-background h-screen sticky top-0 z-30 md:flex md:flex-col transition-all duration-300",
          isCollapsed ? "w-[70px]" : "w-[240px]"
        )}
      >
        {SidebarContent}
      </aside>

      {/* Mobile sidebar (sheet) */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px]">
          {SidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
}
