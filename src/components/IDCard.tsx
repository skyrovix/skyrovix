import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import logo from "@/assets/logo.png";
import { Globe, QrCode, Barcode, CheckCircle2 } from "lucide-react";
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

export function BarcodeSVG({ value, height = 30 }: { value: string; height?: number }) {
  const bits = getBarcodeBits(value);
  const barWidth = 1.8;
  const totalWidth = bits.length * barWidth;
  return (
    <svg viewBox={`0 0 ${totalWidth} ${height}`} className="h-7 w-full max-w-[200px] mx-auto overflow-visible" preserveAspectRatio="none">
      {bits.map((isBar, i) =>
        isBar ? <rect key={i} x={i * barWidth} y={0} width={barWidth} height={height} fill="#07284a" /> : null
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
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[350px] overflow-hidden rounded-[22px] bg-white text-slate-900 shadow-xl border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between select-none font-sans transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
      
      {/* 1. Executive Dark Navy Header */}
      <div className="relative bg-gradient-to-b from-[#061a33] via-[#092952] to-[#0c3970] px-5 pt-3 pb-8 text-white">
        {/* Realistic Lanyard Slot */}
        <div className="mx-auto w-12 h-2.5 rounded-full bg-slate-950/60 border border-white/20 shadow-inner mb-3 flex items-center justify-center">
          <div className="w-8 h-1 rounded-full bg-white/15" />
        </div>

        {/* Company Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-white/10 border border-white/20 p-1 grid place-items-center backdrop-blur-xs">
              <img src={logo} alt="Skyrovix Logo" className="size-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wider block leading-none text-white">SKYROVIX</span>
              <span className="text-[8.5px] text-blue-200 font-medium tracking-wide block mt-0.5">Skill Development & Future Tech</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-emerald-300 tracking-wider font-mono">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            INTERN
          </div>
        </div>

        {/* Toggle QR/Barcode Button in top-right */}
        <button 
          type="button"
          onClick={() => setShowQR(!showQR)} 
          className="absolute top-2.5 right-3.5 grid size-6 place-items-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
          title={showQR ? "Show Barcode" : "Show QR Code"}
        >
          {showQR ? <Barcode className="size-3.5" /> : <QrCode className="size-3.5" />}
        </button>
      </div>

      {/* 2. Photo Section (overlapping header) */}
      <div className="-mt-8 flex justify-center relative z-10">
        <div className="size-24 sm:size-26 rounded-2xl p-1 bg-white shadow-xl ring-1 ring-slate-200/80 relative">
          <div className="size-full rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
            {photoUrl ? (
              <img src={photoUrl} alt={fullName} className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center bg-gradient-to-br from-[#061a33] to-[#1e40af] text-white text-2xl font-black">
                {fullName ? fullName.charAt(0).toUpperCase() : "I"}
              </div>
            )}
          </div>
          {/* Active Verified Status Badge */}
          <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-[#061a33] text-emerald-400 flex items-center justify-center shadow-md ring-2 ring-white" title="Verified Credential">
            <CheckCircle2 className="size-3.5" />
          </div>
        </div>
      </div>

      {/* 3. Name, Role & Domain */}
      <div className="text-center px-4 mt-2">
        <h2 className="text-lg sm:text-xl font-black text-[#061a33] tracking-tight leading-tight uppercase truncate">
          {fullName}
        </h2>
        <p className="text-[10px] font-extrabold text-blue-600 tracking-[0.25em] uppercase mt-0.5">
          Virtual Intern
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 mt-1 rounded-full bg-blue-50/90 border border-blue-200/80 text-[10px] font-bold text-[#061a33] max-w-full">
          <span className="size-1.5 rounded-full bg-blue-600 shrink-0" />
          <span className="truncate">{domain}</span>
        </div>
      </div>

      {/* 4. Professional Details Specification Grid */}
      <div className="mx-4 my-2.5 p-3 bg-slate-50/90 rounded-xl border border-slate-200/80 text-left">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-slate-500 block">Intern ID</span>
            <span className="font-mono font-bold text-xs text-[#061a33] tracking-tight block truncate">{internId}</span>
          </div>
          <div>
            <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-slate-500 block">Valid Thru</span>
            <span className="font-semibold text-xs text-slate-800 block truncate">{validUntilStr}</span>
          </div>
          <div className="col-span-2 border-t border-slate-200/60 pt-1.5 mt-0.5">
            <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-slate-500 block">Email Address</span>
            <span className="font-semibold text-xs text-slate-800 block truncate">{email || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* 5. Barcode & QR Code Section */}
      <div className="px-4 py-1 text-center flex flex-col items-center justify-center min-h-[48px]">
        {showQR ? (
          <div className="flex flex-col items-center gap-1 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
            <QRCodeSVG value={verifyUrl} size={48} />
            <span className="text-[8px] font-bold text-slate-500 tracking-wider uppercase">Scan to Verify</span>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <BarcodeSVG value={internId} height={24} />
            <span className="font-mono text-[9px] font-bold text-slate-600 tracking-[0.25em] mt-0.5">
              {internId}
            </span>
            <span className="text-[7.5px] font-semibold text-slate-400 tracking-[0.16em] uppercase mt-1">
              Official Authenticated Credential
            </span>
          </div>
        )}
      </div>

      {/* 6. Corporate Dark Navy Footer */}
      <div className="bg-[#061a33] px-4 py-2 flex items-center justify-between text-[10px] text-white">
        <div className="flex items-center gap-1.5 text-blue-200 font-medium">
          <Globe className="size-3 text-blue-300" />
          <span>skyrovix.online</span>
        </div>
        <div className="text-slate-300 text-[9px] font-semibold tracking-wider uppercase">
          Empower · Innovate
        </div>
      </div>

    </div>
  );
}
