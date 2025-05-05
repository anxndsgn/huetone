import { useState } from 'react'
import styled from 'styled-components'
import * as DropdownMenu from './DropdownMenu'
import { Button } from './inputs'
import { colorSpaces } from 'shared/colorFuncs'
import { addHue, setPalette } from 'store/palette'
import { useStore } from '@nanostores/react'
import { paletteStore } from 'store/palette'

export function AddRowButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [colorInput, setColorInput] = useState('')
  const palette = useStore(paletteStore)

  const handleAddFromColor = () => {
    const color = colorSpaces.oklch.hex2color(colorInput)
    if (!color) return

    // 获取上一行的色板数据
    const lastRowIndex = palette.colors.length - 1
    const lastRow = lastRowIndex >= 0 ? palette.colors[lastRowIndex] : null

    // 创建新行
    const newRow = palette.tones.map((_, i) => {
      // 创建一个新的颜色对象，使用输入颜色的色相值
      const newColor = colorSpaces.oklch.hex2color(colorInput)
      if (!newColor) return color

      if (lastRow) {
        // 使用上一行对应位置的 lightness 和 chroma 值
        const lastColor = lastRow[i]
        newColor.l = lastColor.l
        newColor.c = lastColor.c
      }

      // 重新计算 RGB 和 hex 值
      const { r, g, b, hex, within_sRGB, within_P3, within_Rec2020 } =
        colorSpaces.oklch.lch2color([newColor.l, newColor.c, newColor.h]) ||
        color

      return {
        ...newColor,
        r,
        g,
        b,
        hex,
        within_sRGB,
        within_P3,
        within_Rec2020,
      }
    })

    // 添加新行
    setPalette({
      ...palette,
      hues: [...palette.hues, `Hue ${palette.hues.length + 1}`],
      colors: [...palette.colors, newRow],
    })

    setColorInput('')
    setIsOpen(false)
  }

  const handleCopyLastRow = () => {
    setPalette(addHue(palette))
    setIsOpen(false)
  }

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <SmallButton title="添加行">+</SmallButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content>
          <ColorInputContainer>
            <ColorInput
              type="text"
              placeholder="输入颜色值 (例如: #ff0000)"
              value={colorInput}
              onChange={e => setColorInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleAddFromColor()
                }
              }}
            />
            <Button onClick={handleAddFromColor}>从颜色新建</Button>
          </ColorInputContainer>
          <DropdownMenu.Item onClick={handleCopyLastRow}>
            复制最后一行
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

const SmallButton = styled(Button)`
  background: transparent;
  padding: 0;
  opacity: 0;

  :hover {
    opacity: 1;
  }
`

const ColorInputContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px;
`

const ColorInput = styled.input`
  border: none;
  border-radius: var(--radius-m);
  padding: 6px 8px;
  background: var(--c-btn-bg);
  color: var(--c-text-primary);
  font-size: 14px;
  line-height: 20px;

  &:focus {
    outline: none;
    background: var(--c-btn-bg-hover);
  }
`
