import { describe, expect, it } from 'vitest';
import { formatChange, formatPrice, groupByCategory, minutesAgo, newestFetch, toggleWatch, type MarketAsset } from './market';

const asset = (symbol: string, category: MarketAsset['category'], price: number | null = 1): MarketAsset => ({
  symbol, name: symbol, category, price, changePercent: null, fetchedAt: price === null ? null : '2026-11-15T10:00:00Z', sourceTime: null,
});

describe('market helpers', () => {
  it('groups assets by category keeping order', () => {
    const groups = groupByCategory([asset('BTC', 'crypto'), asset('SPX', 'index'), asset('ETH', 'crypto')]);
    expect(groups.crypto.map(a => a.symbol)).toEqual(['BTC', 'ETH']);
    expect(groups.index.map(a => a.symbol)).toEqual(['SPX']);
    expect(groups.forex).toEqual([]);
  });

  it('formats prices by category precision and handles missing data', () => {
    expect(formatPrice(1.10211, 'forex')).toBe('1,10211');
    expect(formatPrice(64639, 'crypto')).toBe('64.639,00');
    expect(formatPrice(null, 'index')).toBe('—');
  });

  it('formats signed percentage changes', () => {
    expect(formatChange(1.234)).toEqual({ text: '+1,23%', tone: 'up' });
    expect(formatChange(-0.5)).toEqual({ text: '-0,50%', tone: 'down' });
    expect(formatChange(0)).toEqual({ text: '0,00%', tone: 'flat' });
    expect(formatChange(null)).toEqual({ text: '—', tone: 'flat' });
  });

  it('toggles watchlist symbols without mutating the input', () => {
    const original = ['BTC'];
    expect(toggleWatch(original, 'ETH')).toEqual(['BTC', 'ETH']);
    expect(toggleWatch(original, 'BTC')).toEqual([]);
    expect(original).toEqual(['BTC']);
  });

  it('computes minutes since the newest update', () => {
    const assets = [asset('A', 'index'), { ...asset('B', 'index'), fetchedAt: '2026-11-15T10:30:00Z' }, asset('C', 'index', null)];
    expect(newestFetch(assets)).toBe('2026-11-15T10:30:00Z');
    expect(minutesAgo('2026-11-15T10:30:00Z', new Date('2026-11-15T10:45:00Z'))).toBe(15);
    expect(newestFetch([asset('C', 'index', null)])).toBeNull();
  });
});
