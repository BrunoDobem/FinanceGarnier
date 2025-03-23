import { useState } from "react";
import { BarChart3, DollarSign, LineChart, PieChart, TrendingUp, Calendar, CreditCard, Repeat, Wallet, Tags, ListOrdered } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinance } from "@/providers/FinanceProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { formatCurrency } from "@/lib/utils";
import {
  calculateFutureCreditExpenses,
  calculateSubscriptionExpenses,
  calculateCashExpenses,
  generateMonthlyData,
  calculateFinancialMetrics,
  analyzeExpensesByCard,
  analyzeExpensesByPaymentMethod,
  analyzeExpensesByCategory,
  analyzeExpensesByDescription
} from "@/lib/finance";
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

const CHART_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#ec4899", // pink
  "#6366f1", // indigo
  "#84cc16", // lime
  "#14b8a6", // teal
  "#f97316", // orange
];

export default function Dashboard() {
  const { t, language } = useLanguage();
  const finance = useFinance();
  const [duration, setDuration] = useState<"monthly" | "yearly">("monthly");
  const [monthsAhead, setMonthsAhead] = useState(12);

  // Calcular gastos futuros
  const futureCreditExpenses = calculateFutureCreditExpenses(finance.creditExpenses, monthsAhead);
  const futureSubscriptionExpenses = calculateSubscriptionExpenses(finance.subscriptions, monthsAhead);
  const futureCashExpenses = calculateCashExpenses(finance.cashExpenses, monthsAhead);
  
  // Calcular renda total
  const totalIncome = finance.incomes.reduce(
    (total, income) => total + income.amount,
    0
  );

  // Gerar dados mensais
  const monthlyData = generateMonthlyData(
    totalIncome,
    futureCreditExpenses,
    futureSubscriptionExpenses,
    futureCashExpenses,
    monthsAhead
  );

  // Calcular métricas financeiras
  const metrics = calculateFinancialMetrics(
    totalIncome,
    futureCreditExpenses,
    futureSubscriptionExpenses,
    futureCashExpenses
  );

  // Dados para o gráfico de pizza
  const expenseBreakdownData = [
    { name: "Assinaturas", value: Object.values(futureSubscriptionExpenses).reduce((a, b) => a + b, 0) },
    { name: "Gastos com Crédito", value: Object.values(futureCreditExpenses).reduce((a, b) => a + b, 0) },
    { name: "Gastos em Dinheiro", value: Object.values(futureCashExpenses).reduce((a, b) => a + b, 0) },
  ];

  // Combine todas as despesas em um único array
  const allExpenses = [
    ...finance.creditExpenses,
    ...finance.subscriptions,
    ...finance.cashExpenses
  ];

  const expensesByCategory = analyzeExpensesByCategory(allExpenses);
  const expensesByCard = analyzeExpensesByCard(allExpenses);
  const expensesByPaymentMethod = analyzeExpensesByPaymentMethod(allExpenses);

  // Transforme os dados para o formato do gráfico
  const categoryData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value
  }));

  const cardData = Object.entries(expensesByCard).map(([name, value]) => ({
    name: name || "Outros",
    value
  }));

  const paymentMethodData = Object.entries(expensesByPaymentMethod).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
        <p className="text-muted-foreground">
          Análise detalhada das suas atividades financeiras
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in hover:bg-accent/50 transition-all duration-200 cursor-default">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Renda Total
            </CardTitle>
            <CardDescription>Mês atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(totalIncome, language)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in animation-delay-100 hover:bg-accent/50 transition-all duration-200 cursor-default">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-5 w-5 text-red-500" />
              Despesas do Mês
            </CardTitle>
            <CardDescription>Total de gastos atuais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(metrics.currentMonthExpenses, language)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in animation-delay-200 hover:bg-accent/50 transition-all duration-200 cursor-default">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Saldo Atual
            </CardTitle>
            <CardDescription>Renda menos despesas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.currentMonthBalance >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatCurrency(metrics.currentMonthBalance, language)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in animation-delay-300 hover:bg-accent/50 transition-all duration-200 cursor-default">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Tags className="h-5 w-5 text-blue-500" />
              Taxa de Poupança
            </CardTitle>
            <CardDescription>Percentual da renda poupada</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {Math.round(metrics.savingsRate)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full animate-fade-in animation-delay-400">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="expenses">Despesas</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDuration("monthly")}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                duration === "monthly" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setDuration("yearly")}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                duration === "yearly" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              Anual
            </button>
          </div>
        </div>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <span>Renda vs Despesas</span>
              </CardTitle>
              <CardDescription>Comparação mensal de renda e despesas</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={monthlyData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 40,
                    bottom: 20,
                  }}
                  barGap={0}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: "var(--foreground)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={{ stroke: "var(--border)" }}
                  />
                  <YAxis 
                    tick={{ fill: "var(--foreground)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={{ stroke: "var(--border)" }}
                    tickFormatter={(value) => formatCurrency(value, language)}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--popover))",
                      borderColor: "hsl(var(--border))",
                      borderWidth: "1px",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                      padding: "0.75rem",
                      color: "hsl(var(--popover-foreground))"
                    }}
                    formatter={(value: number) => formatCurrency(value, language)}
                    cursor={{ fill: "hsl(var(--accent))", opacity: 0.1 }}
                    wrapperStyle={{ outline: "none" }}
                  />
                  <Legend 
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{
                      paddingBottom: "20px"
                    }}
                  />
                  <Bar 
                    dataKey="income" 
                    fill="#10b981" 
                    name="Renda"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="subscriptionExpenses" 
                    fill="#3b82f6" 
                    name="Assinaturas"
                    radius={[4, 4, 0, 0]}
                    stackId="expenses"
                  />
                  <Bar 
                    dataKey="creditExpenses" 
                    fill="#8b5cf6" 
                    name="Gastos com Crédito"
                    radius={[4, 4, 0, 0]}
                    stackId="expenses"
                  />
                  <Bar 
                    dataKey="cashExpenses" 
                    fill="#ef4444" 
                    name="Gastos em Dinheiro"
                    radius={[4, 4, 0, 0]}
                    stackId="expenses"
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  <span>Distribuição de Despesas</span>
                </CardTitle>
                <CardDescription>Breakdown dos tipos de despesas</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={expenseBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }) => 
                        `${name}: ${formatCurrency(value, language)} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelStyle={{
                        fill: "var(--foreground)",
                        fontSize: "12px"
                      }}
                    >
                      {expenseBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--popover))",
                        borderColor: "hsl(var(--border))",
                        borderWidth: "1px",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                        padding: "0.75rem",
                        color: "hsl(var(--popover-foreground))"
                      }}
                      formatter={(value: number) => formatCurrency(value, language)}
                      wrapperStyle={{ outline: "none" }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  <span>Saldo ao Longo do Tempo</span>
                </CardTitle>
                <CardDescription>Evolução do saldo mensal</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={monthlyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 40,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: "var(--foreground)" }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={{ stroke: "var(--border)" }}
                    />
                    <YAxis 
                      tick={{ fill: "var(--foreground)" }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={{ stroke: "var(--border)" }}
                      tickFormatter={(value) => formatCurrency(value, language)}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--popover))",
                        borderColor: "hsl(var(--border))",
                        borderWidth: "1px",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                        padding: "0.75rem",
                        color: "hsl(var(--popover-foreground))"
                      }}
                      formatter={(value: number) => formatCurrency(value, language)}
                      cursor={{ stroke: "hsl(var(--accent))", strokeWidth: 2 }}
                      wrapperStyle={{ outline: "none" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#3b82f6" 
                      name="Saldo" 
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", r: 4 }}
                      activeDot={{ r: 6, fill: "#3b82f6" }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Tags className="h-5 w-5" />
                  Gastos por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value, percent }) => 
                          `${name}: ${formatCurrency(value, language)} (${(percent * 100).toFixed(0)}%)`
                        }
                        labelStyle={{
                          fill: "var(--foreground)",
                          fontSize: "12px"
                        }}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--popover))",
                          borderColor: "hsl(var(--border))",
                          borderWidth: "1px",
                          borderRadius: "0.5rem",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                          padding: "0.75rem",
                          color: "hsl(var(--popover-foreground))"
                        }}
                        formatter={(value: number) => formatCurrency(value, language)}
                        wrapperStyle={{ outline: "none" }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Gastos por Cartão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={cardData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value, percent }) => 
                          `${name}: ${formatCurrency(value, language)} (${(percent * 100).toFixed(0)}%)`
                        }
                        labelStyle={{
                          fill: "var(--foreground)",
                          fontSize: "12px"
                        }}
                      >
                        {cardData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--popover))",
                          borderColor: "hsl(var(--border))",
                          borderWidth: "1px",
                          borderRadius: "0.5rem",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                          padding: "0.75rem",
                          color: "hsl(var(--popover-foreground))"
                        }}
                        formatter={(value: number) => formatCurrency(value, language)}
                        wrapperStyle={{ outline: "none" }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Gastos por Forma de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value, percent }) => 
                          `${name}: ${formatCurrency(value, language)} (${(percent * 100).toFixed(0)}%)`
                        }
                        labelStyle={{
                          fill: "var(--foreground)",
                          fontSize: "12px"
                        }}
                      >
                        {paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--popover))",
                          borderColor: "hsl(var(--border))",
                          borderWidth: "1px",
                          borderRadius: "0.5rem",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                          padding: "0.75rem",
                          color: "hsl(var(--popover-foreground))"
                        }}
                        formatter={(value: number) => formatCurrency(value, language)}
                        wrapperStyle={{ outline: "none" }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="expenses" className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span>Gastos com Crédito</span>
              </CardTitle>
              <CardDescription>Previsão de gastos com cartão de crédito</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(futureCreditExpenses).map(([month, amount]) => (
                  <div key={month} className="flex justify-between items-center p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 cursor-default">
                    <span className="text-sm text-muted-foreground">
                      {new Date(month).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                    </span>
                    <span className="font-medium text-red-500">
                      {formatCurrency(amount, language)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Repeat className="h-5 w-5" />
                <span>Assinaturas</span>
              </CardTitle>
              <CardDescription>Previsão de gastos com assinaturas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(futureSubscriptionExpenses).map(([month, amount]) => (
                  <div key={month} className="flex justify-between items-center p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 cursor-default">
                    <span className="text-sm text-muted-foreground">
                      {new Date(month).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                    </span>
                    <span className="font-medium text-blue-500">
                      {formatCurrency(amount, language)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <span>Métricas Financeiras</span>
              </CardTitle>
              <CardDescription>Indicadores importantes do seu orçamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 p-4 rounded-lg hover:bg-accent/50 transition-all duration-200 cursor-default">
                  <div className="text-sm font-medium text-muted-foreground">
                    Taxa de Despesas
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.round(metrics.expenseToIncomeRatio)}%
                  </div>
                </div>
                <div className="space-y-2 p-4 rounded-lg hover:bg-accent/50 transition-all duration-200 cursor-default">
                  <div className="text-sm font-medium text-muted-foreground">
                    Média Mensal de Despesas
                  </div>
                  <div className="text-2xl font-bold text-red-500">
                    {formatCurrency(metrics.averageMonthlyExpenses, language)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
