import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import chroma from 'chroma-js'

export type TColor = {
  l: number
  c: number
  h: number
  r: number
  g: number
  b: number
  hex: string
  within_sRGB: boolean
}

type State = {
  colors: TColor[][]
  hues: string[]
  tones: string[]
  hueId: number
  toneId: number
  color: TColor
  overlayMode: 'APCA' | 'WCAG' | 'NONE' | 'DELTA_E'
  versusColor: 'selected' | 'white'
  showRec2020: boolean
  colorSpace: 'sRGB' | 'P3' | 'Rec.2020'
}

type Actions = {
  setSelected: (selected: [number, number]) => void
  setLchColor: (color: TColor, hueId: number, toneId: number) => void
  setOverlayMode: (mode: State['overlayMode']) => void
  setVersusColor: (color: State['versusColor']) => void
  toggleShowRec2020: () => void
  toggleColorSpace: () => void
  addHue: () => void
  removeHue: (hueId: number) => void
  addTone: () => void
  removeTone: (toneId: number) => void
}

const initialState: State = {
  colors: [],
  hues: [],
  tones: [],
  hueId: 0,
  toneId: 0,
  color: {
    l: 50,
    c: 50,
    h: 0,
    r: 255,
    g: 0,
    b: 0,
    hex: '#ff0000',
    within_sRGB: true,
  },
  overlayMode: 'NONE',
  versusColor: 'white',
  showRec2020: false,
  colorSpace: 'sRGB',
}

export const useStore = create<State & Actions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setSelected: ([hueId, toneId]) => {
        const colors = get().colors
        if (!colors[hueId] || !colors[hueId][toneId]) return
        set({
          hueId,
          toneId,
          color: colors[hueId][toneId],
        })
      },

      setLchColor: (color, hueId, toneId) => {
        const colors = [...get().colors]
        if (!colors[hueId]) return
        colors[hueId] = [...colors[hueId]]
        colors[hueId][toneId] = color
        set({ colors, color })
      },

      setOverlayMode: overlayMode => set({ overlayMode }),
      setVersusColor: versusColor => set({ versusColor }),
      toggleShowRec2020: () =>
        set(state => ({ showRec2020: !state.showRec2020 })),
      toggleColorSpace: () => {
        const spaces = ['sRGB', 'P3', 'Rec.2020'] as const
        const current = get().colorSpace
        const nextIndex = (spaces.indexOf(current) + 1) % spaces.length
        set({ colorSpace: spaces[nextIndex] })
      },

      addHue: () => {
        const { colors, hues, tones } = get()
        const newColors = [...colors]
        const newHues = [...hues]
        const baseColor = colors[0]?.[0] || initialState.color

        newColors.push(tones.map(() => ({ ...baseColor })))
        newHues.push(`Hue ${hues.length + 1}`)

        set({ colors: newColors, hues: newHues })
      },

      removeHue: hueId => {
        const { colors, hues } = get()
        const newColors = colors.filter((_, i) => i !== hueId)
        const newHues = hues.filter((_, i) => i !== hueId)
        set({ colors: newColors, hues: newHues })
      },

      addTone: () => {
        const { colors, tones } = get()
        const newColors = colors.map(hue => {
          const baseColor = hue[0] || initialState.color
          return [...hue, { ...baseColor }]
        })
        const newTones = [...tones, `Tone ${tones.length + 1}`]
        set({ colors: newColors, tones: newTones })
      },

      removeTone: toneId => {
        const { colors, tones } = get()
        const newColors = colors.map(hue => hue.filter((_, i) => i !== toneId))
        const newTones = tones.filter((_, i) => i !== toneId)
        set({ colors: newColors, tones: newTones })
      },
    }),
    { name: 'color-store' }
  )
)
