"use client";

import { useRef, useState } from 'react';
import { Printer, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface CertificateProps {
    participantName: string;
    bootcampName?: string;
    internshipName?: string;
    category: string;
    dateOfParticipation: string;
    certificateId: string;
    qrCodeUrl?: string;
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
    qrCodeUrl,
    type = 'bootcamp',
    issuingAuthority = "Aatomate"
}: CertificateProps) {
    const certificateRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const programName = type === 'internship' ? internshipName : bootcampName || 'Program';
    const displayCategory = category ? ` - ${category}` : '';

    return (
        <div className="bg-transparent print:p-0 flex flex-col items-center justify-center py-10 w-full overflow-hidden">
            {/* Global Styles for Typography and specific text effects */}
            <style dangerouslySetInnerHTML={{__html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=Outfit:wght@400;600;800&display=swap');
                
                .student-name-gradient-shared {
                    background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 50%, #0f172a 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    color: transparent;
                    filter: drop-shadow(0 4px 12px rgba(29, 78, 216, 0.15));
                }

                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 0;
                    }
                    html, body {
                        width: 297mm;
                        height: 210mm;
                        background: white;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                    .print\\:p-0 {
                        padding: 0 !important;
                    }
                    .print\\:bg-white {
                        background: white !important;
                    }
                    .print\\:transform-none {
                        transform: none !important;
                    }
                }
            `}} />

            {/* Controls - Hidden in print */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[1100px] mx-auto mb-8 flex justify-end gap-3 print:hidden"
            >
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-600/30 transition-all font-bold group"
                >
                    <Printer size={20} className="group-hover:scale-110 transition-transform" />
                    Print / Download PDF
                </button>
            </motion.div>

            {/* Certificate Container - Landscape Aspect Ratio A4 (297x210) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                ref={certificateRef}
                className="w-full max-w-[1100px] relative overflow-hidden bg-white shadow-2xl print:shadow-none mx-auto print:transform-none transition-all duration-500 ease-out rounded-xl"
                style={{
                    aspectRatio: '297 / 210',
                    fontFamily: "'Inter', sans-serif",
                    backgroundColor: '#ffffff',
                    transform: isHovered && typeof window !== 'undefined' && !window.matchMedia('print').matches 
                        ? 'translateY(-4px) scale(1.01)' 
                        : 'translateY(0) scale(1)',
                    boxShadow: isHovered && typeof window !== 'undefined' && !window.matchMedia('print').matches
                        ? '0 30px 60px -15px rgba(37, 99, 235, 0.3), 0 20px 40px -10px rgba(0, 0, 0, 0.1)'
                        : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
            >
                {/* Golden/Blue Inner Frame */}
                <div className="absolute inset-6 border-[3px] border-blue-900/10 pointer-events-none z-10 rounded-sm"></div>
                <div className="absolute inset-8 border border-blue-800/20 pointer-events-none z-10 rounded-sm"></div>

                {/* Elegant Corner Ornaments */}
                <svg className="absolute top-6 left-6 w-16 h-16 text-blue-900/30 z-20 pointer-events-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0H100V4H4V100H0V0Z" fill="currentColor"/>
                    <path d="M12 12H88V16H16V88H12V12Z" fill="currentColor" opacity="0.5"/>
                </svg>
                <svg className="absolute top-6 right-6 w-16 h-16 text-blue-900/30 z-20 pointer-events-none transform rotate-90" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0H100V4H4V100H0V0Z" fill="currentColor"/>
                    <path d="M12 12H88V16H16V88H12V12Z" fill="currentColor" opacity="0.5"/>
                </svg>
                <svg className="absolute bottom-6 left-6 w-16 h-16 text-blue-900/30 z-20 pointer-events-none transform -rotate-90" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0H100V4H4V100H0V0Z" fill="currentColor"/>
                    <path d="M12 12H88V16H16V88H12V12Z" fill="currentColor" opacity="0.5"/>
                </svg>
                <svg className="absolute bottom-6 right-6 w-16 h-16 text-blue-900/30 z-20 pointer-events-none transform rotate-180" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0H100V4H4V100H0V0Z" fill="currentColor"/>
                    <path d="M12 12H88V16H16V88H12V12Z" fill="currentColor" opacity="0.5"/>
                </svg>

                {/* Rich Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-[0.025] pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l1.414 1.414-1.414 1.414-1.414-1.414L54.627 0zM27.314 27.314l1.414 1.414-1.414 1.414-1.414-1.414 1.414-1.414zM0 54.627l1.414 1.414-1.414 1.414-1.414-1.414L0 54.627z' fill='%231d4ed8' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                    }}>
                </div>

                {/* Center Radial Gradient for Focus */}
                <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.9)_0%,rgba(248,250,252,0.9)_100%)] pointer-events-none mix-blend-overlay"></div>
                <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.05)_0%,transparent_50%)] pointer-events-none"></div>
                <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(37,99,235,0.05)_0%,transparent_50%)] pointer-events-none"></div>

                {/* Subtle Center Logo Watermark */}
                <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <div className="w-[500px] h-[500px] border-[20px] border-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-[12rem] font-black text-blue-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Aa</span>
                    </div>
                </div>

                {/* Inner Content Container */}
                <div className="relative h-full flex flex-col p-20 z-10 box-border justify-between">

                    {/* Top Section */}
                    <header className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                                <span className="text-3xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Aa</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-black text-slate-900 tracking-tight leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>Aatomate</span>
                                <span className="text-blue-600 font-medium tracking-widest text-xs mt-1 uppercase">AI Agents Platform</span>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <div className="bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 mb-4 inline-flex items-center gap-2">
                                <ShieldCheck size={14} className="text-blue-600" />
                                <span className="text-xs font-bold tracking-[0.2em] text-blue-800 uppercase">Verified Credential</span>
                            </div>
                            <p className="text-sm font-bold tracking-[0.4em] text-slate-400 uppercase mb-1">
                                Certificate of
                            </p>
                            <h1 className="text-5xl text-blue-900 uppercase tracking-widest leading-none font-black" style={{ fontFamily: "'Playfair Display', serif" }}>
                                {type === 'internship' ? 'Completion' : 'Participation'}
                            </h1>
                        </div>
                    </header>

                    {/* Main Body */}
                    <main className="flex-1 text-center flex flex-col items-center justify-center mt-4">
                        <p className="text-2xl text-slate-500 italic mb-10 font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
                            This is proudly presented to
                        </p>

                        <div className="relative mb-12 w-full max-w-4xl">
                            <h2
                                className="text-8xl font-black mb-8 px-12 tracking-tight student-name-gradient-shared"
                                style={{
                                    fontFamily: "'Playfair Display', serif",
                                    lineHeight: 1.1
                                }}
                            >
                                {participantName}
                            </h2>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-slate-300"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-4 text-sm text-slate-400 font-mono tracking-widest uppercase rounded-full border border-slate-200">
                                        For outstanding performance
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-4">
                            <p className="text-xl text-slate-600 leading-relaxed font-light">
                                has successfully {type === 'internship' ? 'completed the internship in' : 'attended the program for'} 
                            </p>
                            <p className="text-2xl font-bold text-slate-900">
                                {programName}<span className="text-blue-600">{displayCategory}</span>
                            </p>
                            <p className="text-lg text-slate-500 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                                demonstrating exceptional skills, dedication, and commitment to excellence.
                            </p>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="mt-12 flex items-end justify-between pt-6 border-t border-slate-100">
                        {/* Left Signatures */}
                        <div className="flex gap-16">
                            <div className="text-center relative">
                                <div className="h-20 flex items-end justify-center mb-3">
                                    {/* Simulated elegant signature */}
                                    <span style={{ 
                                        fontFamily: "'Playfair Display', serif", 
                                        fontSize: '2.5rem', 
                                        color: '#0f172a', 
                                        fontStyle: 'italic',
                                        opacity: 0.8,
                                        transform: 'rotate(-5deg) translateY(10px)',
                                        display: 'inline-block'
                                    }}>
                                        Authorized
                                    </span>
                                </div>
                                <div className="border-t-2 border-slate-800 pt-3 w-56 mx-auto">
                                    <p className="font-bold text-slate-900 text-sm tracking-wide">{issuingAuthority}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Issuing Authority</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Info */}
                        <div className="flex flex-col items-end text-right">
                            <div className="mb-4 text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date of Issuance</p>
                                <p className="font-semibold text-sm text-slate-700">{dateOfParticipation}</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Certificate ID</p>
                                    <p className="font-mono text-xs font-bold text-blue-900 tracking-wider">{certificateId}</p>
                                </div>
                                <div className="w-10 h-10 bg-white border border-slate-200 rounded p-1 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-slate-900"><path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z"/><path d="M9 15h2v2h-2zM19 15h2M15 19h2"/></svg>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </motion.div>
        </div>
    );
}
