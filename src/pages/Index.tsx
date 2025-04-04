import { useNavigate } from "react-router-dom";
import { TrendingUp, CreditCard, DollarSign, PlusCircle, Repeat, ArrowRight, Calendar, PiggyBank, LineChart, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/providers/LanguageProvider";
import { useFinance } from "@/providers/FinanceProvider";
import { formatCurrency } from "@/lib/utils";
import { FeedbackForm } from "@/components/FeedbackForm";

export default function Index() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const finance = useFinance();
  
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
  
  const budgetPercentage = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  
  const cards = [
    {
      title: t("subscriptions"),
      icon: Repeat,
      amount: totalSubscriptions,
      description: finance.subscriptions.length + " assinaturas ativas",
      href: "/subscriptions",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: t("credit_expenses"),
      icon: CreditCard,
      amount: totalCreditExpenses,
      description: finance.creditExpenses.length + " parcelas ativas",
      href: "/credit-expenses",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: t("cash_expenses"),
      icon: DollarSign,
      amount: totalCashExpenses,
      description: finance.cashExpenses.length + " despesas únicas",
      href: "/cash-expenses",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: t("income"),
      icon: PlusCircle,
      amount: totalIncome,
      description: finance.incomes.length + " fontes de renda",
      href: "/income",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("welcome")}
        </h1>
        <p className="text-muted-foreground">
          Visão geral financeira mensal
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Card key={card.title} className="overflow-hidden transition-all duration-300 hover:shadow-md animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{card.title}</CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(card.amount, language)}
              </div>
            </CardContent>
            <CardFooter className="pt-1">
              <Button variant="ghost" size="sm" className="w-full justify-between p-0 h-9" onClick={() => navigate(card.href)}>
                <span>Ver detalhes</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4 animate-fade-in animation-delay-400">
          <CardHeader>
            <CardTitle className="text-xl">Visão Geral do Orçamento Mensal</CardTitle>
            <CardDescription>
              Seus gastos em relação à sua renda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="font-medium">Uso do Orçamento</div>
                <div>{Math.round(budgetPercentage)}%</div>
              </div>
              <Progress value={budgetPercentage} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Renda Total</div>
                <div className="text-2xl font-bold text-green-500">
                  {formatCurrency(totalIncome, language)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Despesas Totais</div>
                <div className="text-2xl font-bold text-red-500">
                  {formatCurrency(totalExpenses, language)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3 animate-fade-in animation-delay-500">
          <CardHeader>
            <CardTitle className="text-xl">Saldo</CardTitle>
            <CardDescription>
              Seu saldo restante este mês
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center pt-4">
              <div className="relative">
                <TrendingUp className={`w-8 h-8 ${totalIncome > totalExpenses ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {formatCurrency(totalIncome - totalExpenses, language)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {totalIncome > totalExpenses
                  ? "Você está no caminho certo! Continue assim."
                  : "Você está gastando mais do que ganha. Tente reduzir as despesas."}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="animate-fade-in animation-delay-600">
          <CardHeader>
            <CardTitle className="text-xl">Dicas Financeiras</CardTitle>
            <CardDescription>
              Aprenda a gerenciar melhor seu dinheiro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <PiggyBank className="w-6 h-6 text-blue-500 mt-1" />
              <div>
                <h3 className="font-medium">Crie um Fundo de Emergência</h3>
                <p className="text-sm text-muted-foreground">
                  Mantenha 3-6 meses de despesas essenciais em uma conta separada.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <LineChart className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-medium">Diversifique seus Investimentos</h3>
                <p className="text-sm text-muted-foreground">
                  Não coloque todos os ovos na mesma cesta. Considere diferentes tipos de investimentos.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Calendar className="w-6 h-6 text-purple-500 mt-1" />
              <div>
                <h3 className="font-medium">Planejamento a Longo Prazo</h3>
                <p className="text-sm text-muted-foreground">
                  Defina metas financeiras e crie um plano para alcançá-las.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="animate-fade-in animation-delay-700">
          <FeedbackForm />
        </div>
      </div>
    </div>
  );
}
