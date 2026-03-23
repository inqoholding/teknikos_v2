import { Link, useParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { useCustomerQuery } from "../api/hooks";
import { PageError, PageLoader } from "../components/PageState";
import { SectionCard } from "../components/UI";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const customerQuery = useCustomerQuery(id);

  if (customerQuery.isLoading) {
    return <PageLoader title="Memuat detail pelanggan..." />;
  }

  if (customerQuery.error || !customerQuery.data) {
    return <PageError message={getErrorMessage(customerQuery.error)} />;
  }

  const customer = customerQuery.data;
  const mapQuery = encodeURIComponent(customer.address);

  return (
    <div className="page-stack">
      <div className="detail-grid">
        <div className="detail-grid__main">
          <SectionCard
            title={customer.name}
            action={<Link className="btn btn--primary" to={`/jobs?create=1&customerId=${customer.id}`}>Buat Job Baru</Link>}
          >
            <div className="detail-pair">
              <span>{customer.phone} · {customer.email}</span>
              <span>{customer.address}</span>
            </div>
          </SectionCard>

          <SectionCard title="Unit Info">
            <div className="cards-grid cards-grid--two">
              {customer.units.map((unit) => (
                <article key={unit} className="sub-card">
                  <strong>{unit.split("·")[0]?.trim()}</strong>
                  <span>{unit.split("·")[1]?.trim()}</span>
                </article>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Riwayat Job">
            <div className="line-items">
              {customer.jobHistory.map((job) => (
                <div key={job.id}>
                  <span>{job.number} · {job.title}</span>
                  <strong>{job.status.replaceAll("_", " ")}</strong>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Lokasi Pelanggan" description="Buka alamat client lebih cepat untuk survey, visit, atau follow up job berikutnya.">
            <div className="map-preview map-preview--embed">
              <iframe
                title={`Map ${customer.name}`}
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a className="inline-link" href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer">
              Buka alamat di Google Maps
            </a>
          </SectionCard>
        </div>

        <div className="detail-grid__side">
          <SectionCard title="Kontrak Aktif">
            {customer.contracts.length === 0 ? (
              <div className="callout">
                <div>
                  <strong>Belum ada kontrak</strong>
                  <p>Pelanggan ini belum punya kontrak aktif.</p>
                </div>
              </div>
            ) : null}
            {customer.contracts.map((contract) => (
              <div key={contract.id} className="callout callout--success">
                <div>
                  <strong>{contract.plan}</strong>
                  <p>{contract.value} · Next {contract.nextService} · {contract.status}</p>
                </div>
              </div>
            ))}
          </SectionCard>
          <SectionCard title="Shortcut">
            <div className="action-stack">
              <a className="btn btn--secondary" href={`https://wa.me/${customer.phone.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer">
                Kirim Reminder WA
              </a>
              <a className="btn btn--secondary" href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer">
                Buka Maps
              </a>
              <Link className="btn btn--secondary" to="/invoices">Lihat Invoice</Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
