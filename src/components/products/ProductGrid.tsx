import React, { useCallback, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { VirtualItem } from '@tanstack/react-virtual';
import { useInView } from 'react-intersection-observer';
import type { Product } from '../../types/product.types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading?: boolean;
}

const ProductGrid = ({ products, hasMore, onLoadMore, isLoading }: ProductGridProps) => {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(products.length / 3),
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 400, []), // Altura estimada de cada fila
    overscan: 5, // Número de filas a precargar
  });

  // Efecto para cargar más productos cuando el elemento de carga es visible
  React.useEffect(() => {
    if (inView && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoading, onLoadMore]);

  const virtualRows = rowVirtualizer.getVirtualItems();

  const paddingTop = useMemo(() => {
    return virtualRows.length > 0 ? virtualRows[0].start : 0;
  }, [virtualRows]);

  const paddingBottom = useMemo(() => {
    return virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : 0;
  }, [virtualRows, rowVirtualizer]);

  return (
    <div ref={parentRef} className="h-[calc(100vh-200px)] overflow-auto">
      <div
        style={{
          paddingTop: `${paddingTop}px`,
          paddingBottom: `${paddingBottom}px`,
        }}
      >
        {virtualRows.map((virtualRow: VirtualItem) => {
          const startIndex = virtualRow.index * 3;
          const rowProducts = products.slice(startIndex, startIndex + 3);

          return (
            <div
              key={virtualRow.index}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {rowProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          );
        })}

        {/* Elemento para detectar cuando cargar más productos */}
        <div
          ref={loadMoreRef}
          className="h-20 flex items-center justify-center"
        >
          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-charcoal">Cargando más productos...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductGrid); 