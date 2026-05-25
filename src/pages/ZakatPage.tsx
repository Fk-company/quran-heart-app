import React, { useEffect, useState } from 'react';
import { Coins, RefreshCw, Info, Wallet, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const CURRENCIES = [
  { code: 'USD', name: 'دولار أمريكي', symbol: '$' },
  { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س' },
  { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ' },
  { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م' },
  { code: 'KWD', name: 'دينار كويتي', symbol: 'د.ك' },
  { code: 'QAR', name: 'ريال قطري', symbol: 'ر.ق' },
  { code: 'JOD', name: 'دينار أردني', symbol: 'د.أ' },
  { code: 'IQD', name: 'دينار عراقي', symbol: 'د.ع' },
  { code: 'BHD', name: 'دينار بحريني', symbol: 'د.ب' },
  { code: 'OMR', name: 'ريال عماني', symbol: 'ر.ع' },
  { code: 'LYD', name: 'دينار ليبي', symbol: 'د.ل' },
  { code: 'TND', name: 'دينار تونسي', symbol: 'د.ت' },
  { code: 'YER', name: 'ريال يمني', symbol: 'ر.ي' },
  { code: 'SDG', name: 'جنيه سوداني', symbol: 'ج.س' },
  { code: 'LBP', name: 'ليرة لبنانية', symbol: 'ل.ل' },
  { code: 'SYP', name: 'ليرة سورية', symbol: 'ل.س' },
  { code: 'PKR', name: 'روبية باكستانية', symbol: '₨' },
  { code: 'INR', name: 'روبية هندية', symbol: '₹' },
  { code: 'IDR', name: 'روبية إندونيسية', symbol: 'Rp' },
  { code: 'MYR', name: 'رينغيت ماليزي', symbol: 'RM' },
  { code: 'MAD', name: 'درهم مغربي', symbol: 'د.م' },
  { code: 'DZD', name: 'دينار جزائري', symbol: 'د.ج' },
  { code: 'TRY', name: 'ليرة تركية', symbol: '₺' },
  { code: 'EUR', name: 'يورو', symbol: '€' },
  { code: 'GBP', name: 'جنيه استرليني', symbol: '£' },
];

const GRAMS_PER_OUNCE = 31.1034768;
const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 595;

interface PriceState {
  goldPerGram: number;   // in selected currency
  silverPerGram: number; // in selected currency
  loadedAt: number | null;
  source: 'api' | 'manual' | 'default';
  error?: string;
}

const ZakatPage: React.FC = () => {
  const [currency, setCurrency] = useState(() => localStorage.getItem('zakat_currency') || 'USD');
  const [cash, setCash] = useState(0);
  const [gold, setGold] = useState(0);     // grams
  const [silver, setSilver] = useState(0); // grams
  const [investments, setInvestments] = useState(0);
  const [debts, setDebts] = useState(0);

  const [price, setPrice] = useState<PriceState>({
    goldPerGram: 75, silverPerGram: 0.9, loadedAt: null, source: 'default',
  });
  const [loadingPrice, setLoadingPrice] = useState(false);

  useEffect(() => { localStorage.setItem('zakat_currency', currency); }, [currency]);

  // Auto-fetch on currency change
  useEffect(() => { fetchPrices(); /* eslint-disable-next-line */ }, [currency]);

  async function fetchPrices() {
    setLoadingPrice(true);
    try {
      // Free public APIs (no key): gold-api.com returns USD per ounce.
      const [goldRes, silverRes] = await Promise.all([
        fetch('https://api.gold-api.com/price/XAU'),
        fetch('https://api.gold-api.com/price/XAG'),
      ]);
      const goldData = await goldRes.json();
      const silverData = await silverRes.json();
      const goldUsdPerOz = Number(goldData.price);
      const silverUsdPerOz = Number(silverData.price);
      if (!goldUsdPerOz || !silverUsdPerOz) throw new Error('invalid');

      // Convert USD to chosen currency via frankfurter.app (no key)
      let rate = 1;
      if (currency !== 'USD') {
        const r = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${currency}`);
        const rd = await r.json();
        rate = Number(rd?.rates?.[currency]);
        if (!rate || !isFinite(rate)) {
          // Fallback: open.er-api.com
          const r2 = await fetch(`https://open.er-api.com/v6/latest/USD`);
          const rd2 = await r2.json();
          rate = Number(rd2?.rates?.[currency]) || 1;
        }
      }

      setPrice({
        goldPerGram: (goldUsdPerOz / GRAMS_PER_OUNCE) * rate,
        silverPerGram: (silverUsdPerOz / GRAMS_PER_OUNCE) * rate,
        loadedAt: Date.now(),
        source: 'api',
      });
    } catch (e) {
      setPrice(p => ({ ...p, error: 'تعذّر جلب الأسعار، يمكنك تعديلها يدوياً.', source: 'manual' }));
    } finally {
      setLoadingPrice(false);
    }
  }

  const symbol = CURRENCIES.find(c => c.code === currency)?.symbol || currency;
  const goldValue = gold * price.goldPerGram;
  const silverValue = silver * price.silverPerGram;
  const totalAssets = cash + goldValue + silverValue + investments;
  const totalNet = totalAssets - debts;

  // Use lower of the two nisabs (more cautious — more people eligible).
  const goldNisab = GOLD_NISAB_GRAMS * price.goldPerGram;
  const silverNisab = SILVER_NISAB_GRAMS * price.silverPerGram;
  const effectiveNisab = Math.min(goldNisab, silverNisab);
  const eligible = totalNet >= effectiveNisab && totalNet > 0;
  const zakat = eligible ? totalNet * 0.025 : 0;

  const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={Coins} title="حاسبة الزكاة" subtitle="بسيطة ودقيقة — أسعار حيّة" showBack gradient="gold" />

        {/* Currency */}
        <div className="card-surface p-4 mb-4">
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5" /> اختر العملة
            </span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
              ))}
            </select>
          </label>
        </div>

        {/* Live Prices */}
        <div className="card-surface p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-accent" /> أسعار المعادن (لكل غرام)
            </h3>
            <button
              onClick={fetchPrices}
              disabled={loadingPrice}
              className="text-xs font-bold text-primary inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 hover:bg-primary/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loadingPrice ? 'animate-spin' : ''}`} />
              تحديث
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground block mb-1">سعر الذهب</span>
              <input
                type="number" step="0.01" value={price.goldPerGram || ''}
                onChange={(e) => setPrice(p => ({ ...p, goldPerGram: parseFloat(e.target.value) || 0, source: 'manual' }))}
                className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground block mb-1">سعر الفضة</span>
              <input
                type="number" step="0.01" value={price.silverPerGram || ''}
                onChange={(e) => setPrice(p => ({ ...p, silverPerGram: parseFloat(e.target.value) || 0, source: 'manual' }))}
                className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground mt-2 flex items-center justify-between">
            <span>
              {price.source === 'api' && price.loadedAt
                ? `محدّث: ${new Date(price.loadedAt).toLocaleTimeString('ar')}`
                : price.source === 'manual' ? 'إدخال يدوي' : 'قيم افتراضية'}
            </span>
            <span>{symbol}/غرام</span>
          </div>
          {price.error && <p className="text-[10px] text-amber-500 mt-1">{price.error}</p>}
        </div>

        {/* Assets */}
        <div className="card-surface p-5 mb-4 space-y-3">
          <h3 className="text-sm font-bold text-foreground">أصولك</h3>

          <NumField label="النقد والودائع البنكية" value={cash} onChange={setCash} suffix={symbol} />
          <NumField label="الذهب" value={gold} onChange={setGold} suffix="غرام" />
          <NumField label="الفضة" value={silver} onChange={setSilver} suffix="غرام" />
          <NumField label="استثمارات وأموال التجارة" value={investments} onChange={setInvestments} suffix={symbol} />
          <NumField label="الديون المستحقة عليك" value={debts} onChange={setDebts} suffix={symbol} />
        </div>

        {/* Result */}
        <div className={`card-surface p-5 ${eligible ? 'border-primary/40' : ''}`}>
          <Row label="قيمة الذهب" value={`${fmt(goldValue)} ${symbol}`} />
          <Row label="قيمة الفضة" value={`${fmt(silverValue)} ${symbol}`} />
          <Row label="إجمالي الأصول" value={`${fmt(totalAssets)} ${symbol}`} />
          <Row label="بعد خصم الديون" value={`${fmt(totalNet)} ${symbol}`} bold />
          <div className="page-header-line my-3" />
          <Row label="نصاب الذهب (85غ)" value={`${fmt(goldNisab)} ${symbol}`} muted />
          <Row label="نصاب الفضة (595غ)" value={`${fmt(silverNisab)} ${symbol}`} muted />
          <Row label="النصاب المعتمد (الأدنى)" value={`${fmt(effectiveNisab)} ${symbol}`} muted />
          <div className="page-header-line my-3" />
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">الزكاة المستحقة (2.5%)</span>
            <span className="text-2xl font-bold text-gradient-primary">{fmt(zakat)} {symbol}</span>
          </div>
          {!eligible && totalNet > 0 && (
            <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              لم يبلغ مالك النصاب بعد، لا زكاة عليك.
            </p>
          )}
        </div>

        <div className="card-surface p-4 mt-4 text-xs text-muted-foreground leading-relaxed">
          <p className="font-bold text-foreground mb-1.5 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> ملاحظة شرعية
          </p>
          <p>تجب الزكاة عند بلوغ المال النصاب وحولان الحول (سنة هجرية كاملة). الأسعار من مصادر عامة وقد تختلف عن أسعار السوق المحلية. راجع أهل العلم في حالتك الخاصة.</p>
        </div>
      </div>
    </div>
  );
};

const NumField: React.FC<{ label: string; value: number; onChange: (n: number) => void; suffix?: string }> = ({ label, value, onChange, suffix }) => (
  <label className="block">
    <span className="text-xs font-semibold text-muted-foreground mb-1 block">{label}</span>
    <div className="relative">
      <input
        type="number" inputMode="decimal" value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/40 pl-14"
        placeholder="0"
      />
      {suffix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>}
    </div>
  </label>
);

const Row: React.FC<{ label: string; value: string; muted?: boolean; bold?: boolean }> = ({ label, value, muted, bold }) => (
  <div className={`flex items-center justify-between text-sm mb-2 ${muted ? 'text-muted-foreground' : 'text-foreground'}`}>
    <span>{label}</span>
    <span className={bold ? 'font-bold' : 'font-semibold'}>{value}</span>
  </div>
);

export default ZakatPage;
