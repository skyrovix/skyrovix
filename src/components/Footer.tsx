import { Logo } from "./Logo";
import msme from "@/assets/msme.png";
import { Link } from "@tanstack/react-router";
import { 
  Rocket, ShieldCheck, Linkedin, Github, Instagram, Youtube, 
  Code2, Database, Brain, Palette, Shield, Cloud, ArrowRight,
  Building2, Users, CheckCircle2, Award, Clock, Mail, MapPin,
  HelpCircle, LayoutDashboard, Lock, FileSignature, 
  RotateCcw, Map, Star, FileText, Briefcase, ChevronDown
} from "lucide-react";

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative border-t border-slate-100 bg-white text-slate-600" role="contentinfo">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-8">
        
        {/* Main Columns Grid - 5 Columns */}
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-8 sm:mb-14">
          
          {/* Column 1: Brand & Description */}
          <div className="space-y-6 text-left">
            <Logo variant="default" />
            <p className="text-[13px] leading-relaxed text-slate-550">
              Build real-world skills through industry-focused virtual internships. Complete practical tasks, gain hands-on experience, and earn verified certificates trusted by employers.
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col gap-2 w-full max-w-[210px]">
              <Link 
                to="/auth"
                search={{ redirect: undefined }}
                className="group flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-[#002244] text-white text-[13px] font-semibold shadow-sm hover:bg-[#003366] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Rocket className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                <span>Start Internship</span>
              </Link>
              <Link 
                to="/verify-certificate"
                className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-white border border-slate-200 text-slate-800 text-[13px] font-semibold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <ShieldCheck className="size-3.5 text-slate-600" />
                <span>Verify Certificate</span>
              </Link>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-1">
              {[
                { icon: Linkedin, href: "https://www.linkedin.com/company/skyrovix/" },
                { icon: Github, href: "https://github.com/hariharan1022/skyrovix" },
                { icon: Instagram, href: "https://www.instagram.com/skyrovix?igsh=ZXY2ZXdxZTM5czNr" },
                { icon: () => (
                  <svg className="size-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                ), href: "https://whatsapp.com/channel/0029VbD67bgEFeXexEbYGI1f" }
              ].map((item, idx) => (
                <a 
                  key={idx}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/20 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
                >
                  <item.icon className="size-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Internship Domains */}
          <details open className="group space-y-3 text-left">
            <summary className="flex items-center justify-between cursor-pointer lg:cursor-default list-none [&::-webkit-details-marker]:hidden">
              <div>
                <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Internship Domains</h4>
                <div className="h-[2px] w-6 bg-blue-600 mt-2"></div>
              </div>
              <ChevronDown className="size-4 text-slate-400 lg:hidden transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="pt-3">
              <ul className="space-y-2.5">
                {[
                  { to: "/domains", label: "Full Stack Development", icon: Code2 },
                  { to: "/domains", label: "Python Development", icon: Code2 },
                  { to: "/domains", label: "Java Development", icon: Code2 },
                  { to: "/domains", label: "Data Science", icon: Database },
                  { to: "/domains", label: "AI & Machine Learning", icon: Brain },
                  { to: "/domains", label: "UI/UX Design", icon: Palette },
                  { to: "/domains", label: "Cyber Security", icon: Shield },
                  { to: "/domains", label: "Cloud Computing", icon: Cloud },
                ].map((link, idx) => (
                  <li key={idx}>
                    <Link 
                      to={link.to} 
                      search={{ apply: link.label }}
                      className="group flex items-center gap-2 text-[13px] text-slate-600 hover:text-blue-600 transition-colors duration-150"
                    >
                      <link.icon className="size-3.5 text-slate-400 shrink-0 group-hover:text-blue-500 transition-colors" />
                      <span className="truncate">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link to="/domains" className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue-600 hover:text-blue-700 mt-3 transition-colors">
                <span>View All Domains</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </details>

          {/* Column 3: Company */}
          <details open className="group space-y-3 text-left">
            <summary className="flex items-center justify-between cursor-pointer lg:cursor-default list-none [&::-webkit-details-marker]:hidden">
              <div>
                <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Company</h4>
                <div className="h-[2px] w-6 bg-blue-600 mt-2"></div>
              </div>
              <ChevronDown className="size-4 text-slate-400 lg:hidden transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="pt-3">
              <ul className="space-y-2.5">
                {[
                  { to: "/about", label: "About Skyrovix", icon: Building2 },
                  { to: "/contact", label: "Contact", icon: Mail },
                  { to: "/reviews", label: "Student Reviews", icon: Star },
                  { to: "/#faq", label: "FAQ", icon: HelpCircle },
                ].map((link, idx) => (
                  <li key={idx}>
                    <Link 
                      to={link.to} 
                      className="group flex items-center gap-2 text-[13px] text-slate-600 hover:text-blue-600 transition-colors duration-150"
                    >
                      <link.icon className="size-3.5 text-slate-400 shrink-0 group-hover:text-blue-500 transition-colors" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </details>

          {/* Column 4: Resources */}
          <details open className="group space-y-3 text-left">
            <summary className="flex items-center justify-between cursor-pointer lg:cursor-default list-none [&::-webkit-details-marker]:hidden">
              <div>
                <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Resources</h4>
                <div className="h-[2px] w-6 bg-blue-600 mt-2"></div>
              </div>
              <ChevronDown className="size-4 text-slate-400 lg:hidden transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="pt-3">
              <ul className="space-y-2.5">
                {[
                  { to: "/verify-certificate", label: "Verify Certificate", icon: Award },
                  { to: "/dashboard", label: "Student Dashboard", icon: LayoutDashboard },
                  { to: "/privacy", label: "Privacy Policy", icon: Lock },
                  { to: "/terms", label: "Terms & Conditions", icon: FileSignature },
                  { to: "/refund", label: "Refund & Cancellation", icon: RotateCcw },
                  { to: "/contact", label: "Help Center", icon: HelpCircle },
                ].map((link, idx) => (
                  <li key={idx}>
                    <Link 
                      to={link.to} 
                      className="group flex items-center gap-2 text-[13px] text-slate-600 hover:text-blue-600 transition-colors duration-150"
                    >
                      <link.icon className="size-3.5 text-slate-400 shrink-0 group-hover:text-blue-500 transition-colors" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </details>

          {/* Column 5: Contact & Trust */}
          <details open className="group space-y-3 text-left">
            <summary className="flex items-center justify-between cursor-pointer lg:cursor-default list-none [&::-webkit-details-marker]:hidden">
              <div>
                <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Contact & Trust</h4>
                <div className="h-[2px] w-6 bg-blue-600 mt-2"></div>
              </div>
              <ChevronDown className="size-4 text-slate-400 lg:hidden transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="pt-3 space-y-3">
              <ul className="space-y-3">
                <li>
                  <a 
                    href="mailto:skyrovix@gmail.com" 
                    className="group flex items-start gap-2.5 text-[13px] text-slate-600 hover:text-blue-600 transition-colors duration-150"
                  >
                    <Mail className="size-4 text-slate-400 shrink-0 mt-0.5 group-hover:text-blue-500 transition-colors" />
                    <span className="truncate">skyrovix@gmail.com</span>
                  </a>
                </li>
                <li className="flex items-start gap-2.5 text-[13px] text-slate-600">
                  <MapPin className="size-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>India</span>
                </li>
                <li className="flex items-start gap-2.5 text-[13px] text-slate-600">
                  <Clock className="size-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="leading-tight">
                    <p className="font-semibold text-slate-700">Mon – Sat</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">9:00 AM – 7:00 PM IST</p>
                  </div>
                </li>
              </ul>
              <div className="flex flex-col gap-2">
                {/* MSME Registered */}
                <div className="flex items-center gap-2">
                  <img src={msme} alt="MSME" className="size-24 object-contain" />
                  <span className="text-[12px] font-medium text-slate-700">MSME Registered</span>
                </div>
              </div>
            </div>
          </details>
        </div>

        {/* Banner Row: Horizontal Stats Card - hidden on mobile */}
        <div className="hidden md:block mb-8 sm:mb-10 rounded-2xl border border-slate-100 bg-[#f8fafc]/80 p-4 sm:p-6 shadow-sm">
          <div className="grid grid-cols-5 gap-4 items-center justify-center">
            {[
              { title: "Growing Every Day", subtitle: "Students Enrolled", icon: Users, colorClass: "bg-blue-50 text-blue-500" },
              { title: "more colleges across India", subtitle: "Colleges", icon: Building2, colorClass: "bg-purple-50 text-purple-500" },
              { title: "10+", subtitle: "Domains", icon: Database, colorClass: "bg-emerald-50 text-emerald-500" },
              { title: "95%", subtitle: "Completion", icon: Clock, colorClass: "bg-orange-50 text-orange-500" },
              { title: "Verified", subtitle: "Certificates", icon: Award, colorClass: "bg-blue-50 text-blue-500" },
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-3.5 justify-center px-4"
              >
                <div className={`grid size-10 shrink-0 place-items-center rounded-full ${stat.colorClass}`}>
                  <stat.icon className="size-5" />
                </div>
                <div className="text-left leading-tight whitespace-nowrap">
                  <p className="text-base font-bold text-slate-800">{stat.title}</p>
                  <p className="text-[11.5px] font-medium text-slate-500 mt-0.5">{stat.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright / Bottom Bar */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row text-[12.5px] text-slate-500 font-medium">
            <p>&copy; {new Date().getFullYear()} Skyrovix. All Rights Reserved.</p>
            <p className="flex items-center gap-1.5">
              <span>Made with</span>
              <span className="text-red-500 animate-pulse">❤️</span>
              <span>in India</span>
            </p>
            <nav aria-label="Bottom legal links" className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-blue-600 transition-colors">Terms & Conditions</Link>
                <Link to="/refund" className="hover:text-blue-600 transition-colors">Refund & Cancellation</Link>
              </div>
              <button 
                onClick={scrollToTop} 
                className="hover:text-blue-600 transition-all inline-flex items-center gap-1 font-semibold hover:-translate-y-0.5 active:translate-y-0"
                aria-label="Scroll back to top"
              >
                <span>Back to Top</span>
                <span className="text-[10px]">↑</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
