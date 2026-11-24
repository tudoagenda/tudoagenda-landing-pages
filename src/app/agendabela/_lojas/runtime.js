/*
 * Comportamento das landings de loja do Agenda Bela, sobre o HTML que o
 * servidor já entregou (markup.ts). É o script dos protótipos aprovados em
 * 19/11/2026, com a mesma lógica de animação. O que muda para produção:
 * - o aparelho vem do User-Agent (sem os seletores do protótipo);
 * - links das lojas com a origem da sessão e medição (lp_view, store_click,
 *   cta_click);
 * - fim do tema Black Friday pela validade gravada em #lp;
 * - Oferta Agenda Bela (data-oferta em #lp, protótipo lp4-oferta): legendas
 *   em "você", CTA fixo que some com qualquer CTA da página à vista e a
 *   animação do bloco de preço;
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
  const undoAnimacao = [];
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
  try {
    animar(lp, undoAnimacao, os);
  } catch {
    /* Desfaz só a animação: a página fica como chegou do servidor, que
       funciona sem JavaScript, e a medição já ligada continua valendo. */
    desfazer(undoAnimacao);
    lp.classList.remove("bf-live");
  }
  /* Com ou sem animação, sai o estado provisório do CSS. */
  lp.removeAttribute("data-pre");

  return function cleanup() {
    desfazer(undoAnimacao);
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
  /* Só na oferta: o link da App Store leva a campanha (ct) da sessão. Nas
     outras landings o link da App Store segue puro. */
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
