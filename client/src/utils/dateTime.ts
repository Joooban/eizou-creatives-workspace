// Deadlines/scheduled dates are stored as timestamps, but this app treats the
// digits themselves as the wall-clock value everywhere (the same convention the
// date-only fields already relied on) rather than converting through the
// viewer's local timezone. Keeping read/write/display all on this convention is
// what keeps a task's time consistent between the edit form, the list, and the
// dashboards regardless of who's viewing it.

export function toDateTimeInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export function toIsoUtc(datetimeLocalValue: string): string {
  return datetimeLocalValue.length === 16 ? `${datetimeLocalValue}:00.000Z` : `${datetimeLocalValue}.000Z`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
  return `${date}, ${time}`;
}

// Libraries like react-big-calendar position events using the *local* getters
// on a Date object, which would otherwise pull the stored value through the
// viewer's real timezone and disagree with formatDateTime above. This rebuilds
// a Date whose local getters return the same wall-clock digits we display
// everywhere else, so the calendar lines up with the rest of the app.
export function toNaiveLocalDate(iso: string): Date {
  const utc = new Date(iso);
  return new Date(
    utc.getUTCFullYear(),
    utc.getUTCMonth(),
    utc.getUTCDate(),
    utc.getUTCHours(),
    utc.getUTCMinutes(),
    utc.getUTCSeconds()
  );
}
