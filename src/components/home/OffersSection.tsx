"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  HStack,
  Spinner,
  Text,
  VisuallyHidden,
} from "@chakra-ui/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import OfferCard from "@/components/offer/OfferCard";
import { readOffers, type OfferPublic } from "@/client";

type OffersRowProps = {
  pageSize?: number;
  prefetchPages?: number;
};

export default function OffersSection({
  pageSize = 8,
  prefetchPages = 2,
}: OffersRowProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // drag state
  const isPointerDown = useRef(false);
  const activePointerId = useRef<number | null>(null);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  // samples for velocity calculation
  const samplesRef = useRef<Array<{ x: number; t: number }>>([]);

  // momentum animation
  const momentumRaf = useRef<number | null>(null);
  const velocityRef = useRef(0); // px per ms

  const [isBuffering, setIsBuffering] = useState(false);
  const [contentFits, setContentFits] = useState(true);

  // --- react-query infinite setup ---
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["offers-horizontal"],
    queryFn: async ({ pageParam = 0 }) => {
			const res = await readOffers({
				query: {
					skip: pageParam,
					limit: pageSize,
				}
			});
			return res.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.data.length, 0);
      return loaded < lastPage.count ? loaded : undefined;
    },
    initialPageParam: 0,
  });

  const offers = data?.pages.flatMap((p) => p.data) ?? [];

  // Prefetch buffer
  const prefetchBuffer = useCallback(
    async (targetPages: number) => {
      if (!fetchNextPage || !hasNextPage) return;
      const currentPages = data?.pages.length ?? 0;
      const toFetch = Math.max(0, targetPages - currentPages);
      if (toFetch <= 0) return;

      setIsBuffering(true);
      try {
        for (let i = 0; i < toFetch; i++) {
          if (!hasNextPage) break;
          await fetchNextPage();
        }
      } finally {
        setIsBuffering(false);
      }
    },
    [data?.pages.length, fetchNextPage, hasNextPage]
  );

  useEffect(() => {
    if (!data) return;
    void prefetchBuffer(prefetchPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, prefetchPages]);

  // IntersectionObserver sentinel to load more
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = containerRef.current;
    if (!sentinel || !root || !fetchNextPage) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasNextPage) {
            void fetchNextPage();
          }
        });
      },
      {
        root,
        rootMargin: "300px",
        threshold: 0.1,
      }
    );

    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [fetchNextPage, hasNextPage]);

  // recalc center-fitting
  const recalcContentFits = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const fits = el.scrollWidth <= el.clientWidth + 1;
    setContentFits(fits);
    el.style.justifyContent = fits ? "center" : "flex-start";
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // initial calc after render
    const t = setTimeout(recalcContentFits, 0);
    const ro = new ResizeObserver(() => recalcContentFits());
    ro.observe(el);
    const onWin = () => recalcContentFits();
    window.addEventListener("resize", onWin);
    return () => {
      clearTimeout(t);
      ro.disconnect();
      window.removeEventListener("resize", onWin);
    };
  }, [recalcContentFits, offers.length]);

  // momentum helpers
  const stopMomentum = useCallback(() => {
    if (momentumRaf.current != null) {
      cancelAnimationFrame(momentumRaf.current);
      momentumRaf.current = null;
    }
    velocityRef.current = 0;
  }, []);

  const startMomentum = useCallback(
    (initialV: number) => {
      stopMomentum();
      velocityRef.current = initialV;
      let lastTs: number | null = null;
      const decay = 0.0035; // decay per ms
      const minVelocity = 0.02; // px/ms threshold

      const step = (ts: number) => {
        if (lastTs == null) lastTs = ts;
        const dt = ts - lastTs;
        lastTs = ts;

        // exponential decay
        velocityRef.current = velocityRef.current * Math.exp(-decay * dt);
        const v = velocityRef.current;

        const el = containerRef.current;
        if (el && Math.abs(v) > 0) {
          el.scrollLeft = el.scrollLeft + v * dt; // v is px/ms (signed)
          // prefetch near end
          const nearRight =
            el.scrollWidth - (el.scrollLeft + el.clientWidth) < el.clientWidth * 1.2;
          if (nearRight && hasNextPage) {
            void fetchNextPage();
          }
        }

        if (Math.abs(v) > minVelocity) {
          momentumRaf.current = requestAnimationFrame(step);
        } else {
          stopMomentum();
          recalcContentFits();
        }
      };

      momentumRaf.current = requestAnimationFrame(step);
    },
    [fetchNextPage, hasNextPage, recalcContentFits, stopMomentum]
  );

  // pointer handlers on container — use pointer capture on container and attach move/up there
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // prevent native image drag
    const onDragStart = (ev: DragEvent) => ev.preventDefault();
    el.addEventListener("dragstart", onDragStart);

    const onPointerDown = (ev: PointerEvent) => {
      // only primary mouse button for mouse pointers
      if (ev.pointerType === "mouse" && ev.button !== 0) return;

      // stop any ongoing momentum
      stopMomentum();

      // For mouse, prevent default to avoid text selection; *don't* for touch (to keep native scroll)
      if (ev.pointerType === "mouse") {
        ev.preventDefault();
      }

      try {
        el.setPointerCapture?.(ev.pointerId);
      } catch {
        // ignore if fails
      }

      isPointerDown.current = true;
      activePointerId.current = ev.pointerId;
      startX.current = ev.clientX;
      startScrollLeft.current = el.scrollLeft;

      // reset samples (use performance.now for timestamps)
      samplesRef.current = [{ x: ev.clientX, t: performance.now() }];

      // visual cues / prevent text selection
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
      (el.style as CSSStyleDeclaration).scrollBehavior = "auto";
    };

    const onPointerMove = (ev: PointerEvent) => {
      if (!isPointerDown.current || activePointerId.current !== ev.pointerId) return;
      // don't call preventDefault for touch; rely on touch-action + userSelect disabling
      ev.preventDefault?.(); // safe; browsers ignore if not allowed
      const elLocal = containerRef.current;
      if (!elLocal) return;

      const delta = ev.clientX - startX.current;
      elLocal.scrollLeft = startScrollLeft.current - delta;

      // sample for velocity (keep recent few)
      const now = performance.now();
      const s = samplesRef.current;
      s.push({ x: ev.clientX, t: now });
      if (s.length > 8) s.shift();
      samplesRef.current = s;

      // prefetch near right edge
      const nearRight =
        elLocal.scrollWidth - (elLocal.scrollLeft + elLocal.clientWidth) <
        elLocal.clientWidth * 1.2;
      if (nearRight && hasNextPage) {
        void fetchNextPage();
      }
    };

    const onPointerUp = (ev: PointerEvent) => {
      if (!isPointerDown.current || activePointerId.current !== ev.pointerId) return;
      isPointerDown.current = false;
      activePointerId.current = null;

      try {
        el.releasePointerCapture?.(ev.pointerId);
      } catch {
        // ignore
      }

      // compute pointer velocity (px per ms)
      const s = samplesRef.current;
      let pointerV = 0;
      if (s.length >= 2) {
        const first = s[0];
        const last = s[s.length - 1];
        const dt = last.t - first.t || 1;
        pointerV = (last.x - first.x) / dt; // px / ms (positive when pointer moved right)
      }

      samplesRef.current = [];

      // restore styles
      el.style.cursor = "";
      el.style.userSelect = "";
      (el.style as CSSStyleDeclaration).scrollBehavior = "smooth";

      // convert pointer velocity to scroll velocity:
      // during drag we set scrollLeft = startScrollLeft - delta, so pointer moving right (positive pointerV)
      // results in scrollLeft decreasing. To continue that motion, scroll velocity should be -pointerV.
      const initialScrollV = -pointerV;

      // threshold
      if (Math.abs(initialScrollV) > 0.05) {
        startMomentum(initialScrollV);
      } else {
        recalcContentFits();
      }
    };

    // attach listeners
    el.addEventListener("pointerdown", onPointerDown, { passive: false });
    el.addEventListener("pointermove", onPointerMove, { passive: false });
    el.addEventListener("pointerup", onPointerUp, { passive: false });
    el.addEventListener("pointercancel", onPointerUp, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("dragstart", onDragStart);
      stopMomentum();
    };
  }, [fetchNextPage, hasNextPage, recalcContentFits, startMomentum, stopMomentum]);

  // keyboard support
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    const el = containerRef.current;
    if (!el) return;
    if (e.key === "ArrowRight") {
      stopMomentum();
      el.scrollBy({ left: el.clientWidth * 0.6, behavior: "smooth" });
    } else if (e.key === "ArrowLeft") {
      stopMomentum();
      el.scrollBy({ left: -el.clientWidth * 0.6, behavior: "smooth" });
    }
  };

  // UI states
  if (isLoading) {
    return (
      <HStack justify="center" align="center" minH="200px">
        <Spinner size="lg" />
      </HStack>
    );
  }

  if (isError) {
    return (
      <Box color="red.500">
        <Text>Error loading offers: {(error as Error).message}</Text>
      </Box>
    );
  }

  return (
    <Box position="relative" py="8" mt="0" bg={{base: "yellow.subtle", _dark: "yellow.800"}}>
      {/* nav buttons */}
      <Box position="absolute" left={2} top="50%" transform="translateY(-50%)" zIndex={2}>
        <Button
          aria-label="Scroll left"
          size="sm"
          variant="ghost"
          onClick={() => {
            stopMomentum();
            containerRef.current?.scrollBy({ left: -300, behavior: "smooth" });
          }}
        >
          <FaChevronLeft />
        </Button>
      </Box>

      <Box position="absolute" right={2} top="50%" transform="translateY(-50%)" zIndex={2}>
        <Button
          aria-label="Scroll right"
          size="sm"
          variant="ghost"
          onClick={() => {
            stopMomentum();
            containerRef.current?.scrollBy({ left: 300, behavior: "smooth" });
          }}
        >
          <FaChevronRight />
        </Button>
      </Box>

      {/* scroll container */}
      <Box
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="list"
        aria-label="Offers carousel"
        display="flex"
        gap={6}
        overflowX="auto"
        overflowY="hidden"
        py={4}
        px={6}
        style={{
          touchAction: "pan-y", // preserves vertical scrolling while letting us handle horizontal gestures
          scrollBehavior: "smooth",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
          justifyContent: contentFits ? "center" : "flex-start",
        }}
      >
        {offers.length === 0 ? (
          <Box minH="160px" display="flex" alignItems="center" justifyContent="center">
            <Text>No offers found</Text>
          </Box>
        ) : (
          offers.map((offer: OfferPublic) => (
            <Box key={offer.id} role="listitem" flex="0 0 auto">
              <OfferCard offer={offer} />
            </Box>
          ))
        )}

        {/* sentinel */}
        <Box ref={sentinelRef} minW="1px" aria-hidden />
      </Box>

      {/* buffering */}
      <Box mt={2} display="flex" justifyContent="center" alignItems="center" gap={3}>
        {(isFetchingNextPage || isBuffering) && (
          <>
            <Spinner size="sm" />
            <Text fontSize="sm" color="gray.500">
              Loading more offers…
            </Text>
          </>
        )}
        {!hasNextPage && offers.length > 0 && (
          <Text fontSize="sm" color="gray.500">
            {/* You’ve reached the end. */}
          </Text>
        )}
      </Box>

      <VisuallyHidden>
        {offers.length} offers loaded. Use arrow keys or drag to scroll horizontally.
      </VisuallyHidden>
    </Box>
  );
}
