"use client";

import { useState } from "react";
import {
  BUSINESS_NAME,
  BUSINESS_TAGLINE,
  LOGO_ASPECT_RATIO,
  LOGO_PATH,
} from "@/lib/brand";
import { cn } from "@/lib/utils";

export type LogoSize = "sm" | "md" | "lg";
export type LogoVariant = "dark" | "light";

export type LogoProps = {
  size?: LogoSize;
  showText?: boolean;
  variant?: LogoVariant;
  className?: string;
};

const SIZE_CONFIG: Record<LogoSize, { height: number; title: string; sub: string }> = {
  sm: { height: 40, title: "text-lg", sub: "text-xs" },
  md: { height: 56, title: "text-xl", sub: "text-sm" },
  lg: { height: 96, title: "text-3xl", sub: "text-base" },
};

const BUSINESS_INITIAL = BUSINESS_NAME.charAt(0).toUpperCase();

function logoDimensions(height: number) {
  return {
    width: Math.round(height * LOGO_ASPECT_RATIO),
    height,
  };
}

function LogoFallback({ height, variant }: { height: number; variant: LogoVariant }) {
  const { width } = logoDimensions(height);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold",
        variant === "dark"
          ? "bg-brand-accent/30 text-white ring-2 ring-brand-accent/50"
          : "bg-brand-dark text-brand-accent ring-2 ring-brand-accent/30"
      )}
      style={{ width: Math.min(width, height), height: Math.min(width, height), fontSize: height * 0.42 }}
      aria-hidden
    >
      {BUSINESS_INITIAL}
    </div>
  );
}

function LogoMark({
  height,
  variant,
  onFail,
}: {
  height: number;
  variant: LogoVariant;
  onFail: () => void;
}) {
  const { width, height: h } = logoDimensions(height);

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl bg-white",
        variant === "dark" ? "ring-1 ring-white/25" : "shadow-sm ring-1 ring-slate-200/80"
      )}
      style={{ width, height: h }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_PATH}
        alt={`Logo ${BUSINESS_NAME}`}
        width={width}
        height={h}
        decoding="async"
        loading="eager"
        fetchPriority="high"
        className="block h-full w-full object-contain"
        onError={onFail}
      />
    </div>
  );
}

export function Logo({
  size = "md",
  showText = true,
  variant = "light",
  className,
}: LogoProps) {
  const config = SIZE_CONFIG[size];
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {failed ? (
        <LogoFallback height={config.height} variant={variant} />
      ) : (
        <LogoMark height={config.height} variant={variant} onFail={() => setFailed(true)} />
      )}
      {showText && (
        <div className="min-w-0">
          <p
            className={cn(
              config.title,
              "font-bold leading-tight tracking-tight",
              variant === "dark" ? "text-white" : "text-brand-purple"
            )}
          >
            {BUSINESS_NAME}
          </p>
          <p
            className={cn(
              config.sub,
              "leading-snug",
              variant === "dark" ? "text-purple-200" : "text-slate-500"
            )}
          >
            {BUSINESS_TAGLINE}
          </p>
        </div>
      )}
    </div>
  );
}
