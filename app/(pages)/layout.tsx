import { Header } from "@/components/layout/Header";

/** トップ以外のページの枠。ヘッダーは最初から通常の表示 */
export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
    </>
  );
}
