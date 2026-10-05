// Gives every table cell a data-c="0..12" tag so styles.css can colour it by column.
// Runs on every page and re-runs whenever a table is built, sorted or refilled.
(function () {
  const PALETTE_SIZE = 13;   // number of [data-c] colours defined in styles.css

  function paintTables() {
    document.querySelectorAll('table').forEach(table => {
      const headRow = table.tHead && table.tHead.rows[0];
      if (!headRow) return;
      const n = headRow.cells.length;

      // Map column i of n onto the 13 colours, spread evenly (13 columns map one-to-one)
      const pick = i => (n <= 1 ? 0 : Math.round(i * (PALETTE_SIZE - 1) / (n - 1)));

      Array.from(table.rows).forEach(row => {
        Array.from(row.cells).forEach((cell, i) => {
          const k = String(pick(Math.min(i, n - 1)));
          if (cell.dataset.c !== k) cell.dataset.c = k;
        });
      });
    });
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; paintTables(); });
  }

  function start() {
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    paintTables();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
