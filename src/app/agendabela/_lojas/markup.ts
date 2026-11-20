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
import {
  COMPANY_LEGAL_IDENTIFICATION,
  SUPPORT_WHATSAPP_URL,
} from "@/config/company";

export type LojasMarkupParams = {
  /** Último trecho da rota: vai no ?ref= do link do rodapé para a landing principal. */
  slug: string;
  /** "bf" liga o tema Black Friday por cima da página padrão. */
  tema: "padrao" | "bf";
  /** Epoch (ms) em que o tema deixa de valer. Só com tema "bf". */
  temaExpiraEm?: number;
  /** Prefixo do ?ref= nos links para o simulador (ex.: "app" vira ref=app_hero). */
  refSimulador: string;
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
  const preco = `<p class="micro">7 dias grátis, sem cartão para começar. Depois, R$&nbsp;59,90 por mês.</p>`;
  const simulador = `<p class="micro">${linkSimulador(p, "hero", "Prefere ver antes? Teste o app sem cadastro →")}</p>`;
  return `<div id="micro">
        <div data-dev="ios">${preco}<p class="micro">Você abre a App Store, baixa o app e marca sua primeira cliente.</p></div>
        <div data-dev="android">${preco}<p class="micro">Você abre o Google Play, baixa o app e marca sua primeira cliente.</p></div>
        <div data-dev="desktop">${preco}${simulador}</div>
        <div data-dev="nojs">${preco}${simulador}</div>
      </div>`;
}

/** Perguntas rápidas, do array único de faq.ts (o mesmo do JSON-LD). */
function blocoFaq(): string {
  return LOJAS_FAQ.map(
    (item) =>
      `    <details><summary>${item.pergunta}</summary><p>${item.resposta.replace(/R\$ /g, () => "R$&nbsp;")}</p></details>`,
  ).join("\n");
}

function seloRodape(): string {
  return `<div class="foot-badges" data-loc="rodape_selo">${selo("app_store")}${selo("google_play")}</div>`;
}

/** CTA fixo do celular: o runtime mostra quando o CTA do hero sai da tela. */
function blocoFixo(): string {
  return `<div class="sticky" id="cta-fixo" data-loc="sticky_mobile" hidden>
  <div class="sticky-slot">
    <div data-dev="ios">${selo("app_store", "storecard")}</div>
    <div data-dev="android">${selo("google_play", "storecard")}</div>
  </div>
  <small data-dev="ios">7 dias grátis · depois R$&nbsp;59,90/mês</small>
  <small data-dev="android">7 dias grátis · depois R$&nbsp;59,90/mês</small>
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
const BLOCO_PRECO = `<section class="so-tema bf" id="slot-bloco" aria-labelledby="bloco-titulo"><div class="wrap"><div class="bf-card rv"><span class="pill">Black Friday</span><h2 id="bloco-titulo">Apenas <span class="bf-preco">R$&nbsp;59,90 por mês.</span></h2><div><p>Os 7 dias para testar são sem cartão, e você cancela quando quiser. É assim hoje, é assim na Black Friday e é assim depois dela.</p></div></div></div></section>`;

export function buildLojasMarkup(p: LojasMarkupParams): string {
  const bf = p.tema === "bf";
  return `<div id="lp" lang="pt-BR" data-tema="${p.tema}"${temaFim(p)}>${SCRIPT_ANTES_DA_PINTURA}

${bf ? FAIXA : ""}

<header class="hero lp2" id="topo">
  <div class="disc d1"></div><div class="disc d2"></div>

  <div class="wrap hero-grid">
    <div class="hero-txt">
      <div class="hdr"><img src="${p.assets.logo}" alt="Agenda Bela"><span class="mono">por Tudo Agenda</span></div>
      <span class="mono eyebrow" id="slot-eyebrow">A secretária do seu salão</span>
      <h1>Pode atender <em>tranquila.</em></h1>
      <p class="sub">A Bela lembra suas clientes e te conta quem confirmou. E tem sinal no Pix e o caixa do dia, no mesmo app.</p>
      <p class="audience">Para cabeleireiras, manicures e esteticistas que atendem sozinhas ou com poucas profissionais.</p>
${blocoCta(p, "hero")}
${blocoMicro(p)}
    </div>

    <div class="hero-art stage" id="hero-stage" aria-label="Demonstração animada do app, em 6 passos" role="group">${bf ? HALO : ""}
      <span class="chip-who" id="hero-quem">Celular da Paula</span>${bf ? TITULO_GIGANTE : ""}
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
      <div class="m-code">PIX copia e cola · 00020126580014br.gov.bcb.pix (exemplo)</div></div>
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
  <div class="w-bd"><span class="w-pill u">No dia seguinte</span>
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
      <div class="stage-cap"><span class="mono" id="hero-passo">Passo 5 de 6</span><p id="hero-legenda">No dia, a Bela lembra a Camila. Ela confirma com um toque e a Paula é avisada.</p></div>
      <div class="stage-ctl" id="hero-ctl" hidden>
        <div class="dots" role="group" aria-label="Passos da demonstração"><button type="button" class="dot" id="hero-passo-1" aria-label="Passo 1 de 6: Camila marca sozinha, pelo link do Salão Estilo."><span><i></i></span></button><button type="button" class="dot" id="hero-passo-2" aria-label="Passo 2 de 6: Ela paga o sinal de R$ 20,00 no Pix para garantir o horário."><span><i></i></span></button><button type="button" class="dot" id="hero-passo-3" aria-label="Passo 3 de 6: A confirmação chega no WhatsApp dela. Você não digita."><span><i></i></span></button><button type="button" class="dot" id="hero-passo-4" aria-label="Passo 4 de 6: A Paula é avisada no celular, com o sinal já no saldo. Ela segue atendendo."><span><i></i></span></button><button type="button" class="dot" id="hero-passo-5" aria-label="Passo 5 de 6: No dia, a Bela lembra a Camila. Ela confirma com um toque e a Paula é avisada."><span><i></i></span></button><button type="button" class="dot" id="hero-passo-6" aria-label="Passo 6 de 6: Atendeu: o valor entra no caixa. O que entrou, o que saiu e quanto sobrou."><span><i></i></span></button></div>
        <button type="button" class="pausar" id="hero-pausar" aria-pressed="false" aria-label="Pausar a demonstração"><svg class="ic-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg><svg class="ic-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5l12 7-12 7z"/></svg><span id="hero-pausar-txt">Pausar</span></button>
      </div>
      <ol class="sr"><li>Camila marca sozinha, pelo link do Salão Estilo.</li><li>Ela paga o sinal de R$ 20,00 no Pix para garantir o horário.</li><li>A confirmação chega no WhatsApp dela. Você não digita.</li><li>A Paula é avisada no celular, com o sinal já no saldo. Ela segue atendendo.</li><li>No dia, a Bela lembra a Camila. Ela confirma com um toque e a Paula é avisada.</li><li>Atendeu: o valor entra no caixa. O que entrou, o que saiu e quanto sobrou.</li></ol>
    </div>
  </div>
</header>

${bf ? BLOCO_PRECO : ""}

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
    <div class="mock-area" id="mock-avisa" data-mock data-swap="4500" data-dur="7000" role="img" aria-label="Exemplo animado. No WhatsApp da Camila: confirmação do agendamento de Manicure com Paula, amanhã (sex), 15h, e o lembrete do dia com os botões Confirmar, Remarcar e Cancelar. No celular da Paula: aviso das 07:30 com os atendimentos do dia e aviso das 08:12, Camila confirmou.">
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
    <div class="ptx"><span class="mono kick">Sinal no Pix</span><h3>A cliente paga o sinal para garantir o horário.</h3><p>Ligue o sinal no serviço e escolha o valor. A cliente que marca pelo seu link paga um Pix para garantir o horário, e o dinheiro cai no seu saldo.</p><p class="note">Do sinal, descontamos a tarifa do Pix e 1,49% do Agenda Bela. Vale para quem marca pelo seu link, em serviço simples (não vale para combo).</p><button type="button" class="replay" id="dif-replay-2" hidden><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5"/></svg>Ver de novo</button></div>
    <div class="mock-area" id="mock-sinal" data-mock data-swap="4500" data-dur="6200" role="img" aria-label="Exemplo animado. Na tela do link do Salão Estilo, a Camila paga o sinal de R$ 20,00 no Pix e a tela mostra Sinal pago. No celular da Paula chega o aviso: Sinal de R$ 20,00 pago, R$ 19,20 já estão no saldo.">
    <div class="mock-row" aria-hidden="true" data-nosnippet>
      <div class="mock-col duo-f" data-f="1"><span class="lbl">No link da cliente</span><div class="mf"><div class="scr"><div class="sc" style="position:relative;display:flex;flex-direction:column;height:100%;background:#fff"><div class="sb"><span>14:32</span><i></i></div><div class="m-bkh"><span class="m-av">SE</span><div><b>Salão Estilo</b><small>Agendamento online</small></div></div><div class="m-body" style="padding-top:10px"><div class="m-h1 u">Pague o sinal para confirmar</div><p class="m-p u" style="--d:.05s">Seu horário está reservado enquanto o tempo corre.</p>
    <div class="m-pix u" style="--d:.15s"><div class="m-pt"><div><small>Sinal</small><b class="v">R$&nbsp;20,00</b></div>
      <div class="m-slot"><div class="m-timer gone" style="--d:2.8s"><small>Pague em até</small><b data-from="892" data-to="889" data-delay="0" data-dur="2600" data-fmt="mmss">14:52</b></div><div class="m-paid show" style="--d:2.8s"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3D8B68" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg> Sinal pago</div></div></div>
      <div class="m-qr" aria-hidden="true">${QR_PIX}</div>
      <div class="m-code">PIX copia e cola · 00020126580014br.gov.bcb.pix (exemplo)</div></div>
    <div class="m-wait"><span class="gone" style="--d:2.8s">Aguardando o pagamento…</span><span class="ok show" style="--d:2.8s">Pix recebido. Horário garantido.</span></div><p class="m-note">O restante do valor do serviço é pago no salão.</p></div></div></div></div></div>
      <div class="mock-col duo-f" data-f="2"><span class="lbl">No celular da Paula</span><div class="mf"><div class="scr"><div class="sc lock" style="position:relative;display:flex;flex-direction:column;height:100%"><div class="sb"><span>14:32</span><i></i></div><div class="lk-who">Celular da Paula</div><div class="lk-time" style="font-size:44px;line-height:48px">14:32</div><div class="lk-date" style="margin-bottom:12px">quinta-feira</div>
  <div class="lk-list"><div class="push sl" style="--d:.4s"><img src="${p.assets.logo}" alt=""><div><div class="r"><b>Agendabela</b><span>agora</span></div><p>Sinal de R$&nbsp;20,00 pago 💰</p><p>Camila pagou o sinal (manicure amanhã às 15h). R$&nbsp;19,20 já está no seu saldo.</p></div></div></div></div></div></div></div>
    </div>
    <div class="duo-dots" data-dots hidden><button type="button" id="mock-sinal-dot-1" aria-label="Ver o primeiro quadro" aria-current="true"></button><button type="button" id="mock-sinal-dot-2" aria-label="Ver o segundo quadro"></button></div>
  </div>
  </div>
  <div class="panel" role="tabpanel" id="dif-painel-3" aria-labelledby="dif-tab-3" data-key="caixa">
    <div class="ptx"><span class="mono kick">Fluxo de caixa</span><h3>Você sabe quanto entrou, quanto saiu e quanto sobrou.</h3><p>Os atendimentos feitos entram sozinhos no Fluxo de caixa; você só escolhe se foi Pix, cartão ou dinheiro. Compra de material e outras saídas você lança em um toque.</p><button type="button" class="replay" id="dif-replay-3" hidden><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5"/></svg>Ver de novo</button></div>
    <div class="mock-area" id="mock-caixa" data-mock data-dur="3500" role="img" aria-label="Exemplo animado. Tela Fluxo de caixa do dia: o saldo sobe de R$ 50,00 para R$ 110,00 quando entra o atendimento da Camila, Manicure, Pix, mais R$ 60,00. Também aparecem Maria, Escova, cartão, mais R$ 80,00, e a saída Esmaltes, menos R$ 30,00."><div class="mock-row" aria-hidden="true" data-nosnippet><div class="mock-col" data-f="1"><span class="lbl">No celular da Paula</span><div class="mf"><div class="scr"><div class="sc" style="position:relative;display:flex;flex-direction:column;height:100%"><div class="sb"><span>16:05</span><i></i></div><div class="m-cxh"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#213745" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg><h4>Fluxo de caixa</h4></div>
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
    <div class="mock-area" id="mock-pacote" data-mock data-swap="4500" data-dur="7800" role="img" aria-label="Exemplo animado. Na ficha da Camila, o pacote Mão e pé passa de 1 de 4 usadas para 2 de 4 usadas quando a Paula toca em Usar 1 sessão. No formulário do pacote: 4 sessões e R$ 200,00 pagos, que entram no Caixa hoje.">
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
    <h2 id="preco-titulo">7 dias grátis. Depois, R$&nbsp;59,90 por mês.</h2>
    <p>Um preço só, com tudo que você viu aqui. Teste por 7 dias, sem cartão, e decida. Cancele quando quiser.</p>
    <div class="d7" aria-hidden="true"><i style="--i:0">1</i><i style="--i:1">2</i><i style="--i:2">3</i><i style="--i:3">4</i><i style="--i:4">5</i><i style="--i:5">6</i><i style="--i:6">7</i></div>
  </div>
  <div>
    <ol>
      <li><b>1</b><span>Baixe o app, iPhone ou Android.</span></li>
      <li><b>2</b><span>Cadastre seu salão e marque sua primeira cliente. Pense em quem vai ser: é com ela que a Bela começa a trabalhar.</span></li>
      <li><b>3</b><span>Depois dos 7 dias, sua agenda continua lá para você consultar. Para seguir marcando, é só assinar pelo app.</span></li>
    </ol>
${blocoCta(p, "preco")}
  </div>
</div></div></section>

<section class="sec rev" aria-labelledby="avaliacoes-titulo"><div class="wrap">
  <div class="sec-head rv"><span class="mono">Quem já usa a Bela</span><h2 class="t" id="avaliacoes-titulo" style="max-width:22ch">Avaliações de quem já usa</h2></div>
  <div class="rgrid">
    <figure class="rv"><span class="q" aria-hidden="true">&ldquo;</span><blockquote>Sou manicure e estava procurando uma forma mais prática de organizar meus horários. Está facilitando bastante minha rotina, principalmente nos dias mais corridos. Fácil de usar e bem organizado…</blockquote><figcaption><b>Cintia</b><span>App Store · set/2026</span></figcaption></figure>
    <figure class="rv2"><span class="q" aria-hidden="true">&ldquo;</span><blockquote>Deixou minha rotina muito mais organizada e ficou bem mais fácil cuidar dos agendamentos. É simples de mexer, rápido e tem tudo bem explicado…</blockquote><figcaption><b>Tatiane C.</b><span>Google Play · set/2026</span></figcaption></figure>
  </div>
  <p class="rev-link">${linkSimulador(p, "avaliacoes", "Veja o que a Bela faz na prática →")}</p>
</div></section>

<section class="trust"><div class="wrap"><div class="trust-in">
  <span class="mono">Apoiado por</span>
  <div class="logos"><img src="${p.assets.santanderX}" width="180" height="24" alt="Santander X" style="width:180px"><img src="${p.assets.foundersClub}" width="120" height="68" alt="Founders Club" style="width:120px"></div>
</div></div></section>

<section class="sec faq" aria-labelledby="faq-titulo"><div class="wrap">
  <div class="sec-head"><h2 class="t" id="faq-titulo">Perguntas rápidas</h2></div>
  <div class="faq-list">
${blocoFaq()}
  </div>
</div></section>

<section class="final-sec" aria-labelledby="final-titulo"><div class="wrap"><div class="final">
  <h2 id="final-titulo">${variante(p, "Baixe o app e deixe a Bela cuidar da sua agenda.", "Deixe a agenda em ordem e atenda tranquila.")}</h2>
  ${bf ? `<p class="txt-padrao">7 dias grátis, sem cartão para começar. Depois, R$&nbsp;59,90 por mês.</p><p class="txt-tema">Baixe o app e teste por 7 dias, sem cartão. Depois, R$&nbsp;59,90 por mês.</p>` : `<p>7 dias grátis, sem cartão para começar. Depois, R$&nbsp;59,90 por mês.</p>`}
${blocoCta(p, "final")}
</div></div></section>

<footer class="foot" id="rodape"><div class="wrap">
  <div class="foot-in">
    <div class="foot-brand"><img src="${p.assets.logo}" alt="Agenda Bela"><a class="mono" href="/" data-nav="rodape_tudo_agenda">por Tudo Agenda</a></div>
    <section class="foot-dl" aria-labelledby="rodape-baixe">
      <h2 id="rodape-baixe">Baixe o app</h2>
      ${seloRodape()}
      <p>Baixe o app e teste 7 dias grátis, sem cartão.</p>
    </section>
    <nav aria-label="Links do rodapé">
      <a href="/agendabela/automatize-seu-atendimento?ref=${p.slug}_rodape" data-nav="rodape_conheca_agenda_bela">Conheça o Agenda Bela</a>
      <a href="/termos">Termos de serviço</a>
      <a href="/privacidade">Política de privacidade</a>
      <a href="mailto:contato@tudoagenda.com.br">contato@tudoagenda.com.br</a>
      <a href="${atributo(SUPPORT_WHATSAPP_URL)}" target="_blank" rel="noopener noreferrer">Falar com o suporte<span class="sr"> (abre em nova aba)</span></a>
    </nav>
  </div>
  <p class="legal">© ${p.ano} Tudo Agenda. Todos os direitos reservados.</p>
  <p class="legal">${COMPANY_LEGAL_IDENTIFICATION}</p>
</div></footer>

${blocoFixo()}
</div>`;
}
