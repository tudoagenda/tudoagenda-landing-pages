import type { BlogPost, ProductBlogConfig } from "./types";

export const agendaBelaBlogConfig: ProductBlogConfig = {
  productSlug: "agendabela",
  routeSlug: "agendabela",
  name: "Agenda Bela",
  blogTitle: "Blog Agenda Bela",
  blogDescription:
    "Guias práticos para profissionais da beleza organizarem agenda, reduzirem faltas e parecerem mais profissionais sem aumentar a carga de trabalho.",
  audience: "profissionais da beleza feminina",
  basePath: "/agendabela/blog",
  landingPath: "/agendabela/automatize-seu-atendimento",
  ctaLabel: "Começar com 30 dias grátis",
  ctaHref: "/agendabela/automatize-seu-atendimento#teste-gratuitamente",
  themeEyebrow: "Agenda, clientes e rotina",
};

export const agendaBelaPosts: BlogPost[] = [
  {
    slug: "como-organizar-agenda-manicure-sem-se-perder-no-whatsapp",
    title: "Como organizar a agenda de uma manicure sem se perder no WhatsApp",
    seoTitle:
      "Como organizar a agenda de manicure sem se perder no WhatsApp",
    description:
      "Um guia prático para manicures que marcam horários pelo WhatsApp e precisam parar de depender de memória, print e caderno.",
    publishedAt: "2026-05-27",
    updatedAt: "2026-05-27",
    author: "Equipe Agenda Bela",
    category: "agenda-e-organizacao",
    tags: ["manicure", "agenda", "whatsapp", "organizacao"],
    readingMinutes: 6,
    hero: "Quando tudo passa pelo WhatsApp, a agenda vira uma conversa infinita. A cliente pergunta, você responde entre um atendimento e outro, alguém muda de horário, outra pessoa some, e no fim do dia fica difícil saber o que está realmente confirmado.",
    pain: "Perder o controle da agenda enquanto atende clientes.",
    ctaLabel: "Organizar minha agenda no Agenda Bela",
    ctaHref: agendaBelaBlogConfig.ctaHref,
    ctaPosition: "article_agenda_manicure",
    sections: [
      {
        type: "paragraph",
        content:
          "O WhatsApp é ótimo para conversar, mas péssimo para ser a única agenda de uma manicure. Ele mistura cliente nova, confirmação, remarcação, áudio, foto de referência, orçamento e conversa pessoal no mesmo lugar. Quando o movimento aumenta, o problema não é falta de esforço; é falta de uma rotina confiável.",
      },
      {
        type: "heading",
        content: "Separe conversa de compromisso",
      },
      {
        type: "paragraph",
        content:
          "A primeira mudança é tratar horário marcado como compromisso, não como mensagem. Se uma cliente pediu terça às 15h e você respondeu que sim, esse horário precisa sair do WhatsApp e entrar em uma agenda central. Enquanto ele ficar só na conversa, você depende de rolar mensagens antigas ou lembrar de cabeça.",
      },
      {
        type: "list",
        items: [
          "Anote todo horário confirmado em um único lugar.",
          "Registre nome, serviço, duração e telefone da cliente.",
          "Marque bloqueios de almoço, folga e compromissos pessoais.",
          "Revise a agenda do dia seguinte antes de encerrar o expediente.",
        ],
      },
      {
        type: "heading",
        content: "Use uma regra simples para confirmar",
      },
      {
        type: "paragraph",
        content:
          "A cliente só deve ser considerada confirmada depois de receber uma mensagem clara com dia, horário e serviço. Isso evita o famoso 'achei que era outro dia' e reduz o risco de você reservar um horário que a pessoa nem percebeu que ficou marcado.",
      },
      {
        type: "callout",
        title: "Mensagem pronta",
        content:
          "Seu horário ficou marcado para quarta-feira, às 14h, para manicure. Se precisar mudar, me avise com antecedência para eu liberar o horário para outra cliente.",
      },
      {
        type: "heading",
        content: "Pare de procurar horário disponível manualmente",
      },
      {
        type: "paragraph",
        content:
          "Um dos maiores ladrões de tempo é abrir a agenda, conferir cada buraco, responder opções para a cliente e esperar ela escolher. Quando outra pessoa chama ao mesmo tempo, você pode oferecer o mesmo horário para duas clientes sem perceber.",
      },
      {
        type: "paragraph",
        content:
          "O ideal é que seus horários disponíveis estejam organizados antes da conversa. Assim, quando a cliente perguntar, você já sabe o que pode oferecer ou envia um link para ela escolher sozinha.",
      },
      {
        type: "heading",
        content: "Quando vale sair do caderno",
      },
      {
        type: "paragraph",
        content:
          "Se você atende poucas clientes por semana, um caderno pode funcionar por um tempo. Mas quando começa a ter remarcação, encaixe, serviço com duração diferente e cliente perguntando fora do horário, o caderno deixa de ajudar e passa a esconder problema.",
      },
      {
        type: "paragraph",
        content:
          "O Agenda Bela foi feito para esse momento: sua cliente consegue agendar pelo link, você acompanha tudo pelo celular e os lembretes ajudam a reduzir esquecimento. O WhatsApp continua existindo, mas deixa de ser a sua única ferramenta de organização.",
      },
    ],
    relatedSlugs: [
      "como-criar-link-de-agendamento-para-clientes",
      "agenda-online-ou-caderno-quando-vale-mudar",
      "como-lembrar-clientes-do-horario-sem-fazer-manualmente",
    ],
  },
  {
    slug: "como-reduzir-faltas-no-salao-com-lembretes-simples",
    title: "Como reduzir faltas no salão com lembretes simples",
    seoTitle: "Como reduzir faltas no salão com lembretes simples",
    description:
      "Entenda como lembretes antes do horário ajudam a diminuir faltas, atrasos e buracos na agenda do salão.",
    publishedAt: "2026-05-27",
    updatedAt: "2026-05-27",
    author: "Equipe Agenda Bela",
    category: "faltas-e-lembretes",
    tags: ["faltas", "lembretes", "salao", "clientes"],
    readingMinutes: 5,
    hero: "Falta não é só um horário vazio. É produto comprado, tempo reservado, renda que não entrou e uma cliente que talvez nem tenha percebido o impacto.",
    pain: "Clientes esquecem o horário e deixam buracos no dia.",
    ctaLabel: "Enviar lembretes sem fazer tudo manualmente",
    ctaHref: agendaBelaBlogConfig.ctaHref,
    ctaPosition: "article_reduzir_faltas",
    sections: [
      {
        type: "paragraph",
        content:
          "A maioria das faltas não acontece porque a cliente quer prejudicar a profissional. Muitas vezes ela esquece, confunde o dia ou deixa para avisar tarde demais. Mesmo assim, quem paga a conta é você: o horário não volta, e nem sempre dá para encaixar outra pessoa em cima da hora.",
      },
      {
        type: "heading",
        content: "Lembrete bom é simples e chega na hora certa",
      },
      {
        type: "paragraph",
        content:
          "Não precisa escrever uma mensagem enorme. A cliente precisa lembrar de três coisas: serviço, data e horário. Se a mensagem chegar no dia anterior ou na manhã do atendimento, ela tem tempo para se organizar ou avisar caso precise remarcar.",
      },
      {
        type: "list",
        items: [
          "Envie confirmação quando o agendamento for criado.",
          "Envie lembrete no dia do atendimento.",
          "Use uma mensagem educada, curta e objetiva.",
          "Evite depender de lembrar manualmente cliente por cliente.",
        ],
      },
      {
        type: "heading",
        content: "Crie uma regra para remarcação",
      },
      {
        type: "paragraph",
        content:
          "Lembrete ajuda, mas regra clara ajuda mais ainda. A cliente precisa saber que, se não puder ir, deve avisar com antecedência. Isso não precisa soar duro. Pode ser uma frase gentil dizendo que assim você consegue oferecer o horário para outra cliente.",
      },
      {
        type: "callout",
        title: "Texto prático",
        content:
          "Oi! Passando para lembrar do seu horário hoje às 10h. Se não puder vir, me avise o quanto antes para eu liberar esse horário, combinado?",
      },
      {
        type: "heading",
        content: "Não transforme lembrete em mais uma tarefa pesada",
      },
      {
        type: "paragraph",
        content:
          "O erro comum é tentar resolver faltas adicionando mais trabalho manual. A profissional termina o dia cansada e ainda precisa mandar lembrete para todo mundo. Isso funciona por alguns dias, mas logo vira mais uma coisa para esquecer.",
      },
      {
        type: "paragraph",
        content:
          "O melhor lembrete é aquele que sai sem depender da sua memória. No Agenda Bela, a cliente recebe mensagem quando agenda e também recebe lembrete no dia. Você ganha previsibilidade sem precisar virar secretária depois do expediente.",
      },
    ],
    relatedSlugs: [
      "como-lembrar-clientes-do-horario-sem-fazer-manualmente",
      "como-parecer-mais-profissional-no-atendimento",
      "como-fazer-primeiro-agendamento-online-funcionar",
    ],
  },
  {
    slug: "como-criar-link-de-agendamento-para-clientes",
    title: "Como criar um link de agendamento para suas clientes",
    seoTitle: "Como criar link de agendamento para clientes do salão",
    description:
      "Veja como usar um link de agendamento para clientes escolherem horários sem depender de troca de mensagens no WhatsApp.",
    publishedAt: "2026-05-27",
    updatedAt: "2026-05-27",
    author: "Equipe Agenda Bela",
    category: "agendamento-online",
    tags: ["link de agendamento", "agenda online", "clientes"],
    readingMinutes: 6,
    hero: "Um link de agendamento é uma forma simples de deixar a cliente escolher horário sem você precisar parar o atendimento para responder.",
    pain: "Clientes querem marcar horário enquanto a profissional está ocupada.",
    ctaLabel: "Criar meu link de agendamento",
    ctaHref: agendaBelaBlogConfig.ctaHref,
    ctaPosition: "article_link_agendamento",
    sections: [
      {
        type: "paragraph",
        content:
          "Se hoje suas clientes marcam pelo WhatsApp, você já conhece a cena: uma pergunta se tem horário sexta, outra quer saber preço, outra manda áudio, e você está com a mão ocupada atendendo. O link de agendamento reduz esse vai e volta.",
      },
      {
        type: "heading",
        content: "O que o link precisa mostrar",
      },
      {
        type: "paragraph",
        content:
          "Um bom link não é só uma página bonita. Ele precisa mostrar os serviços, os horários disponíveis e pedir os dados certos da cliente. Quanto menos dúvida ela tiver, maior a chance de concluir o agendamento sozinha.",
      },
      {
        type: "list",
        items: [
          "Nome dos serviços do jeito que a cliente entende.",
          "Preço e duração quando fizer sentido mostrar.",
          "Horários disponíveis de verdade.",
          "Nome e telefone da cliente para confirmação.",
        ],
      },
      {
        type: "heading",
        content: "Comece com poucos serviços",
      },
      {
        type: "paragraph",
        content:
          "Não precisa cadastrar tudo no primeiro dia. Comece pelos serviços mais pedidos, como manicure, corte, escova, sobrancelha ou design de unhas. O objetivo é fazer o link funcionar para os agendamentos mais comuns antes de tentar cobrir todos os detalhes do salão.",
      },
      {
        type: "heading",
        content: "Onde divulgar o link",
      },
      {
        type: "paragraph",
        content:
          "O link deve ficar onde a cliente já procura você. Coloque na bio do Instagram, salve uma mensagem rápida no WhatsApp e envie quando alguém perguntar por horário. Se você usa status, também pode publicar em dias de agenda aberta.",
      },
      {
        type: "callout",
        title: "Mensagem pronta",
        content:
          "Oi! Para escolher o melhor horário, pode agendar por aqui: [seu link]. Assim você já vê os horários disponíveis e eu recebo tudo organizado.",
      },
      {
        type: "heading",
        content: "O link não substitui seu atendimento",
      },
      {
        type: "paragraph",
        content:
          "Ele tira do caminho a parte repetitiva: perguntar dia, conferir horário, anotar telefone e confirmar. Você continua disponível para dúvidas importantes, mas deixa de gastar energia com cada detalhe operacional.",
      },
      {
        type: "paragraph",
        content:
          "No Agenda Bela, cada salão tem um link público de agendamento. A cliente escolhe o serviço, marca o horário e recebe a confirmação. Para quem atende sozinha, isso é como ter uma secretária cuidando da primeira parte da conversa.",
      },
    ],
    relatedSlugs: [
      "como-organizar-agenda-manicure-sem-se-perder-no-whatsapp",
      "como-fazer-primeiro-agendamento-online-funcionar",
      "o-que-cadastrar-primeiro-em-um-sistema-de-agenda-para-salao",
    ],
  },
  {
    slug: "como-organizar-horarios-trabalhando-sozinha",
    title: "Como organizar horários de atendimento quando você trabalha sozinha",
    seoTitle:
      "Como organizar horários de atendimento trabalhando sozinha",
    description:
      "Aprenda a montar uma rotina de horários que respeita pausas, duração dos serviços e espaço para imprevistos.",
    publishedAt: "2026-05-27",
    updatedAt: "2026-05-27",
    author: "Equipe Agenda Bela",
    category: "rotina-da-profissional",
    tags: ["profissional autonoma", "horarios", "rotina"],
    readingMinutes: 6,
    hero: "Trabalhar sozinha dá liberdade, mas também coloca tudo nas suas costas: atendimento, agenda, confirmação, limpeza, compra de material e resposta para cliente.",
    pain: "A rotina fica apertada porque todos os horários parecem disponíveis.",
    ctaLabel: "Montar minha agenda de atendimento",
    ctaHref: agendaBelaBlogConfig.ctaHref,
    ctaPosition: "article_horarios_sozinha",
    sections: [
      {
        type: "paragraph",
        content:
          "Quando você trabalha sozinha, a agenda precisa proteger sua energia. Se todo espaço vazio vira horário disponível, o dia fica cheio no papel e caótico na prática. Você atrasa, pula almoço, responde cliente correndo e termina sem saber se faturou bem.",
      },
      {
        type: "heading",
        content: "Defina seu horário real, não o horário ideal",
      },
      {
        type: "paragraph",
        content:
          "Não adianta abrir agenda das 8h às 20h se você não consegue sustentar esse ritmo. O horário real considera sua chegada, preparação, pausa, limpeza entre clientes e encerramento. Ele parece menor, mas costuma gerar uma rotina mais profissional.",
      },
      {
        type: "list",
        items: [
          "Bloqueie horário de almoço como compromisso fixo.",
          "Reserve margem entre serviços demorados.",
          "Evite encaixar cliente em todo intervalo pequeno.",
          "Separe horários para responder mensagens e organizar material.",
        ],
      },
      {
        type: "heading",
        content: "Use duração real dos serviços",
      },
      {
        type: "paragraph",
        content:
          "Se uma manutenção de unhas leva 1h20, não marque como 1h só para caber mais gente. Esse pequeno ajuste vira atraso em cadeia. A cliente percebe, você se estressa e o próximo horário começa errado.",
      },
      {
        type: "callout",
        title: "Regra simples",
        content:
          "Cadastre cada serviço com a duração que ele costuma levar em um dia normal, não no seu melhor dia.",
      },
      {
        type: "heading",
        content: "Tenha blocos para imprevistos",
      },
      {
        type: "paragraph",
        content:
          "Um horário livre no meio da tarde não é fracasso. Pode ser o espaço que salva o dia quando uma cliente atrasa, um serviço demora mais ou você precisa respirar. Agenda lotada demais nem sempre significa mais lucro.",
      },
      {
        type: "paragraph",
        content:
          "No Agenda Bela, você configura seus horários de trabalho, serviços e bloqueios. Assim, a cliente só consegue escolher horários que respeitam sua rotina real. Isso reduz conflito e deixa sua agenda mais previsível.",
      },
    ],
    relatedSlugs: [
      "como-bloquear-horarios-de-folga-e-evitar-agendamentos-indevidos",
      "como-evitar-conflito-de-horarios-entre-servicos-e-profissionais",
      "como-acompanhar-faturamento-do-dia-sem-planilha",
    ],
  },
  {
    slug: "o-que-cadastrar-primeiro-em-um-sistema-de-agenda-para-salao",
    title: "O que cadastrar primeiro em um sistema de agenda para salão",
    seoTitle: "O que cadastrar primeiro em sistema de agenda para salão",
    description:
      "Veja a ordem mais simples para configurar um sistema de agenda sem travar no começo.",
    publishedAt: "2026-05-27",
    updatedAt: "2026-05-27",
    author: "Equipe Agenda Bela",
    category: "agenda-e-organizacao",
    tags: ["sistema de agenda", "setup", "salao"],
    readingMinutes: 5,
    hero: "Muita profissional desiste de um sistema de agenda não porque ele é difícil, mas porque tenta configurar tudo de uma vez.",
    pain: "Começar no sistema parece confuso e a profissional trava antes do primeiro agendamento.",
    ctaLabel: "Configurar minha agenda passo a passo",
    ctaHref: agendaBelaBlogConfig.ctaHref,
    ctaPosition: "article_primeiro_cadastro",
    sections: [
      {
        type: "paragraph",
        content:
          "A melhor forma de começar é pensar no primeiro agendamento, não no salão inteiro. Para uma cliente conseguir marcar horário, o sistema precisa saber quem atende, quais serviços existem e em quais horários eles podem acontecer.",
      },
      {
        type: "heading",
        content: "Primeiro: dados básicos do salão",
      },
      {
        type: "paragraph",
        content:
          "Nome do salão, telefone e informações principais vêm primeiro porque aparecem para a cliente e ajudam a deixar o link de agendamento confiável. Mesmo que você trabalhe em casa ou sozinha, trate esse cadastro como a vitrine do seu atendimento.",
      },
      {
        type: "heading",
        content: "Segundo: profissional e horário de trabalho",
      },
      {
        type: "paragraph",
        content:
          "Depois, cadastre quem atende. Se é só você, ótimo: comece por você. Defina dias e horários reais de atendimento. Não abra horários que você não quer ocupar, porque a cliente pode escolher exatamente o que estiver disponível.",
      },
      {
        type: "heading",
        content: "Terceiro: serviços mais vendidos",
      },
      {
        type: "paragraph",
        content:
          "Cadastre primeiro os serviços que mais saem. Não precisa listar todo procedimento raro no primeiro dia. Para cada serviço, pense em nome claro, duração real e preço. Isso já permite criar o primeiro agendamento com segurança.",
      },
      {
        type: "list",
        items: [
          "Nome do serviço: simples e conhecido pela cliente.",
          "Duração: tempo real, com margem quando necessário.",
          "Preço: valor atual, sem depender de memória.",
          "Profissional: quem pode realizar aquele serviço.",
        ],
      },
      {
        type: "heading",
        content: "Quarto: faça um teste completo",
      },
      {
        type: "paragraph",
        content:
          "Antes de mandar o link para clientes, faça um agendamento de teste. Veja se o horário aparece certo, se o serviço está claro e se a confirmação chega como esperado. Esse teste tira a insegurança de divulgar algo novo.",
      },
      {
        type: "paragraph",
        content:
          "O Agenda Bela foi pensado para essa ordem: perfil, profissional, serviço e primeiro agendamento. Você não precisa virar especialista em sistema; precisa só montar o caminho para sua cliente conseguir marcar horário.",
      },
    ],
    relatedSlugs: [
      "como-fazer-primeiro-agendamento-online-funcionar",
      "como-criar-link-de-agendamento-para-clientes",
      "como-organizar-horarios-trabalhando-sozinha",
    ],
  },
  {
    slug: "como-evitar-conflito-de-horarios-entre-servicos-e-profissionais",
    title: "Como evitar conflito de horários entre serviços e profissionais",
    seoTitle: "Como evitar conflito de horários no salão de beleza",
    description:
      "Entenda como controlar duração de serviços, profissionais e bloqueios para evitar dois clientes no mesmo horário.",
    publishedAt: "2026-05-27",
    updatedAt: "2026-05-27",
    author: "Equipe Agenda Bela",
    category: "agenda-e-organizacao",
    tags: ["conflito de horarios", "servicos", "profissionais"],
    readingMinutes: 6,
    hero: "Conflito de horário quase sempre nasce pequeno: uma duração anotada errada, uma pausa esquecida ou uma confirmação feita rápido demais.",
    pain: "Dois clientes aparecem para o mesmo horário ou um serviço invade o próximo.",
    ctaLabel: "Evitar conflitos na minha agenda",
    ctaHref: agendaBelaBlogConfig.ctaHref,
    ctaPosition: "article_conflito_horarios",
    sections: [
      {
        type: "paragraph",
        content:
          "Na correria, é fácil achar que um encaixe resolve. Mas quando o serviço demora mais do que o previsto, a cliente seguinte espera, você se estressa e a agenda do dia perde o controle. Evitar conflito é mais barato do que consertar atraso.",
      },
      {
        type: "heading",
        content: "Duração é regra de agenda",
      },
      {
        type: "paragraph",
        content:
          "Cada serviço precisa ter uma duração realista. Corte, escova, manicure, extensão, sobrancelha e procedimentos estéticos não ocupam o mesmo tempo. Quando todos são tratados como 'uma horinha', o conflito aparece.",
      },
      {
        type: "list",
        items: [
          "Revise os serviços que sempre atrasam.",
          "Coloque margem nos procedimentos mais variáveis.",
          "Evite marcar serviços longos colados em horários de pico.",
          "Considere tempo de preparação e limpeza.",
        ],
      },
      {
        type: "heading",
        content: "Profissional não é recurso infinito",
      },
      {
        type: "paragraph",
        content:
          "Se há mais de uma pessoa atendendo, cada profissional precisa ter sua própria disponibilidade. Uma cliente de manicure não pode ocupar o mesmo horário da profissional que já está fazendo outro serviço, mesmo que o salão tenha cadeira vazia.",
      },
      {
        type: "heading",
        content: "Bloqueios precisam entrar na agenda",
      },
      {
        type: "paragraph",
        content:
          "Folga, almoço, consulta, curso e compromisso pessoal devem aparecer como bloqueio. Se ficarem só na sua cabeça, alguém pode agendar naquele horário e você vai precisar remarcar depois.",
      },
      {
        type: "callout",
        title: "Sinal de alerta",
        content:
          "Se você precisa conferir três lugares antes de confirmar um horário, sua agenda está vulnerável a conflito.",
      },
      {
        type: "paragraph",
        content:
          "No Agenda Bela, serviços, profissionais, horários de trabalho e bloqueios trabalham juntos. A cliente vê apenas horários possíveis, e você reduz o risco de confirmar algo que não cabe no dia.",
      },
    ],
    relatedSlugs: [
      "como-organizar-horarios-trabalhando-sozinha",
      "como-bloquear-horarios-de-folga-e-evitar-agendamentos-indevidos",
      "agenda-online-ou-caderno-quando-vale-mudar",
    ],
  },
  {
    slug: "como-parecer-mais-profissional-no-atendimento",
    title: "Como parecer mais profissional no atendimento sem trabalhar mais",
    seoTitle:
      "Como parecer mais profissional no atendimento do salão sem trabalhar mais",
    description:
      "Pequenas mudanças em confirmação, agenda e comunicação deixam seu atendimento mais profissional sem aumentar sua carga.",
    publishedAt: "2026-05-27",
    updatedAt: "2026-05-27",
    author: "Equipe Agenda Bela",
    category: "profissionalizacao",
    tags: ["profissionalizacao", "atendimento", "salao"],
    readingMinutes: 5,
    hero: "Profissionalismo não é parecer grande. É passar segurança para a cliente em cada detalhe simples.",
    pain: "A profissional quer crescer, mas não quer adicionar mais tarefas manuais.",
    ctaLabel: "Profissionalizar meu atendimento",
    ctaHref: agendaBelaBlogConfig.ctaHref,
    ctaPosition: "article_profissionalizacao",
    sections: [
      {
        type: "paragraph",
        content:
          "Muita profissional acha que precisa de recepcionista, designer, planilha avançada e sistema complexo para parecer mais profissional. Na prática, a cliente percebe profissionalismo em coisas muito mais diretas: resposta clara, horário confirmado, lembrete no dia e atendimento sem bagunça.",
      },
      {
        type: "heading",
        content: "Confirme como quem tem processo",
      },
      {
        type: "paragraph",
        content:
          "Quando a cliente agenda, ela precisa receber uma confirmação objetiva. Dia, horário, serviço e orientação. Isso mostra que você está organizada e reduz a chance de mal-entendido.",
      },
      {
        type: "heading",
        content: "Use o mesmo padrão de mensagem",
      },
      {
        type: "paragraph",
        content:
          "Cada cliente não precisa receber uma mensagem diferente. Um padrão bem escrito passa mais confiança do que respostas improvisadas na pressa. Você pode adaptar quando necessário, mas a base deve ser sempre clara.",
      },
      {
        type: "list",
        items: [
          "Evite confirmar só com 'ok'.",
          "Inclua data e horário completos.",
          "Avise como remarcar se precisar.",
          "Mantenha o tom educado e direto.",
        ],
      },
      {
        type: "heading",
        content: "Mostre que sua agenda tem regra",
      },
      {
        type: "paragraph",
        content:
          "Cliente respeita mais o horário quando percebe que existe organização. Link de agendamento, lembrete automático e confirmação clara comunicam que seu tempo tem valor. Isso ajuda inclusive a sustentar preço.",
      },
      {
        type: "callout",
        title: "Profissionalismo sem peso",
        content:
          "O objetivo não é fazer você trabalhar mais. É tirar da sua cabeça tarefas repetitivas que fazem a cliente confiar mais no seu atendimento.",
      },
      {
        type: "paragraph",
        content:
          "O Agenda Bela ajuda justamente nessa camada: confirmação, lembrete, agenda organizada e link público. Para a cliente, parece um atendimento mais estruturado. Para você, é menos coisa manual para lembrar.",
      },
    ],
    relatedSlugs: [
      "como-reduzir-faltas-no-salao-com-lembretes-simples",
      "como-criar-link-de-agendamento-para-clientes",
      "como-acompanhar-faturamento-do-dia-sem-planilha",
    ],
  },
  {
    slug: "como-lembrar-clientes-do-horario-sem-fazer-manualmente",
    title: "Como lembrar suas clientes do horário marcado sem fazer tudo manualmente",
    seoTitle: "Como lembrar clientes do horário marcado automaticamente",
    description:
      "Veja como criar uma rotina de lembretes que reduz esquecimento sem virar mais uma tarefa no fim do dia.",
    publishedAt: "2026-05-27",
    updatedAt: "2026-05-27",
    author: "Equipe Agenda Bela",
    category: "faltas-e-lembretes",
    tags: ["lembrete automatico", "whatsapp", "clientes"],
    readingMinutes: 5,
    hero: "Lembrar cliente uma por uma funciona até o dia em que você está cansada, atrasada ou com a agenda cheia.",
    pain: "A profissional sabe que precisa lembrar clientes, mas não consegue manter a rotina manual.",
    ctaLabel: "Automatizar lembretes das minhas clientes",
    ctaHref: agendaBelaBlogConfig.ctaHref,
    ctaPosition: "article_lembrar_clientes",
    sections: [
      {
        type: "paragraph",
        content:
          "Mandar lembrete é uma das tarefas mais simples e mais fáceis de abandonar. Você sabe que ajuda, mas depois de atender o dia inteiro, ainda abrir a agenda e chamar cliente por cliente vira uma carga invisível.",
      },
      {
        type: "heading",
        content: "Defina quais lembretes importam",
      },
      {
        type: "paragraph",
        content:
          "Nem todo agendamento precisa de três mensagens. Para a maioria dos salões pequenos, dois momentos resolvem bem: confirmação quando o horário é marcado e lembrete no dia do atendimento.",
      },
      {
        type: "list",
        items: [
          "Confirmação: enviada logo após marcar.",
          "Lembrete do dia: enviado antes do atendimento.",
          "Resumo para você: agenda do dia no celular.",
        ],
      },
      {
        type: "heading",
        content: "Use texto curto",
      },
      {
        type: "paragraph",
        content:
          "Lembrete não é propaganda. A cliente precisa bater o olho e entender. Mensagem longa aumenta chance de ela ignorar. O texto deve informar horário, serviço e o que fazer se precisar remarcar.",
      },
      {
        type: "callout",
        title: "Modelo enxuto",
        content:
          "Oi! Lembrete do seu horário hoje às 15h para escova. Se precisar remarcar, me avise com antecedência.",
      },
      {
        type: "heading",
        content: "Automatize antes de cansar",
      },
      {
        type: "paragraph",
        content:
          "Muita profissional só procura automação quando já perdeu muito horário. Mas lembrete automático é uma daquelas melhorias que funcionam melhor quando entram cedo na rotina. Você para de depender de força de vontade.",
      },
      {
        type: "paragraph",
        content:
          "No Agenda Bela, os lembretes fazem parte do fluxo. A cliente recebe confirmação e lembrete, e você recebe sua agenda do dia. É uma pequena secretária cuidando do que costuma escapar quando o salão está cheio.",
      },
    ],
    relatedSlugs: [
      "como-reduzir-faltas-no-salao-com-lembretes-simples",
      "como-parecer-mais-profissional-no-atendimento",
      "como-organizar-agenda-manicure-sem-se-perder-no-whatsapp",
    ],
  },
  {
    slug: "agenda-online-ou-caderno-quando-vale-mudar",
    title: "Agenda online ou caderno: quando vale a pena mudar",
    seoTitle: "Agenda online ou caderno: quando mudar no salão de beleza",
    description:
      "Compare agenda online e caderno para entender quando a mudança começa a valer a pena para profissionais da beleza.",
    publishedAt: "2026-05-27",
    updatedAt: "2026-05-27",
    author: "Equipe Agenda Bela",
    category: "agenda-e-organizacao",
    tags: ["agenda online", "caderno", "organizacao"],
    readingMinutes: 6,
    hero: "O caderno não é inimigo. Ele só tem limite. O problema começa quando sua rotina cresce mais rápido do que a ferramenta que você usa.",
    pain: "A profissional não sabe se já passou da hora de trocar o caderno por agenda online.",
    ctaLabel: "Testar agenda online por 30 dias",
    ctaHref: agendaBelaBlogConfig.ctaHref,
    ctaPosition: "article_agenda_online_caderno",
    sections: [
      {
        type: "paragraph",
        content:
          "Muita profissional começa no caderno porque é simples, barato e conhecido. Para poucos horários por semana, ele pode funcionar. Mas quando entram remarcações, lembretes, link de agendamento, vários serviços e mais clientes chamando no WhatsApp, o caderno começa a cobrar juros.",
      },
      {
        type: "heading",
        content: "Quando o caderno ainda funciona",
      },
      {
        type: "paragraph",
        content:
          "Se você tem poucos clientes, quase não remarca, não precisa enviar lembrete e atende em horários muito fixos, talvez o caderno ainda resolva. A ferramenta certa é aquela que acompanha seu momento.",
      },
      {
        type: "heading",
        content: "Sinais de que passou da hora",
      },
      {
        type: "list",
        items: [
          "Você procura conversa antiga para confirmar horário.",
          "Já marcou duas clientes no mesmo período.",
          "Esquece de avisar cliente no dia do atendimento.",
          "Não sabe quanto tem previsto para faturar.",
          "Perde cliente porque demora para responder.",
        ],
      },
      {
        type: "heading",
        content: "Agenda online não precisa ser complicada",
      },
      {
        type: "paragraph",
        content:
          "Trocar o caderno não significa virar uma empresa cheia de processos. Significa colocar os horários em um lugar que ajuda você: mostra disponibilidade, evita conflito, envia lembrete e deixa a cliente agendar com menos troca de mensagem.",
      },
      {
        type: "callout",
        title: "Boa regra de decisão",
        content:
          "Se a falta de organização já está custando cliente, atraso ou faturamento, a agenda online deixou de ser luxo.",
      },
      {
        type: "paragraph",
        content:
          "O Agenda Bela foi feito para profissionais que querem sair do improviso sem montar uma operação pesada. Você pode começar com poucos serviços, testar o link e sentir se a rotina fica mais leve.",
      },
    ],
    relatedSlugs: [
      "como-organizar-agenda-manicure-sem-se-perder-no-whatsapp",
      "como-criar-link-de-agendamento-para-clientes",
      "como-acompanhar-faturamento-do-dia-sem-planilha",
    ],
  },
  {
    slug: "como-acompanhar-faturamento-do-dia-sem-planilha",
    title: "Como acompanhar o faturamento do dia sem planilha",
    seoTitle: "Como acompanhar faturamento do salão sem planilha",
    description:
      "Aprenda uma forma simples de acompanhar faturamento diário sem depender de memória, papel ou planilhas difíceis.",
    publishedAt: "2026-05-27",
    updatedAt: "2026-05-27",
    author: "Equipe Agenda Bela",
    category: "profissionalizacao",
    tags: ["faturamento", "relatorios", "gestao"],
    readingMinutes: 5,
    hero: "Você não precisa virar financeira para saber se o dia foi bom. Mas precisa de um jeito confiável de enxergar o que entrou.",
    pain: "A profissional atende bastante, mas não acompanha faturamento com clareza.",
    ctaLabel: "Ver minha agenda e faturamento no app",
    ctaHref: agendaBelaBlogConfig.ctaHref,
    ctaPosition: "article_faturamento_sem_planilha",
    sections: [
      {
        type: "paragraph",
        content:
          "Muitas profissionais sabem que trabalharam muito, mas não sabem exatamente quanto faturaram. Isso acontece quando o controle fica espalhado: parte no Pix, parte no dinheiro, parte na memória e parte em um caderno que nem sempre é atualizado.",
      },
      {
        type: "heading",
        content: "Comece pelo valor previsto",
      },
      {
        type: "paragraph",
        content:
          "Antes mesmo de fechar o dia, sua agenda já dá uma pista: quais serviços estão marcados e quanto eles valem. Isso ajuda a saber se a semana está cheia de serviços bons ou se muitos horários estão ocupados por procedimentos de ticket menor.",
      },
      {
        type: "heading",
        content: "Registre serviço com preço",
      },
      {
        type: "paragraph",
        content:
          "Se o serviço fica cadastrado com preço, cada agendamento deixa de ser só um horário e passa a indicar faturamento previsto. Você não precisa somar tudo manualmente no fim do dia.",
      },
      {
        type: "list",
        items: [
          "Cadastre preço dos serviços principais.",
          "Atualize valores quando reajustar.",
          "Separe serviços comuns de combos.",
          "Revise no fim do dia o que foi realizado.",
        ],
      },
      {
        type: "heading",
        content: "Não espere o mês acabar",
      },
      {
        type: "paragraph",
        content:
          "Olhar faturamento só no fim do mês é tarde. Se você acompanha por dia e por semana, percebe buracos antes. Dá para divulgar horário livre, chamar cliente antiga ou ajustar agenda antes que o mês feche fraco.",
      },
      {
        type: "callout",
        title: "Pergunta útil",
        content:
          "Hoje eu tive agenda cheia de verdade ou só muitos horários ocupados com pouco faturamento?",
      },
      {
        type: "paragraph",
        content:
          "O Agenda Bela ajuda a transformar agenda em visão de negócio. Você marca serviços com valor, acompanha relatórios e entende melhor o que está acontecendo sem viver dentro de planilha.",
      },
    ],
    relatedSlugs: [
      "como-organizar-horarios-trabalhando-sozinha",
      "como-parecer-mais-profissional-no-atendimento",
      "agenda-online-ou-caderno-quando-vale-mudar",
    ],
  },
  {
    slug: "como-bloquear-horarios-de-folga-e-evitar-agendamentos-indevidos",
    title: "Como bloquear horários de folga e evitar agendamentos indevidos",
    seoTitle: "Como bloquear horários de folga na agenda do salão",
    description:
      "Veja como tratar folgas, pausas e compromissos como bloqueios reais para evitar agendamentos em horários errados.",
    publishedAt: "2026-05-27",
    updatedAt: "2026-05-27",
    author: "Equipe Agenda Bela",
    category: "rotina-da-profissional",
    tags: ["bloqueio de agenda", "folga", "horarios"],
    readingMinutes: 5,
    hero: "Folga que não está bloqueada vira horário disponível. E horário disponível uma hora alguém ocupa.",
    pain: "Clientes marcam em horários que deveriam estar fechados.",
    ctaLabel: "Bloquear horários na minha agenda",
    ctaHref: agendaBelaBlogConfig.ctaHref,
    ctaPosition: "article_bloqueios",
    sections: [
      {
        type: "paragraph",
        content:
          "Quando a agenda está no caderno ou na memória, é comum esquecer de marcar folga, consulta, viagem, almoço ou compromisso pessoal. O problema aparece quando uma cliente pede exatamente aquele horário e você confirma sem lembrar do bloqueio.",
      },
      {
        type: "heading",
        content: "Bloqueio não é detalhe",
      },
      {
        type: "paragraph",
        content:
          "Bloqueio é parte da agenda. Ele protege seu tempo e evita remarcação desnecessária. Se você só descobre o conflito depois, precisa pedir desculpa, reorganizar a cliente e perder confiança.",
      },
      {
        type: "list",
        items: [
          "Bloqueie folgas assim que decidir.",
          "Bloqueie horários de almoço fixos.",
          "Bloqueie compromissos pessoais antes de divulgar agenda.",
          "Revise a semana toda antes de abrir novos horários.",
        ],
      },
      {
        type: "heading",
        content: "Use bloqueio parcial e dia inteiro",
      },
      {
        type: "paragraph",
        content:
          "Nem todo bloqueio é igual. Às vezes você precisa fechar só das 13h às 15h. Em outras, precisa bloquear o dia todo. Ter os dois tipos evita improviso e deixa a disponibilidade mais fiel à sua rotina.",
      },
      {
        type: "callout",
        title: "Cuidado comum",
        content:
          "Não confie em 'eu vou lembrar'. A agenda existe justamente para lembrar por você.",
      },
      {
        type: "heading",
        content: "Bloqueio também ajuda a vender melhor",
      },
      {
        type: "paragraph",
        content:
          "Quando seus horários reais estão bem definidos, você divulga com mais segurança. Em vez de responder 'vou ver aqui', consegue oferecer opções claras ou deixar a cliente escolher pelo link.",
      },
      {
        type: "paragraph",
        content:
          "No Agenda Bela, você pode bloquear períodos e evitar que clientes agendem quando você não está disponível. É uma forma simples de respeitar seu tempo sem depender de memória.",
      },
    ],
    relatedSlugs: [
      "como-organizar-horarios-trabalhando-sozinha",
      "como-evitar-conflito-de-horarios-entre-servicos-e-profissionais",
      "como-criar-link-de-agendamento-para-clientes",
    ],
  },
  {
    slug: "como-fazer-primeiro-agendamento-online-funcionar",
    title: "Como fazer o primeiro agendamento online funcionar de verdade",
    seoTitle: "Como fazer o primeiro agendamento online funcionar",
    description:
      "Um passo a passo para testar seu link, ganhar confiança e fazer a primeira cliente agendar online.",
    publishedAt: "2026-05-27",
    updatedAt: "2026-05-27",
    author: "Equipe Agenda Bela",
    category: "agendamento-online",
    tags: ["primeiro agendamento", "agenda online", "ativacao"],
    readingMinutes: 6,
    hero: "O primeiro agendamento online é o momento em que a ficha cai: a cliente consegue marcar sem você conduzir tudo manualmente.",
    pain: "A profissional configura a agenda, mas não sabe como dar o próximo passo.",
    ctaLabel: "Fazer meu primeiro agendamento online",
    ctaHref: agendaBelaBlogConfig.ctaHref,
    ctaPosition: "article_primeiro_agendamento",
    sections: [
      {
        type: "paragraph",
        content:
          "Configurar perfil, profissional e serviço é importante, mas não é o final. O valor aparece quando alguém agenda de verdade. Por isso, o primeiro objetivo deve ser simples: fazer um agendamento online completo e entender o caminho da cliente.",
      },
      {
        type: "heading",
        content: "Teste antes de divulgar",
      },
      {
        type: "paragraph",
        content:
          "Use seu próprio nome ou peça para alguém próximo testar. Abra o link, escolha um serviço, selecione horário e confirme. Veja o que chega para você e o que chega para a cliente. Esse teste dá segurança para divulgar.",
      },
      {
        type: "list",
        items: [
          "Confira se o serviço aparece com nome correto.",
          "Veja se os horários disponíveis fazem sentido.",
          "Confirme se a mensagem de agendamento chega.",
          "Ajuste qualquer informação confusa antes de enviar para clientes.",
        ],
      },
      {
        type: "heading",
        content: "Escolha uma cliente fácil para começar",
      },
      {
        type: "paragraph",
        content:
          "Não precisa mandar para todo mundo no primeiro dia. Escolha uma cliente que já confia em você e costuma responder bem. Explique que agora ela pode escolher horário pelo link. Isso reduz ansiedade e gera o primeiro uso real.",
      },
      {
        type: "callout",
        title: "Mensagem de estreia",
        content:
          "Oi! Estou organizando meus horários por esse link agora. Você pode escolher o melhor horário por aqui: [seu link]. Se tiver qualquer dúvida, me chama.",
      },
      {
        type: "heading",
        content: "Aprenda com o primeiro agendamento",
      },
      {
        type: "paragraph",
        content:
          "Depois que a primeira cliente agendar, observe: ela teve dúvida? O nome do serviço estava claro? A duração estava correta? O horário apareceu certo? Pequenos ajustes no começo deixam o link muito melhor.",
      },
      {
        type: "paragraph",
        content:
          "O Agenda Bela guia esse primeiro caminho para a profissional sair do setup e chegar no uso real. A ideia não é só cadastrar informações, é fazer sua agenda trabalhar por você.",
      },
    ],
    relatedSlugs: [
      "o-que-cadastrar-primeiro-em-um-sistema-de-agenda-para-salao",
      "como-criar-link-de-agendamento-para-clientes",
      "como-parecer-mais-profissional-no-atendimento",
    ],
  },
];
