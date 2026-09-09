import { createContext, useContext } from 'react'

export const QualityContext = createContext(null)

export function useExperienceQuality() {
  return useContext(QualityContext)
}
