"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV_LINKS = [
  { label: "How It Works", href: "#features" },
  {
    label: "Docs",
    href: "https://docs.iex.ec/nox-protocol/getting-started/welcome",
    external: true,
  },
];

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <div className="flex w-full justify-center px-4 py-6">
      <div className="relative z-10 flex w-full max-w-3xl items-center justify-between rounded-full border border-glass bg-glass px-6 py-3 backdrop-blur-2xl backdrop-saturate-150 before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-[linear-gradient(140deg,rgba(255,255,255,0.18),rgba(255,255,255,0.02)_55%,rgba(255,255,255,0.06))] before:content-['']">
        <div className="flex items-center">
          <Link href="/" className="flex cursor-pointer items-center gap-2">
            <motion.div
              className="relative h-9 w-9"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileHover={{ rotate: 10 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src="/Assets/Images/Logo-Brand/logo-transparent.png"
                alt="zMAAI"
                fill
                priority
                sizes="36px"
                className="object-contain"
              />
            </motion.div>
            <span className="hidden text-base font-semibold tracking-tight text-main sm:inline">
              zMAAI
            </span>
          </Link>
        </div>

        <nav className="hidden items-center space-x-8 md:flex">
          {NAV_LINKS.map((item) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 cursor-pointer text-sm font-medium text-muted transition-colors hover:text-main"
                >
                  {item.label}
                </a>
              ) : (
                <a
                  href={item.href}
                  className="relative z-10 cursor-pointer text-sm font-medium text-muted transition-colors hover:text-main"
                >
                  {item.label}
                </a>
              )}
            </motion.div>
          ))}
        </nav>

        <motion.div
          className="hidden items-center gap-2 md:flex"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <ThemeToggle />
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link
              href="/earn"
              className="relative z-10 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover-brand"
            >
              Launch App
            </Link>
          </motion.div>
        </motion.div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <motion.button
            type="button"
            aria-label="Toggle menu"
            className="relative z-10 flex cursor-pointer items-center"
            onClick={toggleMenu}
            whileTap={{ scale: 0.9 }}
          >
            <FiMenu className="h-6 w-6 text-main" />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="bg-overlay fixed inset-0 z-50 px-6 pt-24 backdrop-blur-2xl md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              type="button"
              aria-label="Close menu"
              className="absolute right-6 top-6 cursor-pointer p-2"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <FiX className="h-6 w-6 text-main" />
            </motion.button>
            <div className="flex flex-col space-y-6">
              {NAV_LINKS.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer text-base font-medium text-main"
                      onClick={toggleMenu}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <a
                      href={item.href}
                      className="cursor-pointer text-base font-medium text-main"
                      onClick={toggleMenu}
                    >
                      {item.label}
                    </a>
                  )}
                </motion.div>
              ))}
              <motion.div
                className="pt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Link
                  href="/earn"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-base font-semibold text-white transition-colors hover-brand"
                  onClick={toggleMenu}
                >
                  Launch App
                </Link>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
