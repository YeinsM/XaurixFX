import { describe, expect, it } from 'vitest';
import { economicCalendar, marketOverview, newsFeed, screenerGainers, stockHeatmap, tapeSymbols, tvScriptUrl, tvSymbolFor } from './tvWidgets';

const widgets = { economicCalendar, marketOverview, newsFeed, screenerGainers, stockHeatmap };

describe('TradingView widgets', () => {
  it('every widget is dark, transparent and in Spanish', () => {
    for (const widget of Object.values(widgets)) {
      expect(widget.config).toMatchObject({ colorTheme: 'dark', isTransparent: true, locale: 'es' });
    }
  });

  it('builds official embed script URLs', () => {
    expect(tvScriptUrl('market-overview')).toBe('https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js');
  });

  it('market overview has tabs with symbols', () => {
    const tabs = marketOverview.config.tabs as { title: string; symbols: { s: string; d: string }[] }[];
    expect(tabs.length).toBeGreaterThanOrEqual(4);
    expect(tabs.every(tab => tab.title && tab.symbols.length > 0)).toBe(true);
  });

  it('maps our symbols to TradingView symbols and drops unknown ones', () => {
    expect(tvSymbolFor('BTC')).toBe('COINBASE:BTCUSD');
    expect(tvSymbolFor('NOPE')).toBeNull();
    expect(tapeSymbols(['BTC', 'NOPE', 'EURUSD'])).toEqual([
      { proName: 'COINBASE:BTCUSD', title: 'Bitcoin' },
      { proName: 'FX:EURUSD', title: 'EUR/USD' },
    ]);
  });

  it('falls back to a default tape when the list is empty', () => {
    expect(tapeSymbols([]).length).toBeGreaterThan(3);
  });
});

describe('app palette', () => {
  it('market overview uses the app colors for background, lines and accent', () => {
    expect(marketOverview.config).toMatchObject({
      backgroundColor: '#141619',
      plotLineColorGrowing: '#3fb97f',
      plotLineColorFalling: '#e5675c',
    });
    expect(String(marketOverview.config.symbolActiveColor)).toContain('217, 180, 107');
  });
});
