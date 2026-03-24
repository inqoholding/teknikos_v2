import { useMemo, useState, useTransition } from "react";
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

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
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
  const [isPending, startTransition] = useTransition();

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
  const selectedDate = days.find((day) => formatDayKey(day) === selectedDayKey) ?? today;
  const monthItems = items.filter((item) => {
    const date = new Date(item.scheduleAt);
    return date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear();
  });
  const urgentMonthCount = monthItems.filter((item) => item.priority === "Urgent").length;
  const upcomingDayKeys = Array.from(itemsByDay.keys())
    .map((key) => ({ key, date: new Date(key) }))
    .filter(({ date }) => date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear())
    .sort((left, right) => left.date.getTime() - right.date.getTime())
    .slice(0, 4);

  return (
    <div className="schedule-calendar">
      <div className="schedule-calendar__toolbar">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() =>
            startTransition(() => {
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
            })
          }
        >
          Bulan Sebelumnya
        </button>
        <strong>{formatMonthLabel(currentMonth)}</strong>
        <div className="button-row button-row--left">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() =>
              startTransition(() => {
                setCurrentMonth(startOfMonth(today));
                setSelectedDayKey(formatDayKey(today));
              })
            }
          >
            Hari Ini
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() =>
              startTransition(() => {
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
              })
            }
          >
            Bulan Berikutnya
          </button>
        </div>
      </div>

      <div className="schedule-calendar__summary">
        <div className="schedule-calendar__summary-card">
          <span>Hari dipilih</span>
          <strong>{formatDayLabel(selectedDate)}</strong>
          <small>{selectedItems.length} tugas pada tanggal ini</small>
        </div>
        <div className="schedule-calendar__summary-card">
          <span>Agenda bulan ini</span>
          <strong>{monthItems.length} tugas</strong>
          <small>{urgentMonthCount} prioritas urgent</small>
        </div>
        <div className="schedule-calendar__summary-card">
          <span>Status tampilan</span>
          <strong>{isPending ? "Memuat..." : "Siap dipilih"}</strong>
          <small>Kalender sekarang bisa drill-down per hari</small>
        </div>
      </div>

      {upcomingDayKeys.length > 0 ? (
        <div className="schedule-calendar__shortcut-row">
          {upcomingDayKeys.map(({ key, date }) => (
            <button
              key={key}
              type="button"
              className={`schedule-calendar__shortcut ${selectedDayKey === key ? "schedule-calendar__shortcut--active" : ""}`}
              onClick={() =>
                startTransition(() => {
                  setSelectedDayKey(key);
                })
              }
            >
              <span>{formatDayLabel(date)}</span>
              <strong>{(itemsByDay.get(key) ?? []).length} tugas</strong>
            </button>
          ))}
        </div>
      ) : null}

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
              onClick={() =>
                startTransition(() => {
                  setSelectedDayKey(key);
                })
              }
            >
              <span>{day.getDate()}</span>
              {dayItems.length > 0 ? (
                <>
                  <small>{dayItems.length} tugas</small>
                  <div className="schedule-calendar__day-dots">
                    {dayItems.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className={`schedule-calendar__day-dot ${item.priority === "Urgent" ? "schedule-calendar__day-dot--urgent" : ""}`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <small>-</small>
              )}
            </button>
          );
        })}
      </div>

      <div className="schedule-calendar__agenda">
        <div className="schedule-calendar__agenda-head">
          <div>
            <strong>{formatDayLabel(selectedDate)}</strong>
            <p>{selectedItems.length > 0 ? "Agenda detail hari terpilih." : emptyLabel}</p>
          </div>
          {selectedItems.length > 0 ? <Badge tone="info">{selectedItems.length} tugas</Badge> : null}
        </div>
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
