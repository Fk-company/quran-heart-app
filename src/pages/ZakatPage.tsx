import React, { useState } from 'react';
import { Coins, Calculator, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

// Nisab approx: 85g gold. Default gold price per gram (USD) editable.
const ZakatPage: React.FC = () => {
  const [cash, setCash] = useState(0);
  const [gold, setGold] = useState(0); // grams
  const [silver, setSilver] = useState(0); // grams
  const [investments, setInvestments] = useState(0);
  const [debts, setDebts] = useState(0);
  const [goldPrice, setGoldPrice] = useState(70); // per gram in user currency
  const [silverPrice, setSilverPrice] = useState(0.8);

  const goldValue = gold * goldPrice;
  const silverValue = silver * silverPrice;
  const total = cash + goldValue + silverValue + investments - debts;
  const nisab = 85 * goldPrice; // gold nisab
  const eligible = total >= nisab;
  const zakat = eligible ? total * 0.025 : 0;

  const Field = ({ label, value, onChange, suffix }: any) => (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground mb-1 block">{label}</span>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/40"
          placeholder="0"
        />
        {suffix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </label>
  );

  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader icon={Coins} title="حاسبة الزكاة" subtitle="احسب زكاة مالك بسهولة" showBack gradient="gold" />

        <div className="card-surface p-5 mb-4">
          <h3 className="font-bold text-foreground mb-3 text-sm">أسعار المعادن (لكل غرام)</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="سعر الذهب" value={goldPrice} onChange={setGoldPrice} />
            <Field label="سعر الفضة" value={silverPrice} onChange={setSilverPrice} />
          </div>
        </div>

        <div className="card-surface p-5 mb-4 space-y-3">
          <h3 className="font-bold text-foreground text-sm">أصولك</h3>
          <Field label="النقد والودائع" value={cash} onChange={setCash} />
          <Field label="الذهب (غرام)" value={gold} onChange={setGold} suffix="غرام" />
          <Field label="الفضة (غرام)" value={silver} onChange={setSilver} suffix="غرام" />
          <Field label="استثمارات / تجارة" value={investments} onChange={setInvestments} />
          <Field label="الديون المستحقة عليك" value={debts} onChange={setDebts} />
        </div>

        <div className={`card-surface p-5 ${eligible ? 'border-primary/40' : ''}`}>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">إجمالي الأصول</span>
            <span className="font-bold text-foreground">{total.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">النصاب (85غ ذهب)</span>
            <span className="font-bold text-foreground">{nisab.toFixed(2)}</span>
          </div>
          <div className="page-header-line my-3" />
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">الزكاة المستحقة (2.5%)</span>
            <span className="text-2xl font-bold text-gradient-primary">{zakat.toFixed(2)}</span>
          </div>
          {!eligible && total > 0 && (
            <p className="text-xs text-muted-foreground mt-3">لم تبلغ أموالك النصاب بعد، لا زكاة عليك.</p>
          )}
        </div>

        <div className="card-surface p-4 mt-4 text-xs text-muted-foreground leading-relaxed">
          <p className="font-bold text-foreground mb-1">ملاحظة شرعية:</p>
          <p>تجب الزكاة عند بلوغ المال النصاب وحولان الحول (سنة هجرية كاملة). راجع أهل العلم في حالتك الخاصة.</p>
        </div>
      </div>
    </div>
  );
};

export default ZakatPage;
