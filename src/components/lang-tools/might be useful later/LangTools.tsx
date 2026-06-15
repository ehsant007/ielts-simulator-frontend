"use client";

import React, { useCallback, useRef, useState } from "react";
import { Box, Portal } from "@chakra-ui/react";

type SelectionMenuShellProps = {
  children: React.ReactNode;
  renderMenu: (selection: {
    text: string;
    from: number;
    to: number;
  }) => React.ReactNode;
};

type MenuState = {
  x: number;
  y: number;
  text: string;
  from: number;
  to: number;
} | null;

export function SelectionMenuShell({
  children,
  renderMenu,
}: SelectionMenuShellProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [menu, setMenu] = useState<MenuState>(null);

  const handleMouseUp = useCallback(() => {
    const root = rootRef.current;
    const selection = window.getSelection();

    if (!root || !selection || selection.isCollapsed || selection.rangeCount === 0) {
      setMenu(null);
      return;
    }

    const range = selection.getRangeAt(0);

    if (!root.contains(range.commonAncestorContainer)) {
      setMenu(null);
      return;
    }

    const preRange = document.createRange();
    preRange.selectNodeContents(root);
    preRange.setEnd(range.startContainer, range.startOffset);

    const from = preRange.toString().length;
    const text = range.toString();
    const to = from + text.length;

    if (!text.trim()) {
      setMenu(null);
      return;
    }

    const rect = range.getBoundingClientRect();

    setMenu({
      x: rect.left + rect.width / 2,
      y: rect.top,
      text,
      from,
      to,
    });
  }, []);

  const closeMenu = useCallback(() => {
    setMenu(null);
  }, []);

  return (
    <Box ref={rootRef} onMouseUp={handleMouseUp} position="relative">
      {children}

      {menu && (
        <Portal>
          <Box
            position="fixed"
            left={menu.x}
            top={menu.y}
            transform="translate(-50%, -100%)"
            zIndex={9999}
            onMouseDown={(e) => e.preventDefault()}
          >
            {renderMenu(menu)}
          </Box>
        </Portal>
      )}
    </Box>
  );
}