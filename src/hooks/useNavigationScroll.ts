import { useLayoutEffect, useState } from 'react';

/** Request scroll with destination state, then apply it after React commits.
 * Forward opens request 0; Journey Back requests the saved reading position.
 * Cleanup prevents an older navigation from moving a newer page.
 */
export function useNavigationScroll() {
  const [request, setRequest] = useState<{ top: number } | null>(null);

  useLayoutEffect(() => {
    if (!request) return;

    const apply = () => window.scrollTo({
      top: request.top,
      left: 0,
      behavior: 'instant',
    });

    apply();
    let secondFrame: number | undefined;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(apply);
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) window.cancelAnimationFrame(secondFrame);
    };
  }, [request]);

  return (top: number) => setRequest({ top });
}
