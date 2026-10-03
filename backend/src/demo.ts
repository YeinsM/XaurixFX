export const blockedReason = 'Los depósitos y retiros estarán disponibles cuando se definan y conecten las integraciones PAMM y cripto. No se aceptan fondos en esta versión.';
export const capabilities = { deposits: false, withdrawals: false, reason: blockedReason } as const;

// This public fixture never enters PostgreSQL or an authenticated user's account.
export const demoDashboard = {
  mode: 'demo',
  user: { id: 'demo-investor', name: 'Alejandro Martinez', email: 'alejandro@example.com' },
  account: {
    id: 'XF-DEMO-001', currency: 'USD', balance: '28796.00', principal: '25000.00', profit: '3796.00',
    returnPercent: '15.184', participationPercent: '1.25', valuationAt: '2026-09-08T12:00:00.000Z',
    targetDate: '2027-06-08', status: 'demo',
  },
  // Percentage points, not dollars. This fixture is never used to value real funds.
  performance: [
    { date: '2026-06-08', value: 0 }, { date: '2026-06-15', value: 1.12 },
    { date: '2026-06-22', value: 0.38 }, { date: '2026-06-30', value: 3 },
    { date: '2026-07-06', value: 5.28 }, { date: '2026-07-13', value: 3.96 },
    { date: '2026-07-20', value: 6.96 }, { date: '2026-07-31', value: 8 },
    { date: '2026-08-03', value: 9.52 }, { date: '2026-08-10', value: 8.16 },
    { date: '2026-08-17', value: 11.44 }, { date: '2026-08-24', value: 9.96 },
    { date: '2026-08-31', value: 13.36 }, { date: '2026-09-08', value: 15.184 },
  ],
  transactions: [
    { id: 'demo-return-03', type: 'return', label: 'Resultado ilustrativo · septiembre', date: '2026-09-08', amount: '1796.00', status: 'completed' },
    { id: 'demo-return-02', type: 'return', label: 'Resultado ilustrativo · julio', date: '2026-07-31', amount: '1250.00', status: 'completed' },
    { id: 'demo-return-01', type: 'return', label: 'Resultado ilustrativo · junio', date: '2026-06-30', amount: '750.00', status: 'completed' },
    { id: 'demo-deposit-01', type: 'deposit', label: 'Aporte de ejemplo', date: '2026-06-08', amount: '25000.00', status: 'completed' },
  ],
  capabilities,
};
