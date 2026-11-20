# Landings de loja do Agenda Bela

Uma página só, servida em duas rotas:

| Rota | Config (`src/config/landing-lojas.ts`) | Indexação |
|---|---|---|
| `/agendabela/app-para-salao-de-beleza` | `LANDING_LOJAS.appParaSalaoDeBeleza` | indexável, no sitemap |
| `/agendabela/black-friday` | `LANDING_LOJAS.blackFriday` (tema `bf`, com validade) | `noindex`, fora do sitemap |

Não há cadastro na web: o botão principal é o selo oficial da loja do aparelho
(iPhone/iPad → App Store; Android → Google Play; computador → dois selos + QR;
sem JavaScript → dois selos).

## Arquivos

- `markup.ts`: o HTML da página (texto, ordem e classes dos protótipos
  aprovados em 19/11/2026). A Black Friday são as peças `so-tema`/`txt-tema`.
- `lojas.css`: CSS do protótipo, escopado em `#lp`, mais as regras de produção
  no fim (CTA por aparelho, fim do tema).
- `runtime.js`: animações, links das lojas e medição. Devolve um cleanup.
- `landing-lojas.tsx`: componente de servidor e metadata comum.
- `assets/`: logo e os QR codes (um por rota, com `?ref=qr_desktop`).

## Medição

Todo evento sai por `pushAgendaBelaLojasEvent(slug, …)` com
`landing_type: "campaign"` e o `landing_slug` da rota. Eventos: `lp_view`,
`store_click` e `cta_click`. Nunca use `pushAgendaBelaMainEvent` aqui: o teste
`__tests__/rotas.test.tsx` falha se um evento sair com o slug de outra página.

## Fim da Black Friday

A data fica só em `BLACK_FRIDAY_THEME_ENDS_AT`. Passada a data, o tema some no
cliente. Depois disso: `BLACK_FRIDAY_REDIRECT_ATIVO = true` em `next.config.ts`,
deploy e invalidação de `/agendabela/black-friday*` no CloudFront.

## Como rodar e testar

```
npm run dev      # http://localhost:3000/agendabela/app-para-salao-de-beleza
npx jest src/app/agendabela/_lojas src/config src/lib/__tests__ src/app/__tests__
```

Para ver cada aparelho, troque o User-Agent no navegador (o `data-os` em `#lp`
mostra o que foi detectado). Para ver o fim do tema, adiante o relógio.
