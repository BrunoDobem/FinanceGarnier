import React, { useState } from 'react';
import { InvoiceCalculator } from '@/lib/InvoiceCalculator';
import { InvoiceStatus } from './InvoiceStatus';

interface Purchase {
  date: Date;
  amount: number;
  installments: number;
  paidInstallments: number[];
  unpaidInstallments?: number[];
}

interface PurchaseManagerProps {
  dueDayOfMonth: number;
}

export const PurchaseManager: React.FC<PurchaseManagerProps> = ({ dueDayOfMonth }) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [newPurchase, setNewPurchase] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    installments: 1
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | undefined>();

  const calculator = new InvoiceCalculator(dueDayOfMonth);

  const handleAddPurchase = () => {
    const purchase: Purchase = {
      date: new Date(newPurchase.date),
      amount: newPurchase.amount,
      installments: newPurchase.installments,
      paidInstallments: [],
      unpaidInstallments: []
    };

    setPurchases([...purchases, purchase]);
    setSelectedDate(purchase.date);
    setSelectedPurchase(purchase);
    setNewPurchase({
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      installments: 1
    });
  };

  const handleDateChange = (date: string) => {
    setNewPurchase({ ...newPurchase, date });
    setSelectedDate(new Date(date));
  };

  const handlePurchaseClick = (purchase: Purchase) => {
    setSelectedDate(purchase.date);
    setSelectedPurchase(purchase);
  };

  const handleToggleInstallment = (purchase: Purchase, installmentNumber: number) => {
    const updatedPurchases = purchases.map(p => {
      if (p === purchase) {
        const paidInstallments = p.paidInstallments || [];
        const unpaidInstallments = p.unpaidInstallments || [];
        
        let newPaidInstallments: number[];
        let newUnpaidInstallments: number[];

        if (paidInstallments.includes(installmentNumber)) {
          // Se estava paga, move para não paga
          newPaidInstallments = paidInstallments.filter(num => num !== installmentNumber);
          newUnpaidInstallments = [...unpaidInstallments, installmentNumber].sort((a, b) => a - b);
        } else if (unpaidInstallments.includes(installmentNumber)) {
          // Se estava marcada como não paga, remove dessa lista
          newPaidInstallments = paidInstallments;
          newUnpaidInstallments = unpaidInstallments.filter(num => num !== installmentNumber);
        } else {
          // Se não estava em nenhuma lista, adiciona como paga
          newPaidInstallments = [...paidInstallments, installmentNumber].sort((a, b) => a - b);
          newUnpaidInstallments = unpaidInstallments;
        }

        const updatedPurchase = {
          ...p,
          paidInstallments: newPaidInstallments,
          unpaidInstallments: newUnpaidInstallments
        };

        setSelectedPurchase(updatedPurchase);
        return updatedPurchase;
      }
      return p;
    });

    setPurchases(updatedPurchases);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <InvoiceStatus 
        dueDayOfMonth={dueDayOfMonth} 
        referenceDate={selectedDate}
        selectedPurchase={selectedPurchase}
      />
      
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Gerenciador de Compras</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Data da Compra</label>
            <input
              type="date"
              value={newPurchase.date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Valor</label>
            <input
              type="number"
              value={newPurchase.amount}
              onChange={(e) => setNewPurchase({ ...newPurchase, amount: parseFloat(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Parcelas</label>
            <input
              type="number"
              min="1"
              max="12"
              value={newPurchase.installments}
              onChange={(e) => setNewPurchase({ ...newPurchase, installments: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleAddPurchase}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Adicionar Compra
          </button>
        </div>

        <div className="space-y-6">
          {purchases.map((purchase, index) => {
            const installments = calculator.calculateInstallments(purchase);
            const firstDueDate = calculator.getFirstInstallmentDueDate(purchase.date);

            return (
              <div 
                key={index} 
                className={`border-t pt-4 ${
                  selectedPurchase === purchase ? 'bg-blue-50' : ''
                }`}
              >
                <div 
                  className="cursor-pointer hover:bg-gray-50 p-2"
                  onClick={() => handlePurchaseClick(purchase)}
                >
                  <h3 className="font-semibold mb-2">
                    Compra de {formatCurrency(purchase.amount)} em {formatDate(purchase.date)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Primeira parcela em: {formatDate(firstDueDate)}
                  </p>
                </div>

                <div className="space-y-2 mt-4">
                  {installments.map((installment) => (
                    <div 
                      key={installment.installmentNumber} 
                      className="flex justify-between items-center text-sm p-2 hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={installment.isPaid}
                          onChange={() => handleToggleInstallment(purchase, installment.installmentNumber)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        />
                        <span>Parcela {installment.installmentNumber}/{purchase.installments}</span>
                      </div>
                      <span>{formatDate(installment.dueDate)}</span>
                      <span className="font-medium">{formatCurrency(installment.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 