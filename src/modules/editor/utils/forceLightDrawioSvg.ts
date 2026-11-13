const SVG_DATA_PREFIX = 'data:image/svg+xml;base64,';

export const forceLightDrawioSvg = (src: string): string => {
  if (!src.startsWith(SVG_DATA_PREFIX)) return src;

  try {
    const svg = atob(src.slice(SVG_DATA_PREFIX.length));
    const lightSvg = svg.replace(
      /color-scheme:\s*light\s+dark/g,
      'color-scheme: light',
    );
    return lightSvg === svg ? src : SVG_DATA_PREFIX + btoa(lightSvg);
  } catch {
    return src;
  }
};
