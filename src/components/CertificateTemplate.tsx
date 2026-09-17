"use client";

import { useRef, useState, useEffect } from 'react';
import { Printer, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';

interface CertificateProps {
    participantName: string;
    bootcampName?: string;
    internshipName?: string;
    category: string;
    dateOfParticipation: string;
    certificateId: string;
    type?: 'bootcamp' | 'internship';
    issuingAuthority?: string;
}

export default function CertificateTemplate({
    participantName = "Participant Name",
    bootcampName = "",
    internshipName = "",
    category = "",
    dateOfParticipation = "",
    certificateId = "",
    type = 'bootcamp',
    issuingAuthority = "Aatomate"
}: CertificateProps) {
    const certRef = useRef<HTMLDivElement>(null);
    const [qrDataUrl, setQrDataUrl] = useState<string>('');

    useEffect(() => {
        const verifyUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/verify/${certificateId}`
            : `https://aatomate.com/verify/${certificateId}`;
        QRCode.toDataURL(verifyUrl, {
            width: 160,
            margin: 1,
            color: { dark: '#0d3d56', light: '#ffffff' },
            errorCorrectionLevel: 'H'
        }).then(setQrDataUrl).catch(console.error);
    }, [certificateId]);

    const programName = type === 'internship' ? internshipName : bootcampName || 'Program';
    const shortId = `AAT-${(certificateId || '').substring(0, 8).toUpperCase()}`;

    return (
        <div className="flex flex-col items-center justify-center py-10 w-full">
            <style dangerouslySetInnerHTML={{__html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&display=swap');

                .cert-name-text {
                    background: linear-gradient(120deg, #0d3d56 0%, #0e7490 45%, #0d3d56 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .cert-seal {
                    background: conic-gradient(from 0deg, #0d3d56, #0e7490, #15b8d4, #0e7490, #0d3d56);
                }

                @media print {
                    @page { size: A4 landscape; margin: 0; }
                    html, body { width: 297mm; height: 210mm; }
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .no-print { display: none !important; }
                    #cert-container {
                        position: absolute; left: 0; top: 0;
                        width: 297mm; height: 210mm;
                        border-radius: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .cert-spine {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        background: linear-gradient(180deg, #0d3d56 0%, #0e7490 50%, #0d3d56 100%) !important;
                    }
                }
            `}} />

            {/* Action Bar */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="no-print w-full max-w-[1100px] mx-auto mb-6 flex justify-between items-center px-2"
            >
                <a href="/admin/certificates" className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-colors font-medium">
                    ← Back to Certificates
                </a>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#0d3d56] text-white rounded-xl hover:bg-[#0e7490] hover:shadow-lg hover:shadow-[#0d3d56]/30 transition-all font-semibold text-sm"
                >
                    <Printer size={16} />
                    Print / Save PDF
                </button>
            </motion.div>

            {/* Certificate */}
            <motion.div
                id="cert-container"
                ref={certRef}
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[1100px] mx-auto rounded-2xl overflow-hidden relative"
                style={{
                    aspectRatio: '297 / 210',
                    fontFamily: "'Inter', sans-serif",
                    backgroundColor: '#ffffff',
                    boxShadow: '0 40px 100px -20px rgba(13,61,86,0.25), 0 0 0 1px rgba(13,61,86,0.05)'
                }}
            >
                {/* ── LEFT TEAL SPINE ── */}
                <div
                    className="cert-spine absolute left-0 top-0 h-full w-[54px] z-10 flex flex-col items-center justify-between py-8"
                    style={{
                        background: 'linear-gradient(180deg, #0d3d56 0%, #0e7490 50%, #0d3d56 100%)',
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact'
                    } as React.CSSProperties}
                >
                    {/* Top circle logo */}
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <img src="/aatomate.jpeg" alt="" className="w-7 h-7 object-contain rounded-full" />
                    </div>
                    {/* Rotated text */}
                    <span
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '8px', letterSpacing: '0.35em', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold', textTransform: 'uppercase', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        Certificate of {type === 'internship' ? 'Completion' : 'Participation'} · Aatomate
                    </span>
                    {/* Bottom ID */}
                    <span
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '7px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}
                    >
                        {shortId}
                    </span>
                </div>

                {/* ── MAIN CONTENT AREA ── */}
                <div className="absolute inset-0 left-[54px] flex flex-col">

                    {/* Subtle background decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {/* Dot grid */}
                        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, #0d3d56 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
                        {/* Top-right teal wash */}
                        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, #0e7490 0%, transparent 70%)' }}></div>
                        {/* Bottom-left teal wash */}
                        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #0e7490 0%, transparent 70%)' }}></div>
                        {/* Watermark logo */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.025]">
                            <img src="/aatomate.jpeg" alt="" className="w-72 h-72 object-contain" style={{ filter: 'grayscale(1)' }} />
                        </div>
                    </div>

                    {/* ── HEADER ── */}
                    <header className="relative flex items-center justify-between px-10 pt-7 pb-5" style={{ borderBottom: '1px solid rgba(13,61,86,0.08)' }}>
                        {/* Logo + wordmark */}
                        <div className="flex items-center gap-3">
                            <img src="/aatomate.jpeg" alt="Aatomate" className="h-12 w-12 object-contain rounded-xl shadow-sm" style={{ border: '1px solid rgba(13,61,86,0.1)' }} />
                            <div>
                                <p className="font-black text-[20px] text-[#0d3d56] leading-none tracking-tight">aatomate</p>
                                <p className="text-[9px] font-semibold tracking-[0.3em] text-[#0e7490] uppercase mt-0.5">AI Automation Agency</p>
                            </div>
                        </div>

                        {/* Title block */}
                        <div className="flex flex-col items-end">
                            {/* Verified pill */}
                            <div className="flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full" style={{ background: 'rgba(14,116,144,0.08)', border: '1px solid rgba(14,116,144,0.2)' }}>
                                <ShieldCheck size={11} className="text-[#0e7490]" />
                                <span className="text-[9px] font-bold tracking-[0.2em] text-[#0d3d56] uppercase">Verified Credential</span>
                            </div>
                            <p className="text-[8px] font-bold tracking-[0.4em] text-slate-400 uppercase mb-1">Certificate of</p>
                            <h1 className="text-[34px] font-black uppercase text-[#0d3d56] leading-none" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.08em' }}>
                                {type === 'internship' ? 'Completion' : 'Participation'}
                            </h1>
                        </div>
                    </header>

                    {/* ── BODY ── */}
                    <main className="relative flex-1 flex items-center gap-8 px-10 py-4">
                        {/* Award text */}
                        <div className="flex-1 flex flex-col items-center text-center">
                            <p className="text-[13px] text-slate-400 italic mb-4 font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
                                This is proudly awarded to
                            </p>

                            {/* Name — scales down for long names, never clips */}
                            <h2
                                className="cert-name-text font-black tracking-tight leading-none mb-5 w-full"
                                style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: 'clamp(32px, 5vw, 64px)',
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word',
                                    lineHeight: 1.1,
                                }}
                            >
                                {participantName}
                            </h2>

                            {/* Decorative divider */}
                            <div className="flex items-center gap-3 mb-5 w-full max-w-xs">
                                <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(14,116,144,0.4))' }}></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-[#0e7490]"></div>
                                <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(14,116,144,0.4))' }}></div>
                            </div>

                            {/* Achievement text */}
                            <div className="space-y-1.5">
                                <p className="text-[13px] text-slate-500 font-light">
                                    has successfully {type === 'internship' ? 'completed the internship program in' : 'attended the program for'}
                                </p>
                                <p className="text-[17px] font-bold text-[#0d3d56]">
                                    {programName}
                                    {category ? <span className="text-[#0e7490]"> ({category})</span> : ''}
                                </p>
                                <p className="text-[11px] text-slate-400 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    demonstrating exceptional dedication and commitment to excellence.
                                </p>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex-shrink-0 flex flex-col items-center gap-2">
                            <div className="rounded-2xl p-2 shadow-md" style={{ background: 'white', border: '1.5px solid rgba(13,61,86,0.12)' }}>
                                {qrDataUrl ? (
                                    <img src={qrDataUrl} alt="Scan to verify" className="w-[80px] h-[80px] block" />
                                ) : (
                                    <div className="w-[80px] h-[80px] bg-slate-100 rounded-lg animate-pulse" />
                                )}
                            </div>
                            <p className="text-[7px] font-bold tracking-widest uppercase text-slate-400 text-center">Scan to e-verify</p>
                            <p className="text-[6.5px] font-mono text-slate-300 text-center">aatomate.com/verify</p>
                        </div>
                    </main>

                    {/* ── FOOTER ── */}
                    <footer className="relative flex items-end justify-between px-10 pb-7 pt-4" style={{ borderTop: '1px solid rgba(13,61,86,0.08)' }}>

                        {/* Single signature — Amit Dhiman */}
                        <div className="flex flex-col items-start">
                            <div className="h-14 mb-1.5 flex items-end">
                                <img
                                    src="/sig-amit-real.jpg"
                                    alt="Amit Dhiman Signature"
                                    className="h-14 w-auto object-contain"
                                    style={{ mixBlendMode: 'multiply', filter: 'contrast(1.6) brightness(0.8) saturate(0.9)' }}
                                />
                            </div>
                            <div className="pt-2 w-44" style={{ borderTop: '2px solid #0d3d56' }}>
                                <p className="font-bold text-[#0d3d56] text-[11px] tracking-wide">Amit Dhiman</p>
                                <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-0.5">Co-Founder &amp; CEO, Aatomate</p>
                            </div>
                        </div>

                        {/* Center seal */}
                        <div className="flex flex-col items-center">
                            <div className="cert-seal w-12 h-12 rounded-full flex items-center justify-center shadow-md mb-2">
                                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
                                    <img src="/aatomate.jpeg" alt="" className="w-7 h-7 object-contain rounded-full" />
                                </div>
                            </div>
                            <p className="text-[8px] text-slate-400 uppercase tracking-widest">Date of Issue</p>
                            <p className="text-[11px] font-bold text-[#0d3d56] mt-0.5">{dateOfParticipation}</p>
                        </div>

                        {/* Certificate ID block */}
                        <div className="flex flex-col items-end">
                            <div className="rounded-xl px-4 py-2.5 text-right" style={{ background: 'rgba(13,61,86,0.03)', border: '1px solid rgba(13,61,86,0.08)' }}>
                                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Certificate ID</p>
                                <p className="font-mono text-[11px] font-bold text-[#0d3d56] tracking-wider">{shortId}</p>
                                <p className="font-mono text-[7px] text-slate-300 mt-0.5 tracking-wide break-all max-w-[160px]">{certificateId}</p>
                            </div>
                        </div>
                    </footer>

                </div>
            </motion.div>
        </div>
    );
}
