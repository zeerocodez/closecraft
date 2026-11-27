'use client';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
export function Logo({ dark = false }: {
    dark?: boolean;
}) { return <a href="/" className={'logo ' + (dark ? 'light' : '')} aria-label="DSS home"><svg width="33" height="33" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2v36M2 20h36M7.3 7.3l25.4 25.4M7.3 32.7L32.7 7.3" stroke="currentColor" strokeWidth="6"/></svg><span>DSS<span className="logo-dot">.</span></span></a>; }
export function Action({ children, onClick, href, secondary = false }: {
    children: React.ReactNode;
    onClick?: () => void;
    href?: string;
    secondary?: boolean;
}) { const c = 'button ' + (secondary ? 'secondary' : 'primary'); return href ? <a className={c} href={href}>{children}<ArrowUpRight size={18}/></a> : <button className={c} onClick={onClick}>{children}<ArrowUpRight size={18}/></button>; }
export function Modal({ open, onClose, title, children }: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}) { const ref = useRef<HTMLDialogElement>(null); useEffect(() => { const el = ref.current; if (open && !el?.open)
    el?.showModal(); if (!open && el?.open)
    el.close(); }, [open]); return <dialog ref={ref} className="modal" onCancel={onClose} onClick={e => { if (e.target === ref.current)
    onClose(); }} aria-labelledby="modal-title"><button className="close-modal" onClick={onClose} aria-label="Close dialog">×</button><div className="eyebrow">THE DIGITAL SALES SCHOOL</div><h2 id="modal-title">{title}</h2>{children}</dialog>; }
export const money = (kobo: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(kobo / 100);
