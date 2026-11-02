/*
 * HTML do "Experimente o Agenda Bela" (protótipo validado, rodada final 31/10/2026).
 * Textos e estrutura iguais ao protótipo; em produção só mudaram os caminhos dos
 * assets, os atributos data-local (medição) e saiu a linha "Protótipo de desenho".
 * O comportamento vem de ./simulador.js, montado por ExperimenteRuntime.
 */
export const EXPERIMENTE_MARKUP = `<header class="top">
  <div class="wrap">
    <a class="logo" href="#topo" aria-label="Agenda Bela, início"><img class="appicon" src="/images/experimente/agenda-bela-icone.png" alt="Agenda Bela" width="36" height="36"></a>
    <a class="btn btn-primary" href="#experimente" data-go="sim" data-local="topo">Experimentar</a>
  </div>
</header>

<main id="topo">
<!-- 1. HERO -->
<section class="hero" aria-labelledby="h1">
  <div class="wrap">
    <div>
      <div class="eyebrow-l">Agenda Bela · para cabeleireiras, manicures e esteticistas</div>
      <h1 id="h1">Marque uma cliente de teste e veja o que ela recebe no <em>WhatsApp</em></h1>
      <p class="lead">Teste o app aqui, no celular, sem criar conta. Você marca, a Bela avisa e lembra a sua cliente, e você atende com tranquilidade.</p>
      <div class="cta-row">
        <button class="btn btn-primary" id="heroCta" data-open="j1" data-local="hero">Marcar minha primeira cliente</button>
        <a class="btn btn-ghost" href="#loja" data-store="hero">Já quero baixar</a>
      </div>
      <p class="micro">Sem login. Dados de exemplo. Nenhuma mensagem de verdade é enviada.</p>
      <div class="storetile"><img class="appicon" src="/images/experimente/agenda-bela-icone.png" alt="" width="56" height="56"><div><b>Agenda Bela</b><small>iPhone e Android · 7 dias grátis</small></div></div>
      <div class="avail">Disponível na App Store e no Google Play</div>
    </div>
    <div aria-hidden="true">
      <div class="mini-phone">
        <div class="mini-screen">
          <div class="chat-head"><span class="avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#90496A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg></span><div>Agenda Bela<small>mensagem de exemplo</small></div></div>
          <div class="chat hero-loop">
            <div class="typing"><i></i><i></i><i></i></div>
            <div class="bubble" id="heroBubble"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 2. DOR -->
<section aria-labelledby="h-dor">
  <div class="wrap">
    <h2 id="h-dor">Você atende com uma mão e responde WhatsApp com a outra</h2>
    <p class="lead">Quatro coisas que roubam seu dia e seu dinheiro, mesmo quando você faz tudo certo:</p>
    <ul class="pains">
      <li><b>A cliente que desiste porque demorou para ser respondida.</b> Você estava com a mão na tinta.</li>
      <li><b>Dois horários em cima do outro</b>, porque a agenda está no caderno e na cabeça.</li>
      <li><b>O bolo.</b> A cliente esqueceu e ninguém avisou.</li>
      <li><b>O fim do mês sem saber quanto entrou de verdade.</b></li>
    </ul>
    <p class="turn">Isso não é falta de capricho. É falta de uma secretária enquanto você atende.</p>
    <a class="btn btn-ghost" href="#como">Ver como a Bela resolve</a>
  </div>
</section>

<!-- 3. COMO FUNCIONA -->
<section id="como" aria-labelledby="h-como" style="background:#fff">
  <div class="wrap">
    <h2 id="h-como">Três passos. Depois a Bela trabalha por você</h2>
    <ol class="steps3">
      <li><b>Deixe o salão pronto.</b> Seus horários de trabalho e seus serviços. É o que a cliente precisa para conseguir marcar.</li>
      <li><b>Marque ou mande seu link.</b> Você marca pelo app, ou a cliente marca sozinha pelo seu link, sem baixar nada.</li>
      <li><b>A Bela avisa e lembra.</b> A cliente recebe a confirmação e, no dia, o lembrete no WhatsApp, com botões para confirmar, remarcar ou cancelar. Você recebe o aviso no celular e atende.</li>
    </ol>
    <div class="bela-intro"><span class="bela-av" aria-hidden="true">A</span><p>"Eu sou a Bela. Eu conto o que eu fiz e o que suas clientes fizeram, antes de você precisar perguntar." <span class="sig">— Bela</span></p></div>
    <button class="btn btn-primary" data-open="j1" data-local="como_funciona" style="margin-top:20px">Fazer isso agora, com dados de exemplo</button>
  </div>
</section>

<!-- 4. SIMULADOR -->
<section id="experimente" aria-labelledby="h-sim">
  <div class="wrap">
    <div class="sim-intro">
      <h2 id="h-sim">Experimente o Agenda Bela</h2>
      <p class="lead">Aqui você usa as telas do app com clientes de exemplo. Toque, marque, mude de ideia. Nada é enviado de verdade e nada fica salvo.</p>
    </div>
    <div class="sim-preview">
      <div class="bela-row" style="margin-bottom:8px"><span class="bela-av" aria-hidden="true">A</span><div class="bela-say"><div class="bela-name">Bela</div><div style="font-size:15px;color:var(--petroleo)">Escolhe por onde começar que eu te mostro.</div></div></div>
      <div class="count" id="countMobile">0 de 5</div>
      <h3>Por onde você quer começar?</h3>
      <ul class="jlist" id="jlistMobile"></ul>
    </div>
    <div class="sim menu-mode" id="sim" role="region" aria-label="Experimente o Agenda Bela: telas do app com dados de exemplo">
      <div class="sim-top">
        <span class="selo"><b>SIMULAÇÃO</b> · dados de exemplo · nada é enviado</span>
        <button class="sair" data-a="exit" aria-label="Sair do Experimente o Agenda Bela">Sair</button>
      </div>
      <div class="sim-body">
        <aside class="coach" id="coach" aria-live="polite"></aside>
        <div class="tabs" role="tablist" aria-label="Qual celular ver">
          <button role="tab" id="tabOwner" aria-selected="true" data-a="tab" data-v="owner">Seu celular</button>
          <button role="tab" id="tabClient" aria-selected="false" data-a="tab" data-v="client">Celular da Marina</button>
        </div>
        <div class="phones">
          <div class="phone owner"><div class="phone-label" id="ownerLabel">Seu celular</div><div class="frame"><div class="screen" id="ownerScreen"></div></div></div>
          <div class="phone client"><div class="phone-label" id="clientLabel">Celular da Marina</div><div class="frame"><div class="screen" id="clientScreen"></div></div></div>
        </div>
      </div>
      <div id="doneOv"></div>
    </div>
  </div>
</section>

<!-- 5. BENEFÍCIOS, cada um com o atalho para a jornada -->
<section aria-labelledby="h-ben">
  <div class="wrap">
    <h2 id="h-ben">O que muda no seu dia</h2>
    <ul class="benef">
      <li><b>Cliente marca sozinha, mesmo com a mão na tinta.</b><p>Seu link de agendamento atende por você. Chega de perder cliente por demora na resposta.</p><button class="see" data-local="beneficios" data-open="j2">Experimentar</button></li>
      <li><b>Sinal no Pix, horário garantido.</b><p>Ligue o sinal num serviço avulso e quem marca pelo seu link paga um Pix para garantir o horário. O dinheiro cai na sua Conta Agenda Bela.</p><button class="see" data-local="beneficios" data-open="j2">Experimentar</button></li>
      <li><b>Menos bolo, menos mensagem manual.</b><p>A Bela confirma e lembra suas clientes no WhatsApp, e te avisa quando elas confirmam. Você não digita nada.</p><button class="see" data-local="beneficios" data-open="j1">Experimentar</button></li>
      <li><b>Você sabe como o dia vai ser antes de abrir o salão.</b><p>Todo dia de manhã a Bela te manda o resumo da sua agenda, com quem vem e quem já confirmou.</p><button class="see" data-local="beneficios" data-open="j1">Experimentar</button></li>
      <li><b>A Bela te conta o que aconteceu.</b><p>Quem marcou, quem confirmou e o que ela mandou chega como aviso no seu celular e fica guardado nas novidades do app.</p><button class="see" data-local="beneficios" data-open="j3">Experimentar</button></li>
      <li><b>Pacote de sessões sem caderno.</b><p>Venda um pacote na ficha da cliente e marque cada sessão usada. O valor entra no caixa no dia da venda.</p><button class="see" data-local="beneficios" data-open="j4">Experimentar</button></li>
      <li><b>Você sabe quanto entrou.</b><p>O caixa fecha sozinho com os atendimentos feitos. Esqueceu de anotar um? Dá para registrar depois, sem mandar mensagem para a cliente.</p><button class="see" data-local="beneficios" data-open="j5">Experimentar</button></li>
      <li><b>Você parece maior do que é.</b><p>O link leva o nome do seu salão, e a cliente recebe confirmação certinha, sem mensagem improvisada.</p></li>
    </ul>
  </div>
</section>

<!-- 5b. AVALIAÇÕES -->
<section aria-labelledby="h-rev" style="background:var(--creme-soft)">
  <div class="wrap">
    <h2 id="h-rev">Avaliações de quem já usa</h2>
    <div class="reviews">
      <figure class="review"><blockquote>"Sou manicure e estava procurando uma forma mais prática de organizar meus horários. Está facilitando bastante minha rotina, principalmente nos dias mais corridos. Fácil de usar e bem organizado…"</blockquote><figcaption>Cintia · App Store · set/2026</figcaption></figure>
      <figure class="review"><blockquote>"Deixou minha rotina muito mais organizada e ficou bem mais fácil cuidar dos agendamentos. É simples de mexer, rápido e tem tudo bem explicado…"</blockquote><figcaption>Tatiane C. · Google Play · set/2026</figcaption></figure>
    </div>
  </div>
</section>

<!-- 6. TAMBÉM TEM -->
<section aria-labelledby="h-mais" style="background:#fff">
  <div class="wrap">
    <h2 id="h-mais">E tem mais, para quando você quiser</h2>
    <ul class="grid-mais">
      <li><b>Vários serviços num horário só</b>Escova e mão e pé na mesma marcação, com a duração somada.</li>
      <li><b>Serviços e combos</b>Monte combos de serviços e organize por ordem ou busca.</li>
      <li><b>Estoque</b>Controle os produtos do salão.</li>
      <li><b>Relatórios</b>Faturamento e serviços.</li>
      <li><b>Bloqueio de agenda</b>Folga, férias ou compromisso, em vários dias de uma vez.</li>
      <li><b>Equipe pequena</b>Profissionais e horários de cada uma, para quem trabalha com 1 ou 2 pessoas.</li>
    </ul>
  </div>
</section>

<!-- 7. PREÇO -->
<section id="preco" aria-labelledby="h-preco">
  <div class="wrap">
    <div class="price">
      <div>
        <h2 id="h-preco">7 dias grátis. Depois, R$ 59,90 por mês</h2>
        <p>Um preço só, com tudo que você viu aqui. Teste por 7 dias e decida.</p>
        <p class="small">No Google Play, o valor é R$ 59,99.</p>
        <p class="small">Cancele quando quiser.</p>
        <p class="small">No sinal, saem a tarifa do Pix e 1,49% do Agenda Bela, só sobre o valor do sinal.</p>
      </div>
      <div><a class="btn btn-primary btn-block" href="#loja" data-store="preco">Começar meus 7 dias grátis</a></div>
    </div>
  </div>
</section>

<!-- 8. FAQ -->
<section class="faq" aria-labelledby="h-faq" style="padding-top:0">
  <div class="wrap">
    <h2 id="h-faq">Perguntas que a gente sempre ouve</h2>
    <details><summary>Esse teste manda mensagem de verdade para alguém?</summary><p>Não. Tudo é de exemplo. Nada é enviado e nada fica salvo.</p></details>
    <details><summary>Preciso criar conta para testar?</summary><p>Não. Para usar com a sua agenda e as suas clientes, aí sim: baixe o app e comece os 7 dias grátis.</p></details>
    <details><summary>Minhas clientes precisam baixar o app?</summary><p>Não. Elas marcam pelo seu link, no navegador do celular. Recebem os avisos no WhatsApp.</p></details>
    <details><summary>O aviso sai do meu WhatsApp?</summary><p>Sai do número do Agenda Bela, não do seu. No fim do agendamento, a cliente ainda vê o botão "Falar com o salão no WhatsApp".</p></details>
    <details><summary>Como funciona o sinal no Pix?</summary><p>Você liga o sinal no serviço e escolhe o valor. Pelo seu link, a cliente paga um Pix para garantir o horário. Se ela não pagar a tempo, o horário é liberado. O valor entra na sua Conta Agenda Bela e você saca para a sua chave Pix. Vale para quem marca pelo seu link, em serviço avulso.</p></details>
    <details><summary>Quanto custa, e se eu não gostar?</summary><p>São 7 dias grátis. Depois, R$ 59,90 por mês. Cancele quando quiser.</p></details>
    <details><summary>Funciona no iPhone e no Android?</summary><p>Sim, nos dois. Procure por "Agendabela" nas lojas.</p></details>
    <details><summary>Serve para o meu salão?</summary><p>Foi feito para quem atende sozinha ou com 1 ou 2 pessoas: cabeleireira, manicure, esteticista, maquiadora. Salão grande, com 10 ou mais profissionais, ainda não é o foco. É melhor saber agora do que descobrir depois.</p></details>
    <button class="btn btn-primary" data-open="j1" data-local="faq" style="margin-top:20px">Marcar minha primeira cliente</button>
  </div>
</section>

<!-- 9. CTA FINAL -->
<section class="final" id="baixar" aria-labelledby="h-final" style="background:var(--creme-soft)">
  <div class="wrap">
    <img class="appicon" src="/images/experimente/agenda-bela-icone.png" alt="" width="64" height="64" style="margin-bottom:14px">
    <h2 id="h-final">Veja agora o que a sua cliente vai receber</h2>
    <p class="lead">É de exemplo, é rápido e você não precisa criar conta. Se gostar, são 7 dias grátis na sua agenda de verdade.</p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
      <button class="btn btn-primary" data-open="j1" data-local="final">Marcar minha primeira cliente</button>
      <a class="btn btn-ghost" href="#loja" data-store="final">Baixar o Agenda Bela</a>
    </div>
    <div class="stores-row" data-stores></div>
    <p class="sign">Tranquilidade para você atender.</p>
  </div>
</section>
</main>

<footer id="loja" class="ab-footer">
  <div class="wrap">
    <div class="ab-foot-row">
      <div class="ab-foot-brand">
        <img src="/brand/agenda-bela/logo-app.png" alt="Agenda Bela" width="48" height="48">
        <span>por Tudo Agenda</span>
      </div>
      <nav aria-label="Links do rodapé">
        <a href="https://tudoagenda.com.br/termos">Termos de serviço</a>
        <a href="https://tudoagenda.com.br/privacidade">Política de privacidade</a>
        <a href="mailto:contato@tudoagenda.com.br">contato@tudoagenda.com.br</a>
        <a href="https://www.instagram.com/agendabela/" target="_blank" rel="noopener noreferrer" class="ig"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/></svg>@agendabela</a>
        <a href="https://wa.me/5519936180533?text=Oi!%20Preciso%20de%20ajuda%20com%20o%20Agenda%20Bela" target="_blank" rel="noopener noreferrer">Falar com o suporte</a>
      </nav>
    </div>
    <p class="ab-foot-small">© <span id="ano"></span> Tudo Agenda. Todos os direitos reservados.</p>
    <p class="ab-foot-small" style="margin-top:4px">CODEVERSE SERVIÇOS DE TECNOLOGIA LTDA · CNPJ 59.161.274/0001-05</p>
    <p class="ab-foot-small" style="margin-top:12px">As telas do Experimente o Agenda Bela usam dados fictícios e não enviam mensagens.</p>
  </div>
</footer>

<div class="bar" id="bar" aria-hidden="true">
  <div class="txt" id="barTxt"><b>7 dias grátis</b>depois R$ 59,90/mês</div>
  <button class="btn btn-primary" id="barBtn" data-open="j1" data-local="barra" tabindex="-1">Marcar minha primeira cliente</button>
</div>
<div class="toast" id="toast" role="status"></div>
`;
