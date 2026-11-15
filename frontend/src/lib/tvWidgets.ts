/** Embeds of TradingView's free widgets (classic script embed). Terms: https://www.tradingview.com/policies/ */
export type TvWidget = { script: string; config: Record<string, unknown>; height: number };

/** Same tokens as src/styles.css (:root and .mk-change). Widgets only accept a few of them. */
export const palette = { background: '#141619', gold: '#d9b46b', up: '#3fb97f', down: '#e5675c', muted: '#95979f', grid: 'rgba(255, 255, 255, 0.06)' } as const;
const rgba = (hex: string, alpha: number) => `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${alpha})`;

const base = { colorTheme: 'dark', isTransparent: true, locale: 'es' } as const;

export const tvScriptUrl = (script: string) => `https://s3.tradingview.com/external-embedding/embed-widget-${script}.js`;

const tvSymbols: Record<string, { pro: string; title: string }> = {
  BTC: { pro: 'COINBASE:BTCUSD', title: 'Bitcoin' },
  ETH: { pro: 'COINBASE:ETHUSD', title: 'Ethereum' },
  SOL: { pro: 'COINBASE:SOLUSD', title: 'Solana' },
  SPX: { pro: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
  DJI: { pro: 'FOREXCOM:DJI', title: 'Dow Jones' },
  NDX: { pro: 'NASDAQ:NDX', title: 'Nasdaq 100' },
  EURUSD: { pro: 'FX:EURUSD', title: 'EUR/USD' },
  GBPUSD: { pro: 'FX:GBPUSD', title: 'GBP/USD' },
  USDJPY: { pro: 'FX:USDJPY', title: 'USD/JPY' },
  AAPL: { pro: 'NASDAQ:AAPL', title: 'Apple' },
  MSFT: { pro: 'NASDAQ:MSFT', title: 'Microsoft' },
  NVDA: { pro: 'NASDAQ:NVDA', title: 'NVIDIA' },
  TSLA: { pro: 'NASDAQ:TSLA', title: 'Tesla' },
};
const defaultTape = ['SPX', 'NDX', 'DJI', 'EURUSD', 'BTC', 'ETH'];

export const tvSymbolFor = (symbol: string): string | null => tvSymbols[symbol]?.pro ?? null;

/** Ticker tape follows the visitor's own list; unknown symbols are dropped. */
export function tapeSymbols(list: readonly string[]): { proName: string; title: string }[] {
  const known = list.filter(symbol => symbol in tvSymbols);
  return (known.length ? known : defaultTape).map(symbol => ({ proName: tvSymbols[symbol]!.pro, title: tvSymbols[symbol]!.title }));
}

export const tickerTape = (list: readonly string[]): TvWidget => ({
  script: 'ticker-tape', height: 78,
  config: { ...base, symbols: tapeSymbols(list), showSymbolLogo: true, displayMode: 'adaptive' },
});

const tab = (title: string, symbols: [string, string][]) => ({ title, symbols: symbols.map(([s, d]) => ({ s, d })) });

export const marketOverview: TvWidget = {
  script: 'market-overview', height: 560,
  config: {
    ...base, dateRange: '12M', showChart: true, backgroundColor: palette.background, gridLineColor: palette.grid, scaleFontColor: palette.muted,
    plotLineColorGrowing: palette.up, plotLineColorFalling: palette.down,
    belowLineFillColorGrowing: rgba(palette.up, 0.12), belowLineFillColorFalling: rgba(palette.down, 0.12),
    belowLineFillColorGrowingBottom: rgba(palette.up, 0), belowLineFillColorFallingBottom: rgba(palette.down, 0),
    symbolActiveColor: rgba(palette.gold, 0.14), showSymbolLogo: true, showFloatingTooltip: true, width: '100%', height: 560,
    tabs: [
      tab('Índices', [['FOREXCOM:SPXUSD', 'S&P 500'], ['FOREXCOM:NSXUSD', 'Nasdaq 100'], ['FOREXCOM:DJI', 'Dow Jones'], ['INDEX:NKY', 'Nikkei 225'], ['INDEX:DEU40', 'DAX'], ['FOREXCOM:UKXGBP', 'FTSE 100']]),
      tab('Materias primas', [['OANDA:XAUUSD', 'Oro'], ['OANDA:XAGUSD', 'Plata'], ['TVC:USOIL', 'Petróleo WTI'], ['TVC:UKOIL', 'Petróleo Brent'], ['CAPITALCOM:NATURALGAS', 'Gas natural'], ['CAPITALCOM:COPPER', 'Cobre']]),
      tab('Divisas', [['FX:EURUSD', 'EUR/USD'], ['FX:GBPUSD', 'GBP/USD'], ['FX:USDJPY', 'USD/JPY'], ['FX:USDCHF', 'USD/CHF'], ['FX:AUDUSD', 'AUD/USD'], ['FX:USDCAD', 'USD/CAD']]),
      tab('Cripto', [['COINBASE:BTCUSD', 'Bitcoin'], ['COINBASE:ETHUSD', 'Ethereum'], ['COINBASE:SOLUSD', 'Solana'], ['BINANCE:XRPUSDT', 'XRP'], ['BINANCE:BNBUSDT', 'BNB'], ['BINANCE:DOGEUSDT', 'Dogecoin']]),
    ],
  },
};

export const economicCalendar: TvWidget = {
  script: 'events', height: 520,
  config: { ...base, width: '100%', height: 520, importanceFilter: '0,1', countryFilter: 'us,eu,gb,jp,cn,es,mx,br,ar,co' },
};

export const newsFeed: TvWidget = {
  script: 'timeline', height: 520,
  config: { ...base, feedMode: 'all_symbols', displayMode: 'regular', width: '100%', height: 520 },
};

export const stockHeatmap: TvWidget = {
  script: 'stock-heatmap', height: 520,
  config: { ...base, exchanges: [], dataSource: 'SPX500', grouping: 'sector', blockSize: 'market_cap_basic', blockColor: 'change', hasTopBar: false, isDataSetEnabled: false, isZoomEnabled: true, hasSymbolTooltip: true, width: '100%', height: 520 },
};

export const screenerGainers: TvWidget = {
  script: 'screener', height: 520,
  config: { ...base, market: 'america', showToolbar: true, defaultColumn: 'overview', defaultScreen: 'top_gainers', width: '100%', height: 520 },
};
