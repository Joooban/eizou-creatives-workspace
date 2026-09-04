import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Task } from "../types/task";

type EventPopoverProps = {
  task: Task;
  x: number;
  y: number;
  onClose: () => void;
  onEdit: () => void;
};

const POPOVER_WIDTH = 300;

function EventPopover({ task, x, y, onClose, onEdit }: EventPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x, top: y, visible: false });

  useLayoutEffect(() => {
    const height = ref.current?.getBoundingClientRect().height ?? 0;
    const left = Math.min(Math.max(8, x), window.innerWidth - POPOVER_WIDTH - 8);
    const top = Math.min(Math.max(8, y), window.innerHeight - height - 8);
    setPos({ left, top, visible: true });
  }, [x, y]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    // Defer so the click that opened the popover doesn't immediately close it.
    const id = window.setTimeout(() => window.addEventListener("mousedown", onPointerDown), 0);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
      window.clearTimeout(id);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="event-popover"
      style={{ left: pos.left, top: pos.top, width: POPOVER_WIDTH, visibility: pos.visible ? "visible" : "hidden" }}
    >
      <div className="event-popover-header">
        <span className="event-popover-title">{task.title}</span>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <div className="event-popover-meta">
        {task.client.name} · {task.assignedTo?.name ?? "Unassigned"}
      </div>

      <div className="event-popover-links">
        {task.publishedLinks.length === 0 ? (
          <p className="empty-state">No published links yet.</p>
        ) : (
          task.publishedLinks.map((link) => (
            <div key={link.id} className="event-popover-link">
              <span className="event-popover-link-platform">{link.platform}</span>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.url}
              </a>
            </div>
          ))
        )}
      </div>

      <div className="event-popover-footer">
        <button type="button" className="btn btn-primary btn-sm" onClick={onEdit}>
          Edit
        </button>
      </div>
    </div>
  );
}

export default EventPopover;
