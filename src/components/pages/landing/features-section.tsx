"use client";

import { motion, useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

/* ---------- Animated visuals (Framer Motion only, no GSAP) ---------- */

function ConfidentialVaultVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const bars = [
    { id: "cv0", height: 25, delay: 0 },
    { id: "cv1", height: 40, delay: 0.07 },
    { id: "cv2", height: 35, delay: 0.14 },
    { id: "cv3", height: 55, delay: 0.21 },
    { id: "cv4", height: 48, delay: 0.28 },
    { id: "cv5", height: 68, delay: 0.35 },
    { id: "cv6", height: 60, delay: 0.42 },
    { id: "cv7", height: 78, delay: 0.49 },
    { id: "cv8", height: 65, delay: 0.56 },
    { id: "cv9", height: 75, delay: 0.63 },
  ];

  return (
    <div
      ref={ref}
      className="relative flex h-full w-full flex-col overflow-hidden rounded-xl p-5"
      style={{ backgroundColor: "var(--color-surface-2)" }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ backgroundColor: "var(--color-surface-3)" }}
        >
          <span className="text-sm">🔒</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.span
            className="text-xl font-bold tabular-nums text-main"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            TEE Secured
          </motion.span>
        </div>
      </div>

      <div className="relative flex flex-1 items-end justify-between gap-1.5 px-1">
        {bars.map((bar) => (
          <motion.div
            key={bar.id}
            className="flex-1 origin-bottom rounded-t"
            style={{
              height: `${bar.height}%`,
              backgroundColor: "var(--color-brand)",
              opacity: 0.3,
            }}
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 0.5, delay: bar.delay, ease: "easeOut" }}
          />
        ))}
      </div>

      <div
        className="mt-3 h-px w-full"
        style={{ backgroundColor: "var(--color-line)" }}
      />
    </div>
  );
}

function ChainGPTVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div
      ref={ref}
      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl p-5"
      style={{ backgroundColor: "var(--color-surface-2)" }}
    >
      <div className="flex flex-col items-center gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute inset-0 animate-pulse rounded-full bg-brand/20 blur-xl" />
          <Image
            src="/Assets/Images/Logo-Brand/chaingpt.png"
            alt="ChainGPT"
            width={80}
            height={80}
            className="relative size-20 rounded-2xl object-contain shadow-2xl"
          />
        </motion.div>
        <div className="flex flex-col items-center gap-1 text-center">
          <motion.span
            className="text-lg font-semibold text-main"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            AI Agent Active
          </motion.span>
          <motion.span
            className="text-[10px] uppercase tracking-widest text-faint"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Routing Optimization
          </motion.span>
        </div>
      </div>
    </div>
  );
}

function OneClickVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div
      ref={ref}
      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl p-5"
      style={{ backgroundColor: "var(--color-surface-2)" }}
    >
      <motion.div
        className="pointer-events-none absolute left-4 top-4 select-none"
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
      >
        <Image
          src="/Assets/Images/Logo-DeFi/euler-finance-logo.svg"
          alt=""
          width={32}
          height={32}
          className="rounded-full"
        />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute right-4 top-4 select-none"
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
      >
        <Image
          src="/Assets/Images/Logo-DeFi/pendle-logo.jpg"
          alt=""
          width={28}
          height={28}
          className="rounded-full"
        />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute bottom-4 right-6 select-none"
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.5, delay: 1.0, ease: "easeOut" }}
      >
        <Image
          src="/Assets/Images/Logo-DeFi/neverland-money-logo.jpg"
          alt=""
          width={30}
          height={30}
          className="rounded-full"
        />
      </motion.div>

      <div className="flex items-center gap-3">
        <motion.div
          className="flex h-20 w-24 origin-left items-center justify-center rounded-2xl"
          style={{ backgroundColor: "var(--color-surface-3)" }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={
            inView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }
          }
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="text-[10px] font-medium text-faint">Deposit</span>
        </motion.div>

        <motion.div
          className="h-[2px] w-8 origin-left"
          style={{ backgroundColor: "var(--color-line-strong)" }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={
            inView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }
          }
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        />

        <motion.div
          className="flex h-20 w-24 origin-right items-center justify-center rounded-2xl"
          style={{ backgroundColor: "var(--color-surface-3)" }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={
            inView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }
          }
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <span className="text-[10px] font-medium text-faint">Vault</span>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- Feature data ---------- */

const features = [
  {
    emoji: "🔒",
    title: "Nox Protocol & TEE",
    description:
      "Powered by iExec Nox and Trusted Execution Environments (TEE). Your individual balances and strategies stay cryptographically hidden while aggregate TVL remains public.",
    visual: ConfidentialVaultVisual,
    tags: [
      {
        icon: "/Assets/Images/Logo-Coin/usdt-logo.svg",
        rate: "5–12%",
        name: "cUSDC",
      },
      {
        icon: "/Assets/Images/Logo-Coin/rlc-logo.svg",
        rate: "8–15%",
        name: "cRLC",
      },
    ],
  },
  {
    emoji: "🤖",
    title: "ChainGPT AI Routing",
    description:
      "Get real-time vault recommendations and risk analysis powered by ChainGPT. Our AI agent finds the most efficient yield routes across Arbitrum while preserving your privacy.",
    visual: ChainGPTVisual,
    logos: true,
  },
  {
    emoji: "🛡️",
    title: "Confidential Tokens",
    description:
      "ERC-7984 confidential tokens (cUSDC, cRLC) wrap your public assets into private ones. Enjoy the security of confidential transfers without sacrificing DeFi composability.",
    visual: OneClickVisual,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  }),
};

/* ---------- Section ---------- */

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative w-full py-24 md:py-32"
      style={{ backgroundColor: "var(--color-canvas)" }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <motion.h2
          className="mb-16 text-center text-4xl tracking-tight text-main md:text-5xl lg:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Why earn with zMAAI
        </motion.h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature, i) => {
            const Visual = feature.visual;
            return (
              <motion.div
                key={feature.title}
                className="flex flex-col gap-6 rounded-2xl border p-5"
                style={{
                  borderColor: "var(--color-line)",
                  backgroundColor: "var(--color-surface-1)",
                }}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
              >
                <div className="h-52">
                  <Visual />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{feature.emoji}</span>
                    <h3 className="text-lg font-semibold text-main">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted">
                    {feature.description}
                  </p>
                </div>

                {feature.tags ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {feature.tags.map((tag) => (
                      <div
                        key={tag.name}
                        className="flex items-center gap-2 rounded-full border px-3 py-1.5"
                        style={{
                          borderColor: "var(--color-line)",
                          backgroundColor: "var(--color-surface-2)",
                        }}
                      >
                        <Image
                          src={tag.icon}
                          alt=""
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                        <div className="flex flex-col leading-none">
                          <span className="text-xs font-semibold text-main">
                            {tag.rate}
                          </span>
                          <span className="text-[10px] text-faint">
                            {tag.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {feature.logos ? (
                  <div className="flex items-center -space-x-1.5">
                    {[
                      "/Assets/Images/Logo-DeFi/aave-logo.svg",
                      "/Assets/Images/Logo-DeFi/morpho-logo.webp",
                      "/Assets/Images/Logo-DeFi/euler-finance-logo.svg",
                      "/Assets/Images/Logo-DeFi/pendle-logo.jpg",
                      "/Assets/Images/Logo-DeFi/ethena-logo.jpg",
                      "/Assets/Images/Logo-DeFi/etherfi-logo.jpg",
                    ].map((src) => (
                      <Image
                        key={src}
                        src={src}
                        alt=""
                        width={28}
                        height={28}
                        className="rounded-full border-2"
                        style={{ borderColor: "var(--color-canvas)" }}
                      />
                    ))}
                  </div>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
