export const spring = {
  gentle: { type: 'spring' as const, stiffness: 120, damping: 20 },
  snappy: { type: 'spring' as const, stiffness: 300, damping: 28 },
  bouncy: { type: 'spring' as const, stiffness: 400, damping: 25 },
}

export const easing = {
  smooth: [0.22, 1, 0.36, 1] as [number,number,number,number],
  out:    [0, 0, 0.2, 1]     as [number,number,number,number],
  in:     [0.4, 0, 1, 1]     as [number,number,number,number],
}

export const pageVariants = {
  initial: { opacity: 0, y: 16, filter: 'blur(4px)' },
  animate: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.5, ease: easing.smooth },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easing.smooth } },
}

export const cardHover = {
  rest:  { y: 0, boxShadow: 'var(--shadow-sm)', scale: 1 },
  hover: { y: -4, scale: 1.01, boxShadow: 'var(--shadow-lg)', transition: spring.gentle },
}

export const scrollReveal = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing.smooth } },
}

export const sidebarVariants = {
  open:   { x: 0, opacity: 1, transition: spring.gentle },
  closed: { x: '100%', opacity: 0, transition: { duration: 0.25 } },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
}

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easing.smooth } },
  exit:    { opacity: 0, y: 10, transition: { duration: 0.2 } },
}
