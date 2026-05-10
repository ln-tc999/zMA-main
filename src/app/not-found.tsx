import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "zMAAI | 404",
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 text-center">
      <Image
        src="/Assets/Images/Logo-Brand/logo.png"
        alt="zMAAI"
        width={160}
        height={160}
        className="h-40 w-40 object-contain opacity-70"
      />
      <div className="flex flex-col gap-3">
        <h1 className="text-8xl font-bold tracking-tight text-main">404</h1>
        <p className="text-base text-muted">
          This page doesn't exist or has been moved.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/earn"
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover-brand"
        >
          Go to Earn
        </Link>
        <Link
          href="/portfolio"
          className="rounded-full border border-main px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:text-main hover:border-strong"
        >
          Portfolio
        </Link>
      </div>
    </div>
  );
}
