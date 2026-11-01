/*
 * Simulador do "Experimente o Agenda Bela".
 *
 * Origem: protótipo validado com o Miguel (biles, rodada final, 31/10/2026),
 * levado para produção como v1 sem redesenho. O código é o mesmo do protótipo;
 * as únicas mudanças estão marcadas com "[prod]":
 *  - vira um módulo com init/cleanup (montado por ExperimenteRuntime);
 *  - `track` empurra para o dataLayer (schema em src/lib/analytics/dataLayer.ts);
 *  - assets servidos de /public; QR pré-gerado (sem lib externa);
 *  - UTMs da página repassadas ao link da Google Play (parâmetro referrer).
 *
 * Garantia: nenhuma chamada de rede, nenhum dado digitado, nada salvo.
 * Todos os dados são fictícios e vivem só na memória desta aba.
 */
/* eslint-disable @typescript-eslint/no-unused-expressions -- estilo `a&&b()` do protótipo, mantido para não reescrever o simulador */

/**
 * @param {{ track: (e: Record<string, unknown>) => void, attribution?: Record<string, string> }} opts
 * @returns {() => void} cleanup
 */
export function initExperimente({ track: pushEvent, attribution = {} }) {
/* [prod] listeners globais registrados aqui são removidos no cleanup */
const cleanups = [];
const timers = [];
const later = (fn, ms) => { const id=setTimeout(fn, ms); timers.push(id); return id; };
const on = (target, type, fn) => { target.addEventListener(type, fn); cleanups.push(() => target.removeEventListener(type, fn)); };
/* ================= utilidades ================= */
const $ = (s, r=document) => r.querySelector(s);
const DOW = ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];
const DOWL = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
const MON = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
const now = new Date();
const addDays = (d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const dd = d => String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');
const ddmmyyyy = d => dd(d)+'/'+d.getFullYear();
const eyebrowDate = d => DOW[d.getDay()]+' · '+d.getDate()+' '+MON[d.getMonth()];
const brl = c => 'R$ '+(c/100).toFixed(2).replace('.',',').replace(/\B(?=(\d{3})+(?!\d),)/g,'.');
const dur = m => { const h=Math.floor(m/60), r=m%60; return h===0? r+'min' : r===0? h+'h' : h+'h '+r+'min'; };
const durShort = m => { const h=Math.floor(m/60), r=m%60; return h===0? r+'min' : r===0? h+'h' : h+'h'+String(r).padStart(2,'0'); };
const addMin = (t,m)=>{const [h,mi]=t.split(':').map(Number);const x=h*60+mi+m;return String(Math.floor(x/60)).padStart(2,'0')+':'+String(x%60).padStart(2,'0')};
const hBR = t => { const [h,m]=t.split(':'); return m==='00'? Number(h)+'h' : Number(h)+'h'+m; };   // "14:00" -> "14h" (bela-voice.ts)
const withArticle = d => (d.getDay()===0||d.getDay()===6? 'no ':'na ') + DOWL[d.getDay()];
const dayDiff = d => Math.round((new Date(d.toDateString())-new Date(now.toDateString()))/864e5);
const whenLong = (d,t) => { const x=dayDiff(d); return x===0?`hoje às ${hBR(t)}`:x===1?`amanhã às ${hBR(t)}`:`${withArticle(d)}, ${dd(d)}, às ${hBR(t)}`; };   // bela-voice.ts whenLong
const whenMedium = (d,t) => { const x=dayDiff(d); return x===0?`hoje às ${hBR(t)}`:x===1?`amanhã às ${hBR(t)}`:x<=6?`${withArticle(d)}, às ${hBR(t)}`:whenLong(d,t); };
const greet = () => { const h=now.getHours(); return h<12?'Bom dia':h<18?'Boa tarde':'Boa noite'; };
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const joinNames = a => a.length<=1 ? (a[0]||'') : a.slice(0,-1).join(', ')+' e '+a[a.length-1];   // booking-group.ts
/* [prod] eventos vão para o dataLayer (slug experimente); nunca Lead/CompleteRegistration */
function track(ev){ try{ pushEvent(ev); }catch{} }
const JN = j => Number(String(j).slice(1));   // 'j3' -> 3

const I = {
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  menu:'<path d="M4 12h16M4 6h16M4 18h16"/>', plus:'<path d="M5 12h14M12 5v14"/>',
  cr:'<path d="m9 18 6-6-6-6"/>', cd:'<path d="m6 9 6 6 6-6"/>', cl:'<path d="m15 18-6-6 6-6"/>',
  back:'<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  cal:'<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  check:'<path d="M20 6 9 17l-5-5"/>', x:'<path d="M18 6 6 18M6 6l12 12"/>',
  msg:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  save:'<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7M7 3v4a1 1 0 0 0 1 1h7"/>',
  scissors:'<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
  wallet:'<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  pkg:'<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12M3.3 7 12 12l8.7-5"/>',
  edit:'<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.4 2.6a2 2 0 0 1 3 3L12 15l-4 1 1-4Z"/>'
};
const ic = (n, c='#2A2A2A', s=20, w=2) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;
const hint = c => c ? ' hint' : '';
/* [prod] assets em /public */
const ASSET={icon:'/images/experimente/agenda-bela-icone.png', ios:'/images/experimente/badge-app-store-en.svg', android:'/images/experimente/badge-google-play-pt-br.png', qr:'/images/experimente/qr-experimente.png'};
const STORE={ios:'https://apps.apple.com/br/app/agenda-bela/id6782112738', android:'https://play.google.com/store/apps/details?id=com.tudoagenda.agendabela.salao&hl=pt_BR&gl=BR'+playReferrer()};
/* [prod] repassa a atribuição da landing (UTMs, gclid, fbclid; mesma fonte do dataLayer) para o Install Referrer da Google Play */
function playReferrer(){
  const t=new URLSearchParams(attribution).toString();
  return t ? '&referrer='+encodeURIComponent(t) : '';
}
const OS = /iPhone|iPad|iPod/.test(navigator.userAgent)?'ios':/Android/.test(navigator.userAgent)?'android':'desktop';
/* [prod] QR de https://tudoagenda.com.br/agendabela/experimente pré-gerado com o mesmo qrcodejs do protótipo (168px, #213745, nível M) */
const QR_SRC=ASSET.qr;
const BADGE_IOS = `<a class="badge-link" href="${STORE.ios}" target="_blank" rel="noopener" data-store="badge-ios"><img src="${ASSET.ios}" alt="Baixar na App Store" width="120" height="40" class="badge-ios"></a>`;
const BADGE_AND = `<a class="badge-link" href="${STORE.android}" target="_blank" rel="noopener" data-store="badge-android"><img src="${ASSET.android}" alt="Disponível no Google Play" width="134" height="52" class="badge-and"></a>`;
/* selos oficiais: no celular só o da loja do aparelho; nos demais, os dois */
const storeBadges = () => OS==='ios' ? BADGE_IOS : OS==='android' ? BADGE_AND : BADGE_IOS+BADGE_AND;
const storeHref = () => OS==='ios'?STORE.ios:OS==='android'?STORE.android:'#baixar';

/* ================= dados de exemplo (fictícios) ================= */
const SALON='Studio Ana', PRO='Ana';
const SERVICES = [
  {id:'s1', name:'Escova', price:6000, min:45},
  {id:'s2', name:'Corte feminino', price:9000, min:60},
  {id:'s3', name:'Mão e pé', price:5500, min:60},
  {id:'s4', name:'Design de sobrancelha', price:4000, min:30},
];
const svc = id => SERVICES.find(s=>s.id===id);
const SLOTS=['09:00','09:30','10:00','11:00','14:00','14:30','15:00','16:00','17:00'];
const PAST_SLOTS=['08:00','08:30','09:00','11:00','11:30'];
const PHONE_VAR='<span class="var">número do seu salão</span>';
const LINK_VAR='<span class="var">seu link</span>';

/* Templates reais (proof-step.tsx:123-139). Vários serviços: rótulo "A e B" (booking-group.ts). */
const confirmMsg=(first,date,time,svcLabel)=>`Olá ${first}! ✨ Seu agendamento no ${SALON} foi confirmado.\n📅 Data: ${dd(date)}\n🕐 Horário: ${time}\n💅 Serviço: ${svcLabel}\nQualquer dúvida, é só chamar o salão: https://wa.me/${PHONE_VAR} Até breve! 😃`;
/* lembrete_cliente_acoes_v1 (no ar, 07:00 do próprio dia, botões Confirmar/Remarcar/Cancelar) */
const reminderMsg=(first,date,time,svcLabel)=>`Oi, ${first}! Lembrete do seu horário em ${SALON}:\n\n📅 ${dd(date)} às ${hBR(time)}\n💇 ${svcLabel} com ${PRO}\n\nToque em Confirmar se estiver tudo certo, em Remarcar para escolher outro horário ou em Cancelar se não puder vir.\n\n<span class="var">linha de contato do salão</span>\n\nAté logo!`;

/* ================= jornadas ================= */
const J = {
  j1:{ title:'Marque uma cliente', sub:'Vários serviços de uma vez, a mensagem que ela recebe e o lembrete do dia, nas duas pontas.', client:true,
    steps:['Abra a agenda','Escolha os serviços','Escolha o horário e crie','Veja o que a Marina recebeu','No dia: lembrete pra ela, aviso pra você'],
    done:{title:'Marcado!', msg:'Mandei a confirmação pra Marina na hora e, no dia, lembrei ela de manhã. Ela tocou em Confirmar e eu te contei no mesmo minuto. Você não escreveu nenhuma mensagem.', next:'j2', chip:'Próximo: a cliente marca sozinha e paga o sinal', cta:'Ver a próxima'}},
  j2:{ title:'Ela marca sozinha e paga o sinal', sub:'Ligue o sinal, mande seu link e veja a cliente pagar o Pix. O dinheiro cai na sua conta.', client:true, deposit:true,
    steps:['Ligue o sinal no serviço','Mande seu link','A Marina escolhe o horário','Ela paga o sinal no Pix','O aviso e o dinheiro chegam pra você'],
    done:{title:'Ela marcou e pagou sozinha.', msg:'A Marina escolheu o horário pelo seu link e pagou o sinal no Pix. O horário já está na sua agenda e o dinheiro, no seu saldo. Você não parou o atendimento.', next:'j3', chip:'Próximo: tudo o que eu te conto', cta:'Ver a próxima'}},
  j3:{ title:'A Bela te conta tudo', sub:'O que eu fiz e o que suas clientes fizeram, e uma ajuda quando sobra horário.', client:false,
    steps:['Veja minha sugestão','Divulgue em um toque','Abra as novidades'],
    done:{title:'Eu te conto tudo.', msg:'Quem marcou, quem confirmou e o que eu mandei fica guardado nas novidades. Quando a tarde está livre no app, eu deixo a mensagem pronta pra você divulgar.', next:'j4', chip:'Próximo: cuide das suas clientes', cta:'Ver a próxima'}},
  j4:{ title:'Cuide das suas clientes', sub:'Veio ou não veio, a ficha da cliente e um pacote de sessões.', client:false,
    steps:['Marque quem veio','Marque quem faltou','Abra a ficha da cliente','Crie um pacote','Use uma sessão'],
    done:{title:'Ficha em dia.', msg:'Quem veio entra no caixa e quem faltou fica anotado na ficha. O pacote da Juliana fica contado: cada sessão usada sai do saldo dela.', next:'j5', chip:'Próximo: feche o caixa', cta:'Ver a próxima'}},
  j5:{ title:'Feche o caixa do dia', sub:'O que entrou, o que saiu, e o atendimento que você esqueceu de anotar.', client:false,
    steps:['Veja o saldo do dia','Anote o que já aconteceu','Lance uma saída'],
    done:{title:'É assim que o dia fecha.', msg:'Os atendimentos feitos entram sozinhos. O que você esqueceu de anotar dá pra registrar depois, sem mandar mensagem pra cliente. E você só lança o que saiu do padrão.', next:null, cta:'Concluir'}},
};
const ORDER=['j1','j2','j3','j4','j5'];
/* [prod] slugs estáveis dos passos (mesma ordem de J[j].steps, "passo X de N" do coach). Mudou o tour? Mantenha os slugs antigos. */
const STEP_NAMES={
  j1:['abrir_agenda','escolher_servicos','escolher_horario_e_criar','ver_celular_cliente','lembrete_do_dia'],
  j2:['ligar_sinal','mandar_link','cliente_escolhe_horario','cliente_paga_sinal','receber_aviso_e_dinheiro'],
  j3:['ver_sugestao','divulgar','abrir_novidades'],
  j4:['marcar_veio','marcar_faltou','abrir_ficha','criar_pacote','usar_sessao'],
  j5:['ver_saldo','anotar_atendimento_passado','lancar_saida'],
};
const completed=new Set();

/* ================= estado ================= */
let S;
function fresh(j){
  return { j, step:0, owner:'home', homeMode:'zero', client:'idle', tab:'owner', unread:0, ownerUnread:0, sheet:null, alert:null, pushes:[], toast:null,
    svcs:[], addMode:false, date:(addDays(now,1).getDay()===0?addDays(now,2):addDays(now,1)), time:null, dayOf:false, confirmed:false, seenClient:false,
    depOn:false, depVal:null, depSaved:false, bkDate:null, bkSvc:null, bkTime:null, paid:false, balance:0,
    percebeDone:false, jf:{a:'pending',b:'pending'}, pkName:null, pkSess:null, pkPaid:null, pkMethod:null, pkCreated:false, pkUsed:0,
    past:false, pastSaved:false, outSaved:false, outDesc:null, outVal:null };
}
S = fresh(null);
const sim=$('#sim'), coach=$('#coach'), ownerEl=$('#ownerScreen'), clientEl=$('#clientScreen');
const isDesk=()=>matchMedia('(min-width:900px)').matches;
const seesOwner=()=>isDesk()||S.tab==='owner';
const seesClient=()=>isDesk()||S.tab==='client';

/* ================= peças comuns ================= */
function pushesHtml(){
  if(!S.pushes.length) return '';
  return `<div class="pushes">${S.pushes.map((p,i)=>`<div class="push${hint(p.act&&p.hint)}" role="button" tabindex="0" data-a="${p.act||'push-x'}" data-i="${i}"><span class="appic"><img src="${ASSET.icon}" alt=""></span><div style="flex:1;min-width:0;padding-right:22px"><small>AGENDA BELA · ${p.time||'agora'}</small><b>${p.t}</b><span>${p.b}</span></div><button class="x" data-a="push-x" data-i="${i}" aria-label="Dispensar aviso">×</button></div>`).join('')}</div>`;
}
function alertHtml(){ return S.alert ? `<div class="ios-alert-bg"><div class="ios-alert" role="alertdialog" aria-label="${esc(S.alert.t)}"><b>${S.alert.t}</b><p>${S.alert.b}</p><button class="hint" data-a="alert-ok">OK</button></div></div>` : ''; }
function inToast(){ return S.toast ? `<div class="in-toast" role="status">${S.toast}</div>` : ''; }
function overlays(){ return pushesHtml() + (S.sheet?S.sheet():'') + alertHtml() + inToast(); }
function darkHead(ey, title, rightHtml, back='noop'){
  return `<div class="panel-in"><div class="dark-head"><button class="back" data-a="${back}" aria-label="Voltar">${ic('back','#fff',22)}</button><div class="t">${ey?`<div class="ey">${ey}</div>`:''}<h4>${title}</h4></div>${rightHtml||''}</div></div>`;
}
function sheetWrap(title, inner){ return `<div class="backdrop" data-a="close-sheet" data-self="1"><div class="sheet" role="dialog" aria-label="${esc(title)}"><div class="sheet-h"><h5>${title}</h5><button data-a="close-sheet" aria-label="Fechar">${ic('x','#6F6A6D',20)}</button></div>${inner}</div></div>`; }

/* ================= telas da dona ================= */
function todayRows(list){
  return '<div style="margin-top:8px">'+list.map((r,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:7px 0;${i?'border-top:1px solid #EADCD5':''}"><span style="font-family:var(--f-mono);font-size:11px;color:#90496A;width:44px">${r[0]}</span><span style="flex:1;min-width:0;font-weight:600;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r[1]}</span><span class="hbadge ${r[2]}" style="margin:0;white-space:nowrap">${r[2]==='ok'?'✅ Confirmou':'Lembrei às 07:00'}</span></div>`).join('')+'</div>';
}
function homeScreen(){
  const m=S.homeMode, d=S.dayOf?S.date:now;
  let status='Marca um horário que eu mando a confirmação pra cliente.', cards='', bell=0, chip=false;
  const svcLabel = joinNames(S.svcs.map(id=>svc(id).name));
  const total = S.svcs.reduce((a,id)=>a+svc(id).price,0);
  if(m==='zero'){
    status='Tô pronta pra cuidar da sua primeira cliente.';
    cards=`<div class="hcard creme"><div class="a-eyebrow" style="margin-bottom:6px">Comece por aqui</div><div class="a-section">Marque sua primeira cliente</div>
      <div class="a-body" style="margin-top:4px">Quando você marcar, eu mando a confirmação pra ela e te conto aqui.</div>
      <button class="hbtn${hint(S.j==='j1'&&S.step===0)}" data-a="j1-open">Marcar um horário</button></div>
      <div class="rowcard">Amanhã ainda não tem horário no app ${ic('cr','#90496A',18)}</div>`;
  } else if(m==='booked'){
    bell=1;
    cards=`<div class="hcard creme"><div class="a-eyebrow" style="margin-bottom:6px">Hoje</div><div class="a-section">Hoje não tem horário no app.</div>
      <div class="a-body" style="margin-top:4px">Se marcar alguém por fora, lança aqui que eu aviso a cliente.</div><button class="hbtn" data-a="noop">Marcar um horário</button></div>
      <div class="rowcard"><span>${dayDiff(S.date)===1?'Amanhã: <b>1 horário</b>':'Amanhã ainda não tem horário no app'}</span>${ic('cr','#90496A',18)}</div>`;
  } else if(m==='dayof'){
    status = S.confirmed ? 'Hoje eu lembrei 1 cliente e 1 já confirmou' : 'Hoje eu lembrei 1 cliente do horário';
    bell = S.confirmed?3:2;
    cards=`<div class="summary"><div class="a-eyebrow">Resumo do dia</div><div class="amount">${brl(total)}</div><div class="sub">previsto hoje, sem cancelados e sem faltas</div>
      <div class="stats"><div><b>1</b><span>horário</span></div><div><b>${S.confirmed?1:0}</b><span>${S.confirmed?'confirmou':'confirmaram'}</span></div><div><b>0</b><span>cancelaram</span></div></div></div>
      <div class="hcard creme"><div class="a-eyebrow" style="margin-bottom:6px">Próxima</div><div class="a-section">${S.time} · Marina</div><div class="a-body" style="margin-top:2px">${esc(svcLabel)} · com ${PRO}</div>
      <span class="hbadge ${S.confirmed?'ok':'rem'}">${S.confirmed?'✅ Confirmou às 07:42':'Lembrei hoje às 07:00'}</span><br><button class="hlink" data-a="noop">Ver na agenda ${ic('cr','#90496A',16)}</button></div>`;
  } else if(m==='share'){
    chip=true; status='Hoje eu lembrei 3 clientes e 2 já confirmaram';
    cards=`<div class="hcard"><div class="a-eyebrow" style="margin-bottom:6px">Hoje</div><div class="a-section">3 horários · 2 confirmaram</div>${todayRows([['09:00','Juliana · Mão e pé','ok'],['10:30','Camila · Escova','ok'],['15:00','Bianca · Corte feminino','rem']])}</div>`+
      (S.bkTime ? `<div class="hcard"><div class="a-eyebrow" style="margin-bottom:6px">Chegou pelo seu link</div><div style="font-weight:600;font-size:15px">Marina marcou pelo seu link</div><div class="a-body" style="margin-top:4px">Escova ${whenLong(S.bkDate,S.bkTime)}. Já mandei a confirmação.</div></div>`
       : `<div class="hcard"><div style="font-weight:600;font-size:15px">Quer que mais clientes marquem sozinhas?</div><div class="a-body" style="margin-top:4px">Seu link vai com a mensagem pronta.</div>
      <div style="display:flex;gap:8px;margin-top:10px"><button class="hbtn${hint(S.step===1)}" style="margin:0;flex:1" data-a="j2-share">Mandar meu link</button><button class="hghost" data-a="noop">Agora não</button></div></div>`);
  } else if(m==='j3'){
    status='Hoje eu lembrei 3 clientes e 2 já confirmaram'; bell=S.step>=2?0:3;
    cards=`<div class="hcard"><div class="a-eyebrow" style="margin-bottom:6px">Hoje</div><div class="a-section">3 horários · 2 confirmaram</div>${todayRows([['09:00','Juliana · Mão e pé','ok'],['10:30','Camila · Escova','ok'],['11:30','Paula · Escova','rem']])}</div>`+
      (!S.percebeDone ? `<div class="hcard"><div class="a-eyebrow" style="margin-bottom:6px">Percebi</div><div style="font-weight:600;font-size:15px">Hoje, das 14h às 17h, está livre no app.</div><div class="a-body" style="margin-top:4px">Quer que eu prepare a mensagem pra divulgar?</div>
        <div style="display:flex;gap:8px;margin-top:10px"><button class="hbtn${hint(S.step===0)}" style="margin:0;flex:1" data-a="j3-prep">Preparar mensagem</button><button class="hghost" data-a="noop">Agora não</button></div>
        <p class="info-note"><span aria-hidden="true">ⓘ</span> aparece quando sua agenda estiver no app</p></div>` : '');
  } else if(m==='j4'){
    status='Hoje eu lembrei 3 clientes e 2 já confirmaram'; bell=1;
    const rows=[]; if(S.jf.a==='pending')rows.push(['a','09:00','Juliana Reis','Mão e pé']); if(S.jf.b==='pending')rows.push(['b','10:30','Camila Torres','Escova']);
    cards=`<div class="summary"><div class="a-eyebrow">Resumo do dia</div><div class="amount">${brl(5500+6000+9000-(S.jf.b==='naoveio'?6000:0))}</div><div class="sub">previsto hoje, sem cancelados e sem faltas</div>
      <div class="stats"><div><b>3</b><span>horários</span></div><div><b>2</b><span>confirmaram</span></div><div><b>0</b><span>cancelaram</span></div>${S.jf.b==='naoveio'?'<div><b>1</b><span>não veio</span></div>':''}</div></div>`;
    if(rows.length) cards+=`<div class="jf-h"><span class="a-section">Acabou de passar</span><span class="a-eyebrow">revise ${rows.length} ${rows.length===1?'atendimento':'atendimentos'}</span></div><div class="jf">`+rows.map(r=>`<div class="jf-row"><div class="jf-top"><span class="t">${r[1]}</span><div style="flex:1"><div class="n">${r[2]}</div><div class="s">${r[3]}</div></div><span class="neutral">aguardando</span></div>
      <div class="jf-btns"><button class="veio${hint(r[0]==='a'&&S.step===0)}" data-a="j4-mark" data-k="${r[0]}" data-v="veio" aria-label="Marcar como veio">Veio</button><button class="naoveio${hint(r[0]==='b'&&S.step===1)}" data-a="j4-mark" data-k="${r[0]}" data-v="naoveio" aria-label="Marcar como não veio">Não veio</button></div></div>`).join('')+'</div>';
    cards+=`<div class="hcard creme"><div class="a-eyebrow" style="margin-bottom:6px">Próxima</div><div class="a-section">15:00 · Bianca</div><div class="a-body" style="margin-top:2px">Corte feminino · com ${PRO}</div><span class="hbadge rem">Lembrei hoje às 07:00</span></div>`;
  }
  const chipHtml = chip||S.j==='j2' ? `<button class="balchip${hint(false)}" data-a="${S.paid?'open-conta':'noop'}" aria-label="Saldo da Conta Agenda Bela: ${brl(S.balance)}">${ic('wallet','#213745',14)}<span>${brl(S.balance)}</span></button>` : '';
  const pill = bell>0 ? `<span class="pill">${bell}</span>` : '';
  return `<div class="app"><div class="scroll"><div class="home">
    <div class="home-head"><div style="min-width:0"><div class="a-eyebrow">${eyebrowDate(d)}</div><div class="greet">${S.dayOf?'Bom dia':greet()}, Ana</div><div class="statusline">${status}</div></div>
    <div class="iconbtns">${chipHtml}<button class="iconbtn${hint(S.j==='j3'&&S.step===1)}" data-a="${S.j==='j3'?'j3-bell':'noop'}" aria-label="Novidades da Bela${bell?', '+bell+(bell===1?' nova':' novas'):''}">${ic('bell','#213745',20)}${pill}</button><span class="iconbtn" aria-hidden="true">${ic('menu','#213745',22)}</span></div></div>
    ${cards}</div></div>
    ${m==='zero'?`<button class="fab" data-a="j1-open" aria-label="Marcar, divulgar ou bloquear">${ic('plus','#fff',26,2.5)}</button>`:''}
    ${overlays()}</div>`;
}

function formScreen(){
  const past = S.past, j5 = S.j==='j5';
  const ready = S.svcs.length>0;
  const canSave = ready && !!S.time;
  const totalMin = S.svcs.reduce((a,id)=>a+svc(id).min,0), totalPrice=S.svcs.reduce((a,id)=>a+svc(id).price,0);
  const st = S.j==='j1'?S.step:-1;
  const client = j5 ? ['Bianca Lima','(11) 97777-1234'] : ['Marina Souza','(11) 91234-5678'];
  const date = past ? now : S.date;
  const slots = past ? PAST_SLOTS : SLOTS;
  let svcBlock;
  if(!ready) svcBlock = `<button class="field ph${hint(st===1)}" data-a="open-svc" data-v="replace" aria-label="Escolher serviço"><span style="flex:1">Escolher serviço</span>${ic('cd','#6F6A6D',18)}</button>`;
  else if(S.svcs.length===1) svcBlock = `<button class="field" data-a="open-svc" data-v="replace" aria-label="Serviço: ${svc(S.svcs[0]).name}. Trocar"><span style="flex:1">${esc([svc(S.svcs[0]).name,durShort(svc(S.svcs[0]).min),brl(svc(S.svcs[0]).price)].join(' · '))}</span>${ic('cd','#6F6A6D',18)}</button>`;
  else svcBlock = S.svcs.map(id=>`<div class="svc-chosen"><span>${esc([svc(id).name,durShort(svc(id).min),brl(svc(id).price)].join(' · '))}</span><button data-a="rm-svc" data-v="${id}" aria-label="Remover ${svc(id).name}">${ic('x','#6F6A6D',18)}</button></div>`).join('')+`<div class="total">${durShort(totalMin)} · ${brl(totalPrice)}</div>`;
  return `<div class="app">${darkHead(past?'JÁ ACONTECEU':'NOVO','Agendamento',`<button class="save" data-a="form-save" ${canSave?'':'disabled'}>Salvar</button>`,'form-cancel')}
    <div class="panel"><div class="scroll"><div class="fbody">
      <div class="fcard"><div class="flabel">Serviço *</div>${svcBlock}
        ${ready&&S.svcs.length<8?`<button class="addsvc${hint(st===1&&S.svcs.length===1)}" data-a="open-svc" data-v="add" aria-label="Adicionar serviço">+ Adicionar serviço</button>`:''}
        ${S.err==='svc'?'<div class="ferr">Escolha o serviço para ver os horários.</div>':''}</div>
      ${ready?`<div class="fcard"><div class="flabel">Profissional *</div><div class="field locked"><span style="flex:1">${PRO}</span>${ic('cd','#6F6A6D',18)}</div></div>`:''}
      <div class="fcard"><button class="ab-switch${hint(j5&&!past)}" role="switch" aria-checked="${past}" data-a="toggle-past"><span class="tx"><b>Esse atendimento já aconteceu</b><small>${past?'Entra no relatório como realizado. A cliente não recebe mensagem.':'Pra anotar o que você já fez. Vale até com a agenda fechada.'}</small></span><span class="track"></span></button></div>
      <div class="fcard"><div class="flabel">Data</div><button class="field gray" data-a="${past?'noop':'open-date'}" aria-label="Data ${ddmmyyyy(date)}. Abre o calendário pra trocar o dia">${ic('cal','#6b7280',18)}<span style="flex:1">${ddmmyyyy(date)}</span></button></div>
      ${ready?`<div class="fcard"><div class="flabel">Horário *</div><div class="slots" role="group" aria-label="${past?'Horários que já passaram':'Horários livres'}">
        ${slots.map(t=>`<button class="slot${hint(!S.time&&((st===2&&t==='14:00')||(j5&&past&&t==='08:00')))}" aria-pressed="${S.time===t}" data-a="slot" data-v="${t}">${t}</button>`).join('')}</div>
        ${S.err==='time'?'<div class="ferr">Escolha um horário.</div>':''}
        <div class="dur">${ic('clock','#2563eb',16)}<span style="margin-left:8px;position:relative;top:-3px">Duração: ${dur(totalMin)}</span>${S.time?`<small>Fim estimado: ${addMin(S.time,totalMin)}</small>`:''}</div></div>`:''}
      <div class="fcard" style="${ready?'':'opacity:.4'}"><div class="ftitle">Informações do Cliente</div>
        <div class="seg" aria-hidden="true"><span>Nova cliente</span><span class="on">Cliente cadastrada</span></div>
        <div class="flabel">Nome *</div><div class="field locked">${ic('user','#6b7280',18)}<span style="flex:1">${client[0]}</span>${ic('lock','#90496A',16)}</div>
        <div class="flabel" style="margin-top:16px">Telefone *</div><div class="field locked">${ic('phone','#6b7280',18)}<span style="flex:1">${client[1]}</span>${ic('lock','#90496A',16)}</div>
        <div class="lockhint">${ic('lock','#90496A',14)}<span>Cliente de exemplo. No app, você escolhe uma das suas ou cadastra uma nova.</span></div></div>
      <div style="height:16px"></div></div></div>
      <div class="ffoot"><button class="cancel" data-a="form-cancel">Cancelar</button><button class="create${hint(canSave)}" data-a="form-save">${ic('save','#fff',20)}Criar</button></div>
    </div>${overlays()}</div>`;
}
function svcSheet(){
  const add = S.addMode;
  const list = SERVICES.filter(s=>!(add && S.svcs.includes(s.id)));
  return sheetWrap('Qual serviço?', list.map(s=>`<button class="catrow${hint((!add&&!S.svcs.length&&s.id==='s1')||(add&&s.id==='s3'))}" data-a="pick-svc" data-v="${s.id}"><span class="grow"><span class="n">${s.name}</span><span class="s">${brl(s.price)} · ${dur(s.min)}</span></span>${ic('cr','#A39CA0',18)}</button>`).join(''));
}
function dateSheet(){
  const days=[];for(let i=1;i<=9;i++){const d=addDays(now,i); if(d.getDay()!==0) days.push(d);}
  return sheetWrap('Escolha o dia', `<div class="daychips">${days.slice(0,8).map(d=>`<button class="daychip" aria-pressed="${d.toDateString()===S.date.toDateString()}" data-a="pick-date" data-v="${d.toISOString()}"><small>${DOW[d.getDay()]}</small><b>${d.getDate()}</b></button>`).join('')}</div><p class="a-body" style="margin:12px 0 0">No app, aqui abre o calendário do mês.</p>`);
}

/* J2: serviço com sinal */
function svcFormScreen(){
  const s=svc('s1'), vals=[1000,2000,3000];
  const gw = v => Math.min(Math.max(Math.round(v*80/10000),50),500), pf = v => Math.round(v*149/10000);
  const prev = S.depVal ? `<div class="deposit-prev"><b>Entra no seu saldo: ${brl(S.depVal-gw(S.depVal)-pf(S.depVal))}</b><small>Taxa do PIX: ${brl(gw(S.depVal))} · Tarifa Agenda Bela (1,49%): ${brl(pf(S.depVal))}</small><small style="color:#6b7280">O valor fica no seu saldo até você sacar.</small></div>` : '';
  return `<div class="app">${darkHead('EDITANDO','Serviço',`<button class="save" data-a="j2-save-svc" ${S.depOn&&S.depVal?'':'disabled'}>Salvar</button>`)}
    <div class="panel"><div class="scroll"><div class="fbody">
      <div class="fcard"><div class="flabel">Nome *</div><div class="field locked">${s.name}</div>
        <div style="display:flex;gap:8px;margin-top:12px"><div style="flex:1"><div class="flabel">Preço</div><div class="field locked">${brl(s.price)}</div></div><div style="flex:1"><div class="flabel">Duração</div><div class="field locked">${dur(s.min)}</div></div></div></div>
      <div class="fcard"><button class="ab-switch${hint(!S.depOn)}" role="switch" aria-checked="${S.depOn}" aria-label="Exigir sinal" data-a="j2-dep"><span class="tx"><b style="font-size:18px;font-weight:700">Exigir sinal</b><small>A cliente paga um sinal por PIX no link para confirmar o horário.</small></span><span class="track"></span></button>
        ${S.depOn?`<div style="margin-top:16px"><div class="flabel">Valor do sinal (R$) *</div><div class="chips">${vals.map(v=>`<button class="chip${hint(!S.depVal&&v===2000)}" aria-pressed="${S.depVal===v}" data-a="j2-depval" data-v="${v}">${brl(v)}</button>`).join('')}</div><p class="a-body" style="margin:8px 0 0">No app você digita o valor.</p>${prev}</div>`:''}
        <p class="info-note"><span aria-hidden="true">ⓘ</span> Vale para quem marca pelo seu link, em serviço avulso. Precisa da sua chave Pix no perfil.</p></div>
    </div></div><div class="ffoot"><button class="cancel" data-a="noop">Cancelar</button><button class="create${hint(S.depOn&&S.depVal)}" data-a="j2-save-svc">${ic('save','#fff',20)}Salvar</button></div></div>${overlays()}</div>`;
}
function shareSheet(kind){
  const text = kind==='dia' ? 'Tenho horários hoje à tarde! Quem quiser, já escolhe o seu comigo direto pelo link:' : 'Novidade por aqui! Agora dá pra marcar seu horário comigo direto pelo link, é rapidinho:';
  return ()=>sheetWrap('Mensagem pronta', `<p class="a-body" style="margin:0 0 10px;font-size:14px">É só escolher pra onde mandar.</p>
    <div class="bubble from-salon" style="max-width:100%;border:1px solid var(--line)">${text}\n${LINK_VAR}</div>
    <div style="display:flex;gap:8px;margin-top:12px"><button class="hbtn${hint(kind==='dia')}" style="margin:0;flex:1" data-a="${kind==='dia'?'j3-status':'noop'}">Pôr no meu status</button><button class="hbtn${hint(kind!=='dia')}" style="margin:0;flex:1" data-a="${kind==='dia'?'noop':'j2-send'}">Mandar pra cliente</button></div>
    <p class="a-body" style="margin:10px 0 0">${kind==='dia'?'No app, você troca o texto ou escreve do seu jeito.':'Neste teste, ela vai só pra Marina, que é de exemplo.'}</p>`);
}
function contaScreen(){
  return `<div class="app"><div class="cx-head"><button class="back" data-a="noop" aria-label="Voltar">${ic('back','#213745',22)}</button><h4>Conta Agenda Bela</h4></div>
    <div class="scroll" style="padding:0 16px 20px">
      <div class="conta-card"><div class="a-eyebrow">Saldo disponível</div><div class="v">${brl(S.balance)}</div><p>Os sinais pagos pelas suas clientes entram aqui. Você saca para a sua chave PIX.</p><div class="saq" aria-disabled="true">Sacar</div><p style="font-size:12px">Saque a partir de R$ 10,00</p></div>
      <div class="sect">Sinais recebidos</div>
      <div class="drow new"><div style="flex:1;min-width:0"><b>Marina · Escova</b><small>${dd(S.bkDate)} às ${S.bkTime}</small></div><span class="amt">+ ${brl(S.balance)}</span></div>
      <p class="a-body" style="margin-top:6px;font-size:12px">De cada sinal saem a tarifa do PIX e 1,49% do Agenda Bela.</p>
    </div>${overlays()}</div>`;
}
/* J3 */
function novidadesScreen(){

  const items=[
    ['hoje',1,'Marina confirmou ✅','Escova hoje às 14h. · 7:42'],
    ['hoje',1,'Lembrei 3 clientes de hoje','Juliana, Camila e Paula. 2 já leram. · 7:02'],
    ['hoje',1,'Bom dia! Te mandei o resumo do dia','7:30'],
    ['ontem',0,'Paula pagou o sinal 💰',`Escova hoje às 11h30. ${brl(1920)} já está no seu saldo. · ontem`],
    ['ontem',0,'Paula marcou pelo seu link','Escova hoje às 11h30. Já mandei a confirmação. · ontem'],
    ['semana',0,'Sua primeira cliente marcou sozinha 🎉','Juliana: Mão e pé hoje às 9h · '+DOW[addDays(now,-3).getDay()].toLowerCase()],
  ];
  const sec={hoje:'Hoje',ontem:'Ontem',semana:'Esta semana'}; let last='', html='';
  items.forEach(it=>{ if(it[0]!==last){ html+=`<div class="nv-sec">${sec[it[0]]}</div>`; last=it[0]; } html+=`<div class="nv-item"><span class="nv-dot${it[1]?' on':''}" aria-hidden="true"></span><div style="flex:1;min-width:0"><b>${it[1]?'<span class="sr">Nova. </span>':''}${it[2]}</b><small>${it[3]}</small></div>${ic('cr','#90496A',18)}</div>`; });
  return `<div class="app"><div class="cx-head"><button class="back" data-a="noop" aria-label="Voltar">${ic('back','#213745',22)}</button><h4>Novidades</h4></div>
    <div class="scroll" style="padding:0 16px 24px">${html}<p class="a-body" style="text-align:center;padding:20px 0 0">Isso é tudo dos últimos 30 dias.</p></div>${overlays()}</div>`;
}
/* J4 */
function fichaScreen(){
  const pk = S.pkCreated ? `<div class="pk-card new"><b style="color:#1f2937">${esc(S.pkName)}</b><div style="display:flex;justify-content:space-between;margin-top:8px;font-size:14px;color:#374151"><span>${S.pkUsed} de ${S.pkSess} usadas</span><span style="color:#6b7280">${S.pkSess-S.pkUsed===1?'falta 1':'faltam '+(S.pkSess-S.pkUsed)}</span></div><div class="pk-bar"><i style="width:${S.pkUsed/S.pkSess*100}%"></i></div>
      ${S.pkUsed?`<div style="display:flex;justify-content:space-between;margin-top:12px;font-size:12px;color:#6b7280"><span>${dd(now)} · Mão e pé</span><span style="color:var(--vinho);font-weight:600">Desfazer</span></div>`:''}
      <button class="pk-use${hint(!S.pkUsed)}" data-a="j4-use">Usar 1 sessão</button></div>` : '';
  return `<div class="app">${darkHead('FICHA DA CLIENTE','Juliana Reis',`<span class="back" style="margin:0" aria-hidden="true">${ic('edit','#fff',17)}</span>`)}
    <div class="panel"><div class="scroll" style="padding:16px">
      <div class="fic-card"><div class="fic-top"><span class="fic-av">${ic('user','#FF5B8E',24)}</span><div><div style="font-size:18px;font-weight:700;color:#1f2937">Juliana Reis</div><div style="font-size:14px;color:#6b7280;display:flex;gap:4px;align-items:center">${ic('phone','#9ca3af',12)} (11) 95555-0101</div></div></div>
        <div class="fic-stats"><div><small>Atendimentos</small><b>6</b></div><div><small>Já gastou</small><b>${brl(33000)}</b></div><div><small>Faltas</small><b>0</b></div></div></div>
      <div class="pk-head"><span style="display:flex;gap:6px;align-items:center">${ic('pkg','#FF5B8E',16)}<b>Pacotes</b></span><button class="pk-new${hint(!S.pkCreated)}" data-a="j4-newpk">+ Novo pacote</button></div>
      ${pk}
      <div style="font-weight:700;color:#1f2937;margin:20px 4px 8px">Histórico de atendimentos</div>
      <div class="hist"><div><span>Mão e pé<small>${dd(now)} · 09:00</small></span><b>${brl(5500)}</b></div><div><span>Mão e pé<small>${dd(addDays(now,-30))} · 09:00</small></span><b>${brl(5500)}</b></div><div><span>Design de sobrancelha<small>${dd(addDays(now,-45))} · 10:00</small></span><b>${brl(4000)}</b></div></div>
    </div></div>${overlays()}</div>`;
}
function pkFormScreen(){
  const ok = S.pkName && S.pkSess && (!S.pkPaid || S.pkMethod);
  const chips=(k,vals,lab,hintV)=>`<div class="chips">${vals.map(v=>`<button class="chip${hint(S[k]==null&&v===hintV)}" aria-pressed="${S[k]===v}" data-a="j4-f" data-k="${k}" data-v="${v}">${lab(v)}</button>`).join('')}</div>`;
  return `<div class="app">${darkHead('','Novo pacote','', 'j4-backficha')}
    <div class="panel"><div class="scroll"><div class="fbody">
      <div class="fcard"><div class="flabel">Nome do pacote</div>${chips('pkName',['Mão e pé','Depilação a laser'],v=>v,'Mão e pé')}<p class="a-body" style="margin:8px 0 0">No app você digita. Ex.: depilação a laser</p></div>
      <div class="fcard"><div class="flabel">Quantas sessões?</div>${chips('pkSess',[4,5,10],v=>v,4)}</div>
      <div class="fcard"><div class="flabel">Quanto ela pagou? (opcional)</div>${chips('pkPaid',[19000,20000],v=>brl(v),20000)}<p class="a-body" style="margin:8px 0 0">Entra no Caixa hoje.</p></div>
      ${S.pkPaid?`<div class="fcard"><div class="flabel">Forma de pagamento</div>${chips('pkMethod',['Cartão','Pix','Dinheiro'],v=>v,'Pix')}</div>`:''}
    </div></div><div class="ffoot"><button class="cancel" data-a="j4-backficha">Cancelar</button><button class="create${hint(ok)}" data-a="j4-createpk">Criar pacote</button></div></div>${overlays()}</div>`;
}
/* J5 */
function caixaScreen(){

  const items=[
    {d:'Juliana Reis · Mão e pé',sub:'Atendimento · Pix',v:5500},
    {d:'Paula Souza · Escova',sub:'Atendimento · Cartão',v:6000},
    {d:'Pacote: Mão e pé · Juliana',sub:'Entrada manual · Pix',v:20000},
  ];
  if(S.pastSaved) items.unshift({d:'Bianca Lima · Corte feminino',sub:'Atendimento · Não informado',v:9000,isNew:true,pend:true});
  if(S.outSaved) items.unshift({d:S.outDesc,sub:'Saída manual',v:S.outVal,out:true,isNew:true});
  const inC=items.filter(i=>!i.out).reduce((a,b)=>a+b.v,0), outC=items.filter(i=>i.out).reduce((a,b)=>a+b.v,0);
  return `<div class="app"><div class="cx-head"><button class="back" data-a="noop" aria-label="Voltar">${ic('back','#213745',22)}</button><h4>Fluxo de caixa</h4></div>
    <div class="scroll" style="padding:0 16px 16px">
      <div class="cx-sel"><span>Visualizar: <b>Dia</b></span>${ic('cd','#6F6A6D',18)}</div>
      <div class="cx-nav"><span class="i">${ic('cl','#6F6A6D',20)}</span><span>Hoje, ${dd(now)}</span><span class="i">${ic('cr','#6F6A6D',20)}</span></div>
      <div class="bal${hint(S.step===0)}"><div class="a-eyebrow">Saldo do dia</div><div class="v">${brl(inC-outC)}</div><div class="blocks"><div><small>Entradas</small><b>${brl(inC)}</b></div><div><small>Saídas</small><b>${brl(outC)}</b></div></div></div>
      <div class="cx-chips" role="group" aria-label="Filtrar por forma de pagamento">${['Todas','Cartão','Pix','Dinheiro'].map((t,i)=>`<button class="cx-chip" aria-pressed="${i===0}" data-a="noop">${t}</button>`).join('')}</div>
      <div class="cx-day">Hoje · saldo ${brl(inC-outC)}</div>
      ${items.map(i=>`<div class="cx-item${i.isNew?' new':''}"><div style="flex:1;min-width:0;padding-right:8px"><b style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(i.d)}</b><small>${i.sub}</small></div><span class="${i.out?'cx-out':'cx-in'}">${i.out?'−':'+'} ${brl(i.v)}</span></div>`).join('')}
    </div>
    <div class="cx-foot"><button class="in" data-a="noop">+ Entrada</button><button class="out${hint(S.step===2&&!S.outSaved)}" data-a="j5-out">− Saída</button></div>${overlays()}</div>`;
}
function outSheet(){
  const ok=S.outDesc&&S.outVal;
  return sheetWrap('Nova saída', `<div class="flabel">O que saiu</div><div class="chips">${['Compra de material','Conta de luz'].map(d=>`<button class="chip${hint(!S.outDesc&&d==='Compra de material')}" aria-pressed="${S.outDesc===d}" data-a="j5-f" data-k="outDesc" data-v="${d}">${d}</button>`).join('')}</div>
    <div class="flabel" style="margin-top:14px">Valor</div><div class="chips">${[4500,12000].map(v=>`<button class="chip${hint(S.outDesc&&!S.outVal&&v===4500)}" aria-pressed="${S.outVal===v}" data-a="j5-f" data-k="outVal" data-v="${v}">${brl(v)}</button>`).join('')}</div>
    <p class="a-body" style="margin:10px 0 0">No app você digita a descrição e o valor.</p><button class="hbtn${hint(ok)}" data-a="j5-save" ${ok?'':'disabled style="opacity:.5"'}>Salvar saída</button>`);
}

/* ================= telas da cliente ================= */
function chatShell(name, msgs, salon){
  return `<div class="app" style="background:#F4EEE9"><div class="chat-head" style="padding-top:16px"><span class="avatar">${salon?'<b style="color:#90496A;font-size:13px">SA</b>':ic('msg','#90496A',16)}</span><div>${name}<small>${salon?'conversa de exemplo':'número do Agenda Bela · exemplo'}</small></div></div>
    <div class="chat scroll" id="chatScroll">${msgs}</div><div style="padding:8px 10px;background:#F4EEE9"><div style="background:#fff;border-radius:999px;padding:10px 14px;color:#A39CA0;font-size:13px">Mensagem</div></div></div>`;
}
function clientChat(){
  if(S.j==='j1'){
    const label=joinNames(S.svcs.map(id=>svc(id).name));
    let m=`<div class="bubble">${confirmMsg('Marina',S.date,S.time,label)}<span class="meta">agora</span></div>`;
    if(S.dayOf){
      m+=`<div style="text-align:center;font-size:11px;color:#6F6A6D;margin:6px 0">${DOWL[S.date.getDay()].toUpperCase()}, ${dd(S.date)} · 07:00</div><div class="bubble">${reminderMsg('Marina',S.date,S.time,label)}<span class="meta">07:00</span></div>`;
      m+= S.confirmed ? `<div class="bubble out">Confirmar<span class="meta">07:42</span></div>`
        : `<div class="qr-btns"><button class="hint" data-a="j1-confirm">Confirmar</button><button data-a="j1-other">Remarcar</button><button data-a="j1-other">Cancelar</button></div>`;
    }
    return chatShell('Agenda Bela', m);
  }
  if(S.j==='j2'){
    let m=`<div class="bubble from-salon">Novidade por aqui! Agora dá pra marcar seu horário comigo direto pelo link, é rapidinho:\n<button class="hlink${hint(S.client==='chat'&&!S.bkTime)}" style="margin:0;min-height:44px;text-decoration:underline" data-a="j2-openlink">studio-ana · Agendamento online</button><span class="meta">agora</span></div>`;
    return chatShell(SALON, m, true);
  }
  return '';
}
function idleClient(){ return `<div class="app" style="background:#F4EEE9;align-items:center;justify-content:center;text-align:center;padding:24px"><div>${ic('msg','#C695A8',40,1.5)}<p class="a-body" style="margin-top:10px;font-size:14px;line-height:20px">Aqui aparece o que a Marina recebe.<br>Ela é cliente de exemplo.</p></div></div>`; }
function qrGrid(){ let s=''; for(let r=0;r<15;r++)for(let c=0;c<15;c++){const f=(r<4&&c<4)||(r<4&&c>10)||(r>10&&c<4); const on=f? !((r===1||r===2)&&(c===1||c===2||c===12||c===13)) && !((r===12||r===13)&&(c===1||c===2)) : ((r*5+c*7+r*c)%3===0); s+=`<i class="${on?'':'o'}"></i>`;} return s; }
function bookingScreen(){
  const st=S.client;
  const head=`<div class="urlbar">${ic('lock','#555',12)}<span>agendabela · studio-ana</span></div><div class="bk-head"><span class="avatar" style="background:#FFE3CC"><b style="color:#90496A;font-size:13px">SA</b></span><div><b>${SALON}</b><small>Agendamento online</small></div></div>`;
  const prog=n=>`<div class="bk-prog">${[1,2,3].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')}</div>`;
  const dep=S.depVal||2000; let body='';
  if(st==='bk-date'){
    const days=[];for(let i=1;i<=9;i++){const d=addDays(now,i); if(d.getDay()!==0) days.push(d);}
    body=prog(1)+`<h1 class="bk-h1">Escolha a data</h1><p class="bk-p">Escolha o dia pra marcar com a equipe do ${SALON}.</p><div class="daychips">${days.slice(0,8).map((d,i)=>`<button class="daychip${hint(i===1)}" data-a="bk-date" data-v="${d.toISOString()}"><small>${DOW[d.getDay()]}</small><b>${d.getDate()}</b></button>`).join('')}</div><p class="bk-p" style="font-size:13px;margin-top:10px">No link de verdade, aqui é um calendário do mês.</p>`;
  } else if(st==='bk-svc'){
    body=prog(2)+`<h1 class="bk-h1">Escolha o serviço</h1><p class="bk-p">Escolha um ou mais serviços</p>`+SERVICES.slice(0,3).map((s,i)=>`${s.id==='s1'?`<button class="bk-card${hint(i===0)}" data-a="bk-svc" data-v="${s.id}">`:`<button class="bk-card" aria-disabled="true" tabindex="-1" data-a="noop" data-v="${s.id}">`/* [prod] só a Escova (com sinal) é tocável: o tour nunca pula o pagamento; tocar nos outros mostra o aviso padrão do teste */}<span class="bk-ic">${ic('scissors','#FF5B8E',20)}</span><span><b>${s.name}</b><small>${brl(s.price)} · ${dur(s.min)}</small>${s.id==='s1'?`<br><span class="dep-badge">Sinal de ${brl(dep)}</span>`:''}</span></button>`).join('');
  } else if(st==='bk-form'){
    const s=svc(S.bkSvc);
    body=prog(3)+`<h1 class="bk-h1">Escolha o horário</h1><p class="bk-p">Selecione o melhor horário para você</p><p class="bk-p" style="margin-top:-8px;font-size:14px">${DOWL[S.bkDate.getDay()]}, ${dd(S.bkDate)} · ${s.name}</p><div class="slots">${['09:00','10:00','11:00','14:00','15:30','17:00'].map(t=>`<button class="slot${hint(!S.bkTime&&t==='10:00')}" aria-pressed="${S.bkTime===t}" data-a="bk-time" data-v="${t}">${t}</button>`).join('')}</div>
      <div style="margin-top:16px"><div class="flabel">Seu Nome *</div><div class="field locked">Marina Souza ${ic('lock','#90496A',14)}</div><div class="flabel" style="margin-top:12px">Telefone *</div><div class="field locked">(11) 91234-5678 ${ic('lock','#90496A',14)}</div><p class="bk-p" style="font-size:13px;margin-top:8px">Preenchido com a cliente de exemplo.</p></div>
      <button class="bk-cta${hint(!!S.bkTime)}" data-a="bk-confirm" ${S.bkTime?'':'disabled style="opacity:.5"'}>${S.bkSvc==='s1'?'Pagamento do sinal':'Confirmar Agendamento'}</button>`;
  } else if(st==='bk-pay'){
    const s=svc(S.bkSvc);
    body=`<div style="text-align:center;padding-top:4px"><h1 class="bk-h1" style="font-size:24px">Pague o sinal para confirmar</h1><p class="bk-p">Seu horário está reservado enquanto o tempo corre.</p></div>
      <div class="pix-box"><div class="pix-top"><div><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#71717a">Sinal</div><div style="font-size:24px;font-weight:600;color:var(--petroleo)">${brl(dep)}</div></div><div class="pix-timer" role="timer" aria-label="Tempo para pagar: 14:52"><small>Pague em até</small><b>14:52</b></div></div>
      <button class="sim-pay hint" data-a="bk-pay">Simular: Marina pagou no app do banco</button>
      <div class="pix-qr" aria-label="QR Code do PIX do sinal (exemplo)">${qrGrid()}</div>
      <div style="font-size:14px;font-weight:500;color:var(--petroleo);margin-bottom:6px">PIX copia e cola</div><div class="pix-code">00020126580014br.gov.bcb.pix (código de exemplo, não é um Pix de verdade)</div>
      <button class="bk-cta" style="background:var(--rosa)" data-a="noop">Copiar código PIX</button>
      <p class="bk-p" style="font-size:13px;text-align:center;margin:10px 0">Aguardando o pagamento…</p>
      <div class="bk-sum"><b>${SALON}</b><br>${s.name} com ${PRO}<br>${DOWL[S.bkDate.getDay()]}, ${dd(S.bkDate)} às ${S.bkTime}</div>
      <p class="bk-p" style="font-size:12px;margin:10px 0 0">O restante do valor do serviço é pago no salão. Se o PIX não for pago até o fim do tempo, o horário é liberado.</p></div>`;
  } else {
    const s=svc(S.bkSvc);
    body=`<div class="bk-done"><div class="bk-ok">${ic('check','#16a34a',40,2.5)}</div><h1 class="bk-h1" style="font-size:26px">Pronto, Marina!<br>Seu horário está marcado.</h1></div>
      <div style="border:1px solid #e4e4e7;border-radius:14px;padding:16px;margin-top:12px"><div class="bk-sum"><b>${SALON}</b><br>${s.name} com ${PRO}<br>${DOWL[S.bkDate.getDay()]}, ${dd(S.bkDate)} às ${S.bkTime}</div>
      <div style="display:flex;gap:10px;margin-top:14px;font-size:15px;color:var(--petroleo)">${ic('msg','#71717a',20)}<span>Sinal pago. A confirmação chega no seu <b>WhatsApp</b> em instantes.</span></div>
      <div class="bk-wa">Falar com o salão no WhatsApp</div><div style="text-align:center;margin-top:12px;color:var(--vinho);font-weight:600">Marcar outro horário</div></div>`;
  }
  return `<div class="browser">${head}<div class="bk-body">${body}</div></div>`;
}

/* ================= a Bela fala (tour) ================= */
function coachText(){
  const j=S.j, st=S.step, oc=seesOwner(), cc=seesClient();
  const goClient='Toca em <b>Celular da Marina</b> pra ver.', goOwner='Toca em <b>Seu celular</b> pra ver.';
  if(j==='j1'){
    if(st===0) return ['Vamos marcar a Marina? Toca em <b>Marcar um horário</b>.'];
    if(st===1) return [!S.svcs.length?'Escolhe o serviço. A Marina já está preenchida, ela é de exemplo.':'Ela vai fazer mais de uma coisa? Toca em <b>+ Adicionar serviço</b> e põe <b>Mão e pé</b>. Eu somo o tempo e o valor.'];
    if(st===2) return [!S.time?'Agora o horário. Eu só mostro o que está livre.':'Tudo certo. Toca em <b>Criar</b>.'];
    if(st===3) return [cc?'Essa mensagem eu mandei sozinha, direto pro WhatsApp da Marina, no instante em que você criou.':'Prontinho, está na agenda. '+goClient, cc?{label:'Avançar para o dia do atendimento', a:'j1-dayof'}:null];
    if(st===4){
      if(!S.confirmed) return [cc?'É o dia. Às 7h eu lembrei a Marina, e às 7h30 te mandei o bom-dia. Toca em <b>Confirmar</b>, como se fosse ela.':'É o dia. Às 7h30 te mandei o bom-dia com a agenda. Agora '+goClient.toLowerCase()];
      return [oc?'Ela confirmou e eu te avisei no mesmo minuto. Agora é só atender tranquila.':'Ela confirmou. '+goOwner, oc?{label:'Concluir', a:'finish'}:null];
    }
  }
  if(j==='j2'){
    if(st===0) return [!S.depOn?'Quer garantir o horário? Liga o <b>Exigir sinal</b> na escova.':!S.depVal?'Escolhe o valor do sinal. Eu já te mostro quanto entra no seu saldo.':'Agora toca em <b>Salvar</b>.'];
    if(st===1) return ['Agora toca em <b>Mandar meu link</b>. A mensagem já vai pronta.'];
    if(st===2) return [cc?(S.client==='chat'?'A Marina recebeu seu link. Toca nele, como se fosse ela.':'Ela escolhe <b>dia, serviço e horário</b>, sozinha. Vê o sinal ali na escova?'):'Link enviado. '+goClient];
    if(st===3) return [cc?'Ela paga o sinal no app do banco. Toca em <b>Simular</b> pra fazer de conta que ela pagou.':goClient];
    if(st===4) return [oc?(S.owner==='conta'?'Olha o sinal da Marina, já sem as taxas. Você saca pra sua chave Pix quando quiser.':'Chegaram dois avisos. Toca no do <b>sinal</b>.'):'Ela pagou. '+goOwner, oc&&S.owner==='conta'?{label:'Concluir', a:'finish'}:null];
  }
  if(j==='j3'){
    if(st===0) return ['De manhã eu lembrei suas clientes e te conto ali em cima. Vê o <b>Percebi</b>? A tarde está livre no app. Toca em <b>Preparar mensagem</b>.'];
    if(st===1) return [S.sheet?'Deixei o texto pronto. Toca em <b>Pôr no meu status</b>.':'Combinado. Agora toca no <b>sino</b>: lá fica guardado tudo o que eu fiz.'];
    if(st===2) return ['Aqui fica tudo dos últimos 30 dias: quem confirmou, quem eu lembrei, quem marcou e quem pagou.', {label:'Concluir', a:'finish'}];
  }
  if(j==='j4'){
    if(st===0) return ['A Juliana já foi atendida. Toca em <b>Veio</b>.'];
    if(st===1) return ['A Camila não apareceu. Toca em <b>Não veio</b>. Eu anoto a falta na ficha dela.'];
    if(st===2) return ['A Juliana vem todo mês. Que tal vender um pacote pra ela?', {label:'Abrir a ficha da Juliana', a:'j4-ficha'}];
    if(st===3) return [S.owner==='pkform'?'Escolhe o nome, as sessões e quanto ela pagou. Depois, <b>Criar pacote</b>.':'Toca em <b>+ Novo pacote</b>.'];
    if(st===4) return [S.pkUsed?'Uma sessão usada, eu conto o resto.':'Pacote criado e o valor já entrou no caixa. Toca em <b>Usar 1 sessão</b> pra marcar a de hoje.', S.pkUsed?{label:'Concluir', a:'finish'}:null];
  }
  if(j==='j5'){
    if(st===0) return ['Esse é o saldo do dia. Os atendimentos feitos entraram sozinhos, e o pacote da Juliana também.', {label:'Entendi', a:'j5-next'}];
    if(st===1){
      if(S.owner==='caixa') return ['Atendeu alguém e esqueceu de anotar? Dá pra registrar depois.', {label:'Registrar atendimento que já aconteceu', a:'j5-past'}];
      return [!S.past?'Liga o <b>Esse atendimento já aconteceu</b>.':!S.time?'Escolhe o horário em que você atendeu. A cliente não recebe mensagem.':'Toca em <b>Criar</b>.'];
    }
    if(st===2) return [S.outSaved?'Saída lançada. O saldo já mudou.':'Comprou material? Toca em <b>− Saída</b>.', S.outSaved?{label:'Concluir', a:'finish'}:null];
  }
  return [''];
}

/* ================= render ================= */
function jcards(){ return ORDER.map((k,i)=>`<li><button class="jcard${completed.has(k)?' done':''}${i===0&&!completed.has(k)?' first':''}" data-open="${k}">${i===0&&!completed.has(k)?'<span class="tag">Comece por aqui</span>':''}<b>${J[k].title}</b><span>${J[k].sub}</span>${completed.has(k)?'<span class="sr">Concluída</span>':''}</button></li>`).join(''); }
function renderMenuLists(){ $('#jlistMobile').innerHTML=jcards(); $('#countMobile').textContent=completed.size+' de 5'; }
function qrHtml(){ return `<div class="qrbox"><img class="qr-img" src="${QR_SRC}" alt="QR code para abrir esta página no celular" width="84" height="84"><div><b style="color:var(--petroleo)">Abra no celular</b> para a experiência completa.</div></div>`; }
const belaRow = inner => `<div class="bela-row"><span class="bela-av" aria-hidden="true">A</span><div class="bela-say"><div class="bela-name">Bela</div>${inner}</div></div>`;
function render(){
  sim.classList.toggle('menu-mode', !S.j);
  sim.classList.toggle('single', !!S.j && !J[S.j].client);
  sim.classList.toggle('show-client', !!S.j && J[S.j].client && S.tab==='client' && !isDesk());
  if(!S.j){
    coach.innerHTML=`<div class="menu-panel">${belaRow('<p class="instr" style="margin:0">Oi, eu sou a Bela, a secretária do seu salão. Escolhe por onde começar que eu te mostro.</p>')}
      <div class="count" style="margin-top:14px">${completed.size} de 5</div><h3>Por onde você quer começar?</h3><p class="a-body" style="font-size:14px;line-height:20px;margin:2px 0 0">Pode fazer em qualquer ordem e sair a qualquer hora.</p>
      <ul class="jlist">${jcards()}</ul>${completed.size>=3?'<p style="margin:14px 0 0;color:var(--petroleo);font-weight:600">Você já viu o essencial. Falta só colocar as suas clientes.</p>':''}</div>${qrHtml()}`;
  } else {
    const [txt,act]=coachText(), jd=J[S.j];
    coach.innerHTML=`<div style="display:flex;align-items:center;gap:8px"><div class="jt" style="flex:1">${jd.title} · passo ${S.step+1} de ${jd.steps.length}</div><button class="jbtn" data-a="menu">Jornadas</button></div>
      <div style="margin-top:8px">${belaRow(`<p class="instr" style="margin:0">${txt}</p>`)}</div>
      ${act?`<div class="act"><button class="btn btn-primary" data-a="${act.a}">${act.label}</button></div>`:''}
      <div class="dots" aria-hidden="true">${jd.steps.map((_,i)=>`<i class="${i<=S.step?'on':''}"></i>`).join('')}</div>
      <ol class="steplist">${jd.steps.map((t,i)=>`<li class="${i===S.step?'cur':i<S.step?'past':''}">${t}</li>`).join('')}</ol>${qrHtml()}`;
  }
  const tO=$('#tabOwner'), tC=$('#tabClient');
  tO.setAttribute('aria-selected',S.tab==='owner'); tC.setAttribute('aria-selected',S.tab==='client');
  tO.innerHTML='Seu celular'+(S.ownerUnread&&S.tab!=='owner'?`<span class="badge">${S.ownerUnread} ${S.ownerUnread===1?'aviso':'avisos'}</span>`:'');
  tC.innerHTML='Celular da Marina'+(S.unread&&S.tab!=='client'?`<span class="badge">${S.unread} nova</span>`:'');
  $('#clientLabel').innerHTML='Celular da Marina';
  const o=S.owner;
  ownerEl.innerHTML = o==='home'?homeScreen(): o==='form'?formScreen(): o==='svcform'?svcFormScreen(): o==='conta'?contaScreen(): o==='novidades'?novidadesScreen(): o==='ficha'?fichaScreen(): o==='pkform'?pkFormScreen(): o==='caixa'?caixaScreen(): '';
  const c=S.client;
  clientEl.innerHTML = c==='idle'?idleClient(): c==='chat'?clientChat(): bookingScreen();
  const cs=$('#chatScroll'); if(cs) cs.scrollTop=cs.scrollHeight;
  syncSteps();   /* [prod] toda ação termina em render(): é aqui que o avanço do passo é medido */
}
function setTab(t){ $('#toast').classList.remove('show'); S.tab=t; if(t==='client'){S.unread=0;S.seenClient=true;} else S.ownerUnread=0; render(); }
function notifyOwner(p){ S.pushes.unshift(p); if(!isDesk()&&S.tab!=='owner') S.ownerUnread++; }
function notifyClient(){ if(!isDesk()&&S.tab!=='client') S.unread=1; }
let toastT; function phoneToast(m){ S.toast=m; render(); clearTimeout(toastT); toastT=later(()=>{S.toast=null;render();},2600); }

/* ================= abrir / sair / concluir ================= */
/* [prod] simulator_start conta 1 vez por visita; as outras jornadas medem por journey_start/complete */
let simStarted=false;
function trackSimStart(j){ if(simStarted) return; simStarted=true; track({event:'simulator_start', journey_number:j?JN(j):null}); }
function openSim(j, entry, hash){
  document.body.classList.add('sim-open');
  /* [prod] no celular empilha uma entrada para o voltar fechar; não empilha de novo se já estamos nela (avançar do navegador) */
  if(!isDesk() && !(history.state&&history.state.sim)) history.pushState({sim:1},'',hash||'#experimente');
  trackSimStart(j);   /* [prod] antes do journey_start */
  startJourney(j, entry);
  if(isDesk()) $('#experimente').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  later(()=>{const f=sim.querySelector('.sair'); f&&f.focus({preventScroll:true});},50);
}
/* [prod] medição por passo: journey_step ao concluir cada passo, journey_exit ao sair sem concluir */
let run=null;   // {j, entry, done, at, finished}: a jornada em andamento
function beginRun(j, entry){ run = j ? {j, entry, done:0, at:Date.now(), finished:false} : null; }
/* reason: sair | voltar | menu | trocar_jornada | loja | pagina_fechada */
function endRun(reason){
  if(run && !run.finished){
    const total=J[run.j].steps.length, cur=S.j===run.j ? S.step : run.done;   /* o passo em que ela estava, mesmo se voltou atrás */
    const last=Math.min(cur+1,total);
    track({event:'journey_exit', journey_number:JN(run.j), last_step:last, last_step_name:STEP_NAMES[run.j][last-1], step_total:total, exit_reason:reason, ...(run.entry&&{entry:run.entry})});
  }
  run=null;
}
function syncSteps(upto){
  if(!run || run.j!==S.j || run.finished) return;
  const total=J[run.j].steps.length, target=Math.min(upto==null?S.step:upto, total);
  const t=Date.now(), first=run.done+1;
  while(run.done<target){   /* só avança: re-render ou passo desfeito não repetem evento */
    run.done++;
    /* pulou passos (ex.: J3 tocando no sino antes de divulgar): os do meio saem com skipped e sem tempo */
    const skipped=run.done!==target;
    track({event:'journey_step', journey_number:JN(run.j), step:run.done, step_name:STEP_NAMES[run.j][run.done-1], step_total:total, duration_ms:skipped?0:Math.round(t-run.at), ...(skipped&&{skipped:true}), ...(run.entry&&{entry:run.entry})});
  }
  if(run.done>=first) run.at=t;
}
function startJourney(j, entry, reason){
  endRun(reason || (j?'trocar_jornada':'menu')); beginRun(j, entry);
  $('#doneOv').innerHTML=''; S=fresh(j);
  if(entry!=='deep_link') clearDeepHash();   /* [prod] qualquer outra entrada substitui o link direto na URL */
  if(j){ track({event:'journey_start', journey_number:JN(j), ...(entry&&{entry})});
    if(j==='j2'){ S.owner='svcform'; }
    if(j==='j3'){ S.homeMode='j3'; }
    if(j==='j4'){ S.homeMode='j4'; }
    if(j==='j5'){ S.owner='caixa'; }
  }
  render();
}
let exitReason=null;   /* [prod] Sair/Esc no celular passam pelo history.back: o popstate herda o motivo */
function closeSim(reason){ clearDeepHash(); document.body.classList.remove('sim-open'); if(!isDesk()){endRun(reason||'sair'); S=fresh(null);render();} $('#doneOv').innerHTML=''; updateBar(); }
function finish(){
  $('#toast').classList.remove('show');
  const j=S.j, jd=J[j]; syncSteps(jd.steps.length); if(run) run.finished=true;   /* [prod] último passo concluído */
  completed.add(j); renderMenuLists(); updateBar();
  track({event:'journey_complete', journey_number:JN(j), journeys_completed:completed.size});
  $('#doneOv').innerHTML=`<div class="done-ov" role="dialog" aria-modal="true" aria-labelledby="doneT"><div class="done-card">
    ${belaRow(`<h3 id="doneT" style="margin-top:2px">${jd.done.title}</h3>`)}<p>${jd.done.msg}</p>
    <div class="storetile" style="margin:0 0 12px"><img class="appicon" src="${ASSET.icon}" alt="" width="44" height="44"><div><b>Agenda Bela</b><small>${completed.size>=3?'Você já viu o essencial. ':''}iPhone e Android · 7 dias grátis</small></div></div>
    <a class="btn btn-primary btn-block" href="${storeHref()}" data-store="conclusao" data-dl>Baixar e começar meus 7 dias grátis</a>
    <div class="stores-row small">${storeBadges()}</div>
    <button class="next-link" data-a="${jd.done.next?'next':'menu'}" data-v="${jd.done.next||''}">${jd.done.next?'Ver a próxima jornada →':'Ver todas as jornadas →'}</button></div></div>`;
  later(()=>{const b=$('#doneOv .btn'); b&&b.focus({preventScroll:true});},30);
}

/* ================= ações ================= */
const A={
  noop(){ toast('Neste teste, este toque não faz nada. Siga o que a Bela indicou em cima.'); },
  exit(){ if(isDesk()) startJourney(null,undefined,'sair'); else if(history.state&&history.state.sim){ exitReason='sair'; history.back(); } else closeSim('sair'); },
  menu(){ startJourney(null); }, next(el){ startJourney(el.dataset.v); }, finish(){ finish(); }, tab(el){ setTab(el.dataset.v); },
  'close-sheet'(el,ev){ if(el.dataset.self && ev.target!==el) return; S.sheet=null; render(); },
  'push-x'(el,ev){ ev.stopPropagation(); S.pushes.splice(Number(el.dataset.i),1); render(); },
  'alert-ok'(){ const cb=S.alert&&S.alert.ok; S.alert=null; if(cb) cb(); render(); },
  /* J1 */
  'j1-open'(){ if(!S.j) startJourney('j1'); if(S.j!=='j1') return; S.owner='form'; S.step=1; render(); },
  'open-svc'(el){ S.addMode = el.dataset.v==='add'; S.sheet=svcSheet; S.err=null; render(); },
  'pick-svc'(el){ const id=el.dataset.v; if(S.addMode) S.svcs.push(id); else S.svcs=[id]; S.sheet=null; S.time=null; if(S.j==='j1'&&S.svcs.length>=2) S.step=2; render(); },
  'rm-svc'(el){ S.svcs=S.svcs.filter(x=>x!==el.dataset.v); S.time=null; render(); },
  'open-date'(){ S.sheet=dateSheet; render(); },
  'pick-date'(el){ S.date=new Date(el.dataset.v); S.sheet=null; render(); },
  slot(el){ if(!S.svcs.length) return; S.time=el.dataset.v; S.err=null; if(S.j==='j1'&&S.step<2) S.step=2; render(); },
  'toggle-past'(){ S.past=!S.past; S.time=null; render(); },
  'form-cancel'(){ if(S.j==='j5'){ S.owner='caixa'; S.past=false; render(); return; } S.owner='home'; S.step=0; S.svcs=[]; S.time=null; render(); },
  'form-save'(){
    if(!S.svcs.length){ S.err='svc'; render(); return; } if(!S.time){ S.err='time'; render(); return; }
    if(S.j==='j5'){
      if(!S.past){ toast('Neste teste, liga primeiro o "Esse atendimento já aconteceu".'); return; }
      S.alert={t:'Atendimento registrado', b:'Já está no seu relatório. A cliente não recebe mensagem.', ok:()=>{ S.owner='caixa'; S.pastSaved=true; S.step=2; }}; render(); return;
    }
    if(S.past){ S.alert={t:'Atendimento registrado', b:'Já está no seu relatório. A cliente não recebe mensagem.', ok:()=>{ S.owner='home'; S.past=false; S.svcs=[]; S.time=null; }}; render(); return; }
    S.alert={t:'Marcado!', b:'Vou mandar a confirmação no WhatsApp da Marina agora.', ok:()=>{ S.owner='home'; S.homeMode='booked'; S.client='chat'; S.step=3; notifyClient(); }}; render();
  },
  'j1-dayof'(){ S.dayOf=true; S.step=4; S.homeMode='dayof'; S.owner='home';
    S.pushes=[]; notifyClient(); render();
    later(()=>{ if(S.j!=='j1'||!S.dayOf) return; S.pushes.push({t:'Bom dia, Ana! Hoje você tem 1 horário', b:`Marina às ${hBR(S.time)}. Já lembrei ela do horário.`, time:'07:30'}); if(!isDesk()&&S.tab!=='owner') S.ownerUnread++; render(); }, 1200); },
  'j1-confirm'(){ S.confirmed=true; const label=joinNames(S.svcs.map(id=>svc(id).name));
    notifyOwner({t:'Marina confirmou ✅', b:`${label} hoje às ${hBR(S.time)}. Pode atender tranquila.`, time:'07:42'}); render(); },
  'j1-other'(){ toast('Neste teste, só o Confirmar funciona. No app, Remarcar e Cancelar também te avisam na hora.'); },
  /* J2 */
  'j2-dep'(){ S.depOn=!S.depOn; if(!S.depOn) S.depVal=null; render(); },
  'j2-depval'(el){ S.depVal=Number(el.dataset.v); render(); },
  'j2-save-svc'(){ if(!(S.depOn&&S.depVal)){ toast('Liga o sinal e escolhe o valor.'); return; } S.depSaved=true; S.owner='home'; S.homeMode='share'; S.step=1; render(); },
  'j2-share'(){ S.sheet=shareSheet('geral'); render(); },
  'j2-send'(){ S.sheet=null; S.client='chat'; S.step=2; notifyClient(); render(); },
  'j2-openlink'(){ S.client='bk-date'; render(); },
  'bk-date'(el){ S.bkDate=new Date(el.dataset.v); S.client='bk-svc'; render(); },
  'bk-svc'(el){ S.bkSvc=el.dataset.v; S.client='bk-form'; render(); },
  'bk-time'(el){ S.bkTime=el.dataset.v; render(); },
  'bk-confirm'(){ if(!S.bkTime) return; /* [prod] o else ficou inalcançável: só a Escova (s1) é tocável */ if(S.bkSvc==='s1'){ S.client='bk-pay'; S.step=3; } else { S.client='bk-done'; S.step=4; } render(); },
  'bk-pay'(){ S.paid=true; S.client='bk-done'; S.step=4; const dep=S.depVal||2000;
    const gw=Math.min(Math.max(Math.round(dep*80/10000),50),500), pf=Math.round(dep*149/10000); S.balance=dep-gw-pf;
    const diff=Math.round((new Date(S.bkDate.toDateString())-new Date(now.toDateString()))/864e5);
    const forWhen = diff===1?`pra amanhã, às ${hBR(S.bkTime)}`:`pra ${DOWL[S.bkDate.getDay()]}, ${dd(S.bkDate)}, às ${hBR(S.bkTime)}`;
    notifyOwner({t:'Sua primeira cliente marcou sozinha 🎉', b:`Marina marcou escova ${forWhen}, pelo seu link. Você nem precisou parar o atendimento pra responder.`});
    notifyOwner({t:`Sinal de ${brl(dep)} pago 💰`, b:`Marina pagou o sinal (escova ${whenMedium(S.bkDate,S.bkTime)}). ${brl(S.balance)} já está no seu saldo.`, act:'open-conta', hint:true});
    render(); },
  'open-conta'(){ if(!S.paid) return; S.pushes=[]; S.owner='conta'; render(); },
  /* J3 */
  'j3-prep'(){ S.sheet=shareSheet('dia'); S.step=1; render(); },
  'j3-status'(){ S.sheet=null; S.percebeDone=true; phoneToast('Quando alguém marcar pelo link, te conto.'); },
  'j3-bell'(){ if(S.step<1) S.step=1; S.owner='novidades'; S.step=2; render(); },
  /* J4 */
  'j4-mark'(el){ S.jf[el.dataset.k]=el.dataset.v; if(S.jf.a!=='pending'&&S.step===0) S.step=1; if(S.jf.a!=='pending'&&S.jf.b!=='pending') S.step=2; render(); },
  'j4-ficha'(){ S.owner='ficha'; S.step=3; render(); },
  'j4-newpk'(){ if(S.pkCreated) return; S.owner='pkform'; render(); },
  'j4-backficha'(){ S.owner='ficha'; render(); },
  'j4-f'(el){ const k=el.dataset.k, v=el.dataset.v; S[k]= (k==='pkSess'||k==='pkPaid')?Number(v):v; render(); },
  'j4-createpk'(){ if(!S.pkName||!S.pkSess){ toast('Escolhe o nome e as sessões.'); return; } if(S.pkPaid&&!S.pkMethod){ toast('Escolha cartão, Pix ou dinheiro'); return; } S.pkCreated=true; S.owner='ficha'; S.step=4; render(); },
  'j4-use'(){ if(S.pkUsed<S.pkSess) S.pkUsed++; render(); },
  /* J5 */
  'j5-next'(){ S.step=1; render(); },
  'j5-past'(){ S.owner='form'; S.svcs=['s2']; S.past=false; S.time=null; render(); },
  'j5-out'(){ S.sheet=outSheet; render(); },
  'j5-f'(el){ const k=el.dataset.k; S[k]= k==='outVal'?Number(el.dataset.v):el.dataset.v; render(); },
  'j5-save'(){ if(!(S.outDesc&&S.outVal)) return; S.sheet=null; S.outSaved=true; render(); },
};
on(sim, 'click', ev=>{
  const op=ev.target.closest('[data-open]'); if(op&&sim.contains(op)){ track({event:'cta_click', cta_location:'menu_simulador'}); trackSimStart(op.dataset.open); startJourney(op.dataset.open); return; }
  const el=ev.target.closest('[data-a]'); if(!el||!sim.contains(el)) return;
  const fn=A[el.dataset.a]; if(fn){ ev.preventDefault(); fn(el,ev); }
});
on(sim, 'keydown', ev=>{ if((ev.key==='Enter'||ev.key===' ')&&ev.target.matches('.push[role="button"]')){ ev.preventDefault(); ev.target.click(); } });

/* ================= página ================= */
on(document, 'click', ev=>{
  const op=ev.target.closest('[data-open]');
  /* [prod] card do menu interno já tratado pelo #sim e removido no re-render: não é CTA da página (evita medição dupla e pushState órfão) */
  if(op&&!op.isConnected) return;
  if(op&&!sim.contains(op)){ ev.preventDefault(); track({event:'cta_click', cta_location:ctaLocation(op)}); openSim(op.dataset.open); return; }
  const go=ev.target.closest('[data-go="sim"]');
  if(go){ ev.preventDefault(); track({event:'cta_click', cta_location:ctaLocation(go)}); if(isDesk()) startJourney(null); $('#experimente').scrollIntoView(); return; }
  const st=ev.target.closest('[data-store]');
  if(st){ track(storeEvent(st)); /* [prod] no desktop os links de baixar só rolam até os selos: cta_click, não store_click */ if(st.getAttribute('href')==='#baixar'){ ev.preventDefault(); if(document.body.classList.contains('sim-open')&&!isDesk()) closeSim('loja'); $('#doneOv').innerHTML=''; $('#baixar').scrollIntoView(); } }
});
on(window, 'popstate', ()=>{ const r=exitReason||'voltar'; exitReason=null; if(document.body.classList.contains('sim-open')&&!isDesk()) closeSim(r); });
on(window, 'pagehide', ()=>endRun('pagina_fechada'));   /* [prod] fechar a aba/sair do site também é desistência */
on(document, 'keydown', e=>{ if(e.key==='Escape'){ if(S.sheet){S.sheet=null;render();} else if(document.body.classList.contains('sim-open')&&!isDesk()){ if(history.state&&history.state.sim){ exitReason='sair'; history.back(); } else closeSim('sair'); } }});   /* [prod] só volta o histórico se o simulador empilhou entrada */
let tt; function toast(m){ const t=$('#toast'); t.textContent=m; t.classList.add('show'); clearTimeout(tt); tt=later(()=>t.classList.remove('show'),3200); }
const bar=$('#bar'); let heroVisible=true;
function updateBar(){
  const show=!heroVisible&&!document.body.classList.contains('sim-open');
  bar.classList.toggle('show',show); bar.setAttribute('aria-hidden',!show); $('#barBtn').tabIndex=show?0:-1;
  if(completed.size){ $('#barTxt').innerHTML='Você já testou. Agora é com a sua agenda.'; const b=$('#barBtn'); b.textContent='Baixar o Agenda Bela'; b.removeAttribute('data-open'); b.setAttribute('data-store','barra'); b.onclick=()=>{ /* [prod] store_click sai do listener de [data-store], sem duplicar */ if(OS==='desktop') $('#baixar').scrollIntoView(); else location.href=storeHref(); }; }
}
if('IntersectionObserver' in window){ const io=new IntersectionObserver(es=>{ heroVisible=es[0].isIntersecting; updateBar(); }); io.observe($('#heroCta')); cleanups.push(()=>io.disconnect()); }
/* [prod] local do clique: data-local no HTML; cards do menu e selos pelo contexto */
function ctaLocation(el){ return el.dataset.local || (el.closest('#jlistMobile')?'menu_jornadas':el.closest('.done-card')?'conclusao':'pagina'); }
function storeEvent(el){
  const k=el.dataset.store, href=el.getAttribute('href')||storeHref();
  const store=/apps\.apple\.com/.test(href)?'app_store':/play\.google\.com/.test(href)?'google_play':null;
  const loc=/^badge-/.test(k) ? (el.closest('.done-card')?'conclusao_selo':'final_selo') : k;
  return store ? {event:'store_click', store, cta_location:loc, device_os:OS} : {event:'cta_click', cta_location:loc+'_ver_lojas'};
}
track({event:'lp_view', device_os:OS});
const ano=document.getElementById('ano'); if(ano) ano.textContent=now.getFullYear();
$('#heroBubble').innerHTML=confirmMsg('Marina',addDays(now,1),'14:00','Escova e Mão e pé')+'<span class="meta">agora</span>';
document.querySelectorAll('[data-store]').forEach(a=>{ if(!/badge/.test(a.dataset.store)) a.setAttribute('href',storeHref()); });
document.querySelectorAll('[data-stores]').forEach(el=>{ el.innerHTML=storeBadges()+(OS==='desktop'&&QR_SRC?`<span class="qr-final"><img src="${QR_SRC}" alt="QR code para abrir esta página no celular" width="96" height="96"><small>Aponte a câmera do celular</small></span>`:''); });
renderMenuLists(); render();
/* [prod] link direto por jornada (suporte e marketing). O hash só é comparado com esta lista fixa. */
const DEEP={'marcar-cliente':'j1','sinal-pix':'j2','bela':'j3','clientes':'j4','caixa':'j5'};
const deepJourney=()=>{ const h=location.hash.slice(1).toLowerCase().split(/[?&]/)[0]; return Object.prototype.hasOwnProperty.call(DEEP,h)?DEEP[h]:null; };
/* troca o hash sem recarregar e sem perder a marca {sim:1} da entrada do simulador no celular */
function clearDeepHash(){
  if(!deepJourney()) return;
  const onSim=!!(history.state&&history.state.sim);
  history.replaceState(onSim?{sim:1}:null,'',location.pathname+location.search+(onSim?'#experimente':''));
}
function openDeepLink(ev){
  const j=deepJourney(); if(!j) return;
  if(document.body.classList.contains('sim-open') && S.j===j) return;   /* já aberta: sem evento duplicado */
  const hash=location.hash;
  if(!isDesk() && !(history.state&&history.state.sim)){
    if(ev&&ev.type==='hashchange') history.replaceState({sim:1},'',location.href);   /* o navegador já criou a entrada: só marca como do simulador */
    else history.replaceState(null,'',location.pathname+location.search);          /* ao carregar: a entrada vira a página sem hash e o simulador ganha a sua */
  }
  openSim(j,'deep_link',hash);
}
on(window, 'hashchange', openDeepLink);
later(openDeepLink, 0);   /* fora do ciclo de montagem do React, antes de mexer no histórico */
let lastDesk=isDesk(); on(window, 'resize',()=>{ if(isDesk()!==lastDesk){ lastDesk=isDesk(); render(); } });   /* [prod] só re-renderiza ao trocar de layout (barra do navegador no celular dispara resize) */
return () => { endRun('pagina_fechada'); cleanups.forEach(fn => fn()); timers.forEach(clearTimeout); document.body.classList.remove('sim-open'); };
}
