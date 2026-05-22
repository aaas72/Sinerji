import Link from "next/link";

interface BreadcrumbProps {
  items: { label: string; href?: string; active?: boolean }[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="text-[13px] font-sans mb-4" aria-label="breadcrumb">
      <ol className="flex items-center flex-wrap gap-1.5 text-gray-500">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <div key={`${item.label}-${idx}`} className="flex items-center gap-1.5">
              {item.href && !item.active ? (
                <li>
                  <Link
                    href={item.href}
                    className="text-[#2b6cb0] hover:text-[#1a365d] hover:underline font-medium transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ) : (
                <li className="text-[#00342b] font-bold">
                  {item.label}
                </li>
              )}
              {!isLast && (
                <li className="text-gray-400 font-normal select-none px-0.5" aria-hidden="true">
                  ›
                </li>
              )}
            </div>
          );
        })}
      </ol>
    </nav>
  );
}
