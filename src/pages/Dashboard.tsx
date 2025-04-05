import { useState, useMemo } from "react";
import { BarChart3, DollarSign, LineChart, PieChart, TrendingUp, Calendar, CreditCard, Repeat, Wallet, Tags, ListOrdered, Edit, Trash2, Plus, Info } from "lucide-react";
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
  ComposedChart,
  ReferenceLine,
  Brush,
  AreaChart,
  Area,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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

// Definindo as chaves de tradução
type TranslationMessages = {
  success: string;
  error: string;
  item_deleted: string;
  error_deleting_item: string;
  expense_deleted: string;
  error_deleting_expense: string;
  item_updated: string;
  item_added: string;
  error_saving_item: string;
};

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
      toast({
        title: t("success"),
        description: "Item excluído com sucesso",
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: "Erro ao excluir item",
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
      (exp) => new Date(exp.date).toISOString().startsWith(month)
    );
    if (expense) {
      setEditingItem(expense);
      setIsDialogOpen(true);
    }
  };

  const handleDeleteExpense = async (month: string) => {
    try {
      const expense = finance.creditExpenses.find(
        (exp) => new Date(exp.date).toISOString().startsWith(month)
      );
      if (expense) {
        toast({
          title: t("success"),
          description: "Despesa excluída com sucesso",
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: "Erro ao excluir despesa",
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
        toast({
          title: t("success"),
          description: "Item atualizado com sucesso",
        });
      } else {
        toast({
          title: t("success"),
          description: "Item adicionado com sucesso",
        });
      }

      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast({
        title: t("error"),
        description: "Erro ao salvar item",
        variant: "destructive",
      });
    }
  };

  // Calcular gastos futuros
  const futureCreditExpenses = calculateFutureCreditExpenses(finance.creditExpenses, monthsAhead);
  const futureSubscriptionExpenses = calculateSubscriptionExpenses(finance.subscriptions, monthsAhead);
  const futureCashExpenses = calculateCashExpenses(finance.cashExpenses, monthsAhead);
  
  // Calcular todos os gastos (incluindo passados) para o gráfico
  const allCreditExpenses = calculateFutureCreditExpenses(finance.creditExpenses, monthsAhead * 2, true);
  const allSubscriptionExpenses = calculateSubscriptionExpenses(finance.subscriptions, monthsAhead * 2, true);
  const allCashExpenses = calculateCashExpenses(finance.cashExpenses, monthsAhead * 2, true);
  
  // Calcular renda total
  const totalIncome = finance.incomes.reduce(
    (total, income) => total + income.amount,
    0
  );

  // Gerar dados mensais para o gráfico de Renda vs Despesas
  const monthlyData = generateMonthlyData(
    totalIncome,
    allCreditExpenses,
    allSubscriptionExpenses,
    allCashExpenses,
    monthsAhead * 2 // Dobra o período para mostrar passado e futuro
  );

  // Calcular métricas financeiras (usando apenas gastos do mês atual)
  const metrics = calculateFinancialMetrics(
    totalIncome,
    allCreditExpenses, // Usa todos os gastos para calcular métricas atuais
    allSubscriptionExpenses,
    allCashExpenses
  );

  // Dados para o gráfico de pizza (usando apenas gastos futuros)
  const expenseBreakdownData = [
    { name: "Gasto Fixo", value: Object.values(allSubscriptionExpenses).reduce((a, b) => a + b, 0) },
    { name: "Gastos com Crédito", value: Object.values(allCreditExpenses).reduce((a, b) => a + b, 0) },
    { name: "Gastos em Dinheiro", value: Object.values(allCashExpenses).reduce((a, b) => a + b, 0) },
  ];

  // Combine todas as despesas em um único array
  const allExpenses = [
    ...finance.creditExpenses,
    ...finance.subscriptions,
    ...finance.cashExpenses
  ];

  const expensesByCategory = analyzeExpensesByCategory(allExpenses);
  const { creditCards } = useFinance();
  const expensesByCard = useMemo(() => {
    const cardMap = new Map(creditCards.map(card => [card.id, card.name]));
    const expenses = analyzeExpensesByCard(allExpenses);
    
    // Transforma os IDs dos cartões em nomes
    return Object.entries(expenses).reduce((acc, [cardId, value]) => {
      const cardName = cardId === 'Cartão Principal' ? cardId : cardMap.get(cardId) || 'Outro Cartão';
      acc[cardName] = value;
      return acc;
    }, {} as { [key: string]: number });
  }, [creditCards, allExpenses]);
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
      <style>
        {`
          .recharts-tooltip-wrapper {
            background-color: white !important;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          }
        `}
      </style>
      
      <div className="flex flex-col gap-2 md:gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Análise detalhada das suas atividades financeiras
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in hover:bg-accent/50 transition-all duration-200 cursor-default group">
          <CardHeader className="pb-1 md:pb-2">
            <CardTitle className="text-sm md:text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
              <span className="flex items-center gap-2">
                Renda Total
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <p className="text-sm">Soma de todas as suas fontes de renda no mês atual.</p>
                  </HoverCardContent>
                </HoverCard>
              </span>
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Mês atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-green-500">
              {formatCurrency(totalIncome, language)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {finance.incomes.length} {finance.incomes.length === 1 ? 'fonte de renda' : 'fontes de renda'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in animation-delay-100 hover:bg-accent/50 transition-all duration-200 cursor-default group">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-5 w-5 text-red-500" />
              <span className="flex items-center gap-2">
                Despesas do Mês
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="space-y-2">
                      <p className="text-sm">Total de gastos no mês atual, incluindo:</p>
                      <ul className="text-sm list-disc list-inside space-y-1">
                        <li>Cartão de Crédito: {formatCurrency(metrics.currentMonthDetails.creditExpenses, language)}</li>
                        <li>Gasto Fixo: {formatCurrency(metrics.currentMonthDetails.subscriptionExpenses, language)}</li>
                        <li>Dinheiro: {formatCurrency(metrics.currentMonthDetails.cashExpenses, language)}</li>
                      </ul>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </span>
            </CardTitle>
            <CardDescription>Total de gastos atuais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(metrics.currentMonthExpenses, language)}
            </div>
            <Progress 
              value={metrics.expenseToIncomeRatio} 
              className={cn(
                "h-1 mt-2",
                metrics.expenseToIncomeRatio > 100 ? "bg-red-500" :
                metrics.expenseToIncomeRatio > 80 ? "bg-yellow-500" :
                "bg-green-500"
              )}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.expenseToIncomeRatio.toFixed(1)}% da renda
            </p>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in animation-delay-200 hover:bg-accent/50 transition-all duration-200 cursor-default group">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <span className="flex items-center gap-2">
                Saldo Atual
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <p className="text-sm">Diferença entre sua renda total e despesas no mês atual.</p>
                  </HoverCardContent>
                </HoverCard>
              </span>
            </CardTitle>
            <CardDescription>Renda menos despesas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              metrics.currentMonthBalance >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {formatCurrency(metrics.currentMonthBalance, language)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.currentMonthBalance >= 0 
                ? "Saldo positivo este mês"
                : "Saldo negativo este mês"}
            </p>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in animation-delay-300 hover:bg-accent/50 transition-all duration-200 cursor-default group">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Tags className="h-5 w-5 text-blue-500" />
              <span className="flex items-center gap-2">
                Taxa de Poupança
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="space-y-2">
                      <p className="text-sm">Percentual da sua renda que está sendo poupada.</p>
                      <p className="text-sm text-muted-foreground">
                        Calculado como: (Renda - Despesas) / Renda × 100
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </span>
            </CardTitle>
            <CardDescription>Percentual da renda poupada</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {Math.round(metrics.savingsRate)}%
            </div>
            <Progress 
              value={metrics.savingsRate} 
              className="h-1 mt-2" 
              indicatorClassName={cn(
                metrics.savingsRate < 0 ? "bg-red-500" :
                metrics.savingsRate < 10 ? "bg-yellow-500" :
                "bg-blue-500"
              )}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.savingsRate < 0 ? "Poupança negativa" :
               metrics.savingsRate < 10 ? "Poupança baixa" :
               metrics.savingsRate < 20 ? "Poupança moderada" :
               "Boa taxa de poupança"}
            </p>
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
            <CardContent className="h-[300px] md:h-[400px] rounded-lg p-4 hover:bg-white transition-all duration-200">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS[1]} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={CHART_COLORS[1]} stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} />
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
                      padding: "12px",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
                    }}
                    formatter={(value, name) => {
                      const formattedValue = formatCurrency(value as number, language);
                      const translatedName = {
                        income: "Renda",
                        totalExpenses: "Despesas Totais",
                        balance: "Saldo",
                        creditExpenses: "Cartão de Crédito",
                        subscriptionExpenses: "Gasto Fixo",
                        cashExpenses: "Dinheiro"
                      }[name as string] || name;
                      return [formattedValue, translatedName];
                    }}
                    labelFormatter={(label) => {
                      const date = monthlyData.find(item => item.name === label)?.month;
                      if (date) {
                        return new Date(date).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
                      }
                      return label;
                    }}
                  />
                  <Legend 
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => {
                      const translations = {
                        income: "Renda",
                        totalExpenses: "Despesas Totais",
                        balance: "Saldo"
                      };
                      return translations[value] || value;
                    }}
                  />
                  <Bar 
                    dataKey="income" 
                    fill={CHART_COLORS[0]} 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={50}
                    opacity={0.8}
                    background={{ fill: "url(#colorIncome)" }}
                    className="hover:brightness-110 transition-all duration-200"
                    onMouseEnter={(data) => {
                      const bar = document.querySelector(`[datakey="income"][index="${data.index}"]`);
                      if (bar) {
                        bar.setAttribute('style', 'filter: brightness(1.2); cursor: pointer;');
                      }
                    }}
                    onMouseLeave={(data) => {
                      const bar = document.querySelector(`[datakey="income"][index="${data.index}"]`);
                      if (bar) {
                        bar.setAttribute('style', '');
                      }
                    }}
                  />
                  <Bar 
                    dataKey="totalExpenses" 
                    fill={CHART_COLORS[1]} 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={50}
                    opacity={0.8}
                    background={{ fill: "url(#colorExpenses)" }}
                    className="hover:brightness-110 transition-all duration-200"
                    onMouseEnter={(data) => {
                      const bar = document.querySelector(`[datakey="totalExpenses"][index="${data.index}"]`);
                      if (bar) {
                        bar.setAttribute('style', 'filter: brightness(1.2); cursor: pointer;');
                      }
                    }}
                    onMouseLeave={(data) => {
                      const bar = document.querySelector(`[datakey="totalExpenses"][index="${data.index}"]`);
                      if (bar) {
                        bar.setAttribute('style', '');
                      }
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke={CHART_COLORS[2]}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS[2], r: 4 }}
                    activeDot={{ r: 6, fill: CHART_COLORS[2], stroke: "var(--background)", strokeWidth: 2 }}
                    className="hover:brightness-110 transition-all duration-200"
                  />
                  <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
                  <Brush 
                    dataKey="name" 
                    height={30} 
                    stroke="var(--border)"
                    fill="var(--background)"
                    tickFormatter={(tick) => {
                      const date = monthlyData.find(item => item.name === tick)?.month;
                      return date ? new Date(date).toLocaleString('pt-BR', { month: 'short' }) : tick;
                    }}
                    travellerWidth={10}
                    className="recharts-brush"
                  >
                    <style>
                      {`
                        .recharts-brush .recharts-brush-slide {
                          fill: #dfdfe9 !important;
                          fill-opacity: 1 !important;
                          opacity: 1 !important;
                          cursor: grab;
                        }
                        .recharts-brush .recharts-brush-traveller {
                          fill: #dfdfe9 !important;
                          stroke: #dfdfe9 !important;
                          fill-opacity: 1 !important;
                          opacity: 1 !important;
                          stroke-width: 1px;
                          rx: 4;
                          cursor: ew-resize;
                        }
                        .recharts-brush-texts {
                          font-size: 12px;
                          fill: #dfdfe9 !important;
                          fill-opacity: 1 !important;
                          opacity: 1 !important;
                        }
                      `}
                    </style>
                  </Brush>
                </ComposedChart>
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
                <CardDescription>Composição dos gastos ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] sm:h-[300px] md:h-[400px] rounded-lg p-4 hover:bg-white transition-all duration-200">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <defs>
                      {["creditExpenses", "subscriptionExpenses", "cashExpenses"].map((key, index) => (
                        <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS[index + 3]} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={CHART_COLORS[index + 3]} stopOpacity={0.1}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} />
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
                        padding: "12px",
                        fontSize: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
                      }}
                      formatter={(value, name) => {
                        const formattedValue = formatCurrency(value as number, language);
                        const translatedName = {
                          creditExpenses: "Cartão de Crédito",
                          subscriptionExpenses: "Gasto Fixo",
                          cashExpenses: "Dinheiro"
                        }[name as string] || name;
                        return [formattedValue, translatedName];
                      }}
                      labelFormatter={(label) => {
                        const date = monthlyData.find(item => item.name === label)?.month;
                        if (date) {
                          return new Date(date).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
                        }
                        return label;
                      }}
                    />
                    <Legend 
                      verticalAlign="top"
                      height={36}
                      formatter={(value) => {
                        const translations = {
                          creditExpenses: "Cartão de Crédito",
                          subscriptionExpenses: "Gasto Fixo",
                          cashExpenses: "Dinheiro"
                        };
                        return translations[value] || value;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="creditExpenses"
                      stackId="1"
                      stroke={CHART_COLORS[3]}
                      fill={`url(#colorCreditExpenses)`}
                      className="hover:brightness-110 transition-all duration-200"
                      onMouseEnter={(e) => {
                        const target = e.target as SVGElement;
                        const index = target.getAttribute('index');
                        if (index) {
                          const area = document.querySelector(`[datakey="creditExpenses"][index="${index}"]`);
                          if (area) {
                            area.setAttribute('style', 'filter: brightness(1.2); cursor: pointer;');
                          }
                        }
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as SVGElement;
                        const index = target.getAttribute('index');
                        if (index) {
                          const area = document.querySelector(`[datakey="creditExpenses"][index="${index}"]`);
                          if (area) {
                            area.setAttribute('style', '');
                          }
                        }
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="subscriptionExpenses"
                      stackId="1"
                      stroke={CHART_COLORS[4]}
                      fill={`url(#colorSubscriptionExpenses)`}
                      className="hover:brightness-110 transition-all duration-200"
                      onMouseEnter={(e) => {
                        const target = e.target as SVGElement;
                        const index = target.getAttribute('index');
                        if (index) {
                          const area = document.querySelector(`[datakey="subscriptionExpenses"][index="${index}"]`);
                          if (area) {
                            area.setAttribute('style', 'filter: brightness(1.2); cursor: pointer;');
                          }
                        }
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as SVGElement;
                        const index = target.getAttribute('index');
                        if (index) {
                          const area = document.querySelector(`[datakey="subscriptionExpenses"][index="${index}"]`);
                          if (area) {
                            area.setAttribute('style', '');
                          }
                        }
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cashExpenses"
                      stackId="1"
                      stroke={CHART_COLORS[5]}
                      fill={`url(#colorCashExpenses)`}
                      className="hover:brightness-110 transition-all duration-200"
                      onMouseEnter={(e) => {
                        const target = e.target as SVGElement;
                        const index = target.getAttribute('index');
                        if (index) {
                          const area = document.querySelector(`[datakey="cashExpenses"][index="${index}"]`);
                          if (area) {
                            area.setAttribute('style', 'filter: brightness(1.2); cursor: pointer;');
                          }
                        }
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as SVGElement;
                        const index = target.getAttribute('index');
                        if (index) {
                          const area = document.querySelector(`[datakey="cashExpenses"][index="${index}"]`);
                          if (area) {
                            area.setAttribute('style', '');
                          }
                        }
                      }}
                    />
                    <Brush 
                      dataKey="name" 
                      height={30} 
                      stroke="var(--border)"
                      fill="var(--background)"
                      tickFormatter={(tick) => {
                        const date = monthlyData.find(item => item.name === tick)?.month;
                        return date ? new Date(date).toLocaleString('pt-BR', { month: 'short' }) : tick;
                      }}
                      travellerWidth={10}
                      className="recharts-brush"
                    >
                      <style>
                        {`
                          .recharts-brush .recharts-brush-slide {
                            fill: #dfdfe9 !important;
                            fill-opacity: 1 !important;
                            opacity: 1 !important;
                            cursor: grab;
                          }
                          .recharts-brush .recharts-brush-traveller {
                            fill: #dfdfe9 !important;
                            stroke: #dfdfe9 !important;
                            fill-opacity: 1 !important;
                            opacity: 1 !important;
                            stroke-width: 1px;
                            rx: 4;
                            cursor: ew-resize;
                          }
                          .recharts-brush-texts {
                            font-size: 12px;
                            fill: #dfdfe9 !important;
                            fill-opacity: 1 !important;
                            opacity: 1 !important;
                          }
                        `}
                      </style>
                    </Brush>
                  </AreaChart>
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
              <CardContent className="h-[250px] sm:h-[300px] md:h-[400px] rounded-lg p-4 hover:bg-white transition-all duration-200">
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
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.1}/>
                        <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0.01}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS[1]} stopOpacity={0.1}/>
                        <stop offset="95%" stopColor={CHART_COLORS[1]} stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} />
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
                <div className="h-[300px] rounded-lg p-4 hover:bg-white transition-all duration-200">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="45%"
                        labelLine={false}
                        outerRadius={90}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={(entry) => {
                          const { percent } = entry;
                          return `${(percent * 100).toFixed(0)}%`;
                        }}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                            stroke="var(--background)"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          padding: "12px",
                          fontSize: "12px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
                        }}
                        formatter={(value: number) => formatCurrency(value, language)}
                        wrapperStyle={{ outline: "none" }}
                      />
                      <Legend 
                        layout="horizontal"
                        align="center"
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-xs">{value}</span>}
                        wrapperStyle={{
                          paddingTop: "20px"
                        }}
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
                <div className="h-[300px] rounded-lg p-4 hover:bg-white transition-all duration-200">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={cardData}
                        cx="50%"
                        cy="45%"
                        labelLine={false}
                        outerRadius={90}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={(entry) => {
                          const { percent } = entry;
                          return `${(percent * 100).toFixed(0)}%`;
                        }}
                      >
                        {cardData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                            stroke="var(--background)"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          padding: "12px",
                          fontSize: "12px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
                        }}
                        formatter={(value: number) => formatCurrency(value, language)}
                        wrapperStyle={{ outline: "none" }}
                      />
                      <Legend 
                        layout="horizontal"
                        align="center"
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-xs">{value}</span>}
                        wrapperStyle={{
                          paddingTop: "20px"
                        }}
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
                <div className="h-[300px] rounded-lg p-4 hover:bg-white transition-all duration-200">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="45%"
                        labelLine={false}
                        outerRadius={90}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={(entry) => {
                          const { percent } = entry;
                          return `${(percent * 100).toFixed(0)}%`;
                        }}
                      >
                        {paymentMethodData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                            stroke="var(--background)"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          padding: "12px",
                          fontSize: "12px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
                        }}
                        formatter={(value: number) => formatCurrency(value, language)}
                        wrapperStyle={{ outline: "none" }}
                      />
                      <Legend 
                        layout="horizontal"
                        align="center"
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-xs">{value}</span>}
                        wrapperStyle={{
                          paddingTop: "20px"
                        }}
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
                <span>Gasto Fixo</span>
              </CardTitle>
              <CardDescription>Previsão de gastos com Gasto Fixo</CardDescription>
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
