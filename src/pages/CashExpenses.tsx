import { useState } from "react";
import { CalendarIcon, DollarSign, Plus, Trash2 } from "lucide-react";
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
  const { categories, cashExpenses, addTransaction, deleteTransaction } = useFinance();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newExpense.description || !newExpense.amount || !newExpense.category) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(newExpense.amount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    // Create a new cash expense
    const expense: Omit<CashExpense, "id" | "createdAt" | "updatedAt"> = {
      type: "cash",
      description: newExpense.description,
      amount: amount,
      category: newExpense.category,
      date: newExpense.date,
    };

    addTransaction(expense);
    
    toast({
      title: "Cash expense added",
      description: `Added ${expense.description} to your cash expenses`,
    });
    
    // Reset form and close dialog
    setNewExpense({
      description: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
    });
    setIsDialogOpen(false);
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Cash Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add Cash Expense</DialogTitle>
                <DialogDescription>
                  Add a new one-time cash expense.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Groceries, restaurant, etc."
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        amount: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value) =>
                      setNewExpense({
                        ...newExpense,
                        category: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
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
                  <Label htmlFor="date">Date</Label>
                  <div className="flex">
                    <Input
                      id="date"
                      type="date"
                      value={newExpense.date}
                      onChange={(e) =>
                        setNewExpense({
                          ...newExpense,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add Expense</Button>
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
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCashExpenses.map((expense) => (
                      <TableRow key={expense.id} className="group">
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
                        <TableCell className="flex items-center gap-1">
                          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          {formatDate(expense.date, "dd/MM/yyyy", language)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(expense.amount, language)}
                        </TableCell>
                        <TableCell className="text-right p-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDelete(expense.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
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
