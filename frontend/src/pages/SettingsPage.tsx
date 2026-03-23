import { FormEvent, useEffect, useState } from "react";
import { getErrorMessage } from "../api/client";
import { useBusinessQuery, useUpdateBusinessMutation } from "../api/hooks";
import { PageError, PageLoader } from "../components/PageState";
import { EmptyAction, SectionCard } from "../components/UI";

export default function SettingsPage() {
  const businessQuery = useBusinessQuery();
  const updateBusinessMutation = useUpdateBusinessMutation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (businessQuery.data) {
      setName(businessQuery.data.name);
      setPhone(businessQuery.data.phone ?? "");
      setAddress(businessQuery.data.address ?? "");
    }
  }, [businessQuery.data]);

  if (businessQuery.isLoading) {
    return <PageLoader title="Memuat pengaturan..." />;
  }

  if (businessQuery.error || !businessQuery.data) {
    return <PageError message={getErrorMessage(businessQuery.error)} />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateBusinessMutation.mutateAsync({ name, phone, address });
  }

  return (
    <div className="page-stack">
      <form className="detail-grid" onSubmit={handleSubmit}>
        <div className="detail-grid__main">
          <SectionCard title="Profil Bisnis">
            <div className="field-grid">
              <label className="field">
                <span>Nama bisnis</span>
                <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <label className="field">
                <span>WhatsApp</span>
                <input type="text" value={phone} onChange={(event) => setPhone(event.target.value)} />
              </label>
            </div>
            <label className="field">
              <span>Alamat bisnis</span>
              <textarea value={address} onChange={(event) => setAddress(event.target.value)} />
            </label>
            <div className="callout callout--warning">
              <strong>Paket aktif: {businessQuery.data.plan}</strong>
              <p>
                Status saat ini {businessQuery.data.subscriptionStatusLabel ?? "Aktif"}.
                Perubahan paket dikelola dari admin subscription console agar entitlement client tetap rapi.
              </p>
            </div>
            {updateBusinessMutation.error ? <p className="form-error">{getErrorMessage(updateBusinessMutation.error)}</p> : null}
          </SectionCard>
          <SectionCard title="Preferensi Invoice">
            <div className="summary-list">
              <div><span>Paket saat ini</span><strong>{businessQuery.data.plan}</strong></div>
              <div><span>Auto-generate invoice saat job done</span><strong>Aktif</strong></div>
              <div><span>Jatuh tempo default</span><strong>7 hari</strong></div>
            </div>
          </SectionCard>
        </div>
        <div className="detail-grid__side">
          <SectionCard title="Notifikasi">
            <div className="summary-list">
              <div><span>Reminder kontrak servis</span><strong>ON</strong></div>
              <div><span>Low stock alert</span><strong>ON</strong></div>
              <div><span>Daily ringkasan owner</span><strong>OFF</strong></div>
            </div>
          </SectionCard>
          <SectionCard title="Aksi">
            <div className="action-stack">
              <button className="btn btn--primary" type="submit" disabled={updateBusinessMutation.isPending}>
                {updateBusinessMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
              <EmptyAction>Logout Semua Perangkat</EmptyAction>
            </div>
          </SectionCard>
        </div>
      </form>
    </div>
  );
}
