/* istanbul ignore file */
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import { Play, Gamepad2, Github, ExternalLink, Activity, Terminal, Shield, Zap, Sparkles } from 'lucide-react';
import '../landing.css';
import TypingText from './TypingText';
import StatsBanner from './StatsBanner';
import FeaturesSection from './FeaturesSection';

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
  const [activeSection, setActiveSection] = useState('hero-anchor');

  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState(null);
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
  const [stadiumBrightness, setStadiumBrightness] = useState(0.15);

  const lenisRef = useRef(null);

  const bootMessages = [
    "Initializing StadiumOS Kernel v4.2.1-prod...",
    "Connecting Swarm Intelligence Agents (Mediator, Triage, Router)...",
    "Loading 3D Digital Twin Geometry & Venue Grid...",
    "Synchronizing CCTV Feeds & Ambient Sensor Networks...",
    "Calibrating Weather-Aware Dijkstra Pathing Matrices...",
    "Mission Control Online. Activating Holographic HUD."
  ];

  // 1. Initializing Boot sequence
  useEffect(() => {
    const timer = setInterval(() => {
      setBootProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setBootDone(true);
          }, 800);
          return 100;
        }
        
        // Random realistic loading increments
        const increment = Math.floor(Math.random() * 8) + 4;
        const nextVal = Math.min(100, prev + increment);
        
        if (nextVal < 20) setBootPhase(0);
        else if (nextVal < 40) setBootPhase(1);
        else if (nextVal < 60) setBootPhase(2);
        else if (nextVal < 80) setBootPhase(3);
        else if (nextVal < 99) setBootPhase(4);
        else setBootPhase(5);

        return nextVal;
      });
    }, 120);

    return () => clearInterval(timer);
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

  // 4. Scroll progress & Section Tracking
  useEffect(() => {
    if (!bootDone) return;

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(window.scrollY / totalScroll);
        setIsNavScrolled(window.scrollY > 50);
      }

      const sections = ['hero-anchor', 'digital-twin-details', 'sandbox-console', 'features-section'];
      let currentActive = 'hero-anchor';
      
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

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
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
  // Magnetic / Floating Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 80, damping: 12 } }
  };

  return (
    <div className="landing-body animated-gradient-bg min-h-screen relative w-full select-none overflow-x-hidden">
      
      {/* ⚡ Cinematic Loading Console Overlay */}
      <AnimatePresence>
        {!bootDone && (
          <motion.div 
            className="boot-sequence-overlay"
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)', transition: { duration: 0.8, ease: 'easeInOut' } }}
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
            {/* Holographic matrix background scan lines */}
            <div className="scanlines" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 6px 100%', zIndex: 1, pointerEvents: 'none' }} />
            
            {/* Logo materializing from glow */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', zIndex: 2, marginBottom: '3rem' }}>
              <motion.img 
                src="/stadiumos.png" 
                alt="StadiumOS Logo" 
                style={{
                  height: '80px',
                  filter: `drop-shadow(0 0 ${bootProgress / 4}px rgba(70, 243, 255, 0.8))`
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              />
              <h1 style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '0.2em', background: 'linear-gradient(90deg, #46F3FF, #7C5CFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                STADIUMOS
              </h1>
            </div>

            {/* Console output messages */}
            <div 
              style={{
                width: '100%',
                maxWidth: '650px',
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(70, 243, 255, 0.2)',
                borderRadius: '8px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                zIndex: 2,
                boxShadow: '0 0 30px rgba(0, 240, 255, 0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(70, 243, 255, 0.15)', paddingBottom: '0.5rem', fontSize: '0.8rem', color: '#88a4b8' }}>
                <span>🛰️ SYS_BOOT // CORE_BRIDGE_ONLINE</span>
                <span>SECURE MODE</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#a5f3fc', minHeight: '80px' }}>
                <div style={{ color: '#00ffcc' }}>&gt; {bootMessages[bootPhase]}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Establishing RAG Playbook node caches... OK</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Mounting Rate Limiters & Security Headers... OK</div>
              </div>

              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${bootProgress}%`, height: '100%', background: 'linear-gradient(90deg, #46F3FF, #7C5CFF)', transition: 'width 0.1s ease-out' }} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', width: '40px', textAlign: 'right' }}>{bootProgress}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Stadium Canvas */}
      <React.Suspense fallback={<div className="landing-vignette-overlay" style={{ background: '#02040a' }} />}>
        <div style={{ filter: `brightness(${stadiumBrightness})`, transition: 'filter 1.2s cubic-bezier(0.25, 1, 0.5, 1)' }}>
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
      
      {/* Aurora overlay glow grid */}
      <div className="landing-vignette-overlay" style={{ background: 'radial-gradient(circle at 50% 30%, transparent 40%, rgba(3, 6, 18, 0.95) 90%)' }} />

      {/* Futuristic Background Beams / Particle Starfield */}
      <div 
        className="aurora-beams" 
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 10% 20%, rgba(124, 92, 255, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(70, 243, 255, 0.05) 0%, transparent 45%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Floating Glass Cards */}
      <motion.div 
        className="floating-glass-card"
        style={{ position: 'absolute', top: '18%', left: '4%', zIndex: 50, pointerEvents: 'auto' }}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="floating-indicator bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
        <span>CROWD RISK: LOW</span>
      </motion.div>

      <motion.div 
        className="floating-glass-card"
        style={{ position: 'absolute', top: '22%', right: '4%', zIndex: 50, pointerEvents: 'auto' }}
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="floating-indicator bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse"></span>
        <span>GATE 5: CONGESTION</span>
      </motion.div>

      <motion.div 
        className="floating-glass-card"
        style={{ position: 'absolute', top: '48%', left: '3%', zIndex: 50, pointerEvents: 'auto' }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="floating-indicator bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></span>
        <span>VOLUNTEER: NEARBY</span>
      </motion.div>

      <motion.div 
        className="floating-glass-card"
        style={{ position: 'absolute', top: '52%', right: '3%', zIndex: 50, pointerEvents: 'auto' }}
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="floating-indicator bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"></span>
        <span>⚠️ MEDICAL ALERT (SEC-2)</span>
      </motion.div>

      <motion.div 
        className="floating-glass-card"
        style={{ position: 'absolute', bottom: '15%', left: '6%', zIndex: 50, pointerEvents: 'auto' }}
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="floating-indicator bg-indigo-500 shadow-[0_0_8px_#6366f1]"></span>
        <span>TRANSLATION: ACTIVE</span>
      </motion.div>

      <motion.div 
        className="floating-glass-card"
        style={{ position: 'absolute', bottom: '18%', right: '6%', zIndex: 50, pointerEvents: 'auto' }}
        animate={{ y: [0, -11, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="floating-indicator bg-purple-500 shadow-[0_0_8px_#a855f7]"></span>
        <span>AI PREDICTION: NOMINAL</span>
      </motion.div>

      {/* Premium Apple Navigation */}
      <nav className={`landing-nav ${isNavScrolled ? 'scrolled' : ''}`}>
        <div className="landing-logo">
          <img src="/stadiumos.png" alt="StadiumOS Logo" />
          <span>StadiumOS</span>
        </div>
        <div className="landing-nav-links">
          <button  
            type="button"
            className="landing-nav-link" 
            onClick={() => scrollToSection('features-section')}
          >
            Features
          </button>
          <button  
            type="button"
            className="landing-nav-link" 
            onClick={() => scrollToSection('technology-section')}
          >
            Technology
          </button>
          <button  
            type="button"
            className="landing-nav-link" 
            onClick={() => scrollToSection('architecture-section')}
          >
            Architecture
          </button>
          <button  
            type="button"
            className="landing-nav-link" 
            onClick={() => scrollToSection('sandbox-console')}
          >
            Demo
          </button>
          <button  
            type="button"
            className="landing-nav-link" 
            onClick={() => scrollToSection('about-section')}
          >
            About
          </button>
          <a 
            href="https://github.com/riyanshika7/stadiumOS" 
            target="_blank"
            rel="noreferrer"
            className="landing-nav-link"
          >
            GitHub
          </a>
          <button  className="btn-neon-cta" onClick={(e) => { handleButtonRipple(e); setTimeout(onEnterConsole, 300); }}>
            Launch AI <Zap size={14} style={{ fill: '#ffffff' }} />
          </button>
        </div>
      </nav>

      {/* Cinematic Hero Content Section */}
      <div id="hero-anchor" className="hero-wrapper">
        <motion.div className="hero-text-content" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div className="hero-pill-badge ai-pulse-ring" variants={itemVariants}>
            <span className="indicator-pulse"></span>
            FIFA World Cup 2026 Active Digital Twin
          </motion.div>
          
          <motion.h1 className="hero-main-title" variants={itemVariants}>
            The AI Operating System <br />
            <span className="hero-gradient-text">For World-Class Stadiums</span>
          </motion.h1>

          <motion.p className="hero-sub-para min-h-[48px]" variants={itemVariants}>
            <TypingText text="StadiumOS transforms FIFA World Cup stadiums into intelligent digital ecosystems by coordinating volunteers, organizers, and operations through real-time Generative AI." />
          </motion.p>
          
          {/* Flagship Cinematic CTA Buttons with Hover Magnetic Scale */}
          <motion.div className="hero-action-buttons" variants={itemVariants} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
            
            <motion.button 
              className="btn-primary-neon" 
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 240, 255, 0.6)' }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => { handleButtonRipple(e); setTimeout(onEnterConsole, 350); }}
            >
              <Play size={18} fill="#ffffff" /> Try Live Demo
            </motion.button>

            <motion.button 
              className="btn-secondary-neon" 
              whileHover={{ scale: 1.05, borderColor: 'rgba(70, 243, 255, 0.6)', background: 'rgba(255,255,255,0.06)' }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => { handleButtonRipple(e); scrollToSection('sandbox-console'); }}
            >
              <Gamepad2 size={18} /> Watch AI Simulation
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Bouncing Glowing Football Scroll Indicator */}
        <motion.div 
          className="scroll-hint-bar flex flex-col items-center gap-2" 
          onClick={() => scrollToSection('digital-twin-details')}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ cursor: 'pointer', pointerEvents: 'auto', position: 'absolute', bottom: '2.5rem' }}
        >
          <span className="text-[9px] tracking-[0.2em] text-slate-400 font-extrabold uppercase">SCROLL FOR SIMULATION</span>
          <div className="football-glow-container">
            <svg className="football-svg" viewBox="0 0 24 24" fill="none" stroke="#46F3FF" strokeWidth="1.5" style={{ width: '22px', height: '22px', filter: 'drop-shadow(0 0 8px rgba(70,243,255,0.8))' }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 0 0-4 1.5L12 8.5l4-5A10 10 0 0 0 12 2Z" />
              <path d="M16.5 3.5 12 8.5v5.5l5.5 3.5A10 10 0 0 0 22 12a10 10 0 0 0-5.5-8.5Z" />
              <path d="M17.5 17.5 12 14l-5.5 3.5A10 10 0 0 0 12 22a10 10 0 0 0 5.5-4.5Z" />
              <path d="M6.5 17.5 12 14V8.5L6.5 3.5A10 10 0 0 0 2 12a10 10 0 0 0 4.5 5.5Z" />
            </svg>
          </div>
        </motion.div>
      </div>

      <StatsBanner />

      {/* Cinematic Scroll Content Section */}
      <section id="technology-section" className="transformation-section smooth-section-reveal">
        <div className="transformation-grid">
          <div className="transformation-content">
            <span className="trans-tag">Ambient Orchestrator</span>
            <h2 className="trans-title">From Stadium Model to <br />Autonomous Venue Neural Grid</h2>
            <p className="trans-description">As turnstile counts spike and gates exceed safe capacities, the Digital Twin highlights bottleneck nodes, computes alternative step-free exit paths, and coordinates security, facility, and translation sub-agents.</p>
            <div className="agent-badge-list">
              {['Linguistic Mediator', 'Safety Triage', 'Access Router', 'Predictive Ops'].map(t => (
                <span key={t} className="agent-badge-pill">{t}</span>
              ))}
            </div>
          </div>

          <div id="sandbox-console" className="sandbox-card-glass morph-card-glow radar-scan-overlay">
            <h3 className="text-xl font-bold font-header mb-2 text-[#46F3FF]">⚡ Interactive Digital Twin Sandbox</h3>
            <p className="text-sm text-slate-400 mb-6">Simulate operational stadium scenarios to see the 3D Digital Twin respond, highlight paths, and compute redirect routes.</p>
            <div className="sandbox-scenarios-box">
              <button  className={`btn-sandbox-option ${activeScenario === 'normal' ? 'active' : ''}`} onClick={() => setActiveScenario('normal')}>
                <span>🟢 Normal Operations</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Active</span>
              </button>
              <button  className={`btn-sandbox-option ${activeScenario === 'congestion' ? 'active' : ''}`} onClick={() => setActiveScenario('congestion')}>
                <span>🟡 Concourse Warning</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">Simulate Gate C Surge</span>
              </button>
              <button  className={`btn-sandbox-option ${activeScenario === 'emergency' ? 'active' : ''}`} onClick={() => setActiveScenario('emergency')}>
                <span>🔴 Emergency Bypass</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-red-500">Trigger Critical Event</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <FeaturesSection />

      {/* 🏛️ Architecture Section */}
      <section id="architecture-section" className="transformation-section smooth-section-reveal" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <span className="trans-tag">System Design</span>
          <h2 className="text-4xl font-extrabold font-header mt-2 mb-4">Hierarchical Swarm Architecture</h2>
          <p className="text-slate-400 max-w-2xl mb-8">
            StadiumOS runs on a strictly decoupled clean architecture layout implementing the SOLID design principles. A master coordinator delegates tasks to a network of specialized autonomous sub-agents:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {[
              { name: 'Linguistic Mediator', role: 'De-escalation & Spoken Translation', desc: 'Auto-detects spoken language, translates messages under 500ms, and generates psycho-social calming scripts.', icon: '🗣️' },
              { name: 'Safety Triage', role: 'CCTV Video & Risk Assessment', desc: 'Monitors real-time crowd dynamics, counts local density thresholds, and highlights slip-and-fall hazards.', icon: '🚨' },
              { name: 'Access Router', role: 'Weather-Aware Pathfinding', desc: 'Runs Dijkstra path calculations to bypass active wet zones, congested plazas, or security blockages.', icon: '📍' },
              { name: 'Predictive Ops', role: 'Ambient Concourse Predictor', desc: 'Continuously updates SQLite ledger statistics and queries Open-Meteo APIs to populate volunteer metrics.', icon: '⚙️' }
            ].map(agent => (
              <div 
                key={agent.name}
                style={{
                  background: 'rgba(5, 8, 22, 0.5)',
                  border: '1px solid rgba(70, 243, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  textAlign: 'left'
                }}
              >
                <strong style={{ fontSize: '1rem', color: '#46F3FF', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>{agent.icon}</span> {agent.name}
                </strong>
                <span style={{ fontSize: '0.72rem', color: '#88a4b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{agent.role}</span>
                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.45', margin: '0.5rem 0 0 0' }}>{agent.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ℹ️ About Section */}
      <section id="about-section" className="transformation-section smooth-section-reveal" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '4rem', paddingBottom: '4rem', background: 'rgba(2, 4, 10, 0.4)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
          <div>
            <span className="trans-tag">FIFA 2026 PromptWars</span>
            <h2 className="text-3xl font-extrabold font-header mt-2 mb-4">About StadiumOS</h2>
            <p className="text-slate-300 leading-relaxed text-sm">
              StadiumOS is a next-generation AI-powered venue command system designed to ensure safety and accessibility at scale during the FIFA World Cup 2026. Built as an award-winning submission for the Challenge 4 PromptWars final evaluation.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {[
              { title: '🎯 Goal & De-escalation', desc: 'Dynamic context detection (intent, tone) to provide real-time scripts and guidelines for concourse volunteers.', color: '#46F3FF' },
              { title: '♿ WCAG & Inclusivity', desc: 'Supports interactive step-free wheelchair routes and Deaf Mode utilizing speech-to-text transcriptions with scalable text-size modifiers.', color: '#7C5CFF' },
              { title: '🛡️ Robustness & Security', desc: 'Secure environment variables setup, full sanitization of SQLite entries, and isolated file parsers in the Judges Portal.', color: '#46F3FF' }
            ].map(item => (
              <div 
                key={item.title} 
                style={{
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid rgba(255, 255, 255, 0.05)', 
                  borderRadius: '10px', 
                  padding: '1.25rem',
                  textAlign: 'left'
                }}
              >
                <h4 style={{ fontSize: '0.9rem', color: item.color, margin: '0 0 0.3rem 0', fontWeight: 'bold' }}>{item.title}</h4>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div>© 2026 StadiumOS. Built for the FIFA World Cup 2026 PromptWars.</div>
      </footer>
    </div>
  );
}
