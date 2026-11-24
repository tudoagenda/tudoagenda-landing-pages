# Landings de loja do Agenda Bela

Uma página só, servida em três rotas:

| Rota | Config (`src/config/landing-lojas.ts`) | Indexação |
|---|---|---|
| `/agendabela/app-para-salao-de-beleza` | `LANDING_LOJAS.appParaSalaoDeBeleza` | indexável, no sitemap |
| `/agendabela/black-friday` | `LANDING_LOJAS.blackFriday` (tema `bf`, com validade) | `noindex`, fora do sitemap |
| `/agendabela/oferta` | `LANDING_LOJAS.oferta` (campo `oferta`, sem data) | `noindex`, fora do sitemap, sem JSON-LD |

Não há cadastro na web: o botão principal é o selo oficial da loja do aparelho
(iPhone/iPad → App Store; Android → Google Play; computador → dois selos + QR;
sem JavaScript → dois selos).

## Arquivos

- `markup.ts`: o HTML da página (texto, ordem e classes dos protótipos
  aprovados em 19/11/2026). A Black Friday são as peças `so-tema`/`txt-tema`.
  A oferta são as peças ligadas por `p.oferta` (protótipo `lp4-oferta`,
  aprovado em 24/11/2026).
- `faq-oferta.ts` e `oferta.css`: perguntas e CSS da oferta. O CSS só é
  importado pela rota da oferta e só vale com `data-oferta` em `#lp`.
- `lojas.css`: CSS do protótipo, escopado em `#lp`, mais as regras de produção
  no fim (CTA por aparelho, fim do tema).
- `runtime.js`: animações, links das lojas e medição. Devolve um cleanup.
- `landing-lojas.tsx`: componente de servidor e metadata comum.
- `assets/`: logo e os QR codes (um por rota, com `?ref=qr_desktop`). Gerados
  com `segno` (correção M, `scale=8`, `border=2`); `__tests__/qr.test.ts` lê
  cada um e confere o destino.

## Medição

Todo evento sai por `pushAgendaBelaLojasEvent(slug, …)` com
`landing_type: "campaign"` e o `landing_slug` da rota. Eventos: `lp_view`,
`store_click` e `cta_click`. A medição é ligada antes da animação e não cai com ela. Nunca use `pushAgendaBelaMainEvent` aqui: o teste
`__tests__/rotas.test.tsx` falha se um evento sair com o slug de outra página.

## Oferta Agenda Bela

O desconto é configurado nas lojas; a página só anuncia. Todo CTA leva à loja
do aparelho, como na landing padrão: não há modal de cadastro nem cobrança
pela web.

- **Valores em um lugar só**: `OFERTA_AGENDA_BELA` em
  `src/config/landing-lojas.ts` (preço cheio, preço promocional, meses e
  percentual, em centavos). Para trocar o valor, mude `precoPromoCentavos`: a
  economia é calculada e o teste da config confere que o preço bate com o
  percentual. Nenhum valor é escrito à mão em `markup.ts` nem em
  `faq-oferta.ts` (o teste `oferta.test.tsx` troca a config e procura sobras).
- **Sem data**: a página não diz quando a oferta acaba. Para encerrar:
  `OFERTA_REDIRECT_ATIVO = true` em `next.config.ts`, deploy e invalidação de
  `/agendabela/oferta*` no CloudFront.
- **Medição**: os mesmos eventos e `cta_location` das outras rotas, com
  `landing_slug: "oferta"`.

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
