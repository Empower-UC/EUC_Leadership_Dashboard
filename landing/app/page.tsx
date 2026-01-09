"use client";

import { motion, useInView, useSpring, useTransform, useScroll, useMotionValue, animate, MotionValue } from "framer-motion";
import { useRef, useEffect, useState, ReactNode } from "react";
import Image from "next/image";

// Magnetic element that follows cursor
function Magnetic({ children, strength = 0.15 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    animate(x, 0, { type: "spring", stiffness: 300, damping: 20 });
    animate(y, 0, { type: "spring", stiffness: 300, damping: 20 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
    >
      {children}
    </motion.div>
  );
}

// Animated counter with spring physics
function AnimatedCounter({ value, suffix = "", prefix = "", decimals = 0 }: { value: number; suffix?: string; prefix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => {
    const formatted = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString();
    return `${prefix}${formatted}${suffix}`;
  });
  const [displayValue, setDisplayValue] = useState(`${prefix}0${suffix}`);

  useEffect(() => {
    if (isInView) spring.set(value);
  }, [isInView, spring, value]);

  useEffect(() => {
    return display.on("change", (latest) => setDisplayValue(latest));
  }, [display]);

  return <span ref={ref}>{displayValue}</span>;
}

// Text reveal animation
function TextReveal({ children, className = "", delay = 0 }: { children: string; className?: string; delay?: number }) {
  const words = children.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: delay + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// Polaroid-style image component
function PolaroidImage({
  src,
  alt,
  caption,
  rotation = 0,
  className = "",
  delay = 0
}: {
  src: string;
  alt: string;
  caption?: string;
  rotation?: number;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: rotation - 5 }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 20 }}
      className={`bg-white p-2 pb-8 shadow-2xl shadow-[var(--navy)]/20 cursor-pointer ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="300px"
        />
      </div>
      {caption && (
        <p className="mt-3 text-center text-sm text-[var(--text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>
          {caption}
        </p>
      )}
    </motion.div>
  );
}

// Floating particle
function FloatingParticle({ delay = 0, x = 0, size = 8 }: { delay?: number; x?: number; size?: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-[var(--amber)]"
      style={{ width: size, height: size, left: `${x}%` }}
      initial={{ y: "100vh", opacity: 0 }}
      animate={{
        y: "-100vh",
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 15,
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
}

// Marquee component for infinite scrolling text
function Marquee({ children, speed = 30 }: { children: ReactNode; speed?: number }) {
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        className="inline-block"
        animate={{ x: [0, "-50%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

// Parallax wrapper
function Parallax({ children, offset = 50 }: { children: ReactNode; offset?: number }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  return (
    <div ref={ref}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const [cursorVariant, setCursorVariant] = useState("default");

  // Smooth scroll progress for header
  const headerBg = useTransform(scrollYProgress, [0, 0.1], ["rgba(253, 251, 247, 0)", "rgba(253, 251, 247, 0.98)"]);

  return (
    <div className="min-h-screen bg-[var(--cream)] overflow-x-hidden selection:bg-[var(--amber)] selection:text-white">
      {/* Animated grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />

      {/* Progress bar with gradient */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 origin-left z-[60]"
        style={{
          scaleX: scrollYProgress,
          background: "linear-gradient(90deg, var(--blue), var(--amber), var(--coral))"
        }}
      />

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[10, 25, 40, 55, 70, 85].map((x, i) => (
          <FloatingParticle key={i} delay={i * 2.5} x={x} size={4 + Math.random() * 6} />
        ))}
      </div>

      {/* Header */}
      <motion.header
        style={{ backgroundColor: headerBg }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      >
        <div className="container-landing flex items-center justify-between h-20">
          <Magnetic>
            <a href="#" className="flex items-center gap-3 group">
              <motion.div
                className="w-12 h-12 bg-[var(--navy)] rounded-2xl flex items-center justify-center"
                whileHover={{ scale: 1.05, rotate: -5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <span className="text-white font-bold text-xl" style={{ fontFamily: 'var(--font-display)' }}>E</span>
              </motion.div>
              <div className="hidden sm:block">
                <span className="font-semibold text-[var(--navy)] block leading-tight text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                  Empower
                </span>
                <span className="text-xs text-[var(--text-muted)] block tracking-wide">Upper Cumberland</span>
              </div>
            </a>
          </Magnetic>

          <nav className="hidden lg:flex items-center gap-10">
            {[
              { href: "#impact", label: "Impact" },
              { href: "#challenge", label: "Challenge" },
              { href: "#solution", label: "Solution" },
              { href: "#journey", label: "Journey" },
              { href: "#stories", label: "Stories" },
            ].map((link) => (
              <Magnetic key={link.href} strength={0.2}>
                <a
                  href={link.href}
                  className="text-[var(--text-secondary)] hover:text-[var(--navy)] transition-colors text-sm font-medium relative group py-2"
                >
                  {link.label}
                  <motion.span
                    className="absolute -bottom-0 left-0 h-[2px] bg-[var(--amber)]"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </a>
              </Magnetic>
            ))}
          </nav>

          <Magnetic>
            <motion.a
              href="#partner"
              className="bg-[var(--navy)] text-white px-6 py-3 rounded-full text-sm font-semibold relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">Partner With Us</span>
              <motion.div
                className="absolute inset-0 bg-[var(--blue)]"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>
          </Magnetic>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="min-h-screen pt-32 pb-20 relative flex items-center">
        {/* Decorative background elements */}
        <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-gradient-radial from-[var(--blue)]/10 via-transparent to-transparent rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-[var(--amber)]/10 via-transparent to-transparent rounded-full" />

        <div className="container-landing relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div className="relative">
              {/* Eyebrow with animated pulse */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-3 mb-8"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--coral)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--coral)]"></span>
                </span>
                <span className="text-sm font-semibold text-[var(--navy)] tracking-wide uppercase">
                  $25 Million Initiative
                </span>
              </motion.div>

              {/* Main headline with dramatic reveal */}
              <h1 className="mb-8">
                <span className="block text-5xl md:text-6xl xl:text-7xl font-semibold text-[var(--navy)] leading-[1.05] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  <TextReveal delay={0.2}>Breaking the</TextReveal>
                </span>
                <span className="block text-5xl md:text-6xl xl:text-7xl font-semibold leading-[1.05] tracking-tight mt-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <motion.span
                    className="inline-block bg-gradient-to-r from-[var(--coral)] via-[var(--amber)] to-[var(--blue)] bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    cycle of poverty
                  </motion.span>
                </span>
              </h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="text-xl md:text-2xl text-[var(--text-secondary)] mb-10 leading-relaxed max-w-xl"
              >
                A coordinated poverty alleviation system delivering{" "}
                <span className="text-[var(--navy)] font-medium">family stability</span> and{" "}
                <span className="text-[var(--navy)] font-medium">measurable economic outcomes</span> across 14 rural Tennessee counties.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="flex flex-col sm:flex-row gap-4 mb-14"
              >
                <Magnetic>
                  <motion.a
                    href="#solution"
                    className="group bg-[var(--navy)] text-white px-8 py-4 rounded-full text-lg font-semibold inline-flex items-center justify-center gap-3 relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">Explore the Model</span>
                    <motion.svg
                      className="w-5 h-5 relative z-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </motion.svg>
                    <div className="absolute inset-0 bg-[var(--blue)] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                  </motion.a>
                </Magnetic>
                <Magnetic>
                  <motion.a
                    href="#partner"
                    className="group border-2 border-[var(--navy)] text-[var(--navy)] px-8 py-4 rounded-full text-lg font-semibold inline-flex items-center justify-center gap-3 hover:bg-[var(--navy)] hover:text-white transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Partner With Us
                  </motion.a>
                </Magnetic>
              </motion.div>

              {/* Trust indicators with staggered reveal */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="flex items-center gap-8"
              >
                {[
                  { value: "880", label: "Families" },
                  { value: "6.4:1", label: "ROI" },
                  { value: "75+", label: "Graduates" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + i * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl md:text-3xl font-bold text-[var(--navy)]" style={{ fontFamily: 'var(--font-display)' }}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right: Polaroid photo collage */}
            <div className="relative h-[500px] md:h-[600px]">
              {/* Main animated asterisk shape behind photos */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1.5, delay: 0.3, type: "spring", stiffness: 60 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] -z-10"
              >
                <motion.svg
                  viewBox="0 0 200 200"
                  className="w-full h-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                >
                  <defs>
                    <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--blue)" stopOpacity="0.15" />
                      <stop offset="50%" stopColor="var(--amber)" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="var(--coral)" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M100 0 L115 70 L185 50 L130 100 L185 150 L115 130 L100 200 L85 130 L15 150 L70 100 L15 50 L85 70 Z"
                    fill="url(#starGradient)"
                  />
                </motion.svg>
              </motion.div>

              {/* Polaroid photos scattered */}
              <PolaroidImage
                src="https://picsum.photos/seed/family1/400/300"
                alt="Family graduation celebration"
                caption="Graduation Day"
                rotation={-8}
                delay={0.4}
                className="absolute top-0 left-0 w-52 z-10"
              />
              <PolaroidImage
                src="https://picsum.photos/seed/family2/400/300"
                alt="Community gathering"
                rotation={5}
                delay={0.5}
                className="absolute top-4 right-0 w-48 z-20"
              />
              <PolaroidImage
                src="https://picsum.photos/seed/family3/400/300"
                alt="Navigator meeting"
                caption="Navigator Support"
                rotation={-3}
                delay={0.6}
                className="absolute bottom-20 left-10 w-56 z-30"
              />
              <PolaroidImage
                src="https://picsum.photos/seed/family4/400/300"
                alt="Children learning"
                rotation={7}
                delay={0.7}
                className="absolute bottom-0 right-10 w-44 z-10"
              />
              <PolaroidImage
                src="https://picsum.photos/seed/family5/400/300"
                alt="Career training"
                caption="New Skills"
                rotation={-12}
                delay={0.8}
                className="absolute top-1/3 right-1/4 w-40 z-40"
              />

              {/* Floating stat badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 200 }}
                className="absolute bottom-1/4 left-0 bg-[var(--navy)] text-white px-6 py-4 rounded-2xl shadow-2xl z-50"
              >
                <div className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>1,905</div>
                <div className="text-xs text-white/70">Children Impacted</div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-[var(--navy)]/30 rounded-full flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 bg-[var(--navy)] rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Scrolling text marquee */}
      <section className="py-6 bg-[var(--navy)] overflow-hidden">
        <Marquee speed={25}>
          <span className="inline-flex items-center gap-8 px-8 text-xl font-medium text-white/90" style={{ fontFamily: 'var(--font-display)' }}>
            <span>Solving Poverty</span>
            <span className="text-[var(--amber)]">★</span>
            <span>Permanently</span>
            <span className="text-[var(--amber)]">★</span>
            <span>14 Counties</span>
            <span className="text-[var(--amber)]">★</span>
            <span>880 Families</span>
            <span className="text-[var(--amber)]">★</span>
            <span>$6.2M Wage Gains</span>
            <span className="text-[var(--amber)]">★</span>
          </span>
        </Marquee>
      </section>

      {/* Impact Metrics - Bento Grid Style */}
      <section id="impact" className="py-24 md:py-32">
        <div className="container-landing">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-[var(--sage)]/20 text-[var(--sage)] px-4 py-2 rounded-full text-sm font-semibold mb-6"
            >
              <span className="w-2 h-2 bg-[var(--sage)] rounded-full" />
              Measurable Impact
            </motion.span>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[var(--navy)] mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Numbers that tell
              <br />
              <span className="relative inline-block">
                real stories
                <motion.svg
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute -bottom-2 left-0 w-full h-3"
                  viewBox="0 0 200 12"
                >
                  <motion.path
                    d="M2 8 Q50 2, 100 8 T198 6"
                    stroke="var(--amber)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </motion.svg>
              </span>
            </h2>
          </motion.div>

          {/* Bento grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {/* Large card - Families */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="col-span-2 bg-gradient-to-br from-[var(--blue)] to-[var(--navy)] rounded-3xl p-8 text-white relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-6xl md:text-7xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <AnimatedCounter value={880} />
                </div>
                <div className="text-xl text-white/90 font-medium">Families Served</div>
                <div className="text-sm text-white/60 mt-1">Since program launch</div>
              </div>
            </motion.div>

            {/* Children card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-[var(--cream-dark)] rounded-3xl p-6 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[var(--sage)]/20 rounded-full" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-[var(--sage)]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-[var(--sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-[var(--navy)]" style={{ fontFamily: 'var(--font-display)' }}>
                  <AnimatedCounter value={1905} />
                </div>
                <div className="text-sm text-[var(--text-secondary)] mt-1">Children Impacted</div>
              </div>
            </motion.div>

            {/* ROI card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-[var(--amber)] rounded-3xl p-6 text-white relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-4xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                  <AnimatedCounter value={6.4} decimals={1} suffix=":1" />
                </div>
                <div className="text-sm text-white/80 mt-1">Return on Investment</div>
              </div>
            </motion.div>

            {/* Wage gains card - wide */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="col-span-2 bg-white rounded-3xl p-6 border border-[var(--navy)]/10 relative overflow-hidden group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-5xl font-bold text-[var(--navy)]" style={{ fontFamily: 'var(--font-display)' }}>
                    <AnimatedCounter value={6.2} decimals={1} prefix="$" suffix="M" />
                  </div>
                  <div className="text-[var(--text-secondary)] mt-1">Total Wage Gains</div>
                </div>
                <div className="w-24 h-24 bg-[var(--blue)]/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <motion.svg
                    className="w-12 h-12 text-[var(--blue)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </motion.svg>
                </div>
              </div>
            </motion.div>

            {/* Graduates card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="col-span-2 bg-gradient-to-br from-[var(--coral)] to-[var(--amber)] rounded-3xl p-6 text-white relative overflow-hidden group cursor-pointer"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                </div>
                <div>
                  <div className="text-4xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>75+</div>
                  <div className="text-white/90">Families at 225% FPL</div>
                  <div className="text-sm text-white/70 mt-1">Financial independence achieved</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section id="challenge" className="py-24 md:py-32 bg-white relative overflow-hidden">
        {/* Diagonal background element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--coral)]/5 to-transparent -skew-x-12 origin-top-right" />

        <div className="container-landing relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 bg-[var(--coral)]/10 text-[var(--coral)] px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <span className="w-2 h-2 bg-[var(--coral)] rounded-full animate-pulse" />
                The Problem
              </span>
              <h2
                className="text-4xl md:text-5xl font-semibold text-[var(--navy)] mb-8 leading-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                The system manages poverty.
                <br />
                <span className="text-[var(--coral)]">It doesn't end it.</span>
              </h2>

              <div className="space-y-6 text-lg text-[var(--text-secondary)] leading-relaxed">
                <p>
                  America spends <span className="font-bold text-[var(--navy)]">$1.2 trillion annually</span> across 114 federal programs. Yet poverty persists.
                </p>
                <p>
                  The problem isn't resources. <span className="italic">It's design.</span> Programs phase out benefits faster than wages rise—punishing progress.
                </p>
              </div>

              {/* Quote card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-10 bg-[var(--cream)] rounded-3xl p-8 relative"
              >
                <div className="absolute -top-4 left-8 text-8xl font-serif text-[var(--coral)]/20" style={{ fontFamily: 'var(--font-display)' }}>"</div>
                <blockquote className="text-xl text-[var(--navy)] italic leading-relaxed relative z-10">
                  No one in their right mind is gonna make a dollar to lose five. That literally is the goofy disincentive of the system.
                </blockquote>
                <div className="mt-6 flex items-center gap-4">
                  <div className="w-14 h-14 bg-[var(--navy)] rounded-full flex items-center justify-center text-white font-bold text-lg">CC</div>
                  <div>
                    <div className="font-semibold text-[var(--navy)]">Commissioner Clarence Carter</div>
                    <div className="text-sm text-[var(--text-muted)]">TN Department of Human Services</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Enhanced Benefits Cliff Visualization - Stacked Area Chart */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-[var(--cream)] to-[var(--cream-dark)] rounded-[2rem] p-6 md:p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl md:text-2xl font-semibold text-[var(--navy)]" style={{ fontFamily: 'var(--font-display)' }}>
                    The Benefits Cliff
                  </h3>
                  <span className="text-xs font-medium text-white bg-[var(--coral)] px-3 py-1.5 rounded-full">Critical Issue</span>
                </div>

                {/* Stacked Area Chart - Inspired by dashboard but simplified */}
                <div className="relative">
                  <svg viewBox="0 0 400 220" className="w-full" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      {/* Gradients for each layer */}
                      <linearGradient id="wagesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--sage)" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="var(--sage)" stopOpacity="0.5" />
                      </linearGradient>
                      <linearGradient id="snapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--blue)" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="var(--blue)" stopOpacity="0.4" />
                      </linearGradient>
                      <linearGradient id="tanfGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="var(--amber)" stopOpacity="0.4" />
                      </linearGradient>
                      <linearGradient id="medicaidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--coral)" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="var(--coral)" stopOpacity="0.4" />
                      </linearGradient>
                      <linearGradient id="cliffZoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--coral)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="var(--coral)" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[180, 140, 100, 60, 20].map((y, i) => (
                      <g key={i}>
                        <line x1="45" y1={y} x2="380" y2={y} stroke="var(--navy)" strokeOpacity="0.1" strokeDasharray="4 2" />
                        <text x="40" y={y + 4} textAnchor="end" className="fill-[var(--text-muted)]" fontSize="9" fontFamily="var(--font-body)">
                          ${(4 - i)}K
                        </text>
                      </g>
                    ))}

                    {/* Cliff zone highlight */}
                    <motion.rect
                      x="200"
                      y="20"
                      width="60"
                      height="160"
                      fill="url(#cliffZoneGrad)"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1.2, duration: 0.5 }}
                    />

                    {/* Medicaid layer (bottom) - drops at cliff */}
                    <motion.path
                      d="M50,180 L50,130 L100,130 L150,130 L200,130 L230,130 L230,180 L260,180 L310,180 L360,180 L360,180 L50,180 Z"
                      fill="url(#medicaidGrad)"
                      initial={{ opacity: 0, scaleY: 0 }}
                      whileInView={{ opacity: 1, scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2, duration: 0.8 }}
                      style={{ transformOrigin: "bottom" }}
                    />

                    {/* TANF layer - phases out gradually */}
                    <motion.path
                      d="M50,130 L50,105 L100,108 L150,115 L200,125 L230,130 L230,130 L200,130 L150,130 L100,130 L50,130 Z"
                      fill="url(#tanfGrad)"
                      initial={{ opacity: 0, scaleY: 0 }}
                      whileInView={{ opacity: 1, scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4, duration: 0.8 }}
                      style={{ transformOrigin: "bottom" }}
                    />

                    {/* SNAP layer - phases out gradually */}
                    <motion.path
                      d="M50,105 L50,75 L100,80 L150,90 L200,105 L230,115 L260,125 L310,130 L360,130 L360,180 L310,180 L260,180 L230,180 L200,125 L150,115 L100,108 L50,105 Z"
                      fill="url(#snapGrad)"
                      initial={{ opacity: 0, scaleY: 0 }}
                      whileInView={{ opacity: 1, scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                      style={{ transformOrigin: "bottom" }}
                    />

                    {/* Wages layer (top) - grows consistently */}
                    <motion.path
                      d="M50,75 L50,60 L100,55 L150,48 L200,40 L230,35 L260,30 L310,25 L360,20 L360,130 L310,130 L260,125 L230,115 L200,105 L150,90 L100,80 L50,75 Z"
                      fill="url(#wagesGrad)"
                      initial={{ opacity: 0, scaleY: 0 }}
                      whileInView={{ opacity: 1, scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8, duration: 0.8 }}
                      style={{ transformOrigin: "bottom" }}
                    />

                    {/* Total resources line - shows the cliff */}
                    <motion.path
                      d="M50,60 L100,55 L150,48 L200,40 L230,70 L260,75 L310,80 L360,85"
                      fill="none"
                      stroke="var(--navy)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    />

                    {/* Cliff marker */}
                    <motion.g
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1.5, duration: 0.4, type: "spring" }}
                    >
                      <circle cx="230" cy="70" r="8" fill="var(--coral)" stroke="white" strokeWidth="3" />
                      <text x="230" y="55" textAnchor="middle" className="fill-[var(--coral)]" fontSize="10" fontWeight="700">
                        CLIFF
                      </text>
                    </motion.g>

                    {/* X-axis labels */}
                    <line x1="50" y1="180" x2="360" y2="180" stroke="var(--navy)" strokeOpacity="0.2" />
                    {[
                      { x: 50, label: "50%" },
                      { x: 125, label: "100%" },
                      { x: 200, label: "138%" },
                      { x: 280, label: "175%" },
                      { x: 360, label: "225%" },
                    ].map((tick) => (
                      <text key={tick.label} x={tick.x} y="195" textAnchor="middle" className="fill-[var(--text-muted)]" fontSize="9" fontFamily="var(--font-body)">
                        {tick.label}
                      </text>
                    ))}
                    <text x="205" y="210" textAnchor="middle" className="fill-[var(--text-secondary)]" fontSize="10" fontFamily="var(--font-body)">
                      Federal Poverty Level
                    </text>
                  </svg>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "var(--sage)" }} />
                      <span className="text-[var(--text-secondary)]">Wages</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "var(--blue)" }} />
                      <span className="text-[var(--text-secondary)]">SNAP</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "var(--amber)" }} />
                      <span className="text-[var(--text-secondary)]">TANF</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "var(--coral)" }} />
                      <span className="text-[var(--text-secondary)]">Medicaid</span>
                    </div>
                  </div>
                </div>

                {/* Insight callout */}
                <div className="mt-6 p-4 bg-[var(--coral)]/10 rounded-xl border border-[var(--coral)]/20">
                  <p className="text-sm text-[var(--text-primary)] text-center">
                    <span className="font-bold text-[var(--coral)]">At 138-150% FPL:</span> Families lose ~<span className="font-bold">$900/month</span> in benefits while gaining only ~<span className="font-bold">$200</span> in wages
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive County Map Section */}
      <section className="py-20 md:py-28 bg-[var(--cream-dark)] relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--navy)" strokeWidth="0.5" strokeOpacity="0.1"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container-landing relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Map */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Tennessee state outline with UC highlighted */}
              <svg viewBox="0 0 500 300" className="w-full drop-shadow-xl">
                <defs>
                  <linearGradient id="ucGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--blue)" />
                    <stop offset="100%" stopColor="var(--navy)" />
                  </linearGradient>
                  <filter id="mapGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Tennessee state outline (simplified) */}
                <motion.path
                  d="M20,140 L60,135 L100,130 L140,128 L180,125 L220,122 L260,120 L300,118 L340,115 L380,112 L420,108 L460,105 L480,110 L480,180 L460,185 L420,188 L380,192 L340,195 L300,198 L260,200 L220,202 L180,205 L140,208 L100,210 L60,215 L20,220 Z"
                  fill="var(--cream)"
                  stroke="var(--navy)"
                  strokeWidth="2"
                  strokeOpacity="0.3"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5 }}
                />

                {/* Upper Cumberland Region - highlighted */}
                <motion.g
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  {/* UC Region shape */}
                  <path
                    d="M200,95 L240,90 L280,88 L320,92 L340,100 L345,120 L340,145 L320,160 L280,165 L240,162 L200,155 L180,140 L175,115 Z"
                    fill="url(#ucGradient)"
                    filter="url(#mapGlow)"
                    className="cursor-pointer"
                  />

                  {/* County divisions (simplified) */}
                  <g stroke="white" strokeWidth="1" strokeOpacity="0.3" fill="none">
                    <line x1="220" y1="95" x2="215" y2="155" />
                    <line x1="250" y1="90" x2="248" y2="160" />
                    <line x1="280" y1="88" x2="282" y2="162" />
                    <line x1="310" y1="92" x2="315" y2="158" />
                    <line x1="200" y1="120" x2="340" y2="115" />
                    <line x1="195" y1="140" x2="342" y2="135" />
                  </g>

                  {/* Location pin */}
                  <motion.g
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <circle cx="260" cy="125" r="8" fill="var(--coral)" stroke="white" strokeWidth="3" />
                    <circle cx="260" cy="125" r="3" fill="white" />
                  </motion.g>
                </motion.g>

                {/* Memphis label */}
                <text x="45" y="185" className="fill-[var(--text-muted)]" fontSize="10" fontFamily="var(--font-body)">
                  Memphis
                </text>

                {/* Nashville label */}
                <text x="150" y="175" className="fill-[var(--text-muted)]" fontSize="10" fontFamily="var(--font-body)">
                  Nashville
                </text>

                {/* Knoxville label */}
                <text x="400" y="145" className="fill-[var(--text-muted)]" fontSize="10" fontFamily="var(--font-body)">
                  Knoxville
                </text>

                {/* UC label */}
                <text x="260" y="80" textAnchor="middle" className="fill-[var(--navy)]" fontSize="12" fontWeight="700" fontFamily="var(--font-display)">
                  Upper Cumberland
                </text>
              </svg>

              {/* Pulsing region indicator */}
              <motion.div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-[var(--coral)]"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>

            {/* Right: County List + Stats */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 bg-[var(--blue)]/10 text-[var(--blue)] px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Our Region
              </span>

              <h3 className="text-4xl md:text-5xl font-semibold text-[var(--navy)] mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                14 Counties.
                <br />
                <span className="text-[var(--blue)]">One Mission.</span>
              </h3>

              <p className="text-lg text-[var(--text-secondary)] mb-8 leading-relaxed">
                The Upper Cumberland spans <span className="font-semibold text-[var(--navy)]">5,000+ square miles</span> of rural Tennessee—where families face unique challenges and opportunities.
              </p>

              {/* County grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-8">
                {[
                  "Cannon", "Clay", "Cumberland", "DeKalb",
                  "Fentress", "Jackson", "Macon", "Overton",
                  "Pickett", "Putnam", "Smith", "Van Buren",
                  "Warren", "White"
                ].map((county, i) => (
                  <motion.div
                    key={county}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 * i }}
                    whileHover={{ scale: 1.05, backgroundColor: "var(--blue)", color: "white" }}
                    className="px-3 py-2 bg-white rounded-lg text-center text-sm font-medium text-[var(--navy)] shadow-sm border border-[var(--navy)]/10 cursor-pointer transition-colors"
                  >
                    {county}
                  </motion.div>
                ))}
              </div>

              {/* Regional stats */}
              <div className="flex items-center gap-6 pt-6 border-t border-[var(--navy)]/10">
                <div>
                  <div className="text-3xl font-bold text-[var(--navy)]" style={{ fontFamily: 'var(--font-display)' }}>
                    350K+
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">Population</div>
                </div>
                <div className="w-px h-12 bg-[var(--navy)]/10" />
                <div>
                  <div className="text-3xl font-bold text-[var(--navy)]" style={{ fontFamily: 'var(--font-display)' }}>
                    5,000
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">Square Miles</div>
                </div>
                <div className="w-px h-12 bg-[var(--navy)]/10" />
                <div>
                  <div className="text-3xl font-bold text-[var(--navy)]" style={{ fontFamily: 'var(--font-display)' }}>
                    17
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">Navigators</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Solution: Three Pillars */}
      <section id="solution" className="py-24 md:py-32 bg-[var(--navy)] relative overflow-hidden">
        {/* Animated background gradient orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--blue)]/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--amber)]/10 rounded-full blur-[100px]"
        />

        <div className="container-landing relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 bg-[var(--amber)]/20 text-[var(--amber)] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Our Approach
            </span>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Three Pillars of
              <br />
              <span className="text-[var(--amber)]">Transformation</span>
            </h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto">
              We coordinate what the system fragments. We bridge what the system drops.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Relationships Pillar */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 h-full hover:bg-white/10 hover:border-white/20 transition-all duration-500">
                <div className="w-20 h-20 bg-gradient-to-br from-[var(--blue)] to-[var(--blue-light)] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-[-5deg] transition-all duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">17 Navigators</div>
                <h3 className="text-2xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>Relationships</h3>
                <p className="text-white/70 leading-relaxed">Dedicated Navigators build trust over time. Each family has a consistent partner who truly understands their story.</p>
              </div>
            </motion.div>

            {/* Resources Pillar */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 h-full hover:bg-white/10 hover:border-white/20 transition-all duration-500">
                <div className="w-20 h-20 bg-gradient-to-br from-[var(--amber)] to-yellow-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-[-5deg] transition-all duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                </div>
                <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">$5K Support</div>
                <h3 className="text-2xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>Resources</h3>
                <p className="text-white/70 leading-relaxed">Up to $5,000 in emergency support prevents crises. Gap funding bridges benefit transitions. 50+ partners coordinate.</p>
              </div>
            </motion.div>

            {/* Career Pathways Pillar */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 h-full hover:bg-white/10 hover:border-white/20 transition-all duration-500">
                <div className="w-20 h-20 bg-gradient-to-br from-[var(--sage)] to-green-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-[-5deg] transition-all duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                </div>
                <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">225% FPL Goal</div>
                <h3 className="text-2xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>Career Pathways</h3>
                <p className="text-white/70 leading-relaxed">Focus on family-sustaining wages. Preferred employer network understands barriers. Education aligned to regional economy.</p>
              </div>
            </motion.div>
          </div>

          {/* Two-generation callout */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-16"
          >
            <div className="bg-gradient-to-r from-[var(--coral)]/20 via-[var(--amber)]/20 to-[var(--blue)]/20 rounded-3xl p-10 border border-white/10 flex flex-col md:flex-row items-center gap-8">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-br from-[var(--coral)] to-[var(--amber)] rounded-3xl flex items-center justify-center shadow-lg"
              >
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              </motion.div>
              <div>
                <h3 className="text-3xl font-semibold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  Two Generations at Once
                </h3>
                <p className="text-white/80 text-lg leading-relaxed">
                  You can't help children thrive while their parents are drowning. You can't help parents advance while their children's futures are uncertain. That's why we work with <em>entire families</em>, simultaneously.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Journey Section - Horizontal Timeline */}
      <section id="journey" className="py-24 md:py-32 overflow-hidden">
        <div className="container-landing">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 bg-[var(--blue)]/10 text-[var(--blue)] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              The Process
            </span>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[var(--navy)] mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              The Five-Stage Journey
            </h2>
            <p className="text-[var(--text-secondary)] text-xl max-w-2xl mx-auto">
              From crisis to independence—a proven pathway to lasting stability.
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[var(--blue-light)] via-[var(--blue)] to-[var(--navy)] rounded-full hidden md:block" />

            <div className="grid md:grid-cols-5 gap-6">
              {/* Stage 1: Crisis Stabilization */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="hidden md:flex absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[var(--blue)] rounded-full border-4 border-[var(--cream)] z-10 items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-6 shadow-lg border border-[var(--navy)]/5 h-full mt-6 md:mt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[var(--coral)]/10 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-[var(--coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-[var(--blue)] bg-[var(--blue)]/10 px-2 py-1 rounded-full">0-2 mo</span>
                  </div>
                  <h3 className="font-semibold text-[var(--navy)] text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>Crisis Stabilization</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Emergency funds for car repairs, utilities, medical expenses</p>
                </motion.div>
              </motion.div>

              {/* Stage 2: Assessment & Planning */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative"
              >
                <div className="hidden md:flex absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[var(--blue)] rounded-full border-4 border-[var(--cream)] z-10 items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-6 shadow-lg border border-[var(--navy)]/5 h-full mt-6 md:mt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[var(--amber)]/10 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-[var(--amber)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-[var(--blue)] bg-[var(--blue)]/10 px-2 py-1 rounded-full">2-3 mo</span>
                  </div>
                  <h3 className="font-semibold text-[var(--navy)] text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>Assessment & Planning</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Create personalized Prosperity Pathway with Navigators</p>
                </motion.div>
              </motion.div>

              {/* Stage 3: Skill Building */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <div className="hidden md:flex absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[var(--blue)] rounded-full border-4 border-[var(--cream)] z-10 items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-6 shadow-lg border border-[var(--navy)]/5 h-full mt-6 md:mt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[var(--blue)]/10 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-[var(--blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-[var(--blue)] bg-[var(--blue)]/10 px-2 py-1 rounded-full">3-12 mo</span>
                  </div>
                  <h3 className="font-semibold text-[var(--navy)] text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>Skill Building</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">GED, TCAT certification, college coursework, employer training</p>
                </motion.div>
              </motion.div>

              {/* Stage 4: Employment */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative"
              >
                <div className="hidden md:flex absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[var(--blue)] rounded-full border-4 border-[var(--cream)] z-10 items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-6 shadow-lg border border-[var(--navy)]/5 h-full mt-6 md:mt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[var(--sage)]/10 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-[var(--sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-[var(--blue)] bg-[var(--blue)]/10 px-2 py-1 rounded-full">6-18 mo</span>
                  </div>
                  <h3 className="font-semibold text-[var(--navy)] text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>Employment</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Job placement with continued Navigator support</p>
                </motion.div>
              </motion.div>

              {/* Stage 5: Independence */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative"
              >
                <div className="hidden md:flex absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[var(--blue)] rounded-full border-4 border-[var(--cream)] z-10 items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-6 shadow-lg border border-[var(--navy)]/5 h-full mt-6 md:mt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[var(--navy)]/10 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-[var(--navy)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-[var(--blue)] bg-[var(--blue)]/10 px-2 py-1 rounded-full">18+ mo</span>
                  </div>
                  <h3 className="font-semibold text-[var(--navy)] text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>Independence</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Reach 225% FPL and maintain stability for 6 months</p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Story - Dwinn Terry */}
      <section id="stories" className="py-24 md:py-32 bg-[var(--cream-dark)]">
        <div className="container-landing">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 bg-[var(--sage)]/20 text-[var(--sage)] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Real Stories
            </span>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[var(--navy)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Families Rising Together
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] overflow-hidden shadow-2xl max-w-5xl mx-auto"
          >
            <div className="grid md:grid-cols-2">
              {/* Photo side */}
              <div className="relative min-h-[400px] md:min-h-full">
                <Image
                  src="https://picsum.photos/seed/dwinn/800/1000"
                  alt="Dwinn Terry"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Transformation stats overlay */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="absolute bottom-6 left-6 right-6"
                >
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-center">
                        <div className="text-xs text-[var(--text-muted)] uppercase font-medium mb-1">Before</div>
                        <div className="text-3xl font-bold text-[var(--coral)]">$960</div>
                        <div className="text-xs text-[var(--text-muted)]">/month</div>
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-12 h-12 bg-[var(--sage)] rounded-full flex items-center justify-center"
                      >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </motion.div>
                      <div className="text-center">
                        <div className="text-xs text-[var(--text-muted)] uppercase font-medium mb-1">After</div>
                        <div className="text-3xl font-bold text-[var(--sage)]">$2,764</div>
                        <div className="text-xs text-[var(--text-muted)]">/month</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="inline-flex items-center gap-2 bg-[var(--amber)] text-white px-4 py-2 rounded-full font-bold">
                        <span className="text-xl">↑</span>
                        188% Income Increase
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Story side */}
              <div className="p-8 md:p-12">
                <span className="inline-block bg-[var(--sage)]/10 text-[var(--sage)] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                  Success Story
                </span>

                <h3 className="text-3xl font-semibold text-[var(--navy)] mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                  Dwinn Terry's Journey
                </h3>

                <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed mb-8">
                  <p>
                    Dwinn enrolled as a single mother with just <strong className="text-[var(--navy)]">$960/month</strong>. Through her dedication and Empower's support, she:
                  </p>
                  <ul className="space-y-2">
                    {[
                      "Completed 10 Individual Learning Pods at Tennessee Tech",
                      "Earned QuickBooks certifications",
                      "Drove 40+ miles each way for Circle Leader training",
                      "Attended Ready 2 Learn with her daughter across two counties"
                    ].map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-start gap-3"
                      >
                        <span className="w-5 h-5 bg-[var(--sage)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[var(--cream)] rounded-2xl p-6 border-l-4 border-[var(--sage)]">
                  <blockquote className="text-[var(--navy)] italic">
                    "She definitely understood the assignment. Dwinn increased her household income from 58% FPL to 157% FPL."
                  </blockquote>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--sage)] rounded-full flex items-center justify-center text-white font-bold text-sm">RS</div>
                    <div>
                      <div className="font-semibold text-[var(--navy)] text-sm">Rebecca Stowers</div>
                      <div className="text-xs text-[var(--text-muted)]">Family Navigator</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12 text-[var(--text-muted)]"
          >
            <span className="font-semibold text-[var(--navy)]">75+ families</span> have reached 225% FPL.
            Each story is unique, but the pattern is clear.
          </motion.p>
        </div>
      </section>

      {/* Final CTA */}
      <section id="partner" className="py-24 md:py-32 bg-[var(--navy)] relative overflow-hidden">
        {/* Animated background */}
        <motion.div
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, var(--blue) 0%, transparent 50%), radial-gradient(circle at 80% 50%, var(--amber) 0%, transparent 50%)",
            backgroundSize: "200% 200%"
          }}
        />

        <div className="container-landing relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-8 leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Join us in solving poverty.
              <br />
              <span className="text-[var(--amber)]">Permanently.</span>
            </h2>

            <p className="text-white/80 text-xl md:text-2xl mb-12 leading-relaxed max-w-2xl mx-auto">
              Whether you're a funder, government partner, or organization ready to replicate what works—let's connect.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
              <Magnetic>
                <motion.a
                  href="mailto:info@empoweruc.org"
                  className="group bg-white text-[var(--navy)] px-10 py-5 rounded-full text-lg font-bold inline-flex items-center justify-center gap-3 relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">Get in Touch</span>
                  <motion.svg
                    className="w-5 h-5 relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </motion.svg>
                  <div className="absolute inset-0 bg-[var(--amber)] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </motion.a>
              </Magnetic>
              <Magnetic>
                <motion.a
                  href="#"
                  className="border-2 border-white text-white px-10 py-5 rounded-full text-lg font-bold inline-flex items-center justify-center gap-3 hover:bg-white hover:text-[var(--navy)] transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Download Report
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </motion.a>
              </Magnetic>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-8 pt-12 border-t border-white/20">
              {[
                { value: "14", label: "Counties" },
                { value: "17", label: "Navigators" },
                { value: "50+", label: "Partners" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    {stat.value}
                  </div>
                  <div className="text-white/60 uppercase tracking-wider text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-[var(--cream-dark)] border-t border-[var(--navy)]/10">
        <div className="container-landing">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-[var(--navy)] rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-2xl" style={{ fontFamily: 'var(--font-display)' }}>E</span>
                </div>
                <div>
                  <span className="font-semibold text-[var(--navy)] block text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                    Empower Upper Cumberland
                  </span>
                  <span className="text-sm text-[var(--text-muted)]">Solving poverty. Permanently.</span>
                </div>
              </div>
              <p className="text-[var(--text-secondary)] max-w-md leading-relaxed">
                Creating solutions to systemic barriers that keep families in poverty, building pathways to lasting economic independence.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-[var(--navy)] mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {["Impact", "Solution", "Journey", "Stories"].map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase()}`} className="text-[var(--text-secondary)] hover:text-[var(--navy)] transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-[var(--navy)] mb-4">Contact</h4>
              <ul className="space-y-3 text-[var(--text-secondary)]">
                <li>Upper Cumberland Region</li>
                <li>Tennessee, USA</li>
                <li className="pt-2">
                  <a href="mailto:info@empoweruc.org" className="text-[var(--blue)] hover:text-[var(--navy)] font-medium">
                    info@empoweruc.org
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[var(--navy)]/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[var(--text-muted)]">
              © 2026 Empower Upper Cumberland. A TANF Opportunity Pilot Program.
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              Funded by <span className="font-semibold text-[var(--navy)]">Tennessee Department of Human Services</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
