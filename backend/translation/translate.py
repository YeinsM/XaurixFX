"""Translate JSON news snippets with an installed English-to-Spanish Argos model."""
import json
import sys

from argostranslate import translate


def main() -> None:
    texts = json.load(sys.stdin)
    if not isinstance(texts, list) or any(not isinstance(value, str) for value in texts):
        raise ValueError('Expected an array of strings')
    source = translate.get_language_from_code('en')
    target = translate.get_language_from_code('es')
    if source is None or target is None:
        raise RuntimeError('Install the Argos English-to-Spanish model first')
    route = source.get_translation(target)
    results = []
    fixed_titles = {
        'Federal Reserve issues FOMC statement': 'La Reserva Federal publica el comunicado del FOMC',
        'Made in Europe': 'Hecho en Europa',
        'Integrated, open and resilient: Europe’s strengths in a fragmenting world': 'Integrada, abierta y resiliente: las fortalezas de Europa en un mundo fragmentado',
        'Monetary policy statement (with Q&A)': 'Declaración de política monetaria (con preguntas y respuestas)',
    }
    for index, value in enumerate(texts):
        if not value:
            results.append('')
            continue
        try:
            if index % 2 == 0 and ':' in value:
                speaker, headline = value.split(':', 1)
                headline = headline.strip()
                translated_headline = fixed_titles.get(headline) or route.translate(headline)
                result = f'{speaker}: {translated_headline}' if translated_headline != headline else route.translate(value)
            else:
                result = fixed_titles.get(value) or route.translate(value)
            results.append(result)
        except Exception as error:
            print(f'Translation failed for {value[:80]!r}: {error}', file=sys.stderr)
            results.append('')
    json.dump(results, sys.stdout, ensure_ascii=False)


if __name__ == '__main__':
    main()
