import { whatsappDonts, whatsappRules } from "./settings/whatsappContent";

export default function SettingsWhatsappRulesPage() {
  return (
    <div className="page-stack">
      <section className="surface-card">
        <div className="section-card__header">
          <div>
            <h3>Rules WhatsApp</h3>
            <p>Aturan singkat supaya nomor bisnis lebih aman saat dipakai di Coreveta.</p>
          </div>
        </div>

        <div className="rules-grid">
          {whatsappRules.map((rule) => (
            <article key={rule.title} className="rule-card">
              <strong>{rule.title}</strong>
              <p>{rule.description}</p>
            </article>
          ))}
        </div>

        <div className="callout callout--warning">
          <strong>Yang sebaiknya dihindari</strong>
          <ul className="settings-list">
            {whatsappDonts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <p className="settings-source-note">
          Ringkasan aturan ini mengacu pada panduan banned dari Fonnte dan disederhanakan untuk user Coreveta.
        </p>
      </section>
    </div>
  );
}
