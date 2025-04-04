import React from 'react';
import { Progress } from "@/components/ui/progress";
import { InvoiceCalculator } from '@/lib/InvoiceCalculator';
import { CreditExpense } from '@/types/finance';

interface CreditInstallmentProgressProps {
  expense: CreditExpense;
  dueDayOfMonth: number;
}

export const CreditInstallmentProgress: React.FC<CreditInstallmentProgressProps> = ({ 
  expense, 
  dueDayOfMonth 
}) => {
  const calculator = new InvoiceCalculator(dueDayOfMonth);
  const today = new Date();
  
  const purchase = {
    date: new Date(expense.date),
    amount: expense.amount,
    installments: expense.installments,
    paidInstallments: expense.paidInstallments || []
  };

  const invoiceInfo = calculator.getInvoiceInfo(today, purchase);
  const installments = calculator.calculateInstallments(purchase);

  const getProgressInfo = () => {
    const paidInstallments = installments.filter(i => i.isPaid);
    const totalInstallments = expense.installments;
    const progress = (paidInstallments.length / totalInstallments) * 100;
    
    const nextUnpaidInstallment = installments.find(i => !i.isPaid);
    const currentInstallment = nextUnpaidInstallment 
      ? nextUnpaidInstallment.installmentNumber 
      : totalInstallments;

    return {
      progress: Math.min(100, progress),
      paidCount: paidInstallments.length,
      currentInstallment,
      totalInstallments,
      nextDueInstallment: nextUnpaidInstallment
    };
  };

  const progressInfo = getProgressInfo();
  if (!progressInfo) return null;

  return (
    <div className="space-y-1">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-600 h-2 rounded-full transition-all"
          style={{ width: `${progressInfo.progress}%` }}
        />
      </div>
      <div className="text-sm text-gray-600">
        Parcela {progressInfo.currentInstallment} de {progressInfo.totalInstallments}
        {progressInfo.paidCount > 0 && ` (${progressInfo.paidCount} pagas)`}
      </div>
      {progressInfo.nextDueInstallment && (
        <div className="text-sm text-gray-500">
          Próximo vencimento: {new Date(progressInfo.nextDueInstallment.dueDate).toLocaleDateString('pt-BR')}
        </div>
      )}
    </div>
  );
}; 