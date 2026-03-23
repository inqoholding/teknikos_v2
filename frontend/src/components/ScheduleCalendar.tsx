import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "./UI";

export interface CalendarItem {
  id: string;
  title: string;
  scheduleAt: string;
  deadlineAt?: string | null;
  href?: string;
  subtitle?: string;
  status?: string;
  priority?: "Normal" | "Urgent";
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfCalendar(date: Date) {
  const monthStart = startOfMonth(date);
  const start = new Date(monthStart);
  start.setDate(start.getDate() - monthStart.getDay());
  return start;
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatDayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getDeadlineTone(deadlineAt?: string | null) {
  if (!deadlineAt) return "neutral";
  const now = Date.now();
  const deadline = new Date(deadlineAt).getTime();
  if (deadline < now) return "danger";
  if (deadline - now <= 24 * 60 * 60 * 1000) return "warning";
  return "success";
}

export function ScheduleCalendar({
  items,
  emptyLabel = "Belum ada jadwal pada tanggal ini.",
}: {
  items: CalendarItem[];
  emptyLabel?: string;
}) {
  const initialMonth = items.length > 0 ? new Date(items[0].scheduleAt) : new Date();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(initialMonth));
  const [selectedDayKey, setSelectedDayKey] = useState(formatDayKey(new Date()));

  const days = useMemo(() => {
    const start = startOfCalendar(currentMonth);
    return Array.from({ length: 42 }).map((_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [currentMonth]);

  const itemsByDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const item of items) {
      const key = formatDayKey(new Date(item.scheduleAt));
      map.set(key, [...(map.get(key) ?? []), item]);
    }

    for (const [key, groupedItems] of map) {
      groupedItems.sort((left, right) => new Date(left.scheduleAt).getTime() - new Date(right.scheduleAt).getTime());
      map.set(key, groupedItems);
    }

    return map;
  }, [items]);

  const selectedItems = itemsByDay.get(selectedDayKey) ?? [];
  const today = new Date();

  return (
    <div className="schedule-calendar">
      <div className="schedule-calendar__toolbar">
        <button type="button" className="btn btn--secondary" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
          Bulan Sebelumnya
        </button>
        <strong>{formatMonthLabel(currentMonth)}</strong>
        <button type="button" className="btn btn--secondary" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
          Bulan Berikutnya
        </button>
      </div>

      <div className="schedule-calendar__weekdays">
        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="schedule-calendar__grid">
        {days.map((day) => {
          const key = formatDayKey(day);
          const dayItems = itemsByDay.get(key) ?? [];
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          return (
            <button
              key={key}
              type="button"
              className={`schedule-calendar__day ${isCurrentMonth ? "" : "schedule-calendar__day--muted"} ${selectedDayKey === key ? "schedule-calendar__day--active" : ""} ${isSameDay(day, today) ? "schedule-calendar__day--today" : ""}`}
              onClick={() => setSelectedDayKey(key)}
            >
              <span>{day.getDate()}</span>
              {dayItems.length > 0 ? <small>{dayItems.length} tugas</small> : <small>-</small>}
            </button>
          );
        })}
      </div>

      <div className="schedule-calendar__agenda">
        {selectedItems.length > 0 ? (
          selectedItems.map((item) => {
            const body = (
              <div className="calendar-agenda-card">
                <div className="calendar-agenda-card__head">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.subtitle ?? "-"}</p>
                  </div>
                  <div className="calendar-agenda-card__meta">
                    {item.priority ? <Badge tone={item.priority === "Urgent" ? "danger" : "neutral"}>{item.priority}</Badge> : null}
                    {item.status ? <Badge tone={item.status === "done" ? "success" : item.status === "pending" ? "warning" : "info"}>{item.status.replaceAll("_", " ")}</Badge> : null}
                  </div>
                </div>
                <div className="calendar-agenda-card__row">
                  <span>Jadwal</span>
                  <strong>{formatTime(item.scheduleAt)}</strong>
                </div>
                <div className="calendar-agenda-card__row">
                  <span>Deadline</span>
                  <strong>{item.deadlineAt ? new Date(item.deadlineAt).toLocaleString("id-ID") : "Belum diatur"}</strong>
                </div>
              </div>
            );

            return item.href ? (
              <Link key={item.id} to={item.href}>
                {body}
              </Link>
            ) : (
              <div key={item.id}>{body}</div>
            );
          })
        ) : (
          <p className="chart-helper">{emptyLabel}</p>
        )}
      </div>
    </div>
  );
}

export function DeadlineList({
  items,
  emptyLabel = "Belum ada deadline aktif.",
}: {
  items: CalendarItem[];
  emptyLabel?: string;
}) {
  const deadlineItems = [...items]
    .filter((item) => item.deadlineAt)
    .sort((left, right) => new Date(left.deadlineAt!).getTime() - new Date(right.deadlineAt!).getTime());

  if (deadlineItems.length === 0) {
    return <p className="chart-helper">{emptyLabel}</p>;
  }

  return (
    <div className="deadline-list">
      {deadlineItems.map((item) => {
        const body = (
          <div className="deadline-card">
            <div>
              <strong>{item.title}</strong>
              <p>{item.subtitle ?? "-"}</p>
            </div>
            <div className="deadline-card__meta">
              <Badge tone={getDeadlineTone(item.deadlineAt)}>{new Date(item.deadlineAt!).toLocaleString("id-ID")}</Badge>
              {item.priority ? <small>{item.priority}</small> : null}
            </div>
          </div>
        );

        return item.href ? (
          <Link key={item.id} to={item.href}>
            {body}
          </Link>
        ) : (
          <div key={item.id}>{body}</div>
        );
      })}
    </div>
  );
}
