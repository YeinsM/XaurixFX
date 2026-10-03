import type { Transaction } from '../types';
export function formatMoney(value: string, currency = 'USD') {
 const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(value);
 if (!match) return '—';
 const integer = BigInt(match[2]).toLocaleString('en-US');
 const decimals = (match[3] ?? '').padEnd(2,'0').slice(0,2);
 return `${match[1]}${currency === 'USD' ? '$' : currency + ' '}${integer}.${decimals}`;
}
export const dateLabel = (date: string, long = false) => new Intl.DateTimeFormat('es-DO', { day: 'numeric', month: long ? 'long' : 'short', ...(long ? {year:'numeric'} as const : {}), timeZone:'UTC' }).format(new Date(date));
export type Period = '1M' | '3M' | '6M' | '1Y' | 'ALL';
export function filterPeriod(points: {date:string;value:number}[], period:Period) {
 if (!points.length || period === 'ALL') return points;
 const end = new Date(points[points.length - 1].date).getTime();
 const days = { '1M':30, '3M':90, '6M':180, '1Y':365 }[period];
 return points.filter(p => new Date(p.date).getTime() >= end - days * 86400000);
}
export function transactionCsv(rows:Transaction[]) {
 const cell = (v:string) => '"' + (/^[=+\-@\t\r]/.test(v) ? "'" + v : v).replaceAll('"','""') + '"';
 return '\uFEFF' + [['Fecha','Concepto','Importe USD','Estado'], ...rows.map(r => [r.date,r.label,r.amount,r.status === 'completed' ? 'Completado' : 'Pendiente'])].map(row => row.map(cell).join(',')).join('\r\n');
}
export function exportTransactions(rows:Transaction[]) {
 const url = URL.createObjectURL(new Blob([transactionCsv(rows)], {type:'text/csv;charset=utf-8'}));
 const a = document.createElement('a'); a.href = url; a.download = 'xaurix-movimientos.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
}
