// EN / PT toggle. English lives in the HTML; this is the Portuguese (PT-PT) layer.
(function () {
  var root = document.documentElement;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  var PT = {
    skip: 'Saltar para o conteúdo',
    'nav.work': 'Trabalho', 'nav.paper': 'Artigo', 'nav.languages': 'Línguas', 'nav.contact': 'Contacto',
    'hero.tag': 'Engenheiro de software entre a investigação e a engenharia: ferramentas com LLMs para a correção de programas, sistemas distribuídos e dados.',
    'hero.p': 'Estudei Engenharia Informática na Universidade de Lisboa e estou agora a fazer o mestrado na KU Leuven, focado em sistemas distribuídos e software seguro. Antes disso passei um verão a fazer investigação no LASIGE e outro a fazer engenharia de dados na Unicre. Sou co-autor de um artigo do ASE 2026 sobre agentes LLM que escrevem especificações typestate.',
    'hero.cv': 'Descarregar CV', 'hero.mail': 'Enviar email',
    'wk.h': 'Em que tenho trabalhado',
    'wk.r.tag': 'Investigação · LASIGE, 2025', 'wk.r.h': 'Agentes LLM que escrevem especificações',
    'wk.r.p': 'Prototipei a geração de especificações de programas com LLMs através de prompts com restrições gramaticais, a abordagem que deu origem ao pipeline agêntico do Barista. Escrevi também anotações typestate de especialista que servem de verdade de referência ao seu benchmark de 35 classes do JDK.',
    'wk.r.l': 'Sobre o artigo',
    'wk.s.tag': 'Sistemas · projeto pessoal',
    'wk.s.p': 'Uma plataforma de negociação de ações de jogadores de futebol, com dividendos ligados a um rating reproduzível. Um registo de eventos append-only é a única fonte de verdade, por isso qualquer saldo, carteira ou rating pode ser reconstruído a partir dele. Java, Spring Boot, PostgreSQL, Redis.',
    'wk.s.l': 'Código no GitHub',
    'pa.h': 'Artigo em destaque',
    'pa.p': 'Um typestate descreve a ordem em que os métodos de um objeto podem ser chamados: abrir um ficheiro antes de o ler, nunca depois de o fechar. Escrevê-los à mão é lento, por isso o Barista usa agentes LLM para os inferir em classes Java. Publicado na 41.ª Conferência Internacional IEEE/ACM de Engenharia de Software Automatizada, Munique, outubro de 2026.',
    'pa.page': 'Página do artigo', 'pa.poster': 'Poster', 'pa.code': 'Código',
    'la.h': 'Línguas',
    'la.p': 'Sou fluente em português e inglês. Tenho nível intermédio de espanhol e francês, e estou a aprender neerlandês e alemão.',
    'la.fluent': 'fluente', 'la.mid': 'intermédio', 'la.learn': 'a aprender',
    'bg.h': 'Percurso', 'bg.ed': 'Estudos', 'bg.now': 'presente',
    'bg.k': 'Mestrado em Engenharia Informática, ramo de Sistemas Distribuídos e Software Seguro.',
    'bg.f.n': 'Universidade de Lisboa', 'bg.f': 'Licenciatura em Engenharia Informática.',
    'bg.tools': 'Ferramentas que uso',
    'bg.t': 'Sobretudo Java, Python e C/C++, e ainda JavaScript e TypeScript. No backend, Spring Boot, gRPC, PostgreSQL e Redis; por baixo, Linux, Docker, AWS e GCP. E de vez em quando um pouco de Haskell e Assembly.',
    'ct.h': 'Contacto',
    'ct.p': 'Se quiseres falar sobre uma vaga, investigação ou um projeto, o email é a forma mais rápida de me contactar.'
  };
  var els = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
  var EN = {};
  els.forEach(function (el) { EN[el.dataset.i18n] = el.innerHTML; });
  var btn = document.getElementById('lang');
  var lang = 'en';
  function setLang(next) {
    lang = next;
    var dict = next === 'pt' ? PT : EN;
    els.forEach(function (el) { var v = dict[el.dataset.i18n]; if (v != null) el.innerHTML = v; });
    root.lang = next === 'pt' ? 'pt-PT' : 'en';
    btn.setAttribute('aria-label', next === 'pt' ? 'Switch to English' : 'Mudar para português');
    btn.querySelectorAll('span').forEach(function (s) { s.classList.toggle('on', s.textContent.toLowerCase() === next); });
    store.set('mm-lang', next);
  }
  btn.addEventListener('click', function () { setLang(lang === 'en' ? 'pt' : 'en'); });
  var pref = store.get('mm-lang') || ((navigator.language || '').toLowerCase().indexOf('pt') === 0 ? 'pt' : 'en');
  if (pref === 'pt') setLang('pt');
})();
