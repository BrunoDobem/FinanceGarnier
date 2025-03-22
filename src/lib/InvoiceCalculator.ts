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
}

export class InvoiceCalculator {
  private dueDayOfMonth: number;

  constructor(dueDayOfMonth: number) {
    this.dueDayOfMonth = dueDayOfMonth;
  }

  private normalizeDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  }

  private getNextDueDate(date: Date): Date {
    const nextDueDate = new Date(date.getFullYear(), date.getMonth(), this.dueDayOfMonth);
    
    if (date.getDate() > this.dueDayOfMonth) {
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    }
    
    return this.normalizeDate(nextDueDate);
  }

  private getPreviousDueDate(date: Date): Date {
    const previousDueDate = new Date(date.getFullYear(), date.getMonth(), this.dueDayOfMonth);
    
    if (date.getDate() > this.dueDayOfMonth) {
      return this.normalizeDate(previousDueDate);
    }
    
    previousDueDate.setMonth(previousDueDate.getMonth() - 1);
    return this.normalizeDate(previousDueDate);
  }

  private getMonthsDifference(startDate: Date, endDate: Date): number {
    // Normaliza as datas para evitar problemas com horas/minutos/segundos
    const start = this.normalizeDate(startDate);
    const end = this.normalizeDate(endDate);

    // Calcula a diferença em meses
    let months = (end.getFullYear() - start.getFullYear()) * 12 + 
                (end.getMonth() - start.getMonth());

    // Ajusta baseado no dia do vencimento
    if (end.getDate() < this.dueDayOfMonth && start.getDate() <= this.dueDayOfMonth) {
      months--;
    }

    return Math.max(0, months);
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

  public getInvoiceInfo(currentDate: Date, purchase?: Purchase): InvoiceInfo {
    const today = this.normalizeDate(new Date());
    const currentDueDate = this.getPreviousDueDate(currentDate);
    const nextDueDate = this.getNextDueDate(currentDate);

    const daysSinceLastDueDate = Math.floor(
      (currentDate.getTime() - currentDueDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const daysUntilNextDueDate = Math.floor(
      (nextDueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const totalDaysInCycle = Math.floor(
      (nextDueDate.getTime() - currentDueDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const cycleProgress = (daysSinceLastDueDate / totalDaysInCycle) * 100;

    const result: InvoiceInfo = {
      currentDueDate,
      nextDueDate,
      cycleProgress,
      daysUntilNextDueDate,
      daysSinceLastDueDate
    };

    if (purchase) {
      const installmentInfo = this.calculateInstallments(purchase);
      const currentInstallment = this.getCurrentInstallmentNumber(purchase);

      result.currentInstallment = currentInstallment;
      result.totalInstallments = purchase.installments;
      result.paidInstallments = purchase.paidInstallments;
      result.installmentDetails = installmentInfo;
    }

    return result;
  }

  public getFirstInstallmentDueDate(purchaseDate: Date): Date {
    const normalizedDate = this.normalizeDate(purchaseDate);
    const firstDueDate = new Date(normalizedDate.getFullYear(), normalizedDate.getMonth(), this.dueDayOfMonth);
    
    // Se a compra foi feita depois do vencimento, a primeira parcela cai no próximo mês
    if (normalizedDate.getDate() > this.dueDayOfMonth) {
      firstDueDate.setMonth(firstDueDate.getMonth() + 1);
    }
    
    return this.normalizeDate(firstDueDate);
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
      // 2. A data de vencimento já passou
      const isPastDue = this.normalizeDate(dueDate) < today;
      
      return {
        dueDate: this.normalizeDate(dueDate),
        amount: installmentAmount,
        isPaid: paidInstallments.includes(installmentNumber) || isPastDue,
        installmentNumber
      };
    });
  }
} 