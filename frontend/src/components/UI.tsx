import { MotionConfig, motion } from "framer-motion";
import { ReactNode, useMemo, useState } from "react";
import { formatRupiah } from "../utils/currency";

type BadgeTone = "success" | "warning" | "info" | "neutral" | "danger";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`surface-card ${className}`}>
      <div className="section-card__header">
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  trend,
  icon,
  type = "default",
}: {
  label: string;
  value: string;
  hint: string;
  trend?: { value: string; up: boolean };
  icon?: ReactNode;
  type?: "default" | "success" | "warning" | "info";
}) {
  return (
    <article className={`stat-card stat-card--${type}`}>
      <div className="flex justify-between items-start">
        {icon ? <div className="stat-card__icon">{icon}</div> : null}
        {trend ? (
          <div className={`stat-card__trend stat-card__trend--${trend.up ? "up" : "down"}`}>
            {trend.up ? "↑" : "↓"} {trend.value}
          </div>
        ) : null}
      </div>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
      <div className={`stat-card__hint stat-card__hint--${type === "default" ? "neutral" : type}`}>
        {hint}
      </div>
    </article>
  );
}

export function MiniBarChart({
  items,
  className = "",
  onSelectionChange,
}: {
  items: Array<{ label: string; value: number; valueLabel?: string }>;
  className?: string;
  onSelectionChange?: (item: { label: string; value: number; valueLabel?: string }) => void;
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);
  const hasRevenue = items.some((item) => item.value > 0);
  const totalValue = items.reduce((sum, item) => sum + item.value, 0);
  const peakItem =
    items.reduce<{ label: string; value: number; valueLabel?: string } | null>(
      (currentPeak, item) => {
        if (!currentPeak || item.value > currentPeak.value) {
          return item;
        }
        return currentPeak;
      },
      null,
    ) ?? items[0];
  const [selectedLabel, setSelectedLabel] = useState(peakItem?.label ?? items[0]?.label ?? "");
  const selectedItem = useMemo(
    () => items.find((item) => item.label === selectedLabel) ?? peakItem ?? items[0],
    [items, peakItem, selectedLabel],
  );

  function selectItem(item: { label: string; value: number; valueLabel?: string }) {
    setSelectedLabel(item.label);
    onSelectionChange?.(item);
  }

  return (
    <MotionConfig transition={{ type: "spring", stiffness: 320, damping: 28 }} reducedMotion="user">
      <div className={`bar-chart-wrap ${className}`.trim()}>
        <div className="bar-chart">
          {items.map((item) => {
            const isPeak = peakItem?.label === item.label;
            const isSelected = selectedItem?.label === item.label;

            return (
              <motion.button
                key={item.label}
                type="button"
                className={`bar-chart__item bar-chart__item--interactive ${isSelected ? "bar-chart__item--selected" : ""}`}
                onClick={() => selectItem(item)}
                onHoverStart={() => selectItem(item)}
                onFocus={() => selectItem(item)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                aria-label={`${item.label} ${item.valueLabel ?? item.value}`}
              >
                {isSelected ? (
                  <motion.div
                    layoutId="bar-chart-tooltip"
                    className="bar-chart__tooltip"
                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.valueLabel ?? item.value}</span>
                  </motion.div>
                ) : null}
                <small>{item.valueLabel ?? item.value}</small>
                <motion.div
                  className={`bar-chart__bar ${isPeak ? "bar-chart__bar--peak" : ""} ${isSelected ? "bar-chart__bar--selected" : ""} ${!hasRevenue ? "bar-chart__bar--empty" : ""}`}
                  animate={{ 
                    height: `${Math.max((item.value / maxValue) * 100, 14)}%`,
                    background: isSelected ? "var(--green-dark)" : isPeak ? "var(--green-default)" : "var(--green-mid)"
                  }}
                />
                <span style={{ opacity: isSelected ? 1 : 0.7, fontWeight: isSelected ? 700 : 400 }}>{item.label}</span>
              </motion.button>
            );
          })}
        </div>
        <div className="bar-chart-summary">
          <div className="bar-chart-summary__card glass-card">
            <span>Total 7 hari</span>
            <strong>{hasRevenue ? formatRupiah(totalValue) : "Belum ada pemasukan"}</strong>
          </div>
          <div className="bar-chart-summary__card">
            <span>Hari dipilih</span>
            <strong>{selectedItem?.label ?? "-"}</strong>
            <small>{selectedItem?.valueLabel ?? selectedItem?.value ?? 0}</small>
          </div>
          <div className="bar-chart-summary__card">
            <span>Puncak tertinggi</span>
            <strong>{peakItem?.label ?? "-"}</strong>
            <small>{peakItem?.valueLabel ?? peakItem?.value ?? 0}</small>
          </div>
        </div>
        {!hasRevenue ? <p className="chart-helper">Revenue 7 hari akan muncul setelah ada invoice berstatus lunas.</p> : null}
      </div>
    </MotionConfig>
  );
}

export function DonutSummary({
  items,
}: {
  items: Array<{ label: string; value: number; color?: string }>;
}) {
  const palette = ["var(--amber-default)", "#2b7bbb", "#4b87cb", "var(--green-default)", "#beb9ac", "#d86464"];
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  const gradient = items
    .map((item, index) => {
      const start =
        items
          .slice(0, index)
          .reduce((sum, current) => sum + current.value, 0) / total;
      const end =
        items
          .slice(0, index + 1)
          .reduce((sum, current) => sum + current.value, 0) / total;

      return `${item.color ?? palette[index % palette.length]} ${Math.round(start * 100)}% ${Math.round(end * 100)}%`;
    })
    .join(", ");

  return (
    <div className="donut-summary glass-card">
      <div className="donut-summary__chart" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="donut-summary__center">
          <strong>{total}</strong>
          <span>Total Tugas</span>
        </div>
      </div>
      <div className="legend-list">
        {items.map((item, index) => (
          <div key={item.label} className="legend-list__item">
            <div className="legend-list__label">
              <span
                className="legend-list__dot"
                style={{ background: item.color ?? palette[index % palette.length], boxShadow: `0 0 10px ${item.color ?? palette[index % palette.length]}66` }}
              />
              {item.label}
            </div>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyAction({
  children,
  primary = false,
  onClick,
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  primary?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      className={primary ? "btn btn--primary" : "btn btn--secondary"}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-slate-200 bg-slate-50/50 border-dashed w-full my-4">
      <div className="flex h-16 w-16 mb-4 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-400">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="4" ry="4" />
          <line x1="9" x2="15" y1="9" y2="9" />
          <line x1="9" x2="15" y1="15" y2="15" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
