export type User = { id: string; name: string; email: string };
export type Transaction = { id: string; type: 'deposit' | 'withdrawal' | 'return'; label: string; date: string; amount: string; status: 'completed' | 'pending' };
export type Dashboard = { mode: 'demo' | 'live'; user: User; account: { id: string; currency: string; balance: string; principal: string; profit: string; returnPercent: string | null; participationPercent: string | null; valuationAt: string | null; targetDate: string | null; status: string }; performance: { date: string; value: number }[]; transactions: Transaction[]; capabilities: { deposits: boolean; withdrawals: boolean; reason: string } };
export type Course = { id: string; title: string; category: string; level: string; duration: string; lessons: number; description: string; body: string[]; accent: string };
export type Analysis = { id: string; title: string; category: string; date: string; summary: string; body: string[] };
export type Content = { courses: Course[]; analyses: Analysis[] };
export type Page = 'overview' | 'investment' | 'movements' | 'academy' | 'analysis' | 'community' | 'settings';
