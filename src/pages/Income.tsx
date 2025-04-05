import { useState } from "react";
import { CalendarIcon, Plus, PlusCircle, Trash2, Edit } from "lucide-react";
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
  const { categories, incomes, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingIncome, setEditingIncome] = useState<IncomeType | null>(null);
  const [newIncome, setNewIncome] = useState({
    description: "",
    amount: "",
    category: "",
    source: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = editingIncome ? editingIncome : newIncome;
    
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

    if (editingIncome) {
      // Update existing income
      const updatedIncome: IncomeType = {
        ...editingIncome,
        description: form.description,
        amount: amount,
        category: form.category,
        source: form.source || undefined,
        date: form.date,
      };

      updateTransaction(updatedIncome);
      
      toast({
        title: t("success"),
        description: t("transaction_updated"),
      });
    } else {
      // Create a new income
      const income: Omit<IncomeType, "id" | "createdAt" | "updatedAt"> = {
        type: "income",
        description: form.description,
        amount: amount,
        category: form.category,
        source: form.source || undefined,
        date: form.date,
      };

      addTransaction(income);
      
      toast({
        title: t("success"),
        description: t("income_added"),
      });
    }
    
    // Reset form and close dialog
    setNewIncome({
      description: "",
      amount: "",
      category: "",
      source: "",
      date: new Date().toISOString().split("T")[0],
    });
    setEditingIncome(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (income: IncomeType) => {
    setEditingIncome({
      ...income,
      amount: income.amount.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id, "income");
    toast({
      title: t("income_deleted"),
      description: t("income_deleted_description"),   
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
            {t("track_your_income_sources")}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingIncome(null);
            setNewIncome({
              description: "",
              amount: "",
              category: "",
              source: "",
              date: new Date().toISOString().split("T")[0],
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> {t("add_income")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingIncome ? t("edit") : t("add_income")}
                </DialogTitle>
                <DialogDescription>
                  {editingIncome 
                    ? t("edit_category_description")
                    : t("add_income_description")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">{t("description")}</Label>
                  <Input
                    id="description"
                    placeholder="Ex: Salário, Freelance..."
                    value={editingIncome?.description || newIncome.description}
                    onChange={(e) =>
                      editingIncome
                        ? setEditingIncome({
                            ...editingIncome,
                            description: e.target.value,
                          })
                        : setNewIncome({
                            ...newIncome,
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
                    value={editingIncome?.amount || newIncome.amount}
                    onChange={(e) =>
                      editingIncome
                        ? setEditingIncome({
                            ...editingIncome,
                            amount: e.target.value,
                          })
                        : setNewIncome({
                            ...newIncome,
                            amount: e.target.value,
                          })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">{t("category")}</Label>
                  <Select
                    value={editingIncome?.category || newIncome.category}
                    onValueChange={(value) =>
                      editingIncome
                        ? setEditingIncome({
                            ...editingIncome,
                            category: value,
                          })
                        : setNewIncome({
                            ...newIncome,
                            category: value,
                          })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_category")} />
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
                  <Label htmlFor="source">{t("source")}</Label>
                  <Input
                    id="source"
                    placeholder={t("source_placeholder")}
                    value={editingIncome?.source || newIncome.source}
                    onChange={(e) =>
                      editingIncome
                        ? setEditingIncome({
                            ...editingIncome,
                            source: e.target.value,
                          })
                        : setNewIncome({
                            ...newIncome,
                            source: e.target.value,
                          })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">{t("date")}</Label>
                  <Input
                    id="date"
                    type="date"
                    value={editingIncome?.date ? (typeof editingIncome.date === 'string' ? editingIncome.date.split('T')[0] : editingIncome.date) : newIncome.date}
                    onChange={(e) =>
                      editingIncome
                        ? setEditingIncome({
                            ...editingIncome,
                            date: e.target.value,
                          })
                        : setNewIncome({
                            ...newIncome,
                            date: e.target.value,
                          })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => {
                  setIsDialogOpen(false);
                  setEditingIncome(null);
                }}>
                  {t("cancel")}
                </Button>
                <Button type="submit">
                  {editingIncome ? t("save") : t("add")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-3 md:col-span-1 animate-fade-in">
          <CardHeader>
            <CardTitle>{t("total_income")}</CardTitle> 
            <CardDescription>{t("this_months_total_earnings")}</CardDescription>
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
            <CardTitle>{t("income_by_category")}</CardTitle>
            <CardDescription>{t("your_income_distribution")}</CardDescription>
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
          <CardTitle>{t("income_entries")}</CardTitle>
          <CardDescription>{t("your_income_sources_and_amounts")}</CardDescription>
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
                      <TableHead>{t("description")}</TableHead>
                      <TableHead>{t("category")}</TableHead>
                      <TableHead>{t("source")}</TableHead>
                      <TableHead>{t("date")}</TableHead>
                      <TableHead className="text-right">{t("amount")}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncomes.map((income) => (
                      <TableRow key={income.id}>
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
                        <TableCell>
                          {formatDate(income.date, "dd/MM/yyyy", language)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(income.amount, language)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(income)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(income.id)}
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
                    <PlusCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">{t("no_income_entries")}</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-1">
                    {t("no_income_entries_description")}
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
