---
title: Estudo SEO e GEO para o site institucional da Tudo Agenda
scope: repo:tudoagenda-landing-pages
language: pt-br
status: draft
last_reviewed: 2026-05-25
---

# Estudo SEO e GEO para o site institucional da Tudo Agenda

## Objetivo

Dar ao `tudoagenda.com.br` uma base técnica e editorial mais clara para busca
tradicional e experiências generativas, sem tentar manipular ranking com volume
artificial de páginas.

GEO aqui significa otimização para respostas e experiências generativas. Na
documentação oficial do Google, AEO/GEO não substitui SEO: as experiências
generativas continuam dependendo de conteúdo indexável, útil, rastreável e bem
estruturado.

## Fontes oficiais consultadas

- Google Search Central — SEO Starter Guide:
  https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google Search Central — Optimizing your website for generative AI features:
  https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google Search Central — Favicon in Search:
  https://developers.google.com/search/docs/appearance/favicon-in-search
- Google Search Central — Structured data:
  https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- OpenAI — Overview of OpenAI Crawlers:
  https://developers.openai.com/api/docs/bots

## Diagnóstico

O redesign melhorou a clareza da primeira dobra e passou a posicionar a Tudo
Agenda como criadora de SaaS verticais, com o Agenda Bela listado como produto
do portfólio. O principal gap técnico era a ausência de uma base institucional
de SEO no App Router: metadata global, canonical, Open Graph, sitemap, robots e
dados estruturados.

O favicon anterior era genérico para a nova fase da marca. Para busca, o Google
recomenda um favicon quadrado, representativo da marca, rastreável por
Googlebot-Image e preferencialmente maior que 48x48px. Por isso o favicon foi
recriado com o símbolo da Tudo Agenda, em vez do logo horizontal.

## Implementado neste PR

- Metadata global da home institucional:
  - title default e template;
  - description focada em SaaS verticais e agentes digitais;
  - canonical para `/`;
  - Open Graph e Twitter card.
- Favicon e ícones:
  - `src/app/favicon.ico`;
  - `src/app/icon.png`;
  - `src/app/apple-icon.png`;
  - `public/brand/tudo-agenda/favicon.png`;
  - `public/brand/tudo-agenda/mark.svg`.
- `robots.txt` via `src/app/robots.ts`:
  - permite rastreamento geral;
  - explicita permissão para `OAI-SearchBot` e `ChatGPT-User`;
  - aponta para sitemap.
- `sitemap.xml` via `src/app/sitemap.ts`:
  - home;
  - landing do Agenda Bela;
  - privacidade;
  - termos.
- JSON-LD na home:
  - `Organization` para a Tudo Agenda;
  - `WebSite` para o domínio;
  - `SoftwareApplication` para o Agenda Bela.

## Estratégia recomendada

### SEO

1. Manter a home como página institucional enxuta, com entidade clara:
   "Tudo Agenda" cria SaaS verticais com agentes digitais para pequenos
   negócios.
2. Usar páginas de produto separadas para intenção transacional. O Agenda Bela
   já tem a URL correta em `/agendabela/automatize-seu-atendimento`.
3. Evitar criar páginas genéricas em massa do tipo "software para nicho X" sem
   produto real, prova ou conteúdo próprio. Isso tende a ser conteúdo commodity.
4. Acompanhar Search Console depois do deploy:
   - indexação da home;
   - cobertura do sitemap;
   - aparência do favicon;
   - consultas com marca e consultas por categoria.

### GEO

1. Priorizar conteúdo rastreável em HTML, com afirmações objetivas sobre empresa,
   produtos e público atendido.
2. Manter dados estruturados consistentes com o que aparece para o usuário. Não
   marcar claims invisíveis, métricas não comprovadas ou produtos futuros como
   se já estivessem ativos.
3. Permitir crawlers de busca generativa que geram descoberta e tráfego, como
   `OAI-SearchBot`. A documentação da OpenAI separa esse crawler de `GPTBot`,
   que é voltado a treinamento.
4. Usar o portfólio para fortalecer entidade e relação entre marca mãe e produtos:
   Tudo Agenda -> Agenda Bela -> profissionais de beleza feminina.

## Próximos passos fora deste PR

- Criar páginas institucionais leves quando houver conteúdo real:
  - `/sobre`;
  - `/produtos`;
  - `/contato`.
- Criar uma página editorial ou estudo de caso do Agenda Bela somente quando
  houver material factual: problema, solução, jornada, aprendizados, screenshots
  e resultados permitidos.
- Validar produção com:
  - Google Search Console URL Inspection;
  - Rich Results Test;
  - PageSpeed Insights;
  - teste manual de `robots.txt` e `sitemap.xml`.

