/*
 * Comportamento das landings de loja do Agenda Bela, sobre o HTML que o
 * servidor já entregou (markup.ts). É o script dos protótipos aprovados em
 * 19/11/2026, com a mesma lógica de animação. O que muda para produção:
 * - o aparelho vem do User-Agent (sem os seletores do protótipo);
 * - links das lojas com a origem da sessão e medição (lp_view, store_click,
 *   cta_click) e o engajamento (section_view, faq_open);
 * - fim do tema Black Friday pela validade gravada em #lp;
 * - Oferta Agenda Bela (data-oferta em #lp, protótipo lp4-oferta): legendas
 *   em "você", CTA fixo que some com qualquer CTA da página à vista, a
 *   animação do bloco de preço, o cupom copiável (o código é um botão) e
 *   as abas iPhone/Android do "Como usar o cupom";
 * - devolve um cleanup (a página pode sair por navegação client-side).
 *
 * Sem JavaScript, ou com movimento reduzido, a página já está completa: todo
 * mock mostra o estado final e os controles de animação ficam escondidos.
 */
import { appStoreUrl, googlePlayUrl } from "@/config/app-stores";
import {
  buildAppStoreCampaign,
  buildPlayReferrerAttribution,
} from "@/config/landing-lojas";
import { detectDeviceOs, detectInAppBrowser } from "@/lib/device";

const NB = " ";
const STEPS = [5000, 5500, 4000, 6000, 6200, 6500];
const CAPS = [
  "Camila marca sozinha, pelo link do Salão Estilo.",
  "Ela paga o sinal de R$ 20,00 no Pix para garantir o horário.",
  "A confirmação chega no WhatsApp dela. Você não digita.",
  "A Paula é avisada no celular, com o sinal já no saldo. Ela segue atendendo.",
  "No dia, a Bela lembra a Camila. Ela confirma com um toque e a Paula é avisada.",
  "Atendeu: o valor entra no caixa. O que entrou, o que saiu e quanto sobrou.",
];
/* Oferta Agenda Bela: a legenda fala com a leitora ("você"), não da Paula.
   As mesmas frases de PASSOS_OFERTA em markup.ts. */
const CAPS_OFERTA = [
  "A Camila marca sozinha, pelo seu link.",
  "Ela paga o sinal de R$" + NB + "20,00 no Pix e o horário fica garantido.",
  "A confirmação chega no WhatsApp dela. Você não precisa escrever nada.",
  "Você é avisada no celular, com o sinal já no saldo. Segue atendendo.",
  "No dia, a Bela lembra a Camila. Ela confirma com um toque e você é avisada.",
  "Atendeu: o valor entra no caixa. Você vê o que entrou, o que saiu e quanto sobrou.",
];

function fmt(v, f) {
  if (f === "brl") return "R$" + NB + (Math.round(v) / 100).toFixed(2).replace(".", ",");
  if (f === "mmss") {
    v = Math.round(v);
    const m = Math.floor(v / 60);
    const s = v % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  return String(Math.round(v));
}

function ease(p) {
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
}

export function initLandingLojas(opts) {
  const lp = document.getElementById("lp");
  if (!lp) return function () {};

  /* Medição e animação têm listas de cleanup separadas, e a medição é ligada
     primeiro: se a animação quebrar (HTML alterado por extensão ou tradutor),
     só ela é desfeita. Os links das lojas e os eventos seguem funcionando. */
  const undoMedicao = [];
  const undoEngajamento = [];
  const undoAnimacao = [];
  const undoCupom = [];
  const undoAbasCupom = [];
  const desfazer = function (lista) {
    lista.splice(0).forEach(function (fn) {
      fn();
    });
  };

  let os = detectDeviceOs();
  try {
    os = medir(opts, lp, undoMedicao);
  } catch {
    /* Sem medição a página continua inteira; a animação é tentada assim mesmo. */
    desfazer(undoMedicao);
  }
  /* Engajamento (section_view, faq_open): lista própria, depois do lp_view.
     Se quebrar, não leva junto os links das lojas nem os cliques. */
  try {
    medirEngajamento(opts, lp, undoEngajamento, os);
  } catch {
    desfazer(undoEngajamento);
  }
  try {
    animar(lp, undoAnimacao, os);
  } catch {
    /* Desfaz só a animação: a página fica como chegou do servidor, que
       funciona sem JavaScript, e a medição já ligada continua valendo. */
    desfazer(undoAnimacao);
    lp.classList.remove("bf-live");
  }
  /* Cupom copiável da oferta: lista própria, para não cair junto com a
     animação nem derrubar a medição dos links. */
  try {
    ligarCupom(opts, lp, undoCupom);
  } catch {
    desfazer(undoCupom);
  }
  /* Abas do "Como usar o cupom": lista própria. Se quebrar, o bloco volta ao
     HTML do servidor (as duas listas à vista). */
  try {
    ligarAbasCupom(opts, lp, undoAbasCupom, os);
  } catch {
    desfazer(undoAbasCupom);
  }
  /* Com ou sem animação, sai o estado provisório do CSS. */
  lp.removeAttribute("data-pre");

  return function cleanup() {
    desfazer(undoAbasCupom);
    desfazer(undoCupom);
    desfazer(undoAnimacao);
    desfazer(undoEngajamento);
    desfazer(undoMedicao);
    lp.classList.remove("bf-live");
  };
}

function listen(undo, target, type, fn, options) {
  target.addEventListener(type, fn, options);
  undo.push(function () {
    target.removeEventListener(type, fn, options);
  });
}

/**
 * Aparelho, validade do tema, links das lojas e eventos (lp_view, store_click,
 * cta_click). Não depende de nada da animação. Devolve o aparelho detectado.
 */
function medir(opts, lp, undo) {
  const track = opts.track;
  const qa = function (sel) {
    return Array.prototype.slice.call(lp.querySelectorAll(sel));
  };

  /* O script em linha do markup já gravou aparelho e validade do tema antes
     da pintura; aqui são refeitos para a chegada por navegação client-side. */
  const os = detectDeviceOs();
  const inApp = detectInAppBrowser();
  lp.setAttribute("data-os", os);
  const temaFim = Number(lp.getAttribute("data-tema-fim"));
  if (temaFim && Date.now() >= temaFim) lp.setAttribute("data-tema", "padrao");

  const playHref = googlePlayUrl(
    buildPlayReferrerAttribution(opts.attribution, opts.slug),
  );
  /* Só na oferta: o link da App Store leva a campanha (ct) da sessão. O HTML
     do servidor sai com o link puro (sem JavaScript não há como saber a
     origem). Nas outras landings o link da App Store segue puro. */
  const appStoreHref = lp.hasAttribute("data-oferta")
    ? appStoreUrl(buildAppStoreCampaign(opts.attribution, opts.slug))
    : null;
  qa("a[data-store]").forEach(function (a) {
    const store = a.getAttribute("data-store");
    if (store === "google_play") a.setAttribute("href", playHref);
    if (store === "app_store" && appStoreHref) a.setAttribute("href", appStoreHref);
    /* No celular a loja abre na mesma aba (navegador interno do Instagram e
       do Facebook lida mal com aba nova); no computador, em aba nova. */
    if (os === "desktop" && !a.getAttribute("target")) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
      const hint = document.createElement("span");
      hint.className = "sr";
      hint.textContent = " (abre em nova aba)";
      a.appendChild(hint);
    }
    listen(undo, a, "click", function () {
      const loc = a.closest("[data-loc]");
      if (!loc) return;
      track({
        event: "store_click",
        store: store,
        cta_location: loc.getAttribute("data-loc"),
        device_os: os,
        in_app_browser: inApp,
      });
    });
  });
  /* Links internos medidos: simulador (data-sim) e rodapé (data-nav). */
  qa("a[data-sim], a[data-nav]").forEach(function (a) {
    listen(undo, a, "click", function () {
      track({
        event: "cta_click",
        cta_location: a.getAttribute("data-sim") || a.getAttribute("data-nav"),
      });
    });
  });
  track({
    event: "lp_view",
    device_os: os,
    ref: new URLSearchParams(window.location.search).get("ref") || undefined,
    in_app_browser: inApp,
  });
  return os;
}

/**
 * Quanto do marcador (data-sec) precisa estar dentro da área útil da tela
 * para a seção contar como vista.
 */
const SECAO_VISTA_LIMIAR = 0.75;
/**
 * Área útil: a faixa de baixo da tela não conta. É onde a seção só encosta ao
 * chegar e onde fica o CTA fixo do celular, por cima do conteúdo.
 */
const SECAO_VISTA_MARGEM = "0px 0px -15% 0px";

/**
 * Engajamento: section_view (preço e perguntas) e faq_open. Cada um sai no
 * máximo uma vez por carga de página (por seção, por pergunta).
 *
 * section_view: os marcadores são os títulos com data-sec. Uma seção pode ter
 * mais de um (na Black Friday, o bloco do tema e o "Quanto custa"): vale o
 * primeiro que aparecer. Marcador escondido (tema vencido) nunca cruza a tela.
 * Sem IntersectionObserver o evento não sai: não há como saber o que foi visto.
 *
 * faq_open: o toggle do <details> cobre toque, teclado e a busca do navegador
 * que abre a resposta. Fechar não mede.
 */
function medirEngajamento(opts, lp, undo, os) {
  const track = opts.track;
  const inApp = detectInAppBrowser();
  const qa = function (sel) {
    return Array.prototype.slice.call(lp.querySelectorAll(sel));
  };

  const abertas = {};
  qa("details[data-faq]").forEach(function (d) {
    listen(undo, d, "toggle", function () {
      const id = d.getAttribute("data-faq");
      if (!d.open || !id || abertas[id]) return;
      abertas[id] = true;
      track({
        event: "faq_open",
        faq_id: id,
        device_os: os,
        in_app_browser: inApp,
      });
    });
  });

  const marcadores = qa("[data-sec]");
  if (!marcadores.length || !("IntersectionObserver" in window)) return;
  const vistas = {};
  const io = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (x) {
        const secao = x.target.getAttribute("data-sec");
        if (
          !x.isIntersecting ||
          !(x.intersectionRatio >= SECAO_VISTA_LIMIAR) ||
          !secao ||
          vistas[secao]
        ) {
          return;
        }
        vistas[secao] = true;
        marcadores.forEach(function (m) {
          if (m.getAttribute("data-sec") === secao) io.unobserve(m);
        });
        track({
          event: "section_view",
          section: secao,
          device_os: os,
          in_app_browser: inApp,
        });
      });
    },
    /* Dois limiares: se a leitura ao cruzar o primeiro vier um pouco abaixo
       dele (arredondamento do navegador), a do título inteiro confirma. */
    { threshold: [SECAO_VISTA_LIMIAR, 1], rootMargin: SECAO_VISTA_MARGEM },
  );
  undo.push(function () {
    io.disconnect();
  });
  marcadores.forEach(function (m) {
    io.observe(m);
  });
}

/** Quanto tempo o aviso "Cupom copiado!" fica antes de voltar ao "toque para copiar". */
const CUPOM_AVISO_MS = 2500;

/** Cópia sem a Clipboard API (http sem ser localhost, navegador interno antigo). */
function copiarComCampoTemporario(texto) {
  /* O campo leva o foco ao ser selecionado: no fim ele volta para onde
     estava (o botão do cupom, para quem usa teclado ou leitor de tela). */
  const focoAntes = document.activeElement;
  const campo = document.createElement("textarea");
  campo.value = texto;
  campo.setAttribute("readonly", "");
  campo.setAttribute("aria-hidden", "true");
  campo.style.cssText =
    "position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0;font-size:16px";
  document.body.appendChild(campo);
  let copiou = false;
  try {
    campo.select();
    campo.setSelectionRange(0, texto.length);
    copiou = document.execCommand("copy");
  } catch {
    copiou = false;
  }
  campo.remove();
  if (focoAntes && focoAntes !== document.body && focoAntes.focus) {
    focoAntes.focus({ preventScroll: true });
  }
  return copiou;
}

/** Copia o texto. Resolve true se foi para a área de transferência. */
function copiarTexto(texto) {
  const comCampo = function () {
    return copiarComCampoTemporario(texto);
  };
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(texto).then(function () {
        return true;
      }, comCampo);
    }
  } catch {
    /* Clipboard API bloqueada: tenta o campo temporário. */
  }
  return Promise.resolve(comCampo());
}

/**
 * Cupom copiável da Oferta Agenda Bela ([data-cupom] em markup.ts): o código
 * é um botão. Toque ou clique copia e o aviso ao lado troca para "Cupom
 * copiado!" (data-copiado) por um instante.
 *
 * Se nada copiar, a caixa volta à versão em texto (sai o data-cupom-on), com
 * o código selecionado e o aviso .cupom-falha: segurar o dedo num <button>
 * não abre o menu de copiar no WebKit, num texto abre. Esse estado fica até a
 * página sair.
 *
 * Cada toque sai como cta_click (cupom_copiar_hero ou cupom_copiar_preco);
 * toque repetido com o "Cupom copiado!" ainda na tela conta um só.
 */
function ligarCupom(opts, lp, undo) {
  Array.prototype.slice.call(lp.querySelectorAll("[data-cupom]")).forEach(function (caixa) {
    const botao = caixa.querySelector(".cupom-btn");
    const codigo = botao && botao.querySelector(".cupom-cod");
    const msg = botao && botao.querySelector(".cupom-msg");
    const status = caixa.querySelector(".cupom-status");
    const texto = caixa.querySelector(".cupom-nojs");
    const falha = texto && texto.querySelector(".cupom-falha");
    if (!botao || !codigo || !msg || !status || !falha) return;
    let timer = 0;
    let timerStatus = 0;
    let vivo = true;
    /* Toque já contado: só volta a contar quando o "Cupom copiado!" sair. */
    let medido = false;
    /* A região viva é preenchida um instante depois de esvaziada: num segundo
       toque seguido, o leitor de tela anuncia de novo. */
    const anunciar = function (frase) {
      clearTimeout(timerStatus);
      status.textContent = "";
      timerStatus = setTimeout(function () {
        status.textContent = frase;
      }, 50);
    };
    const voltar = function () {
      clearTimeout(timer);
      clearTimeout(timerStatus);
      msg.textContent = "";
      status.textContent = "";
      caixa.classList.remove("is-copiado");
    };
    const copiado = function () {
      voltar();
      const frase = caixa.getAttribute("data-copiado");
      msg.textContent = frase;
      anunciar(frase);
      caixa.classList.add("is-copiado");
      timer = setTimeout(function () {
        voltar();
        medido = false;
      }, CUPOM_AVISO_MS);
    };
    /* Nada copiou: sai o botão, volta o código em texto, já selecionado. */
    const falhou = function () {
      voltar();
      medido = false;
      caixa.removeAttribute("data-cupom-on");
      caixa.classList.add("is-falha");
      falha.hidden = false;
      const selecao = window.getSelection && window.getSelection();
      if (selecao) {
        const faixa = document.createRange();
        faixa.selectNodeContents(texto.querySelector(".cupom-cod"));
        selecao.removeAllRanges();
        selecao.addRange(faixa);
      }
      /* A mesma pergunta do CSS (.so-mouse): com mouse, a outra redação. */
      const comMouse =
        window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches;
      const frase = falha.querySelector(comMouse ? ".so-mouse" : ".so-toque");
      anunciar(frase ? frase.textContent : "");
    };
    listen(undo, botao, "click", function () {
      /* A cópia começa dentro do clique (o navegador exige o gesto) e não
         depende da medição: se o evento falhar, o cupom é copiado assim mesmo. */
      const copia = copiarTexto(codigo.textContent);
      if (!medido) {
        medido = true;
        try {
          opts.track({
            event: "cta_click",
            cta_location: "cupom_copiar_" + caixa.getAttribute("data-cupom"),
          });
        } catch {
          /* Sem medição o cupom continua copiável. */
        }
      }
      copia.then(function (copiou) {
        if (!vivo) return;
        if (copiou) copiado();
        else falhou();
      });
    });
    /* Só agora o CSS troca o código em texto pelo botão com o aviso de
       copiar: sem este runtime a página não promete o que não funciona. */
    caixa.setAttribute("data-cupom-on", "");
    undo.push(function () {
      vivo = false;
      voltar();
      caixa.removeAttribute("data-cupom-on");
      caixa.classList.remove("is-falha");
      falha.hidden = true;
    });
  });
}

/**
 * "Como usar o cupom" (oferta): duas abas, iPhone e Android, no padrão de
 * abas do WAI-ARIA (setas, Home e End; só a aba aberta entra no Tab). Abre
 * a do aparelho: Android no Android; iPhone no iPhone e no computador.
 *
 * O HTML do servidor mostra as duas listas, cada uma com o seu título, e as
 * abas escondidas: é o que vale sem JavaScript. Aqui as abas aparecem, ganham
 * os papéis e o título repetido sai da tela (fica para o leitor de tela).
 * O cleanup devolve o bloco ao HTML do servidor.
 *
 * Trocar de aba é cta_click (cupom_aba_iphone ou cupom_aba_android), uma vez
 * por aba por carga de página; a aba aberta sozinha não conta.
 */
function ligarAbasCupom(opts, lp, undo, os) {
  const bloco = lp.querySelector("#como-usar-cupom");
  const lista = bloco && bloco.querySelector("#cp-abas");
  if (!lista) return;
  const abas = Array.prototype.slice.call(lista.querySelectorAll("[data-aba]"));
  const paineis = abas.map(function (aba) {
    return bloco.querySelector("#" + aba.getAttribute("aria-controls"));
  });
  if (abas.length < 2 || paineis.indexOf(null) !== -1) return;

  const ROTULO_DO_EVENTO = { ios: "iphone", android: "android" };
  const medidas = {};
  let atual = -1;
  function abrir(n, foco) {
    atual = n;
    abas.forEach(function (aba, i) {
      const aberta = i === n;
      aba.setAttribute("aria-selected", aberta ? "true" : "false");
      aba.tabIndex = aberta ? 0 : -1;
      paineis[i].hidden = !aberta;
    });
    if (foco) abas[n].focus();
  }
  function escolher(n, foco) {
    if (n === atual) {
      if (foco) abas[n].focus();
      return;
    }
    abrir(n, foco);
    const plat = abas[n].getAttribute("data-aba");
    if (!ROTULO_DO_EVENTO[plat] || medidas[plat]) return;
    medidas[plat] = true;
    try {
      opts.track({
        event: "cta_click",
        cta_location: "cupom_aba_" + ROTULO_DO_EVENTO[plat],
      });
    } catch {
      /* Sem medição as abas continuam funcionando. */
    }
  }

  undo.push(function () {
    lista.hidden = true;
    lista.removeAttribute("role");
    bloco.removeAttribute("data-abas");
    abas.forEach(function (aba, i) {
      aba.removeAttribute("role");
      aba.removeAttribute("aria-selected");
      aba.removeAttribute("tabindex");
      paineis[i].hidden = false;
      paineis[i].removeAttribute("role");
      paineis[i].removeAttribute("aria-labelledby");
      paineis[i].removeAttribute("tabindex");
    });
  });

  lista.setAttribute("role", "tablist");
  abas.forEach(function (aba, i) {
    aba.setAttribute("role", "tab");
    paineis[i].setAttribute("role", "tabpanel");
    paineis[i].setAttribute("aria-labelledby", aba.id);
    paineis[i].tabIndex = 0;
    listen(undo, aba, "click", function () {
      escolher(i, false);
    });
    listen(undo, aba, "keydown", function (ev) {
      const k = ev.key;
      let n = -1;
      if (k === "ArrowRight" || k === "ArrowDown") n = (i + 1) % abas.length;
      else if (k === "ArrowLeft" || k === "ArrowUp") n = (i + abas.length - 1) % abas.length;
      else if (k === "Home") n = 0;
      else if (k === "End") n = abas.length - 1;
      if (n < 0) return;
      ev.preventDefault();
      escolher(n, true);
    });
  });
  const padrao = os === "android" ? "android" : "ios";
  abrir(
    Math.max(
      0,
      abas.findIndex(function (aba) {
        return aba.getAttribute("data-aba") === padrao;
      }),
    ),
    false,
  );
  lista.hidden = false;
  bloco.setAttribute("data-abas", "");
}

/** CTA fixo do celular, demonstração do hero, abas, chips, tema Black Friday e oferta. */
function animar(lp, undo, os) {
  const $ = function (id) {
    return document.getElementById(id);
  };
  const qa = function (sel, root) {
    return Array.prototype.slice.call((root || lp).querySelectorAll(sel));
  };
  const on = function (target, type, fn, options) {
    listen(undo, target, type, fn, options);
  };
  const media = function (query) {
    return window.matchMedia ? window.matchMedia(query) : { matches: false };
  };
  const onMedia = function (mq, fn) {
    if (mq.addEventListener) on(mq, "change", fn);
  };
  const observe = function (callback, options) {
    const io = new IntersectionObserver(callback, options);
    undo.push(function () {
      io.disconnect();
    });
    return io;
  };
  const bf = lp.getAttribute("data-tema") === "bf";
  const oferta = lp.hasAttribute("data-oferta");
  const caps = oferta ? CAPS_OFERTA : CAPS;
  const celularDaDona = oferta ? "Seu celular" : "Celular da Paula";

  /* ============ CTA fixo do celular ============ */
  /* Só aparece depois que o CTA do hero saiu da tela e antes do rodapé: nunca
     dois botões iguais à vista por causa dele. Na oferta some também enquanto
     o botão da seção de preço ou o do final estiver na tela. */
  const sticky = $("cta-fixo");
  const heroCta = $("cta-hero");
  const foot = $("rodape");
  const ctas = qa(".cta");
  const mq = media("(max-width:767px)");
  function ctaDaPaginaNaTela() {
    for (let i = 0; i < ctas.length; i++) {
      const r = ctas[i].getBoundingClientRect();
      if (r.height > 0 && r.bottom > 0 && r.top < window.innerHeight) return true;
    }
    return false;
  }
  function updateSticky() {
    let show = false;
    if (os !== "desktop" && mq.matches) {
      const h = heroCta.getBoundingClientRect();
      const f = foot.getBoundingClientRect();
      show = oferta
        ? !ctaDaPaginaNaTela() && h.top < window.innerHeight && f.top > window.innerHeight
        : h.bottom < 0 && f.top > window.innerHeight;
    }
    sticky.hidden = !show;
  }
  let tk = false;
  let rafScroll = 0;
  function onScroll() {
    if (tk) return;
    tk = true;
    rafScroll = requestAnimationFrame(function () {
      tk = false;
      updateSticky();
    });
  }
  on(window, "scroll", onScroll, { passive: true });
  on(window, "resize", onScroll);
  updateSticky();

  /* ============ movimento ============ */
  const rmq = media("(prefers-reduced-motion: reduce)");
  const RM = rmq.matches;
  const wide = media("(min-width:900px)");
  const hasIO = "IntersectionObserver" in window;
  let docHidden = document.hidden;
  on(document, "visibilitychange", function () {
    docHidden = document.hidden;
    refreshAll();
  });

  function restart(el) {
    el.classList.remove("play");
    void el.offsetWidth;
    el.classList.add("play");
  }
  /* números que contam: o HTML já traz o valor final; aqui só se calcula o valor no instante e (ms) */
  function counters(root, e, swap) {
    const els = qa("[data-to]", root);
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      const from = +el.getAttribute("data-from");
      const to = +el.getAttribute("data-to");
      const dl = +el.getAttribute("data-delay");
      const du = +el.getAttribute("data-dur");
      const ee = e - (el.closest('[data-f="2"]') ? swap : 0);
      const p = Math.max(0, Math.min(1, (ee - dl) / du));
      const t = fmt(from + (to - from) * ease(p), el.getAttribute("data-fmt"));
      const tpl = el.getAttribute("data-tpl");
      const text = tpl ? tpl.replace("{n}", t) : t;
      if (el.textContent !== text) el.textContent = text;
    }
  }
  /* o dedo (círculo) vai até o alvo medido no layout: não depende de coordenada fixa */
  function placeTaps(scope) {
    qa(".tap", scope).forEach(function (tp) {
      const par = tp.parentElement;
      const tg = par.querySelector(tp.getAttribute("data-target"));
      if (!tg) return;
      let x = 0;
      let y = 0;
      let n = tg;
      while (n && n !== par) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent;
      }
      const cx = x + tg.offsetWidth / 2 - 15;
      const cy = y + tg.offsetHeight / 2 - 15;
      tp.style.setProperty("--x1", cx + "px");
      tp.style.setProperty("--y1", cy + "px");
      tp.style.setProperty("--x0", cx + 70 + "px");
      tp.style.setProperty("--y0", cy + 90 + "px");
    });
  }

  const players = [];
  let last = 0;
  let rafLoop = 0;
  function loop(t) {
    const dt = Math.min(100, t - last);
    last = t;
    for (let i = 0; i < players.length; i++) players[i].tick(dt);
    rafLoop = requestAnimationFrame(loop);
  }

  /* ============ HERO: o app funcionando ============ */
  const stage = $("hero-stage");
  const hero = {
    cur: RM ? 4 : 0,
    e: 0,
    user: false,
    inView: true,
    scenes: qa(".sc[data-n]", stage),
    dots: qa(".dot", stage),
    cap: $("hero-legenda"),
    pas: $("hero-passo"),
    who: $("hero-quem"),
    get running() {
      return !this.user && !docHidden && this.inView && !RM;
    },
    quem: function () {
      const c = this.cur;
      if (c < 3) return "Celular da Camila";
      if (c === 4) return RM ? celularDaDona : this.e < 3400 ? "Celular da Camila" : celularDaDona;
      return celularDaDona;
    },
    go: function (n) {
      this.cur = n;
      this.e = 0;
      for (let i = 0; i < this.scenes.length; i++) {
        const active = i === n;
        this.scenes[i].classList.toggle("is-active", active);
        if (!active) this.scenes[i].classList.remove("play");
      }
      const sc = this.scenes[n];
      if (!RM) {
        restart(sc);
        placeTaps(sc);
        counters(sc, 0, 0);
      }
      this.cap.textContent = caps[n];
      this.pas.textContent = "Passo " + (n + 1) + " de 6";
      this.who.textContent = this.quem();
      for (let d = 0; d < this.dots.length; d++) {
        const dt = this.dots[d];
        if (d === n) dt.setAttribute("aria-current", "step");
        else dt.removeAttribute("aria-current");
        dt.classList.toggle("done", d < n);
        dt.firstChild.firstChild.style.transform = d === n ? (RM ? "scaleX(1)" : "scaleX(0)") : "";
      }
    },
    tick: function (dt) {
      if (!this.running) return;
      this.e += dt;
      const sc = this.scenes[this.cur];
      counters(sc, this.e, 0);
      const q = this.quem();
      if (this.who.textContent !== q) this.who.textContent = q;
      this.dots[this.cur].firstChild.firstChild.style.transform =
        "scaleX(" + Math.min(1, this.e / STEPS[this.cur]) + ")";
      if (this.e >= STEPS[this.cur]) this.go((this.cur + 1) % 6);
    },
    sync: function () {
      stage.classList.toggle("paused", !this.running);
    },
  };
  players.push(hero);
  const ctl = $("hero-ctl");
  const bp = $("hero-pausar");
  const bpt = $("hero-pausar-txt");
  ctl.hidden = false;
  if (RM) bp.hidden = true;
  function setPauseUI() {
    bp.setAttribute("aria-pressed", hero.user ? "true" : "false");
    bp.setAttribute("aria-label", hero.user ? "Continuar a demonstração" : "Pausar a demonstração");
    bpt.textContent = hero.user ? "Continuar" : "Pausar";
  }
  function togglePause() {
    hero.user = !hero.user;
    setPauseUI();
    hero.sync();
  }
  hero.dots.forEach(function (d, i) {
    on(d, "click", function () {
      hero.user = false;
      setPauseUI();
      hero.go(i);
      hero.sync();
    });
  });
  on(bp, "click", togglePause);
  on($("hero-aparelho"), "click", function () {
    if (!RM) togglePause();
  });
  if (hasIO) {
    observe(
      function (en) {
        hero.inView = en[0].isIntersecting;
        hero.sync();
      },
      { threshold: 0.15 },
    ).observe(stage);
  }
  hero.go(RM ? 4 : 0);
  hero.sync();

  /* ============ DIFERENCIAIS: abas com mock animado ============ */
  const tabs = qa(".tab");
  const panels = qa(".panel");
  const tablist = $("dif-tabs");
  const mocks = [];
  panels.forEach(function (p, i) {
    const el = p.querySelector("[data-mock]");
    const m = {
      el: el,
      panel: p,
      i: i,
      dur: +el.getAttribute("data-dur"),
      swap: +el.getAttribute("data-swap") || 0,
      e: 0,
      started: false,
      done: false,
      vis: false,
      swapped: false,
      cur: 1,
      frames: qa(".duo-f", el),
      dots: qa("[data-dots] button", el),
      get narrow() {
        return this.frames.length > 1 && !wide.matches && !RM;
      },
      get running() {
        return this.started && !this.done && this.vis && !docHidden;
      },
      show: function (n) {
        this.cur = n;
        for (let k = 0; k < this.frames.length; k++) {
          this.frames[k].hidden = this.narrow ? k + 1 !== n : false;
        }
        if (this.frames[n - 1]) placeTaps(this.frames[n - 1]);
        for (let d = 0; d < this.dots.length; d++) {
          if (d + 1 === n) this.dots[d].setAttribute("aria-current", "true");
          else this.dots[d].removeAttribute("aria-current");
        }
      },
      layout: function () {
        if (this.frames.length < 2) return;
        const nar = this.narrow;
        if (this.dots.length) this.dots[0].parentNode.hidden = !nar;
        if (wide.matches) el.setAttribute("data-wide", "");
        else el.removeAttribute("data-wide");
        this.show(nar ? this.cur : 1);
      },
      start: function () {
        if (RM) return;
        this.started = true;
        this.done = false;
        this.e = 0;
        this.swapped = false;
        this.cur = 1;
        this.layout();
        restart(el);
        placeTaps(el);
        counters(el, 0, this.swap);
        this.sync();
      },
      tick: function (dt) {
        if (!this.running) return;
        this.e += dt;
        counters(el, this.e, this.swap);
        if (this.narrow && !this.swapped && this.swap && this.e >= this.swap) {
          this.swapped = true;
          this.show(2);
        }
        if (this.e >= this.dur) {
          this.done = true;
          this.sync();
        }
      },
      sync: function () {
        el.classList.toggle("paused", this.started && !this.done && !(this.vis && !docHidden));
      },
    };
    mocks.push(m);
    players.push(m);
    m.dots.forEach(function (d, k) {
      on(d, "click", function () {
        if (RM) return;
        m.started = true;
        m.done = false;
        /* Quadro 1 escolhido à mão volta a avançar sozinho para o 2 (no
           protótipo a troca automática ficava desligada nos dois casos). */
        m.swapped = k === 1;
        restart(el);
        placeTaps(el);
        m.e = k === 1 ? m.swap : 0;
        counters(el, m.e, m.swap);
        m.show(k + 1);
        m.sync();
      });
    });
    const rp = $("dif-replay-" + (i + 1));
    if (rp) {
      rp.hidden = RM;
      on(rp, "click", function () {
        m.start();
      });
    }
    m.layout();
  });
  function inViewport(el) {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight * 0.85 && r.bottom > window.innerHeight * 0.15;
  }
  if (hasIO) {
    const io = observe(
      function (en) {
        en.forEach(function (x) {
          const m = mocks.filter(function (k) {
            return k.el === x.target;
          })[0];
          m.vis = x.isIntersecting;
          if (m.vis && !m.started) m.start();
          m.sync();
        });
      },
      { threshold: 0.35 },
    );
    mocks.forEach(function (m) {
      io.observe(m.el);
    });
  }
  function refreshAll() {
    hero.sync();
    mocks.forEach(function (m) {
      m.sync();
    });
  }
  onMedia(wide, function () {
    mocks.forEach(function (m) {
      m.layout();
    });
  });

  let curTab = 0;
  tablist.hidden = false;
  function select(n, focus) {
    curTab = n;
    tabs.forEach(function (t, i) {
      const selected = i === n;
      t.setAttribute("aria-selected", selected ? "true" : "false");
      t.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(function (p, i) {
      if (i !== n) {
        p.hidden = true;
        mocks[i].started = false;
        mocks[i].vis = false;
      }
    });
    const p = panels[n];
    p.hidden = false;
    if (!RM) {
      p.classList.remove("panel-in");
      void p.offsetWidth;
      p.classList.add("panel-in");
    }
    const m = mocks[n];
    m.started = false;
    m.layout();
    if (focus) tabs[n].focus();
    if (!RM && inViewport(m.el)) {
      m.vis = true;
      m.start();
    }
    const rp = $("dif-replay-" + (n + 1));
    if (rp) rp.hidden = RM;
  }
  panels.forEach(function (p, i) {
    if (i > 0) p.hidden = true;
  });
  mocks.forEach(function (m) {
    m.layout();
  });
  tabs.forEach(function (t, i) {
    on(t, "click", function () {
      select(i, false);
    });
    on(t, "keydown", function (ev) {
      const k = ev.key;
      let n = -1;
      if (k === "ArrowRight" || k === "ArrowDown") n = (i + 1) % tabs.length;
      else if (k === "ArrowLeft" || k === "ArrowUp") n = (i + tabs.length - 1) % tabs.length;
      else if (k === "Home") n = 0;
      else if (k === "End") n = tabs.length - 1;
      if (n >= 0) {
        ev.preventDefault();
        select(n, true);
      }
    });
  });
  /* deslizar entre painéis (sem rolagem horizontal da página) */
  let sx = 0;
  let sy = 0;
  const box = $("dif-panels");
  on(
    box,
    "touchstart",
    function (ev) {
      const t = ev.touches[0];
      sx = t.clientX;
      sy = t.clientY;
    },
    { passive: true },
  );
  on(
    box,
    "touchend",
    function (ev) {
      const t = ev.changedTouches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        const n = curTab + (dx < 0 ? 1 : -1);
        if (n >= 0 && n < tabs.length) select(n, false);
      }
    },
    { passive: true },
  );

  /* ============ E tem mais ============ */
  const chips = qa("#mais-chips .chip");
  const folha = $("mais-folha");
  $("mais-chips").hidden = false;
  folha.hidden = false;
  $("mais-lista").hidden = true;
  chips.forEach(function (c) {
    on(c, "click", function () {
      chips.forEach(function (o) {
        o.setAttribute("aria-expanded", o === c ? "true" : "false");
      });
      folha.textContent = c.getAttribute("data-t");
    });
  });

  /* ============ Oferta Agenda Bela: bloco de preço ============ */
  /* Risca o preço cheio, entra o novo e a linha do tempo se preenche, uma vez,
     quando o cartão entra na tela. Sem IntersectionObserver ou com movimento
     reduzido nada é armado: o estado final já está no CSS. */
  const cartaoOferta = oferta ? $("oferta-card") : null;
  if (cartaoOferta && hasIO && !RM) {
    cartaoOferta.classList.add("arm");
    undo.push(function () {
      cartaoOferta.classList.remove("arm", "on");
    });
    void cartaoOferta.offsetWidth;
    const ofertaIo = observe(
      function (en) {
        if (en[0].isIntersecting) {
          cartaoOferta.classList.add("on");
          ofertaIo.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    ofertaIo.observe(cartaoOferta);
  }

  /* ============ tema Black Friday ============ */
  if (bf) {
    /* O título sobe uma vez, quando entra na tela. Sem IntersectionObserver ou
       com movimento reduzido nada é escondido: o estado final já está no CSS. */
    const big = lp.querySelector(".bf-big");
    if (big && hasIO && !RM) {
      big.classList.add("bf-pre");
      const bigIo = observe(
        function (es) {
          for (let i = 0; i < es.length; i++) {
            if (es[i].isIntersecting) {
              big.classList.add("bf-in");
              bigIo.disconnect();
              break;
            }
          }
        },
        { threshold: 0.25 },
      );
      bigIo.observe(big);
    }
    /* Pausa da faixa e dos efeitos em laço (faixa, halo, discos). */
    const faixaBtn = $("faixa-pausar");
    const faixa = $("slot-faixa");
    if (faixaBtn && faixa) {
      let user = false;
      const syncFaixa = function () {
        lp.classList.toggle("bf-live", !rmq.matches && !user && !document.hidden);
        faixaBtn.hidden = rmq.matches;
        faixaBtn.classList.toggle("is-paused", user);
        faixaBtn.setAttribute(
          "aria-label",
          user
            ? "Continuar o movimento da faixa e dos efeitos"
            : "Pausar o movimento da faixa e dos efeitos",
        );
      };
      on(faixaBtn, "click", function (e) {
        e.stopPropagation();
        user = !user;
        syncFaixa();
      });
      on(faixa, "click", function () {
        if (rmq.matches) return;
        user = !user;
        syncFaixa();
      });
      on(document, "visibilitychange", syncFaixa);
      onMedia(rmq, syncFaixa);
      syncFaixa();
    }
  }

  rafLoop = requestAnimationFrame(function (t) {
    last = t;
    rafLoop = requestAnimationFrame(loop);
  });
  undo.push(function () {
    cancelAnimationFrame(rafLoop);
    cancelAnimationFrame(rafScroll);
  });
}
