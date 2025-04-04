import React from 'react';
import { InvoiceCalculator, Purchase } from '../lib/InvoiceCalculator';

interface InvoiceStatusProps {
  dueDayOfMonth: number;
  referenceDate?: Date;
  selectedPurchase?: Purchase;
}

export const InvoiceStatus: React.FC<InvoiceStatusProps> = ({ dueDayOfMonth, referenceDate, selectedPurchase }) => {
  const calculator = new InvoiceCalculator(dueDayOfMonth);
  const today = new Date();
  const invoiceInfo = calculator.getInvoiceInfo(today, selectedPurchase);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getProgressInfo = () => {
    if (!selectedPurchase || !invoiceInfo.currentInstallment) return null;

    const paidInstallments = invoiceInfo.installmentDetails?.filter(i => i.isPaid) || [];
    const currentInstallment = invoiceInfo.currentInstallment;
    const totalInstallments = selectedPurchase.installments;
    
    // Calcula o progresso baseado na parcela atual
    const progress = (currentInstallment / totalInstallments) * 100;

    // Encontra a próxima parcela não paga
    const nextUnpaidInstallment = invoiceInfo.installmentDetails?.find(i => !i.isPaid);

    return {
      progress: Math.min(100, progress),
      paidCount: paidInstallments.length,
      currentInstallment,
      totalInstallments,
      nextDueInstallment: nextUnpaidInstallment
    };
  };

  const getInstallmentStatusText = () => {
    const info = getProgressInfo();
    if (!info) return '';

    const { currentInstallment, totalInstallments, paidCount } = info;
    return `Parcela ${currentInstallment} de ${totalInstallments} (${paidCount} ${paidCount === 1 ? 'parcela paga' : 'parcelas pagas'})`;
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Status da Fatura</h2>
      
      <div className="space-y-4">
        <div>
          <p className="font-semibold">Data de Referência:</p>
          <p>{formatDate(today)}</p>
        </div>

        {selectedPurchase && (
          <div>
            <p className="font-semibold">Progresso das Parcelas:</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{ width: `${getProgressInfo()?.progress || 0}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {getInstallmentStatusText()}
            </p>
            {getProgressInfo()?.nextDueInstallment && (
              <p className="text-sm text-gray-600 mt-1">
                Próxima parcela a vencer: {formatDate(getProgressInfo()?.nextDueInstallment.dueDate)}
              </p>
            )}
          </div>
        )}

        <div>
          <p className="font-semibold">Vencimento Atual:</p>
          <p>{formatDate(invoiceInfo.currentDueDate)}</p>
        </div>

        <div>
          <p className="font-semibold">Próximo Vencimento:</p>
          <p>{formatDate(invoiceInfo.nextDueDate)}</p>
        </div>

        <div>
          <p className="font-semibold">Progresso do Ciclo:</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${Math.min(100, invoiceInfo.cycleProgress)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {invoiceInfo.cycleProgress.toFixed(1)}% do ciclo completado
          </p>
        </div>

        <div>
          <p className="font-semibold">Dias desde o último vencimento:</p>
          <p>{invoiceInfo.daysSinceLastDueDate} dias</p>
        </div>

        <div>
          <p className="font-semibold">Dias até o próximo vencimento:</p>
          <p>{invoiceInfo.daysUntilNextDueDate} dias</p>
        </div>
      </div>
    </div>
  );
}; 