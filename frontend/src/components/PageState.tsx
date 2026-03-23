import { Link } from "react-router-dom";

export function PageLoader({ title = "Memuat data..." }: { title?: string }) {
  return (
    <div className="page-state">
      <div className="page-state__dot" />
      <strong>{title}</strong>
      <p>Tunggu sebentar, kami sedang mengambil data terbaru dari server.</p>
    </div>
  );
}

export function PageError({
  title = "Terjadi kendala",
  message,
  actionLabel,
  actionHref,
}: {
  title?: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="page-state page-state--error">
      <strong>{title}</strong>
      <p>{message}</p>
      {actionLabel && actionHref ? (
        <Link to={actionHref} className="btn btn--secondary">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
