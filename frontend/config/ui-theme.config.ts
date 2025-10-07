export interface ColorOverrides {
  primary?: string
  primaryForeground?: string
  secondary?: string
  secondaryForeground?: string
  accent?: string
  accentForeground?: string
  muted?: string
  mutedForeground?: string
  background?: string
  foreground?: string
  border?: string
  input?: string
  ring?: string
  destructive?: string
  destructiveForeground?: string
}

export const colorOverrides: ColorOverrides = {
  // 留空以使用 shadcn/vue 默认色值
}
