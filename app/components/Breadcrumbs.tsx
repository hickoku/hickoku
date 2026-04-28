"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-[13px] text-gray-500 mb-0 py-2">
      <ol className="flex items-center space-x-2 flex-wrap">
        <li>
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2 max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg">
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {item.href ? (
              <Link href={item.href} className="hover:text-gray-900 transition-colors truncate">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium truncate" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
