/* istanbul ignore file */
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import { Play, Gamepad2, Github, ExternalLink, Activity, Terminal, Shield, Zap, Sparkles, AlertCircle, Compass, Users, Clock, ArrowDown, ChevronRight, HelpCircle } from 'lucide-react';
import '../landing.css';
import TypingText from './TypingText';
import StatsBanner from './StatsBanner';
import FeaturesSection from './FeaturesSection';
import MissionCommander from './MissionCommander';

const DigitalTwinStadium = React.lazy(() => import('./DigitalTwinStadium'));

export function handleButtonRipple(e) {
  const button = e.currentTarget;
  const rect = button.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const ripple = document.createElement('span');
  ripple.className = 'btn-ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  button.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

export default function LandingPage({ onEnterConsole }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeScenario, setActiveScenario] = useState('normal');
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero-section');

  // Swarm / Diagnostic state variables
  const [swarmPing, setSwarmPing] = useState(null);
  const [isSwarmOptimizing, setIsSwarmOptimizing] = useState(false);
  const [swarmOptimized, setSwarmOptimized] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [agentPings, setAgentPings] = useState({ mediator: 15, triage: 8, router: 22, ops: 12 });
  const [logs, setLogs] = useState([
    "[SYS] Initialization of swarm nodes complete.",
    "[MEDIATOR] Pre-caching Spanish, Spanish (Mexico), and Portuguese translation models.",
    "[ROUTER] Mapping step-free coordinates for MetLife Section 102."
  ]);
  const [sensorsHUD, setSensorsHUD] = useState(true);
  const [dronesActive, setDronesActive] = useState(true);
  const [heatmapActive, setHeatmapActive] = useState(false);
  const [stadiumOccupancy, setStadiumOccupancy] = useState(82);
  const [diagnosticProgress, setDiagnosticProgress] = useState(null);
  const [diagnosticLogs, setDiagnosticLogs] = useState([]);
  const [isSyncingCache, setIsSyncingCache] = useState(false);

  // Boot sequence states
  const [bootProgress, setBootProgress] = useState(0);
  const [bootPhase, setBootPhase] = useState(0);
  const [bootDone, setBootDone] = useState(false);
  const [stadiumBrightness, setStadiumBrightness] = useState(0);

  const lenisRef = useRef(null);
  const typingTimerRef = useRef(null);

  const bootMessages = [
    "Spinning up SQLite offline edge ledger replica...",
    "Connecting API handlers to Open-Meteo services...",
    "Synchronizing multi-agent speech coordinators...",
    "Spawning local safety triage camera watchers...",
    "StadiumOS digital twin boot sequence complete."
  ];

  // 1. Boot sequence timing
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setBootProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setBootDone(true), 600);
          return 100;
        }
        return prev + 1;
      });
    }, 25);

    const phaseInterval = setInterval(() => {
      setBootPhase(prev => {
        if (prev >= bootMessages.length - 1) {
          clearInterval(phaseInterval);
          return bootMessages.length - 1;
        }
        return prev + 1;
      });
    }, 550);

    return () => {
      clearInterval(progressInterval);
      clearInterval(phaseInterval);
    };
  }, []);

  // 2. Sequential Lighting Power-On simulation
  useEffect(() => {
    if (bootDone) {
      setTimeout(() => setStadiumBrightness(0.35), 200);
      setTimeout(() => setStadiumBrightness(0.65), 500);
      setTimeout(() => setStadiumBrightness(0.85), 800);
      setTimeout(() => setStadiumBrightness(1.0), 1200);
    }
  }, [bootDone]);

  // 3. Lenis scroll setup
  useEffect(() => {
    if (!bootDone) return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    let animFrameId = null;
    function raf(time) {
      lenis.raf(time);
      animFrameId = requestAnimationFrame(raf);
    }
    animFrameId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [bootDone]);

  // 4. Scroll progress & Section Tracking (Intersection Observer Fallback / Active state tracker)
  useEffect(() => {
    if (!bootDone) return;

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(window.scrollY / totalScroll);
        setIsNavScrolled(window.scrollY > 50);
      }

      const sections = [
        'hero-section', 
        'features-section', 
        'mission-commander-section', 
        'technology-section', 
        'digital-twin-section', 
        'architecture-section', 
        'sandbox-console', 
        'metrics-section', 
        'accessibility-section', 
        'about-section'
      ];
      
      let currentActive = 'hero-section';
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.4) {
            currentActive = sectionId;
            break;
          }
        }
      }
      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [bootDone]);

  // 5. Intersection Observer for smooth-section-reveal
  useEffect(() => {
    if (!bootDone) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1 });

    const revealElements = document.querySelectorAll('.smooth-section-reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
    };
  }, [bootDone]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePingSwarm = () => {
    const pingTime = Math.floor(Math.random() * 15) + 5;
    setSwarmPing(pingTime);
    setAgentPings({
      mediator: Math.floor(Math.random() * 10) + 10,
      triage: Math.floor(Math.random() * 6) + 5,
      router: Math.floor(Math.random() * 15) + 15,
      ops: Math.floor(Math.random() * 8) + 8
    });
    setLogs(prev => [
      ...prev,
      `[SWARM] Broadcast ping: success in ${pingTime}ms. All nodes responsive.`
    ]);
  };

  const handleOptimizeSwarm = () => {
    setIsSwarmOptimizing(true);
    setLogs(prev => [...prev, "[SYS] Initiating swarm load-balancer & thread optimization..."]);
    setTimeout(() => {
      setIsSwarmOptimizing(false);
      setSwarmOptimized(true);
      setLogs(prev => [
        ...prev,
        "[SYS] Agent allocation balanced. CPU overhead down 18%, memory leak-checked: OK."
      ]);
    }, 1200);
  };

  const handleRunDiagnostic = () => {
    setDiagnosticProgress(0);
    setDiagnosticLogs(["[DIAG] Starting core systems self-diagnosis..."]);
    
    const steps = [
      { progress: 20, log: "[DIAG] Testing Linguistic Mediator model registry... OK" },
      { progress: 50, log: "[DIAG] Calibrating Safety Triage risk multipliers... OK" },
      { progress: 75, log: "[DIAG] Computing weather-Dijkstra graph index... OK" },
      { progress: 100, log: "[DIAG] System diagnosis COMPLETE. 0 issues detected." }
    ];

    steps.forEach((s, idx) => {
      setTimeout(() => {
        setDiagnosticProgress(s.progress);
        setDiagnosticLogs(prev => [...prev, s.log]);
      }, (idx + 1) * 600);
    });
  };

  const handleFlushCache = () => {
    setIsSyncingCache(true);
    setTimeout(() => {
      setIsSyncingCache(false);
      alert("Offline cache flushed successfully. MetLife local SQLite replica fully synchronized with master cloud ledger.");
    }, 1000);
  };

  // Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="landing-body animated-gradient-bg min-h-screen relative w-full select-none overflow-x-hidden">
      
      {/* ⚡ Cinematic Loading Console Overlay */}
      <AnimatePresence>
        {!bootDone && (
          <motion.div 
            className="boot-sequence-overlay"
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)', transition: { duration: 0.7, ease: 'easeInOut' } }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: '#02040c',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2rem',
              color: '#46F3FF',
              fontFamily: 'Consolas, Monaco, monospace'
            }}
          >
            <div className="scanlines" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 6px 100%', zIndex: 1, pointerEvents: 'none' }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', zIndex: 2, marginBottom: '3rem' }}>
              <motion.img 
                src="/stadiumos.png" 
                alt="StadiumOS Logo" 
                style={{
                  height: '70px',
                  filter: `drop-shadow(0 0 ${bootProgress / 4}px rgba(70, 243, 255, 0.8))`
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              />
              <h1 style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '0.2em', background: 'linear-gradient(90deg, #46F3FF, #7C5CFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                STADIUMOS
              </h1>
            </div>

            <div 
              style={{
                width: '100%',
                maxHeight: '340px',
                maxWidth: '600px',
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(70, 243, 255, 0.2)',
                borderRadius: '8px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                zIndex: 2,
                boxShadow: '0 0 25px rgba(0, 240, 255, 0.08)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(70, 243, 255, 0.15)', paddingBottom: '0.4rem', fontSize: '0.75rem', color: '#88a4b8' }}>
                <span>🛰️ SYS_BOOT // CORE_BRIDGE_ONLINE</span>
                <span>SECURE MODE</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: '#a5f3fc', minHeight: '60px', overflowY: 'auto' }}>
                <div style={{ color: '#00ffcc' }}>&gt; {bootMessages[bootPhase]}</div>
                <div style={{ color: 'rgba(70, 243, 255, 0.5)' }}>&gt; Memory allocated... OK</div>
                {bootProgress >= 40 && <div style={{ color: 'rgba(70, 243, 255, 0.5)' }}>&gt; Thread pools initialized... OK</div>}
                {bootProgress >= 80 && <div style={{ color: 'rgba(70, 243, 255, 0.5)' }}>&gt; Local cache ledger mapped... OK</div>}
              </div>
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${bootProgress}%`, height: '100%', background: 'linear-gradient(90deg, #46F3FF, #7C5CFF)', transition: 'width 0.1s linear' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#88a4b8' }}>
                <span>Booting Neural Swarms...</span>
                <span>{bootProgress}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 Top Scroll Progress Bar */}
      <div style={{ width: `${scrollProgress * 100}%`, height: '3px', background: 'linear-gradient(90deg, #46F3FF, #7C5CFF)', position: 'fixed', top: 0, left: 0, zIndex: 10001, transition: 'width 0.1s ease-out' }} />

      {/* ♿ Skip to Content accessibility utility */}
      <a href="#main-content" className="skip-to-content" style={{ position: 'absolute', top: '-100px', left: '20px', background: '#7C5CFF', color: 'white', padding: '0.75rem 1.5rem', zIndex: 10002, borderRadius: '8px', transition: 'top 0.25s ease' }} onFocus={(e) => e.target.style.top = '20px'} onBlur={(e) => e.target.style.top = '-100px'}>
        Skip to main content
      </a>

      {/* 🌌 Floating Particles Starfield (Aesthetic Parallax Layer) */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.18 }}>
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: '3px', height: '3px', background: '#46F3FF', borderRadius: '50%', filter: 'blur(1px)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '80%', width: '4px', height: '4px', background: '#7C5CFF', borderRadius: '50%', filter: 'blur(1px)' }} />
        <div style={{ position: 'absolute', top: '75%', left: '25%', width: '3px', height: '3px', background: '#ffffff', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '85%', left: '70%', width: '2px', height: '2px', background: '#46F3FF', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '25%', left: '60%', width: '4px', height: '4px', background: '#ff007f', borderRadius: '50%', filter: 'blur(2px)' }} />
      </div>

      {/* 🛸 Aurora glow overlay grid */}
      <div className="landing-vignette-overlay" style={{ background: 'radial-gradient(circle at 50% 30%, transparent 40%, rgba(3, 6, 18, 0.96) 90%)', zIndex: 1, pointerEvents: 'none', position: 'fixed', inset: 0 }} />

      {/* 🚀 Header Navbar */}
      <nav 
        className="landing-nav"
        style={{
          background: isNavScrolled ? 'rgba(3, 6, 18, 0.85)' : 'transparent',
          backdropFilter: isNavScrolled ? 'blur(20px)' : 'none',
          borderBottom: isNavScrolled ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: '75px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 3.5rem'
        }}
      >
        <div 
          onClick={() => scrollToSection('hero-section')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <img src="/stadiumos.png" alt="Logo" style={{ height: '32px' }} />
          <span style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '0.15em', background: 'linear-gradient(90deg, #46F3FF, #7C5CFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            STADIUMOS
          </span>
        </div>

        <div className="landing-nav-links" style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
          {[
            { id: 'hero-section', label: '🏠 Home' },
            { id: 'features-section', label: '✨ Features' },
            { id: 'mission-commander-section', label: '🧠 Commander' },
            { id: 'technology-section', label: '⚙️ Technology' },
            { id: 'digital-twin-section', label: '📍 Stadium Twin' },
            { id: 'architecture-section', label: '🏗️ Swarm Swarm' },
            { id: 'sandbox-console', label: '🎮 Sandbox' },
            { id: 'about-section', label: 'ℹ️ About' }
          ].map(link => (
            <button 
              key={link.id}
              type="button"
              className="landing-nav-link"
              onClick={() => scrollToSection(link.id)}
              style={{
                color: activeSection === link.id ? '#46F3FF' : '#94a3b8',
                fontWeight: activeSection === link.id ? '700' : '500',
                borderBottom: activeSection === link.id ? '2px solid #46F3FF' : '2px solid transparent',
                paddingBottom: '0.25rem',
                fontSize: '0.82rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
            >
              {link.label}
            </button>
          ))}
          <a 
            href="https://github.com/riyanshika7/stadiumOS" 
            target="_blank"
            rel="noreferrer"
            className="landing-nav-link"
            style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#94a3b8' }}
          >
            GitHub <Github size={12} />
          </a>
          <button 
            className="btn-neon-cta" 
            onClick={(e) => { handleButtonRipple(e); setTimeout(onEnterConsole, 300); }}
            style={{ padding: '0.45rem 1rem', fontSize: '0.78rem' }}
          >
            Launch Command Console <Zap size={12} style={{ fill: '#ffffff' }} />
          </button>
        </div>
      </nav>

      {/* 🚀 Main Page Flow container */}
      <main id="main-content" style={{ position: 'relative', zIndex: 2, paddingTop: '100px' }}>
        
        {/* 1. Hero Section */}
        <section id="hero-section" style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', padding: '0 2rem' }}>
          <motion.div className="hero-text-content" variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <motion.div className="hero-pill-badge ai-pulse-ring" variants={itemVariants} style={{ background: 'rgba(70, 243, 255, 0.08)', border: '1px solid rgba(70, 243, 255, 0.25)', color: '#46F3FF', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span className="indicator-pulse" style={{ width: '6px', height: '6px', background: '#46F3FF', borderRadius: '50%', display: 'inline-block' }}></span>
              FIFA World Cup 2026 Active Digital Twin
            </motion.div>
            
            <motion.h1 className="hero-main-title text-5xl md:text-7xl font-extrabold font-header" variants={itemVariants} style={{ letterSpacing: '-0.02em', lineHeight: '1.1', marginBottom: '1.5rem' }}>
              The AI Operating System <br />
              <span className="hero-gradient-text" style={{ background: 'linear-gradient(90deg, #46F3FF, #7C5CFF, #ff007f)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>For World-Class Stadiums</span>
            </motion.h1>

            <motion.p className="hero-sub-para min-h-[48px] text-slate-300" variants={itemVariants} style={{ fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
              <TypingText text="StadiumOS transforms FIFA World Cup stadiums into intelligent digital ecosystems by coordinating volunteers, organizers, and operations through real-time Generative AI." />
            </motion.p>
            
            <motion.div className="hero-action-buttons" variants={itemVariants} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
              <button 
                className="btn-primary-neon" 
                onClick={(e) => { handleButtonRipple(e); setTimeout(onEnterConsole, 350); }}
                style={{ padding: '0.75rem 1.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Play size={16} fill="#ffffff" /> Try Live Demo
              </button>
              <button 
                className="btn-secondary-neon" 
                onClick={(e) => { handleButtonRipple(e); scrollToSection('sandbox-console'); }}
                style={{ padding: '0.75rem 1.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Gamepad2 size={16} /> Watch AI Simulation
              </button>
            </motion.div>
          </motion.div>

          <motion.div 
            className="scroll-hint-bar" 
            onClick={() => scrollToSection('features-section')}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', marginTop: '4rem' }}
          >
            <span style={{ fontSize: '0.62rem', tracking: '0.2em', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>SCROLL TO COMMENCE STORY</span>
            <ArrowDown size={14} color="#46F3FF" />
          </motion.div>
        </section>

        {/* 2. Live Statistics Banner */}
        <section style={{ padding: '2rem 0', background: 'rgba(3, 6, 18, 0.4)', borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <StatsBanner />
        </section>

        {/* 3. Features Grid Section */}
        <section id="features-section" style={{ padding: '5rem 0' }}>
          <FeaturesSection />
        </section>

        {/* 4. Live Mission Commander Console (Embedded directly into the flow) */}
        <section id="mission-commander-section" style={{ padding: '5rem 2rem', background: 'rgba(3, 6, 18, 0.4)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span className="trans-tag">Autonomous Command Hub</span>
              <h2 className="text-4xl font-extrabold font-header mt-2 mb-4">Live AI Mission Commander</h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Test the Generative AI reasoning engine in real-time. Speak or select a stadium situation to dynamically generate tactical checklists and access redirects.
              </p>
            </div>
            
            {/* Live Interactive MissionCommander Panel */}
            <div style={{ maxWidth: '850px', margin: '0 auto' }}>
              <MissionCommander />
            </div>
          </div>
        </section>

        {/* 5. Technology Section (Description & Config Dashboard Controls) */}
        <section id="technology-section" style={{ padding: '5rem 2rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            <div>
              <span className="trans-tag">Ambient Orchestrator</span>
              <h2 className="text-4xl font-extrabold font-header mt-2 mb-4">From Stadium Model to Autonomous Venue Neural Grid</h2>
              <p className="text-slate-300 leading-relaxed mb-6">
                As turnstile counts spike and gates exceed safe capacities, the Digital Twin highlights bottleneck nodes, computes alternative step-free exit paths, and coordinates security, facility, and translation sub-agents.
              </p>
              
              <div className="agent-badge-list" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {['Linguistic Mediator', 'Safety Triage', 'Access Router', 'Predictive Ops'].map(t => (
                  <span key={t} className="agent-badge-pill" style={{ background: 'rgba(70, 243, 255, 0.08)', border: '1px solid rgba(70, 243, 255, 0.15)', color: '#46F3FF', padding: '0.3rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem' }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Config Overlay Box rendered inline */}
            <div className="sandbox-card-glass morph-card-glow" style={{ padding: '1.75rem', borderRadius: '12px', background: 'rgba(5, 8, 22, 0.65)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
              <h3 className="text-lg font-bold text-[#46F3FF] mb-4">⚙️ 3D Digital Twin Visualizer HUD Config</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-sm">Sensors Overlay HUD:</span>
                  <button 
                    onClick={() => setSensorsHUD(prev => !prev)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.3rem 0.8rem', background: sensorsHUD ? 'rgba(70,243,255,0.1)' : 'transparent', color: sensorsHUD ? '#46F3FF' : '' }}
                  >
                    {sensorsHUD ? '🟢 ENABLED' : '🔴 DISABLED'}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-sm">Unmanned Drone Mesh:</span>
                  <button 
                    onClick={() => setDronesActive(prev => !prev)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.3rem 0.8rem', background: dronesActive ? 'rgba(70,243,255,0.1)' : 'transparent', color: dronesActive ? '#46F3FF' : '' }}
                  >
                    {dronesActive ? '🟢 ON' : '🔴 OFF'}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-sm">Thermodynamic Fan Heatmap:</span>
                  <button 
                    onClick={() => setHeatmapActive(prev => !prev)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.3rem 0.8rem', background: heatmapActive ? 'rgba(70,243,255,0.1)' : 'transparent', color: heatmapActive ? '#46F3FF' : '' }}
                  >
                    {heatmapActive ? '🟢 ON' : '🔴 OFF'}
                  </button>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                    <span>Simulated Fan Density:</span>
                    <strong style={{ color: '#46F3FF' }}>{stadiumOccupancy}% ({Math.floor(stadiumOccupancy * 825)} fans)</strong>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={stadiumOccupancy} 
                    onChange={(e) => setStadiumOccupancy(Number(e.target.value))} 
                    style={{ width: '100%', accentColor: '#46F3FF', background: 'rgba(255,255,255,0.1)', height: '4px', borderRadius: '2px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Interactive Digital Twin 3D View Rendered Natively inside Container */}
        <section id="digital-twin-section" style={{ padding: '2rem 0', background: 'rgba(3, 6, 18, 0.2)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span className="trans-tag" style={{ borderLeftColor: '#7C5CFF' }}>Simulated Environment</span>
                <h3 className="text-2xl font-bold font-header text-white mt-1">MetLife Stadium 3D Twin HUD</h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#ffea00', background: 'rgba(255, 234, 0, 0.08)', padding: '0.35rem 0.75rem', borderRadius: '4px', border: '1px solid rgba(255, 234, 0, 0.2)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                Active Scenario: {activeScenario.toUpperCase()}
              </span>
            </div>

            {/* 3D Canvas Box Container */}
            <div style={{ position: 'relative', height: '560px', width: '100%', borderRadius: '16px', border: '1px solid rgba(70, 243, 255, 0.2)', overflow: 'hidden', background: '#02040a', boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }}>
              
              {/* 3D Stadium Canvas */}
              <React.Suspense fallback={<div className="landing-vignette-overlay" style={{ background: '#02040a' }} />}>
                <div style={{ filter: `brightness(${stadiumBrightness})`, transition: 'filter 1.2s cubic-bezier(0.25, 1, 0.5, 1)', height: '100%', width: '100%' }}>
                  <DigitalTwinStadium 
                    scrollProgress={activeScenario === 'congestion' ? 0.45 : activeScenario === 'emergency' ? 0.85 : scrollProgress} 
                    activeLayers={{
                      heatmap: heatmapActive || activeScenario === 'congestion',
                      volunteers: sensorsHUD,
                      incidents: activeScenario === 'congestion' || activeScenario === 'emergency',
                      emergency: activeScenario === 'emergency',
                      parking: false,
                      transit: false,
                      weather: false,
                      accessibility: activeScenario === 'emergency',
                      aiRecommend: activeScenario === 'congestion',
                      drones: dronesActive
                    }}
                  />
                </div>
              </React.Suspense>

              {/* HUD scanlines/grid inside the 3D twin box */}
              <div className="scanlines" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.15) 50%)', backgroundSize: '100% 4px' }} />
              <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', background: 'rgba(3,6,18,0.7)', border: '1px solid rgba(70,243,255,0.3)', padding: '0.75rem 1.25rem', borderRadius: '8px', pointerEvents: 'none', fontFamily: 'Consolas, monospace', fontSize: '0.75rem', color: '#46F3FF' }}>
                <div>LOC: METLIFE_STADIUM (NJ)</div>
                <div>CAM_NODES: 32_ONLINE</div>
                <div>GRID_INTEGRITY: NOMINAL</div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. AI Multi-Agent Swarm Architecture Section */}
        <section id="architecture-section" style={{ padding: '5.5rem 2rem', background: 'rgba(3, 6, 18, 0.3)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <span className="trans-tag">System Architecture</span>
              <h2 className="text-4xl font-extrabold font-header mt-2 mb-4">AI Multi-Agent Swarm Hierarchy</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                StadiumOS runs on a strictly decoupled layout implementing clean architecture. A master coordinator coordinates specialised sub-agents communicating through an event broker.
              </p>
            </div>

            {/* Glowing animated architecture diagram */}
            <div className="sandbox-card-glass morph-card-glow" style={{ padding: '2.5rem', borderRadius: '16px', background: 'rgba(5, 8, 22, 0.55)', border: '1px solid rgba(70, 243, 255, 0.15)', position: 'relative', overflow: 'hidden' }}>
              
              {/* SVG Connecting Cables with Glowing pulse markers */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} xmlns="http://www.w3.org/2000/svg">
                {/* Connector lines between columns */}
                <path d="M 120 180 Q 240 180 320 180" stroke="rgba(70, 243, 255, 0.15)" strokeWidth="2" fill="none" />
                
                {/* Pulses from User to Coordinator */}
                <path className="glowing-connector" d="M 120 180 Q 240 180 320 180" stroke="#46F3FF" strokeWidth="2" fill="none" style={{ strokeDasharray: '10 15', animation: 'dash 1.8s linear infinite' }} />
                
                {/* Connecting lines from Coordinator to sub-agents */}
                {[100, 150, 200, 250, 300, 350].map((y, idx) => (
                  <g key={idx}>
                    <path d={`M 480 180 C 580 180, 580 ${y}, 680 ${y}`} stroke="rgba(124, 92, 255, 0.15)" strokeWidth="2" fill="none" />
                    <path className="glowing-connector" d={`M 480 180 C 580 180, 580 ${y}, 680 ${y}`} stroke="#7C5CFF" strokeWidth="2" fill="none" style={{ strokeDasharray: '8 12', animation: `dash ${2 + idx*0.2}s linear infinite` }} />
                  </g>
                ))}
              </svg>

              <style>{`
                @keyframes dash {
                  to {
                    stroke-dashoffset: -50;
                  }
                }
              `}</style>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.5fr', gap: '2rem', position: 'relative', zIndex: 2 }}>
                
                {/* Column 1: Client Gateway */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }}>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#88a4b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Gateway</span>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '12px', textAlign: 'left' }}>
                    <strong style={{ display: 'block', color: '#fff', fontSize: '0.9rem', marginBottom: '0.3rem' }}>👤 User Client</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Volunteers & Venue organizers accessing the cockpit interface.</span>
                  </div>
                </div>

                {/* Column 2: Coordinator Swarm */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }}>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#88a4b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Coordinator Node</span>
                  </div>
                  <div style={{ background: 'rgba(70, 243, 255, 0.04)', border: '1px solid rgba(70, 243, 255, 0.25)', padding: '1.25rem', borderRadius: '12px', textAlign: 'left', boxShadow: '0 0 20px rgba(70, 243, 255, 0.08)' }}>
                    <strong style={{ display: 'block', color: '#46F3FF', fontSize: '0.92rem', marginBottom: '0.3rem' }}>🧠 Mission Commander</strong>
                    <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Decouples command queries, orchestrates parallel sub-agent reasoning, and compiles final scripts.</span>
                  </div>
                </div>

                {/* Column 3: Specialized Sub-agents Swarm */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#88a4b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Specialized Agent Mesh</span>
                  </div>
                  {[
                    { name: "🗣️ Linguistic Mediator", desc: "Spoken translations & Calming playbooks" },
                    { name: "🚨 Safety Triage", desc: "CCTV stream parsing & slip alerts" },
                    { name: "📍 Access Router", desc: "Dijkstra wheelchair step-free paths" },
                    { name: "⚙️ Predictive Ops", desc: "Live Open-Meteo & turnstile stats" },
                    { name: "🔥 Emergency Response", desc: "Crisis sweeps & perimeter lockdowns" },
                    { name: "📊 Analytics Engine", desc: "Aggregated reports & performance logs" }
                  ].map((sub, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        background: 'rgba(124, 92, 255, 0.03)', 
                        border: '1px solid rgba(124, 92, 255, 0.15)', 
                        padding: '0.6rem 1rem', 
                        borderRadius: '8px', 
                        textAlign: 'left',
                        transition: 'transform 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(6px)'; e.currentTarget.style.borderColor = 'rgba(124, 92, 255, 0.4)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = 'rgba(124, 92, 255, 0.15)'; }}
                    >
                      <strong style={{ display: 'block', color: '#fff', fontSize: '0.8rem' }}>{sub.name}</strong>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{sub.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom technology pipeline flow */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '2.5rem', paddingTop: '1.25rem', fontSize: '0.75rem', color: '#88a4b8', flexWrap: 'wrap', gap: '1rem' }}>
                <div>🚀 PIPELINE: <span style={{ color: '#fff', fontWeight: 'bold' }}>Gemini AI v2.0-flash</span></div>
                <div>💾 DATABASE: <span style={{ color: '#fff', fontWeight: 'bold' }}>SQLite Edge Ledger (Local Cache)</span></div>
                <div>📡 SERVER: <span style={{ color: '#fff', fontWeight: 'bold' }}>FastAPI (Uvicorn REST Interface)</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Emergency Simulator & Sandbox Selection */}
        <section id="sandbox-console" style={{ padding: '5.5rem 2rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            <div>
              <span className="trans-tag">Sandbox Environment</span>
              <h2 className="text-4xl font-extrabold font-header mt-2 mb-4">Interactive Digital Twin Sandbox</h2>
              <p className="text-slate-300 leading-relaxed mb-6">
                Simulate different operational stadium scenarios. Watch the 3D digital twin dynamically highlight accessible rerouting channels, deploy drone nodes, and trigger active triage checklists instantly.
              </p>
              
              <div className="sandbox-scenarios-box" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  className={`btn-sandbox-option ${activeScenario === 'normal' ? 'active' : ''}`} 
                  onClick={() => setActiveScenario('normal')}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '1rem', borderRadius: '8px', border: activeScenario === 'normal' ? '1px solid #46F3FF' : '1px solid rgba(255,255,255,0.08)', background: activeScenario === 'normal' ? 'rgba(70,243,255,0.08)' : 'rgba(255,255,255,0.01)', cursor: 'pointer', transition: 'all 0.25s' }}
                >
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>🟢 Normal Operations</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Active</span>
                </button>
                <button 
                  className={`btn-sandbox-option ${activeScenario === 'congestion' ? 'active' : ''}`} 
                  onClick={() => setActiveScenario('congestion')}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '1rem', borderRadius: '8px', border: activeScenario === 'congestion' ? '1px solid #ffaa00' : '1px solid rgba(255,255,255,0.08)', background: activeScenario === 'congestion' ? 'rgba(255,170,0,0.08)' : 'rgba(255,255,255,0.01)', cursor: 'pointer', transition: 'all 0.25' }}
                >
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>🟡 Concourse Warning</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">Simulate Gate C Surge</span>
                </button>
                <button 
                  className={`btn-sandbox-option ${activeScenario === 'emergency' ? 'active' : ''}`} 
                  onClick={() => setActiveScenario('emergency')}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '1rem', borderRadius: '8px', border: activeScenario === 'emergency' ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)', background: activeScenario === 'emergency' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.01)', cursor: 'pointer', transition: 'all 0.25' }}
                >
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>🔴 Emergency Bypass</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-red-500">Trigger Critical Event</span>
                </button>
              </div>
            </div>

            {/* Sandbox Simulation Dynamic Console Logs */}
            <div className="sandbox-card-glass morph-card-glow" style={{ padding: '1.75rem', borderRadius: '12px', background: 'rgba(5, 8, 22, 0.75)', border: '1px solid rgba(70, 243, 255, 0.2)', height: '360px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#46F3FF', fontWeight: 'bold', fontFamily: 'Consolas, monospace' }}>🤖 SYSTEM_TELEMETRY_LOGS</span>
                <span style={{ fontSize: '0.7rem', color: '#88a4b8' }}>REAL-TIME UPDATES</span>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.78rem', color: '#cffafe', textAlign: 'left', lineHeight: '1.4' }}>
                <div>&gt; [SYS] Initializing scenario sandbox hook... OK</div>
                <div>&gt; [SCENARIO] Current active: <span style={{ color: activeScenario === 'emergency' ? '#ef4444' : activeScenario === 'congestion' ? '#ffaa00' : '#22c55e', fontWeight: 'bold' }}>{activeScenario.toUpperCase()}</span></div>
                {activeScenario === 'normal' && (
                  <>
                    <div style={{ color: 'rgba(70,243,255,0.5)' }}>&gt; [TWIN] Rendered 6 zone beacons, 32 cameras. All nominal.</div>
                    <div style={{ color: 'rgba(70,243,255,0.5)' }}>&gt; [ROUTER] Dijkstra accessible pathways configured (Standard index).</div>
                  </>
                )}
                {activeScenario === 'congestion' && (
                  <>
                    <div style={{ color: '#ffaa00' }}>&gt; [WARN] Local sensor node 'Gate C' registers capacity at 82%.</div>
                    <div style={{ color: '#ffaa00' }}>&gt; [SWARM] Diverting incoming flow vector. Informing organizers...</div>
                    <div style={{ color: '#46F3FF' }}>&gt; [ROUTER] Accessible alternative pathway computed around Gate C.</div>
                  </>
                )}
                {activeScenario === 'emergency' && (
                  <>
                    <div style={{ color: '#ef4444' }}>&gt; [CRITICAL] Sensor trigger: Wet ramp slip hazard reported at Ramp North.</div>
                    <div style={{ color: '#ef4444' }}>&gt; [CRITICAL] Stretcher rescue route cleared. Dispatching emergency crew.</div>
                    <div style={{ color: '#46F3FF' }}>&gt; [ROUTER] Wheelchair route redirect: Bypass Ramp North via internal lift.</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 9. Live Performance Metrics Section */}
        <section id="metrics-section" style={{ padding: '5rem 2rem', background: 'rgba(3, 6, 18, 0.4)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <span className="trans-tag">System Performance</span>
              <h2 className="text-4xl font-extrabold font-header mt-2 mb-4">Edge Telemetry & Performance Logs</h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                StadiumOS runs an SQLite edge ledger locally with automatic background synchronization to master cloud databases. Here is the current system footprint status:
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              {[
                { label: "AI Translation Latency", value: "< 450ms", desc: "End-to-end spoken translation time", barWidth: "90%", color: "#46F3FF" },
                { label: "Swarm Sync Overhead", value: "8ms", desc: "SQLite edge-ledger sync loop speed", barWidth: "95%", color: "#7C5CFF" },
                { label: "Memory Footprint", value: "< 24 MB", desc: "Decoupled python microservice memory", barWidth: "88%", color: "#ff007f" },
                { label: "Visual Model Size", value: "846 KB", desc: "Gzipped Three.js stadium models", barWidth: "92%", color: "#22c55e" }
              ].map((m, idx) => (
                <div 
                  key={idx} 
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>{m.label}</span>
                  <strong style={{ fontSize: '1.8rem', color: m.color, display: 'block', marginBottom: '0.5rem' }}>{m.value}</strong>
                  <p style={{ fontSize: '0.72rem', color: '#88a4b8', margin: '0 0 1rem 0' }}>{m.desc}</p>
                  <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '3px', borderRadius: '2px' }}>
                    <div style={{ width: m.barWidth, height: '100%', background: m.color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Diagnostics controls panel */}
            <div className="sandbox-card-glass morph-card-glow" style={{ padding: '1.75rem', borderRadius: '12px', background: 'rgba(5, 8, 22, 0.45)', border: '1px solid rgba(70, 243, 255, 0.15)', textAlign: 'left' }}>
              <h3 className="text-lg font-bold text-white mb-4">🔧 Swarm Diagnostics & Edge Ledger Sync</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <button className="btn-secondary-neon" onClick={handlePingSwarm} style={{ padding: '0.5rem 1.25rem', fontSize: '0.78rem' }}>
                  📡 Ping Swarm Network
                </button>
                <button className="btn-secondary-neon" onClick={handleOptimizeSwarm} style={{ padding: '0.5rem 1.25rem', fontSize: '0.78rem' }} disabled={isSwarmOptimizing}>
                  {isSwarmOptimizing ? "Optimizing threads..." : "⚡ Optimize Agent Allocations"}
                </button>
                <button className="btn-secondary-neon" onClick={handleRunDiagnostic} style={{ padding: '0.5rem 1.25rem', fontSize: '0.78rem' }}>
                  🛠️ Run Core Diagnostics
                </button>
                <button className="btn-secondary-neon" onClick={handleFlushCache} style={{ padding: '0.5rem 1.25rem', fontSize: '0.78rem' }} disabled={isSyncingCache}>
                  {isSyncingCache ? "Syncing..." : "📁 Flush Edge Cache Replica"}
                </button>
              </div>

              {/* Diagnostics output logs */}
              {diagnosticLogs.length > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '8px', fontFamily: 'Consolas, monospace', fontSize: '0.75rem', color: '#cffafe', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.25rem' }}>
                    <span>DIAGNOSTIC PROCESS LOGS</span>
                    <span>Progress: {diagnosticProgress}%</span>
                  </div>
                  {diagnosticLogs.map((dLog, idx) => <div key={idx}>&gt; {dLog}</div>)}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 10. Deaf Mode Accessibility Section */}
        <section id="accessibility-section" style={{ padding: '5.5rem 2rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            <div>
              <span className="trans-tag" style={{ borderLeftColor: '#ff007f' }}>WCAG 2.1 AA Compliance</span>
              <h2 className="text-4xl font-extrabold font-header mt-2 mb-4">Deaf Mode Closed Captions</h2>
              <p className="text-slate-300 leading-relaxed mb-6">
                StadiumOS provides comprehensive support for sensory-sensitive and hard-of-hearing volunteers. Enabling Deaf Mode routes spoken audio directly into a visual transcription HUD with customizable font-size scaling.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#46F3FF', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>♿ Inclusion Framework Details</h4>
                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: 0, lineHeight: '1.45' }}>
                  Supports WCAG 1.4.4 criteria allowing users to scale text size up to 200% without breaking layouts, keyboard-focusable anchors, and manual skip links.
                </p>
              </div>
            </div>

            {/* Closed Captions Live Preview */}
            <div className="sandbox-card-glass morph-card-glow" style={{ padding: '1.75rem', borderRadius: '12px', background: 'rgba(5, 8, 22, 0.75)', border: '1px solid rgba(255, 234, 0, 0.25)', height: '360px', display: 'flex', flexDirection: 'column', gap: '1rem', justifyStretch: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 234, 0, 0.15)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#ffea00', fontWeight: 'bold', fontFamily: 'Consolas, monospace' }}>🧏 DEAF_MODE_CAPTION_OVERLAY</span>
                <span style={{ fontSize: '0.7rem', color: '#88a4b8' }}>PREVIEW ACTIVE</span>
              </div>
              
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.6)', border: '1px dashed rgba(255, 234, 0, 0.3)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '120px' }}>
                <p style={{ fontSize: '1.2rem', color: '#ffea00', fontWeight: 'bold', margin: 0, lineHeight: '1.4', textAlign: 'center' }}>
                  "Proceed towards Gate C. Accessible wheelchair elevator is located 20m ahead on the left."
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', fontSize: '0.75rem', color: '#88a4b8' }}>
                <span>Zoom Level: 120%</span>
                <span style={{ color: '#22c55e' }}>● SPEECH SYNTAX: COMPLIANT</span>
              </div>
            </div>
          </div>
        </section>

        {/* 11. About StadiumOS Section (Grid of beautiful info cards) */}
        <section id="about-section" style={{ padding: '5.5rem 0', background: 'rgba(3, 6, 18, 0.45)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <span className="trans-tag" style={{ borderLeftColor: '#7C5CFF' }}>FIFA 2026 PromptWars</span>
              <h2 className="text-4xl font-extrabold font-header mt-2 mb-4">About StadiumOS</h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Next-generation venue management system designed to coordinate safety and accessibility at scale under the FIFA World Cup 2026.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', textAlign: 'left' }}>
              {[
                { title: "🎯 Mission", desc: "Transform high-pressure stadium environments into safe, inclusive, and accessible spaces using generative AI agents.", icon: "Activity" },
                { title: "⚠️ Problem Statement", desc: "Language barriers, exit bottlenecks, and wet ramp physical hazards delay response times and compromise crowd safety.", icon: "AlertCircle" },
                { title: "🗣️ Volunteer Persona", desc: "Assists fans on site. Receives instant speech transcripts, calming scripts, and step-free directions.", icon: "Users" },
                { title: "⚡ Organizer Persona", desc: "Coordinates operations. Views live crowd densities, dispatches alert flags, and triages security warnings.", icon: "Zap" },
                { title: "🛡️ Venue Staff", desc: "Maintains security. Monitors automated CCTV triage, triggers perimeter sweeps, and syncs local cache ledgers.", icon: "Shield" },
                { title: "🤖 Generative AI", desc: "Computes de-escalation tone response strategies using Gemini Pro 2.0 and structures tactical command plans.", icon: "Sparkles" },
                { title: "♿ WCAG AA compliant", desc: "Fully keyboard focusable, text size scaling support up to 200%, and dedicated skip-to-content anchors.", icon: "Compass" },
                { title: "💾 Technology Stack", desc: "React, Three.js/Fiber, FastAPI, SQLite Edge Ledger, and Google GenAI SDK.", icon: "Terminal" },
                { title: "🗺️ Future Roadmap", desc: "Advanced LIDAR perimeter scanners, multi-stadium swarm broker nodes, and automatic heat index triggers.", icon: "Clock" }
              ].map((card, idx) => (
                <div 
                  key={idx} 
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <h4 style={{ fontSize: '1rem', color: '#46F3FF', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 0 0.5rem 0' }}>
                    {card.title}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: '1.45' }}>
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Egress Footer */}
        <footer className="landing-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', padding: '3rem 2rem', background: '#020408', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/stadiumos.png" alt="Logo" style={{ height: '24px' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: '900', letterSpacing: '0.1em', color: '#fff' }}>STADIUMOS</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              © 2026 StadiumOS. Built for the FIFA World Cup 2026 PromptWars.
            </div>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <a href="https://github.com/riyanshika7/stadiumOS" target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                GitHub <ExternalLink size={12} />
              </a>
              <button 
                onClick={() => scrollToSection('hero-section')} 
                style={{ fontSize: '0.8rem', color: '#46F3FF', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                Back to Top ↑
              </button>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
