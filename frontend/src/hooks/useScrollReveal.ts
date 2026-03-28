import { useEffect } from 'react'
import { useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export function useScrollReveal(threshold = 0.15) {
  const controls        = useAnimation()
  const [ref, inView]   = useInView({ threshold, triggerOnce: true })

  useEffect(() => {
    if (inView) controls.start('animate')
  }, [inView, controls])

  return { ref, controls }
}
