import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
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
  const { categories, subscriptions, addTransaction, deleteTransaction } = useFinance();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newSubscription, setNewSubscription] = useState({
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    billingCycle: "monthly" as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSubscription.description || !newSubscription.amount || !newSubscription.category) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(newSubscription.amount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    // Create a new subscription
    const subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt"> = {
      type: "subscription",
      description: newSubscription.description,
      amount: amount,
      category: newSubscription.category,
      date: newSubscription.date,
      recurring: true,
      billingCycle: newSubscription.billingCycle,
      nextBillingDate: newSubscription.date, // Would calculate next billing date based on cycle
    };

    addTransaction(subscription);
    
    toast({
      title: "Subscription added",
      description: `Added ${subscription.description} to your subscriptions`,
    });
    
    // Reset form and close dialog
    setNewSubscription({
      description: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      billingCycle: "monthly",
    });
    setIsDialogOpen(false);
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
    return category ? category.name : "Other";
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
            Manage your recurring monthly payments
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Subscription</DialogTitle>
                <DialogDescription>
                  Add a new recurring monthly payment to track.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Netflix, Spotify, etc."
                    value={newSubscription.description}
                    onChange={(e) =>
                      setNewSubscription({
                        ...newSubscription,
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
                    value={newSubscription.amount}
                    onChange={(e) =>
                      setNewSubscription({
                        ...newSubscription,
                        amount: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newSubscription.category}
                    onValueChange={(value) =>
                      setNewSubscription({
                        ...newSubscription,
                        category: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
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
                  <Label htmlFor="date">First Billing Date</Label>
                  <div className="flex">
                    <Input
                      id="date"
                      type="date"
                      value={newSubscription.date}
                      onChange={(e) =>
                        setNewSubscription({
                          ...newSubscription,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="billingCycle">Billing Cycle</Label>
                  <Select
                    value={newSubscription.billingCycle}
                    onValueChange={(value: "weekly" | "monthly" | "quarterly" | "yearly") =>
                      setNewSubscription({
                        ...newSubscription,
                        billingCycle: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add Subscription</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-3 md:col-span-1 animate-fade-in">
          <CardHeader>
            <CardTitle>Monthly Cost</CardTitle>
            <CardDescription>Your total monthly subscriptions</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center py-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {formatCurrency(totalMonthly, language)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {subscriptions.length} active subscriptions
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 md:col-span-2 animate-fade-in animation-delay-100">
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
            <CardDescription>Your next subscription charges</CardDescription>
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
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Next Payment</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscriptions.map((subscription) => (
                        <TableRow key={subscription.id} className="group">
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
                          <TableCell className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            {formatDate(subscription.nextBillingDate, "dd/MM/yyyy", language)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(subscription.amount, language)}
                          </TableCell>
                          <TableCell className="text-right p-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDelete(subscription.id)}
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
