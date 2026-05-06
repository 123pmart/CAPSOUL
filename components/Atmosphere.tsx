"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

export function Atmosphere() {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 34, damping: 28, mass: 1.1 });
  const springY = useSpring(pointerY, { stiffness: 34, damping: 28, mass: 1.1 });
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.16]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 24]);
  const smoothScale = useSpring(scale, { stiffness: 50, damping: 30 });
  const smoothRotate = useSpring(rotate, { stiffness: 45, damping: 32 });

  useEffect(() => {
    if (reduceMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    let frame = 0;

    const handlePointerMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = event.clientX / Math.max(1, window.innerWidth) - 0.5;
        const y = event.clientY / Math.max(1, window.innerHeight) - 0.5;

        pointerX.set(x * 56);
        pointerY.set(y * 42);
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [pointerX, pointerY, reduceMotion]);

  return (
    <div className="ambient-background" aria-hidden="true">
      <motion.svg
        className="atmosphere-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={reduceMotion ? undefined : {
          x: springX,
          y: springY,
          scale: smoothScale,
          rotate: smoothRotate,
        }}
      >
        <defs>
          <filter id="atmosphere-blur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="13" />
          </filter>
        </defs>
        <motion.ellipse
          className="atmosphere-blob atmosphere-blob-one"
          cx="22"
          cy="30"
          rx="46"
          ry="34"
          filter="url(#atmosphere-blur)"
          animate={reduceMotion ? undefined : {
            opacity: [0.28, 0.52, 0.34],
            cx: [22, 26, 21],
            cy: [30, 26, 32],
          }}
          transition={{ duration: 22, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
        <motion.ellipse
          className="atmosphere-blob atmosphere-blob-two"
          cx="78"
          cy="72"
          rx="44"
          ry="32"
          filter="url(#atmosphere-blur)"
          animate={reduceMotion ? undefined : {
            opacity: [0.2, 0.44, 0.28],
            cx: [78, 73, 80],
            cy: [72, 76, 69],
          }}
          transition={{ duration: 28, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
        <motion.ellipse
          className="atmosphere-blob atmosphere-blob-three"
          cx="52"
          cy="48"
          rx="30"
          ry="24"
          filter="url(#atmosphere-blur)"
          animate={reduceMotion ? undefined : {
            opacity: [0.16, 0.34, 0.22],
            cx: [52, 57, 49],
            cy: [48, 43, 52],
          }}
          transition={{ duration: 34, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  );
}
