export const ENABLE_CINEMATIC_MOTION = true;

export const MOTION_BREAKPOINTS = {
  mobile: 768,
  desktop: 1280,
} as const;

export const MOTION_INTENSITY = {
  mobile: 0.35,
  tablet: 0.65,
  desktop: 1,
  reduced: 0,
} as const;

export const premiumEase = [0.22, 1, 0.36, 1] as const;
export const softEase = [0.16, 1, 0.3, 1] as const;

export const motionDurations = {
  micro: 0.24,
  small: 0.52,
  card: 0.68,
  section: 0.86,
  hero: 0.78,
  text: 0.62,
} as const;

export type MotionDevice = "mobile" | "tablet" | "desktop";

export function getMotionDevice(width: number) {
  if (width > 0 && width < MOTION_BREAKPOINTS.mobile) {
    return "mobile";
  }

  if (width > 0 && width < MOTION_BREAKPOINTS.desktop) {
    return "tablet";
  }

  return "desktop";
}

export function getMotionIntensity(device: MotionDevice, reducedMotion: boolean) {
  if (reducedMotion) {
    return MOTION_INTENSITY.reduced;
  }

  return MOTION_INTENSITY[device];
}

export function scaleMotionValue(value: number, intensity: number) {
  return value * intensity;
}

export function scaleMotionDuration(duration: number, intensity: number) {
  if (intensity <= MOTION_INTENSITY.mobile) {
    return duration * 0.8;
  }

  if (intensity <= MOTION_INTENSITY.tablet) {
    return duration * 0.9;
  }

  return duration;
}
