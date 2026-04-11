import * as React from 'react'

/** Мобильный UI при ширине < 1280px — как Tailwind `xl` (десктоп с 1280px) */
const MOBILE_MAX_WIDTH_PX = 1279

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const query = `(max-width: ${MOBILE_MAX_WIDTH_PX}px)`
    const mql = window.matchMedia(query)
    const onChange = () => {
      setIsMobile(window.matchMedia(query).matches)
    }
    mql.addEventListener('change', onChange)
    onChange()
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobile
}
