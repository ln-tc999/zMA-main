"use client";

import { motion, useInView } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";

function YieldBar({
  height,
  delay,
  inView,
}: {
  height: number;
  delay: number;
  inView: boolean;
}) {
  return (
    <motion.div
      className="flex-1 origin-bottom rounded-t"
      style={{
        height: `${height}%`,
        backgroundColor: "var(--color-brand)",
        opacity: 0.25,
      }}
      initial={{ scaleY: 0 }}
      animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    />
  );
}

function AnimatedCounter({
  target,
  suffix,
  inView,
}: {
  target: number;
  suffix: string;
  inView: boolean;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const duration = 1400;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  return (
    <span className="text-2xl font-bold tabular-nums text-main">
      {value}
      {suffix}
    </span>
  );
}

function YieldChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const bars = [
    { id: "b0", height: 30, delay: 0 },
    { id: "b1", height: 45, delay: 0.07 },
    { id: "b2", height: 38, delay: 0.14 },
    { id: "b3", height: 58, delay: 0.21 },
    { id: "b4", height: 50, delay: 0.28 },
    { id: "b5", height: 72, delay: 0.35 },
    { id: "b6", height: 65, delay: 0.42 },
    { id: "b7", height: 85, delay: 0.49 },
    { id: "b8", height: 70, delay: 0.56 },
    { id: "b9", height: 80, delay: 0.63 },
  ];

  return (
    <div
      ref={ref}
      className="relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-main p-5"
      style={{ backgroundColor: "var(--color-surface-1)" }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ backgroundColor: "var(--color-surface-2)" }}
        >
          <span className="text-sm">🔒</span>
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            className="pointer-events-none select-none"
            initial={{ x: 60, opacity: 0, scale: 0.6 }}
            animate={
              inView
                ? { x: 0, opacity: 1, scale: 1 }
                : { x: 60, opacity: 0, scale: 0.6 }
            }
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <Image
              src="/Assets/Images/Logo-DeFi/morpho-logo.webp"
              alt=""
              width={36}
              height={36}
              className="rounded-full"
            />
          </motion.div>
          <AnimatedCounter target={12} suffix="%" inView={inView} />
          <span className="text-xs text-faint">APY</span>
        </div>
      </div>

      <motion.div
        className="pointer-events-none absolute right-5 top-14 select-none"
        initial={{ y: -40, opacity: 0, scale: 0.5 }}
        animate={
          inView
            ? { y: 0, opacity: 1, scale: 1 }
            : { y: -40, opacity: 0, scale: 0.5 }
        }
        transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
      >
        <Image
          src="/Assets/Images/Logo-DeFi/aave-logo.svg"
          alt=""
          width={28}
          height={28}
          className="rounded-full"
        />
      </motion.div>

      <div className="relative flex flex-1 items-end justify-between gap-1.5 px-1">
        {bars.map((bar) => (
          <YieldBar
            key={bar.id}
            height={bar.height}
            delay={bar.delay}
            inView={inView}
          />
        ))}
        <motion.div
          className="pointer-events-none absolute bottom-2 right-6 select-none"
          initial={{ x: -40, y: 30, opacity: 0, scale: 0.5 }}
          animate={
            inView
              ? { x: 0, y: 0, opacity: 1, scale: 1 }
              : { x: -40, y: 30, opacity: 0, scale: 0.5 }
          }
          transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
        >
          <Image
            src="/Assets/Images/Logo-DeFi/euler-finance-logo.svg"
            alt=""
            width={44}
            height={44}
            className="rounded-full"
          />
        </motion.div>
      </div>

      <div
        className="mt-3 h-px w-full"
        style={{ backgroundColor: "var(--color-line)" }}
      />
    </div>
  );
}

function YieldCard({
  logo,
  alt,
  rate,
  token,
  label,
}: {
  logo: string;
  alt: string;
  rate: string;
  token: string;
  label: string;
}) {
  return (
    <div
      className="flex items-center justify-between gap-6 rounded-2xl border px-6 py-5 backdrop-blur-sm"
      style={{
        borderColor: "var(--color-line)",
        backgroundColor: "var(--color-surface-1)",
      }}
    >
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-faint">{label}</span>
        <div className="flex items-center gap-3">
          <Image
            src={logo}
            alt={alt}
            width={32}
            height={32}
            className="pointer-events-none select-none rounded-full"
          />
          <span className="text-2xl font-semibold tracking-tight text-main">
            {rate}
          </span>
        </div>
      </div>
      <span className="text-sm font-medium text-faint">({token})</span>
    </div>
  );
}

export function HeroSection() {
  return (
    <section
      className="relative w-full overflow-hidden py-32 md:py-40"
      style={{ backgroundColor: "var(--color-canvas)" }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
          {/* Left column — headline */}
          <div className="flex flex-col gap-8">
            <motion.h1
              className="text-4xl leading-tight tracking-tight text-main md:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-muted">Confidential</span> Yield
              <br />
              Farming.
              <br />
              <span className="text-muted">Powered by</span> Zama
              <br />
              FHE.
            </motion.h1>

            <motion.div
              className="flex items-start gap-3 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <FiPlus className="mt-0.5 size-4 shrink-0 text-faint" />
              <p className="max-w-sm text-sm leading-relaxed text-muted">
                Confidential yield farming powered by Zama FHE. Your deposit
                amounts stay encrypted on-chain via Fully Homomorphic Encryption
                while vault TVL remains publicly verifiable.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                href="/earn"
                className="inline-flex items-center justify-center rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover-brand"
              >
                Launch App
              </Link>
            </motion.div>
          </div>

          {/* Right column — yield visual */}
          <motion.div
            className="relative flex flex-col gap-6"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative h-[400px] w-full max-w-[500px] overflow-hidden rounded-2xl">
              <YieldChart />
            </div>

            <div className="flex flex-col gap-3">
              <YieldCard
                logo="/Assets/Images/Logo-Coin/usdt-logo.svg"
                alt="cUSDC"
                rate="Up to 12%"
                token="cUSDC Vault"
                label="Confidential Yield"
              />
              <YieldCard
                logo="/Assets/Images/Logo-Coin/rlc-logo.svg"
                alt="cRLC"
                rate="Up to 15%"
                token="cRLC Vault"
                label="Confidential Yield"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
