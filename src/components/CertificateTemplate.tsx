"use client";

import { useRef } from 'react';
import { Printer } from 'lucide-react';

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

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-white print:p-0 flex flex-col items-center justify-center min-h-screen">
            {/* Global Styles for Typography and specific text effects */}
            <style dangerouslySetInnerHTML={{__html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
                
                .student-name-gradient-shared {
                    background: linear-gradient(135deg, #1e293b 0%, #2563eb 50%, #1e293b 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    color: transparent;
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
                }
            `}} />

            {/* Controls - Hidden in print */}
            <div className="w-full max-w-[1100px] mx-auto mb-6 flex justify-end gap-3 print:hidden">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg"
                >
                    <Printer size={18} />
                    Print / Download PDF
                </button>
            </div>

            {/* Certificate Container - Landscape Aspect Ratio A4 (297x210) */}
            <div
                ref={certificateRef}
                className="w-full max-w-[1100px] relative overflow-hidden bg-white shadow-2xl print:shadow-none mx-auto"
                style={{
                    aspectRatio: '297 / 210',
                    fontFamily: "'Inter', sans-serif",
                    backgroundColor: '#ffffff'
                }}
            >
                {/* Border Frame */}
                <div className="absolute inset-8 border-4 border-double border-blue-900/20 pointer-events-none z-10"></div>
                <div className="absolute inset-10 border border-blue-900/10 pointer-events-none z-10"></div>

                {/* Corner Decoration */}
                <div className="absolute top-8 left-8 w-8 h-8 border-l-4 border-t-4 border-blue-800 z-20"></div>
                <div className="absolute top-8 right-8 w-8 h-8 border-r-4 border-t-4 border-blue-800 z-20"></div>
                <div className="absolute bottom-8 left-8 w-8 h-8 border-l-4 border-b-4 border-blue-800 z-20"></div>
                <div className="absolute bottom-8 right-8 w-8 h-8 border-r-4 border-b-4 border-blue-800 z-20"></div>

                {/* Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle at 50% 50%, #2563eb 1px, transparent 1px), radial-gradient(circle at 0% 0%, #2563eb 1px, transparent 1px), radial-gradient(circle at 100% 0%, #2563eb 1px, transparent 1px), radial-gradient(circle at 100% 100%, #2563eb 1px, transparent 1px), radial-gradient(circle at 0% 100%, #2563eb 1px, transparent 1px)`,
                        backgroundSize: '40px 40px, 60px 60px, 60px 60px, 60px 60px, 60px 60px'
                    }}>
                </div>

                {/* Vignette Overlay */}
                <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(37,99,235,0.03)_100%)] pointer-events-none"></div>

                {/* Inner Content Container */}
                <div className="relative h-full flex flex-col p-24 z-10 box-border">

                    {/* Top Section with Logo */}
                    <header className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <img
                                src="/aatomate.jpeg"
                                alt="Aatomate"
                                className="h-16 w-auto object-contain rounded-lg"
                            />
                            <span className="text-3xl font-black text-blue-900 tracking-tight">Aatomate</span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold tracking-[0.3em] text-blue-500 uppercase mb-2">
                                Certificate of
                            </p>
                            <h1 className="text-5xl text-slate-900 uppercase tracking-widest leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                                {type === 'internship' ? 'Completion' : 'Participation'}
                            </h1>
                        </div>
                    </header>

                    {/* Main Body */}
                    <main className="flex-1 text-center flex flex-col items-center justify-center">
                        <p className="text-xl text-slate-500 italic mb-8 font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
                            This is to certify that
                        </p>

                        <div className="relative mb-10 w-full max-w-4xl">
                            <h2
                                className="text-7xl font-bold mb-6 px-12 tracking-tight student-name-gradient-shared"
                                style={{
                                    fontFamily: "'Playfair Display', serif"
                                }}
                            >
                                {participantName}
                            </h2>
                            <div className="h-px w-64 mx-auto bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                        </div>

                        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto mb-4 font-light">
                            has successfully {type === 'internship' ? 'completed the internship in' : 'attended the'} <span className="font-semibold text-slate-900">{type === 'internship' ? internshipName : bootcampName || 'Program'}</span> {category ? `(${category})` : ''}
                            <br />demonstrating dedication and commitment to excellence.
                        </p>

                        <p className="text-lg text-slate-600 font-medium">
                            on {dateOfParticipation}
                        </p>
                    </main>

                    {/* Footer */}
                    <footer className="mt-8 pt-8 flex items-end justify-between">
                        {/* Left Signatures */}
                        <div className="flex gap-16">
                            <div className="text-center relative">
                                <div className="h-16 flex items-end justify-center mb-2">
                                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#1e3a8a', fontStyle: 'italic' }}>Authorized</span>
                                </div>
                                <div className="border-t-2 border-blue-900 pt-2 w-48 mx-auto">
                                    <p className="font-bold text-slate-900 text-sm">{issuingAuthority}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Issuing Authority</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Info */}
                        <div className="flex items-end gap-6">
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Certificate ID</p>
                                <p className="font-mono text-xs text-slate-600 tracking-wide mb-3">{certificateId}</p>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
