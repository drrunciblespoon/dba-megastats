// Shared helpers for every page.
// Pages call these as DBA.something(...)

const DBA = {

  /* ============================================================
   * Basic helpers
   * ============================================================ */

  $(id) {
    return document.getElementById(id);
  },


  // Removes "(Coach)" / "(Battler)" from display text
  strip(s) {
    return String(s)
      .replace(/\s*\((coach|battler)\)\s*/gi, ' ')
      .trim();
  },


  show(el, on) {
    el.style.display = on ? '' : 'none';
  },


  /* ============================================================
   * Pokémon URL
   * ============================================================ */

  /*
   * Builds the canonical URL for Pokémon Look Up.
   *
   * Accepts either:
   *
   *   DBA.pokemonUrl('Azelf')
   *
   * or:
   *
   *   DBA.pokemonUrl({ name: 'Azelf' })
   */

  pokemonUrl(pokemon) {

    const name =
      typeof pokemon === 'string'
        ? pokemon
        : pokemon && pokemon.name;

    if (!name) {
      return 'pokemonlookup.html';
    }

    const url = new URL(
      'pokemonlookup.html',
      window.location.href
    );

    url.searchParams.set(
      'pokemon',
      String(name).trim()
    );

    return url.href;
  },

    pokemonLink(pokemon) {

  const name =
    typeof pokemon === 'string'
      ? pokemon.trim()
      : pokemon && String(pokemon.name || '').trim();

  if (!name) {
    return null;
  }

  const link =
    document.createElement('a');

  link.href =
    DBA.pokemonUrl(name);

  link.textContent =
    name;

  return link;
},




  /* ============================================================
   * Select helpers
   * ============================================================ */

  // Fills a <select>.
  // The value stays the full text;
  // stripTags only changes what is displayed.

  fillSelect(sel, label, items, stripTags) {

    sel.innerHTML = '';

    const first =
      document.createElement('option');

    first.value = '';

    first.textContent =
      'Select a ' + label + '...';

    sel.appendChild(first);

    items.forEach(i => {

      const o =
        document.createElement('option');

      o.value = i;

      o.textContent =
        stripTags
          ? DBA.strip(i)
          : i;

      sel.appendChild(o);

    });

  },


  /* ============================================================
   * Table helpers
   * ============================================================ */

  // Adds one row of plain values.
  // Every column after the first is right-aligned.

  addRow(tbody, vals) {

    const tr =
      document.createElement('tr');

    vals.forEach((v, i) => {

      const td =
        document.createElement('td');

      td.textContent = v;

      if (i > 0) {
        td.className = 'num';
      }

      tr.appendChild(td);

    });

    tbody.appendChild(tr);

  },


  // Replaces a table's body with rows.
  // Hides the table if empty.
  // Returns the row count.

  fillTable(table, rows) {

    const body =
      table.querySelector('tbody');

    body.innerHTML = '';

    rows.forEach(r =>
      DBA.addRow(body, r)
    );

    DBA.show(
      table,
      rows.length > 0
    );

    return rows.length;

  },


  // Fills the overall-record table from:
  // [{label, wins, losses, net, found}]

  fillTotals(table, items) {

    DBA.fillTable(
      table,
      items.map(t =>
        t.found
          ? [
              t.label,
              t.wins,
              t.losses,
              t.net
            ]
          : [
              t.label,
              '–',
              '–',
              '–'
            ]
      )
    );

  },


  /* ============================================================
   * Searchable / sortable table
   * ============================================================ */

  // Builds a searchable, click-to-sort table from:
  // {headers, rows}

  sortableTable(t, opts) {

    const box =
      document.createElement('div');

    box.style.marginTop = '20px';


    const search =
      document.createElement('input');

    search.placeholder =
      'Search...';


    const wrap =
      document.createElement('div');

    wrap.className = 'wrap';


    const table =
      document.createElement('table');

    wrap.appendChild(table);


    if (opts && opts.search === false) {

      box.append(wrap);

    } else {

      box.append(
        search,
        wrap
      );

    }


    const rows =
      t.rows.slice();


    let sortCol = -1;
    let asc = true;


    const isNum = c =>
      c.n !== null &&
      c.n !== undefined;


    function sortRows() {

      rows.sort((a, b) => {

        const x = a[sortCol];
        const y = b[sortCol];

        const r =
          isNum(x) && isNum(y)

            ? x.n - y.n

            : (x.t || '').localeCompare(
                y.t || '',
                undefined,
                {
                  numeric: true
                }
              );

        return asc
          ? r
          : -r;

      });

    }


    function draw() {

      const q =
        search.value.toLowerCase();


      const shown =
        rows.filter(
          r =>
            !q ||
            r.some(
              c =>
                c.t &&
                c.t
                  .toLowerCase()
                  .includes(q)
            )
        );


      table.innerHTML = '';


      const head =
        table
          .createTHead()
          .insertRow();


      t.headers.forEach(
        (name, i) => {

          const th =
            document.createElement('th');


          th.textContent =
            name +
            (
              i === sortCol
                ? asc
                  ? ' ▲'
                  : ' ▼'
                : ''
            );


          th.onclick = () => {

            if (sortCol === i) {

              asc = !asc;

            } else {

              sortCol = i;
              asc = true;

            }

            sortRows();
            draw();

          };


          head.appendChild(th);

        }
      );


      const body =
        table.createTBody();


      shown.forEach(r => {

        const tr =
          body.insertRow();


        r.forEach(c => {

          const td =
            tr.insertCell();


          if (c.img) {

            const im =
              document.createElement('img');

            im.src = c.img;
            im.loading = 'lazy';

            td.appendChild(im);

          } else {

  if (c.pokemonLink) {

    const link =
      document.createElement('a');

    link.href =
      c.pokemonLink;

    link.textContent =
      c.t;

    td.appendChild(link);

  } else {

    td.textContent =
      c.t;

  }

  if (isNum(c)) {
    td.className = 'num';
  }

}


        });

      });

    }


    search.oninput = draw;

    draw();

    return box;

  }

};


/* ============================================================
 * Searchable select
 * ============================================================ */

/*
 * Turns a <select> into a searchable dropdown.
 *
 * The original select stays in the DOM and keeps its value,
 * so existing code that reads sel.value or listens for
 * 'change' continues to work.
 */

function makeSearchableSelect(sel) {

  if (sel.dataset.enhanced) {
    return;
  }

  sel.dataset.enhanced = '1';


  const wrap =
    document.createElement('div');

  wrap.className = 'combo';


  const input =
    document.createElement('input');

  input.type = 'text';
  input.className = 'combo-input';
  input.autocomplete = 'off';
  input.spellcheck = false;

  input.setAttribute(
    'role',
    'combobox'
  );

  input.setAttribute(
    'aria-label',
    'Search'
  );


  const list =
    document.createElement('ul');

  list.className = 'combo-list';
  list.hidden = true;


  sel.after(wrap);

  wrap.append(
    input,
    list
  );

  sel.style.display = 'none';


  /*
   * Clicking the <label for="...">
   * focuses the new search box.
   */

  if (sel.id) {

    input.id =
      sel.id + '-combo';

    const label =
      document.querySelector(
        'label[for="' + sel.id + '"]'
      );

    if (label) {
      label.htmlFor = input.id;
    }

  }


  let items = [];
  let shown = [];
  let active = -1;


  const norm = s =>
    String(s)
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .toLowerCase();


  function readOptions() {

    const all =
      Array.from(sel.options);


    const placeholder =
      all.find(
        o => o.value === ''
      );


    input.placeholder =
      placeholder
        ? placeholder.textContent.trim()
        : 'Type to search…';


    items =
      all
        .filter(
          o => o.value !== ''
        )
        .map(
          o => ({
            value: o.value,
            label:
              o.textContent.trim()
          })
        );


    syncInput();

  }


  function syncInput() {

    const o =
      sel.options[
        sel.selectedIndex
      ];


    input.value =
      o && o.value !== ''
        ? o.textContent.trim()
        : '';

  }


  function render(filter) {

    const q =
      norm(filter || '');


    shown =
      q
        ? items.filter(
            i =>
              norm(i.label)
                .includes(q)
          )
        : items.slice();


    list.innerHTML = '';


    shown.forEach(item => {

      const li =
        document.createElement('li');

      li.textContent =
        item.label;

      li.setAttribute(
        'role',
        'option'
      );


      /*
       * pointerdown fires before blur,
       * so the selection isn't lost.
       */

      li.addEventListener(
        'pointerdown',
        e => {

          e.preventDefault();

          pick(item);

        }
      );


      list.appendChild(li);

    });


    if (!shown.length) {

      const li =
        document.createElement('li');

      li.className =
        'combo-empty';

      li.textContent =
        'No matches';

      list.appendChild(li);

    }


    setActive(
      shown.length && q
        ? 0
        : -1
    );

  }


  function setActive(i) {

    active = i;


    Array.from(
      list.children
    ).forEach(
      (li, idx) =>
        li.classList.toggle(
          'active',
          idx === i
        )
    );


    const el =
      list.children[i];


    if (
      el &&
      el.scrollIntoView
    ) {

      el.scrollIntoView({
        block: 'nearest'
      });

    }

  }


  function open(filter) {

    render(filter);

    list.hidden = false;

  }


  function close() {

    list.hidden = true;

    syncInput();

  }


  function pick(item) {

    sel.value =
      item.value;

    input.value =
      item.label;

    list.hidden = true;

    input.blur();


    sel.dispatchEvent(
      new Event(
        'change',
        {
          bubbles: true
        }
      )
    );

  }


  input.addEventListener(
    'focus',
    () => {

      input.select();

      open('');

    }
  );


  input.addEventListener(
    'input',
    () =>
      open(input.value)
  );


  input.addEventListener(
    'blur',
    close
  );


  input.addEventListener(
    'keydown',
    e => {

      if (e.key === 'ArrowDown') {

        e.preventDefault();

        if (list.hidden) {
          open(input.value);
        } else {
          setActive(
            Math.min(
              active + 1,
              shown.length - 1
            )
          );
        }

      }

      else if (e.key === 'ArrowUp') {

        e.preventDefault();

        setActive(
          Math.max(
            active - 1,
            0
          )
        );

      }

      else if (e.key === 'Enter') {

        e.preventDefault();

        if (shown[active]) {

          pick(
            shown[active]
          );

        }

        else if (
          shown.length === 1
        ) {

          pick(
            shown[0]
          );

        }

      }

      else if (e.key === 'Escape') {

        input.blur();

      }

    }
  );


  /*
   * Options are filled after the API
   * call returns, so watch for changes.
   */

  new MutationObserver(
    readOptions
  ).observe(
    sel,
    {
      childList: true
    }
  );


  readOptions();

}


/* ============================================================
 * Initialise searchable selects
 * ============================================================ */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    document
      .querySelectorAll(
        'select:not([data-plain])'
      )
      .forEach(
        makeSearchableSelect
      );

  }
);
