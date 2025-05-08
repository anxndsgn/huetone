import React, { useState } from 'react'
import styled from 'styled-components'
import { useStore } from '@nanostores/react'
import { paletteStore } from 'store/palette'
import { selectedStore } from 'store/currentPosition'
import { setLchColor } from 'store/palette'
import { Button, Input } from './inputs'

type EasingFunction = 'linear' | 'easein' | 'easeout' | 'easeinout' | 'custom'

interface CubicBezier {
  x1: number
  y1: number
  x2: number
  y2: number
}

const easingFunctions = {
  linear: (t: number) => t,
  easein: (t: number) => t * t,
  easeout: (t: number) => 1 - (1 - t) * (1 - t),
  easeinout: (t: number) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  custom: (t: number, bezier?: CubicBezier) => {
    if (!bezier) return t
    return cubicBezier(bezier.x1, bezier.y1, bezier.x2, bezier.y2)(t)
  },
}

// 实现 cubic-bezier 函数
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  return function (t: number) {
    if (t <= 0) return 0
    if (t >= 1) return 1

    let start = 0
    let end = 1

    // 二分法求解 t 值
    for (let i = 0; i < 10; i++) {
      const currentT = (start + end) / 2
      const x = cubicBezierPoint(currentT, x1, x2)

      if (Math.abs(t - x) < 0.001) {
        return cubicBezierPoint(currentT, y1, y2)
      }

      if (x < t) {
        start = currentT
      } else {
        end = currentT
      }
    }

    return cubicBezierPoint((start + end) / 2, y1, y2)
  }
}

function cubicBezierPoint(t: number, p1: number, p2: number) {
  const mt = 1 - t
  return 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t
}

function parseCubicBezier(input: string): CubicBezier | null {
  const match = input.match(/cubic-bezier\(([\d.,-\s]+)\)/)
  if (!match) return null

  const values = match[1].split(',').map(v => parseFloat(v.trim()))
  if (values.length !== 4) return null

  return {
    x1: values[0],
    y1: values[1],
    x2: values[2],
    y2: values[3],
  }
}

export const SampleButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [customEasing, setCustomEasing] = useState(
    'cubic-bezier(0.4, 0, 0.2, 1)'
  )
  const [currentEasing, setCurrentEasing] = useState<EasingFunction>('linear')
  const palette = useStore(paletteStore)
  const selected = useStore(selectedStore)

  const handleSample = (easing: EasingFunction) => {
    const currentHueColors = palette.colors[selected.hueId]
    const numTones = currentHueColors.length
    const bezier =
      easing === 'custom'
        ? parseCubicBezier(customEasing) || undefined
        : undefined

    currentHueColors.forEach((color, index) => {
      const t = index / (numTones - 1)
      const easedT = easingFunctions[easing](t, bezier)
      const firstL = currentHueColors[0].l
      const lastL = currentHueColors[numTones - 1].l
      const newL = firstL + (lastL - firstL) * easedT

      setLchColor([newL, color.c, color.h], selected.hueId, index)
    })

    setCurrentEasing(easing)
    if (easing !== 'custom') {
      setIsOpen(false)
    }
  }

  return (
    <Wrapper>
      <StyledButton onClick={() => setIsOpen(!isOpen)}>Sample</StyledButton>
      {isOpen && (
        <Dropdown>
          <Option onClick={() => handleSample('linear')}>Linear</Option>
          <Option onClick={() => handleSample('easein')}>Ease In</Option>
          <Option onClick={() => handleSample('easeout')}>Ease Out</Option>
          <Option onClick={() => handleSample('easeinout')}>Ease In Out</Option>
          <CustomOption>
            <StyledInput
              type="text"
              value={customEasing}
              onChange={e => setCustomEasing(e.target.value)}
              placeholder="cubic-bezier(0.4, 0, 0.2, 1)"
            />
            <Button onClick={() => handleSample('custom')}>Apply</Button>
          </CustomOption>
        </Dropdown>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`

const StyledButton = styled(Button)`
  padding: 4px 8px;
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
  min-width: 200px;
`

const Option = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: var(--c-btn-bg-hover);
  }
`

const CustomOption = styled.div`
  padding: 8px 16px;
  border-top: 1px solid var(--c-divider);
  display: flex;
  gap: 8px;
`

const StyledInput = styled(Input)`
  flex: 1;
`
