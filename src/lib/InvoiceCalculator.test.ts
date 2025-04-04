import { InvoiceCalculator, Purchase } from './InvoiceCalculator';

describe('InvoiceCalculator', () => {
  const dueDayOfMonth = 10;
  let calculator: InvoiceCalculator;

  beforeEach(() => {
    calculator = new InvoiceCalculator(dueDayOfMonth);
    // Mock da data atual para 20 de março de 2025
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2025, 2, 20)); // Mês é 0-based (2 = março)
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Cálculo de parcelas', () => {
    it('deve calcular corretamente para compra em dezembro/2024 (8x)', () => {
      const purchase: Purchase = {
        date: new Date(2024, 11, 31), // 31 de dezembro de 2024
        amount: 2222.00,
        installments: 8
      };

      const info = calculator.getInvoiceInfo(new Date(), purchase);
      
      // Em março/2025, deve estar na 3ª parcela (já que passou do dia 10)
      expect(info.currentInstallment).toBe(3);
      expect(info.totalInstallments).toBe(8);
    });

    it('deve calcular corretamente quando ainda não chegou no dia do vencimento', () => {
      // Mudando a data do sistema para 5 de março de 2025 (antes do vencimento)
      jest.setSystemTime(new Date(2025, 2, 5));

      const purchase: Purchase = {
        date: new Date(2024, 11, 31), // 31 de dezembro de 2024
        amount: 2222.00,
        installments: 8
      };

      const info = calculator.getInvoiceInfo(new Date(), purchase);
      
      // Em março/2025, antes do dia 10, deve estar na 2ª parcela
      expect(info.currentInstallment).toBe(2);
    });

    it('deve calcular corretamente para compra futura', () => {
      const purchase: Purchase = {
        date: new Date(2025, 3, 15), // 15 de abril de 2025 (futuro)
        amount: 1000,
        installments: 3
      };

      const info = calculator.getInvoiceInfo(new Date(), purchase);
      
      expect(info.currentInstallment).toBe(0);
    });

    it('deve calcular corretamente quando todas as parcelas já passaram', () => {
      const purchase: Purchase = {
        date: new Date(2024, 6, 15), // 15 de julho de 2024
        amount: 1000,
        installments: 3
      };

      const info = calculator.getInvoiceInfo(new Date(), purchase);
      
      // Em março/2025, todas as 3 parcelas já passaram
      expect(info.currentInstallment).toBe(3);
    });
  });

  describe('Cálculo de datas de vencimento', () => {
    it('deve calcular corretamente a primeira data de vencimento para compra antes do vencimento', () => {
      const purchaseDate = new Date(2024, 11, 5); // 5 de dezembro
      const firstDueDate = calculator.getFirstInstallmentDueDate(purchaseDate);
      
      expect(firstDueDate.getFullYear()).toBe(2024);
      expect(firstDueDate.getMonth()).toBe(11);
      expect(firstDueDate.getDate()).toBe(10);
    });

    it('deve calcular corretamente a primeira data de vencimento para compra após o vencimento', () => {
      const purchaseDate = new Date(2024, 11, 15); // 15 de dezembro
      const firstDueDate = calculator.getFirstInstallmentDueDate(purchaseDate);
      
      expect(firstDueDate.getFullYear()).toBe(2025);
      expect(firstDueDate.getMonth()).toBe(0);
      expect(firstDueDate.getDate()).toBe(10);
    });
  });

  describe('Cálculo de parcelas mensais', () => {
    it('deve gerar corretamente as datas de todas as parcelas', () => {
      const purchase: Purchase = {
        date: new Date(2024, 11, 31), // 31 de dezembro de 2024
        amount: 2222.00,
        installments: 8
      };

      const installments = calculator.calculateInstallments(purchase);
      
      expect(installments.length).toBe(8);
      expect(installments[0].dueDate.getMonth()).toBe(0); // Janeiro
      expect(installments[1].dueDate.getMonth()).toBe(1); // Fevereiro
      expect(installments[2].dueDate.getMonth()).toBe(2); // Março
      expect(installments[7].dueDate.getMonth()).toBe(7); // Agosto
    });
  });
}); 