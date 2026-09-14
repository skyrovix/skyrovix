import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import topNavLogo from "@/assets/top nav bar logo.png";
import { User, Mail, GraduationCap, Calendar, Globe, QrCode, Barcode } from "lucide-react";
import { getPublicSiteUrl } from "@/lib/constants";

type Props = {
  internId: string;
  fullName: string;
  domain: string;
  photoUrl?: string | null;
  issuedAt: string;
  email?: string | null;
  validUpto?: string | null;
};

// Code 39 Barcode Pattern Dictionary
const CODE39_PATTERNS: Record<string, string> = {
  '0': '101001101101', '1': '110100101011', '2': '101100101011', '3': '110110010101',
  '4': '101001101011', '5': '110100110101', '6': '101100110101', '7': '101001011011',
  '8': '110100101101', '9': '101100101101', 'A': '110101001011', 'B': '101101001011',
  'C': '110110100101', 'D': '101011001011', 'E': '110101100101', 'F': '101101100101',
  'G': '101010011011', 'H': '110101001101', 'I': '101101001101', 'J': '101011001101',
  'K': '110101010011', 'L': '101101010011', 'M': '110110101001', 'N': '101011010011',
  'O': '110101101001', 'P': '101101101001', 'Q': '101010110011', 'R': '110101011001',
  'S': '101101011001', 'T': '101011011001', 'U': '110010101011', 'V': '100110101011',
  'W': '110011010101', 'X': '100101101011', 'Y': '110010110101', 'Z': '100110110101',
  '-': '100101011011', '.': '110010101101', ' ': '100110101101', '*': '100101101101',
  '$': '100100100101', '/': '100100101001', '+': '100101001001', '%': '100100100100'
};

function getBarcodeBits(text: string): boolean[] {
  const clean = '*' + (text || '').toUpperCase().replace(/[^A-Z0-9\-\.\ \$\/\+\%]/g, '') + '*';
  const bits: boolean[] = [];
  for (const char of clean) {
    const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS['-'];
    for (const bit of pattern) {
      bits.push(bit === '1');
    }
    bits.push(false);
  }
  return bits;
}

export function BarcodeSVG({ value, height = 36 }: { value: string; height?: number }) {
  const bits = getBarcodeBits(value);
  const barWidth = 1.8;
  const totalWidth = bits.length * barWidth;
  return (
    <svg viewBox={`0 0 ${totalWidth} ${height}`} className="h-9 w-full max-w-[210px] mx-auto overflow-visible" preserveAspectRatio="none">
      {bits.map((isBar, i) =>
        isBar ? <rect key={i} x={i * barWidth} y={0} width={barWidth} height={height} fill="#0b1e48" /> : null
      )}
    </svg>
  );
}

export function IDCard({ internId, fullName, domain, photoUrl, issuedAt, email, validUpto }: Props) {
  const [showQR, setShowQR] = useState(false);
  const verifyUrl = `${getPublicSiteUrl()}/verify-certificate?intern=${internId}`;

  // Calculate Valid Upto date
  const computeValidUpto = () => {
    if (validUpto) return validUpto;
    const issueDate = new Date(issuedAt || Date.now());
    const year = isNaN(issueDate.getFullYear()) ? new Date().getFullYear() : issueDate.getFullYear();
    return `31 Dec ${year}`;
  };

  const validUntilStr = computeValidUpto();

  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[360px] aspect-[1/1.58] overflow-hidden rounded-[28px] bg-white text-slate-900 shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between select-none font-sans transition-all duration-300 hover:shadow-blue-500/10">
      
      {/* Decorative Top Curves */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none overflow-hidden">
        {/* Top Left Wave */}
        <svg className="absolute -top-4 -left-4 w-40 h-32 text-blue-500/20" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor">
          <path d="M0,0 L100,0 C60,40 40,80 0,100 Z" />
        </svg>
        <svg className="absolute top-0 left-0 w-32 h-28 text-blue-600/30" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor">
          <path d="M0,0 L100,0 C50,30 30,60 0,80 Z" />
        </svg>

        {/* Top Right Wave */}
        <svg className="absolute -top-4 -right-4 w-44 h-36 text-blue-600/25" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor">
          <path d="M100,0 L0,0 C40,40 60,90 100,100 Z" />
        </svg>
        <svg className="absolute top-0 right-0 w-36 h-28 text-blue-500/15" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor">
          <path d="M100,0 L0,0 C50,30 70,60 100,80 Z" />
        </svg>
      </div>

      {/* Decorative Bottom Curves */}
      <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none overflow-hidden">
        {/* Bottom Left Wave */}
        <svg className="absolute bottom-0 left-0 w-36 h-24 text-blue-500/20" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor">
          <path d="M0,100 L100,100 C60,60 30,30 0,0 Z" />
        </svg>
        {/* Bottom Right Wave */}
        <svg className="absolute bottom-0 right-0 w-44 h-28 text-blue-600/30" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor">
          <path d="M100,100 L0,100 C40,60 70,20 100,0 Z" />
        </svg>
      </div>

      {/* Quick QR / Barcode Toggle Button */}
      <button 
        type="button"
        onClick={() => setShowQR(!showQR)} 
        className="absolute top-3.5 right-3.5 z-20 grid size-7 place-items-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105 transition-all border border-blue-200/60 shadow-xs"
        title={showQR ? "Show Barcode" : "Show QR Code"}
      >
        {showQR ? <Barcode className="size-4" /> : <QrCode className="size-4" />}
      </button>

      {/* Card Content Outer Container */}
      <div className="relative z-10 p-5 pt-4 flex-1 flex flex-col justify-between">
        
        {/* 1. Header Section */}
        <div className="text-center pt-1">
          <div className="flex items-center justify-center">
            <img src={topNavLogo} alt="Skyrovix Logo" className="h-10 sm:h-11 w-auto max-w-[210px] object-contain drop-shadow-xs" />
          </div>
          <p className="text-[11px] font-semibold text-[#0b2545] tracking-tight mt-0.5">
            Virtual Internship and Training Platform
          </p>
        </div>

        {/* 2. Photo Section */}
        <div className="my-2.5 flex justify-center">
          <div className="size-28 sm:size-32 rounded-2xl border-[2.5px] border-[#0066ff] p-0.5 bg-white shadow-md overflow-hidden relative">
            {photoUrl ? (
              <img src={photoUrl} alt={fullName} className="size-full object-cover rounded-[14px]" />
            ) : (
              <div className="grid size-full place-items-center bg-gradient-to-br from-blue-600 to-indigo-800 text-white text-3xl font-extrabold rounded-[14px]">
                {fullName ? fullName.charAt(0).toUpperCase() : "I"}
              </div>
            )}
          </div>
        </div>

        {/* 3. Name & Role Section */}
        <div className="text-center px-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0b1e48] tracking-tight leading-tight">
            {fullName}
          </h2>
          <p className="text-xs sm:text-sm font-bold text-[#0b1e48] tracking-[0.2em] uppercase mt-0.5">
            INTERN
          </p>
          <div className="w-14 h-[2px] bg-[#0066ff] rounded-full mx-auto my-1.5" />
        </div>

        {/* 4. Details List Section */}
        <div className="my-2.5 px-3 sm:px-4 space-y-1.5 text-xs text-[#0b1e48]">
          
          {/* ID No */}
          <div className="flex items-center gap-2">
            <User className="size-4 text-[#0066ff] shrink-0" />
            <span className="w-20 font-semibold text-[#334155]">ID No</span>
            <span className="font-bold text-[#64748b]">:</span>
            <span className="font-bold text-[#0b1e48] truncate tracking-tight">{internId}</span>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-[#0066ff] shrink-0" />
            <span className="w-20 font-semibold text-[#334155]">Email</span>
            <span className="font-bold text-[#64748b]">:</span>
            <span className="font-bold text-[#0b1e48] truncate tracking-tight">{email || "N/A"}</span>
          </div>

          {/* Domain */}
          <div className="flex items-center gap-2">
            <GraduationCap className="size-4 text-[#0066ff] shrink-0" />
            <span className="w-20 font-semibold text-[#334155]">Domain</span>
            <span className="font-bold text-[#64748b]">:</span>
            <span className="font-bold text-[#0b1e48] truncate tracking-tight">{domain}</span>
          </div>

          {/* Valid Upto */}
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-[#0066ff] shrink-0" />
            <span className="w-20 font-semibold text-[#334155]">Valid Upto</span>
            <span className="font-bold text-[#64748b]">:</span>
            <span className="font-bold text-[#0b1e48] truncate tracking-tight">{validUntilStr}</span>
          </div>

        </div>

        {/* 5. Barcode / QR Code Section */}
        <div className="my-2 text-center flex flex-col items-center justify-center min-h-[58px]">
          {showQR ? (
            <div className="flex flex-col items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-100 shadow-xs">
              <QRCodeSVG value={verifyUrl} size={50} />
              <span className="text-[9px] font-bold text-blue-600 tracking-wider uppercase">Scan to Verify</span>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <BarcodeSVG value={internId} height={32} />
              <span className="font-mono text-[11px] font-extrabold text-[#0b1e48] tracking-[0.2em] mt-0.5">
                {internId}
              </span>
            </div>
          )}
        </div>

        {/* 6. Footer Section */}
        <div className="pt-2 flex items-center justify-between text-[11px] font-semibold text-[#0066ff] border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Globe className="size-3.5 text-[#0066ff]" />
            <span>skyrovix.online</span>
          </div>
          <div className="italic tracking-tight">
            Learn | Build | Grow
          </div>
        </div>

      </div>
    </div>
  );
}
