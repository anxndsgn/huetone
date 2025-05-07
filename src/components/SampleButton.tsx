import React, { useState } from 'react'
import styled from 'styled-components'
import { useStore } from '@nanostores/react'
import { paletteStore } from 'store/palette'
import { selectedStore, setSelected } from 'store/currentPosition'
import { setLchColor } from 'store/palette'

type EasingFunction = 'linear' | 'easein' | 'easeout' | 'easeinout'

const easingFunctions = {
  linear: (t: number) => t,
  easein: (t: number) => t * t,
  easeout: (t: number) => 1 - (1 - t) * (1 - t),
  easeinout: (t: number) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
}

export const SampleButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const palette = useStore(paletteStore)
  const selected = useStore(selectedStore)

  const handleSample = (easing: EasingFunction) => {
    const currentHueColors = palette.colors[selected.hueId]
    const numTones = currentHueColors.length

    // 获取第一个和最后一个颜色的亮度值
    const firstL = currentHueColors[0].l
    const lastL = currentHueColors[numTones - 1].l

    // 对每个色调进行采样
    currentHueColors.forEach((color, index) => {
      const t = index / (numTones - 1)
      const easedT = easingFunctions[easing](t)
      const newL = firstL + (lastL - firstL) * easedT

      // 保持色度和色相不变，只改变亮度
      setLchColor([newL, color.c, color.h], selected.hueId, index)
    })

    setIsOpen(false)
  }

  return (
    <Wrapper>
      <Button onClick={() => setIsOpen(!isOpen)}>Sample</Button>
      {isOpen && (
        <Dropdown>
          <Option onClick={() => handleSample('linear')}>Linear</Option>
          <Option onClick={() => handleSample('easein')}>Ease In</Option>
          <Option onClick={() => handleSample('easeout')}>Ease Out</Option>
          <Option onClick={() => handleSample('easeinout')}>Ease In Out</Option>
        </Dropdown>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`

const Button = styled.button`
  padding: 4px 8px;
  border: 0px solid var(--c-divider);
  border-radius: var(--radius-m);
  background: var(--c-btn-bg);
  color: var(--c-text-primary);
  cursor: pointer;

  &:hover {
    background: var(--c-btn-bg-hover);
  }
`

const Dropdown = styled.div`
  position: absolute;
  overflow: hidden;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: var(--c-bg-card);
  border: 1px solid var(--c-divider);
  border-radius: var(--radius-m);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
`

const Option = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: var(--c-btn-bg-hover);
  }
`
