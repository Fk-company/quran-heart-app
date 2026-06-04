import React from 'react';
import { ShieldCheck } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="rounded-2xl border border-border/50 bg-card p-4 mb-3">
    <h2 className="text-sm font-extrabold text-foreground mb-2">{title}</h2>
    <div className="text-[13px] leading-7 text-muted-foreground space-y-2">{children}</div>
  </section>
);

const PrivacyPage: React.FC = () => {
  return (
    <div className="page-content pb-24" dir="rtl">
      <SEO title="سياسة الخصوصية | قلب القرآن" description="كيف نتعامل مع بياناتك في تطبيق قلب القرآن." />
      <PageHeader icon={ShieldCheck} title="سياسة الخصوصية" subtitle="بياناتك في أمان" gradient="primary" showBack />
      <div className="px-4 mt-3">
        <Section title="مقدمة">
          <p>
            نحرص في تطبيق «قلب القرآن» على حماية خصوصيتك. هذه السياسة توضح أنواع البيانات التي قد نتعامل معها وكيف تُستخدم.
          </p>
        </Section>
        <Section title="البيانات التي نجمعها">
          <p>• إعدادات التطبيق والتفضيلات (الخط، السمة، القارئ الافتراضي) تُحفظ محلياً في متصفحك فقط.</p>
          <p>• الموقع الجغرافي (اختياري) لحساب مواقيت الصلاة واتجاه القبلة، ولا يُرسل إلى خوادمنا.</p>
          <p>• إحصاءات الاستخدام (عدد التسبيحات، تقدم الختمة) تُخزن محلياً على جهازك.</p>
        </Section>
        <Section title="خدمات الطرف الثالث">
          <p>نستخدم خدمات عامة مثل Aladhan لمواقيت الصلاة وAlQuran Cloud للقرآن وMP3Quran للتلاوات. هذه الخدمات قد تسجل عناوين IP بحسب سياساتها.</p>
        </Section>
        <Section title="الإشعارات">
          <p>تُستخدم إشعارات المتصفح لتذكيرك بالأذكار والمواقيت بعد إذنك الصريح، ويمكنك تعطيلها في أي وقت من إعدادات المتصفح.</p>
        </Section>
        <Section title="حقوقك">
          <p>يمكنك في أي وقت حذف بياناتك المحلية عبر مسح بيانات الموقع من المتصفح.</p>
        </Section>
        <Section title="التواصل">
          <p>لأي استفسار يخص الخصوصية، تواصل مع المطور عبر صفحة «تواصل مع المطور».</p>
        </Section>
        <p className="text-[11px] text-muted-foreground text-center mt-4">آخر تحديث: 2026/06/04</p>
      </div>
    </div>
  );
};

export default PrivacyPage;
