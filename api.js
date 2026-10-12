// Load this AFTER shared.js. It adds DBA.call() and builds the header and navigation.

// Your Apps Script web app address, ending in /exec
const API_URL =
  'https://script.google.com/macros/s/AKfycbwgUEH88JFHEf145rWuRygxhTbDiXAsMK_k9n8ssxkLWPskL7aFqmZrknZak7DV5iwy7w/exec';
const CLIENT_CACHE_MS = 60 * 60 * 1000;   // 1 hour; raise if you like
const CLIENT_CACHE_VERSION = 'v2';        // change to v2 to discard everyone's saved data
const API_CLIENT_ID_KEY = 'dba:client-id';

function getApiClientId() {
  let id = localStorage.getItem(API_CLIENT_ID_KEY);

  if (!id) {
    id =
      crypto.randomUUID
        ? crypto.randomUUID()
        : (
            Date.now().toString(36) +
            Math.random().toString(36).slice(2)
          );

    localStorage.setItem(API_CLIENT_ID_KEY, id);
  }

  return id;
}

// Replaces google.script.run.
// Usage: DBA.call('hofGetData').then(data => ...)
DBA.call = function (fn, ...args) {
  const argJson = JSON.stringify(args);
  const key = 'dba:' + CLIENT_CACHE_VERSION + ':' + fn + ':' + argJson;

  // Add ?fresh to a page's address to skip the saved copy
  if (!location.search.includes('fresh')) {
    try {
      const hit = JSON.parse(localStorage.getItem(key));
      if (hit && Date.now() - hit.t < CLIENT_CACHE_MS) return Promise.resolve(hit.v);
    } catch (e) {}
  }

  const clientId = getApiClientId();

const url =
  API_URL +
  '?fn=' + encodeURIComponent(fn) +
  '&args=' + encodeURIComponent(argJson) +
  '&client=' + encodeURIComponent(clientId);


  return fetch(url)
    .then(r => r.json())
    .then(res => {
      if (!res.ok) throw new Error(res.error);
      try {
        localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: res.data }));
      } catch (e) {
        // Storage full: clear our saved entries rather than failing
        Object.keys(localStorage)
          .filter(k => k.startsWith('dba:'))
          .forEach(k => localStorage.removeItem(k));
      }
      return res.data;
    });
};

// [label, file] for every page on the site except Home (Home is added separately, on its own row)
const DBA_NAV = [
  ['Gen 9 Stats', 'stats.html'],
  ['Player Look Up', 'playerlookup.html'],
  ['Pokémon Look Up', 'pokemonlookup.html'],
  ['Season Look Up', 'seasonlookup.html'],
  ['Pairing Look Up', 'pairinglookup.html'],
  ['Player Records', 'playerrecords.html'],
  ['Pokémon Records', 'pokemonrecords.html'],
  ['Hall of Fame', 'halloffame.html'],
  ['League Docs', 'seasonsheets.html']
];


document.addEventListener('DOMContentLoaded', () => {
  const header = document.createElement('header');
  header.className = 'site-header';
  const SPRITE = 'https://img.pokemondb.net/sprites/ruby-sapphire/normal/bayleef.png';

header.innerHTML =
  '<img class="header-sprite header-sprite-left" src="' + SPRITE + '" alt="" aria-hidden="true">' +

  // Left-hand support links: solidarity and Palestine
  '<div class="header-support-links header-support-links-left">' +
    '<a class="header-support-link header-solidarity" href="https://www.rootsdk.fr/donations-page" target="_blank" rel="noopener noreferrer" aria-label="Donate to RootsDK" title="Donate to RootsDK">' +
      '<img src="https://raw.githubusercontent.com/drrunciblespoon/dba-megastats/main/solidarity.png" alt="Support RootsDK">' +
    '</a>' +
    '<a class="header-support-link header-palestine" href="https://gmfriendsofpalestine.org/donate/" target="_blank" rel="noopener noreferrer" aria-label="Donate to GM Friends of Palestine" title="Donate to GM Friends of Palestine">' +
'<a class="header-support-link header-palestine" href="https://gmfriendsofpalestine.org/donate/" target="_blank" rel="noopener noreferrer" aria-label="Donate to GM Friends of Palestine" title="Donate to GM Friends of Palestine">' +
  '<img src="https://flagcdn.com/w80/ps.png" alt="Palestine flag">' +
'</a>' +
    '</a>' +
  '</div>' +

  '<h1 class="site-title">' +
    '<span class="site-title-desktop">Draftholes Battle Association</span>' +
    '<span class="site-title-mobile">DBA</span>' +
  '</h1>' +

  '<img class="header-sprite header-sprite-right" src="' + SPRITE + '" alt="" aria-hidden="true">' +

  // Right-hand support links: trans flag and football
  '<div class="header-support-links header-support-links-right">' +
    '<a class="header-support-link header-trans-flag" href="https://goodlawproject.org/campaign/trans-fighting-fund/" target="_blank" rel="noopener noreferrer" aria-label="Support the Trans Fighting Fund" title="Support the Trans Fighting Fund">' +
      '<img src="https://raw.githubusercontent.com/drrunciblespoon/dba-megastats/main/transflagemoji.png" alt="Trans flag">' +
    '</a>' +
    '<a class="header-support-link header-trans-football" href="https://www.crowdfunder.co.uk/p/inclusive11s-1" target="_blank" rel="noopener noreferrer" aria-label="Support Inclusive 11s" title="Support Inclusive 11s">' +
      '<img src="https://raw.githubusercontent.com/drrunciblespoon/dba-megastats/main/transfootball.png" alt="Support Inclusive 11s">' +
    '</a>' +
  '</div>';


  const nav = document.createElement('nav');
  nav.className = 'site-nav';

  // The bare site address is now the landing page
  const here = location.pathname.split('/').pop() || 'index.html';

  // Home button, on its own row above the other links
  const home = document.createElement('a');
  home.href = 'index.html';
  home.textContent = 'Home';
  home.className = 'nav-home' + (here === 'index.html' ? ' active' : '');
  nav.appendChild(home);

  // Forces everything after Home onto the next row
  const brk = document.createElement('span');
  brk.className = 'nav-break';
  nav.appendChild(brk);

  DBA_NAV.forEach(([label, href]) => {
    const a = document.createElement('a');

    a.href = href;
    a.textContent = label;

    if (href === here) {
      a.className = 'active';
    }

    nav.appendChild(a);
  });

  document.body.prepend(nav);
  document.body.prepend(header);

    // Hover text for abbreviated column headings, on every table on every page
  const TIPS = {
    td: 'Times Drafted',
    gp: 'Games Played',
    diff: 'Differential',
    wr: 'Win Rate',
    kpg: 'Kills per Game',
    sr: 'Survival Rate'
  };

  function addHeaderTips() {
    document.querySelectorAll('th:not([title])').forEach(th => {
      // Ignore the sort arrow, the trailing full stop and the case
      const key = th.textContent.replace(/[▲▼]/g, '').trim().toLowerCase().replace(/\.$/, '');
      if (TIPS[key]) th.title = TIPS[key];
    });
  }

  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; addHeaderTips(); });
  }).observe(document.body, { childList: true, subtree: true });

  addHeaderTips();

  document.head.appendChild(
    Object.assign(document.createElement('script'), {
      src: 'table-colours.js'
    })
  );
});
