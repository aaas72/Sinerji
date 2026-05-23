"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { IconType } from "react-icons";
import { FiLoader } from "react-icons/fi";

type PrimaryButtonProps = {
  variant?: "primary" | "secondary" | "special" | "default" | "outline" | "ghost";
  isLoading?: boolean;
  icon?: IconType;
  href?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function PrimaryButton({
  variant = "primary",
  className,
  isLoading,
  icon: Icon,
  children,
  disabled,
  href,
  ...props
}: PrimaryButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-full text-sm font-semibold px-6 py-2.5 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants: Record<Required<PrimaryButtonProps>["variant"], string> = {
    primary:
      "bg-[#004d40] hover:bg-[#00342b] text-white shadow-xs hover:shadow-md focus:ring-[#004d40]",
    secondary:
      "bg-secondary text-white hover:opacity-90 focus:ring-[var(--color-secondary)]",
    special:
      "bg-special text-black hover:opacity-90 focus:ring-[var(--color-special)]",
    default:
      "bg-section text-primary hover:opacity-90 focus:ring-[var(--color-primary)]",
    outline:
      "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 focus:ring-gray-500",
    ghost:
      "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500",
  };

  const styles = cn(
    baseStyles,
    variants[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={styles}>
        {Icon ? <Icon className="mr-2 h-4 w-4 text-current" /> : null}
        {children}
      </Link>
    );
  }

  return (
    <button
      className={styles}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <FiLoader className="mr-2 h-4 w-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="mr-2 h-4 w-4 text-current" />
      ) : null}
      {children}
    </button>
  );
}
