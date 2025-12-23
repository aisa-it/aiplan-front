export function highlightWeekendInHeader(container: HTMLElement) {
  const headerDates = container.querySelectorAll<HTMLDivElement>(
    '.grid-header .lower-text[class*="date_"]',
  );

  headerDates.forEach((el) => {
    const dateClass = Array.from(el.classList).find((c) =>
      c.startsWith('date_'),
    );
    if (!dateClass) return;

    const dateStr = dateClass.replace('date_', '');
    if (isWeekend(dateStr)) {
      el.classList.add('weekend-date');
    }
  });
}

function isWeekend(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDay();
  return day === 0 || day === 6;
}
