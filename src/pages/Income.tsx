import { useState } from "react";
import { CalendarIcon, Plus, PlusCircle, Trash2 } from "lucide-react";
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
import { Income as IncomeType } from "@/types/finance";
import { useFinance } from "@/providers/FinanceProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SearchInput } from "@/components/SearchInput";

export default function Income() {
  const { t, language } = useLanguage();
  const { categories, incomes, addTransaction, deleteTransaction } = useFinance();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newIncome, setNewIncome] = useState({
    description: "",
    amount: "",
    category: "",
    source: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newIncome.description || !newIncome.amount || !newIncome.category) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(newIncome.amount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    // Create a new income entry
    const income: Omit<IncomeType, "id" | "createdAt" | "updatedAt"> = {
      type: "income",
      description: newIncome.description,
      amount: amount,
      category: newIncome.category,
      date: newIncome.date,
      source: newIncome.source || undefined,
    };

    addTransaction(income);
    
    toast({
      title: "Income added",
      description: `Added ${income.description} to your income`,
    });
    
    // Reset form and close dialog
    setNewIncome({
      description: "",
      amount: "",
      category: "",
      source: "",
      date: new Date().toISOString().split("T")[0],
    });
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id, "income");
    toast({
      title: "Income deleted",
      description: "The income entry has been removed",
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

  // Filter categories for income only
  const incomeCategories = categories.filter((category) =>
    category.type.includes("income")
  );

  // Calculate total income
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  // Filter incomes based on search term
  const filteredIncomes = incomes.filter(income => 
    income.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategoryName(income.category).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (income.source && income.source.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("income")}</h1>
          <p className="text-muted-foreground mt-1">
            Track your income sources
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Income
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add Income</DialogTitle>
                <DialogDescription>
                  Add a new income entry to track your earnings.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Salary, Freelance, etc."
                    value={newIncome.description}
                    onChange={(e) =>
                      setNewIncome({
                        ...newIncome,
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
                    value={newIncome.amount}
                    onChange={(e) =>
                      setNewIncome({
                        ...newIncome,
                        amount: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newIncome.category}
                    onValueChange={(value) =>
                      setNewIncome({
                        ...newIncome,
                        category: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {incomeCategories.map((category) => (
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
                  <Label htmlFor="source">Source (Optional)</Label>
                  <Input
                    id="source"
                    placeholder="Company name, client, etc."
                    value={newIncome.source}
                    onChange={(e) =>
                      setNewIncome({
                        ...newIncome,
                        source: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="flex">
                    <Input
                      id="date"
                      type="date"
                      value={newIncome.date}
                      onChange={(e) =>
                        setNewIncome({
                          ...newIncome,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add Income</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-3 md:col-span-1 animate-fade-in">
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
            <CardDescription>This month's total earnings</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center py-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500">
                {formatCurrency(totalIncome, language)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                From {incomes.length} income sources
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 md:col-span-2 animate-fade-in animation-delay-100">
          <CardHeader>
            <CardTitle>Income by Category</CardTitle>
            <CardDescription>Your income distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incomes.length > 0 ? (
                incomeCategories
                  .filter((category) => {
                    return incomes.some((income) => income.category === category.id);
                  })
                  .map((category) => {
                    const categoryIncome = incomes
                      .filter((income) => income.category === category.id)
                      .reduce((sum, income) => sum + income.amount, 0);
                    
                    const percentage = (categoryIncome / totalIncome) * 100;
                    
                    return (
                      <div key={category.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                          <div className="font-medium">
                            {formatCurrency(categoryIncome, language)} ({percentage.toFixed(1)}%)
                          </div>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: category.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    No income recorded yet
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-in animation-delay-200">
        <CardHeader>
          <CardTitle>Income Entries</CardTitle>
          <CardDescription>Your income sources and amounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={t("search_income")}
            />
            <div className="rounded-md border">
              {filteredIncomes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncomes.map((income) => (
                      <TableRow key={income.id} className="group">
                        <TableCell className="font-medium">
                          {income.description}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getCategoryColor(income.category) }}
                            />
                            {getCategoryName(income.category)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {income.source || "-"}
                        </TableCell>
                        <TableCell className="flex items-center gap-1">
                          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          {formatDate(income.date, "dd/MM/yyyy", language)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-500">
                          {formatCurrency(income.amount, language)}
                        </TableCell>
                        <TableCell className="text-right p-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDelete(income.id)}
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
                    <PlusCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">No income entries</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-1">
                    You haven't added any income yet. Click the "Add Income" button to get started.
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
