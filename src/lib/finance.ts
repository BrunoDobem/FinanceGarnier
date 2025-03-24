import { CreditExpense, Subscription, CashExpense } from "@/types/finance";
import { mockCategories } from "@/lib/mockData";

function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

function formatDateKey(date: Date): string {
  if (!isValidDate(date)) {
    throw new Error('Data inválida');
  }
  return date.toISOString().slice(0, 7); // Formato YYYY-MM
}

export function calculateFutureCreditExpenses(
  creditExpenses: CreditExpense[],
  monthsAhead: number = 12,
  includePastExpenses: boolean = false
) {
  const currentDate = new Date();
  const futureExpenses: { [key: string]: number } = {};
  const currentMonthKey = formatDateKey(currentDate);

  creditExpenses.forEach(expense => {
    try {
      const startDate = new Date(expense.date);
      if (!isValidDate(startDate)) return;

      const monthlyAmount = expense.amount / expense.installments;
      const paidInstallments = expense.paidInstallments || [];
      const unpaidInstallments = expense.unpaidInstallments || [];
      
      // Calcula parcelas restantes considerando tanto pagas quanto não pagas
      const effectivelyPaidInstallments = paidInstallments.filter(
        num => !unpaidInstallments.includes(num)
      ).length;
      
      const remainingInstallments = expense.installments - effectivelyPaidInstallments;

      // Se todas as parcelas estão efetivamente pagas, não incluir nos gastos futuros
      if (remainingInstallments <= 0) return;

      // Calcula em qual parcela estamos atualmente
      const monthsSinceStart = Math.floor(
        (currentDate.getTime() - startDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000)
      );
      const currentInstallment = Math.min(
        Math.max(1, monthsSinceStart + 1),
        expense.installments
      );

      // Para cada mês, verifica se há uma parcela a ser paga
      const startMonth = includePastExpenses ? -monthsAhead : 0;
      for (let i = startMonth; i < monthsAhead; i++) {
        const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
        const monthKey = formatDateKey(monthDate);
        const installmentNumber = currentInstallment + i;

        // Adiciona a parcela se:
        // 1. Está dentro do número total de parcelas E
        // 2. (Não está marcada como paga OU está marcada como não paga) E
        // 3. O mês é o atual ou futuro (se não incluir passado)
        if (
          installmentNumber <= expense.installments && 
          (!paidInstallments.includes(installmentNumber) || 
           unpaidInstallments.includes(installmentNumber)) &&
          (includePastExpenses || monthKey >= currentMonthKey)
        ) {
          futureExpenses[monthKey] = (futureExpenses[monthKey] || 0) + monthlyAmount;
        }
      }
    } catch (error) {
      console.error('Erro ao processar despesa de crédito:', error);
    }
  });

  return futureExpenses;
}

export function calculateSubscriptionExpenses(
  subscriptions: Subscription[],
  monthsAhead: number = 12,
  includePastExpenses: boolean = false
) {
  const currentDate = new Date();
  const currentMonthKey = formatDateKey(currentDate);
  const futureExpenses: { [key: string]: number } = {};

  subscriptions.forEach(subscription => {
    try {
      const startDate = new Date(subscription.date);
      if (!isValidDate(startDate)) return;

      // Se a assinatura é recorrente, calcular para todos os meses
      if (subscription.recurring) {
        const startMonth = includePastExpenses ? -monthsAhead : 0;
        for (let i = startMonth; i < monthsAhead; i++) {
          const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
          const monthKey = formatDateKey(monthDate);
          
          // Só adiciona se a data do mês é maior ou igual à data de início da assinatura
          // e é o mês atual ou futuro (se não incluir passado)
          if (monthDate >= startDate && (includePastExpenses || monthKey >= currentMonthKey)) {
            futureExpenses[monthKey] = (futureExpenses[monthKey] || 0) + subscription.amount;
          }
        }
      } else {
        // Se não é recorrente, adiciona apenas no mês específico
        const monthKey = formatDateKey(startDate);
        const startMonthKey = formatDateKey(startDate);
        if (includePastExpenses || startMonthKey >= currentMonthKey) {
          futureExpenses[monthKey] = (futureExpenses[monthKey] || 0) + subscription.amount;
        }
      }
    } catch (error) {
      console.error('Erro ao processar assinatura:', error);
    }
  });

  return futureExpenses;
}

export function calculateCashExpenses(
  cashExpenses: CashExpense[],
  monthsAhead: number = 12,
  includePastExpenses: boolean = false
) {
  const currentDate = new Date();
  const currentMonthKey = formatDateKey(currentDate);
  const futureExpenses: { [key: string]: number } = {};

  // Agrupa os gastos em dinheiro por mês
  cashExpenses.forEach(expense => {
    try {
      const expenseDate = new Date(expense.date);
      if (!isValidDate(expenseDate)) return;

      const monthKey = formatDateKey(expenseDate);
      
      // Inclui o gasto se:
      // 1. Estamos incluindo gastos passados OU
      // 2. É um gasto do mês atual ou futuro
      if (includePastExpenses || monthKey >= currentMonthKey) {
        futureExpenses[monthKey] = (futureExpenses[monthKey] || 0) + expense.amount;
      }
    } catch (error) {
      console.error('Erro ao processar gasto em dinheiro:', error);
    }
  });

  return futureExpenses;
}

export function generateMonthlyData(
  income: number,
  creditExpenses: { [key: string]: number },
  subscriptionExpenses: { [key: string]: number },
  cashExpenses: { [key: string]: number },
  monthsAhead: number = 12
) {
  const currentDate = new Date();
  const monthlyData = [];

  // Calcula o número de meses para trás e para frente
  const monthsBack = Math.floor(monthsAhead / 2);
  const monthsForward = monthsAhead - monthsBack;

  // Gera dados para os meses passados e futuros
  for (let i = -monthsBack; i < monthsForward; i++) {
    try {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthKey = formatDateKey(monthDate);
      
      const creditExpenseAmount = creditExpenses[monthKey] || 0;
      const subscriptionExpenseAmount = subscriptionExpenses[monthKey] || 0;
      const cashExpenseAmount = cashExpenses[monthKey] || 0;
      const totalExpenses = creditExpenseAmount + subscriptionExpenseAmount + cashExpenseAmount;

      monthlyData.push({
        name: monthDate.toLocaleString('pt-BR', { month: 'short' }),
        month: monthKey,
        income,
        creditExpenses: creditExpenseAmount,
        subscriptionExpenses: subscriptionExpenseAmount,
        cashExpenses: cashExpenseAmount,
        totalExpenses,
        balance: income - totalExpenses
      });
    } catch (error) {
      console.error('Erro ao gerar dados mensais:', error);
    }
  }

  // Ordena os dados por data
  monthlyData.sort((a, b) => a.month.localeCompare(b.month));

  return monthlyData;
}

export function calculateFinancialMetrics(
  income: number,
  creditExpenses: { [key: string]: number },
  subscriptionExpenses: { [key: string]: number },
  cashExpenses: { [key: string]: number }
) {
  try {
    const currentMonth = formatDateKey(new Date());
    
    // Calcula os gastos do mês atual
    const currentCreditExpenses = creditExpenses[currentMonth] || 0;
    const currentSubscriptionExpenses = subscriptionExpenses[currentMonth] || 0;
    const currentCashExpenses = cashExpenses[currentMonth] || 0;
    const totalCurrentExpenses = currentCreditExpenses + currentSubscriptionExpenses + currentCashExpenses;

    // Calcula a média de gastos considerando apenas meses com gastos
    const creditExpensesValues = Object.values(creditExpenses).filter(value => value > 0);
    const subscriptionExpensesValues = Object.values(subscriptionExpenses).filter(value => value > 0);
    const cashExpensesValues = Object.values(cashExpenses).filter(value => value > 0);
    
    const averageCreditExpenses = creditExpensesValues.length > 0 
      ? creditExpensesValues.reduce((a, b) => a + b, 0) / creditExpensesValues.length 
      : 0;
    
    const averageSubscriptionExpenses = subscriptionExpensesValues.length > 0
      ? subscriptionExpensesValues.reduce((a, b) => a + b, 0) / subscriptionExpensesValues.length
      : 0;

    const averageCashExpenses = cashExpensesValues.length > 0
      ? cashExpensesValues.reduce((a, b) => a + b, 0) / cashExpensesValues.length
      : 0;

    const averageMonthlyExpenses = averageCreditExpenses + averageSubscriptionExpenses + averageCashExpenses;

    return {
      currentMonthExpenses: totalCurrentExpenses,
      currentMonthBalance: income - totalCurrentExpenses,
      savingsRate: income > 0 ? ((income - totalCurrentExpenses) / income) * 100 : 0,
      expenseToIncomeRatio: income > 0 ? (totalCurrentExpenses / income) * 100 : 0,
      averageMonthlyExpenses,
      // Adiciona detalhamento dos gastos atuais
      currentMonthDetails: {
        creditExpenses: currentCreditExpenses,
        subscriptionExpenses: currentSubscriptionExpenses,
        cashExpenses: currentCashExpenses
      }
    };
  } catch (error) {
    console.error('Erro ao calcular métricas financeiras:', error);
    return {
      currentMonthExpenses: 0,
      currentMonthBalance: income,
      savingsRate: 100,
      expenseToIncomeRatio: 0,
      averageMonthlyExpenses: 0,
      currentMonthDetails: {
        creditExpenses: 0,
        subscriptionExpenses: 0,
        cashExpenses: 0
      }
    };
  }
}

export function analyzeExpensesByCard(expenses: Array<CreditExpense | Subscription | CashExpense>) {
  const expensesByCard: { [key: string]: number } = {
    'Cartão Principal': 0,
    'Outros': 0
  };

  expenses.forEach(expense => {
    if ('installments' in expense) {
      if (expense.creditCardId) {
        expensesByCard[expense.creditCardId] = (expensesByCard[expense.creditCardId] || 0) + expense.amount;
      } else {
        expensesByCard['Cartão Principal'] += expense.amount;
      }
    }
  });

  // Remove cartões sem gastos
  Object.keys(expensesByCard).forEach(key => {
    if (expensesByCard[key] === 0) {
      delete expensesByCard[key];
    }
  });

  return expensesByCard;
}

export function analyzeExpensesByPaymentMethod(expenses: Array<CreditExpense | Subscription | CashExpense>) {
  const expensesByMethod: { [key: string]: number } = {
    'Cartão de Crédito': 0,
    'Dinheiro': 0,
    'Assinatura': 0
  };

  expenses.forEach(expense => {
    if ('installments' in expense) {
      expensesByMethod['Cartão de Crédito'] += expense.amount;
    } else if ('recurring' in expense) {
      expensesByMethod['Assinatura'] += expense.amount;
    } else {
      expensesByMethod['Dinheiro'] += expense.amount;
    }
  });

  // Remove métodos sem gastos
  Object.keys(expensesByMethod).forEach(key => {
    if (expensesByMethod[key] === 0) {
      delete expensesByMethod[key];
    }
  });

  return expensesByMethod;
}

export function analyzeExpensesByCategory(expenses: Array<CreditExpense | Subscription | CashExpense>) {
  const expensesByCategory: { [key: string]: number } = {};
  const categoryMap = new Map(mockCategories.map(cat => [cat.id, cat.name]));

  expenses.forEach(expense => {
    if (expense.category) {
      const categoryName = categoryMap.get(expense.category) || 'Outros';
      expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + expense.amount;
    } else {
      expensesByCategory['Outros'] = (expensesByCategory['Outros'] || 0) + expense.amount;
    }
  });

  return expensesByCategory;
} 