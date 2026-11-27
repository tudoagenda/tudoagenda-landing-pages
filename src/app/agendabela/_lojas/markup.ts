/*
 * HTML das landings de loja do Agenda Bela, gerado a partir dos protótipos
 * aprovados em 19/11/2026 (projetos-compartilhados/lps-campanha-nov-2026 no
 * Companion OS): texto, ordem e classes iguais aos do protótipo.
 * Mesmo desenho do Experimente: o servidor entrega o HTML completo e o
 * runtime (runtime.js) liga o comportamento. Este arquivo é a fonte daqui em
 * diante; edite aqui.
 *
 * Só entram valores de configuração do repo (nenhum dado de usuária), então
 * o HTML montado é seguro para dangerouslySetInnerHTML.
 */
import {
  APP_STORE_URL,
  GOOGLE_PLAY_BASE_URL,
  STORE_BADGES,
} from "@/config/app-stores";
import { LOJAS_FAQ } from "./faq";
import { buildOfertaFaq } from "./faq-oferta";
import {
  COMPANY_LEGAL_IDENTIFICATION,
  SUPPORT_WHATSAPP_URL,
} from "@/config/company";
import {
  OFERTA_PROVA_DE_USO,
  avisosEnviadosEmTexto,
  economiaDaOfertaCentavos,
  formatarCentavos,
  type OfertaConfig,
} from "@/config/landing-lojas";

export type LojasMarkupParams = {
  /** Último trecho da rota: vai no ?ref= do link do rodapé para a landing principal. */
  slug: string;
  /** "bf" liga o tema Black Friday por cima da página padrão. */
  tema: "padrao" | "bf";
  /** Epoch (ms) em que o tema deixa de valer. Só com tema "bf". */
  temaExpiraEm?: number;
  /** Prefixo do ?ref= nos links para o simulador (ex.: "app" vira ref=app_hero). */
  refSimulador: string;
  /**
   * Liga a Oferta Agenda Bela: faixa, cartão no hero, bloco de preço, FAQ
   * própria e os textos de preço da página. Todo valor sai daqui.
   */
  oferta?: OfertaConfig;
  assets: {
    logo: string;
    qr: string;
    santanderX: string;
    foundersClub: string;
  };
  ano: number;
};

const EXPERIMENTE_PATH = "/agendabela/experimente";

function atributo(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/**
 * Roda antes da primeira pintura (está no HTML do servidor, logo depois de
 * abrir #lp): grava o aparelho em data-os, para o CSS mostrar só o CTA dele
 * sem salto de layout, desliga o tema vencido e marca data-pre (ver bloco 4
 * de lojas.css). A regra de aparelho é a de
 * detectDeviceOs (src/lib/device.ts); o teste do markup garante que as duas
 * respondem igual.
 */
export const SCRIPT_ANTES_DA_PINTURA = `<script>(function(){var l=document.getElementById("lp");if(!l)return;var n=navigator,u=n.userAgent||"";l.setAttribute("data-os",/iPhone|iPad|iPod/i.test(u)||(n.platform==="MacIntel"&&n.maxTouchPoints>1)?"ios":/Android/i.test(u)?"android":"desktop");var f=+l.getAttribute("data-tema-fim");if(f&&Date.now()>=f)l.setAttribute("data-tema","padrao");l.setAttribute("data-pre","");setTimeout(function(){l.removeAttribute("data-pre")},8000)})()</script>`;

function temaFim(p: LojasMarkupParams): string {
  return p.tema === "bf" && p.temaExpiraEm
    ? ` data-tema-fim="${p.temaExpiraEm}"`
    : "";
}

/** Texto que muda com o tema: os dois ficam no HTML e o CSS mostra um. */
function variante(p: LojasMarkupParams, padrao: string, tema: string): string {
  return p.tema === "bf"
    ? `<span class="txt-padrao">${padrao}</span><span class="txt-tema">${tema}</span>`
    : padrao;
}

/**
 * Selo oficial da loja como link. Na mesma aba, menos no bloco do computador
 * (novaAba). O runtime troca o href da Play pelo link com a origem da sessão.
 */
function selo(
  store: "app_store" | "google_play",
  className = "",
  novaAba = false,
): string {
  const badge =
    store === "app_store"
      ? { href: APP_STORE_URL, cls: "as", ...STORE_BADGES.appStore }
      : { href: GOOGLE_PLAY_BASE_URL, cls: "gp", ...STORE_BADGES.googlePlay };
  return (
    `<a${className ? ` class="${className}"` : ""} href="${atributo(badge.href)}" data-store="${store}"` +
    (novaAba ? ' target="_blank" rel="noopener noreferrer"' : "") +
    `><img class="${badge.cls}" src="${badge.src}" width="${badge.width}" height="${badge.height}" alt="${badge.alt}">` +
    (novaAba ? '<span class="sr"> (abre em nova aba)</span>' : "") +
    "</a>"
  );
}

/**
 * CTA por aparelho: iPhone/iPad e Android veem o selo da própria loja em
 * cartão; computador vê os dois selos e o QR; sem JavaScript, os dois selos.
 */
function blocoCta(p: LojasMarkupParams, local: "hero" | "preco" | "final"): string {
  return `<div class="cta"${local === "hero" ? ' id="cta-hero"' : ""} data-loc="${local}">
        <div data-dev="ios">${selo("app_store", "storecard")}</div>
        <div data-dev="android">${selo("google_play", "storecard")}</div>
        <div data-dev="desktop" data-loc="${local}_selo"><div class="dt"><p class="dt-tit">Baixe no seu celular</p><div class="dt-row">
          <div class="dt-badges">${selo("app_store", "", true)}${selo("google_play", "", true)}</div>
          <div class="dt-qr"><img src="${p.assets.qr}" width="116" height="116" alt="QR code que abre esta página no celular"><p>Aponte a câmera do celular e abra a loja.</p></div></div></div></div>
        <div data-dev="nojs"><p class="nojs-title">Baixe na sua loja</p><div class="nojs-row">${selo("app_store")}${selo("google_play")}</div></div>
      </div>`;
}

function linkSimulador(
  p: LojasMarkupParams,
  posicao: "hero" | "avaliacoes",
  texto: string,
): string {
  return `<a href="${EXPERIMENTE_PATH}?ref=${p.refSimulador}_${posicao}" data-sim="simulador_${posicao}">${texto}</a>`;
}

function blocoMicro(p: LojasMarkupParams): string {
  if (p.oferta) return blocoMicroOferta(p, p.oferta);
  const preco = `<p class="micro">7 dias grátis, sem cartão para começar. Depois, R$&nbsp;59,90 por mês.</p>`;
  const simulador = `<p class="micro">${linkSimulador(p, "hero", "Prefere ver antes? Teste o app sem cadastro →")}</p>`;
  return `<div id="micro">
        <div data-dev="ios">${preco}<p class="micro">Você abre a App Store, baixa o app e marca sua primeira cliente.</p></div>
        <div data-dev="android">${preco}<p class="micro">Você abre o Google Play, baixa o app e marca sua primeira cliente.</p></div>
        <div data-dev="desktop">${preco}${simulador}</div>
        <div data-dev="nojs">${preco}${simulador}</div>
      </div>`;
}

/**
 * Perguntas rápidas, do array único de faq.ts (o mesmo do JSON-LD). A oferta
 * tem as próprias (faq-oferta.ts), com HTML na resposta. data-faq é o faq_id
 * do evento faq_open (id fixo do dado, não o texto da pergunta).
 */
function blocoFaq(p: LojasMarkupParams): string {
  if (p.oferta) {
    return buildOfertaFaq(p.oferta)
      .map(
        (item) =>
          `    <details data-faq="${item.id}"><summary>${item.pergunta}</summary><p>${item.respostaHtml}</p></details>`,
      )
      .join("\n");
  }
  return LOJAS_FAQ.map(
    (item) =>
      `    <details data-faq="${item.id}"><summary>${item.pergunta}</summary><p>${item.resposta.replace(/R\$ /g, () => "R$&nbsp;")}</p></details>`,
  ).join("\n");
}

function seloRodape(): string {
  return `<div class="foot-badges" data-loc="rodape_selo">${selo("app_store")}${selo("google_play")}</div>`;
}

/** CTA fixo do celular: o runtime mostra quando o CTA do hero sai da tela. */
function blocoFixo(p: LojasMarkupParams): string {
  const apoio = p.oferta
    ? `7 dias grátis · ${p.oferta.cupom} dá ${p.oferta.percentual}% off`
    : "7 dias grátis · depois R$&nbsp;59,90/mês";
  return `<div class="sticky" id="cta-fixo" data-loc="sticky_mobile" hidden>
  <div class="sticky-slot">
    <div data-dev="ios">${selo("app_store", "storecard")}</div>
    <div data-dev="android">${selo("google_play", "storecard")}</div>
  </div>
  <small data-dev="ios">${apoio}</small>
  <small data-dev="android">${apoio}</small>
</div>`;
}

/** QR do Pix de exemplo dentro do celular desenhado (15 × 15, só enfeite). */
const QR_PIX = "111100100101111100101001001001100100000001001111100100101111001001001001001000000000000000100100100100100001001001001001000000000000000100100100100100001001001001001111100000000000100100100100100100101001001001111100000000000"
  .split("")
  .map((bit) => (bit === "1" ? "<i></i>" : '<i class="o"></i>'))
  .join("");

/* ---------- peças do tema Black Friday (classe so-tema: somem no fim do tema) ---------- */
const FRASES_DA_FAIXA = ["Black Friday","A Bela cuida da sua agenda.","Black Friday","Eu lembro. Você atende."];
const METADE_DA_FAIXA = `<div class="rb-half">${[...FRASES_DA_FAIXA, ...FRASES_DA_FAIXA]
  .map((frase) => `<span>${frase}<i></i></span>`)
  .join("")}</div>`;
const FAIXA = `<div class="ribbon so-tema" id="slot-faixa">
  <p class="sr">Black Friday no Agenda Bela</p>
  <div class="rb-clip" aria-hidden="true" data-nosnippet><div class="rb-track">${METADE_DA_FAIXA}${METADE_DA_FAIXA}</div></div>
  <button type="button" class="rb-pause" id="faixa-pausar" aria-label="Pausar o movimento da faixa e dos efeitos" hidden><svg class="ic-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg><svg class="ic-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5l12 7-12 7z"/></svg></button>
</div>`;
const HALO = `<div class="so-tema bf-halo" aria-hidden="true"></div>`;
const TITULO_GIGANTE = `<p class="so-tema bf-big" aria-hidden="true"><span class="bf-l"><span class="bf-w">Black</span></span><span class="bf-l"><span class="bf-w">Friday</span></span></p>`;
const BLOCO_PRECO = `<section class="so-tema bf" id="slot-bloco" aria-labelledby="bloco-titulo"><div class="wrap"><div class="bf-card rv"><span class="pill">Black Friday</span><h2 id="bloco-titulo" data-sec="preco">Apenas <span class="bf-preco">R$&nbsp;59,90 por mês.</span></h2><div><p>Os 7 dias para testar são sem cartão, e você cancela quando quiser. É assim hoje, é assim na Black Friday e é assim depois dela.</p></div></div></div></section>`;

/* ---------- peças da Oferta Agenda Bela (protótipo lp4-oferta, aprovado em 24/11/2026) ---------- */
const reais = (centavos: number) => `R$&nbsp;${formatarCentavos(centavos)}`;
/** Para aria-label: o leitor de tela lê "R$ 59,90" com espaço comum. */
const reaisFalado = (centavos: number) => `R$ ${formatarCentavos(centavos)}`;

/** Faixa do topo: leva ao bloco de preço. */
function faixaOferta(o: OfertaConfig): string {
  return `<a class="ribbon" id="faixa" href="#preco" aria-label="Oferta Agenda Bela: use o cupom ${o.cupom} e tenha ${o.percentual}% de desconto nos ${o.meses} primeiros meses. Ver a oferta."><i aria-hidden="true"></i><span>Cupom ${o.cupom} · ${o.percentual}% de desconto</span></a>`;
}

/**
 * Cartão escuro do hero, enxuto: de/por e o prazo em uma faixa só, para o
 * botão da loja caber na primeira tela do celular pequeno. O que vem depois
 * dos meses da oferta fica na linha de condição, abaixo do botão. O cartão
 * inteiro é um link: o cupom copiável fica fora dele, logo abaixo (botão
 * dentro de link não é HTML válido).
 */
function cartaoOferta(o: OfertaConfig): string {
  const cheio = reaisFalado(o.precoCheioCentavos);
  return `<a class="ofr" href="#preco" aria-label="Oferta Agenda Bela: com o cupom ${o.cupom}, em vez de ${cheio} por mês, ${reaisFalado(o.precoPromoCentavos)} por mês nos ${o.meses} primeiros meses. Depois, volta a ${cheio} por mês. Ver os detalhes.">
        <span class="ofr-top" aria-hidden="true"><span class="ofr-old"><small>em vez de</small><b>${reais(o.precoCheioCentavos)}</b></span><span class="ofr-stk">&minus;${o.percentual}%</span></span>
        <span class="ofr-row" aria-hidden="true"><span class="ofr-new"><i>R$</i>&nbsp;${formatarCentavos(o.precoPromoCentavos)}</span><span class="ofr-cap">por mês nos ${o.meses} primeiros meses</span></span>
      </a>`;
}

const ICONE_COPIAR = `<svg class="cupom-ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6.5A2.5 2.5 0 017.5 4H15"/></svg>`;

/**
 * Cupom copiável: o próprio código é o botão (toque ou clique copia; o
 * runtime liga a cópia, o aviso e a medição pelo data-cupom, que vira o
 * cta_location cupom_copiar_<lugar>). Enquanto o runtime não liga a cópia
 * (data-cupom-on), e sempre sem JavaScript, o CSS mostra a versão em texto,
 * selecionável, sem o aviso de copiar: a página não promete o que não
 * funciona. Se a cópia falhar, o runtime volta a essa versão em texto, com o
 * código selecionado e o aviso .cupom-falha.
 *
 * Cada aviso tem duas redações e o CSS mostra uma: .so-toque (padrão) e
 * .so-mouse (aparelho com mouse: hover e ponteiro fino). Não é pelo User-Agent,
 * para valer também em tablet e notebook com toque.
 */
function cupomCopiavel(o: OfertaConfig, lugar: "hero" | "preco"): string {
  const codigo = `<b class="cupom-cod">${o.cupom}</b>`;
  const hero = lugar === "hero";
  const antes = hero ? `<span class="cupom-pre">Cupom </span>` : "";
  const porAparelho = (toque: string, mouse: string) =>
    `<span class="so-toque">${toque}</span><span class="so-mouse">${mouse}</span>`;
  const sep = hero ? `<span class="cupom-sep" aria-hidden="true">·</span>` : "";
  const copiar = hero
    ? porAparelho("toque para copiar", "clique para copiar")
    : porAparelho("Toque para copiar", "Clique para copiar");
  const aviso = `${sep}${ICONE_COPIAR}<span class="cupom-aviso">${copiar}</span><span class="cupom-msg"></span>`;
  const falha = `<span class="cupom-falha" hidden>${sep}${porAparelho("Segure o código para copiar", "Código selecionado: copie")}</span>`;
  return `<div class="cupom cupom-${lugar}" data-cupom="${lugar}" data-copiado="Cupom copiado!">${
    hero ? "" : `<span class="mono">Seu cupom</span>`
  }<p class="cupom-pill cupom-nojs">${antes}${codigo}${falha}</p><button type="button" class="cupom-pill cupom-btn" aria-label="Copiar o cupom ${o.cupom}">${antes}${codigo}<span class="cupom-dica">${aviso}</span></button><span class="sr cupom-status" aria-live="polite"></span>${
    hero
      ? ""
      : `<p class="cupom-leg">Anote e digite em “Tenho um cupom”, na tela de assinatura do app.</p>`
  }</div>`;
}

/**
 * Linha de condição do CTA do hero: uma só, igual em todo aparelho. O detalhe
 * de como cada loja cobra fica no bloco de preço e nas perguntas.
 */
function blocoMicroOferta(p: LojasMarkupParams, o: OfertaConfig): string {
  const condicao = `<p class="micro">7 dias sem cartão. Na hora de assinar, use o cupom ${o.cupom}. Depois do ${o.meses}º mês, ${reais(o.precoCheioCentavos)} por mês. Cancele quando quiser.</p>`;
  const simulador = `<p class="micro">${linkSimulador(p, "hero", "Prefere ver antes? Teste o app sem cadastro →")}</p>`;
  return `<div id="micro">
        <div data-dev="ios">${condicao}</div>
        <div data-dev="android">${condicao}</div>
        <div data-dev="desktop">${condicao}${simulador}</div>
        <div data-dev="nojs">${condicao}${simulador}</div>
      </div>`;
}

/**
 * Prova perto do botão: número de uso (config, com fonte e data) e o começo
 * de uma avaliação da loja, a mesma das outras landings (é o início literal
 * do texto, com a profissão: o "…" fica só no fim, onde o trecho é cortado).
 * Nota e número de avaliações das lojas não entram.
 */
function blocoProva(): string {
  return `<div class="prova">
        <p class="prova-num"><b>${avisosEnviadosEmTexto(OFERTA_PROVA_DE_USO.avisosEnviados)}</b> enviados às clientes pelo WhatsApp</p>
        <figure><blockquote>&ldquo;Sou manicure e estava procurando uma forma mais prática de organizar meus horários…&rdquo;</blockquote><figcaption>Cintia, avaliação na App Store, set/2026</figcaption></figure>
      </div>`;
}

/** Texto do hero da oferta: marca, o que é o produto, a dor, o preço e o botão da loja. */
function heroTextoOferta(p: LojasMarkupParams, o: OfertaConfig): string {
  return `      <div class="hdr"><img src="${p.assets.logo}" alt=""><div class="marca"><span class="marca-nome">Agenda Bela</span><span class="mono">por Tudo Agenda</span></div></div>
      <span class="mono eyebrow" id="slot-eyebrow">Feito para salão de beleza</span>
      <h1>O app que lembra suas clientes e cobra o sinal no Pix</h1>
      <p class="sub">Pode atender tranquila.</p>
      <p class="dor">Cliente que falta é horário vazio. Eu lembro cada uma e te conto quem confirmou.</p>
      ${cartaoOferta(o)}
      ${cupomCopiavel(o, "hero")}
${blocoCta(p, "hero")}
${blocoMicro(p)}
      <p class="audience">Para cabeleireiras, manicures e esteticistas que atendem sozinhas ou com poucas profissionais.</p>
      ${blocoProva()}`;
}

/** Bloco de preço logo abaixo do hero: de/por, o cupom, linha do tempo, economia e como usar. */
function blocoOferta(o: OfertaConfig): string {
  const cheio = reais(o.precoCheioCentavos);
  const promo = reais(o.precoPromoCentavos);
  return `<section class="oferta" id="preco" aria-labelledby="oferta-titulo"><div class="wrap"><p class="of-ponte">Gostou? Veja quanto custa.</p><div class="of-card" id="oferta-card">
  <span class="ofr-pill of-pill">Oferta Agenda Bela</span>
  <p class="of-was">Em vez de <span class="of-oldp"><b>${cheio}</b></span> por mês</p>
  <h2 id="oferta-titulo" data-sec="preco"><span class="of-newp">${promo}</span><span class="of-per">por mês nos ${o.meses} primeiros meses.</span></h2>
  ${cupomCopiavel(o, "preco")}
  <ol class="tl" aria-label="Como a oferta funciona">
    <li class="tl-i"><span class="tl-n" aria-hidden="true"></span><div><b class="t">Teste de 7 dias</b><span class="v">sem cartão</span></div></li>
    <li class="tl-i tl-hi"><span class="tl-n" aria-hidden="true"></span><div><b class="t">Nos ${o.meses} primeiros meses<span class="sr">:</span></b><span class="v">${promo} por mês com o cupom ${o.cupom}</span></div></li>
    <li class="tl-i"><span class="tl-n" aria-hidden="true"></span><div><b class="t">Do ${o.meses + 1}º mês em diante<span class="sr">:</span></b><span class="v">${cheio} por mês</span></div></li>
  </ol>
  <p class="of-eco">Com o cupom, você economiza <b id="eco-val">${reais(economiaDaOfertaCentavos(o))}</b> se ficar os ${o.meses} meses.</p>
  <div class="of-cond">
    <span class="mono">Como usar</span>
    <p>O cupom vale só para a primeira assinatura do Agenda Bela, feita pelo app. Sem o cupom, o valor é ${cheio} por mês. Passados os ${o.meses} meses, o valor volta para ${cheio} por mês e a cobrança continua todo mês, até você cancelar.</p>
    <p>Você cancela quando quiser, nos ajustes da App Store ou do Google Play.</p>
    <p data-dev="ios">No iPhone, ao tocar em “Tenho um cupom”, abre uma tela da Apple para você digitar ${o.cupom}. A cobrança é mensal: ${promo} todo mês nos ${o.meses} primeiros meses.</p>
    <p data-dev="android">No Android, você digita ${o.cupom} num campo do próprio app. A cobrança é mensal: ${promo} todo mês nos ${o.meses} primeiros meses.</p>
  </div>
  <a class="of-link" href="#faq">Ver as perguntas sobre o <span style="white-space:nowrap">cupom <span aria-hidden="true">↓</span></span></a>
</div></div></section>`;
}

/**
 * "Como usar o cupom": passo a passo por loja, logo depois do bloco de preço
 * (pedido do Miguel, 27/11/2026). O cupom é só o desconto: nada aqui fala do
 * teste (oferta.test.tsx trava). O caminho até a tela de assinatura muda com
 * o estado da conta no app (montando a conta, depois do teste), então o texto
 * não nomeia menu.
 *
 * Sem JavaScript, as duas listas aparecem, cada uma com o seu título. O
 * runtime (ligarAbasCupom) mostra as abas, dá os papéis de tab/tabpanel (e
 * aria-selected/tabindex, que só valem com o papel), abre
 * a do aparelho (Android no Android; iPhone no iPhone e no computador) e
 * esconde o título repetido.
 */
const PLATAFORMAS_CUPOM = [
  { id: "ios", aba: "iPhone", titulo: "No iPhone" },
  { id: "android", aba: "Android", titulo: "No Android" },
] as const;

function passosDoCupom(o: OfertaConfig): Record<"ios" | "android", string[]> {
  const codigo = `<b class="cp-cod">${o.cupom}</b>`;
  return {
    ios: [
      "Baixe ou atualize o Agenda Bela na App&nbsp;Store.",
      "No app, abra a tela de assinatura.",
      "Toque em “Tenho um cupom”.",
      `Na tela da Apple, digite ${codigo} e confirme.`,
      "Confira o resumo da Apple e confirme com Face ID ou senha.",
    ],
    android: [
      "Baixe ou atualize o Agenda Bela no Google&nbsp;Play.",
      "No app, abra a tela de assinatura.",
      `Toque em “Tenho um cupom”, digite ${codigo} e toque em “Aplicar”.`,
      `Confira “Cupom ${o.cupom} aplicado” e o preço com desconto.`,
      "Toque para assinar.",
    ],
  };
}

function blocoPassosCupom(o: OfertaConfig): string {
  const passos = passosDoCupom(o);
  const abas = PLATAFORMAS_CUPOM.map(
    (pl) =>
      `<button type="button" class="cp-aba" id="cp-aba-${pl.id}" data-aba="${pl.id}" aria-controls="cp-painel-${pl.id}">${pl.aba}</button>`,
  ).join("");
  const paineis = PLATAFORMAS_CUPOM.map(
    (pl) =>
      `<div class="cp-painel" id="cp-painel-${pl.id}" data-plat="${pl.id}"><h3 class="cp-plat">${pl.titulo}</h3><ol class="cp-passos" role="list">${passos[pl.id]
        .map((passo) => `<li><span>${passo}</span></li>`)
        .join("")}</ol></div>`,
  ).join("");
  return `<section class="cp" id="como-usar-cupom" aria-labelledby="cp-titulo"><div class="wrap"><div class="cp-card">
  <span class="mono">Passo a passo</span>
  <h2 id="cp-titulo" data-sec="cupom">Como usar o cupom</h2>
  <div class="cp-abas" id="cp-abas" aria-label="Escolha o seu celular" hidden>${abas}</div>
  ${paineis}
</div></div></section>`;
}

/** Legendas dos 6 passos da demonstração na oferta (as mesmas de CAPS_OFERTA em runtime.js). */
const PASSOS_OFERTA = [
  "A Camila marca sozinha, pelo seu link.",
  "Ela paga o sinal de R$&nbsp;20,00 no Pix e o horário fica garantido.",
  "A confirmação chega no WhatsApp dela. Você não precisa escrever nada.",
  "Você é avisada no celular, com o sinal já no saldo. Segue atendendo.",
  "No dia, a Bela lembra a Camila. Ela confirma com um toque e você é avisada.",
  "Atendeu: o valor entra no caixa. Você vê o que entrou, o que saiu e quanto sobrou.",
];
const PASSOS_PADRAO = [
  "Camila marca sozinha, pelo link do Salão Estilo.",
  "Ela paga o sinal de R$ 20,00 no Pix para garantir o horário.",
  "A confirmação chega no WhatsApp dela. Você não digita.",
  "A Paula é avisada no celular, com o sinal já no saldo. Ela segue atendendo.",
  "No dia, a Bela lembra a Camila. Ela confirma com um toque e a Paula é avisada.",
  "Atendeu: o valor entra no caixa. O que entrou, o que saiu e quanto sobrou.",
];

export function buildLojasMarkup(p: LojasMarkupParams): string {
  const bf = p.tema === "bf";
  const o = p.oferta;
  /** Texto que muda na oferta (o tema Black Friday usa `variante`). */
  const t = (padrao: string, oferta: string) => (o ? oferta : padrao);
  const passos = o ? PASSOS_OFERTA : PASSOS_PADRAO;
  /* Na oferta o rodapé não liga para a landing principal (como no protótipo):
     lá o cadastro é pela web, com outro preço e outro texto. */
  const linkLandingPrincipal = o
    ? ""
    : `<a href="/agendabela/automatize-seu-atendimento?ref=${p.slug}_rodape" data-nav="rodape_conheca_agenda_bela">Conheça o Agenda Bela</a>
      `;
  return `<div id="lp" lang="pt-BR" data-tema="${p.tema}"${temaFim(p)}${o ? ' data-oferta=""' : ""}>${SCRIPT_ANTES_DA_PINTURA}

${bf ? FAIXA : o ? faixaOferta(o) : ""}

<header class="hero lp2" id="topo">
  <div class="disc d1"></div><div class="disc d2"></div>

  <div class="wrap hero-grid">
    <div class="hero-txt">
${o ? heroTextoOferta(p, o) : `      <div class="hdr"><img src="${p.assets.logo}" alt="Agenda Bela"><span class="mono">por Tudo Agenda</span></div>
      <span class="mono eyebrow" id="slot-eyebrow">A secretária do seu salão</span>
      <h1>Pode atender <em>tranquila.</em></h1>
      <p class="sub">A Bela lembra suas clientes e te conta quem confirmou. E tem sinal no Pix e o caixa do dia, no mesmo app.</p>
      <p class="audience">Para cabeleireiras, manicures e esteticistas que atendem sozinhas ou com poucas profissionais.</p>
${blocoCta(p, "hero")}
${blocoMicro(p)}`}
    </div>

    <div class="hero-art stage" id="hero-stage" aria-label="Demonstração animada do app, em 6 passos" role="group">${bf ? HALO : ""}${o ? `\n      <span class="mono demo-tit">Veja como é, em 6 passos</span>` : ""}
      <span class="chip-who" id="hero-quem">${t("Celular da Paula", "Seu celular")}</span>${bf ? TITULO_GIGANTE : ""}
      <div class="ph" id="hero-aparelho" aria-hidden="true" data-nosnippet><div class="scr">
        <div class="sc" data-n="1"><div class="sb"><span>14:31</span><i></i></div><div class="m-url"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg> agendabela · salao-estilo</div>
  <div class="m-bkh"><span class="m-av">SE</span><div><b>Salão Estilo</b><small>Agendamento online</small></div></div>
  <div class="m-body"><div class="m-prog"><i></i><i></i><i></i></div>
    <div class="m-card u" style="--d:.1s"><span class="mono">Seu horário</span><b>Manicure com Paula</b><span class="s">amanhã (sex), 15h · R$&nbsp;60,00</span><span class="m-badge">Sinal de R$&nbsp;20,00</span></div>
    <div class="m-lbl u" style="--d:.25s">Seu nome *</div><div class="m-field u" style="--d:.3s">Camila <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg></div>
    <p class="m-note u" style="--d:.45s">Este serviço pede um sinal para confirmar o horário. Você paga por PIX na próxima tela; o restante é pago no salão.</p>
    <div class="u" style="--d:.55s"><div class="m-cta pr" style="--d:3.6s">Confirmar Agendamento</div></div>
    <i class="tap" data-target=".m-cta" style="--d:3s" aria-hidden="true"></i>
  </div></div>
        <div class="sc" data-n="2"><div class="sb"><span>14:32</span><i></i></div><div class="m-body" style="padding-top:10px"><div class="m-h1 u">Pague o sinal para confirmar</div><p class="m-p u" style="--d:.05s">Seu horário está reservado enquanto o tempo corre.</p>
    <div class="m-pix u" style="--d:.15s"><div class="m-pt"><div><small>Sinal</small><b class="v">R$&nbsp;20,00</b></div>
      <div class="m-slot"><div class="m-timer gone" style="--d:2.8s"><small>Pague em até</small><b data-from="892" data-to="889" data-delay="0" data-dur="2600" data-fmt="mmss">14:52</b></div><div class="m-paid show" style="--d:2.8s"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3D8B68" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg> Sinal pago</div></div></div>
      <div class="m-qr" aria-hidden="true">${QR_PIX}</div>
      <div class="m-code">PIX copia e cola · 00020126580014br.gov.bcb.pix${t(" (exemplo)", "")}</div></div>
    <div class="m-wait"><span class="gone" style="--d:2.8s">Aguardando o pagamento…</span><span class="ok show" style="--d:2.8s">Pix recebido. Horário garantido.</span></div>
  <p class="m-note u" style="--d:.3s">O restante do valor do serviço é pago no salão.</p></div>
  <div class="m-done done" style="--d:3.6s"><div class="m-ok pp" style="--d:4.1s"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><div class="m-h1">Pronto, Camila!<br>Seu horário está marcado.</div>
    <div class="m-sum"><b>Salão Estilo</b><br>Manicure com Paula<br>amanhã (sex), 15h</div>
    <div class="m-msg"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg><span>Sinal pago. A confirmação chega no seu <b>WhatsApp</b> em instantes.</span></div></div></div>
        <div class="sc wa" data-n="3" style="background:#ECE5DD"><div class="sb"><span>14:32</span><i></i></div><div class="wa" style="flex:1;display:flex;flex-direction:column;min-height:0">
  <div class="w-hd"><span aria-hidden="true">‹</span><b>SE</b><div><span>Salão Estilo</span><small>online</small></div></div>
  <div class="w-bd"><span class="w-day">Hoje</span>
    <div class="w-typing gone fx" style="--d:1.1s"><i></i><i></i><i></i></div>
    <div class="w-m u" style="--d:1.1s"><div class="w-t">Oi Camila! ✨ Seu agendamento foi confirmado:<br><strong>Manicure com Paula</strong><br>amanhã (sex), 15h<time>14:32</time></div></div>
  </div></div></div>
        <div class="sc lock" data-n="4"><div class="sb"><span>14:32</span><i></i></div><div class="lk-time" style="margin-top:22px">14:32</div><div class="lk-date">quinta-feira</div>
  <div class="lk-list"><div class="push sl" style="--d:.5s"><img src="${p.assets.logo}" alt=""><div><div class="r"><b>Agendabela</b><span>agora</span></div><p>Camila marcou pelo seu link 💜</p><p>Manicure amanhã às 15h. Já mandei a confirmação pra ela.</p></div></div><div class="push sl" style="--d:2.4s"><img src="${p.assets.logo}" alt=""><div><div class="r"><b>Agendabela</b><span>agora</span></div><p>Sinal de R$&nbsp;20,00 pago 💰</p><p>Camila pagou o sinal (manicure amanhã às 15h). R$&nbsp;19,20 já está no seu saldo.</p></div></div></div></div>
        <div class="sc is-active" data-n="5"><div class="sub-a gone fx" style="flex-direction:column;position:absolute;inset:0;--d:3.4s;background:#ECE5DD"><div class="sb"><span>07:00</span><i></i></div><div class="wa" style="flex:1;display:flex;flex-direction:column;min-height:0">
  <div class="w-hd"><span aria-hidden="true">‹</span><b>SE</b><div><span>Salão Estilo</span><small>online</small></div></div>
  <div class="w-bd"><span class="w-pill u">${t("No dia seguinte", "No dia do horário")}</span>
    <div class="w-m u" style="--d:.5s"><div class="w-t">🔔 Bom dia, Camila!<br>Lembrando que hoje você tem horário às <strong>15h</strong> com a Paula 💜<time>07:00</time></div>
      <div class="w-q"><span class="pr" style="--d:2.2s">Confirmar</span><span>Remarcar</span><span>Cancelar</span></div></div>
    <div class="w-me u" style="--d:2.7s">Confirmar</div></div></div><i class="tap" data-target=".w-q span" style="--d:1.7s" aria-hidden="true"></i></div>
  <div class="sub-b lock" style="position:absolute;inset:0;display:flex;flex-direction:column;--d:3.4s"><div class="sb"><span>08:12</span><i></i></div><div class="lk-time" style="margin-top:22px">08:12</div><div class="lk-date">sexta-feira</div>
  <div class="lk-list"><div class="push sl" style="--d:3.9s"><img src="${p.assets.logo}" alt=""><div><div class="r"><b>Agendabela</b><span>agora</span></div><p>Camila confirmou ✅</p><p>Manicure hoje às 15h. Pode atender tranquila.</p></div></div></div></div></div>
        <div class="sc" data-n="6"><div class="sb"><span>16:05</span><i></i></div><div class="m-cxh"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#213745" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg><h4>Fluxo de caixa</h4></div>
  <div class="m-cxb"><div class="m-sel"><span>Visualizar: <b>Dia</b></span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6F6A6D" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></div><div class="m-nav">Hoje</div>
    <div class="m-bal"><small>Saldo do dia</small><div class="v" data-from="5000" data-to="11000" data-delay="1500" data-dur="1000" data-fmt="brl">R$&nbsp;110,00</div>
      <div class="bl"><div><small>Entradas</small><b data-from="8000" data-to="14000" data-delay="1500" data-dur="1000" data-fmt="brl">R$&nbsp;140,00</b></div><div><small>Saídas</small><b>R$&nbsp;30,00</b></div></div></div>
    <div class="m-fl"><span class="on">Todas</span><span>Cartão</span><span>Pix</span><span>Dinheiro</span></div>
    <div class="m-day">Hoje · saldo <span data-from="5000" data-to="11000" data-delay="1500" data-dur="1000" data-fmt="brl">R$&nbsp;110,00</span></div>
      <div class="m-it new rw" style="--d:1.4s"><div><b>Camila · Manicure</b><small>Atendimento · Pix</small></div><span class="m-in">+ R$&nbsp;60,00</span></div>
      <div class="m-it"><div><b>Maria · Escova</b><small>Atendimento · Cartão</small></div><span class="m-in">+ R$&nbsp;80,00</span></div>
      <div class="m-it"><div><b>Esmaltes</b><small>Saída manual</small></div><span class="m-out">− R$&nbsp;30,00</span></div></div>
  <div class="m-ft"><span class="go">+ Entrada</span><span>− Saída</span></div>
  <div class="m-end" style="--d:5.1s"><img src="${p.assets.logo}" alt=""><b>Pode atender tranquila.</b></div></div>
      </div></div>
      <div class="stage-cap"><span class="mono" id="hero-passo">Passo 5 de 6</span><p id="hero-legenda">${passos[4]}</p></div>
      <div class="stage-ctl" id="hero-ctl" hidden>
        <div class="dots" role="group" aria-label="Passos da demonstração">${passos.map((passo, i) => `<button type="button" class="dot" id="hero-passo-${i + 1}" aria-label="Passo ${i + 1} de 6: ${passo}"><span><i></i></span></button>`).join("")}</div>
        <button type="button" class="pausar" id="hero-pausar" aria-pressed="false" aria-label="Pausar a demonstração"><svg class="ic-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg><svg class="ic-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5l12 7-12 7z"/></svg><span id="hero-pausar-txt">Pausar</span></button>
      </div>
      <ol class="sr">${passos.map((passo) => `<li>${passo}</li>`).join("")}</ol>
    </div>
  </div>
</header>

${bf ? BLOCO_PRECO : o ? blocoOferta(o) + "\n\n" + blocoPassosCupom(o) : ""}

<section class="sec how" aria-labelledby="como-titulo"><div class="wrap">
  <div class="sec-head rv"><span class="mono">Sem complicação</span><h2 class="t" id="como-titulo" style="max-width:18ch">Em poucos minutos a Bela já está trabalhando para você.</h2></div>
  <div class="steps-grid">
    <div class="step rv"><span class="n">1</span><h3>Cadastre seu salão</h3><p>Pelo celular. Você cadastra as profissionais, os serviços com preço e duração, e seu link de agendamento já fica pronto.</p></div>
    <div class="step rv2"><span class="n">2</span><h3>Você marca, ou sua cliente marca pelo seu link</h3><p>Assim que o horário é marcado, sua cliente recebe a confirmação no WhatsApp. Você não precisa mandar mensagem.</p></div>
    <div class="step rv3"><span class="n">3</span><h3>A Bela lembra sua cliente e avisa você</h3><p>No dia do horário, sua cliente recebe o lembrete e pode confirmar, remarcar ou cancelar. Você recebe a agenda do dia e é avisada de cada resposta.</p></div>
  </div>
</div></section>

<section class="sec diff" aria-labelledby="faz-titulo" id="diferenciais"><div class="wrap">
  <div class="sec-head rv"><span class="mono">${variante(p, "O que a Bela faz por você", "Tudo isso no mesmo preço.")}</span>
    <h2 class="t" id="faz-titulo" style="max-width:20ch">Da cliente que marca ao caixa do dia, tudo no mesmo app.</h2>
    <p class="lead">Toque em cada um para ver como é por dentro.</p></div>
  <div class="tabs" role="tablist" aria-label="O que a Bela faz por você" id="dif-tabs" hidden>
    <button type="button" class="tab" role="tab" id="dif-tab-1" aria-controls="dif-painel-1" aria-selected="true" tabindex="0"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9a6 6 0 0112 0c0 6 2 7 2 7H4s2-1 2-7"/><path d="M10 20a2 2 0 004 0"/></svg><span>Avisa e lembra</span></button>
    <button type="button" class="tab" role="tab" id="dif-tab-2" aria-controls="dif-painel-2" aria-selected="false" tabindex="-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l4.5 4.5L12 12 7.5 7.5z"/><path d="M12 12l4.5 4.5L12 21l-4.5-4.5z"/><path d="M3 12l4.5-4.5M21 12l-4.5 4.5"/></svg><span>Sinal no Pix</span></button>
    <button type="button" class="tab" role="tab" id="dif-tab-3" aria-controls="dif-painel-3" aria-selected="false" tabindex="-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M16 15h2"/></svg><span>Caixa do dia</span></button>
    <button type="button" class="tab" role="tab" id="dif-tab-4" aria-controls="dif-painel-4" aria-selected="false" tabindex="-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a2 2 0 000-4z"/><path d="M10 9v6" stroke-dasharray="1.5 2.5"/></svg><span>Pacotes</span></button>
  </div>
  <div id="dif-panels">
  <div class="panel" role="tabpanel" id="dif-painel-1" aria-labelledby="dif-tab-1" data-key="avisa">
    <div class="ptx"><span class="mono kick">Aviso e lembrete</span><h3>A Bela avisa sua cliente e te conta quem confirmou.</h3><p>Toda vez que você marca, a Bela manda a confirmação no WhatsApp da sua cliente. Você não liga e não digita.</p><p>Cedinho, antes do salão abrir, você recebe no celular os horários do dia. E cada cliente recebe o lembrete do horário dela. Quando ela confirma, você é avisada.</p><button type="button" class="replay" id="dif-replay-1" hidden><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5"/></svg>Ver de novo</button></div>
    <div class="mock-area" id="mock-avisa" data-mock data-swap="4500" data-dur="7000" role="img" aria-label="${t("Exemplo animado", "Demonstração animada")}. No WhatsApp da Camila: confirmação do agendamento de Manicure com Paula, amanhã (sex), 15h, e o lembrete do dia com os botões Confirmar, Remarcar e Cancelar. No celular da Paula: aviso das 07:30 com os atendimentos do dia e aviso das 08:12, Camila confirmou.">
    <div class="mock-row" aria-hidden="true" data-nosnippet>
      <div class="mock-col duo-f" data-f="1"><span class="lbl">No WhatsApp da cliente</span><div class="mf"><div class="scr"><div class="sc wa" style="position:relative;display:flex;flex-direction:column;height:100%;background:#ECE5DD"><div class="sb"><span>14:32</span><i></i></div><div class="w-hd"><span aria-hidden="true">‹</span><b>SE</b><div><span>Salão Estilo</span><small>online</small></div></div>
  <div class="w-bd"><span class="w-day">Hoje</span>
    <div class="w-m u" style="--d:.3s"><div class="w-t">Oi Camila! ✨ Seu agendamento foi confirmado:<br><strong>Manicure com Paula</strong><br>amanhã (sex), 15h<time>14:32</time></div></div>
    <span class="w-day u" style="--d:1.4s;margin-top:6px">No dia do horário</span>
    <div class="w-m u" style="--d:1.9s"><div class="w-t">🔔 Bom dia, Camila!<br>Lembrando que hoje você tem horário às <strong>15h</strong> com a Paula 💜<time>07:00</time></div>
      <div class="w-q"><span>Confirmar</span><span>Remarcar</span><span>Cancelar</span></div></div></div></div></div></div></div>
      <div class="mock-col duo-f" data-f="2"><span class="lbl">No celular da Paula</span><div class="mf"><div class="scr"><div class="sc lock" style="position:relative;display:flex;flex-direction:column;height:100%"><div class="sb"><span>08:12</span><i></i></div><div class="lk-who">Celular da Paula</div><div class="lk-time" style="font-size:44px;line-height:48px">08:12</div><div class="lk-date" style="margin-bottom:12px">sexta-feira</div>
  <div class="lk-list"><div class="push sl" style="--d:.4s"><img src="${p.assets.logo}" alt=""><div><div class="r"><b>Agendabela</b><span>07:30</span></div><p>Bom dia, Paula! Hoje são 5 atendimentos</p><p>Já lembrei as 5 clientes. A primeira é Maria, às 9h. Bom trabalho 💜</p></div></div><div class="push sl" style="--d:1.6s"><img src="${p.assets.logo}" alt=""><div><div class="r"><b>Agendabela</b><span>08:12</span></div><p>Camila confirmou ✅</p><p>Manicure hoje às 15h. Pode atender tranquila.</p></div></div></div></div></div></div></div>
    </div>
    <div class="duo-dots" data-dots hidden><button type="button" id="mock-avisa-dot-1" aria-label="Ver o primeiro quadro" aria-current="true"></button><button type="button" id="mock-avisa-dot-2" aria-label="Ver o segundo quadro"></button></div>
  </div>
  </div>
  <div class="panel" role="tabpanel" id="dif-painel-2" aria-labelledby="dif-tab-2" data-key="sinal">
    <div class="ptx"><span class="mono kick">Sinal no Pix</span><h3>A cliente paga o sinal para garantir o horário.</h3><p>Ligue o sinal no serviço e escolha o valor. A cliente que marca pelo seu link paga um Pix para garantir o horário, e o dinheiro cai no seu saldo.</p><p class="note">Do sinal, descontamos a ${t("tarifa", "taxa")} do Pix e 1,49% do Agenda Bela. Vale para quem marca pelo seu link, em serviço simples (não vale para combo).</p><button type="button" class="replay" id="dif-replay-2" hidden><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5"/></svg>Ver de novo</button></div>
    <div class="mock-area" id="mock-sinal" data-mock data-swap="4500" data-dur="6200" role="img" aria-label="${t("Exemplo animado", "Demonstração animada")}. Na tela do link do Salão Estilo, a Camila paga o sinal de R$ 20,00 no Pix e a tela mostra Sinal pago. No celular da Paula chega o aviso: Sinal de R$ 20,00 pago, R$ 19,20 ${t("já estão no saldo", "já está no seu saldo")}.">
    <div class="mock-row" aria-hidden="true" data-nosnippet>
      <div class="mock-col duo-f" data-f="1"><span class="lbl">No link da cliente</span><div class="mf"><div class="scr"><div class="sc" style="position:relative;display:flex;flex-direction:column;height:100%;background:#fff"><div class="sb"><span>14:32</span><i></i></div><div class="m-bkh"><span class="m-av">SE</span><div><b>Salão Estilo</b><small>Agendamento online</small></div></div><div class="m-body" style="padding-top:10px"><div class="m-h1 u">Pague o sinal para confirmar</div><p class="m-p u" style="--d:.05s">Seu horário está reservado enquanto o tempo corre.</p>
    <div class="m-pix u" style="--d:.15s"><div class="m-pt"><div><small>Sinal</small><b class="v">R$&nbsp;20,00</b></div>
      <div class="m-slot"><div class="m-timer gone" style="--d:2.8s"><small>Pague em até</small><b data-from="892" data-to="889" data-delay="0" data-dur="2600" data-fmt="mmss">14:52</b></div><div class="m-paid show" style="--d:2.8s"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3D8B68" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg> Sinal pago</div></div></div>
      <div class="m-qr" aria-hidden="true">${QR_PIX}</div>
      <div class="m-code">PIX copia e cola · 00020126580014br.gov.bcb.pix${t(" (exemplo)", "")}</div></div>
    <div class="m-wait"><span class="gone" style="--d:2.8s">Aguardando o pagamento…</span><span class="ok show" style="--d:2.8s">Pix recebido. Horário garantido.</span></div><p class="m-note">O restante do valor do serviço é pago no salão.</p></div></div></div></div></div>
      <div class="mock-col duo-f" data-f="2"><span class="lbl">No celular da Paula</span><div class="mf"><div class="scr"><div class="sc lock" style="position:relative;display:flex;flex-direction:column;height:100%"><div class="sb"><span>14:32</span><i></i></div><div class="lk-who">Celular da Paula</div><div class="lk-time" style="font-size:44px;line-height:48px">14:32</div><div class="lk-date" style="margin-bottom:12px">quinta-feira</div>
  <div class="lk-list"><div class="push sl" style="--d:.4s"><img src="${p.assets.logo}" alt=""><div><div class="r"><b>Agendabela</b><span>agora</span></div><p>Sinal de R$&nbsp;20,00 pago 💰</p><p>Camila pagou o sinal (manicure amanhã às 15h). R$&nbsp;19,20 já está no seu saldo.</p></div></div></div></div></div></div></div>
    </div>
    <div class="duo-dots" data-dots hidden><button type="button" id="mock-sinal-dot-1" aria-label="Ver o primeiro quadro" aria-current="true"></button><button type="button" id="mock-sinal-dot-2" aria-label="Ver o segundo quadro"></button></div>
  </div>
  </div>
  <div class="panel" role="tabpanel" id="dif-painel-3" aria-labelledby="dif-tab-3" data-key="caixa">
    <div class="ptx"><span class="mono kick">Fluxo de caixa</span><h3>Você sabe quanto entrou, quanto saiu e quanto sobrou.</h3><p>Os atendimentos feitos entram sozinhos no Fluxo de caixa; você só escolhe se foi Pix, cartão ou dinheiro. Compra de material e outras saídas você lança em um toque.</p><button type="button" class="replay" id="dif-replay-3" hidden><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5"/></svg>Ver de novo</button></div>
    <div class="mock-area" id="mock-caixa" data-mock data-dur="3500" role="img" aria-label="${t("Exemplo animado", "Demonstração animada")}. Tela Fluxo de caixa do dia: o saldo sobe de R$ 50,00 para R$ 110,00 quando entra o atendimento da Camila, Manicure, Pix, mais R$ 60,00. Também aparecem Maria, Escova, cartão, mais R$ 80,00, e a saída Esmaltes, menos R$ 30,00."><div class="mock-row" aria-hidden="true" data-nosnippet><div class="mock-col" data-f="1"><span class="lbl">No celular da Paula</span><div class="mf"><div class="scr"><div class="sc" style="position:relative;display:flex;flex-direction:column;height:100%"><div class="sb"><span>16:05</span><i></i></div><div class="m-cxh"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#213745" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg><h4>Fluxo de caixa</h4></div>
  <div class="m-cxb"><div class="m-sel"><span>Visualizar: <b>Dia</b></span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6F6A6D" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></div><div class="m-nav">Hoje</div>
    <div class="m-bal"><small>Saldo do dia</small><div class="v" data-from="5000" data-to="11000" data-delay="1500" data-dur="1000" data-fmt="brl">R$&nbsp;110,00</div>
      <div class="bl"><div><small>Entradas</small><b data-from="8000" data-to="14000" data-delay="1500" data-dur="1000" data-fmt="brl">R$&nbsp;140,00</b></div><div><small>Saídas</small><b>R$&nbsp;30,00</b></div></div></div>
    <div class="m-fl"><span class="on">Todas</span><span>Cartão</span><span>Pix</span><span>Dinheiro</span></div>
    <div class="m-day">Hoje · saldo <span data-from="5000" data-to="11000" data-delay="1500" data-dur="1000" data-fmt="brl">R$&nbsp;110,00</span></div>
      <div class="m-it new rw" style="--d:1.4s"><div><b>Camila · Manicure</b><small>Atendimento · Pix</small></div><span class="m-in">+ R$&nbsp;60,00</span></div>
      <div class="m-it"><div><b>Maria · Escova</b><small>Atendimento · Cartão</small></div><span class="m-in">+ R$&nbsp;80,00</span></div>
      <div class="m-it"><div><b>Esmaltes</b><small>Saída manual</small></div><span class="m-out">− R$&nbsp;30,00</span></div></div>
  <div class="m-ft"><span class="go">+ Entrada</span><span>− Saída</span></div>
  </div></div></div></div></div></div>
  </div>
  <div class="panel" role="tabpanel" id="dif-painel-4" aria-labelledby="dif-tab-4" data-key="pacote">
    <div class="ptx"><span class="mono kick">Pacote de sessões</span><h3>Venda um pacote na ficha da cliente e conte as sessões.</h3><p>Registre o pacote, quantas sessões e quanto ela pagou: o valor entra no caixa no dia. A cada atendimento, toque em <b>Usar 1 sessão</b>.</p><button type="button" class="replay" id="dif-replay-4" hidden><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5"/></svg>Ver de novo</button></div>
    <div class="mock-area" id="mock-pacote" data-mock data-swap="4500" data-dur="7800" role="img" aria-label="${t("Exemplo animado", "Demonstração animada")}. Na ficha da Camila, o pacote Mão e pé passa de 1 de 4 usadas para 2 de 4 usadas quando a Paula toca em Usar 1 sessão. No formulário do pacote: 4 sessões e R$ 200,00 pagos, que entram no Caixa hoje.">
    <div class="mock-row" aria-hidden="true" data-nosnippet>
      <div class="mock-col duo-f" data-f="1"><span class="lbl">Novo pacote</span><div class="mf"><div class="scr"><div class="sc dk" style="position:relative;display:flex;flex-direction:column;height:100%"><div class="sb"><span>14:10</span><i></i></div><div class="m-hd"><small>&nbsp;</small><b>Novo pacote</b></div>
  <div class="m-pn"><div class="m-fc"><div class="fl">Nome do pacote</div><div class="m-chips"><span class="m-ch on co" style="--d:.5s">Mão e pé</span><span class="m-ch">Depilação a laser</span></div></div>
    <div class="m-fc"><div class="fl">Quantas sessões?</div><div class="m-chips"><span class="m-ch on co" style="--d:1.3s">4</span><span class="m-ch">5</span><span class="m-ch">10</span></div></div>
    <div class="m-fc"><div class="fl">Quanto ela pagou? (opcional)</div><div class="m-chips"><span class="m-ch">R$&nbsp;190,00</span><span class="m-ch on co" style="--d:2.1s">R$&nbsp;200,00</span></div><div class="fn">Entra no Caixa hoje.</div></div>
  </div><div class="m-ft"><span>Cancelar</span><span class="go pr" style="--d:3s">Criar pacote</span></div></div></div></div></div>
      <div class="mock-col duo-f" data-f="2"><span class="lbl">Ficha da Camila</span><div class="mf"><div class="scr"><div class="sc dk" style="position:relative;display:flex;flex-direction:column;height:100%"><div class="sb"><span>14:12</span><i></i></div><div class="m-hd"><small>Ficha da cliente</small><b>Camila</b></div>
  <div class="m-pn"><div class="m-pkh"><span>Pacotes</span><span class="nv">+ Novo pacote</span></div>
    <div class="m-pk"><b style="font:700 13px/17px var(--inter);color:#1F2937">Mão e pé</b>
      <div class="row"><span><span data-from="1" data-to="2" data-delay="1900" data-dur="300" data-fmt="int" data-tpl="{n} de 4 usadas">2 de 4 usadas</span></span><span><span data-from="3" data-to="2" data-delay="1900" data-dur="300" data-fmt="int" data-tpl="faltam {n}">faltam 2</span></span></div>
      <div class="m-bar"><i class="bw" style="--d:2.1s"></i></div>
      <div class="m-use pr" style="--d:1.9s">Usar 1 sessão</div></div>
    <div class="m-fic" style="padding:2px 12px"><div class="m-hist" style="box-shadow:none;padding:0"><div class="rw" style="--d:2.2s"><span>Mão e pé<small>Hoje · 14:10</small></span><b>sessão usada</b></div><div><span>Manicure<small>há 12 dias</small></span><b>R$&nbsp;60,00</b></div></div></div>
    <i class="tap" data-target=".m-use" style="--d:1.1s" aria-hidden="true"></i>
  </div></div></div></div></div>
    </div>
    <div class="duo-dots" data-dots hidden><button type="button" id="mock-pacote-dot-1" aria-label="Ver o primeiro quadro" aria-current="true"></button><button type="button" id="mock-pacote-dot-2" aria-label="Ver o segundo quadro"></button></div>
  </div>
  </div>
  </div>
  <div class="mais">
    <h3>E tem mais</h3>
    <div class="chips" id="mais-chips" role="group" aria-label="E tem mais" hidden><button type="button" class="chip" id="mais-chip-1" aria-expanded="true" aria-controls="mais-folha" data-t="Escova e mão e pé na mesma marcação, com o valor e o tempo juntos.">Vários serviços num horário</button><button type="button" class="chip" id="mais-chip-2" aria-expanded="false" aria-controls="mais-folha" data-t="Atendeu e esqueceu de anotar? Registre depois, sem mandar mensagem para a cliente.">Atendimento que já aconteceu</button><button type="button" class="chip" id="mais-chip-3" aria-expanded="false" aria-controls="mais-folha" data-t="Tarde livre na agenda? A Bela deixa a mensagem pronta para você pôr no seu status.">Mensagem pronta para divulgar</button><button type="button" class="chip" id="mais-chip-4" aria-expanded="false" aria-controls="mais-folha" data-t="Sua cliente marca sozinha pelo link e recebe uma confirmação certinha.">Link com o nome do salão</button></div>
    <p class="folha" id="mais-folha" aria-live="polite" hidden>Escova e mão e pé na mesma marcação, com o valor e o tempo juntos.</p>
    <ul class="mais-list" id="mais-lista"><li><b>Vários serviços num horário.</b> Escova e mão e pé na mesma marcação, com o valor e o tempo juntos.</li><li><b>Atendimento que já aconteceu.</b> Atendeu e esqueceu de anotar? Registre depois, sem mandar mensagem para a cliente.</li><li><b>Mensagem pronta para divulgar.</b> Tarde livre na agenda? A Bela deixa a mensagem pronta para você pôr no seu status.</li><li><b>Link com o nome do salão.</b> Sua cliente marca sozinha pelo link e recebe uma confirmação certinha.</li></ul>
  </div>
</div></section>

<section class="price-sec" aria-labelledby="preco-titulo"><div class="wrap"><div class="price">
  <div>
    <span class="mono">Quanto custa</span>
    ${o ? `<h2 id="preco-titulo">Tudo que você viu aqui está incluso.</h2>
    <p>Teste 7 dias, sem cartão, e decida. Cancele quando quiser. O desconto vem com o cupom ${o.cupom}, que você digita na hora de assinar. Os valores e as regras estão no começo desta página.</p>` : `<h2 id="preco-titulo" data-sec="preco">7 dias grátis. Depois, R$&nbsp;59,90 por mês.</h2>
    <p>Um preço só, com tudo que você viu aqui. Teste por 7 dias, sem cartão, e decida. Cancele quando quiser.</p>`}
    <div class="d7" aria-hidden="true"><i style="--i:0">1</i><i style="--i:1">2</i><i style="--i:2">3</i><i style="--i:3">4</i><i style="--i:4">5</i><i style="--i:5">6</i><i style="--i:6">7</i></div>
  </div>
  <div>
    <ol>
      <li><b>1</b><span>Baixe o app, iPhone ou Android.</span></li>
      <li><b>2</b><span>Cadastre seu salão e marque sua primeira cliente. Pense em quem vai ser: é com ela que a Bela começa a trabalhar.</span></li>
      <li><b>3</b><span>Depois dos 7 dias, sua agenda continua lá para você consultar. Para seguir marcando, é só assinar pelo app.${o ? ` Na tela de assinatura, toque em “Tenho um cupom” e digite ${o.cupom} para ter ${o.percentual}% nos ${o.meses} primeiros meses.` : ""}</span></li>
    </ol>
${blocoCta(p, "preco")}
  </div>
</div></div></section>

<section class="sec rev" aria-labelledby="avaliacoes-titulo"><div class="wrap">
  <div class="sec-head rv"><span class="mono">Quem já usa a Bela</span><h2 class="t" id="avaliacoes-titulo" style="max-width:22ch">Avaliações de quem já usa</h2></div>
  <div class="rgrid">
    <figure class="rv"><span class="q" aria-hidden="true">&ldquo;</span><blockquote>${t("", "…")}Sou manicure e estava procurando uma forma mais prática de organizar meus horários. Está facilitando bastante minha rotina, principalmente nos dias mais corridos. Fácil de usar e bem organizado…</blockquote><figcaption><b>Cintia</b><span>App Store · set/2026</span></figcaption></figure>
    <figure class="rv2"><span class="q" aria-hidden="true">&ldquo;</span><blockquote>${t("", "…")}Deixou minha rotina muito mais organizada e ficou bem mais fácil cuidar dos agendamentos. É simples de mexer, rápido e tem tudo bem explicado…</blockquote><figcaption><b>Tatiane C.</b><span>Google Play · set/2026</span></figcaption></figure>
  </div>
  <p class="rev-link">${linkSimulador(p, "avaliacoes", "Veja o que a Bela faz na prática →")}</p>
</div></section>

<section class="trust"><div class="wrap"><div class="trust-in">
  ${o ? `<div class="logos"><div class="apoio"><span class="mono">Selecionado pelo</span><img src="${p.assets.santanderX}" width="180" height="24" alt="Santander X" style="width:180px"></div><div class="apoio"><span class="mono">Apoiado por</span><img src="${p.assets.foundersClub}" width="120" height="68" alt="Founders Club" style="width:120px"></div></div>` : `<span class="mono">Apoiado por</span>
  <div class="logos"><img src="${p.assets.santanderX}" width="180" height="24" alt="Santander X" style="width:180px"><img src="${p.assets.foundersClub}" width="120" height="68" alt="Founders Club" style="width:120px"></div>`}
</div></div></section>

<section class="sec faq"${t("", ' id="faq"')} aria-labelledby="faq-titulo"><div class="wrap">
  <div class="sec-head"><h2 class="t" id="faq-titulo" data-sec="faq">Perguntas rápidas</h2></div>
  <div class="faq-list">
${blocoFaq(p)}
  </div>
</div></section>

<section class="final-sec" aria-labelledby="final-titulo"><div class="wrap"><div class="final">
  <h2 id="final-titulo">${o ? "Comece com a Bela e atenda tranquila." : variante(p, "Baixe o app e deixe a Bela cuidar da sua agenda.", "Deixe a agenda em ordem e atenda tranquila.")}</h2>
  ${o ? `<p>Teste 7 dias, sem cartão. Com o cupom ${o.cupom}, os ${o.meses} primeiros meses custam ${reais(o.precoPromoCentavos)} por mês; depois, ${reais(o.precoCheioCentavos)} por mês.</p>` : bf ? `<p class="txt-padrao">7 dias grátis, sem cartão para começar. Depois, R$&nbsp;59,90 por mês.</p><p class="txt-tema">Baixe o app e teste por 7 dias, sem cartão. Depois, R$&nbsp;59,90 por mês.</p>` : `<p>7 dias grátis, sem cartão para começar. Depois, R$&nbsp;59,90 por mês.</p>`}
${blocoCta(p, "final")}
</div></div></section>

<footer class="foot" id="rodape"><div class="wrap">
  <div class="foot-in">
    <div class="foot-brand"><img src="${p.assets.logo}" alt="Agenda Bela"><a class="mono" href="/" data-nav="rodape_tudo_agenda">por Tudo Agenda</a></div>
    <section class="foot-dl" aria-labelledby="rodape-baixe">
      <h2 id="rodape-baixe">Baixe o app</h2>
      ${seloRodape()}
      <p>${t("Baixe o app e teste 7 dias grátis, sem cartão.", "Baixe o app e teste 7 dias, sem cartão.")}</p>
    </section>
    <nav aria-label="Links do rodapé">
      ${linkLandingPrincipal}<a href="/termos">Termos de serviço</a>
      <a href="/privacidade">Política de privacidade</a>
      <a href="mailto:contato@tudoagenda.com.br">contato@tudoagenda.com.br</a>
      <a href="${atributo(SUPPORT_WHATSAPP_URL)}" target="_blank" rel="noopener noreferrer">Falar com o suporte<span class="sr"> (abre em nova aba)</span></a>
    </nav>
  </div>
  <p class="legal">© ${p.ano} Tudo Agenda. Todos os direitos reservados.</p>
  <p class="legal">${COMPANY_LEGAL_IDENTIFICATION}</p>
</div></footer>

${blocoFixo(p)}
</div>`;
}
