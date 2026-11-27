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
- `runtime.js`: animações, links das lojas, medição e o cupom copiável da
  oferta. Devolve um cleanup.
- `landing-lojas.tsx`: componente de servidor e metadata comum.
- `assets/`: logo e os QR codes (um por rota, com `?ref=qr_desktop`). Gerados
  com `segno` (correção M, `scale=8`, `border=2`); `__tests__/qr.test.ts` lê
  cada um e confere o destino.

## Medição

Todo evento sai por `pushAgendaBelaLojasEvent(slug, …)` com
`landing_type: "campaign"` e o `landing_slug` da rota. Eventos: `lp_view`,
`store_click` e `cta_click` (na oferta, também o toque no cupom:
`cta_location` `cupom_copiar_hero` e `cupom_copiar_preco`, e a troca de aba
no "Como usar o cupom": `cupom_aba_iphone` e `cupom_aba_android`, uma vez por
aba por carga; a aba que abre sozinha não conta). A medição é ligada antes da animação e não cai com ela. Nunca use `pushAgendaBelaMainEvent` aqui: o teste
`__tests__/rotas.test.tsx` falha se um evento sair com o slug de outra página.

### Engajamento: `section_view` e `faq_open`

Medem o que a pessoa viu antes de decidir (ou de sair). São engajamento: não
viram conversão no GA4 nem evento da Meta. Código em `medirEngajamento`
(`runtime.js`), com lista de cleanup própria: se quebrar, os links das lojas e
os cliques seguem medidos. Testes em `__tests__/engajamento.test.ts`.

| Evento | Parâmetros | Quando sai |
|---|---|---|
| `section_view` | `section` (`preco`, `faq` e, só na oferta, `cupom`), `device_os`, `in_app_browser` | Uma vez por seção por carga de página, quando 75% do título marcado com `data-sec` está na tela, sem contar os 15% de baixo (onde a seção só encosta e onde fica o CTA fixo do celular). O observador tem dois limiares (75% e 100%): se a leitura do primeiro vier um pouco abaixo, a do título inteiro confirma. Sem `IntersectionObserver`, não sai. |
| `faq_open` | `faq_id`, `device_os`, `in_app_browser` | Quando a pessoa abre uma pergunta (evento `toggle` do `<details>`). Fechar não mede. Uma vez por pergunta por carga de página. |

- **O que conta como "viu o preço"** (`data-sec="preco"` em `markup.ts`): o
  título que mostra o valor. Na landing padrão, o do "Quanto custa"
  (`#preco-titulo`). Na oferta, o do bloco de preço da oferta
  (`#oferta-titulo`); o "Quanto custa" da oferta não mostra valor e não é
  marcado. Na Black Friday há dois (o bloco do tema, `#bloco-titulo`, e o
  "Quanto custa"): vale o primeiro que aparecer, e o evento sai uma vez só.
  Como o bloco de preço fica em alturas diferentes em cada rota, compare
  `section_view` entre períodos da mesma rota, não entre rotas.
- **`section_view` é "esteve na tela", não "rolou até lá"**. Na oferta, a
  faixa e o cartão do topo são links para `#preco`: um toque neles (ou abrir a
  página já em `/agendabela/oferta#preco`) põe o preço na tela e o
  `section_view` com `section: preco` sai sem a pessoa rolar. Medido em
  26/11/2026: abrindo em `#preco` no celular (375×667) o evento sai na carga;
  sem âncora ele não sai na carga nem no computador (1280×720 e 1440×900,
  título do preço em y=1287), mas uma tela bem mais alta alcançaria. Não use
  o evento como medida de rolagem.
- **`faq_id`** vem do campo `id` de `faq.ts` e `faq-oferta.ts` (`data-faq` no
  HTML), não do texto. Mudar a redação da pergunta não muda o id; trocar um id
  quebra a série no GA4 (o teste trava a lista). Pergunta que existe nas duas
  páginas usa o mesmo id. Pergunta nova: id novo em `LojasFaqId`
  (`dataLayer.ts`).
- **GTM**: os nomes têm que bater com os gatilhos `section_view` e `faq_open`
  e com as variáveis `DLV - section` e `DLV - faq_id`. Parâmetro novo entra em
  `LOJAS_RESET_KEYS`.

## Oferta Agenda Bela

O desconto vale com o cupom (decisão de 26/11/2026): não é automático. A
assinante digita o código em "Tenho um cupom", na tela de assinatura do app
(no Android abre um campo do app; no iPhone, a tela de resgate da Apple). O
cupom é configurado nas lojas e no RevenueCat; a página só anuncia. Todo CTA
leva à loja do aparelho, como na landing padrão: não há modal de cadastro nem
cobrança pela web.

- **Cupom em um lugar só**: `OFERTA_AGENDA_BELA.cupom` em
  `src/config/landing-lojas.ts`. Faixa, topo, bloco de preço, perguntas, barra
  fixa e o texto pré-preenchido do WhatsApp saem dele; `oferta.test.tsx` falha
  se o código aparecer escrito em `markup.ts`, `faq-oferta.ts`, `runtime.js`
  ou no CSS. O texto é o da nota 16 da campanha
  (`projetos-compartilhados/lps-campanha-nov-2026/notas/16-bolt-cupom-bela50.md`
  no Companion OS).
- **Cupom não dá o teste** (regra do Miguel, 26/11/2026): o cupom é só o
  desconto; os 7 dias são o teste do app, que já existe e vale com ou sem
  cupom. Nenhum texto pode dizer que o cupom dá os 7 dias ("o cupom dá 7
  dias", "com o cupom, você testa"). `oferta.test.tsx` varre a página inteira
  atrás disso.
- **Cupom copiável** (`cupomCopiavel` em `markup.ts`, `ligarCupom` em
  `runtime.js`, bloco 5 de `oferta.css`): o próprio código é um
  `<button type="button">`, no topo (logo abaixo do cartão de preço, que é um
  link e por isso não pode conter o botão) e no bloco de preço. O toque copia
  (`navigator.clipboard`; se falhar, `execCommand("copy")` num campo
  temporário), o aviso troca para "Cupom copiado!" por 2,5 s e a região
  `aria-live` repete. Se nada copiar, a caixa volta à versão em texto, com o
  código selecionado e o aviso de como copiar à mão (segurar o dedo num
  botão não abre o menu de copiar no WebKit); esse estado não volta sozinho.
  Os avisos têm duas redações, escolhidas por CSS
  (`@media (hover:hover) and (pointer:fine)`): "toque" no celular e "clique"
  com mouse. Toque repetido com o "Cupom copiado!" na tela conta um
  `cta_click` só. Sem JavaScript, ou enquanto o runtime não ligou a
  cópia (`data-cupom-on`), o CSS mostra o código em texto, selecionável, sem o
  aviso de copiar.
- **Como usar o cupom** (`blocoPassosCupom` em `markup.ts`,
  `ligarAbasCupom` em `runtime.js`, bloco 6 de `oferta.css`): logo depois do
  bloco de preço, o passo a passo do iPhone (tela da Apple) e do Android
  (campo do app), começando por atualizar o app (o link "Tenho um cupom" só
  existe a partir da 1.11.0). O texto diz "a tela de assinatura" sem nomear
  menu: no app ela aparece no passo do cartão, ao montar a conta, e quando a
  conta fica sem assinatura; em Ajustes → Assinatura, durante o teste, abre o
  cartão de gerenciar, sem o cupom. Abas no padrão WAI-ARIA (setas, Home,
  End), abertas pelo aparelho (`data-os`: Android no Android, iPhone no resto).
  Sem JavaScript, as duas listas aparecem com título. O título do bloco
  (`#cp-titulo`) é o `section_view` `cupom`. Nada no bloco fala do teste nem
  do preço do Google Play (`oferta.test.tsx` trava).
- **Antes de ligar tráfego**: a versão do app com "Tenho um cupom" (1.11.0)
  publicada nas duas lojas e o cupom configurado em App Store Connect, Play
  Console e RevenueCat. Antes disso a página manda digitar um código que não
  tem onde ser digitado.

- **Valores em um lugar só**: `OFERTA_AGENDA_BELA` em
  `src/config/landing-lojas.ts` (preço cheio, preço promocional, meses e
  percentual, em centavos). Para trocar o valor, mude `precoPromoCentavos`: a
  economia é calculada e o teste da config confere que o preço bate com o
  percentual. **Os testes de valor travam o preço publicado de propósito e
  precisam ser atualizados junto** (`src/config/__tests__/landing-lojas.test.ts`
  e `_lojas/__tests__/oferta.test.tsx`): trocar só a config deixa a suíte
  vermelha, que é o aviso de que o preço mudou. Nenhum valor é escrito à mão em `markup.ts` nem em
  `faq-oferta.ts` (o teste `oferta.test.tsx` troca a config e procura sobras).
- **Sem data**: a página não diz quando a oferta acaba. Para encerrar:
  `OFERTA_REDIRECT_ATIVO = true` em `next.config.ts`, deploy e invalidação de
  `/agendabela/oferta*` no CloudFront.
- **Medição**: os mesmos eventos e `cta_location` das outras rotas, com
  `landing_slug: "oferta"`.
- **Link da App Store com campanha**: só nesta rota o link leva `?ct=`
  (`buildAppStoreCampaign`: a `utm_campaign` da sessão, ou `oferta` quando a
  visita chega sem origem). Sem provider token (`pt`) o App Analytics não
  atribui a instalação; o `ct` fica pronto para quando o `pt` existir.
- **Número de uso** ("Mais de 2 mil avisos…"): `OFERTA_PROVA_DE_USO` na
  config, com fonte e data. Nota e número de avaliações das lojas não entram.
- **Primeira tela**: o texto e a ordem do topo seguem os ajustes de
  24/11/2026 (nota 14 da campanha), por cima do protótipo; o botão da loja
  tem que caber na primeira tela em 320×568 e 375×667 (com o cupom, a base do
  botão fica em y=537 em 375×667 e y=556 em 320×568). As outras landings de
  loja não mudam: `oferta.test.tsx` compara o HTML inteiro delas com o de
  antes.

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

## Clique na loja também pelo servidor (API de Conversões)

Vale para todo `store_click` do site (landings de loja, Experimente, landing
principal e reativação), porque é feito no helper central
(`pushLandingEvent`, em `src/lib/analytics/dataLayer.ts`):

1. Cada clique gera um `event_id` (UUID v4) que vai no push do dataLayer. O
   GTM passa esse valor ao Pixel como `eventID`. Nenhum outro evento leva
   `event_id`: ele está nas listas de reset (`MAIN_RESET_KEYS`,
   `EXPERIMENTE_RESET_KEYS`, `LOJAS_RESET_KEYS`) e sai `undefined` em todo
   outro push, para não herdar o do clique anterior.
2. No mesmo clique, `src/lib/analytics/storeClickBeacon.ts` manda
   `navigator.sendBeacon` (ou `fetch` com `keepalive`) para
   `POST /api/agendabela/web-event`, sem esperar resposta:
   `{ event_id, store, cta_location, device_os, in_app_browser, landing_slug, event_source_url, fbclid? }`.
   `store`, `cta_location`, `device_os`, `in_app_browser` e `landing_slug` são
   os mesmos valores do push do dataLayer (saem do mesmo objeto). Página que
   não detecta o navegador interno (Experimente, principal, reativação) ganha
   `in_app_browser` no helper, no push e no envio; `fbclid` só vai se a
   sessão tiver um; da URL só seguem UTMs, `fbclid`, `gclid` e `ref`.
3. A rota (`src/app/api/agendabela/web-event/route.ts`) confere o corpo (listas
   fechadas, tamanhos, URL de `tudoagenda.com.br/agendabela/…`), lê os cookies
   `_fbp` e `_fbc`, o IP e o User-Agent, e repassa ao backend com os mesmos
   cabeçalhos das outras rotas (`buildLandingHeaders`):

   ```
   POST {BACKEND_API_URL}/tracking/web-events
   { "event_name": "StoreClick", "event_id": "<uuid v4>", "event_source_url": "https://tudoagenda.com.br/agendabela/...",
     "custom_data": { "store", "landing_slug", "cta_location", "device_os", "in_app_browser" },
     "user": { "fbp"?, "fbc"?, "client_ip"?, "user_agent"? } }
   ```

   Sem cookie `_fbc` e com `fbclid`, o `fbc` é montado como
   `fb.1.<timestamp_ms>.<fbclid>`. A rota responde 204 sempre que o corpo é
   válido, mesmo com o backend fora. Página em `localhost` nunca repassa ao
   backend de produção. Sem dado pessoal, e o IP não é logado.

Um clique = um `event_id` = um push = um envio. Componente nenhum chama o
envio direto: basta empurrar `store_click` pelo helper da página.
