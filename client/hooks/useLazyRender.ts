import { useState, useEffect, useCallback, useRef } from "react";

export function useLazyRender<T>(items: T[], batchSize = 10) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const prevItemsRef = useRef<T[]>([]);

  // Determine if elements inside the array have actually changed (shallow comparison)
  const itemsChanged =
    items.length !== prevItemsRef.current.length ||
    items.some((item, index) => item !== prevItemsRef.current[index]);

  if (itemsChanged) {
    prevItemsRef.current = items;
  }

  useEffect(() => {
    if (itemsChanged) {
      setVisibleCount(batchSize);
    }
  }, [itemsChanged, batchSize]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + batchSize, items.length));
  }, [items.length, batchSize]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return {
    visibleItems,
    hasMore,
    loadMore,
  };
}
