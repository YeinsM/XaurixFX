import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AnalysisPage } from './AnalysisPage';

describe('AnalysisPage', () => {
  it('muestra el botón de generar solo a administradores', () => {
    expect(renderToStaticMarkup(<AnalysisPage canGenerate />)).toContain('Generar análisis de hoy');
    expect(renderToStaticMarkup(<AnalysisPage canGenerate={false} />)).not.toContain('Generar análisis de hoy');
  });
});
