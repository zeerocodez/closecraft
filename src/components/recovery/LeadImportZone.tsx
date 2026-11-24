'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  FileSpreadsheet, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Database,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const BENCHMARK_HISTORICAL_LEADS = [
  {
    name: "Dr. Aliyu Mohammed",
    email: "aliyu.mohammed@apexmed.demo",
    phone: "+234 803 555 1101",
    company: "Apex Medical Systems",
    buyingIntent: 88,
    message: "Requested hospital ERP proposal in Q2 2025. Stalled due to procurement board review. Budget ₦4,500,000.",
    productInterest: "Healthcare Enterprise ERP",
    source: "2025 Medical Expo"
  },
  {
    name: "Hajia Fatima Balarabe",
    email: "fatima.b@saharaexports.demo",
    phone: "+234 812 444 8822",
    company: "Sahara Agro Logistics",
    buyingIntent: 75,
    message: "Discussed tracking logistics software. Budget sensitivity raised: wanted 15% discount on onboarding fees. Budget ₦2,000,000.",
    productInterest: "Agro Supply Chain Tracker",
    source: "Trade Delegation Direct"
  },
  {
    name: "Engr. Kevin Okon",
    email: "kevin.okon@deltaoffshore.demo",
    phone: "+234 703 119 7733",
    company: "Delta Marine & Energy",
    buyingIntent: 92,
    message: "Had completed technical discovery call. Abandoned proposal during Q3 contract finalization. Budget ₦6,000,000.",
    productInterest: "Offshore Compliance Portal",
    source: "LinkedIn Inbound"
  },
  {
    name: "Bukola Shonibare",
    email: "bukola@creativestudios.demo",
    phone: "+234 809 332 9944",
    company: "Lagos Creative Hub",
    buyingIntent: 60,
    message: "Inquired about appointment setting retainer. Cold for over 45 days after receiving rate card. Budget ₦750,000.",
    productInterest: "Sales Team Retainer",
    source: "Instagram DM"
  },
  {
    name: "Pastor David Ige",
    email: "pastor.david@graceacademy.demo",
    phone: "+234 802 665 4411",
    company: "Grace Educational Academy",
    buyingIntent: 35,
    message: "Tuition collection portal inquiry. Budget was below ₦100k threshold. Unqualified for custom enterprise.",
    productInterest: "School Management System",
    source: "Referral"
  }
];

export function LeadImportZone() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'FILE' | 'WHATSAPP' | 'BENCHMARK'>('BENCHMARK');
  const [whatsappText, setWhatsappText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileLeads, setFileLeads] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // File Upload Handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length < 2) {
          setErrorMsg('CSV must contain a header row and at least one data row.');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
        const rows: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          const rowObj: any = {};
          headers.forEach((h, idx) => {
            rowObj[h] = cols[idx] || '';
          });
          rows.push({
            name: rowObj.name || rowObj['full name'] || rowObj['first name'] || 'Prospect',
            email: rowObj.email || '',
            phone: rowObj.phone || rowObj['phone number'] || rowObj.mobile || '',
            company: rowObj.company || rowObj.organization || '',
            message: rowObj.message || rowObj.notes || rowObj.inquiry || '',
            source: 'CSV_IMPORT'
          });
        }

        setFileLeads(rows);
      } catch (err: any) {
        setErrorMsg('Failed to parse file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Submit Import
  const handleExecuteImport = async (leadsToImport: any[], format: string, name: string) => {
    if (leadsToImport.length === 0) {
      setErrorMsg('No leads available to import.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await fetch('/api/recovery/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: name,
          format,
          leads: leadsToImport
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to import recovery batch');
      }

      setResult(data);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Import failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/20">
        <div>
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <Database size={18} className="text-primary" />
            <span>Lead Recovery Ingestion Centre</span>
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Ingest cold inquiries, old CRM exports, or WhatsApp conversations to revive abandoned revenue.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container border border-outline-variant/20">
          <button
            type="button"
            onClick={() => { setActiveTab('BENCHMARK'); setErrorMsg(null); setResult(null); }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'BENCHMARK' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            1-Click Benchmark
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('FILE'); setErrorMsg(null); setResult(null); }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'FILE' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            CSV / Excel
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('WHATSAPP'); setErrorMsg(null); setResult(null); }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'WHATSAPP' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            WhatsApp Export
          </button>
        </div>
      </div>

      {/* Benchmark Tab */}
      {activeTab === 'BENCHMARK' && (
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <Sparkles size={14} className="text-primary" />
                <span>Pre-Configured Historical Lead Cohort (₦13.2M Pipeline Value)</span>
              </p>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Load 5 realistic enterprise and SME inquiries across Healthcare ERP, Agro Supply Chain, and Logistics to test segmentation, AI extraction, and reactivation dispatch.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleExecuteImport(BENCHMARK_HISTORICAL_LEADS, 'CSV', 'Benchmark_Historical_Cohort_2025.csv')}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              <span>{isProcessing ? 'Ingesting...' : 'Ingest Benchmark Cohort'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {BENCHMARK_HISTORICAL_LEADS.slice(0, 3).map((lead, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface">{lead.name}</span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold">Intent {lead.buyingIntent}%</span>
                </div>
                <p className="text-[10px] text-on-surface-variant truncate">{lead.company} • {lead.productInterest}</p>
                <p className="text-[10px] text-primary font-mono">{lead.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSV File Upload Tab */}
      {activeTab === 'FILE' && (
        <div className="space-y-4">
          <label className="border-2 border-dashed border-outline-variant/40 hover:border-primary/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-surface-container/20">
            <FileSpreadsheet size={28} className="text-primary mb-2 opacity-80" />
            <p className="text-xs font-bold text-on-surface">Click to upload CSV or Excel spreadsheet</p>
            <p className="text-[10px] text-on-surface-variant mt-0.5">Supports columns: Name, Email, Phone, Company, Notes, Value</p>
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
          </label>

          {fileLeads.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/30 text-xs">
              <span className="font-medium text-on-surface">Ready to ingest {fileLeads.length} leads from {fileName}</span>
              <button
                type="button"
                onClick={() => handleExecuteImport(fileLeads, 'CSV', fileName)}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5"
              >
                {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                <span>Ingest File</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* WhatsApp Export Tab */}
      {activeTab === 'WHATSAPP' && (
        <div className="space-y-3">
          <p className="text-xs text-on-surface-variant">
            Paste exported WhatsApp conversation lines below. Our normalizer automatically identifies the phone number, sender name, and past objections.
          </p>
          <textarea
            value={whatsappText}
            onChange={(e) => setWhatsappText(e.target.value)}
            rows={4}
            placeholder={`[14/06/2025, 11:42] +234 803 219 4481: Hello, we need CRM follow-up setup for our advisory team.\n[14/06/2025, 11:45] CloseCraft: Thank you Dr. Adeleke, our enterprise package is ₦500,000.\n[14/06/2025, 12:00] +234 803 219 4481: That works, please send proposal to adeleke@cedar.demo`}
            className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/30 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                const sampleRow = {
                  name: 'WhatsApp Prospect',
                  phone: '+234 803 219 4481',
                  email: 'whatsapp.prospect@demo.closecraft.com',
                  message: whatsappText,
                  source: 'WHATSAPP_EXPORT'
                };
                handleExecuteImport([sampleRow], 'WHATSAPP_EXPORT', 'whatsapp_chat_export.txt');
              }}
              disabled={isProcessing || !whatsappText.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <MessageSquare size={12} />}
              <span>Ingest WhatsApp Export</span>
            </button>
          </div>
        </div>
      )}

      {/* Success Feedback */}
      {result && (
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 text-xs space-y-1.5 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-bold text-emerald-300">
            <CheckCircle2 size={15} />
            <span>Successfully Ingested {result.importedCount} Recovery Leads!</span>
          </div>
          <p className="text-[11px] text-emerald-200/80 leading-relaxed">
            Batch ID <span className="font-mono text-white">{result.batchId}</span> • {result.duplicateCount} duplicates safely deduplicated • Canonical AI extraction and Revenue Engine qualification executed on all records.
          </p>
        </div>
      )}

      {/* Error Feedback */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
