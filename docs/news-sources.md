# Fuentes para la sección de noticias — 2026-11-15

## Objetivo editorial
La referencia de Latim Forex presenta un artículo propio con titular, fecha, autor, contexto, tablas con cifras y enlaces a fuentes. Esa estructura sirve como dirección de diseño para Xaurix FX. El texto, las imágenes y los datos del artículo ajeno no se copian.

## Fuentes evaluadas
| Fuente | Qué entrega | Uso previsto | Condición relevante |
|---|---|---|---|
| [Reserva Federal: RSS](https://www.federalreserve.gov/feeds/feeds.htm) | Titulares, fecha, descripción y enlace de comunicados | Feed oficial automático | [Su aviso](https://www.federalreserve.gov/disclaimer.htm) permite copiar información del Board salvo indicación contraria, con atribución; no incluye imágenes de terceros ni sellos. |
| [Banco Central Europeo: RSS](https://www.ecb.europa.eu/home/html/rss.en.html) | Comunicados, discursos, publicaciones | Feed oficial automático | Enlazar al artículo original; revisar [condiciones de reproducción](https://www.ecb.europa.eu/services/using-our-site/disclaimer/html/index.en.html) antes de mostrar texto completo. |
| [TradingView News Feed](https://www.tradingview.com/widget-docs/widgets/news/) | Noticias de múltiples mercados en widget que se actualiza solo | Cobertura amplia, sin extraer su contenido | Mantener la atribución del widget y confirmar términos comerciales antes del despliegue. |
| [FXStreet](https://about.fxstreet.com/economic-calendar-and-other-forex-content-on-your-website-syndication-webmaster/) | Noticias de forex en español y sindicación | Candidato principal para artículos completos en español | RSS gratuito solo para uso no comercial. Para Xaurix FX se requiere acuerdo comercial. |
| [AP Media API](https://developer.ap.org/ap-media-api/) | Texto e imágenes completos vía API | Alternativa con licencia | Solo contenido cubierto por contrato. |
| [Reuters Connect](https://www.reutersconnect.com/about-us) | Contenido periodístico licenciado | Alternativa premium | Requiere acuerdo de licencia. |
| [Marketaux](https://www.marketaux.com/faq) | Titulares, extractos y enlaces; filtros por idioma y activo | Posible agregación adicional | No proporciona artículos completos; confirmar condiciones comerciales del plan. |
| [NewsAPI](https://newsapi.org/pricing) | Titulares y enlaces | Prototipos | Plan Developer solo para desarrollo; no para producción. |

## Implementado
- `GET /api/news` consulta dos RSS oficiales con timeout de 8 segundos, validación de dominio y deduplicación. Cachea el resultado 15 minutos y conserva la última copia en memoria cuando hay fallos de red. No almacena HTML ajeno ni imágenes de terceros.
- `#news` es una sección separada con filtros, una portada editorial y una vista de cada comunicado. El texto completo se abre en la fuente oficial.
- El widget de TradingView aporta titulares de más mercados. No se extraen sus noticias para una base de datos propia.

## Para artículos completos como la referencia
Se necesita una fuente de contenido con derechos de republicación o una redacción propia que genere informes desde datos con licencia y controles de calidad. Prioridad recomendada: negociar sindicación comercial con FXStreet para español. Si se opta por informes automáticos propios, registrar fuente, hora, unidades, método de cálculo, desfase del dato y revisión de cifras antes de publicar; no presentar un resumen generado como noticia verificada sin ese control.
