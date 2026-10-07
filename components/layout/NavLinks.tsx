"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** PC のナビ。いまいるページに aria-current を付ける */
export function NavLinks({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-x-7 xl:gap-x-9">
      {items.map((item) => {
        const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link href={item.href} className="nav-link" aria-current={current ? "page" : undefined}>
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
