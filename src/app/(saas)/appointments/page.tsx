import React from 'react';
import { auth } from "@/lib/auth";
import { redirect } from 'next/navigation';

export default async function Page() {
 const session = await auth();
 if (!session?.user) {
 redirect('/login');
 }

 return (
 <>
 <header className="fixed top-0 left-64 right-0 h-16 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-6 flex items-center justify-between gap-4"><div className="flex items-center gap-4 min-w-0"><div className="flex items-center gap-space-xs text-sm text-on-surface-variant"><span className="hover:text-on-surface cursor-pointer">Closecraft</span><span className="material-symbols-outlined text-[14px]">chevron_right</span><span className="text-on-surface font-semibold">Revenue Ops</span></div></div><div className="flex-1 max-w-lg mx-space-lg"><div className="relative flex items-center w-full"><span className="material-symbols-outlined absolute left-space-md text-on-surface-variant text-[18px]">search</span><input className="w-full pl-9 pr-14 py-space-xs rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline-variant font-body-md text-body-md shadow-[0_1px_4px_rgba(12,20,36,0.05)] focus:outline-none" placeholder="Search leads, companies, deals..." type="text"/><div className="absolute right-space-md flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-container-high text-on-secondary-container text-xs font-semibold uppercase">⌘K</div></div></div><div className="flex items-center gap-4 shrink-0"><div className="hidden xl:flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-low text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-primary"></span><span className="text-sm">Telemetry: 340ms • 99.98% Integrity</span></div><button className="relative p-space-xs rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"><span className="material-symbols-outlined text-[20px]">notifications</span><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span></button><button className="flex items-center gap-space-xs px-4 py-space-xs bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary-container transition-colors shadow-[0_1px_2px_rgba(12,20,36,0.1)]"><span className="material-symbols-outlined text-[18px]">add</span><span>Add Lead</span></button><div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></div></div></header><main className="w-full pt-16 bg-surface"><div className="flex flex-col w-full p-8 gap-6">
{/* Operational Sub-Header & Controls Bar */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
<div className="flex flex-col">
<div className="flex items-center gap-space-sm">
<h1 className="text-xl font-semibold text-on-surface tracking-tight">Revenue Appointments</h1>
<span className="px-2 py-0.5 rounded bg-surface-container-high text-primary text-xs font-semibold uppercase">LIVE CALENDAR ENGINE</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">Automated executive demo bookings, rep dispatching &amp; calendar pacing</p>
</div>
{/* Actions & Segmented Control */}
<div className="flex flex-wrap items-center gap-space-sm">
{/* Segmented View Toggle */}
<div className="flex items-center p-1 rounded-xl bg-surface-container-low shadow-sm">
<button className="px-4 py-1 rounded-lg text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors" type="button">Day</button>
<button className="px-4 py-1 rounded-lg bg-surface-container-lowest text-primary text-sm font-medium shadow-sm" type="button">Week View</button>
<button className="px-4 py-1 rounded-lg text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors" type="button">Month</button>
<button className="px-4 py-1 rounded-lg text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors" type="button">Agenda List</button>
</div>
<button className="flex items-center gap-space-xs px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-low shadow-sm text-sm font-medium transition-all" type="button">
<span className="material-symbols-outlined text-[18px] text-primary">sync</span>
<span>Sync Calendar</span>
</button>
<button className="flex items-center gap-space-xs px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container shadow-sm text-sm font-medium transition-all" type="button">
<span className="material-symbols-outlined text-[18px]">add</span>
<span>+ Schedule Appointment</span>
</button>
</div>
</div>
{/* Top KPI Summary Strip */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
{/* Slated Today */}
<div className="flex flex-col p-4 rounded-xl bg-surface-container-lowest shadow-sm justify-between">
<div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
<span className="text-xs font-semibold uppercase uppercase tracking-wider">Slated Today</span>
<span className="material-symbols-outlined text-[20px] text-primary">event_available</span>
</div>
<div className="flex items-baseline gap-space-xs">
<span className="font-metric-numeral-lg text-metric-numeral-lg text-on-surface">14</span>
<span className="font-body-md text-body-md text-on-surface-variant">Appointments</span>
</div>
<div className="mt-space-xs flex items-center gap-space-xs text-primary text-sm">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
<span className="font-semibold">6 Enterprise Demos</span>
<span className="text-on-surface-variant ml-auto">84% Rep Load</span>
</div>
</div>
{/* Booking Conversion Rate */}
<div className="flex flex-col p-4 rounded-xl bg-surface-container-lowest shadow-sm justify-between">
<div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
<span className="text-xs font-semibold uppercase uppercase tracking-wider">Booking Conversion Rate</span>
<span className="material-symbols-outlined text-[20px] text-tertiary">bolt</span>
</div>
<div className="flex items-baseline gap-space-xs">
<span className="font-metric-numeral-lg text-metric-numeral-lg text-on-surface">49.5%</span>
<span className="text-xs font-semibold uppercase text-primary bg-primary-fixed/40 px-1 rounded">+3.2% vs avg</span>
</div>
<div className="mt-space-xs text-on-surface-variant text-sm truncate">
 From qualified inbound traffic (AI routed)
 </div>
</div>
{/* No-Show Rate */}
<div className="flex flex-col p-4 rounded-xl bg-surface-container-lowest shadow-sm justify-between">
<div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
<span className="text-xs font-semibold uppercase uppercase tracking-wider">No-Show Rate</span>
<span className="material-symbols-outlined text-[20px] text-primary">verified_user</span>
</div>
<div className="flex items-baseline gap-space-xs">
<span className="font-metric-numeral-lg text-metric-numeral-lg text-on-surface">1.8%</span>
<span className="text-sm text-on-surface-variant font-medium">(Target: &lt;4.0%)</span>
</div>
<div className="mt-space-xs flex items-center gap-1 text-on-surface-variant text-sm">
<span className="material-symbols-outlined text-[14px] text-primary">sms</span>
<span className="truncate">Protected by automated WhatsApp SMS reminders</span>
</div>
</div>
{/* Total Pipeline in Meetings */}
<div className="flex flex-col p-4 rounded-xl bg-surface-container-lowest shadow-sm justify-between">
<div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
<span className="text-xs font-semibold uppercase uppercase tracking-wider">Total Pipeline in Meetings</span>
<span className="material-symbols-outlined text-[20px] text-primary">payments</span>
</div>
<div className="flex items-baseline gap-space-xs">
<span className="font-metric-numeral-lg text-metric-numeral-lg text-on-surface">₦54.8M</span>
<span className="text-sm text-on-surface-variant">this week</span>
</div>
<div className="mt-space-xs flex items-center justify-between text-sm text-on-surface-variant">
<span>32 slots occupied</span>
<span className="font-semibold text-primary">91% Pace</span>
</div>
</div>
</div>
{/* Main Execution Surface: 70% Calendar Grid vs 30% Intelligence Pack */}
<div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
{/* Left Column: Calendar Schedule Grid (70%) */}
<div className="lg:col-span-7 flex flex-col rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
{/* Week Navigation Header */}
<div className="flex items-center justify-between px-6 py-space-md bg-surface-container-low">
<div className="flex items-center gap-4">
<div className="flex items-center gap-1">
<button className="p-1 rounded hover:bg-surface-container-high transition-colors text-on-surface" type="button">
<span className="material-symbols-outlined text-[20px]">chevron_left</span>
</button>
<button className="p-1 rounded hover:bg-surface-container-high transition-colors text-on-surface" type="button">
<span className="material-symbols-outlined text-[20px]">chevron_right</span>
</button>
</div>
<span className="font-medium text-sm text-on-surface">May 19 – May 23, 2025</span>
<span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface text-xs font-semibold uppercase">WAT (UTC+1)</span>
</div>
<div className="flex items-center gap-space-sm text-sm font-medium">
<span className="flex items-center gap-1.5 text-on-surface-variant">
<span className="w-2.5 h-2.5 rounded bg-primary-container"></span> Enterprise
 </span>
<span className="flex items-center gap-1.5 text-on-surface-variant">
<span className="w-2.5 h-2.5 rounded bg-tertiary"></span> AI Auto-Booked
 </span>
</div>
</div>
{/* Calendar Table Grid */}
<div className="overflow-x-auto">
<div className="min-w-[760px] flex flex-col">
{/* Days Header */}
<div className="grid grid-cols-12 bg-surface-container-lowest shadow-sm">
<div className="col-span-2 p-space-sm text-center text-xs font-semibold uppercase text-on-surface-variant">Time</div>
<div className="col-span-2 p-space-sm text-center">
<div className="text-xs font-semibold uppercase text-on-surface-variant uppercase">Mon 19</div>
<div className="font-medium text-sm text-on-surface">19</div>
</div>
<div className="col-span-2 p-space-sm text-center bg-surface-container-low/60 rounded-t-lg">
<div className="text-xs font-semibold uppercase text-primary uppercase font-bold">Tue 20 (Today)</div>
<div className="font-medium text-sm text-primary">20</div>
</div>
<div className="col-span-2 p-space-sm text-center">
<div className="text-xs font-semibold uppercase text-on-surface-variant uppercase">Wed 21</div>
<div className="font-medium text-sm text-on-surface">21</div>
</div>
<div className="col-span-2 p-space-sm text-center">
<div className="text-xs font-semibold uppercase text-on-surface-variant uppercase">Thu 22</div>
<div className="font-medium text-sm text-on-surface">22</div>
</div>
<div className="col-span-2 p-space-sm text-center">
<div className="text-xs font-semibold uppercase text-on-surface-variant uppercase">Fri 23</div>
<div className="font-medium text-sm text-on-surface">23</div>
</div>
</div>
{/* Time Grid 09:00 - 18:00 */}
<div className="relative flex flex-col bg-surface-container-lowest">
{/* 09:00 Slot */}
<div className="grid grid-cols-12 min-h-[72px] bg-surface-container-lowest hover:bg-surface-container-low/30 transition-colors">
<div className="col-span-2 p-space-sm text-xs font-semibold uppercase text-on-surface-variant flex items-start justify-end pr-3">09:00</div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1 bg-surface-container-low/40">
<div className="h-full p-space-xs rounded bg-surface-container-high/60 flex flex-col justify-center">
<span className="text-xs font-semibold uppercase text-on-surface-variant">Pipeline Standup</span>
<span className="text-sm text-on-surface font-semibold truncate">SDR / AE Huddle</span>
</div>
</div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1"></div>
</div>
{/* 10:00 Slot (Sterling & Sterling Ltd) */}
<div className="grid grid-cols-12 min-h-[88px] bg-surface-container-lowest hover:bg-surface-container-low/30 transition-colors">
<div className="col-span-2 p-space-sm text-xs font-semibold uppercase text-on-surface-variant flex items-start justify-end pr-3">10:00</div>
<div className="col-span-2 p-1"></div>
{/* Active Meeting Selected */}
<div className="col-span-2 p-1 bg-surface-container-low/40">
<div className="h-full p-space-sm rounded-lg bg-primary-container text-on-primary shadow-sm flex flex-col justify-between cursor-pointer ring-2 ring-primary">
<div className="flex items-start justify-between gap-1">
<span className="text-xs font-semibold uppercase px-1 py-0.5 rounded bg-surface-container-lowest/20 text-on-primary">10:00 - 10:45</span>
<span className="text-xs font-semibold uppercase font-bold">₦4.2M ACV</span>
</div>
<div>
<h2 className="font-medium text-[13px] leading-tight font-bold truncate">Sterling &amp; Sterling Ltd</h2>
<p className="text-sm opacity-90 truncate">Tunde Balogun (VP Ops)</p>
</div>
<div className="flex items-center justify-between text-[11px] opacity-80 pt-1">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">person</span> Sarah Jenkins</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">videocam</span> Zoom</span>
</div>
</div>
</div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1"></div>
</div>
{/* 11:00 Slot (PayPulse Africa) */}
<div className="grid grid-cols-12 min-h-[88px] bg-surface-container-lowest hover:bg-surface-container-low/30 transition-colors">
<div className="col-span-2 p-space-sm text-xs font-semibold uppercase text-on-surface-variant flex items-start justify-end pr-3">11:00</div>
<div className="col-span-2 p-1"></div>
{/* PayPulse Meeting 11:30 - 12:15 */}
<div className="col-span-2 p-1 bg-surface-container-low/40">
<div className="h-full p-space-sm rounded-lg bg-surface-container-high hover:bg-surface-container-highest transition-all flex flex-col justify-between cursor-pointer">
<div className="flex items-start justify-between gap-1">
<span className="text-xs font-semibold uppercase px-1 py-0.5 rounded bg-surface-container-lowest text-primary">11:30 - 12:15</span>
<span className="text-xs font-semibold uppercase font-bold text-on-surface">₦8.5M ACV</span>
</div>
<div>
<h2 className="font-medium text-[13px] leading-tight font-bold text-on-surface truncate">PayPulse Africa</h2>
<p className="text-sm text-on-surface-variant truncate">David Chen • Exec Demo</p>
</div>
<div className="flex items-center justify-between text-xs font-semibold uppercase text-on-surface-variant pt-1">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">person</span> Femi Davies</span>
<span className="text-primary font-semibold">Ready</span>
</div>
</div>
</div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1"></div>
</div>
{/* 12:00 Slot (Lunch / Internal Block) */}
<div className="grid grid-cols-12 min-h-[64px] bg-surface-container-lowest hover:bg-surface-container-low/30 transition-colors">
<div className="col-span-2 p-space-sm text-xs font-semibold uppercase text-on-surface-variant flex items-start justify-end pr-3">12:00</div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1 bg-surface-container-low/40">
<div className="h-full flex items-center justify-center rounded bg-surface-container-low text-outline text-xs font-semibold uppercase uppercase">Exec Buffer</div>
</div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1"></div>
</div>
{/* 13:00 Slot */}
<div className="grid grid-cols-12 min-h-[64px] bg-surface-container-lowest hover:bg-surface-container-low/30 transition-colors">
<div className="col-span-2 p-space-sm text-xs font-semibold uppercase text-on-surface-variant flex items-start justify-end pr-3">13:00</div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1 bg-surface-container-low/40"></div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1"></div>
</div>
{/* 14:00 Slot (Zenith Logistics) */}
<div className="grid grid-cols-12 min-h-[88px] bg-surface-container-lowest hover:bg-surface-container-low/30 transition-colors">
<div className="col-span-2 p-space-sm text-xs font-semibold uppercase text-on-surface-variant flex items-start justify-end pr-3">14:00</div>
<div className="col-span-2 p-1"></div>
{/* Zenith Logistics 14:00 - 15:00 */}
<div className="col-span-2 p-1 bg-surface-container-low/40">
<div className="h-full p-space-sm rounded-lg bg-surface-container-high hover:bg-surface-container-highest transition-all flex flex-col justify-between cursor-pointer">
<div className="flex items-start justify-between gap-1">
<span className="text-xs font-semibold uppercase px-1 py-0.5 rounded bg-surface-container-lowest text-primary">14:00 - 15:00</span>
<span className="text-xs font-semibold uppercase font-bold text-on-surface">₦6.0M ACV</span>
</div>
<div>
<h2 className="font-medium text-[13px] leading-tight font-bold text-on-surface truncate">Zenith Logistics</h2>
<p className="text-sm text-on-surface-variant truncate">Zainab Bello • Fleet Arch</p>
</div>
<div className="flex items-center justify-between text-xs font-semibold uppercase text-on-surface-variant pt-1">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">person</span> Sarah Jenkins</span>
<span className="text-tertiary">Pre-flight OK</span>
</div>
</div>
</div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1"></div>
</div>
{/* 15:00 Slot */}
<div className="grid grid-cols-12 min-h-[64px] bg-surface-container-lowest hover:bg-surface-container-low/30 transition-colors">
<div className="col-span-2 p-space-sm text-xs font-semibold uppercase text-on-surface-variant flex items-start justify-end pr-3">15:00</div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1 bg-surface-container-low/40"></div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1"></div>
</div>
{/* 16:00 Slot (Flutterwave Global Ops) */}
<div className="grid grid-cols-12 min-h-[88px] bg-surface-container-lowest hover:bg-surface-container-low/30 transition-colors">
<div className="col-span-2 p-space-sm text-xs font-semibold uppercase text-on-surface-variant flex items-start justify-end pr-3">16:00</div>
<div className="col-span-2 p-1"></div>
{/* Flutterwave Inbound */}
<div className="col-span-2 p-1 bg-surface-container-low/40">
<div className="h-full p-space-sm rounded-lg bg-tertiary text-on-tertiary shadow-sm flex flex-col justify-between cursor-pointer">
<div className="flex items-start justify-between gap-1">
<span className="text-xs font-semibold uppercase px-1 py-0.5 rounded bg-surface-container-lowest/20 text-on-tertiary">16:00 - 16:30</span>
<span className="text-xs font-semibold uppercase font-bold">₦14.2M ACV</span>
</div>
<div>
<h2 className="font-medium text-[13px] leading-tight font-bold truncate">Flutterwave Global Ops</h2>
<p className="text-sm opacity-90 truncate">Inbound Routing</p>
</div>
<div className="flex items-center justify-between text-[11px] opacity-80 pt-1">
<span className="flex items-center gap-1 font-semibold"><span className="material-symbols-outlined text-[12px]">smart_toy</span> AI Auto-booked</span>
<span className="px-1 bg-surface-container-lowest/30 rounded font-semibold text-[9px]">P1 High</span>
</div>
</div>
</div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1"></div>
</div>
{/* 17:00 Slot */}
<div className="grid grid-cols-12 min-h-[64px] bg-surface-container-lowest hover:bg-surface-container-low/30 transition-colors">
<div className="col-span-2 p-space-sm text-xs font-semibold uppercase text-on-surface-variant flex items-start justify-end pr-3">17:00</div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1 bg-surface-container-low/40"></div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1"></div>
<div className="col-span-2 p-1"></div>
</div>
</div>
</div>
</div>
</div>
{/* Right Column: Selected Appointment Intelligence Pack (30%) */}
<div className="lg:col-span-3 flex flex-col gap-4">
{/* Intelligence Card */}
<div className="flex flex-col p-space-lg rounded-xl bg-surface-container-lowest shadow-sm gap-4">
{/* Lead Header & Confidence Pill */}
<div className="flex flex-col gap-space-xs">
<div className="flex items-center justify-between">
<span className="px-2 py-0.5 rounded bg-surface-container-high text-primary text-xs font-semibold uppercase font-bold">10:00 - 10:45 AM WAT</span>
<div className="flex items-center gap-1 px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-xs font-semibold uppercase">
<span className="material-symbols-outlined text-[13px]">bolt</span>
<span>Score: 96/100</span>
</div>
</div>
<h2 className="font-headline-lg text-headline-lg text-on-surface mt-1">Sterling &amp; Sterling Ltd</h2>
<div className="flex items-center justify-between font-body-md text-body-md">
<span className="text-on-surface-variant">Tunde Balogun</span>
<span className="font-metric-numeral-md text-metric-numeral-md text-primary">₦4.2M ACV</span>
</div>
</div>
{/* Attendees & Buying Committee */}
<div className="flex flex-col p-4 rounded-lg bg-surface-container-low gap-space-sm">
<div className="flex items-center justify-between">
<span className="text-xs font-semibold uppercase text-on-surface-variant uppercase">Buying Committee</span>
<span className="text-xs font-semibold uppercase text-primary">2 Verified</span>
</div>
<div className="flex flex-col gap-space-xs">
<div className="flex items-center justify-between py-1 bg-surface-container-lowest px-space-sm rounded shadow-sm">
<div className="flex items-center gap-space-sm min-w-0">
<div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-semibold uppercase">TB</div>
<div className="flex flex-col min-w-0">
<span className="text-sm font-semibold text-on-surface truncate">Tunde Balogun</span>
<span className="text-xs font-semibold uppercase text-on-surface-variant truncate">VP Ops • Decision Maker</span>
</div>
</div>
<span className="material-symbols-outlined text-[16px] text-primary">verified</span>
</div>
<div className="flex items-center justify-between py-1 bg-surface-container-lowest px-space-sm rounded shadow-sm">
<div className="flex items-center gap-space-sm min-w-0">
<div className="w-7 h-7 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary text-xs font-semibold uppercase">FO</div>
<div className="flex flex-col min-w-0">
<span className="text-sm font-semibold text-on-surface truncate">Folake Osin</span>
<span className="text-xs font-semibold uppercase text-on-surface-variant truncate">CISO • Security Gatekeeper</span>
</div>
</div>
<span className="material-symbols-outlined text-[16px] text-primary">verified</span>
</div>
</div>
</div>
{/* Meeting Objective & Prescribed Play */}
<div className="flex flex-col gap-space-xs">
<div className="flex items-center gap-1 text-xs font-semibold uppercase text-primary uppercase font-bold">
<span className="material-symbols-outlined text-[14px]">psychology</span>
<span>Prescribed Playbook &amp; Objective</span>
</div>
<div className="p-4 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md">
<p className="leading-relaxed">
 Address <strong className="font-semibold text-primary">SAP ERP Webhook latency</strong> (&lt;80ms guarantee) and confirm <strong className="font-semibold text-on-surface">NDPR on-soil hosting</strong> compliance within Lagos tier-3 data centers.
 </p>
</div>
</div>
{/* Telemetry & Bridge Status */}
<div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low/70 text-sm text-on-surface-variant">
<span className="flex items-center gap-1">
<span className="w-2 h-2 rounded-full bg-primary"></span>
 Twilio Telephony &amp; Zoom Bridge
 </span>
<span className="text-xs font-semibold uppercase text-primary font-bold">READY</span>
</div>
{/* Quick Action Buttons */}
<div className="flex flex-col gap-space-xs mt-1">
<button className="w-full flex items-center justify-center gap-space-xs py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-sm font-medium shadow-sm transition-all" type="button">
<span className="material-symbols-outlined text-[18px]">videocam</span>
<span>Join Meeting Link</span>
</button>
<div className="grid grid-cols-2 gap-space-xs">
<button className="flex items-center justify-center gap-1 py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container-high text-sm font-medium transition-all" type="button">
<span className="material-symbols-outlined text-[16px]">edit_calendar</span>
<span>Reschedule Slot</span>
</button>
<button className="flex items-center justify-center gap-1 py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container-high text-sm font-medium transition-all" type="button">
<span className="material-symbols-outlined text-[16px]">open_in_new</span>
<span>Open Lead Record</span>
</button>
</div>
<button className="w-full flex items-center justify-center gap-space-xs py-2 rounded-lg bg-inverse-surface text-inverse-on-surface hover:opacity-95 text-sm font-medium transition-all" type="button">
<span className="material-symbols-outlined text-[16px]">task_alt</span>
<span>Log Call Outcome</span>
<span className="ml-1 text-[11px] opacity-70">⌘ + Enter</span>
</button>
</div>
</div>
{/* Rep Calendar Load Module */}
<div className="flex flex-col p-4 rounded-xl bg-surface-container-lowest shadow-sm gap-space-sm">
<div className="flex items-center justify-between">
<span className="text-xs font-semibold uppercase uppercase text-on-surface-variant font-bold">Closer Bandwidth</span>
<span className="text-xs font-semibold uppercase text-primary">Live Dispatch</span>
</div>
<div className="flex flex-col gap-space-sm">
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between text-sm">
<span className="text-on-surface font-medium">Sarah Jenkins</span>
<span className="font-semibold text-primary">4 / 5 Demos</span>
</div>
<div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
<div className="h-full bg-primary rounded-full w-[80%]"></div>
</div>
</div>
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between text-sm">
<span className="text-on-surface font-medium">Femi Davies</span>
<span className="font-semibold text-tertiary">2 / 4 Demos</span>
</div>
<div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
<div className="h-full bg-tertiary rounded-full w-[50%]"></div>
</div>
</div>
</div>
</div>
</div>
</div>
</div></main>
 </>
 );
}
