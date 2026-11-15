export function formatMoney(value: string, currency = 'USD') {
 const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(value);
 if (!match) return '—';
 const integer = BigInt(match[2]).toLocaleString('en-US');
 const decimals = (match[3] ?? '').padEnd(2,'0').slice(0,2);
 return `${match[1]}${currency === 'USD' ? '$' : currency + ' '}${integer}.${decimals}`;
}
