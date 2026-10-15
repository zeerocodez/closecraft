"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QualificationPolicyModal } from '@/components/revenue-engine/QualificationPolicyModal';

export interface ParsedLead {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  buyingIntent?: number;
  message?: string;
}

const BENCHMARK_LEADS: ParsedLead[] = [
  {
    name: "Adaeze Okoro",
    email: "adaeze.okoro@cedarconsulting.demo",
    phone: "+234 803 219 4481",
    company: "Demo Cedar Consulting",
    buyingIntent: 92,
    message: "Needs consistent follow-up for inbound consulting enquiries. Founder decision maker. Budget ₦500,000. Timeline: Within 30 days."
  },
  {
    name: "Tunde Adebayo",
    email: "tunde.adebayo@orbitsoftware.demo",
    phone: "+234 812 455 9902",
    company: "Demo Orbit Software",
    buyingIntent: 86,
    message: "Needs qualified product demos and clearer CRM records. Co-founder joint decision. Budget ₦500,000. Timeline: Within 60 days."
  },
  {
    name: "Aisha Bello",
    email: "aisha.bello@kadunatalent.demo",
    phone: "+234 809 332 1199",
    company: "DSS Candidate - Kaduna",
    buyingIntent: 78,
    message: "Wants practical appointment-setting skills. DSS eight-week cohort candidate. Budget ₦80,000."
  },
  {
    name: "Chinedu Eze",
    email: "chinedu.eze@mapletraining.demo",
    phone: "+234 703 118 4455",
    company: "Demo Maple Training",
    buyingIntent: 89,
    message: "Needs follow-up on training programme enquiries. Director decision maker. Budget ₦500,000. Timeline: Within 30 days."
  },
  {
    name: "Zainab Yusuf",
    email: "zainab.yusuf@kanosales.demo",
    phone: "+234 814 667 8890",
    company: "DSS Candidate - Kano",
    buyingIntent: 72,
    message: "Junior salesperson needing discovery and objection-handling practice. Budget ₦80,000."
  },
  {
    name: "Emeka Nwosu",
    email: "emeka.nwosu@harborservices.demo",
    phone: "+234 802 998 1234",
    company: "Demo Harbor Services",
    buyingIntent: 84,
    message: "Needs team training on qualification and follow-up. Sales manager. Budget ₦350,000. Timeline: Within 60 days."
  },
  {
    name: "Blessing Udo",
    email: "blessing.udo@uyofreelance.demo",
    phone: "+234 818 443 2211",
    company: "DSS Candidate - Uyo",
    buyingIntent: 75,
    message: "Freelancer looking to sell high-ticket services with structured discovery calls. Budget ₦80,000."
  },
  {
    name: "Ibrahim Musa",
    email: "ibrahim.musa@abujacs.demo",
    phone: "+234 807 554 9901",
    company: "DSS Candidate - Abuja",
    buyingIntent: 70,
    message: "Customer support agent looking to build a closer portfolio for entry-level tech sales roles. Budget ₦80,000."
  },
  {
    name: "Funmilayo Adeyemi",
    email: "funmilayo.adeyemi@willowadvisory.demo",
    phone: "+234 805 771 2233",
    company: "Demo Willow Advisory",
    buyingIntent: 82,
    message: "Needs a named owner for stalled advisory enquiries. Managing partner. Budget ₦500,000. Timeline: Within 90 days."
  },
  {
    name: "Daniel Essien",
    email: "daniel.essien@calabargrad.demo",
    phone: "+234 813 992 0044",
    company: "DSS Candidate - Calabar",
    buyingIntent: 40,
    message: "Recent graduate interested in sales training; current budget is below tuition threshold. Long-term follow-up."
  }
];

// Helper to parse CSV lines with full quotation and comma handling
function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

export function ImportLeadsModal({ buttonLabel = "Import CSV", className = "" }: { buttonLabel?: string; className?: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [leads, setLeads] = useState<ParsedLead[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Parse CSV text into array of leads
  function parseCSV(text: string): ParsedLead[] {
    const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/['"]/g, ''));
    
    // Column index finders
    const nameIdx = headers.findIndex(h => h === 'name' || h.includes('lead_name') || h.includes('contact'));
    const firstNameIdx = headers.findIndex(h => h.includes('first'));
    const lastNameIdx = headers.findIndex(h => h.includes('last'));
    const emailIdx = headers.findIndex(h => h.includes('email'));
    const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('tel'));
    const companyIdx = headers.findIndex(h => h.includes('company') || h.includes('business') || h.includes('org'));
    const intentIdx = headers.findIndex(h => h.includes('intent') || h.includes('score'));
    const needIdx = headers.findIndex(h => h.includes('need') || h.includes('requirement'));
    const budgetIdx = headers.findIndex(h => h.includes('budget'));
    const notesIdx = headers.findIndex(h => h.includes('note') || h.includes('message') || h.includes('interest'));

    const parsed: ParsedLead[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cleanRow = parseCSVLine(lines[i]);
      if (cleanRow.length === 0 || cleanRow.every(c => c === '')) continue;

      const email = emailIdx !== -1 ? cleanRow[emailIdx] : cleanRow.find(c => c.includes('@')) || '';
      if (!email || !email.includes('@')) continue;

      let name = 'Inbound Lead';
      if (nameIdx !== -1 && cleanRow[nameIdx]) {
        name = cleanRow[nameIdx];
      } else if (firstNameIdx !== -1) {
        name = `${cleanRow[firstNameIdx]} ${lastNameIdx !== -1 ? cleanRow[lastNameIdx] : ''}`.trim();
      }

      const phone = phoneIdx !== -1 && cleanRow[phoneIdx] ? cleanRow[phoneIdx] : undefined;
      const company = companyIdx !== -1 && cleanRow[companyIdx] ? cleanRow[companyIdx] : undefined;
      
      let buyingIntent: number | undefined = undefined;
      if (intentIdx !== -1 && cleanRow[intentIdx]) {
        const num = parseInt(cleanRow[intentIdx], 10);
        if (!isNaN(num)) buyingIntent = num;
      }

      // Build context message
      const parts: string[] = [];
      if (needIdx !== -1 && cleanRow[needIdx]) parts.push(cleanRow[needIdx]);
      if (budgetIdx !== -1 && cleanRow[budgetIdx]) parts.push(`Budget: ₦${cleanRow[budgetIdx]}`);
      if (notesIdx !== -1 && cleanRow[notesIdx]) parts.push(cleanRow[notesIdx]);

      const message = parts.length > 0 ? parts.join(' | ') : 'Imported via CSV';

      parsed.push({
        name,
        email,
        phone,
        company,
        buyingIntent: buyingIntent ?? (company ? 80 : 60),
        message
      });
    }

    return parsed;
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setStatusMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseCSV(content);
      if (parsed.length === 0) {
        setStatusMsg({ type: 'error', text: 'Could not parse leads. Make sure the CSV file has an "email" column.' });
      } else {
        setLeads(parsed);
      }
    };
    reader.readAsText(file);
  }

  function loadBenchmarkData() {
    setStatusMsg(null);
    setFileName("Revenue_Engine_10_Sample_Leads.csv");
    setLeads(BENCHMARK_LEADS);
  }

  async function handleImport() {
    if (leads.length === 0) {
      setStatusMsg({ type: 'error', text: 'No valid leads selected. Please upload a CSV file or load the benchmark sample.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setStatusMsg({
        type: 'success',
        text: `Successfully ingested ${data.count} leads through the Revenue Engine! Refreshing pipeline...`
      });

      setTimeout(() => {
        setIsOpen(false);
        setLeads([]);
        setFileName("");
        router.refresh();
      }, 1500);

    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to import leads' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className={className || "h-10 px-3.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/60 text-sm font-semibold rounded-md flex items-center gap-2 shadow-sm transition-colors cursor-pointer"}
      >
        <span className="material-symbols-outlined text-[18px] text-primary">upload_file</span>
        <span>{buttonLabel}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-surface-container rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between bg-surface-container-low/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">dataset</span>
                </div>
                <div>
                  <h2 className="font-heading font-semibold text-lg text-on-surface">Import Leads &amp; Run Revenue Engine</h2>
                  <p className="text-xs text-on-surface-variant">Batch ingest leads. The Revenue Engine evaluates signals, sets Next Best Action, and routes opportunities.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsOpen(false)} 
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-5">
              
              {/* 1-Click Test Data Option */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-surface-container-low border border-primary/20 rounded-xl">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary text-[10px] font-bold uppercase tracking-wider">Benchmark Test</span>
                    <h4 className="text-sm font-bold text-on-surface">Load 10 Official CloseCraft Benchmark Leads</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant">Preloaded with diverse Nigerian enterprise &amp; DSS academy leads to test qualification, routing, and deal creation.</p>
                </div>
                <button 
                  type="button"
                  onClick={loadBenchmarkData}
                  className="px-4 py-2 bg-primary/15 hover:bg-primary/25 text-primary border border-primary/40 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>Load 10 Sample Leads</span>
                </button>
              </div>

              {/* Qualification Policy Check & Customizer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-surface-container-high/40 border border-surface-container rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-on-surface">Target Qualification Criteria</h5>
                    <p className="text-[11px] text-on-surface-variant">The Revenue Engine scores these leads using your organization's specific ICP rules.</p>
                  </div>
                </div>
                <QualificationPolicyModal 
                  buttonLabel="Review / Edit Qualification Logic" 
                  className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-highest text-primary border border-primary/30 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                />
              </div>

              {/* Upload Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Or Upload Your Own CSV File</label>
                <div className="border-2 border-dashed border-outline-variant/60 rounded-xl p-6 text-center hover:border-primary/50 transition-colors bg-surface-container-lowest flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-[36px] text-primary mb-2">cloud_upload</span>
                  <p className="text-sm font-medium text-on-surface">Drag &amp; drop your CSV file here, or browse</p>
                  <p className="text-xs text-on-surface-variant mt-1">Accepts: Name, Email, Phone, Company, Buying Intent, Notes, Budget, Need</p>
                  <input 
                    type="file" 
                    accept=".csv,text/csv" 
                    onChange={handleFileUpload} 
                    className="mt-3 text-xs text-on-surface-variant file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary-container cursor-pointer"
                  />
                  {fileName && (
                    <span className="mt-2 text-xs font-semibold text-primary">Selected: {fileName}</span>
                  )}
                </div>
              </div>

              {/* Status Message */}
              {statusMsg && (
                <div className={`p-3.5 rounded-xl border text-sm flex items-center gap-2 ${
                  statusMsg.type === 'success' 
                    ? 'bg-primary-container/20 border-primary text-primary' 
                    : 'bg-error-container/30 border-error text-error'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {statusMsg.type === 'success' ? 'check_circle' : 'error'}
                  </span>
                  <span>{statusMsg.text}</span>
                </div>
              )}

              {/* Leads Preview */}
              {leads.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                      Parsed Leads Preview ({leads.length})
                    </span>
                    <span className="text-xs text-primary font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                      Ready to Run Revenue Engine
                    </span>
                  </div>
                  <div className="border border-surface-container rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-container-low text-on-surface-variant uppercase font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Lead &amp; Company</th>
                          <th className="py-2.5 px-3">Email</th>
                          <th className="py-2.5 px-3">Intent</th>
                          <th className="py-2.5 px-3">Inquiry &amp; Context</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container">
                        {leads.map((l, idx) => (
                          <tr key={idx} className="hover:bg-surface-container-low/40">
                            <td className="py-2.5 px-3 font-semibold text-on-surface">
                              {l.name}
                              {l.company && <span className="block text-[11px] text-on-surface-variant font-normal">{l.company}</span>}
                            </td>
                            <td className="py-2.5 px-3 text-on-surface-variant font-mono text-[11px]">{l.email}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                                (l.buyingIntent || 50) >= 80 
                                  ? 'bg-primary text-on-primary' 
                                  : 'bg-surface-container text-on-surface'
                              }`}>
                                {l.buyingIntent || 50}%
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-on-surface-variant truncate max-w-[240px]" title={l.message}>
                              {l.message || 'CSV Import'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-surface-container bg-surface-container-low/30 flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-medium">
                {leads.length > 0 ? `${leads.length} leads ready for AI scoring & routing` : 'Select or load leads'}
              </span>
              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  disabled={loading}
                  className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleImport}
                  disabled={loading || leads.length === 0}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                      <span>Running Revenue Engine...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                      <span>Ingest &amp; Run Engine</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
