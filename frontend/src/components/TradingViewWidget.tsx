import { useEffect, useRef, useState } from 'react';
import { tvScriptUrl, type TvWidget } from '../lib/tvWidgets';

const FALLBACK_MS = 3000;

/** Loads a TradingView embed once it nears the viewport. Their attribution link stays untouched. */
export function TradingViewWidget({ widget, title, eager = false }: { widget: TvWidget; title: string; eager?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(eager || typeof IntersectionObserver === 'undefined');
  const configJson = JSON.stringify(widget.config);

  useEffect(() => {
    if (near || !box.current) return;
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) setNear(true); }, { rootMargin: '300px' });
    observer.observe(box.current);
    const fallback = setTimeout(() => setNear(true), FALLBACK_MS); // observers can be throttled (background tabs, embedded browsers)
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, [near]);

  useEffect(() => {
    const container = host.current;
    if (!near || !container) return;
    const inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    const script = document.createElement('script');
    script.src = tvScriptUrl(widget.script);
    script.async = true;
    script.text = configJson;
    container.append(inner, script);
    return () => container.replaceChildren();
  }, [near, widget.script, configJson]);

  return <div ref={box} className="tv-box" role="region" aria-label={title} style={{ minHeight: widget.height }}><div ref={host} className="tradingview-widget-container" style={{ minHeight: widget.height }} /></div>;
}
