import { Palette, spaceName, TColor } from 'shared/types'
import { colorSpaces } from 'shared/colorFuncs'

type DesignToken = {
  [hue: string]: {
    [tone: string]: {
      value: string
      type: 'color'
    }
  }
}

const defaultColor: TColor = {
  mode: spaceName.cielch,
  r: 0,
  g: 0,
  b: 0,
  hex: '#000000',
  l: 0,
  c: 0,
  h: 0,
  within_sRGB: true,
  within_P3: true,
  within_Rec2020: true,
}

export function importFromDesignToken(content: string): Palette {
  try {
    const tokens = JSON.parse(content) as DesignToken
    const hues = Object.keys(tokens)
    const tones = Object.keys(tokens[hues[0]])
    const colors = hues.map(hue =>
      tones.map(tone => {
        const hex = tokens[hue][tone].value
        return colorSpaces.cielch.hex2color(hex) || defaultColor
      })
    )

    return {
      mode: spaceName.cielch,
      name: 'Imported Design Token',
      hues,
      tones,
      colors,
    }
  } catch (error) {
    throw new Error('无效的 Design Token 格式')
  }
}

export function importFromCSSVariables(content: string): Palette {
  try {
    const lines = content.split('\n')
    const colorVars = lines.filter(
      line => line.includes('--') && line.includes(':')
    )

    // 提取色相和色调
    const colorMap = new Map<string, Map<string, string>>()

    colorVars.forEach(line => {
      const match = line.match(/--([^-]+)-([^:]+):\s*([^;]+);/)
      if (!match) return

      const [, hue, tone, value] = match
      if (!colorMap.has(hue)) {
        colorMap.set(hue, new Map())
      }
      colorMap.get(hue)?.set(tone, value.trim())
    })

    const hues = Array.from(colorMap.keys())
    const tones = Array.from(colorMap.get(hues[0])?.keys() || [])

    const colors = hues.map(hue =>
      tones.map(tone => {
        const hex = colorMap.get(hue)?.get(tone) || '#000000'
        return colorSpaces.cielch.hex2color(hex) || defaultColor
      })
    )

    return {
      mode: spaceName.cielch,
      name: 'Imported CSS Variables',
      hues,
      tones,
      colors,
    }
  } catch (error) {
    throw new Error('无效的 CSS Variables 格式')
  }
}
