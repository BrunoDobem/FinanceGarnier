
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar isCollapsed={isCollapsed} />
      
      <main className="flex-1 flex flex-col">
        <div className="hidden md:flex p-1 mx-4 my-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </span>
          </Button>
        </div>
        
        <div
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            isCollapsed ? "md:ml-[70px]" : "md:ml-[240px]",
            "md:ml-0"
          )}
        >
          <div className="container mx-auto p-4 md:p-6 max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
