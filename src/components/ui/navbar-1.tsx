"use client";

import { AnimatePresence, motion } from "motion/react";
import { FiMenu, FiX } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { WalletButton } from "./wallet-button";

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Earn", href: "/earn" },
  { label: "Compare", href: "/compare" },
  { label: "Portfolio", href: "/portfolio" },
];

const Navbar1 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <div className="flex w-full justify-center px-4 py-6">
      <div className="relative z-10 flex w-full max-w-3xl items-center justify-between rounded-full border border-glass bg-glass px-6 py-3 backdrop-blur-2xl backdrop-saturate-150 before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-[linear-gradient(140deg,rgba(255,255,255,0.18),rgba(255,255,255,0.02)_55%,rgba(255,255,255,0.06))] before:content-['']">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <motion.div
              className="relative h-9 w-9"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileHover={{ rotate: 10 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src="/Assets/Images/Logo-Brand/logo.png"
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
          {NAV_LINKS.map((item) => {
            const isActive = pathname?.startsWith(item.href) ?? false;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link
                  href={item.href}
                  className={
                    isActive
                      ? "relative z-10 text-sm font-semibold text-main transition-colors cursor-pointer"
                      : "relative z-10 text-sm font-medium text-muted transition-colors hover:text-main cursor-pointer"
                  }
                >
                  {item.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <motion.div
          className="hidden items-center gap-2 md:flex"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <ThemeToggle />
          <motion.div whileHover={{ scale: 1.05 }}>
            <WalletButton variant="desktop" />
          </motion.div>
        </motion.div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <motion.button
            type="button"
            aria-label="Toggle menu"
            className="relative z-10 flex items-center cursor-pointer"
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
            className="fixed inset-0 z-50 bg-overlay px-6 pt-24 backdrop-blur-2xl md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              type="button"
              aria-label="Close menu"
              className="absolute right-6 top-6 p-2 cursor-pointer"
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
                  <Link
                    href={item.href}
                    className="text-base font-medium text-main cursor-pointer"
                    onClick={toggleMenu}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                className="pt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <WalletButton variant="mobile" />
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export { Navbar1 };
