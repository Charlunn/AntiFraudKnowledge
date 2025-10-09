import { colorOverrides } from '~/config/ui-theme.config'

type ThemeVariable = keyof typeof colorOverrides

const cssVarMap: Record<ThemeVariable, string> = {
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  background: '--background',
  foreground: '--foreground',
  border: '--border',
  input: '--input',
  ring: '--ring',
  destructive: '--destructive',
  destructiveForeground: '--destructive-foreground'
}

const defaultPalette: Record<string, string> = {
  '--background': '0 0% 100%',
  '--foreground': '222.2 47.4% 11.2%',
  '--muted': '210 40% 96.1%',
  '--muted-foreground': '215.4 16.3% 46.9%',
  '--popover': '0 0% 100%',
  '--popover-foreground': '222.2 47.4% 11.2%',
  '--card': '0 0% 100%',
  '--card-foreground': '222.2 47.4% 11.2%',
  '--border': '214.3 31.8% 91.4%',
  '--input': '214.3 31.8% 91.4%',
  '--primary': '221.2 83.2% 53.3%',
  '--primary-foreground': '210 40% 98%',
  '--secondary': '210 40% 96.1%',
  '--secondary-foreground': '222.2 47.4% 11.2%',
  '--accent': '210 40% 96.1%',
  '--accent-foreground': '222.2 47.4% 11.2%',
  '--destructive': '0 84.2% 60.2%',
  '--destructive-foreground': '210 40% 98%',
  '--ring': '221.2 83.2% 53.3%'
}

export default defineNuxtPlugin(() => {
  if (process.server) return

  const root = document.documentElement

  Object.entries(cssVarMap).forEach(([key, cssVar]) => {
    const overrideValue = colorOverrides[key as ThemeVariable]
    const fallbackValue = defaultPalette[cssVar]

    root.style.setProperty(cssVar, overrideValue ?? fallbackValue)
  })
})