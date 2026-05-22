"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { IconType } from "react-icons";
import { FiLoader } from "react-icons/fi";

type PrimaryButtonProps = {
  isLoading?: boolean;
  icon?: IconType;
  href?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function PrimaryButton({
  className,
  isLoading,
  icon: Icon,
  children,
  disabled,
  href,
  ...props
}: PrimaryButtonProps) {
  const styles = cn(
    "inline-flex items-center justify-center bg-[#004d40] hover:bg-[#00342b] text-white text-sm font-semibold rounded-full px-6 py-2.5 transition-all duration-300 shadow-xs hover:shadow-md disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004d40]",
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
