import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  format, 
  isValid, 
  parse, 
  addMonths, 
  getDaysInMonth, 
  differenceInDays,
  isBefore,
  isAfter,
  setDate,
  type Locale 
} from "date-fns";
import { ptBR, enUS, es, fr, de } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function v4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function formatCurrency(
  amount: number,
  locale: string = "pt-BR",
  currency: string = "BRL"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatDate(
  date: string | Date,
  formatStr: string = "dd/MM/yyyy",
  locale: string = "pt-BR"
): string {
  const localeMap: Record<string, Locale> = {
    "pt-BR": ptBR,
    "en-US": enUS,
    "es-ES": es,
    "fr-FR": fr,
    "de-DE": de,
  };

  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (!isValid(dateObj)) {
    return "Data inválida";
  }

  return format(dateObj, formatStr, {
    locale: localeMap[locale] || ptBR,
  });
}

export function parseDate(
  dateStr: string,
  formatStr: string = "dd/MM/yyyy",
  locale: string = "pt-BR"
): Date {
  const localeMap: Record<string, Locale> = {
    "pt-BR": ptBR,
    "en-US": enUS,
    "es-ES": es,
    "fr-FR": fr,
    "de-DE": de,
  };

  return parse(dateStr, formatStr, new Date(), {
    locale: localeMap[locale] || ptBR,
  });
}

export function isDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  
  const rootEl = window.document.documentElement;
  return rootEl.classList.contains("dark");
}

export function getMonthName(
  date: Date | string,
  locale: string = "pt-BR"
): string {
  const localeMap: Record<string, Locale> = {
    "pt-BR": ptBR,
    "en-US": enUS,
    "es-ES": es,
    "fr-FR": fr,
    "de-DE": de,
  };

  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (!isValid(dateObj)) {
    return "Mês inválido";
  }

  return format(dateObj, "MMMM", {
    locale: localeMap[locale] || ptBR,
  });
}

export function getTransitionClasses(index: number = 0): string {
  return cn(
    "transition-all duration-300 ease-in-out",
    `animation-delay-${(index % 5) * 100}`
  );
}

export function calculateBillingDates(closingDay: number, dueDay: number, referenceDate: Date = new Date()) {
  const currentMonth = referenceDate.getMonth();
  const currentYear = referenceDate.getFullYear();
  const currentDay = referenceDate.getDate();
  
  let currentClosingDate = new Date(currentYear, currentMonth, closingDay);
  
  const daysInCurrentMonth = getDaysInMonth(currentClosingDate);
  if (closingDay > daysInCurrentMonth) {
    currentClosingDate = new Date(currentYear, currentMonth, daysInCurrentMonth);
  }
  
  let activeClosingDate = currentClosingDate;
  if (currentDay > closingDay) {
    activeClosingDate = addMonths(currentClosingDate, 1);
  }
  
  const activeMonth = activeClosingDate.getMonth();
  const activeYear = activeClosingDate.getFullYear();
  
  let activeDueDate;
  if (dueDay < closingDay) {
    activeDueDate = new Date(activeYear, activeMonth + 1, dueDay);
  } else {
    activeDueDate = new Date(activeYear, activeMonth, dueDay);
  }
  
  const daysInDueMonth = getDaysInMonth(activeDueDate);
  if (dueDay > daysInDueMonth) {
    activeDueDate = new Date(activeDueDate.getFullYear(), activeDueDate.getMonth(), daysInDueMonth);
  }
  
  const previousClosingDate = addMonths(activeClosingDate, -1);
  
  const currentPeriodStart = new Date(previousClosingDate);
  currentPeriodStart.setDate(previousClosingDate.getDate() + 1);
  const currentPeriodEnd = new Date(activeClosingDate);
  
  const nextPeriodStart = new Date(activeClosingDate);
  nextPeriodStart.setDate(activeClosingDate.getDate() + 1);
  const nextPeriodEnd = addMonths(activeClosingDate, 1);
  
  const totalDaysInCycle = differenceInDays(activeClosingDate, previousClosingDate);
  const daysElapsed = differenceInDays(referenceDate, previousClosingDate);
  const cycleProgress = Math.max(0, Math.min(100, (daysElapsed / totalDaysInCycle) * 100));
  
  return {
    closingDate: activeClosingDate,
    dueDate: activeDueDate,
    previousClosingDate,
    currentPeriod: {
      start: currentPeriodStart,
      end: currentPeriodEnd
    },
    nextPeriod: {
      start: nextPeriodStart,
      end: nextPeriodEnd
    },
    cycleProgress
  };
}

export function isInCurrentBillingCycle(purchaseDate: Date | string, closingDay: number) {
  const date = typeof purchaseDate === 'string' ? new Date(purchaseDate) : purchaseDate;
  const { currentPeriod } = calculateBillingDates(closingDay, 1); // dueDay not relevant here
  
  return !isBefore(date, currentPeriod.start) && !isAfter(date, currentPeriod.end);
}

export function getBillingCycleForPurchase(purchaseDate: Date | string, closingDay: number, dueDay: number) {
  const date = typeof purchaseDate === 'string' ? new Date(purchaseDate) : purchaseDate;
  const purchaseDay = date.getDate();
  const purchaseMonth = date.getMonth();
  const purchaseYear = date.getFullYear();
  
  let relevantClosingDate = new Date(purchaseYear, purchaseMonth, closingDay);
  
  const daysInMonth = getDaysInMonth(relevantClosingDate);
  if (closingDay > daysInMonth) {
    relevantClosingDate = new Date(purchaseYear, purchaseMonth, daysInMonth);
  }
  
  if (purchaseDay > closingDay) {
    relevantClosingDate = addMonths(relevantClosingDate, 1);
  }
  
  let relevantDueDate;
  if (dueDay < closingDay) {
    relevantDueDate = new Date(relevantClosingDate.getFullYear(), relevantClosingDate.getMonth() + 1, dueDay);
  } else {
    relevantDueDate = new Date(relevantClosingDate.getFullYear(), relevantClosingDate.getMonth(), dueDay);
  }
  
  const daysInDueMonth = getDaysInMonth(relevantDueDate);
  if (dueDay > daysInDueMonth) {
    relevantDueDate = new Date(relevantDueDate.getFullYear(), relevantDueDate.getMonth(), daysInDueMonth);
  }
  
  const billingMonthDate = relevantDueDate;
  
  return {
    closingDate: relevantClosingDate,
    dueDate: relevantDueDate,
    billingMonth: billingMonthDate.getMonth(),
    billingYear: billingMonthDate.getFullYear(),
    billingMonthName: format(billingMonthDate, 'MMMM yyyy')
  };
}

export function monthsBetweenDates(startDate: Date, endDate: Date): number {
  return (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
         (endDate.getMonth() - startDate.getMonth());
}

export function getInstallmentBillingMonths(
  purchaseDate: Date | string, 
  installments: number, 
  closingDay: number, 
  dueDay: number
): Array<{ month: number; year: number; monthName: string }> {
  const date = typeof purchaseDate === 'string' ? new Date(purchaseDate) : purchaseDate;
  const { billingMonth, billingYear } = getBillingCycleForPurchase(date, closingDay, dueDay);
  
  const result = [];
  for (let i = 0; i < installments; i++) {
    const installmentDate = new Date(billingYear, billingMonth + i, 1);
    result.push({
      month: installmentDate.getMonth(),
      year: installmentDate.getFullYear(),
      monthName: format(installmentDate, 'MMMM yyyy')
    });
  }
  
  return result;
}
