---
title: Proposta de redesign — site institucional Tudo Agenda
scope: repo:tudoagenda-landing-pages
audience: both
language: pt-br
status: draft
last_reviewed: 2026-05-24
---

# Proposta de redesign — site institucional Tudo Agenda

## Objetivo

Reposicionar o site `tudoagenda.com.br` como presença institucional da
marca-mãe Tudo Agenda, usando a identidade nova e deixando claro que a empresa
cria SaaS verticais com agentes especialistas para pequenos negócios.

O site atual ainda comunica "automação de agenda" de forma genérica e carrega
uma execução visual anterior à nova marca. A nova versão deve parecer mais
madura, proprietária e expansível para novos produtos, sem virar uma landing
page de venda do Agenda Bela.

## Fontes consultadas

- `empresa/estrategia.md` — tese da Tudo Agenda como portfólio de SaaS
  verticais e princípio de "trabalho realizado acima de dashboard".
- `empresa/brand/README.md` — marca-mãe, paleta, tipografia, slogan e conceito
  da curva.
- `produtos/agenda-bela/produto.md` — produto Agenda Bela e tese de agentes.
- `produtos/agenda-bela/personas.md` — contexto do público do Agenda Bela.
- `repos/tudoagenda-landing-pages/src/app/page.tsx` e componentes atuais —
  estrutura vigente do site.
- `repos/agendabela-mobile-app/docs/marketing-assets/brand/README.md` —
  separação entre marca-mãe Tudo Agenda e marca de produto Agenda Bela.

## Diagnóstico do site atual

O site atual tem uma base funcional simples:

- hero full-screen com imagem escura de fundo;
- logo antigo em `public/tudoagenda_logo.svg`;
- headline direta, mas com tom de dor operacional amplo;
- seção "O que fazemos" com texto institucional longo;
- seção "Nossas soluções" focada no Agenda Bela;
- footer básico com política de privacidade.

Principais problemas:

- **Marca visual desatualizada:** o logo em produção é um símbolo geométrico
  antigo, não o lockup novo da Tudo Agenda documentado em `empresa/brand/`.
- **Tom muito genérico:** "automação de atendimento, relacionamento com
  cliente, fluxo de caixa, cadeia de suprimentos" abre muitos temas sem
  materializar a tese de agentes especialistas.
- **Confusão marca-mãe vs produto:** a página mistura o papel institucional da
  Tudo Agenda com a venda do Agenda Bela, mas ainda não cria arquitetura clara
  para futuros SaaS.
- **Visual corporativo comum:** slate escuro, foto genérica e cards simples não
  exploram a curva como asset principal da nova marca.
- **Pouca prova de conceito:** o visitante entende que existe uma solução, mas
  não vê claramente o modelo: cada vertical tem uma equipe de agentes cuidando
  de trabalhos recorrentes.

## Direção recomendada

Criar uma homepage institucional enxuta, com estética editorial-corporativa e
foco em clareza estratégica.

A Tudo Agenda deve aparecer como:

> Uma empresa que cria SaaS verticais onde agentes especialistas assumem partes
> operacionais de pequenos negócios.

Não vender como "mais uma agenda", nem como "automação genérica". A proposta
central é: **menos trabalho manual, mais operação acontecendo por trás**.

## Princípios visuais

1. **Usar a identidade nova como protagonista**
   - Migrar os SVGs oficiais de `empresa/brand/logos/svg/` para `public/brand/`.
   - Usar lockup completo no header e no hero.
   - Manter símbolo/curva como elemento gráfico recorrente, não como decoração
     solta.

2. **Paleta da marca-mãe, sem misturar produto**
   - Fundo principal: `#FFFCEE`.
   - Texto forte: `#1D1D1D`.
   - Texto secundário: `#353839`.
   - Divisores/detalhes: `#A8A8A8` e `#CECECE`.
   - Cores do Agenda Bela aparecem só dentro do bloco do produto.

3. **Curvas como sistema**
   - Usar a curva do logo para criar transições entre seções, máscaras suaves,
     linhas de conexão entre verticais e detalhe em cards de agentes.
   - Evitar orbs, gradientes genéricos e ilustrações abstratas que diluem a
     marca.

4. **Tipografia consistente**
   - Preferir Defante como fonte principal, conforme brand study.
   - Aguilar Playful Display fica para detalhes pontuais, não para todo o site.
   - Enquanto as fontes locais não estiverem integradas, Fraunces/Inter podem
     continuar como fallback temporário, mas a entrega final deve usar as
     fontes oficiais de `agendabela-mobile-app/docs/marketing-assets/brand/fonts/`.

## Estrutura proposta da página

### 1. Header

Conteúdo:

- logo novo Tudo Agenda;
- navegação curta: `O que fazemos`, `Produtos`, `Tese`, `Contato`;
- CTA discreto: `Conhecer Agenda Bela`.

Tratamento:

- header transparente no topo e creme sólido após scroll;
- versão compacta no mobile com menu simples.

### 2. Hero institucional

Headline recomendada:

> SaaS verticais com agentes que trabalham pelo seu negócio.

Subcopy:

> A Tudo Agenda cria soluções para pequenos negócios que precisam vender mais,
> organizar a operação e liberar tempo do trabalho manual.

CTA primário:

> Conheça o Agenda Bela

CTA secundário:

> Ver a tese

Visual:

- fundo creme;
- lockup novo em destaque;
- composição com a curva em escala grande atravessando a área;
- três pequenos exemplos de trabalho realizado:
  - "Secretária confirmou os horários de amanhã";
  - "Analista encontrou horários vazios";
  - "Marketing preparou uma campanha de retorno".

### 3. O que fazemos

Mensagem:

> Transformamos rotinas repetitivas de nichos específicos em agentes
> especialistas que percebem, sugerem e executam trabalho.

Blocos:

- **Vertical primeiro:** cada produto fala a linguagem do nicho.
- **Agentes concretos:** secretária, marketing, financeiro, analista.
- **Trabalho realizado:** menos dashboard, mais ação pronta.

### 4. Como pensamos produto

Mostrar o fluxo que aparece nos documentos estratégicos:

```text
percepcao -> impacto -> acao -> resultado
```

Exemplo visual:

- Percepção: "Amanhã há 4 horários vazios."
- Impacto: "Isso pode representar R$120 a menos no dia."
- Ação: "Preparar mensagem para clientes recorrentes."
- Resultado: "Campanha enviada e resposta registrada."

Essa seção é importante porque diferencia a Tudo Agenda de um SaaS comum.

### 5. Portfólio de SaaS

Bloco atual do Agenda Bela deve ser refeito como item de portfólio, não como
uma seção isolada de venda longa nem como narrativa de "primeiro produto". A
página deve passar maturidade institucional: a Tudo Agenda tem arquitetura para
vários SaaS verticais, e o Agenda Bela aparece como uma das soluções listadas.

Item Agenda Bela:

- logo do app Agenda Bela, com paleta própria;
- prints reais do app Agenda Bela para provar produto sem inventar interface;
- descrição curta:
  > A secretária digital para profissionais da beleza feminina organizarem
  > agenda, atendimentos, lembretes e relatórios.
- bullets:
  - Agendamentos por link, sistema, app e WhatsApp;
  - Lembretes e confirmações automáticas;
  - Relatórios simples para acompanhar faturamento.
- CTA:
  > Conhecer Agenda Bela

Itens futuros:

- slots discretos para novas verticais, sem prometer nomes se ainda não
  estiverem decididos;
- usar linguagem de expansão do portfólio, sem indicar que a empresa está
  "começando agora".

### 6. Tese da Tudo Agenda

Seção curta para reforçar visão:

> Pequenos negócios não precisam de mais telas para administrar. Precisam de
> especialistas digitais cuidando do que consome tempo todos os dias.

Possíveis métricas/provas devem entrar apenas quando existirem dados
validados. Não inventar número de clientes, crescimento ou receita.

### 7. Rodapé

Conteúdo:

- logo novo;
- slogan canônico:
  > Soluções que organizam seu negócio e otimizam seu tempo.
- links legais;
- contato institucional, se houver canal aprovado.

## Copy proposta

### Hero

**Headline:** SaaS verticais com agentes que trabalham pelo seu negócio.

**Subcopy:** Criamos soluções para pequenos negócios que precisam vender mais,
organizar a operação e liberar tempo do trabalho manual.

**CTA:** Conheça o Agenda Bela

### Seção de tese

**Título:** Menos dashboard. Mais trabalho realizado.

**Texto:** Cada produto da Tudo Agenda nasce para um nicho específico e coloca
agentes especialistas para cuidar de rotinas que hoje dependem de mensagem,
memória e esforço manual.

### Seção de produtos

**Título:** Um portfólio de SaaS verticais

**Agenda Bela:** Uma secretária digital para profissionais da beleza feminina.
Ela organiza horários, confirma atendimentos, envia lembretes e ajuda a
profissional a enxergar o dia sem depender de caderno ou WhatsApp o tempo todo.

## Componentes necessários

- `BrandLogo` para o novo logo Tudo Agenda, com variantes clara/escura.
- `Header` institucional novo.
- `HeroInstitutional`.
- `WorkDoneFlow` para o fluxo `percepcao -> impacto -> acao -> resultado`.
- `ProductPortfolioCard`.
- `BrandFooter`.

Evitar reaproveitar o componente atual `ProductItemComponent` como peça
principal, porque ele foi pensado para uma apresentação de produto em tela
dividida e usa paletas de verticais como base. Para a homepage institucional,
os produtos devem aparecer como portfólio dentro do sistema visual neutro da
marca-mãe.

## Assets

Usar:

- `empresa/brand/logos/svg/` como fonte dos novos SVGs da Tudo Agenda;
- `empresa/brand/logos/tudo-agenda-logo.ai` como source editável;
- `repos/agendabela-mobile-app/docs/marketing-assets/brand/fonts/` para
  Defante e Aguilar;
- prints reais do app somente dentro do bloco Agenda Bela, especialmente
  dashboard, agenda e financeiro, para provar produto sem mock falso.

Substituir:

- `public/tudoagenda_logo.svg`;
- `public/tudoagenda_logo_white.svg`;
- uso do hero `public/bg-hero.jpg` como imagem dominante da marca-mãe.

## Plano de implementação

### Fase 1 — Base de marca

- Copiar SVGs oficiais escolhidos para `public/brand/tudo-agenda/`.
- Adicionar fontes oficiais via `next/font/local`.
- Definir tokens CSS da paleta Tudo Agenda em `globals.css` ou no tema Tailwind.
- Criar componente de logo com variantes.

### Fase 2 — Nova homepage

- Reescrever `src/app/page.tsx` com seções institucionais.
- Criar hero novo sem foto genérica.
- Criar seção de tese e fluxo de trabalho realizado.
- Recriar bloco de produtos como portfólio.
- Atualizar footer.

### Fase 3 — Ajustes de qualidade

- Revisar responsivo em mobile, tablet e desktop.
- Garantir acessibilidade básica: contraste, alt text, headings e foco.
- Rodar `npm run build`.
- Validar Lighthouse após a troca visual.

## Riscos e decisões pendentes

- **Canal de contato institucional:** o repo não documenta um email ou WhatsApp
  corporativo aprovado. Não incluir contato inventado.
- **Dados de tração:** existem menções qualitativas no produto, mas não usar
  números de clientes/cadastros na homepage sem validação humana.
- **Fonte em produção:** confirmar licença e forma correta de servir Defante e
  Aguilar no site.
- **Logo canônico:** escolher qual variação SVG oficial será usada como
  lockup principal em fundo creme e em fundo escuro.

## Critério de sucesso

A nova página deve responder, acima da dobra:

1. o que é a Tudo Agenda;
2. por que a empresa existe;
3. quais soluções fazem parte do portfólio;
4. por que o visual pertence à marca nova.

Se o visitante só entender "é um app de agenda", o redesign falhou. Se entender
"é uma empresa de SaaS verticais com especialistas digitais e produtos
organizados em portfólio", a proposta cumpriu o papel institucional.
