import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLocation } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export const SmoothScroll = ({ children }) => {
    const { pathname } = useLocation();

    // Sin smooth scroll en el panel admin ni en el login de clientes (regla de diseño)
    const native = pathname.startsWith('/admin') || pathname.startsWith('/account');

    useEffect(() => {
        if (native) window.scrollTo(0, 0);
    }, [pathname, native]);

    if (native) {
        return <>{children}</>;
    }

    return <LenisWrapper>{children}</LenisWrapper>;
};

const LenisWrapper = ({ children }) => {
    const lenisRef = useRef(null);
    const { pathname } = useLocation();

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.85,
            touchMultiplier: 1.5,
            infinite: false,
        });

        lenisRef.current = lenis;

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.destroy();
            gsap.ticker.remove(lenis.raf);
        };
    }, []);

    // Reset scroll on route change
    useEffect(() => {
        if (lenisRef.current) {
            lenisRef.current.scrollTo(0, { immediate: true });
        }
        window.scrollTo(0, 0);
    }, [pathname]);

    return <div className="smooth-scroll-wrapper">{children}</div>;
};
