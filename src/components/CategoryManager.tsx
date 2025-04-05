import { useState } from "react";
import { useFinance } from "@/providers/FinanceProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { CategoryType, TransactionType } from "@/types/finance";
import { PlusCircle, Tags, Edit, Trash2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { SearchInput } from "@/components/SearchInput";

// Type colors for visual selection
const colorOptions = [
  "#EF4444", // red
  "#F97316", // orange
  "#F59E0B", // amber
  "#EAB308", // yellow
  "#84CC16", // lime
  "#22C55E", // green
  "#10B981", // emerald
  "#14B8A6", // teal
  "#06B6D4", // cyan
  "#0EA5E9", // sky
  "#3B82F6", // blue
  "#6366F1", // indigo
  "#8B5CF6", // violet
  "#A855F7", // purple
  "#D946EF", // fuchsia
  "#EC4899", // pink
  "#F43F5E", // rose
];

export function CategoryManager() {
  const { t } = useLanguage();
  const { categories, addCategory, updateCategory, deleteCategory } = useFinance();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);
  const [newCategory, setNewCategory] = useState<{
    name: string;
    color: string;
    type: TransactionType[];
  }>({
    name: "",
    color: colorOptions[0],
    type: ["income"],
  });

  const handleTypeChange = (type: TransactionType) => {
    const form = editingCategory ? editingCategory : newCategory;
    const types = form.type || [];
    
    if (types.includes(type)) {
      // Remove type if already selected
      const newTypes = types.filter((t) => t !== type);
      if (editingCategory) {
        setEditingCategory({ ...editingCategory, type: newTypes });
      } else {
        setNewCategory({ ...newCategory, type: newTypes });
      }
    } else {
      // Add type if not selected
      if (editingCategory) {
        setEditingCategory({ ...editingCategory, type: [...types, type] });
      } else {
        setNewCategory({ ...newCategory, type: [...types, type] });
      }
    }
  };

  const handleSubmit = () => {
    const form = editingCategory ? editingCategory : newCategory;
    
    if (!form.name.trim()) {
      toast({
        title: t("error"),
        description: t("category_name_required"),
        variant: "destructive",
      });
      return;
    }
    
    if (!form.type.length) {
      toast({
        title: t("error"),
        description: t("category_type_required"),
        variant: "destructive",
      });
      return;
    }
    
    if (editingCategory) {
      updateCategory(editingCategory);
      toast({
        title: t("success"),
        description: t("category_updated"),
      });
    } else {
      addCategory(newCategory);
      toast({
        title: t("success"),
        description: t("category_added"),
      });
      setNewCategory({
        name: "",
        color: colorOptions[0],
        type: ["income"],
      });
    }
    
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  const handleEdit = (category: CategoryType) => {
    setEditingCategory({ ...category });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
    toast({
      title: t("success"),
      description: t("category_deleted"),
    });
  };

  const getCategoryTypeLabels = (types: TransactionType[]) => {
    const typeMap: Record<TransactionType, string> = {
      subscription: t("subscriptions"),
      credit: t("credit_expenses"),
      cash: t("cash_expenses"),
      income: t("income"),
    };

    return types.map((type) => typeMap[type]).join(", ");
  };

  const resetForm = () => {
    setEditingCategory(null);
    setNewCategory({
      name: "",
      color: colorOptions[0],
      type: ["income"],
    });
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategoryTypeLabels(category.type).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              <span>{t("manage_categories")}</span>
            </CardTitle>
            <CardDescription>
              {t("customize_expense_categories")}
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                {t("add_category")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? t("edit_category") : t("add_category")}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory
                    ? t("edit_category_description")
                    : t("add_category_description")}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name">{t("category_name")}</label>
                  <Input
                    id="name"
                    value={editingCategory?.name || newCategory.name}
                    onChange={(e) =>
                      editingCategory
                        ? setEditingCategory({
                            ...editingCategory,
                            name: e.target.value,
                          })
                        : setNewCategory({
                            ...newCategory,
                            name: e.target.value,
                          })
                    }
                    placeholder={t("category_name")}
                  />
                </div>

                <div>
                  <label className="block mb-2">{t("category_color")}</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-6 h-6 rounded-full transition-all ${
                          (editingCategory?.color || newCategory.color) === color
                            ? "ring-2 ring-offset-2 ring-primary"
                            : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          editingCategory
                            ? setEditingCategory({
                                ...editingCategory,
                                color,
                              })
                            : setNewCategory({ ...newCategory, color })
                        }
                        aria-label={`Color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-2">{t("category_type")}</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="type-income"
                        checked={(editingCategory?.type || newCategory.type).includes(
                          "income"
                        )}
                        onCheckedChange={() => handleTypeChange("income")}
                      />
                      <label htmlFor="type-income">{t("income")}</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="type-cash"
                        checked={(editingCategory?.type || newCategory.type).includes(
                          "cash"
                        )}
                        onCheckedChange={() => handleTypeChange("cash")}
                      />
                      <label htmlFor="type-cash">{t("cash_expenses")}</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="type-credit"
                        checked={(editingCategory?.type || newCategory.type).includes(
                          "credit"
                        )}
                        onCheckedChange={() => handleTypeChange("credit")}
                      />
                      <label htmlFor="type-credit">{t("credit_expenses")}</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="type-subscription"
                        checked={(editingCategory?.type || newCategory.type).includes(
                          "subscription"
                        )}
                        onCheckedChange={() => handleTypeChange("subscription")}
                      />
                      <label htmlFor="type-subscription">{t("subscriptions")}</label>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  setEditingCategory(null);
                }}>
                  {t("cancel")}
                </Button>
                <Button onClick={handleSubmit}>
                  {editingCategory ? t("save") : t("add")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t("search_categories")}
          />
          <div className="rounded-md border">
            {filteredCategories.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("category")}</TableHead>
                    <TableHead>{t("type")}</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getCategoryTypeLabels(category.type)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(category.id)}
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
                <Tags className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">{t("no_categories")}</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  {t("no_categories_description")}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
