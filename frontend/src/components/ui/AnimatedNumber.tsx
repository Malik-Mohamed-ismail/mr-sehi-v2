import { useSpring, animated } from '@react-spring/web'

interface Props {
  value:    number
  prefix?:  string
  suffix?:  string
  decimals?: number
  className?: string
}

export function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 2, className = '' }: Props) {
  const { val } = useSpring({
    from:   { val: 0 },
    to:     { val: value },
    config: { mass: 1, tension: 60, friction: 20 },
    delay:  200,
  })

  return (
    <animated.span className={`number kpi-value ${className}`}>
      {val.to(v => `${prefix}${v.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`)}
    </animated.span>
  )
}
