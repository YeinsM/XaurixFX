export type User = { id: string; name: string; email: string };
export type Course = { id: string; title: string; category: string; level: string; duration: string; lessons: number; description: string; body: string[]; accent: string };
export type Content = { courses: Course[] };
export type Page = 'home' | 'news' | 'academy' | 'broker' | 'community' | 'settings';
