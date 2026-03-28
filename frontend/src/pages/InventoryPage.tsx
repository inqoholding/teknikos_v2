import { FormEvent, useState } from "react";
import { getErrorMessage, isApiErrorStatus } from "../api/client";
import { useAdjustInventoryMutation, useBusinessQuery, useCreateInventoryMutation, useInventoryQuery } from "../api/hooks";
import { PageError, PageLoader } from "../components/PageState";
import { Badge, EmptyAction, SectionCard, StatCard } from "../components/UI";
import { formatRupiah } from "../utils/currency";

export default function InventoryPage() {
  const businessQuery = useBusinessQuery();
  const inventoryQuery = useInventoryQuery();
  const adjustMutation = useAdjustInventoryMutation();
  const createInventoryMutation = useCreateInventoryMutation();
  const [selectedId, setSelectedId] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Sparepart");
  const [stock, setStock] = useState("0");
  const [minStock, setMinStock] = useState("1");
  const [buyPrice, setBuyPrice] = useState("0");
  const [sellPrice, setSellPrice] = useState("0");

  if (inventoryQuery.isLoading) {
    return <PageLoader title="Memuat inventori..." />;
  }

  if (isApiErrorStatus(inventoryQuery.error, 403)) {
    return (
      <SectionCard title="Inventori Terkunci" description="Fitur ini aktif mulai paket Pro.">
        <div className="callout callout--warning">
          <strong>Paket aktif: {businessQuery.data?.plan ?? "Starter"}</strong>
          <p>
            Inventori dipakai untuk stok sparepart, penyesuaian service, dan alert low stock. Upgrade paket untuk membukanya.
          </p>
        </div>
      </SectionCard>
    );
  }

  if (inventoryQuery.error || !inventoryQuery.data) {
    return <PageError message={getErrorMessage(inventoryQuery.error)} />;
  }

  const inventory = inventoryQuery.data;
  const selectedItem = inventory.find((item) => item.id === selectedId) ?? inventory[0];
  const lowStockItems = inventory.filter((item) => item.status !== "Aman");
  const categoryCount = new Set(inventory.map((item) => item.category)).size;
  const inventoryValue = inventory.reduce((sum, item) => sum + item.buyPriceValue * item.stock, 0);

  async function handleCreateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createInventoryMutation.mutateAsync({
      name,
      sku,
      category,
      stock: Number(stock),
      minStock: Number(minStock),
      buyPrice: Number(buyPrice),
      sellPrice: Number(sellPrice),
    });
    setName("");
    setSku("");
    setCategory("Sparepart");
    setStock("0");
    setMinStock("1");
    setBuyPrice("0");
    setSellPrice("0");
    setShowCreate(false);
  }

  return (
    <div className="page-stack">
      <div className="stats-grid">
        <StatCard 
          label="Total Katalog" 
          value={String(inventory.length)} 
          hint="Item aktif" 
          type="info"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v18" />
              <rect x="5" y="8" width="14" height="10" rx="2" />
              <path d="M9 8v-2a3 3 0 1 1 6 0v2" />
            </svg>
          }
        />
        <StatCard 
          label="Kategori" 
          value={String(categoryCount)} 
          hint="Jenis stok" 
          type="default"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          }
        />
        <StatCard 
          label="Stok Rendah" 
          value={String(lowStockItems.length)} 
          hint="Perlu reorder" 
          type="warning" 
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />
        <StatCard 
          label="Nilai Stok" 
          value={formatRupiah(inventoryValue)} 
          hint="Estimasi modal" 
          type="success" 
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
      </div>

      {showCreate ? (
        <SectionCard title="Tambah Item Inventori" description="Masukkan data barang sekali, lalu stok bisa disesuaikan dari panel kanan atau otomatis dari detail service.">
          <form className="action-stack" onSubmit={handleCreateItem}>
            <div className="field-grid">
              <label className="field">
                <span>Nama item</span>
                <input value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
              <label className="field">
                <span>SKU</span>
                <input value={sku} onChange={(event) => setSku(event.target.value)} required />
              </label>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Kategori</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)} required>
                  <option value="Sparepart">Sparepart</option>
                  <option value="Jasa">Jasa / Service</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </label>
              {category !== "Jasa" && (
                <label className="field">
                  <span>Stok awal</span>
                  <input type="number" min="0" value={stock} onChange={(event) => setStock(event.target.value)} required />
                </label>
              )}
            </div>
            <div className="field-grid">
              {category !== "Jasa" ? (
                <>
                  <label className="field">
                    <span>Min stok</span>
                    <input type="number" min="0" value={minStock} onChange={(event) => setMinStock(event.target.value)} required />
                  </label>
                  <label className="field">
                    <span>Harga beli</span>
                    <input type="number" min="0" value={buyPrice} onChange={(event) => setBuyPrice(event.target.value)} required />
                  </label>
                </>
              ) : (
                <label className="field">
                  <span>Harga jual</span>
                  <input type="number" min="0" value={sellPrice} onChange={(event) => setSellPrice(event.target.value)} required />
                </label>
              )}
            </div>
            {category !== "Jasa" && (
              <label className="field">
                <span>Harga jual</span>
                <input type="number" min="0" value={sellPrice} onChange={(event) => setSellPrice(event.target.value)} required />
              </label>
            )}
            {createInventoryMutation.error ? <p className="form-error">{getErrorMessage(createInventoryMutation.error)}</p> : null}
            <div className="button-row button-row--left">
              <EmptyAction onClick={() => setShowCreate(false)}>Batal</EmptyAction>
              <EmptyAction primary type="submit" disabled={createInventoryMutation.isPending}>
                {createInventoryMutation.isPending ? "Menyimpan..." : "Simpan Item"}
              </EmptyAction>
            </div>
          </form>
        </SectionCard>
      ) : null}

      <div className="dashboard-grid">
        <SectionCard title="Daftar Inventori" action={<EmptyAction primary onClick={() => setShowCreate((current) => !current)}>{showCreate ? "Tutup Form" : "Tambah Item"}</EmptyAction>}>
          <div className="inventory-list">
            {inventory.map((item) => (
              <article key={item.id} className="inventory-card">
                <div className="inventory-card__head">
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.sku} · {item.category}</p>
                  </div>
                  <Badge tone={item.status === "Aman" ? "success" : item.status === "Rendah" ? "warning" : "danger"}>
                    {item.status}
                  </Badge>
                </div>
                <div className="inventory-card__meta">
                  {item.category === "Jasa" ? (
                    <span className="text-blue-default font-semibold">Service Master</span>
                  ) : (
                    <>
                      <span>Stok {item.stock}</span>
                      <span>Min {item.minStock}</span>
                    </>
                  )}
                  <span>Jual {item.sellPrice}</span>
                </div>
                <div className="inventory-card__footer">
                  <button className="ghost-button" type="button" onClick={() => setSelectedId(item.id)}>
                    Atur stok
                  </button>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <div className="page-stack">
          <SectionCard title="Sesuaikan Stok" description="Pilih barang prioritas lalu tambah atau kurangi stok cepat.">
            <div className="action-stack">
              <select className="field-like align-left" value={selectedItem?.id ?? ""} onChange={(event) => setSelectedId(event.target.value)}>
                {inventory.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <div className="summary-list">
                <div><span>Barang</span><strong>{selectedItem?.name ?? "-"}</strong></div>
                {selectedItem?.category !== "Jasa" && (
                  <>
                    <div><span>Stok aktif</span><strong>{selectedItem?.stock ?? 0}</strong></div>
                    <div><span>Ambang minimum</span><strong>{selectedItem?.minStock ?? 0}</strong></div>
                  </>
                )}
              </div>
              {selectedItem?.category !== "Jasa" ? (
                <div className="stock-adjust">
                  <button type="button" onClick={() => selectedItem && adjustMutation.mutate({ id: selectedItem.id, delta: -1 })}>-</button>
                  <strong>{selectedItem?.stock ?? 0}</strong>
                  <button type="button" onClick={() => selectedItem && adjustMutation.mutate({ id: selectedItem.id, delta: 1 })}>+</button>
                </div>
              ) : (
                <div className="callout callout--info">
                  <p>Item ini adalah <strong>Jasa</strong>. Stok tidak dikelola secara kuantitas.</p>
                </div>
              )}
              {adjustMutation.error ? <p className="form-error">{getErrorMessage(adjustMutation.error)}</p> : null}
            </div>
          </SectionCard>

          <SectionCard title="Prioritas Reorder">
            <div className="stack-list">
              {lowStockItems.length === 0 ? (
                <div className="stack-list__item">
                  <strong>Semua aman</strong>
                  <p>Belum ada barang yang perlu reorder sekarang.</p>
                </div>
              ) : (
                lowStockItems.map((item) => (
                  <div key={item.id} className="stack-list__item">
                    <strong>{item.name}</strong>
                    <p>Stok {item.stock}, minimum {item.minStock}. Segera reorder agar service tidak terhambat.</p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
