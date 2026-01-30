export function useIntersectionObserver(callback: () => void) {
  const options = {
    rootMargin: '0px',
    threshold: 1.0,
  };
  const cb = (entries: IntersectionObserverEntry[]) => {
    entries.forEach(({ isIntersecting }) => {
      if (isIntersecting) {
        callback();
      }
    });
  };

  const observer = new IntersectionObserver(cb, options);

  return {
    observer,
  };
}
