import React from 'react';

export interface BrevoNewsletterSectionProps {
  id?: string;
  badge?: string;
  headline: string;
  description: string;
  accessibleTitle?: string;
  theme?: 'dark' | 'dss';
}

const BREVO_IFRAME_SRC =
  'https://1988fd78.sibforms.com/v2/serve/MUIFAI_ABof2Df7O-t7_mG1N5xyAlcAiXZARwZ4S-gMtij-Xa04HTYZFqioHWPTsyDlsC_-BUl3qu1hrUZNUiTfNxRe-mVVWXte4qBvWslHArw-uEnlkgPwtGBo-f4VJuK3ntWjnnFCrKvjgqSM-PAXKS_y0JuLRD_yRK9BJleTZ-QRiQuAwL-87k--WZCcdSVe0m6SOTsDV6iI4Cg==';

export default function BrevoNewsletterSection({
  id = 'newsletter',
  badge = 'WEEKLY SALES DISPATCH',
  headline,
  description,
  accessibleTitle = 'Subscribe to weekly sales lessons',
  theme = 'dark',
}: BrevoNewsletterSectionProps) {
  const isDss = theme === 'dss';

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`relative py-16 sm:py-20 border-t ${
        isDss
          ? 'bg-[#080E21] border-white/10 text-white'
          : 'bg-[#070A0E] border-white/10 text-white'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        {/* Section Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border bg-white/5 border-white/10 text-[#248277]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#248277]" aria-hidden="true" />
          <span>{badge}</span>
        </div>

        {/* Section Copy */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2
            id={`${id}-heading`}
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white"
          >
            {headline}
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            {description}
          </p>
        </div>

        {/* Embedded Provider Form Container */}
        <div className="pt-2">
          <div className="w-full max-w-[540px] mx-auto rounded-2xl bg-[#0D131F]/80 p-2 sm:p-4 border border-white/10 shadow-2xl backdrop-blur-sm overflow-hidden">
            <iframe
              title={accessibleTitle}
              width="100%"
              height="315"
              src={BREVO_IFRAME_SRC}
              frameBorder="0"
              scrolling="auto"
              allowFullScreen
              style={{
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto',
                maxWidth: '100%',
                border: '0',
                borderRadius: '8px',
              }}
            />
          </div>
        </div>

        {/* Trust, Boundaries & Double Opt-In Microcopy */}
        <div className="pt-2 max-w-md mx-auto space-y-1.5 text-xs text-[#64748B]">
          <p>
            No spam. We send practical sales lessons only. A double opt-in confirmation email will be sent to verify your address.
          </p>
          <p className="text-[11px] text-[#475569]">
            Marketing newsletter subscriptions are handled independently from software account creation. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}

