import { ptBR, enUS, es, fr, de } from "date-fns/locale";

export type TranslationKey =
  | "dashboard"
  | "subscriptions"
  | "credit_expenses"
  | "cash_expenses"
  | "income"
  | "settings"
  | "logout"
  | "total_balance"
  | "monthly_overview"
  | "expense_categories"
  | "income_sources"
  | "recent_transactions"
  | "view_all"
  | "add"
  | "edit"
  | "delete"
  | "cancel"
  | "save"
  | "description"
  | "amount"
  | "category"
  | "date"
  | "no_data"
  | "no_transactions"
  | "confirm_delete"
  | "confirm_delete_message"
  | "yes_delete"
  | "no_cancel"
  | "success"
  | "error"
  | "please_fill_required_fields"
  | "invalid_amount"
  | "transaction_added"
  | "transaction_updated"
  | "transaction_deleted"
  | "monthly_subscriptions"
  | "add_subscription"
  | "manage_subscriptions"
  | "all_subscriptions"
  | "recurring"
  | "plan_details"
  | "billing_cycle"
  | "next_payment"
  | "total"
  | "actions"
  | "subscription_added"
  | "subscription_deleted"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly"
  | "auto_renew"
  | "other"
  | "entertainment"
  | "utilities"
  | "food"
  | "transportation"
  | "housing"
  | "insurance"
  | "medical"
  | "personal"
  | "education"
  | "clothing"
  | "gifts"
  | "investments"
  | "no_subscriptions"
  | "no_subscriptions_description"
  | "add_credit_expense"
  | "manage_credit_expenses"
  | "monthly_installments"
  | "installments"
  | "current_month_payments"
  | "outstanding_balance"
  | "remaining_credit_commitments"
  | "current_billing_cycle"
  | "credit_card"
  | "credit_installments"
  | "active_credit_plans"
  | "progress"
  | "monthly_payment"
  | "no_credit_expenses"
  | "no_credit_expenses_description"
  | "invalid_installments"
  | "credit_expense_added"
  | "credit_expense_deleted"
  | "expense_removed"
  | "add_credit_expense_description"
  | "select_category"
  | "choose_card"
  | "total_future_payments"
  | "active_installment_plans"
  | "start_date"
  | "closing_date"
  | "due_date"
  | "current_cycle_usage"
  | "no_credit_cards"
  | "salary"
  | "freelance"
  | "investments"
  | "rental"
  | "add_income"
  | "manage_income"
  | "all_income"
  | "income_sources"
  | "income_added"
  | "income_deleted"
  | "source"
  | "no_income"
  | "no_income_description"
  | "add_cash_expense"
  | "manage_cash_expenses"
  | "cash_expenses_this_month"
  | "categories_distribution"
  | "all_cash_expenses"
  | "cash_expense_added"
  | "cash_expense_deleted"
  | "no_cash_expenses"
  | "no_cash_expenses_description"
  | "days_ago"
  | "today"
  | "yesterday"
  | "last_week"
  | "older"
  | "app_settings"
  | "appearance"
  | "language"
  | "themes"
  | "system"
  | "light"
  | "dark"
  | "user_preferences"
  | "currency"
  | "categories"
  | "security"
  | "account"
  | "language_changed"
  | "theme_changed"
  | "settings_saved"
  | "all_expenses"
  | "monthly_average"
  | "highest_month"
  | "lowest_month"
  | "last_6_months"
  | "income_vs_expenses"
  | "balance_evolution"
  | "month"
  | "last_12_months"
  | "not_found"
  | "page_not_found"
  | "return_home"
  | "add_category"
  | "category_name"
  | "category_color"
  | "category_name_required"
  | "category_type_required"
  | "category_added"
  | "category_updated"
  | "category_deleted"
  | "customize_expense_categories"
  | "edit_category"
  | "edit_category_description"
  | "add_category_description"
  | "type"
  | "no_categories_description"
  | "manage_security"
  | "add_credit_card"
  | "edit_credit_card"
  | "card_name"
  | "last_four_digits"
  | "credit_limit"
  | "card_color"
  | "card_name_required"
  | "invalid_closing_day"
  | "invalid_due_day"
  | "card_updated"
  | "card_added"
  | "card_deleted"
  | "manage_credit_cards"
  | "credit_card_description"
  | "card_name_placeholder"
  | "no_credit_cards_description"
  | "manage_categories"
  | "security_settings"
  | "appearance_settings"
  | "manage_settings"
  | "configure_appearance"
  | "select_language"
  | "choose_theme"
  | "set_currency"
  | "first_installment"
  | "billing_preview"
  | "will_be_billed_on"
  | "installment"
  | "first_installment_on"
  | "first_installment_billed_on"
  | "billing_cycle_progress"
  | "add_credit_card_to_see_cycle";

export type LanguageCode = "pt-BR" | "en-US" | "es-ES" | "fr-FR" | "de-DE";

export type Translation = Record<TranslationKey, string>;

export const availableLanguages: Record<
  LanguageCode,
  { name: string; locale: Locale }
> = {
  "pt-BR": { name: "Português", locale: ptBR },
  "en-US": { name: "English", locale: enUS },
  "es-ES": { name: "Español", locale: es },
  "fr-FR": { name: "Français", locale: fr },
  "de-DE": { name: "Deutsch", locale: de },
};

// Portuguese (Brazilian) translations
export const ptBR_translations: Translation = {
  dashboard: "Dashboard",
  subscriptions: "Assinaturas",
  credit_expenses: "Gastos Crédito",
  cash_expenses: "Gastos Dinheiro",
  income: "Receitas",
  settings: "Configurações",
  logout: "Sair",
  total_balance: "Saldo Total",
  monthly_overview: "Visão Mensal",
  expense_categories: "Categorias de Despesas",
  income_sources: "Fontes de Renda",
  recent_transactions: "Transações Recentes",
  view_all: "Ver Tudo",
  add: "Adicionar",
  edit: "Editar",
  delete: "Excluir",
  cancel: "Cancelar",
  save: "Salvar",
  description: "Descrição",
  amount: "Valor",
  category: "Categoria",
  date: "Data",
  no_data: "Sem dados",
  no_transactions: "Nenhuma transação encontrada",
  confirm_delete: "Confirmar exclusão",
  confirm_delete_message: "Tem certeza que deseja excluir este item?",
  yes_delete: "Sim, excluir",
  no_cancel: "Não, cancelar",
  success: "Sucesso",
  error: "Erro",
  please_fill_required_fields: "Por favor, preencha todos os campos obrigatórios",
  invalid_amount: "Por favor, informe um valor válido",
  transaction_added: "Transação adicionada com sucesso",
  transaction_updated: "Transação atualizada com sucesso",
  transaction_deleted: "Transação excluída com sucesso",
  monthly_subscriptions: "Assinaturas Mensais",
  add_subscription: "Adicionar Assinatura",
  manage_subscriptions: "Gerenciar Assinaturas",
  all_subscriptions: "Todas as Assinaturas",
  recurring: "Recorrente",
  plan_details: "Detalhes do Plano",
  billing_cycle: "Ciclo de Cobrança",
  next_payment: "Próximo Pagamento",
  total: "Total",
  actions: "Ações",
  subscription_added: "Assinatura adicionada com sucesso",
  subscription_deleted: "Assinatura excluída com sucesso",
  weekly: "Semanal",
  monthly: "Mensal",
  quarterly: "Trimestral",
  yearly: "Anual",
  auto_renew: "Renovação Automática",
  other: "Outros",
  entertainment: "Entretenimento",
  utilities: "Utilidades",
  food: "Alimentação",
  transportation: "Transporte",
  housing: "Moradia",
  insurance: "Seguros",
  medical: "Médico",
  personal: "Pessoal",
  education: "Educação",
  clothing: "Vestuário",
  gifts: "Presentes",
  investments: "Investimentos",
  no_subscriptions: "Nenhuma assinatura",
  no_subscriptions_description: "Você ainda não tem nenhuma assinatura cadastrada",
  add_credit_expense: "Adicionar Compra no Crédito",
  manage_credit_expenses: "Gerencie suas compras a prazo e parceladas",
  monthly_installments: "Parcelas Mensais",
  installments: "Parcelas",
  current_month_payments: "Pagamentos do mês atual",
  outstanding_balance: "Saldo Devedor",
  remaining_credit_commitments: "Compromissos futuros",
  current_billing_cycle: "Ciclo de Faturamento",
  credit_card: "Cartão de Crédito",
  credit_installments: "Parcelas no Crédito",
  active_credit_plans: "Compras parceladas ativas",
  progress: "Progresso",
  monthly_payment: "Valor Mensal",
  no_credit_expenses: "Nenhuma compra no crédito",
  no_credit_expenses_description: "Você ainda não tem nenhuma compra no crédito cadastrada",
  invalid_installments: "Por favor, informe um número válido de parcelas",
  credit_expense_added: "Compra no crédito adicionada",
  credit_expense_deleted: "Compra no crédito excluída",
  expense_removed: "Despesa removida com sucesso",
  add_credit_expense_description: "Adicione uma nova compra parcelada no cartão",
  select_category: "Selecione uma categoria",
  choose_card: "Escolha um cartão",
  total_future_payments: "Total de pagamentos futuros",
  active_installment_plans: "planos de parcelamento ativos",
  start_date: "Data da Compra",
  closing_date: "Data de Fechamento",
  due_date: "Data de Vencimento",
  current_cycle_usage: "Uso no Ciclo Atual",
  no_credit_cards: "Nenhum cartão de crédito",
  salary: "Salário",
  freelance: "Freelance",
  rental: "Aluguel",
  add_income: "Adicionar Receita",
  manage_income: "Gerenciar Receitas",
  all_income: "Todas as Receitas",
  income_sources: "Fontes de Receita",
  income_added: "Receita adicionada com sucesso",
  income_deleted: "Receita excluída com sucesso",
  source: "Fonte",
  no_income: "Nenhuma receita",
  no_income_description: "Você ainda não tem nenhuma receita cadastrada",
  add_cash_expense: "Adicionar Despesa em Dinheiro",
  manage_cash_expenses: "Gerenciar Despesas em Dinheiro",
  cash_expenses_this_month: "Despesas em Dinheiro (Este Mês)",
  categories_distribution: "Distribuição por Categorias",
  all_cash_expenses: "Todas as Despesas em Dinheiro",
  cash_expense_added: "Despesa em dinheiro adicionada",
  cash_expense_deleted: "Despesa em dinheiro excluída",
  no_cash_expenses: "Nenhuma despesa em dinheiro",
  no_cash_expenses_description: "Você ainda não tem nenhuma despesa em dinheiro cadastrada",
  days_ago: "dias atrás",
  today: "hoje",
  yesterday: "ontem",
  last_week: "semana passada",
  older: "mais antigo",
  app_settings: "Configurações do App",
  appearance: "Aparência",
  language: "Idioma",
  themes: "Temas",
  system: "Sistema",
  light: "Claro",
  dark: "Escuro",
  user_preferences: "Preferências do Usuário",
  currency: "Moeda",
  categories: "Categorias",
  security: "Segurança",
  account: "Conta",
  language_changed: "Idioma alterado com sucesso",
  theme_changed: "Tema alterado com sucesso",
  settings_saved: "Configurações salvas com sucesso",
  all_expenses: "Todas as Despesas",
  monthly_average: "Média Mensal",
  highest_month: "Mês Mais Alto",
  lowest_month: "Mês Mais Baixo",
  last_6_months: "Últimos 6 Meses",
  income_vs_expenses: "Receitas vs Despesas",
  balance_evolution: "Evolução do Saldo",
  month: "Mês",
  last_12_months: "Últimos 12 Meses",
  not_found: "Não Encontrado",
  page_not_found: "Página não encontrada",
  return_home: "Voltar para o Início",
  add_category: "Adicionar Categoria",
  category_name: "Nome da Categoria",
  category_color: "Cor da Categoria",
  category_name_required: "Nome da categoria é obrigatório",
  category_type_required: "Tipo da categoria é obrigatório",
  category_added: "Categoria adicionada com sucesso",
  category_updated: "Categoria atualizada com sucesso",
  category_deleted: "Categoria excluída com sucesso",
  customize_expense_categories: "Personalize suas categorias de despesas",
  edit_category: "Editar Categoria",
  edit_category_description: "Modifique os detalhes da categoria",
  add_category_description: "Adicione uma nova categoria para classificar suas transações",
  type: "Tipo",
  no_categories_description: "Adicione categorias para organizar suas finanças",
  manage_security: "Gerenciar Segurança",
  add_credit_card: "Adicionar Cartão",
  edit_credit_card: "Editar Cartão",
  card_name: "Nome do Cartão",
  last_four_digits: "Últimos 4 dígitos",
  credit_limit: "Limite de crédito",
  card_color: "Cor do cartão",
  card_name_required: "Nome do cartão é obrigatório",
  invalid_closing_day: "Dia de fechamento inválido",
  invalid_due_day: "Dia de vencimento inválido",
  card_updated: "Cartão atualizado com sucesso",
  card_added: "Cartão adicionado com sucesso",
  card_deleted: "Cartão excluído com sucesso",
  manage_credit_cards: "Gerenciar Cartões de Crédito",
  credit_card_description: "Configure seus cartões de crédito para acompanhar gastos",
  card_name_placeholder: "Ex: Nubank, Itaú Platinum",
  no_credit_cards_description: "Adicione cartões para controlar seus gastos",
  manage_categories: "Gerenciar Categorias",
  security_settings: "Configurações de Segurança",
  appearance_settings: "Configurações de Aparência",
  manage_settings: "Gerencie suas preferências do aplicativo",
  configure_appearance: "Configure a aparência do aplicativo",
  select_language: "Selecione o idioma",
  choose_theme: "Escolha o tema",
  set_currency: "Definir moeda",
  first_installment: "Primeira Parcela",
  billing_preview: "Previsão de Faturamento",
  will_be_billed_on: "Será cobrado em",
  installment: "Parcela",
  first_installment_on: "Primeira parcela em",
  first_installment_billed_on: "Primeira parcela cobrada em",
  billing_cycle_progress: "Progresso do ciclo de faturamento",
  add_credit_card_to_see_cycle: "Adicione um cartão para ver o ciclo de faturamento"
};

// English translations
export const enUS_translations: Translation = {
  dashboard: "Dashboard",
  subscriptions: "Subscriptions",
  credit_expenses: "Credit Expenses",
  cash_expenses: "Cash Expenses",
  income: "Income",
  settings: "Settings",
  logout: "Logout",
  total_balance: "Total Balance",
  monthly_overview: "Monthly Overview",
  expense_categories: "Expense Categories",
  income_sources: "Income Sources",
  recent_transactions: "Recent Transactions",
  view_all: "View All",
  add: "Add",
  edit: "Edit",
  delete: "Delete",
  cancel: "Cancel",
  save: "Save",
  description: "Description",
  amount: "Amount",
  category: "Category",
  date: "Date",
  no_data: "No data",
  no_transactions: "No transactions found",
  confirm_delete: "Confirm deletion",
  confirm_delete_message: "Are you sure you want to delete this item?",
  yes_delete: "Yes, delete",
  no_cancel: "No, cancel",
  success: "Success",
  error: "Error",
  please_fill_required_fields: "Please fill all required fields",
  invalid_amount: "Please enter a valid amount",
  transaction_added: "Transaction added successfully",
  transaction_updated: "Transaction updated successfully",
  transaction_deleted: "Transaction deleted successfully",
  monthly_subscriptions: "Monthly Subscriptions",
  add_subscription: "Add Subscription",
  manage_subscriptions: "Manage Subscriptions",
  all_subscriptions: "All Subscriptions",
  recurring: "Recurring",
  plan_details: "Plan Details",
  billing_cycle: "Billing Cycle",
  next_payment: "Next Payment",
  total: "Total",
  actions: "Actions",
  subscription_added: "Subscription added successfully",
  subscription_deleted: "Subscription deleted successfully",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
  auto_renew: "Auto Renew",
  other: "Other",
  entertainment: "Entertainment",
  utilities: "Utilities",
  food: "Food",
  transportation: "Transportation",
  housing: "Housing",
  insurance: "Insurance",
  medical: "Medical",
  personal: "Personal",
  education: "Education",
  clothing: "Clothing",
  gifts: "Gifts",
  investments: "Investments",
  no_subscriptions: "No subscriptions",
  no_subscriptions_description: "You don't have any subscriptions yet",
  add_credit_expense: "Add Credit Purchase",
  manage_credit_expenses: "Manage your installment purchases",
  monthly_installments: "Monthly Installments",
  installments: "Installments",
  current_month_payments: "Current month payments",
  outstanding_balance: "Outstanding Balance",
  remaining_credit_commitments: "Future commitments",
  current_billing_cycle: "Current Billing Cycle",
  credit_card: "Credit Card",
  credit_installments: "Credit Installments",
  active_credit_plans: "Active installment plans",
  progress: "Progress",
  monthly_payment: "Monthly Payment",
  no_credit_expenses: "No credit purchases",
  no_credit_expenses_description: "You don't have any credit purchases yet",
  invalid_installments: "Please enter a valid number of installments",
  credit_expense_added: "Credit purchase added",
  credit_expense_deleted: "Credit purchase deleted",
  expense_removed: "Expense removed successfully",
  add_credit_expense_description: "Add a new installment purchase on your card",
  select_category: "Select a category",
  choose_card: "Choose a card",
  total_future_payments: "Total of future payments",
  active_installment_plans: "active installment plans",
  start_date: "Purchase Date",
  closing_date: "Closing Date",
  due_date: "Due Date",
  current_cycle_usage: "Current Cycle Usage",
  no_credit_cards: "No credit cards",
  salary: "Salary",
  freelance: "Freelance",
  rental: "Rental",
  add_income: "Add Income",
  manage_income: "Manage Income",
  all_income: "All Income",
  income_sources: "Income Sources",
  income_added: "Income added successfully",
  income_deleted: "Income deleted successfully",
  source: "Source",
  no_income: "No income",
  no_income_description: "You don't have any income yet",
  add_cash_expense: "Add Cash Expense",
  manage_cash_expenses: "Manage Cash Expenses",
  cash_expenses_this_month: "Cash Expenses (This Month)",
  categories_distribution: "Distribution by Categories",
  all_cash_expenses: "All Cash Expenses",
  cash_expense_added: "Cash expense added",
  cash_expense_deleted: "Cash expense deleted",
  no_cash_expenses: "No cash expenses",
  no_cash_expenses_description: "You don't have any cash expenses yet",
  days_ago: "days ago",
  today: "today",
  yesterday: "yesterday",
  last_week: "last week",
  older: "older",
  app_settings: "App Settings",
  appearance: "Appearance",
  language: "Language",
  themes: "Themes",
  system: "System",
  light: "Light",
  dark: "Dark",
  user_preferences: "User Preferences",
  currency: "Currency",
  categories: "Categories",
  security: "Security",
  account: "Account",
  language_changed: "Language changed successfully",
  theme_changed: "Theme changed successfully",
  settings_saved: "Settings saved successfully",
  all_expenses: "All Expenses",
  monthly_average: "Monthly Average",
  highest_month: "Highest Month",
  lowest_month: "Lowest Month",
  last_6_months: "Last 6 Months",
  income_vs_expenses: "Income vs Expenses",
  balance_evolution: "Balance Evolution",
  month: "Month",
  last_12_months: "Last 12 Months",
  not_found: "Not Found",
  page_not_found: "Page not found",
  return_home: "Return to Home",
  add_category: "Add Category",
  category_name: "Category Name",
  category_color: "Category Color",
  category_name_required: "Category name is required",
  category_type_required: "Category type is required",
  category_added: "Category added successfully",
  category_updated: "Category updated successfully",
  category_deleted: "Category deleted successfully",
  customize_expense_categories: "Customize your expense categories",
  edit_category: "Edit Category",
  edit_category_description: "Modify the category details",
  add_category_description: "Add a new category to classify your transactions",
  type: "Type",
  no_categories_description: "Add categories to organize your finances",
  manage_security: "Manage Security",
  add_credit_card: "Add Credit Card",
  edit_credit_card: "Edit Credit Card",
  card_name: "Card Name",
  last_four_digits: "Last 4 digits",
  credit_limit: "Credit Limit",
  card_color: "Card Color",
  card_name_required: "Card name is required",
  invalid_closing_day: "Invalid closing day",
  invalid_due_day: "Invalid due day",
  card_updated: "Card updated successfully",
  card_added: "Card added successfully",
  card_deleted: "Card deleted successfully",
  manage_credit_cards: "Manage Credit Cards",
  credit_card_description: "Set up your credit cards to track expenses",
  card_name_placeholder: "Ex: Visa, Mastercard Gold",
  no_credit_cards_description: "Add cards to track your expenses",
  manage_categories: "Manage Categories",
  security_settings: "Security Settings",
  appearance_settings: "Appearance Settings",
  manage_settings: "Manage your app preferences",
  configure_appearance: "Configure the app appearance",
  select_language: "Select language",
  choose_theme: "Choose theme",
  set_currency: "Set currency",
  first_installment: "First Installment",
  billing_preview: "Billing Preview",
  will_be_billed_on: "Will be billed on",
  installment: "Installment",
  first_installment_on: "First installment on",
  first_installment_billed_on: "First installment billed on",
  billing_cycle_progress: "Billing cycle progress",
  add_credit_card_to_see_cycle: "Add a credit card to see billing cycle"
};

// Spanish translations
export const esES_translations: Translation = {
  dashboard: "Tablero",
  subscriptions: "Suscripciones",
  credit_expenses: "Gastos de Crédito",
  cash_expenses: "Gastos en Efectivo",
  income: "Ingresos",
  settings: "Configuración",
  logout: "Cerrar Sesión",
  total_balance: "Saldo Total",
  monthly_overview: "Resumen Mensual",
  expense_categories: "Categorías de Gastos",
  income_sources: "Fuentes de Ingresos",
  recent_transactions: "Transacciones Recientes",
  view_all: "Ver Todo",
  add: "Agregar",
  edit: "Editar",
  delete: "Eliminar",
  cancel: "Cancelar",
  save: "Guardar",
  description: "Descripción",
  amount: "Monto",
  category: "Categoría",
  date: "Fecha",
  no_data: "Sin datos",
  no_transactions: "No se encontraron transacciones",
  confirm_delete: "Confirmar eliminación",
  confirm_delete_message: "¿Seguro que quieres eliminar este elemento?",
  yes_delete: "Sí, eliminar",
  no_cancel: "No, cancelar",
  success: "Éxito",
  error: "Error",
  please_fill_required_fields: "Por favor, complete todos los campos obligatorios",
  invalid_amount: "Por favor, introduzca un monto válido",
  transaction_added: "Transacción agregada con éxito",
  transaction_updated: "Transacción actualizada con éxito",
  transaction_deleted: "Transacción eliminada con éxito",
  monthly_subscriptions: "Suscripciones Mensuales",
  add_subscription: "Agregar Suscripción",
  manage_subscriptions: "Administrar Suscripciones",
  all_subscriptions: "Todas las Suscripciones",
  recurring: "Recurrente",
  plan_details: "Detalles del Plan",
  billing_cycle: "Ciclo de Facturación",
  next_payment: "Próximo Pago",
  total: "Total",
  actions: "Acciones",
  subscription_added: "Suscripción agregada con éxito",
  subscription_deleted: "Suscripción eliminada con éxito",
  weekly: "Semanal",
  monthly: "Mensual",
  quarterly: "Trimestral",
  yearly: "Anual",
  auto_renew: "Renovación Automática",
  other: "Otro",
  entertainment: "Entretenimiento",
  utilities: "Servicios Públicos",
  food: "Comida",
  transportation: "Transporte",
  housing: "Vivienda",
  insurance: "Seguro",
  medical: "Médico",
  personal: "Personal",
  education: "Educación",
  clothing: "Ropa",
  gifts: "Regalos",
  investments: "Inversiones",
  no_subscriptions: "Sin suscripciones",
  no_subscriptions_description: "Aún no tienes ninguna suscripción",
  add_credit_expense: "Agregar Gasto a Crédito",
  manage_credit_expenses: "Administra tus compras a plazos",
  monthly_installments: "Cuotas Mensuales",
  installments: "Cuotas",
  current_month_payments: "Pagos del mes actual",
  outstanding_balance: "Saldo Pendiente",
  remaining_credit_commitments: "Compromisos futuros",
  current_billing_cycle: "Ciclo de Facturación Actual",
  credit_card: "Tarjeta de Crédito",
  credit_installments: "Cuotas de Crédito",
  active_credit_plans: "Planes de cuotas activos",
  progress: "Progreso",
  monthly_payment: "Pago Mensual",
  no_credit_expenses: "Sin gastos de crédito",
  no_credit_expenses_description: "Aún no tienes gastos de crédito",
  invalid_installments: "Por favor, introduzca un número válido de cuotas",
  credit_expense_added: "Gasto a crédito agregado",
  credit_expense_deleted: "Gasto a crédito eliminado",
  expense_removed: "Gasto eliminado con éxito",
  add_credit_expense_description: "Agrega una nueva compra a plazos con tu tarjeta",
  select_category: "Seleccionar categoría",
  choose_card: "Elegir tarjeta",
  total_future_payments: "Total de pagos futuros",
  active_installment_plans: "planes de cuotas activos",
  start_date: "Fecha de compra",
  closing_date: "Fecha de Cierre",
  due_date: "Fecha de Vencimiento",
  current_cycle_usage: "Uso del Ciclo Actual",
  no_credit_cards: "Sin tarjetas de crédito",
  salary: "Salario",
  freelance: "Freelance",
  rental: "Alquiler",
  add_income: "Agregar Ingreso",
  manage_income: "Administrar Ingresos",
  all_income: "Todos los Ingresos",
  income_sources: "Fuentes de Ingresos",
  income_added: "Ingreso agregado con éxito",
  income_deleted: "Ingreso eliminado con éxito",
  source: "Fuente",
  no_income: "Sin ingresos",
  no_income_description: "Aún no tienes ingresos",
  add_cash_expense: "Agregar Gasto en Efectivo",
  manage_cash_expenses: "Administrar Gastos en Efectivo",
  cash_expenses_this_month: "Gastos en Efectivo (Este Mes)",
  categories_distribution: "Distribución por Categorías",
  all_cash_expenses: "Todos los Gastos en Efectivo",
  cash_expense_added: "Gasto en efectivo agregado",
  cash_expense_deleted: "Gasto en efectivo eliminado",
  no_cash_expenses: "Sin gastos en efectivo",
  no_cash_expenses_description: "Aún no tienes gastos en efectivo",
  days_ago: "días atrás",
  today: "hoy",
  yesterday: "ayer",
  last_week: "la semana pasada",
  older: "más antiguo",
  app_settings: "Configuración de la App",
  appearance: "Apariencia",
  language: "Idioma",
  themes: "Temas",
  system: "Sistema",
  light: "Claro",
  dark: "Oscuro",
  user_preferences: "Preferencias del Usuario",
  currency: "Moneda",
  categories: "Categorías",
  security: "Seguridad",
  account: "Cuenta",
  language_changed: "Idioma cambiado con éxito",
  theme_changed: "Tema cambiado con éxito",
  settings_saved: "Configuración guardada con éxito",
  all_expenses: "Todos los Gastos",
  monthly_average: "Promedio Mensual",
  highest_month: "Mes Más Alto",
  lowest_month: "Mes Más Bajo",
  last_6_months: "Últimos 6 Meses",
  income_vs_expenses: "Ingresos vs Gastos",
  balance_evolution: "Evolución del Saldo",
  month: "Mes",
  last_12_months: "Últimos 12 Meses",
  not_found: "No Encontrado",
  page_not_found: "Página no encontrada",
  return_home: "Volver al Inicio",
  add_category: "Agregar Categoría",
  category_name: "Nombre de la Categoría",
  category_color: "Color de la Categoría",
  category_name_required: "El nombre de la categoría es obligatorio"
};
