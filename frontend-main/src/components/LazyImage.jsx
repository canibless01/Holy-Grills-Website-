/**
 * Holy Grill — LazyImage
 * ----------------------------------------------------------------------------
 * Native lazy-loading image wrapper. Every <img> in new components should use
 * this (or add loading="lazy" + width/height) — see BUILDER_RULES.md.
 * Prevents layout shift and defers offscreen image loading for Lighthouse.
 */
import React from 'react';

export default function LazyImage({ src, alt, className, width, height, ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
}