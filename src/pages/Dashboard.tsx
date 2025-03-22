
import { useState } from "react";
import { BarChart, BarChart3, DollarSign, LineChart, PieChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinance } from "@/providers/FinanceProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { formatCurrency } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
} from "recharts";

export default function Dashboard() {
  const { t, language } = useLanguage();
  const finance = useFinance();
  const [duration, setDuration] = useState<"monthly" | "yearly">("monthly");

  // Calculate totals
  const totalSubscriptions = finance.subscriptions.reduce(
    (total, sub) => total + sub.amount,
    0
  );
  
  const totalCreditExpenses = finance.creditExpenses.reduce(
    (total, expense) => total + expense.amount / expense.installments,
    0
  );
  
  const totalCashExpenses = finance.cashExpenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );
  
  const totalIncome = finance.incomes.reduce(
    (total, income) => total + income.amount,
    0
  );
  
  const totalExpenses = totalSubscriptions + totalCreditExpenses + totalCashExpenses;
  
  // Expense breakdown data for pie chart
  const expenseBreakdownData = [
    { name: "Subscriptions", value: totalSubscriptions },
    { name: "Credit Expenses", value: totalCreditExpenses },
    { name: "Cash Expenses", value: totalCashExpenses },
  ];

  const COLORS = ["#3b82f6", "#8b5cf6", "#ef4444"];

  // Category breakdown data
  const categoryExpenses = finance.categories.map(category => {
    let amount = 0;
    
    // Add expenses for this category
    if (category.type.includes("subscription")) {
      amount += finance.subscriptions
        .filter(sub => sub.category === category.id)
        .reduce((sum, sub) => sum + sub.amount, 0);
    }
    
    if (category.type.includes("credit")) {
      amount += finance.creditExpenses
        .filter(exp => exp.category === category.id)
        .reduce((sum, exp) => sum + exp.amount / exp.installments, 0);
    }
    
    if (category.type.includes("cash")) {
      amount += finance.cashExpenses
        .filter(exp => exp.category === category.id)
        .reduce((sum, exp) => sum + exp.amount, 0);
    }
    
    return {
      name: category.name,
      amount,
      color: category.color,
    };
  }).filter(cat => cat.amount > 0);

  // Format data for the month-by-month chart
  const monthlyData = [
    {
      name: "Jan",
      income: 3200,
      expenses: 2100,
    },
    {
      name: "Feb",
      income: 3400,
      expenses: 2300,
    },
    {
      name: "Mar",
      income: 3800,
      expenses: 1900,
    },
    {
      name: "Apr",
      income: 3500,
      expenses: 1800,
    },
    {
      name: "May",
      income: 4300,
      expenses: 1825,
    },
  ];
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
        <p className="text-muted-foreground">
          Detailed analysis of your financial activities
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Income</CardTitle>
            <CardDescription>Current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(totalIncome, language)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in animation-delay-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Expenses</CardTitle>
            <CardDescription>Current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(totalExpenses, language)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in animation-delay-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Balance</CardTitle>
            <CardDescription>Income minus expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalIncome > totalExpenses ? "text-green-500" : "text-red-500"}`}>
              {formatCurrency(totalIncome - totalExpenses, language)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in animation-delay-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Saving Rate</CardTitle>
            <CardDescription>Percentage of income saved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalIncome > 0 ? `${Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)}%` : "0%"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full animate-fade-in animation-delay-400">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDuration("monthly")}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                duration === "monthly" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setDuration("yearly")}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                duration === "yearly" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <span>Income vs Expenses</span>
              </CardTitle>
              <CardDescription>Monthly comparison of income and expenses</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={monthlyData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--foreground)" }} />
                  <YAxis tick={{ fill: "var(--foreground)" }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)"
                    }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" name="Income" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expenses" className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                <span>Expense Distribution</span>
              </CardTitle>
              <CardDescription>Breakdown by expense type</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={expenseBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value), language)}
                    contentStyle={{ 
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)"
                    }}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                <span>Top Categories</span>
              </CardTitle>
              <CardDescription>Highest spending categories</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={categoryExpenses.sort((a, b) => b.amount - a.amount).slice(0, 5)}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" tick={{ fill: "var(--foreground)" }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "var(--foreground)" }} width={100} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value), language)}
                    contentStyle={{ 
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)"
                    }}
                  />
                  <Bar dataKey="amount" name="Amount">
                    {categoryExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                <span>Spending Trends</span>
              </CardTitle>
              <CardDescription>Your financial patterns over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={monthlyData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--foreground)" }} />
                  <YAxis tick={{ fill: "var(--foreground)" }} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value), language)}
                    contentStyle={{ 
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)"
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10b981" name="Income" strokeWidth={2} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
