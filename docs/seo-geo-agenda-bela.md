---
title: Estudo SEO e GEO para a landing page do Agenda Bela
scope: repo:tudoagenda-landing-pages
language: pt-br
status: draft
last_reviewed: 2026-05-25
---

# Estudo SEO e GEO para a landing page do Agenda Bela

## Objetivo

Preparar a landing `/agendabela/automatize-seu-atendimento` para busca
tradicional e respostas generativas, mantendo a promessa comercial fiel ao
produto real: uma secretária digital para profissionais de beleza feminina e
salões pequenos.

## Fontes oficiais consultadas

- Google Search Central — SEO Starter Guide:
  https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google Search Central — Optimizing your website for generative AI features:
  https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google Search Central — Software App structured data:
  https://developers.google.com/search/docs/appearance/structured-data/software-app
- Google Search Central — Product structured data:
  https://developers.google.com/search/docs/appearance/structured-data/product
- OpenAI — Overview of OpenAI Crawlers:
  https://developers.openai.com/api/docs/bots

## Contexto do produto

O Agenda Bela é um SaaS para profissionais de beleza feminina. A promessa
central não deve ser "mais um sistema de agenda", mas sim uma secretária digital
que trabalha enquanto a profissional atende.

Público primário:

- manicures;
- cabeleireiras;
- esteticistas;
- profissionais autônomas de beleza feminina;
- salões pequenos com operação simples.

Dores principais:

- demora para responder clientes no WhatsApp;
- conflitos de horário;
- falta de confirmação automática;
- dificuldade para lembrar clientes;
- baixa clareza sobre agenda do dia e faturamento.

## Diagnóstico da landing atual

A landing tem boa aderência à dor real da persona: atendimento no WhatsApp,
agenda no celular, confirmação automática e lembretes. O H1 "Tem alguém cuidando
da sua agenda agora" funciona bem para conversão, mas não carrega sozinho todos
os termos que a usuária pode buscar.

O principal gap era técnico:

- metadata da página curta e sem canonical específico;
- ausência de Open Graph/Twitter Card próprio da landing;
- ausência de dados estruturados específicos do produto;
- pouca separação entre afirmações comerciais verificadas e provas sociais ainda
  dependentes de validação.

## Implementado neste PR

- Metadata específica para a landing:
  - title: `Agenda Bela | Secretária digital para salões de beleza`;
  - description focada em confirmação no WhatsApp, lembretes e agenda do dia;
  - canonical para `/agendabela/automatize-seu-atendimento`.
- Open Graph e Twitter Card específicos da landing, usando imagem real do
  Agenda Bela.
- JSON-LD com `SoftwareApplication`, incluindo:
  - nome `Agenda Bela`;
  - categoria `BusinessApplication`;
  - descrição fiel ao produto;
  - lista de features reais;
  - público atendido;
  - preço mensal `R$59,90`.

Não foi adicionado schema de review, rating ou FAQ. Review/rating só deve entrar
com depoimentos reais e autorização. FAQ schema só deve entrar quando as
perguntas e respostas estiverem visíveis na página.

## Estratégia SEO

### Posicionamento recomendado

Usar "secretária digital para salões de beleza" como eixo principal da página.
Esse posicionamento traduz a promessa do produto e evita competir apenas como
"agenda online", termo mais genérico e normalmente mais disputado.

### Clusters de intenção

**Alta intenção comercial**

- secretária digital para salão de beleza;
- sistema de agenda para salão de beleza;
- agenda online para manicure;
- aplicativo de agenda para cabeleireira;
- sistema para profissionais de beleza.

**Dor operacional**

- confirmar agendamento no WhatsApp automaticamente;
- lembrete automático de horário para cliente;
- organizar agenda de salão pelo celular;
- evitar cliente faltar no salão;
- parar de perder cliente por demora no WhatsApp.

**Categoria/produto**

- app para salão de beleza;
- agenda para profissional autônoma de beleza;
- software para salão pequeno;
- sistema para manicure e pedicure;
- gestão simples para salão de beleza.

## Estratégia GEO

Para respostas generativas, a página precisa responder com clareza perguntas
que uma assistente de IA ou buscador conversacional tende a sintetizar:

- o que é o Agenda Bela;
- para quem serve;
- quais tarefas automatiza;
- quanto custa;
- se tem teste grátis;
- se funciona pelo celular;
- se o cliente precisa instalar algo;
- qual é a diferença entre agenda comum e secretária digital.

Recomendação de conteúdo futuro: adicionar uma seção curta de perguntas
frequentes visível na landing. Só depois disso adicionar `FAQPage` no JSON-LD.

## Riscos e cuidados

### Depoimentos

Os depoimentos atuais devem ser tratados como risco até validação humana. Se
forem reais e autorizados, manter e documentar origem/consentimento. Se forem
exemplos, o ideal é remover, substituir por prova institucional ou deixar claro
que são cenários ilustrativos.

Não usar `aggregateRating`, `Review` ou estrelas em dados estruturados enquanto
isso não estiver comprovado.

### Claims numéricos

Frases como "meu no-show caiu pela metade" e "economizando uma hora por dia"
precisam de lastro real. Sem evidência, elas podem prejudicar confiança,
conversão e consistência para respostas generativas.

### Conteúdo invisível

Não marcar FAQ, reviews, preço promocional ou features em schema se a informação
não estiver disponível para o usuário na própria página.

## Próximos passos recomendados

1. Validar os depoimentos atuais com o time.
2. Adicionar uma seção FAQ curta e visível, com respostas objetivas.
3. Criar uma página complementar de comparação:
   `Agenda Bela vs agenda comum no WhatsApp`.
4. Criar uma página por caso de uso somente quando houver conteúdo real:
   manicure, cabeleireira, esteticista.
5. Medir no Search Console:
   - queries de marca;
   - queries de categoria;
   - CTR da landing;
   - indexação do sitemap;
   - elegibilidade do rich result de SoftwareApplication.

