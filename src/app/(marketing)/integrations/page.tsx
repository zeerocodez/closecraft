'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, MessageCircle, Zap, Cloud, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';

export default function IntegrationsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const integrations = [
    {
      id: 'facebook',
      icon: <span className="font-bold text-white text-xl">F</span>,
      bg: 'bg-[#1877F2]',
      title: 'Facebook Lead Ads',
      desc: 'Pull in real-time leads from your Facebook campaigns as soon as they submit their forms. Work the leads instantly and route verified prospects to your closers or appointment setters before they go cold.',
      steps: [
        'Log into your Closecraft Dashboard and navigate to Settings > Integrations.',
        'Click the "Connect Facebook" button.',
        'A secure Facebook window will open. Log into your Facebook account.',
        'Select the Business Pages and Lead Forms you want to sync.',
        'Click "Allow". New leads will now instantly appear in your Unified Inbox!'
      ]
    },
    {
      id: 'csv',
      icon: <FileSpreadsheet className="w-6 h-6 text-white" />,
      bg: 'bg-[#107C41]',
      title: 'CSV / Excel Upload',
      desc: 'Already have a list of leads? Easily import your existing contacts via a CSV file to seamlessly migrate your pipeline without losing any data.',
      steps: [
        'Open your current lead list in Excel, Google Sheets, or Numbers.',
        'Ensure you have column headers like "First Name", "Last Name", "Email", and "Phone".',
        'Save or Download the file as a Comma Separated Values (.csv) file.',
        'In Closecraft, go to the "Leads" tab and click the "Import CSV" button.',
        'Upload your file. The system will ask you to match your columns to ours (e.g., matching your "Email Address" column to our "Email" field).',
        'Click "Complete Import".'
      ]
    },
    {
      id: 'whatsapp',
      icon: <MessageCircle className="w-6 h-6 text-white" />,
      bg: 'bg-[#25D366]',
      title: 'WhatsApp Business',
      desc: 'Trigger automated text messages and capture replies directly in the Revenue Inbox so your team never has to share mobile phones.',
      steps: [
        'Go to Settings > WhatsApp in your Closecraft dashboard.',
        'Click "Generate QR Code".',
        'Open WhatsApp on your phone, go to "Linked Devices", and point your camera at the screen.',
        'Once scanned, your WhatsApp is connected (just like WhatsApp Web).',
        'All incoming messages will now route to your Closecraft Inbox.'
      ]
    },
    {
      id: 'zapier',
      icon: <Zap className="w-6 h-6 text-white" />,
      bg: 'bg-[#FF4F00]',
      title: 'Zapier',
      desc: 'Connect Closecraft to over 5,000+ other apps. Trigger engine workflows from external events or send Closecraft data to your favorite tools.',
      steps: [
        'Log into your Zapier.com account.',
        'Click "Create a Zap" and search for "Closecraft".',
        'Zapier will ask for an API Key to connect your account.',
        'Go to your Closecraft Settings > API Keys, click "Generate New Key", and copy it.',
        'Paste the key into Zapier to securely link your accounts.'
      ]
    },
    {
      id: 'salesforce',
      icon: <Cloud className="w-6 h-6 text-white" />,
      bg: 'bg-[#00A1E0]',
      title: 'Salesforce',
      desc: 'Enterprise-grade bi-directional sync. Ensure your marketing pipeline and enterprise CRM stay in perfect harmony without manual data entry.',
      steps: [
        'Go to Settings > Integrations in your Closecraft dashboard.',
        'Click "Connect Salesforce".',
        'Log in with your Salesforce Administrator credentials.',
        'Follow the on-screen prompts to grant Closecraft permission to update your Leads and Opportunities.',
        'Choose whether you want changes in Closecraft to automatically update Salesforce.'
      ]
    },
    {
      id: 'paystack',
      icon: <CreditCard className="w-6 h-6 text-white" />,
      bg: 'bg-[#0ABF53]',
      title: 'Paystack',
      desc: 'Verify subscription states, automate billing, and automatically pause services for failed payments using secure Paystack webhooks.',
      steps: [
        'Log into your Paystack Dashboard.',
        'Go to Settings > API Keys & Webhooks.',
        'Copy your "Secret Key".',
        'Paste this key into the Billing Settings in your Closecraft dashboard.',
        'Copy the "Webhook URL" from Closecraft and paste it back into your Paystack Webhook settings.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col pt-24 px-4 pb-20">
      <div className="max-w-4xl mx-auto w-full">
        
        <div className="text-center mb-16">
          <div className="eyebrow mb-4">ECOSYSTEM CONNECTIVITY</div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-on-surface mb-6">
            Works Where You Work
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">
            Closecraft natively integrates with your existing tools. We have made connecting these platforms as simple as clicking a button—no coding required.
          </p>
        </div>

        <div className="space-y-6 mb-16">
          {integrations.map((integration, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={integration.id} className="bg-surface-container rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm transition-all">
                
                {/* Accordion Header */}
                <button 
                  onClick={() => toggleAccordion(index)}
                  className="w-full text-left p-6 md:p-8 flex items-start md:items-center justify-between hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-start md:items-center gap-6">
                    <div className={`w-12 h-12 shrink-0 ${integration.bg} rounded-xl flex items-center justify-center shadow-md`}>
                      {integration.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-on-surface mb-2">{integration.title}</h3>
                      <p className="text-on-surface-variant pr-8 leading-relaxed max-w-2xl">
                        {integration.desc}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-on-surface-variant p-2 rounded-full bg-surface-container-high hidden md:block">
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </button>

                {/* Accordion Body (Step-by-Step Instructions) */}
                {isOpen && (
                  <div className="bg-surface-container-lowest border-t border-outline-variant/20 p-6 md:p-8">
                    <h4 className="font-bold text-on-surface mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">auto_stories</span>
                      How to connect {integration.title} (No technical skills needed)
                    </h4>
                    <div className="space-y-4">
                      {integration.steps.map((step, stepIdx) => (
                        <div key={stepIdx} className="flex gap-4 items-start">
                          <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            {stepIdx + 1}
                          </div>
                          <p className="text-on-surface-variant leading-relaxed pt-1">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-outline-variant/20">
                      <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">
                        Connect {integration.title} Now
                      </Link>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

        <div className="bg-inverse-surface text-inverse-on-surface p-10 rounded-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Need a custom integration?</h2>
          <p className="text-inverse-on-surface/80 mb-8 max-w-2xl mx-auto">
            Our engineering team provides full API access and dedicated support for enterprise clients building custom revenue architectures.
          </p>
          <Link href="/pricing" className="px-8 py-4 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-colors">
            Request Custom Architecture
          </Link>
        </div>

      </div>
    </div>
  );
}
