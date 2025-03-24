export interface Installment {
  dueDate: Date;
  amount: number;
  isPaid: boolean;
  installmentNumber: number;
}

export interface Purchase {
  date: Date;
  amount: number;
  installments: number;
  paidInstallments?: number[];
  unpaidInstallments?: number[];
}

export interface InvoiceInfo {
  currentDueDate: Date;
  nextDueDate: Date;
  cycleProgress: number;
  daysUntilNextDueDate: number;
  daysSinceLastDueDate: number;
  currentInstallment?: number;
  totalInstallments?: number;
  paidInstallments?: number[];
  installmentDetails?: Installment[];
  firstDueDate: Date;
}

export class InvoiceCalculator {
  private dueDayOfMonth: number;

  constructor(dueDayOfMonth: number) {
    this.dueDayOfMonth = dueDayOfMonth;
  }

  private normalizeDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private getMonthsDifference(date1: Date, date2: Date): number {
    const yearDiff = date2.getFullYear() - date1.getFullYear();
    const monthDiff = date2.getMonth() - date1.getMonth();
    return yearDiff * 12 + monthDiff;
  }

  public getFirstInstallmentDueDate(purchaseDate: Date): Date {
    const normalizedPurchaseDate = this.normalizeDate(purchaseDate);
    let dueDate = new Date(normalizedPurchaseDate);
    
    // Se a compra foi feita depois do dia de vencimento, a primeira parcela será no próximo mês
    if (normalizedPurchaseDate.getDate() >= this.dueDayOfMonth) {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }
    
    dueDate.setDate(this.dueDayOfMonth);
    return dueDate;
  }

  public getInvoiceInfo(referenceDate: Date, purchase?: Purchase) {
    const today = this.normalizeDate(referenceDate);
    
    // Encontra a data de vencimento atual
    let currentDueDate = new Date(today.getFullYear(), today.getMonth(), this.dueDayOfMonth);
    if (today.getDate() >= this.dueDayOfMonth) {
      currentDueDate.setMonth(currentDueDate.getMonth() + 1);
    }
    
    // Próximo vencimento é sempre um mês depois
    const nextDueDate = new Date(currentDueDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    
    // Calcula o progresso do ciclo atual
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysPassed = today.getDate();
    const cycleProgress = (daysPassed / daysInMonth) * 100;

    // Se não há compra selecionada, retorna apenas as informações do ciclo
    if (!purchase) {
      return {
        currentDueDate,
        nextDueDate,
        cycleProgress
      };
    }

    // Calcula as informações da compra
    const firstDueDate = this.getFirstInstallmentDueDate(purchase.date);
    const installmentDetails = this.calculateInstallments(purchase);
    const currentInstallment = this.getCurrentInstallmentNumber(purchase);

    return {
      currentDueDate,
      nextDueDate,
      cycleProgress,
      firstDueDate,
      currentInstallment,
      installmentDetails
    };
  }

  private getCurrentInstallmentNumber(purchase: Purchase): number {
    const today = this.normalizeDate(new Date());
    const firstDueDate = this.getFirstInstallmentDueDate(purchase.date);
    
    // Se a compra é futura
    if (purchase.date > today) {
      return 0;
    }

    // Calcula quantas parcelas já se passaram
    const monthsPassed = this.getMonthsDifference(firstDueDate, today);
    
    // Adiciona 1 ao número de meses passados para obter a parcela atual
    const currentInstallment = monthsPassed + 1;

    // Limita ao número total de parcelas
    return Math.min(Math.max(1, currentInstallment), purchase.installments);
  }

  public calculateInstallments(purchase: Purchase): Installment[] {
    const firstDueDate = this.getFirstInstallmentDueDate(purchase.date);
    const installmentAmount = purchase.amount / purchase.installments;
    const paidInstallments = purchase.paidInstallments || [];
    const today = this.normalizeDate(new Date());
    
    return Array.from({ length: purchase.installments }, (_, index) => {
      const dueDate = new Date(firstDueDate);
      dueDate.setMonth(firstDueDate.getMonth() + index);
      const installmentNumber = index + 1;
      
      // Uma parcela é considerada paga se:
      // 1. Está no array de parcelas pagas, OU
      // 2. A data de vencimento já passou E não está no array de parcelas não pagas
      const isPastDue = this.normalizeDate(dueDate) < today;
      const isPaid = paidInstallments.includes(installmentNumber) || 
                    (isPastDue && !purchase.unpaidInstallments?.includes(installmentNumber));
      
      return {
        dueDate: this.normalizeDate(dueDate),
        amount: installmentAmount,
        isPaid,
        installmentNumber
      };
    });
  }
} 