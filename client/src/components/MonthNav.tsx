import { MONTH_NAMES } from "../utils/dateTime";

interface MonthNavProps {
  month: number;
  year: number;
  currentMonth: number;
  currentYear: number;
  onChange: (month: number, year: number) => void;
}

export function MonthNav({ month, year, currentMonth, currentYear, onChange }: MonthNavProps) {
  const isCurrent = month === currentMonth && year === currentYear;

  function shift(delta: number) {
    const d = new Date(year, month - 1 + delta, 1);
    onChange(d.getMonth() + 1, d.getFullYear());
  }

  return (
    <div className="month-nav">
      <button className="btn btn-secondary btn-sm" onClick={() => shift(-1)} aria-label="Previous month">
        ‹
      </button>
      <span className="month-nav-label">
        {MONTH_NAMES[month - 1]} {year}
      </span>
      <button className="btn btn-secondary btn-sm" onClick={() => shift(1)} aria-label="Next month">
        ›
      </button>
      {!isCurrent && (
        <button className="btn btn-secondary btn-sm" onClick={() => onChange(currentMonth, currentYear)}>
          This month
        </button>
      )}
    </div>
  );
}
