export const premiumEase = [0.18, 0.96, 0.24, 1] as const;
export const measuredEase = [0.2, 0.84, 0.28, 1] as const;
export const floatingEase = [0.27, 0.88, 0.38, 1] as const;
export const gentleEase = [0.22, 0.88, 0.3, 0.98] as const;

export const sectionRevealTransition = {
  duration: 0.82,
  ease: premiumEase,
} as const;

export const heroRevealTransition = {
  duration: 0.88,
  ease: premiumEase,
} as const;

export const cardRevealTransition = {
  duration: 0.6,
  ease: measuredEase,
} as const;

export const microRevealTransition = {
  duration: 0.44,
  ease: measuredEase,
} as const;

export const contentSwapTransition = {
  duration: 0.54,
  ease: premiumEase,
} as const;

export const cardStateTransition = {
  duration: 0.34,
  ease: measuredEase,
} as const;

export const subtleHoverLift = {
  y: -5,
  scale: 1.01,
} as const;

export const subtleTapPress = {
  y: -1.5,
  scale: 0.991,
} as const;

export const scrollDepthSpring = {
  stiffness: 120,
  damping: 24,
  mass: 0.78,
} as const;

export const routeEnterTransition = {
  duration: 0.56,
  ease: gentleEase,
} as const;

export const routeExitTransition = {
  duration: 0.36,
  ease: measuredEase,
} as const;

export const routeVeilTransition = {
  duration: 0.64,
  ease: premiumEase,
  times: [0, 0.45, 1] as number[],
};

export const progressionWheelThreshold = 66;
export const progressionTouchThreshold = 40;
export const progressionIdleResetMs = 170;
export const progressionLockMs = 520;
