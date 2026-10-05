// Shared helpers for every page. Pages call these as DBA.something(...)
const DBA = {
  $(id) { return document.getElementById(id); },

  // Removes "(Coach)" / "(Battler)" from display text
  strip(s) { return String(s).replace(/\s*\((coach|battler)\)\s*/gi, ' ').trim(); },

  show(el, on) { el.style.display = on ? '' : 'none'; },

  // Fills a <select>. The value stays the full text; stripTags only changes what is displayed.
  fillSelect(sel, label, items, stripTags) {
    sel.innerHTML = '';
    const first = document.createElement('option');
    first.value = '';
    first.textContent = 'Select a ' + label + '...';
    sel.appendChild(first);
    items.forEach(i => {
      const o = document.createElement('option');
      o.value = i;
      o.textContent = stripTags ? DBA.strip(i) : i;
      sel.appendChild(o);
    });
  },

  // Adds one row of plain values; every column after the first is right-aligned
  addRow(tbody, vals) {
    const tr = document.createElement('tr');
    vals.forEach((v, i) => {
      const td = document.createElement('td');
      td.textContent = v;
      if (i > 0) td.className = 'num';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  },

  // Replaces a table's body with rows (arrays of values), hides the table if empty. Returns the row count.
  fillTable(table, rows) {
    const body = table.querySelector('tbody');
    body.innerHTML = '';
    rows.forEach(r => DBA.addRow(body, r));
    DBA.show(table, rows.length > 0);
    return rows.length;
  },

  // Fills the overall-record table from [{label, wins, losses, net, found}]
  fillTotals(table, items) {
    DBA.fillTable(table, items.map(t =>
      t.found ? [t.label, t.wins, t.losses, t.net] : [t.label, '–', '–', '–']));
  },

  // Builds a searchable, click-to-sort table from {headers, rows} (used by the Tables page)
  sortableTable(t, opts) {
    const box = document.createElement('div');
    box.style.marginTop = '20px';
    const search = document.createElement('input');
    search.placeholder = 'Search...';
    const wrap = document.createElement('div');
    wrap.className = 'wrap';
    const table = document.createElement('table');
    wrap.appendChild(table);
    if (opts && opts.search === false) box.append(wrap);
    else box.append(search, wrap);

    const rows = t.rows.slice();
    let sortCol = -1, asc = true;

    const isNum = c => c.n !== null && c.n !== undefined;

    function sortRows() {
      rows.sort((a, b) => {
        const x = a[sortCol], y = b[sortCol];
        const r = (isNum(x) && isNum(y))
          ? x.n - y.n
          : (x.t || '').localeCompare(y.t || '', undefined, { numeric: true });
        return asc ? r : -r;
      });
    }

    function draw() {
      const q = search.value.toLowerCase();
      const shown = rows.filter(r => !q || r.some(c => c.t && c.t.toLowerCase().includes(q)));
      table.innerHTML = '';
      const head = table.createTHead().insertRow();
      t.headers.forEach((name, i) => {
        const th = document.createElement('th');
        th.textContent = name + (i === sortCol ? (asc ? ' ▲' : ' ▼') : '');
        th.onclick = () => {
          if (sortCol === i) asc = !asc; else { sortCol = i; asc = true; }
          sortRows();
          draw();
        };
        head.appendChild(th);
      });
      const body = table.createTBody();
      shown.forEach(r => {
        const tr = body.insertRow();
        r.forEach(c => {
          const td = tr.insertCell();
          if (c.img) {
            const im = document.createElement('img');
            im.src = c.img;
            im.loading = 'lazy';
            td.appendChild(im);
          } else {
            td.textContent = c.t;
            if (isNum(c)) td.className = 'num';
          }
        });
      });
    }

    search.oninput = draw;
    draw();
    return box;
  }
};