import chroma from 'chroma-js'
import { formatHex, parse, oklch as oklchConverter } from 'culori'
import { LCH, RGB, spaceName, TColor, XYZ } from '../types'
import { clamp } from '../utils'
import { oklch, cielch } from './colorModels'
import {
  isWithinGamut,
  forceIntoGamut,
  srgb2hex,
  // hex2rgb,
  xyz2rgb,
  rgb2xyz,
  xyz2p3,
  xyz2rec2020,
} from './utils'

export const colorSpaces = {
  [spaceName.oklch]: colorSpaceMaker(oklch),
  [spaceName.cielch]: colorSpaceMaker(cielch),
}

export type TLchModel = {
  name: spaceName
  ranges: {
    l: { min: number; max: number; step: number; precision: number }
    c: { min: number; max: number; step: number; precision: number }
    h: { min: number; max: number; step: number; precision: number }
  }
  xyz2lch: (xyz: XYZ) => LCH
  lch2xyz: (lch: LCH) => XYZ
}

export type TColorSpace = {
  name: TLchModel['name']
  ranges: TLchModel['ranges']
  hex2color: (hex: string) => TColor | null
  lch2color: (lch: LCH) => TColor
  anyToColor: (color: string) => TColor | null
}

/** Makes color space object with essential functions */
function colorSpaceMaker(colorSpace: TLchModel): TColorSpace {
  const { lch2xyz, xyz2lch, ranges, name } = colorSpace

  // Full conversions
  const lch2rgb = (lch: LCH) => xyz2rgb(lch2xyz(lch))
  const rgb2lch = (rgb: RGB) => xyz2lch(rgb2xyz(rgb))

  function lch2color(lch: LCH): TColor {
    const xyz = lch2xyz(lch)
    const srgb = xyz2rgb(xyz)
    const within_sRGB = isWithinGamut(srgb)
    const [r, g, b] = srgb.map(c => clamp(c * 255, 0, 255))
    const [l, c, h] = lch

    // prettier-ignore
    return {
      mode: name,
      l, c, h,
      r, g, b,
      get hex () {
        const rgb = within_sRGB ? srgb : forceIntoGamut(lch, lch2rgb)
        return srgb2hex(rgb)
      },
      within_sRGB,
      get within_P3 () {
        return within_sRGB || isWithinGamut(xyz2p3(xyz))
      },
      get within_Rec2020 () {
        return within_sRGB || this.within_P3 || isWithinGamut(xyz2rec2020(xyz))
      },
    }
  }

  function hex2color(hex: string): TColor | null {
    if (!chroma.valid(hex)) return null
    const rgb = chroma(hex)
      .rgb()
      .map(c => c / 255) as RGB
    if (!rgb) return null
    const [l, c, h] = rgb2lch(rgb)
    const [r, g, b] = rgb.map(c => clamp(c * 255, 0, 255))

    // prettier-ignore
    return {
      mode: name,
      l, c, h,
      r, g, b,
      hex: srgb2hex(rgb),
      within_sRGB: true,
      within_P3: true,
      within_Rec2020: true,
    }
  }

  function anyToColor(color: string): TColor | null {
    const parsed = oklchConverter(color)
    if (!parsed) return null

    // 确保所有值都有合理的默认值
    const l = parsed.l ?? 0
    const c = parsed.c ?? 0
    // 对于灰色（c=0），h 可以是任意值，因为不会影响最终颜色
    const h = c === 0 ? 0 : parsed.h ?? 0

    // 验证值的范围
    if (l < 0 || l > 1) return null
    if (c < 0) return null
    if (h < 0 || h > 360) return null

    // 将 l 值从 0-1 范围映射到 0-100 范围
    const lch: LCH = [l * 100, c, h]

    return lch2color(lch)
  }

  return { name, ranges, hex2color, lch2color, anyToColor }
}
