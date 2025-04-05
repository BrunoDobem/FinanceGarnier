import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarIcon, Plus, Trash2, Edit } from "lucide-react";
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
import { Subscription } from "@/types/finance";
import { useFinance } from "@/providers/FinanceProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { SearchInput } from "@/components/SearchInput";

export default function Subscriptions() {
  const { t, language } = useLanguage();
  const { categories, subscriptions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [newSubscription, setNewSubscription] = useState({
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    billingCycle: "monthly" as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = editingSubscription ? editingSubscription : newSubscription;
    
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

    if (editingSubscription) {
      // Update existing subscription
      const updatedSubscription: Subscription = {
        ...editingSubscription,
        description: form.description,
        amount: amount,
        category: form.category,
        date: form.date,
        billingCycle: form.billingCycle,
        nextBillingDate: form.date,
      };

      updateTransaction(updatedSubscription);
      
      toast({
        title: t("success"),
        description: t("transaction_updated"),
      });
    } else {
      // Create a new subscription
      const subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt"> = {
        type: "subscription",
        description: form.description,
        amount: amount,
        category: form.category,
        date: form.date,
        recurring: true,
        billingCycle: form.billingCycle,
        nextBillingDate: form.date,
      };

      addTransaction(subscription);
      
      toast({
        title: t("success"),
        description: t("subscription_added"),
      });
    }
    
    // Reset form and close dialog
    setNewSubscription({
      description: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      billingCycle: "monthly",
    });
    setEditingSubscription(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription({
      ...subscription,
      amount: subscription.amount.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id, "subscription");
    toast({
      title: "Subscription deleted",
      description: "The subscription has been removed",
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

  // Filter categories for subscriptions only
  const subscriptionCategories = categories.filter((category) =>
    category.type.includes("subscription")
  );

  // Calculate total monthly subscription cost
  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  // Filter subscriptions based on search term
  const filteredSubscriptions = subscriptions.filter(subscription => 
    subscription.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategoryName(subscription.category).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("subscriptions")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("manage_recurring_payments")}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingSubscription(null);
            setNewSubscription({
              description: "",
              amount: "",
              category: "",
              date: new Date().toISOString().split("T")[0],
              billingCycle: "monthly",
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> {t("add_subscription")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingSubscription ? t("edit") : t("add_subscription")}
                </DialogTitle>
                <DialogDescription>
                  {editingSubscription 
                    ? t("edit_category_description")
                    : t("add_category_description")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">{t("description")}</Label>
                  <Input
                    id="description"
                    placeholder="Netflix, Spotify, etc."
                    value={editingSubscription?.description || newSubscription.description}
                    onChange={(e) =>
                      editingSubscription
                        ? setEditingSubscription({
                            ...editingSubscription,
                            description: e.target.value,
                          })
                        : setNewSubscription({
                            ...newSubscription,
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
                    value={editingSubscription?.amount || newSubscription.amount}
                    onChange={(e) =>
                      editingSubscription
                        ? setEditingSubscription({
                            ...editingSubscription,
                            amount: e.target.value,
                          })
                        : setNewSubscription({
                            ...newSubscription,
                            amount: e.target.value,
                          })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">{t("category")}</Label>
                  <Select
                    value={editingSubscription?.category || newSubscription.category}
                    onValueChange={(value) =>
                      editingSubscription
                        ? setEditingSubscription({
                            ...editingSubscription,
                            category: value,
                          })
                        : setNewSubscription({
                            ...newSubscription,
                            category: value,
                          })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_category")} />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptionCategories.map((category) => (
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
                  <Label htmlFor="date">{t("first_installment")}</Label>
                  <div className="flex">
                    <Input
                      id="date"
                      type="date"
                      value={editingSubscription?.date ? (typeof editingSubscription.date === 'string' ? editingSubscription.date.split('T')[0] : editingSubscription.date) : newSubscription.date}
                      onChange={(e) =>
                        editingSubscription
                          ? setEditingSubscription({
                              ...editingSubscription,
                              date: e.target.value,
                            })
                          : setNewSubscription({
                              ...newSubscription,
                              date: e.target.value,
                            })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="billingCycle">{t("billing_cycle")}</Label>
                  <Select
                    value={editingSubscription?.billingCycle || newSubscription.billingCycle}
                    onValueChange={(value: "weekly" | "monthly" | "quarterly" | "yearly") =>
                      editingSubscription
                        ? setEditingSubscription({
                            ...editingSubscription,
                            billingCycle: value,
                          })
                        : setNewSubscription({
                            ...newSubscription,
                            billingCycle: value,
                          })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">{t("weekly")}</SelectItem>
                      <SelectItem value="monthly">{t("monthly")}</SelectItem>
                      <SelectItem value="quarterly">{t("quarterly")}</SelectItem>
                      <SelectItem value="yearly">{t("yearly")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => {
                  setIsDialogOpen(false);
                  setEditingSubscription(null);
                }}>
                  {t("cancel")}
                </Button>
                <Button type="submit">
                  {editingSubscription ? t("save") : t("add")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-3 md:col-span-1 animate-fade-in">
          <CardHeader>
            <CardTitle>{t("monthly_cost")}</CardTitle>
            <CardDescription>{t("total_monthly_subscriptions")}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center py-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {formatCurrency(totalMonthly, language)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {subscriptions.length} {t("active_subscriptions")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 md:col-span-2 animate-fade-in animation-delay-100">
          <CardHeader>
            <CardTitle>{t("upcoming_payments")}</CardTitle>
            <CardDescription>{t("next_subscription_charges")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={t("search_subscriptions")}
              />
              <div className="rounded-md border">
                {filteredSubscriptions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("description")}</TableHead>
                        <TableHead>{t("category")}</TableHead>
                        <TableHead>{t("billing_cycle")}</TableHead>
                        <TableHead>{t("next_payment")}</TableHead>
                        <TableHead className="text-right">{t("amount")}</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell className="font-medium">
                            {subscription.description}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getCategoryColor(subscription.category) }}
                              />
                              {getCategoryName(subscription.category)}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">
                            {t(subscription.billingCycle)}
                          </TableCell>
                          <TableCell className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            {formatDate(subscription.nextBillingDate, "dd/MM/yyyy", language)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(subscription.amount, language)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(subscription)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(subscription.id)}
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
                      <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No subscriptions</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mt-1">
                      You haven't added any subscriptions yet. Click the "Add Subscription" button to get started.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
