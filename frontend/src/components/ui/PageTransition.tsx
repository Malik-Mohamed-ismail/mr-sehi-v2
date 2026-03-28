
interface Props {
  children: React.ReactNode
  key?:     string
}

export function PageTransition({ children, key }: Props) {
  return (
    <div key={key} style={{ width: '100%' }}>
      {children}
    </div>
  )
}
