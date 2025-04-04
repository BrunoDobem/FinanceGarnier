import { useState } from "react";
import { CalendarIcon, DollarSign, Plus, Trash2, Edit } from "lucide-react";
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
import { CashExpense } from "@/types/finance";
import { useFinance } from "@/providers/FinanceProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SearchInput } from "@/components/SearchInput";

export default function CashExpenses() {
  const { t, language } = useLanguage();
  const { categories, cashExpenses, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingExpense, setEditingExpense] = useState<CashExpense | null>(null);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });

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
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: t("error"),
        description: t("invalid_amount"),
        variant: "destructive",
      });
      return;
    }

    if (editingExpense) {
      // Update existing cash expense
      const updatedExpense: CashExpense = {
        ...editingExpense,
        description: form.description,
        amount: amount,
        category: form.category,
        date: form.date,
      };

      updateTransaction(updatedExpense);
      
      toast({
        title: t("success"),
        description: t("transaction_updated"),
      });
    } else {
      // Create a new cash expense
      const expense: Omit<CashExpense, "id" | "createdAt" | "updatedAt"> = {
        type: "cash",
        description: form.description,
        amount: amount,
        category: form.category,
        date: form.date,
      };

      addTransaction(expense);
      
      toast({
        title: t("success"),
        description: t("cash_expense_added"),
      });
    }
    
    // Reset form and close dialog
    setNewExpense({
      description: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
    });
    setEditingExpense(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (expense: CashExpense) => {
    setEditingExpense({
      ...expense,
      amount: expense.amount.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id, "cash");
    toast({
      title: "Cash expense deleted",
      description: "The cash expense has been removed",
    });
  };

  const getCategoryName = (id: string) => {
    const category = categories.find(cat => cat.id === id);
    return category ? category.name : "Other";
  };

  const getCategoryColor = (id: string) => {
    const category = categories.find(cat => cat.id === id);
    return category ? category.color : "#888";
  };

  // Filter categories for cash expenses only
  const cashCategories = categories.filter((category) =>
    category.type.includes("cash")
  );

  // Calculate total cash expenses
  const totalCash = cashExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Group expenses by category for visualization
  const expensesByCategory = cashExpenses.reduce((acc, expense) => {
    const categoryId = expense.category;
    if (!acc[categoryId]) {
      acc[categoryId] = 0;
    }
    acc[categoryId] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Filter cash expenses based on search term
  const filteredCashExpenses = cashExpenses.filter(expense => 
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategoryName(expense.category).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("cash_expenses")}</h1>
          <p className="text-muted-foreground mt-1">
            Manage your one-time cash expenses
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
              date: new Date().toISOString().split("T")[0],
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> {t("add_cash_expense")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? t("edit") : t("add_cash_expense")}
                </DialogTitle>
                <DialogDescription>
                  {editingExpense 
                    ? t("edit_category_description")
                    : t("add_cash_expense_description")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">{t("description")}</Label>
                  <Input
                    id="description"
                    placeholder="Ex: Almoço, Táxi..."
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
                      {cashCategories.map((category) => (
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
                  <Label htmlFor="date">{t("date")}</Label>
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
        <Card className="col-span-3 md:col-span-1 animate-fade-in">
          <CardHeader>
            <CardTitle>Total Cash Expenses</CardTitle>
            <CardDescription>This month's cash spending</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center py-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {formatCurrency(totalCash, language)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {cashExpenses.length} cash expenses
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 md:col-span-2 animate-fade-in animation-delay-100">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>How your cash expenses are distributed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(expensesByCategory).length > 0 ? (
                Object.entries(expensesByCategory).map(([categoryId, amount]) => {
                  const category = categories.find((c) => c.id === categoryId);
                  const percentage = (amount / totalCash) * 100;
                  
                  return (
                    <div key={categoryId} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getCategoryColor(categoryId) }}
                          />
                          {getCategoryName(categoryId)}
                        </div>
                        <div className="font-medium">
                          {formatCurrency(amount, language)} ({percentage.toFixed(1)}%)
                        </div>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getCategoryColor(categoryId),
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    No expenses recorded yet
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-in animation-delay-200">
        <CardHeader>
          <CardTitle>Recent Cash Expenses</CardTitle>
          <CardDescription>Your one-time cash payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={t("search_cash_expenses")}
            />
            <div className="rounded-md border">
              {filteredCashExpenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("description")}</TableHead>
                      <TableHead>{t("category")}</TableHead>
                      <TableHead>{t("date")}</TableHead>
                      <TableHead className="text-right">{t("amount")}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCashExpenses.map((expense) => (
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
                          {formatDate(expense.date, "dd/MM/yyyy", language)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
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
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <DollarSign className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">No cash expenses</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-1">
                    You haven't added any cash expenses yet. Click the "Add Cash Expense" button to get started.
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
