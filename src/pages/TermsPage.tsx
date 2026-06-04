import React from 'react';
import { ScrollText } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="rounded-2xl border border-border/50 bg-card p-4 mb-3">
    <h2 className="text-sm font-extrabold text-foreground mb-2">{title}</h2>
    <div className="text-[13px] leading-7 text-muted-foreground space-y-2">{children}</div>
  </section>
);

const TermsPage: React.FC = () => {
  return (
    <div className="page-content pb-24" dir="rtl">
      <SEO title="سياسة الاستخدام | قلب القرآن" description="شروط وأحكام استخدام تطبيق قلب القرآن." />
      <PageHeader icon={ScrollText} title="سياسة الاستخدام" subtitle="الشروط والأحكام" gradient="gold" showBack />
      <div className="px-4 mt-3">
        <Section title="القبول بالشروط">
          <p>باستخدامك لتطبيق «قلب القرآن» فإنك توافق على الالتزام بالشروط الموضحة هنا.</p>
        </Section>
        <Section title="طبيعة المحتوى">
          <p>التطبيق يقدم نصوصاً قرآنية وأذكاراً وأدعية وأحاديث. نحرص على الدقة، ولا نتحمل مسؤولية أي خطأ نقل من المصادر الخارجية.</p>
        </Section>
        <Section title="الاستخدام المسموح به">
          <p>• الاستخدام الشخصي والعبادي والتعليمي.</p>
          <p>• مشاركة الآيات والأدعية مع الآخرين بنية الخير.</p>
          <p>• لا يجوز استخدام التطبيق في أي غرض مخالف لتعاليم الإسلام أو القانون.</p>
        </Section>
        <Section title="الملكية الفكرية">
          <p>القرآن الكريم ملك للأمة. واجهة التطبيق وأكواده محفوظة للمطور. يُمنع نسخ أو إعادة توزيع الواجهة دون إذن.</p>
        </Section>
        <Section title="إخلاء المسؤولية">
          <p>المواقيت ومحتوى الطرف الثالث يُقدّم كما هو، ويُنصح بالتحقق من المصادر الرسمية في الأمور الشرعية الدقيقة.</p>
        </Section>
        <Section title="التعديلات">
          <p>قد نحدّث هذه الشروط من وقت لآخر، وستظهر النسخة المحدثة هنا.</p>
        </Section>
        <p className="text-[11px] text-muted-foreground text-center mt-4">آخر تحديث: 2026/06/04</p>
      </div>
    </div>
  );
};

export default TermsPage;
