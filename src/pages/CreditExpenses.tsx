import { useState, useEffect } from "react";
import { CalendarIcon, CreditCard, Plus, Trash2, Calendar, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CreditExpense } from "@/types/finance";
import { useFinance } from "@/providers/FinanceProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { 
  formatCurrency, 
  formatDate, 
  calculateBillingDates, 
  isInCurrentBillingCycle, 
  getBillingCycleForPurchase,
  getInstallmentBillingMonths 
} from "@/lib/utils";
import { CreditInstallmentProgress } from "@/components/CreditInstallmentProgress";
import { SearchInput } from "@/components/SearchInput";

export default function CreditExpenses() {
  const { t, language } = useLanguage();
  const { categories, creditCards, creditExpenses, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingExpense, setEditingExpense] = useState<CreditExpense | null>(null);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "",
    installments: "1",
    date: new Date().toISOString().split("T")[0],
    creditCardId: ""
  });
  const [cycleInfo, setCycleInfo] = useState<{
    cardName: string;
    closingDate: Date;
    dueDate: Date;
    cycleProgress: number;
    currentTotal: number;
    limit?: number;
  } | null>(null);

  // Calculate current billing cycle information when cards or expenses change
  useEffect(() => {
    if (creditCards.length === 0) return;
    
    // Default to first card if none selected
    const defaultCard = creditCards[0];
    const billingDates = calculateBillingDates(defaultCard.closingDay, defaultCard.dueDay);
    
    // Calculate total for current billing cycle
    const currentCycleExpenses = creditExpenses.filter(expense => {
      // If this expense has a specific card, check against that card's cycle
      const cardId = expense.creditCardId || defaultCard.id;
      const card = creditCards.find(c => c.id === cardId);
      if (!card) return false;
      
      // Use the improved billing cycle calculation
      const { billingMonth, billingYear } = getBillingCycleForPurchase(
        expense.date, 
        card.closingDay, 
        card.dueDay
      );
      
      // Get current month and year for comparison
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      // Check if this expense's first installment is in the current billing cycle
      const isCurrentCycle = billingMonth === currentMonth && billingYear === currentYear;
      
      return isCurrentCycle;
    });
    
    // Calculate total for current cycle
    const currentCycleTotal = currentCycleExpenses.reduce((sum, expense) => {
      return sum + (expense.amount / expense.installments);
    }, 0);
    
    setCycleInfo({
      cardName: defaultCard.name,
      closingDate: billingDates.closingDate,
      dueDate: billingDates.dueDate,
      cycleProgress: billingDates.cycleProgress,
      currentTotal: currentCycleTotal,
      limit: defaultCard.limit
    });
  }, [creditCards, creditExpenses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = editingExpense ? editingExpense : newExpense;
    
    if (!form.description || !form.amount || !form.category) {
      toast({
        title: t("error"),
        description: t("please_fill_required_fields"),
        variant: "destructive",
      });
      return;
    }

    const amount = typeof form.amount === 'string' ? parseFloat(form.amount) : form.amount;
    const installments = typeof form.installments === 'string' ? parseInt(form.installments) : form.installments;
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: t("error"),
        description: t("invalid_amount"),
        variant: "destructive",
      });
      return;
    }

    if (isNaN(installments) || installments <= 0) {
      toast({
        title: t("error"),
        description: t("invalid_installments"),
        variant: "destructive",
      });
      return;
    }

    if (editingExpense) {
      // Update existing credit expense
      const updatedExpense: CreditExpense = {
        ...editingExpense,
        description: form.description,
        amount: amount,
        category: form.category,
        date: form.date,
        installments: installments,
        creditCardId: form.creditCardId || undefined
      };

      updateTransaction(updatedExpense);
      
      toast({
        title: t("success"),
        description: t("transaction_updated"),
      });
    } else {
      // Create a new credit expense
      const expense: Omit<CreditExpense, "id" | "createdAt" | "updatedAt"> = {
        type: "credit",
        description: form.description,
        amount: amount,
        category: form.category,
        date: form.date,
        installments: installments,
        currentInstallment: 1,
        creditCardId: form.creditCardId || undefined
      };

      addTransaction(expense);
      
      // Get the card to show in which month this will be billed
      const cardId = form.creditCardId || (creditCards.length > 0 ? creditCards[0].id : undefined);
      const card = cardId ? creditCards.find(c => c.id === cardId) : undefined;
      
      if (card) {
        const { billingMonthName } = getBillingCycleForPurchase(
          form.date, 
          card.closingDay, 
          card.dueDay
        );
        
        toast({
          title: t("credit_expense_added"),
          description: `${expense.description} - ${t("first_installment_on")} ${billingMonthName}`,
        });
      } else {
        toast({
          title: t("credit_expense_added"),
          description: `${expense.description}`,
        });
      }
    }
    
    // Reset form and close dialog
    setNewExpense({
      description: "",
      amount: "",
      category: "",
      installments: "1",
      date: new Date().toISOString().split("T")[0],
      creditCardId: ""
    });
    setEditingExpense(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (expense: CreditExpense) => {
    setEditingExpense({
      ...expense,
      amount: expense.amount.toString(),
      installments: expense.installments.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id, "credit");
    toast({
      title: t("credit_expense_deleted"),
      description: t("expense_removed"),
    });
  };

  const getCategoryName = (id: string) => {
    const category = categories.find(cat => cat.id === id);
    return category ? category.name : "Outro";
  };

  const getCategoryColor = (id: string) => {
    const category = categories.find(cat => cat.id === id);
    return category ? category.color : "#888";
  };

  // Filter categories for credit expenses only
  const creditCategories = categories.filter((category) =>
    category.type.includes("credit")
  );

  // Calculate total monthly installment amount
  const totalMonthly = creditExpenses.reduce((sum, expense) => {
    // Only count if the expense still has installments left
    if (expense.currentInstallment <= expense.installments) {
      return sum + (expense.amount / expense.installments);
    }
    return sum;
  }, 0);

  // Calculate total outstanding balance
  const totalOutstanding = creditExpenses.reduce((sum, expense) => {
    // Calculate remaining amount (remaining installments * amount per installment)
    const remainingInstallments = expense.installments - expense.currentInstallment + 1;
    if (remainingInstallments > 0) {
      return sum + ((expense.amount / expense.installments) * remainingInstallments);
    }
    return sum;
  }, 0);

  // Get the billing months for an expense
  const getBillingInfo = (expense: CreditExpense) => {
    const cardId = expense.creditCardId || (creditCards.length > 0 ? creditCards[0].id : undefined);
    const card = cardId ? creditCards.find(c => c.id === cardId) : undefined;
    
    if (!card) return null;
    
    const { billingMonth, billingYear, billingMonthName } = getBillingCycleForPurchase(
      expense.date, 
      card.closingDay, 
      card.dueDay
    );
    
    return { billingMonth, billingYear, billingMonthName };
  };

  // Filter credit expenses based on search term
  const filteredCreditExpenses = creditExpenses.filter(expense => 
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategoryName(expense.category).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("credit_expenses")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("manage_credit_expenses")}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingExpense(null);
            setNewExpense({
              description: "",
              amount: "",
              category: "",
              installments: "1",
              date: new Date().toISOString().split("T")[0],
              creditCardId: ""
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> {t("add_credit_expense")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? t("edit") : t("add_credit_expense")}
                </DialogTitle>
                <DialogDescription>
                  {editingExpense 
                    ? t("edit_category_description")
                    : t("add_credit_expense_description")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">{t("description")}</Label>
                  <Input
                    id="description"
                    placeholder="Ex: Smart TV, Notebook..."
                    value={editingExpense?.description || newExpense.description}
                    onChange={(e) =>
                      editingExpense
                        ? setEditingExpense({
                            ...editingExpense,
                            description: e.target.value,
                          })
                        : setNewExpense({
                            ...newExpense,
                            description: e.target.value,
                          })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">{t("amount")}</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={editingExpense?.amount || newExpense.amount}
                    onChange={(e) =>
                      editingExpense
                        ? setEditingExpense({
                            ...editingExpense,
                            amount: e.target.value,
                          })
                        : setNewExpense({
                            ...newExpense,
                            amount: e.target.value,
                          })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">{t("category")}</Label>
                  <Select
                    value={editingExpense?.category || newExpense.category}
                    onValueChange={(value) =>
                      editingExpense
                        ? setEditingExpense({
                            ...editingExpense,
                            category: value,
                          })
                        : setNewExpense({
                            ...newExpense,
                            category: value,
                          })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_category")} />
                    </SelectTrigger>
                    <SelectContent>
                      {creditCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installments">{t("installments")}</Label>
                  <Input
                    id="installments"
                    type="number"
                    min="1"
                    step="1"
                    value={editingExpense?.installments || newExpense.installments}
                    onChange={(e) =>
                      editingExpense
                        ? setEditingExpense({
                            ...editingExpense,
                            installments: e.target.value,
                          })
                        : setNewExpense({
                            ...newExpense,
                            installments: e.target.value,
                          })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">{t("start_date")}</Label>
                  <div className="flex">
                    <Input
                      id="date"
                      type="date"
                      value={editingExpense?.date ? (typeof editingExpense.date === 'string' ? editingExpense.date.split('T')[0] : editingExpense.date) : newExpense.date}
                      onChange={(e) =>
                        editingExpense
                          ? setEditingExpense({
                              ...editingExpense,
                              date: e.target.value,
                            })
                          : setNewExpense({
                              ...newExpense,
                              date: e.target.value,
                            })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="creditCard">{t("credit_card")}</Label>
                  <Select
                    value={editingExpense?.creditCardId || newExpense.creditCardId}
                    onValueChange={(value) =>
                      editingExpense
                        ? setEditingExpense({
                            ...editingExpense,
                            creditCardId: value,
                          })
                        : setNewExpense({
                            ...newExpense,
                            creditCardId: value,
                          })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("choose_card")} />
                    </SelectTrigger>
                    <SelectContent>
                      {creditCards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => {
                  setIsDialogOpen(false);
                  setEditingExpense(null);
                }}>
                  {t("cancel")}
                </Button>
                <Button type="submit">
                  {editingExpense ? t("save") : t("add")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>{t("monthly_installments")}</CardTitle>
            <CardDescription>{t("current_month_payments")}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center py-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {formatCurrency(totalMonthly, language)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {creditExpenses.length} {t("active_installment_plans")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in animation-delay-100">
          <CardHeader>
            <CardTitle>{t("outstanding_balance")}</CardTitle>
            <CardDescription>{t("remaining_credit_commitments")}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center py-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {formatCurrency(totalOutstanding, language)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {t("total_future_payments")}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in animation-delay-100">
          <CardHeader>
            <CardTitle>{t("current_billing_cycle")}</CardTitle>
            <CardDescription>
              {cycleInfo?.cardName || t("credit_card")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cycleInfo ? (
              <>
                <div className="grid gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("closing_date")}:</span>
                    <span className="font-medium">{formatDate(cycleInfo.closingDate, "dd/MM/yyyy", language)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("due_date")}:</span>
                    <span className="font-medium">{formatDate(cycleInfo.dueDate, "dd/MM/yyyy", language)}</span>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="font-medium flex items-center cursor-help">
                            {t("current_cycle_usage")} 
                            <Calendar className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("billing_cycle_progress")}: {Math.round(cycleInfo.cycleProgress)}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div>{formatCurrency(cycleInfo.currentTotal, language)}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress 
                      value={cycleInfo.cycleProgress} 
                      className="h-2" 
                    />
                    {cycleInfo.limit ? (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {formatCurrency(cycleInfo.currentTotal, language)} / {formatCurrency(cycleInfo.limit, language)}
                        </span>
                        <span>
                          {Math.round((cycleInfo.currentTotal / cycleInfo.limit) * 100)}%
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                {t("add_credit_card_to_see_cycle")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("all_credit_expenses")}</CardTitle>
          <CardDescription>
            {t("manage_credit_expenses")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={t("search_credit_expenses")}
            />
            <div className="rounded-md border">
              {filteredCreditExpenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("description")}</TableHead>
                      <TableHead>{t("category")}</TableHead>
                      <TableHead>{t("installments")}</TableHead>
                      <TableHead>{t("credit_card")}</TableHead>
                      <TableHead>{t("first_installment")}</TableHead>
                      <TableHead className="text-center">{t("progress")}</TableHead>
                      <TableHead className="text-right">{t("monthly_payment")}</TableHead>
                      <TableHead className="text-right">{t("total")}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCreditExpenses.map((expense) => {
                      const card = expense.creditCardId 
                        ? creditCards.find(c => c.id === expense.creditCardId)
                        : creditCards.length > 0 ? creditCards[0] : null;
                        
                      const billingInfo = card ? getBillingInfo(expense) : null;
                      
                      return (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">
                            {expense.description}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getCategoryColor(expense.category) }}
                              />
                              {getCategoryName(expense.category)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {expense.currentInstallment}/{expense.installments}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                              {card ? card.name : "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {billingInfo ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="cursor-help text-sm">
                                    {billingInfo.billingMonthName}
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t("first_installment_billed_on")} {billingInfo.billingMonthName}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            <CreditInstallmentProgress 
                              expense={expense} 
                              dueDayOfMonth={creditCards.find(c => c.id === expense.creditCardId)?.dueDay || creditCards[0].dueDay} 
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(expense.amount / expense.installments, language)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(expense.amount, language)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(expense)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(expense.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">{t("no_credit_expenses")}</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-1">
                    {t("no_credit_expenses_description")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
