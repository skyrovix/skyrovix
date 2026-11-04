import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Award, BookOpen, Clock, Heart, Users, Target, ShieldCheck, Mail, Globe,
  MessageSquare, Briefcase, GraduationCap, ChevronRight, Send, ArrowRight,
  Linkedin, Github, Twitter, ExternalLink, Calendar, Code, Sparkles
} from "lucide-react";
import { FadeUp, Reveal, ScaleIn } from "@/components/motion";
import founderPhoto from "@/assets/founder.jpeg";
import cofounderPhoto from "@/assets/co founder.jpeg";
import { COMPANY } from "@/lib/constants";

export function FounderProfileView() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      return toast.error("Please fill in all required fields.");
    }
    setLoading(true);
    // Simulate API call to send message
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Thank you for your message! The founder's office will get back to you shortly.");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
  };

  const stats = [
    { icon: Users, value: "5,000+", label: "Interns Mentored", color: "text-violet-500 bg-violet-500/10" },
    { icon: Target, value: "10+", label: "Learning Domains", color: "text-emerald-500 bg-emerald-500/10" },
    { icon: ShieldCheck, value: "100%", label: "MSME-Registered", color: "text-blue-500 bg-blue-500/10" },
    { icon: Award, value: "QR-Code", label: "Verified Certificates", color: "text-amber-500 bg-amber-500/10" },
  ];

  const milestones = [
    { year: "2024", title: "Founding Vision", desc: "Started Skyrovix with the mission to solve the student employability gap through practical, task-based learning." },
    { year: "2025", title: "MSME Certification", desc: "Recognized as a registered training partner, launching standard curriculum guidelines across 10+ core technologies." },
    { year: "2026", title: "Scale & Impact", desc: "Mentored over 5,000 college graduates and engineering students across India, building automated code evaluators." }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-violet-500/30">
      
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28 flex items-center justify-center border-b border-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-950/20 via-slate-950 to-slate-950">
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 size-96 rounded-full bg-violet-500/5 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 size-96 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 w-full grid md:grid-cols-[0.8fr_1.2fr] gap-12 items-center">
          
          {/* Hero Left: Photo */}
          <ScaleIn className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-600 to-blue-600 opacity-30 blur group-hover:opacity-50 transition duration-1000" />
              <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900 size-64 sm:size-80 flex items-center justify-center">
                <img 
                  src={founderPhoto} 
                  alt="Hariharan S — Founder & CEO" 
                  className="size-full object-cover grayscale group-hover:grayscale-0 transition duration-500"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 text-center">
                  <p className="text-sm font-semibold">{COMPANY.founder.name}</p>
                  <p className="text-[10px] text-slate-400">Founder & CEO, Skyrovix</p>
                </div>
              </div>
            </div>
          </ScaleIn>

          {/* Hero Right: Details */}
          <div className="space-y-6 text-center md:text-left">
            <FadeUp>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Sparkles className="size-3" /> Founder & Executive Profile
              </span>
            </FadeUp>
            <FadeUp delay={100}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
                Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-blue-400">Hariharan S</span>
              </h1>
              <p className="text-lg sm:text-xl font-medium text-slate-300 mt-2">
                Founder & CEO of Skyrovix IT Solutions
              </p>
            </FadeUp>
            <FadeUp delay={200}>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                At Skyrovix, our mission is to redefine technical education by giving college students access to high-quality, project-based virtual internships. I focus on developing curriculum guidelines, building automated compiler tools, and mentoring the next generation of engineers to become industry-ready.
              </p>
            </FadeUp>

            {/* Social handles */}
            <FadeUp delay={300} className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Button asChild className="rounded-xl h-11 px-6 bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-lg shadow-violet-500/20 gap-2 border-0">
                <a href="#contact">
                  <Send className="size-4" /> Get in Touch
                </a>
              </Button>
              <div className="flex items-center gap-3">
                <a href={COMPANY.founder.linkedin} target="_blank" rel="noopener noreferrer" className="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition" title="Connect on LinkedIn">
                  <Linkedin className="size-4" />
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition">
                  <Github className="size-4" />
                </a>
                <a href="https://skyrovix.online" target="_blank" rel="noopener noreferrer" className="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition">
                  <Globe className="size-4" />
                </a>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ─── Stats / Impact Section ─── */}
      <section className="py-12 border-b border-slate-900 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <ScaleIn key={idx} delay={idx * 100}>
                  <Card className="border border-slate-900 bg-slate-900/40 backdrop-blur rounded-2xl">
                    <CardContent className="p-6 text-center space-y-2">
                      <div className={`size-10 rounded-xl flex items-center justify-center mx-auto ${s.color}`}>
                        <Icon className="size-5" />
                      </div>
                      <p className="text-2xl font-black text-white">{s.value}</p>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-medium">{s.label}</p>
                    </CardContent>
                  </Card>
                </ScaleIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── About Hariharan & Core Philosophy ─── */}
      <section className="py-20 md:py-28 bg-slate-950 border-b border-slate-900 relative">
        <div className="absolute bottom-0 right-10 size-80 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-6">
            <Reveal>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Empowering Students with <span className="text-violet-400">Practical Skills</span>
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-slate-400 text-sm leading-relaxed">
                As a student-led organization, I understand the challenges college graduates face when entering the workforce. Traditional curriculum formats often miss active coding practice, code deployment, and working on database integrations.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed mt-4">
                Skyrovix was designed to address this. Our virtual internship program includes structured code review workflows, automatic test assertions for task submissions, and a real-time portfolio dashboard. Every student receives personalized support to unlock their milestones sequentially.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div className="flex gap-4 p-4 rounded-2xl border border-slate-900 bg-slate-900/30">
                <Code className="size-8 text-violet-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-white text-sm">Interactive Code Sandbox</h4>
                  <p className="text-xs text-slate-400 mt-1">We created a robust, browser-based sandboxed editor for Python, HTML, CSS, JavaScript, and PHP, eliminating complex environmental setups for fresh learners.</p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Timeline */}
          <div className="space-y-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="size-5 text-violet-400" /> Platform Milestones
            </h3>
            <div className="space-y-6 border-l-2 border-slate-900 pl-6 ml-2 relative">
              {milestones.map((m, idx) => (
                <FadeUp key={idx} delay={idx * 150} className="relative">
                  <div className="absolute -left-[31px] top-1.5 size-4 rounded-full border-2 border-violet-500 bg-slate-950" />
                  <span className="text-xs font-bold text-violet-400">{m.year}</span>
                  <h4 className="font-bold text-white text-sm sm:text-base mt-1">{m.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{m.desc}</p>
                </FadeUp>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ─── Co-Founder & Leadership Team ─── */}
      <section className="py-20 bg-slate-950 border-b border-slate-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-extrabold text-white">Leadership Team</h2>
            <p className="text-xs sm:text-sm text-slate-400">The core team directing Skyrovix's technical curriculum and student platform operations.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            
            {/* Leader 1 */}
            <Card className="border border-slate-900 bg-slate-900/40 backdrop-blur rounded-2xl overflow-hidden hover:border-slate-800 transition">
              <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                <img src={founderPhoto} alt="Hariharan S" className="size-24 rounded-2xl object-cover border border-slate-800 grayscale" />
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">{COMPANY.founder.name}</h3>
                  <p className="text-xs font-semibold text-violet-400">Founder & CEO</p>
                  <p className="text-xs text-slate-400 leading-relaxed">Leads overall strategy, domain development, automatic compilation utilities, and oversees digital certificates.</p>
                </div>
              </CardContent>
            </Card>

            {/* Leader 2 */}
            <Card className="border border-slate-900 bg-slate-900/40 backdrop-blur rounded-2xl overflow-hidden hover:border-slate-800 transition">
              <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                <img src={cofounderPhoto} alt="Maheshwaran S" className="size-24 rounded-2xl object-cover border border-slate-800 grayscale" />
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">{COMPANY.cofounder.name}</h3>
                  <p className="text-xs font-semibold text-blue-400">Co-Founder & Lead Architect</p>
                  <p className="text-xs text-slate-400 leading-relaxed">Directs tech stack integrations, server-side APIs, database management, and platform security systems.</p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* ─── Contact Office Section ─── */}
      <section id="contact" className="py-20 md:py-28 bg-slate-950 relative">
        <div className="absolute top-1/4 left-1/3 size-96 rounded-full bg-violet-500/5 blur-3xl" />
        
        <div className="max-w-4xl mx-auto px-4">
          <Card className="border border-slate-900 bg-slate-900/30 backdrop-blur rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 right-0 size-24 bg-violet-500/10 rounded-bl-full border-l border-b border-violet-500/10" />

            <div className="grid md:grid-cols-[1fr_1.3fr] gap-10">
              
              {/* Form Info */}
              <div className="space-y-6">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Connect with the Founder</h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Have an academic proposal, corporate partnership request, or need custom mentoring advice? Drop a message here directly.
                </p>
                
                <div className="space-y-3 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <Mail className="size-4 text-violet-400" />
                    <span>{COMPANY.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="size-4 text-violet-400" />
                    <span>{COMPANY.website}</span>
                  </div>
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Your Name</label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe" 
                      className="rounded-xl border-slate-800 bg-slate-900/60 text-white placeholder-slate-600 focus-visible:ring-violet-500 h-10 text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Email Address</label>
                    <Input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com" 
                      className="rounded-xl border-slate-800 bg-slate-900/60 text-white placeholder-slate-600 focus-visible:ring-violet-500 h-10 text-xs" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Subject</label>
                  <Input 
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Mentorship, Partnership..." 
                    className="rounded-xl border-slate-800 bg-slate-900/60 text-white placeholder-slate-600 focus-visible:ring-violet-500 h-10 text-xs" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Message</label>
                  <Textarea 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your message..." 
                    rows={4}
                    className="rounded-xl border-slate-800 bg-slate-900/60 text-white placeholder-slate-600 focus-visible:ring-violet-500 text-xs resize-none" 
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full rounded-xl h-11 bg-violet-600 hover:bg-violet-700 text-white border-0 font-semibold shadow-lg shadow-violet-500/25 gap-2"
                >
                  {loading ? "Sending..." : "Send Message"}
                  <Send className="size-4" />
                </Button>
              </form>

            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-slate-600 border-t border-slate-900/80 bg-slate-950">
        <p>&copy; {new Date().getFullYear()} Skyrovix IT Solutions. All rights reserved.</p>
        <p className="mt-1 text-[10px] text-slate-700">MSME Udyam Registration: UDYAM-TN-20-XXXXXXX</p>
      </footer>

    </div>
  );
}
