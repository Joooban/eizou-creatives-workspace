import { useState } from "react";
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

  const events: CalendarEvent[] = tasks
    .filter((task) => task.deadline !== null)
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
        style={{ height: "100%" }}
      />
    </div>
  );
}

export default TaskCalendar;