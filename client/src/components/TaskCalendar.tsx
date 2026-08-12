import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { Task } from "../types/task";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
  getDay,
  locales,
});

type TaskCalendarProps = {
  tasks: Task[];
};

type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: Task;
};

type ClientOption = {
  id: number;
  name: string;
  color: string;
};

function contrastText(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#0B0B0C";
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0B0B0C" : "#F5F4F2";
}

function CalendarEventItem({ event }: { event: CalendarEvent }) {
  const task = event.resource;

  if (task.publishedLinks.length > 0) {
    return (
      <span>
        {event.title}{" "}
          {task.publishedLinks.map((link) => (
            <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rbc-event-link"
            onClick={(e) => e.stopPropagation()}
          >
            [{link.platform}]
          </a>
        ))}
      </span>
    );
  }

  return <span>{event.title}</span>;
}

function TaskCalendar({ tasks }: TaskCalendarProps) {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState<Date>(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [hiddenClientIds, setHiddenClientIds] = useState<Set<number>>(new Set());

  const clientOptions: ClientOption[] = useMemo(() => {
    const map = new Map<number, ClientOption>();
    tasks.forEach((task) => {
      map.set(task.client.id, { id: task.client.id, name: task.client.name, color: task.client.color });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks]);

  function toggleClient(id: number) {
    setHiddenClientIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const events: CalendarEvent[] = tasks
    .filter((task) => task.deadline !== null && !hiddenClientIds.has(task.client.id))
    .map((task) => {
      const deadline = new Date(task.deadline as string);
      return {
        title: `${task.title} (${task.client.name})`,
        start: deadline,
        end: deadline,
        allDay: true,
        resource: task,
      };
    });

  return (
    <div>
      <div className="calendar-toolbar">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowFilters((s) => !s)}>
          Filter by Client
          {hiddenClientIds.size > 0 ? ` (${clientOptions.length - hiddenClientIds.size}/${clientOptions.length})` : ""}
        </button>
      </div>

      {showFilters && (
        <div className="client-filter-row">
          {clientOptions.length === 0 ? (
            <span className="empty">No clients yet.</span>
          ) : (
            clientOptions.map((client) => {
              const hidden = hiddenClientIds.has(client.id);
              return (
                <button
                  key={client.id}
                  type="button"
                  className={`client-chip ${hidden ? "inactive" : ""}`}
                  onClick={() => toggleClient(client.id)}
                >
                  <span className="client-chip-dot" style={{ backgroundColor: client.color }} />
                  {client.name}
                </button>
              );
            })
          )}
        </div>
      )}

      <div style={{ height: 600, marginBottom: "2rem" }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={["month", "day", "week", "agenda"]}
          view={view}
          onView={(newView) => setView(newView)}
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          components={{ event: CalendarEventItem }}
          eventPropGetter={(event) => {
            const color = (event as CalendarEvent).resource.client.color || "#8B8B90";
            return { style: { backgroundColor: color, color: contrastText(color) } };
          }}
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
}

export default TaskCalendar;
