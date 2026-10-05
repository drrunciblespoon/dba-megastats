// Load this AFTER shared.js. It adds DBA.call() and builds the header and navigation.

// Your Apps Script web app address, ending in /exec
const API_URL =
  'https://script.google.com/macros/s/AKfycbwgUEH88JFHEf145rWuRygxhTbDiXAsMK_k9n8ssxkLWPskL7aFqmZrknZak7DV5iwy7w/exec';

// Replaces google.script.run.
// Usage: DBA.call('hofGetData').then(data => ...)
DBA.call = function (fn, ...args) {
  const url =
    API_URL +
    '?fn=' + encodeURIComponent(fn) +
    '&args=' + encodeURIComponent(JSON.stringify(args));

  return fetch(url)
    .then(r => r.json())
    .then(res => {
      if (!res.ok) throw new Error(res.error);
      return res.data;
    });
};

// [label, file] for every page on the site
const DBA_NAV = [
  ['Individual Records', 'individualrecords.html'],
  ['Pairing Records', 'pairingrecords.html'],
  ['Gen 9 Stats', 'tables.html'],
  ['Player Records', 'playerrecords.html'],
  ['Pokemon Records', 'pokemonrecords.html'],
  ['Hall of Fame', 'halloffame.html']
];


document.addEventListener('DOMContentLoaded', () => {
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = '<img src="dba.png" alt="DBA">';

  const nav = document.createElement('nav');
  nav.className = 'site-nav';

  const here = location.pathname.split('/').pop() || 'index.html';

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

  document.head.appendChild(
    Object.assign(document.createElement('script'), {
      src: 'table-colours.js'
    })
  );
});
