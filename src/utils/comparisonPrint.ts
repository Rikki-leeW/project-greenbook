/** Build disposable native print tables from the rendered comparison grids.
 * Keeps the same content and photos while allowing repeated column headings,
 * automatic row heights and page fragmentation without screen scroll boxes.
 * The returned cleanup restores the original DOM after the print dialog closes.
 */
export function prepareComparisonPrintTables(report: HTMLElement): () => void {
  const tables: HTMLTableElement[] = [];
  const shells = report.querySelectorAll<HTMLElement>(
    '.sprig-comparison-shell, .sprig-age-comparison-shell, .sprig-visual-comparison-shell',
  );

  shells.forEach(shell => {
    const labels = shell.querySelector<HTMLElement>(
      '.sprig-comparison-labels, .sprig-age-comparison-labels, .sprig-visual-comparison-labels',
    );
    const columns = shell.querySelector<HTMLElement>(
      '.sprig-comparison-columns, .sprig-age-comparison-columns, .sprig-visual-comparison-columns',
    );
    if (!labels || !columns || !columns.children.length) return;

    const table = document.createElement('table');
    table.className = 'sprig-comparison-print-table';
    const heading = table.createTHead().insertRow();
    const body = table.createTBody();
    const sources = [labels, ...Array.from(columns.children)];

    sources.forEach(source => {
      const cell = document.createElement('th');
      cell.scope = 'col';
      copyContent(source.children[0], cell);
      heading.appendChild(cell);
    });

    for (let index = 1; index < labels.children.length; index++) {
      const row = body.insertRow();
      sources.forEach((source, column) => {
        const cell = document.createElement(column === 0 ? 'th' : 'td');
        if (cell instanceof HTMLTableCellElement && column === 0) cell.scope = 'row';
        copyContent(source.children[index], cell);
        row.appendChild(cell);
      });
    }

    shell.classList.add('sprig-comparison-shell--print-ready');
    shell.appendChild(table);
    tables.push(table);
  });

  return () => {
    tables.forEach(table => {
      table.parentElement?.classList.remove('sprig-comparison-shell--print-ready');
      table.remove();
    });
  };
}

function copyContent(source: Element | undefined, target: HTMLElement) {
  if (!source) return;
  Array.from(source.childNodes).forEach(node => target.appendChild(node.cloneNode(true)));
  // Cloned galleries need fresh IDs so the temporary DOM has no duplicate IDs.
  target.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
}
