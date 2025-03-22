import { useState } from "react";
import { useFinance } from "@/providers/FinanceProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { CreditCard as CreditCardType } from "@/types/finance";
import { CreditCard, PlusCircle, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Card color options
const cardColors = [
  "#000000", // Black
  "#1E293B", // Slate
  "#1E40AF", // Blue
  "#047857", // Emerald
  "#B91C1C", // Red
  "#7E22CE", // Purple
  "#B45309", // Amber
  "#475569", // Gray
];

export function CreditCardManager() {
  const { t } = useLanguage();
  const { creditCards, addCreditCard, updateCreditCard, deleteCreditCard } = useFinance();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardType | null>(null);
  const [newCard, setNewCard] = useState<Omit<CreditCardType, "id">>({
    name: "",
    closingDay: 15,
    dueDay: 5,
    lastFourDigits: "",
    color: cardColors[0],
  });

  const handleSubmit = () => {
    const form = editingCard ? editingCard : newCard;
    
    if (!form.name.trim()) {
      toast({
        title: t("error"),
        description: t("card_name_required"),
        variant: "destructive",
      });
      return;
    }
    
    if (form.closingDay < 1 || form.closingDay > 31) {
      toast({
        title: t("error"),
        description: t("invalid_closing_day"),
        variant: "destructive",
      });
      return;
    }
    
    if (form.dueDay < 1 || form.dueDay > 31) {
      toast({
        title: t("error"),
        description: t("invalid_due_day"),
        variant: "destructive",
      });
      return;
    }
    
    if (editingCard) {
      updateCreditCard(editingCard);
      toast({
        title: t("success"),
        description: t("card_updated"),
      });
    } else {
      addCreditCard(newCard);
      toast({
        title: t("success"),
        description: t("card_added"),
      });
      setNewCard({
        name: "",
        closingDay: 15,
        dueDay: 5,
        lastFourDigits: "",
        color: cardColors[0],
      });
    }
    
    setIsDialogOpen(false);
    setEditingCard(null);
  };

  const handleEdit = (card: CreditCardType) => {
    setEditingCard({ ...card });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteCreditCard(id);
    toast({
      title: t("success"),
      description: t("card_deleted"),
    });
  };

  const resetForm = () => {
    setEditingCard(null);
    setNewCard({
      name: "",
      closingDay: 15,
      dueDay: 5,
      lastFourDigits: "",
      color: cardColors[0],
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <span>{t("credit_cards")}</span>
            </CardTitle>
            <CardDescription>
              {t("manage_credit_cards")}
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                {t("add_credit_card")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCard ? t("edit_credit_card") : t("add_credit_card")}
                </DialogTitle>
                <DialogDescription>
                  {t("credit_card_description")}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name">{t("card_name")}</label>
                  <Input
                    id="name"
                    value={editingCard?.name || newCard.name}
                    onChange={(e) =>
                      editingCard
                        ? setEditingCard({
                            ...editingCard,
                            name: e.target.value,
                          })
                        : setNewCard({
                            ...newCard,
                            name: e.target.value,
                          })
                    }
                    placeholder={t("card_name_placeholder")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="lastFourDigits">{t("last_four_digits")}</label>
                    <Input
                      id="lastFourDigits"
                      value={editingCard?.lastFourDigits || newCard.lastFourDigits}
                      maxLength={4}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '').substring(0, 4);
                        if (editingCard) {
                          setEditingCard({
                            ...editingCard,
                            lastFourDigits: value,
                          });
                        } else {
                          setNewCard({
                            ...newCard,
                            lastFourDigits: value,
                          });
                        }
                      }}
                      placeholder="1234"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="limit">{t("credit_limit")}</label>
                    <Input
                      id="limit"
                      type="number"
                      value={editingCard?.limit || newCard.limit || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseFloat(e.target.value) : undefined;
                        if (editingCard) {
                          setEditingCard({
                            ...editingCard,
                            limit: value,
                          });
                        } else {
                          setNewCard({
                            ...newCard,
                            limit: value,
                          });
                        }
                      }}
                      placeholder="5000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2">{t("card_color")}</label>
                  <div className="flex flex-wrap gap-2">
                    {cardColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-5 rounded transition-all ${
                          (editingCard?.color || newCard.color) === color
                            ? "ring-2 ring-offset-2 ring-primary"
                            : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          if (editingCard) {
                            setEditingCard({
                              ...editingCard,
                              color,
                            });
                          } else {
                            setNewCard({ ...newCard, color });
                          }
                        }}
                        aria-label={`Color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="closingDay">{t("closing_day")}</label>
                    <Input
                      id="closingDay"
                      type="number"
                      min="1"
                      max="31"
                      value={editingCard?.closingDay || newCard.closingDay}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (editingCard) {
                          setEditingCard({
                            ...editingCard,
                            closingDay: isNaN(value) ? 1 : value,
                          });
                        } else {
                          setNewCard({
                            ...newCard,
                            closingDay: isNaN(value) ? 1 : value,
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="dueDay">{t("due_day")}</label>
                    <Input
                      id="dueDay"
                      type="number"
                      min="1"
                      max="31"
                      value={editingCard?.dueDay || newCard.dueDay}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        editingCard
                          ? setEditingCard({
                              ...editingCard,
                              dueDay: isNaN(value) ? 1 : value,
                            })
                          : setNewCard({
                              ...newCard,
                              dueDay: isNaN(value) ? 1 : value,
                            });
                      }}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  setEditingCard(null);
                }}>
                  {t("cancel")}
                </Button>
                <Button onClick={handleSubmit}>
                  {editingCard ? t("save") : t("add")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          {creditCards.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("card_name")}</TableHead>
                  <TableHead>{t("closing_day")}</TableHead>
                  <TableHead>{t("due_day")}</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creditCards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-3 rounded"
                          style={{ backgroundColor: card.color || "#000" }}
                        />
                        <span className="font-medium">
                          {card.name} 
                          {card.lastFourDigits && <span className="text-xs text-muted-foreground ml-1">
                            •••• {card.lastFourDigits}
                          </span>}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{card.closingDay}</TableCell>
                    <TableCell>{card.dueDay}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(card)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(card.id)}
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
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <CreditCard className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">{t("no_credit_cards")}</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                {t("no_credit_cards_description")}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
