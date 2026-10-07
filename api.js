// Load this AFTER shared.js. It adds DBA.call() and builds the header and navigation.

// Your Apps Script web app address, ending in /exec
const API_URL =
  'https://script.google.com/macros/s/AKfycbwgUEH88JFHEf145rWuRygxhTbDiXAsMK_k9n8ssxkLWPskL7aFqmZrknZak7DV5iwy7w/exec';
const CLIENT_CACHE_MS = 60 * 60 * 1000;   // 1 hour; raise if you like
const CLIENT_CACHE_VERSION = 'v2';        // change to v2 to discard everyone's saved data

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

  const url = API_URL + '?fn=' + encodeURIComponent(fn) + '&args=' + encodeURIComponent(argJson);

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
  ['Player Look Up', 'individualrecords.html'],
  ['Pokémon Look Up', 'pokemonlookup.html'],
  ['Pairing Records', 'pairingrecords.html'],
  ['Player Records', 'playerrecords.html'],
  ['Pokémon Records', 'pokemonrecords.html'],
  ['Hall of Fame', 'halloffame.html'],
  ['League Docs', 'seasonsheets.html']
];


document.addEventListener('DOMContentLoaded', () => {
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = '<h1 class="site-title">Draftholes Battle Association</h1>';

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
