import { describe, expect, it } from 'vitest';
import { advancedChart, economicCalendar, marketOverview, newsFeed, screenerGainers, stockHeatmap, tickerTape, tvScriptUrl } from './tvWidgets';

const widgets = { tickerTape, economicCalendar, marketOverview, newsFeed, screenerGainers, stockHeatmap };

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

  it('ticker tape has a default symbol list', () => {
    expect((tickerTape.config.symbols as unknown[]).length).toBeGreaterThan(3);
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

describe('advanced chart', () => {
  it('is a large dark Spanish chart that lets visitors change the symbol', () => {
    expect(advancedChart.script).toBe('advanced-chart');
    expect(advancedChart.height).toBeGreaterThanOrEqual(600);
    expect(advancedChart.config).toMatchObject({ theme: 'dark', locale: 'es', allow_symbol_change: true, width: '100%', backgroundColor: '#141619' });
    expect(advancedChart.config.height).toBe(advancedChart.height);
  });
});
