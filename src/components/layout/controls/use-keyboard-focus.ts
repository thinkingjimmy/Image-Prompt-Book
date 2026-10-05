/**
 * [INPUT]: React state/effects and document keyboard/pointer events.
 * [OUTPUT]: useKeyboardFocus, distinguishing keyboard navigation from pointer focus and text entry.
 * [POS]: Shared focus modality for programmatically focused search and dropdown controls.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { useEffect, useState } from "react";

export function useKeyboardFocus() {
  const [keyboard, setKeyboard] = useState(false);

  useEffect(() => {
    let current = false;
    const update = (next: boolean) => {
      if (current === next) return;
      current = next;
      setKeyboard(next);
    };
    const onPointer = () => update(false);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const editable = event.target instanceof HTMLElement && Boolean(event.target.closest('input, textarea, [contenteditable="true"]'));
      if (event.key === "Tab" || !editable) update(true);
    };
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("pointermove", onPointer, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("pointermove", onPointer, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  return keyboard;
}
