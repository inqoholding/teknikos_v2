import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "coreveta-cookie-notice-dismissed";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setVisible(window.localStorage.getItem(STORAGE_KEY) !== "1");
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="mx-auto mt-8 w-full max-w-7xl px-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-amber-400/25 bg-[#1b1508]/90 p-5 text-sm text-amber-50 shadow-xl md:flex-row md:items-center md:justify-between">
        <p className="max-w-3xl leading-6">
          Coreveta menggunakan cookie esensial untuk login, keamanan sesi, dan preferensi dasar. Kami tidak menyalakan tracker marketing pihak ketiga di landing page ini.
          <Link to="/privacy" className="ml-1 font-semibold text-amber-200 underline underline-offset-4">Pelajari detailnya</Link>
        </p>
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, "1");
            setVisible(false);
          }}
          className="rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-2 font-semibold text-amber-100 transition hover:bg-amber-300/20"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}
