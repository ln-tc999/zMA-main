"use client";

import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Twitter", href: "#" },
  { label: "Discord", href: "https://discord.gg/RXYHBJceMe" },
  { label: "GitHub", href: "#" },
];

const docLinks = [
  {
    label: "Docs",
    href: "https://docs.zama.ai/fhevm",
  },
  {
    label: "Zama FHE",
    href: "https://zama.ai",
  },
];

export function FooterSection() {
  return (
    <footer
      className="relative flex min-h-screen w-full flex-col overflow-hidden"
      style={{ backgroundColor: "var(--color-canvas)" }}
    >
      {/* CTA area */}
      <div className="mx-auto max-w-6xl px-6 pt-20 md:pt-28">
        <div className="grid grid-cols-1 items-start gap-16 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold tracking-tight text-main md:text-3xl">
              Start Earning Confidentially
            </h2>
            <div className="flex items-start gap-2">
              <p className="max-w-xs text-sm leading-relaxed text-muted">
                Join the growing community of DeFi users who keep their
                positions private with Zama FHE encryption on Ethereum.
              </p>
            </div>
            <div>
              <Link
                href="/earn"
                className="inline-flex items-center justify-center rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover-brand"
              >
                Launch App
              </Link>
            </div>
          </div>

          <h3 className="text-right text-3xl leading-snug tracking-tight text-main md:text-5xl lg:text-6xl">
            <span className="text-muted">Confidential</span> Yield{" "}
            <span className="text-muted">native to</span> Ethereum
            <Image
              src="/Assets/Images/Logo-Coin/eth-logo.svg"
              alt="Ethereum"
              width={100}
              height={100}
              className="pointer-events-none -mb-2 ml-1 inline-block select-none align-middle"
            />
          </h3>
        </div>

        {/* Link grid */}
        <div
          className="mt-20 border-t pt-10"
          style={{ borderColor: "var(--color-line)" }}
        >
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <Image
                src="/Assets/Images/Logo-Brand/logo-transparent.png"
                alt="zMAAI"
                width={48}
                height={48}
                className="size-12 select-none rounded-full"
              />
              <span className="text-sm font-bold uppercase tracking-widest text-main">
                zMAAI
              </span>
            </div>

            {/* Nav links */}
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    link.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="cursor-pointer text-xs uppercase tracking-[0.15em] text-muted transition-colors hover:text-main"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Doc links */}
            <div className="flex flex-col gap-3">
              {docLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-xs uppercase tracking-[0.15em] text-muted transition-colors hover:text-main"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Back to top */}
            <div className="flex items-start justify-end">
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex cursor-pointer items-center justify-center rounded-2xl border px-8 py-6 text-sm text-muted transition-colors hover:text-main"
                style={{ borderColor: "var(--color-line)" }}
              >
                Back to top
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Giant watermark */}
      <div className="pointer-events-none mt-10 flex select-none items-center justify-center gap-4 overflow-hidden">
        <Image
          src="/Assets/Images/Logo-Brand/logo-transparent.png"
          alt="zMAAI"
          width={200}
          height={200}
          className="select-none rounded-full opacity-5"
          style={{
            width: "clamp(100px, 12vw, 200px)",
            height: "auto",
          }}
        />
        <p
          className="whitespace-nowrap font-bold uppercase leading-none text-main"
          style={{
            fontSize: "clamp(120px, 15vw, 260px)",
            opacity: 0.05,
          }}
        >
          zMAAI
        </p>
      </div>

      {/* Copyright */}
      <div
        className="border-t px-6 py-6"
        style={{ borderColor: "var(--color-line)" }}
      >
        <p className="text-center text-xs text-faint">
          2026 zMAAI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
