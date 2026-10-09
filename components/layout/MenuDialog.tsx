"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * スマートフォン用の全画面メニュー。
 * <dialog> の showModal() を使うので、フォーカスの閉じ込め・Esc で閉じる・背面の操作不可はブラウザが受け持つ。
 * 中身（リンクの一覧）はサーバー側で描いたものを children で受け取る。
 */
export function MenuDialog({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  // ページを移ったら閉じる
  useEffect(() => {
    if (ref.current?.open) ref.current.close();
  }, [pathname]);

  // 開いたまま画面が広がって、ヘッダーにメニューが並ぶ幅になったら閉じる（タブレットを横に向けたときなど）
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const close = () => {
      if (wide.matches && ref.current?.open) ref.current.close();
    };
    wide.addEventListener("change", close);
    return () => wide.removeEventListener("change", close);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-controls="site-menu"
        onClick={() => {
          const dialog = ref.current;
          if (!dialog) return;
          // <dialog> に対応していない古いブラウザでは、同じリンクが並ぶフッターへ送る
          if (typeof dialog.showModal === "function") dialog.showModal();
          else document.querySelector("footer")?.scrollIntoView();
        }}
        className="-mr-3 flex size-12 items-center justify-center lg:hidden"
      >
        <span className="sr-only">メニューを開く</span>
        <span aria-hidden="true" className="flex w-7 flex-col gap-[7px]">
          <span className="block h-px w-full bg-paper" />
          <span className="block h-px w-full bg-paper" />
        </span>
      </button>

      <dialog
        ref={ref}
        id="site-menu"
        aria-label="メニュー"
        className="menu-dialog m-0"
        onClick={(e) => {
          // 同じページへのリンクを押したときも閉じる
          if ((e.target as HTMLElement).closest("a")) ref.current?.close();
        }}
      >
        <div className="wrap flex h-16 items-center justify-end">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="-mr-3 flex h-12 items-center px-3 text-[0.8125rem] tracking-[0.2em] text-paper"
          >
            閉じる
          </button>
        </div>
        {children}
      </dialog>
    </>
  );
}
