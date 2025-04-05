import React from 'react';
import './App.css';
import { PurchaseManager } from './components/PurchaseManager';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "@/providers/ThemeProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { FinanceProvider } from "@/providers/FinanceProvider";

import { Layout } from "@/components/Layout";
import Index from "@/pages/Index";
import Subscriptions from "@/pages/Subscriptions";
import CreditExpenses from "@/pages/CreditExpenses";
import CashExpenses from "@/pages/CashExpenses";
import Income from "@/pages/Income";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const dueDayOfMonth = 10; // Dia de vencimento fixo (10 de cada mês)

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <FinanceProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route element={<Layout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/credit-expenses" element={<CreditExpenses />} />
                    <Route path="/cash-expenses" element={<CashExpenses />} />
                    <Route path="/income" element={<Income />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </FinanceProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
