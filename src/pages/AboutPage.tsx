import React from 'react';
import { Info, BookOpen, Search, Sparkles, Heart, Radio, Compass, Mail, Github, Shield, FileText, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="rounded-2xl border border-border/50 bg-card p-4 mb-3">
    <h2 className="text-sm font-extrabold text-foreground mb-2">{title}</h2>
    <div className="text-[13px] leading-7 text-muted-foreground space-y-2">{children}</div>
  </section>
);

const FeatureRow: React.FC<{ icon: React.ElementType; title: string; desc: string; to?: string }> = ({ icon: Icon, title, desc, to }) => {
  const inner = (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-card/60 hover:bg-card transition">
      <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-foreground">{title}</div>
        <div className="text-[12px] text-muted-foreground leading-6">{desc}</div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
};

const AboutPage: React.FC = () => {
  const version = '1.0.0';
  return (
    <div className="page-container page-with-topbar" dir="rtl">
      <SEO title="حول التطبيق | قلب القرآن" description="تعرّف على رؤية تطبيق قلب القرآن وأقسامه الرئيسية وطرق الدعم." />
      <div className="page-inner">
        <PageHeader icon={Info} title="حول التطبيق" subtitle="قلب القرآن — رفيقك في رحلتك مع كتاب الله" gradient="gold" showBack />

        <div className="mt-3">
          <Section title="رؤيتنا">
            <p>
              «قلب القرآن» تطبيق يجمع بين جمال الكتاب العزيز وسهولة التقنية الحديثة، ليكون رفيقك اليومي في التلاوة والتدبر والحفظ والذكر،
              بواجهة أنيقة، تجربة سريعة، واحترام تام لخصوصيتك.
            </p>
          </Section>

          <Section title="الأقسام الرئيسية">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FeatureRow icon={BookOpen} title="المصحف والقراءة" desc="تصفح المصحف الشريف بصفحات احترافية، مع تفسير وتلاوة." to="/mushaf" />
              <FeatureRow icon={Search} title="البحث الذكي" desc="ابحث في الآيات والسور والتفاسير بسرعة." to="/search" />
              <FeatureRow icon={Sparkles} title="المساعد القرآني" desc="اسأل عن أي آية أو موضوع قرآني بالذكاء الاصطناعي." to="/ai-tafsir" />
              <FeatureRow icon={Heart} title="القلب والتدبر" desc="قرآن القلب، التدبر الموجّه، والخاطرة اليومية." to="/heart-quran" />
              <FeatureRow icon={Radio} title="الإذاعات والقرّاء" desc="استمع لكبار القرّاء وإذاعات القرآن الكريم." to="/radio" />
              <FeatureRow icon={Compass} title="الأدوات الإسلامية" desc="القبلة، مواقيت الصلاة، الأذكار، والزكاة." to="/qibla" />
            </div>
          </Section>

          <Section title="كيف تستخدم التطبيق">
            <p>• من الشريط السفلي انتقل بين الرئيسية، القرآن، البحث، والمزيد.</p>
            <p>• اضغط على أي سورة لعرض تفاصيلها وتلاوتها.</p>
            <p>• استخدم زر البحث للوصول السريع لآية أو موضوع.</p>
            <p>• جرّب «المصحف» لعرض الصفحات بتصميم كلاسيكي.</p>
          </Section>

          <Section title="الدعم والتواصل">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FeatureRow icon={Mail} title="تواصل مع المطور" desc="أرسل ملاحظاتك واقتراحاتك." to="/developer-social" />
              <FeatureRow icon={Star} title="قيّم التطبيق" desc="دعمك يساعدنا على التطوير." to="/developer-social" />
              <FeatureRow icon={Shield} title="سياسة الخصوصية" desc="كيف نحمي بياناتك." to="/privacy" />
              <FeatureRow icon={FileText} title="شروط الاستخدام" desc="اطلع على الشروط." to="/terms" />
            </div>
          </Section>

          <div className="text-center text-[11px] text-muted-foreground mt-4 mb-6">
            الإصدار {version} • صُنع بحبٍّ لخدمة كتاب الله
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
