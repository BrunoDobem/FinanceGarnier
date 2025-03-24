import { useState } from "react";
import { BarChart3, DollarSign, LineChart, PieChart, TrendingUp, Calendar, CreditCard, Repeat, Wallet, Tags, ListOrdered, Edit, Trash2, Plus } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { toast } = useToast();

  // Funções de manipulação
  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // Implemente a lógica de exclusão aqui
      toast({
        title: t("success"),
        description: t("item_deleted"),
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: t("error_deleting_item"),
        variant: "destructive",
      });
    }
  };

  const handleAddCreditExpense = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEditExpense = (month: string) => {
    const expense = finance.creditExpenses.find(
      (exp) => exp.date.toISOString().startsWith(month)
    );
    if (expense) {
      setEditingItem(expense);
      setIsDialogOpen(true);
    }
  };

  const handleDeleteExpense = async (month: string) => {
    try {
      const expense = finance.creditExpenses.find(
        (exp) => exp.date.toISOString().startsWith(month)
      );
      if (expense) {
        // Implemente a lógica de exclusão aqui
        toast({
          title: t("success"),
          description: t("expense_deleted"),
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("error_deleting_expense"),
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      
      const data = {
        description: formData.get('description') as string,
        amount: parseFloat(formData.get('amount') as string),
        date: new Date(formData.get('date') as string),
      };

      if (editingItem) {
        // Implemente a lógica de atualização aqui
        toast({
          title: t("success"),
          description: t("item_updated"),
        });
      } else {
        // Implemente a lógica de criação aqui
        toast({
          title: t("success"),
          description: t("item_added"),
        });
      }

      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast({
        title: t("error"),
        description: t("error_saving_item"),
        variant: "destructive",
      });
    }
  };

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
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-col gap-2 md:gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Análise detalhada das suas atividades financeiras
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in hover:bg-accent/50 transition-all duration-200 cursor-default">
          <CardHeader className="pb-1 md:pb-2">
            <CardTitle className="text-sm md:text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
              Renda Total
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Mês atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-green-500">
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview" className="text-sm">Visão Geral</TabsTrigger>
            <TabsTrigger value="expenses" className="text-sm">Despesas</TabsTrigger>
            <TabsTrigger value="trends" className="text-sm">Tendências</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDuration("monthly")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-all ${
                duration === "monthly" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setDuration("yearly")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-all ${
                duration === "yearly" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              Anual
            </button>
          </div>
        </div>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                <span>Renda vs Despesas</span>
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">Comparação mensal de renda e despesas</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={monthlyData}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 20,
                    bottom: 20,
                  }}
                  barGap={0}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: "var(--foreground)", fontSize: "12px" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={{ stroke: "var(--border)" }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fill: "var(--foreground)", fontSize: "12px" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={{ stroke: "var(--border)" }}
                    tickFormatter={(value) => formatCurrency(value, language)}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [formatCurrency(value as number, language)]}
                  />
                  <Legend 
                    wrapperStyle={{
                      fontSize: "12px",
                      paddingTop: "10px",
                    }}
                  />
                  <Bar dataKey="income" name="Renda" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Despesas" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
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
              <CardContent className="h-[250px] sm:h-[300px] md:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={expenseBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={({ width, height }) => Math.min(width, height) * 0.35}
                      innerRadius={({ width, height }) => Math.min(width, height) * 0.2}
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
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                        padding: "8px"
                      }}
                      formatter={(value) => [formatCurrency(value as number, language)]}
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
              <CardContent className="h-[250px] sm:h-[300px] md:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={monthlyData}
                    margin={{
                      top: 20,
                      right: 20,
                      left: 20,
                      bottom: 40,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: "var(--foreground)", fontSize: "12px" }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={{ stroke: "var(--border)" }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fill: "var(--foreground)", fontSize: "12px" }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={{ stroke: "var(--border)" }}
                      tickFormatter={(value) => formatCurrency(value, language)}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                        padding: "8px"
                      }}
                      formatter={(value) => [formatCurrency(value as number, language)]}
                    />
                    <Legend 
                      wrapperStyle={{
                        fontSize: "12px",
                        paddingTop: "10px",
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke={CHART_COLORS[0]} 
                      name="Saldo" 
                      strokeWidth={2}
                      dot={{ fill: CHART_COLORS[0], r: 4 }}
                      activeDot={{ r: 6, fill: CHART_COLORS[0] }}
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Gastos com Crédito</span>
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleAddCreditExpense}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
              <CardDescription>Previsão de gastos com cartão de crédito</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(futureCreditExpenses).map(([month, amount]) => (
                  <div key={month} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 group">
                    <div className="flex-1">
                      <span className="text-sm text-muted-foreground">
                        {new Date(month).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                      </span>
                      <span className="font-medium text-red-500 ml-4">
                        {formatCurrency(amount, language)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditExpense(month)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteExpense(month)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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
