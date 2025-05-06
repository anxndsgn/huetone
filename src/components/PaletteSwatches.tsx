import React, { FC, Fragment, useCallback } from 'react'
import styled from 'styled-components'
import {
  getMostContrast,
  wcagContrast,
  apcaContrast,
  deltaEContrast,
} from 'shared/color'
import {
  addTone,
  removeHue,
  removeTone,
  renameHue,
  renameTone,
} from 'store/palette'
import { useKeyPress } from 'shared/hooks/useKeyPress'
import { Button, InvisibleInput } from './inputs'
import { useStore } from '@nanostores/react'
import { colorSpaceStore, paletteStore, setPalette } from 'store/palette'
import { selectedStore, setSelected } from 'store/currentPosition'
import { overlayStore, versusColorStore } from 'store/overlay'
import { AddRowButton } from './AddRowButton'

const contrast = {
  WCAG: wcagContrast,
  APCA: apcaContrast,
  DELTA_E: deltaEContrast,
  NONE: () => undefined,
}

export const PaletteSwatches: FC = () => {
  const palette = useStore(paletteStore)
  const selected = useStore(selectedStore)
  const overlay = useStore(overlayStore)
  const versusColor = useStore(versusColorStore)
  const colorSpace = useStore(colorSpaceStore)
  const bPress = useKeyPress('KeyB')
  const { hues, tones, colors } = palette
  const getCR = useCallback(
    (hex: string) => {
      let cr = contrast[overlay.mode](versusColor, hex)
      return cr && Math.floor(cr * 10) / 10
    },
    [overlay.mode, versusColor]
  )

  return (
    <Wrapper columns={tones.length} rows={hues.length}>
      {/* HEADER */}
      <div />
      {tones.map((toneName, tone) => (
        <ToneInput
          key={tone}
          value={toneName}
          onChange={e => setPalette(renameTone(palette, tone, e.target.value))}
        />
      ))}
      <SmallButton
        title="Add tone"
        onClick={() => setPalette(addTone(palette))}
      >
        +
      </SmallButton>

      {/* HUES */}
      {colors.map((hueColors, hueId) => (
        <Fragment key={hueId}>
          <InvisibleInput
            key={hueId}
            value={hues[hueId]}
            onChange={e =>
              setPalette(renameHue(palette, hueId, e.target.value))
            }
          />
          {hueColors.map((color, toneId) => {
            const isSelected =
              hueId === selected.hueId && toneId === selected.toneId
            return (
              <Swatch
                key={toneId + '-' + hueId}
                onClick={() => setSelected([hueId, toneId])}
                style={{
                  background: !bPress
                    ? color.hex
                    : colorSpace.lch2color([color.l, 0, 0]).hex,
                  color: getMostContrast(color.hex, ['#000', '#fff']),
                  transform: isSelected ? 'scale(1.25)' : 'scale(1)',
                  transition: 'transform 0.1s ease-in-out',
                  zIndex: isSelected ? 3 : 0,
                  fontWeight: isSelected ? 900 : 400,
                }}
              >
                <span>{getCR(color.hex)}</span>
              </Swatch>
            )
          })}
          <SmallButton
            title="Delete this row"
            onClick={() => setPalette(removeHue(palette, hueId))}
          >
            ×
          </SmallButton>
        </Fragment>
      ))}

      {/* COLUMN BUTTONS */}
      <AddRowButton />
      {tones.map((toneName, toneId) => (
        <SmallButton
          key={toneId}
          title="Delete this column"
          onClick={() => setPalette(removeTone(palette, toneId))}
        >
          ×
        </SmallButton>
      ))}
    </Wrapper>
  )
}

const Wrapper = styled.div<{ columns: number; rows: number }>`
  display: grid;
  grid-template-columns: 64px repeat(${p => p.columns}, 48px) 24px;
  grid-template-rows: 32px repeat(${p => p.rows}, 48px) 24px;
`

const ToneInput = styled(InvisibleInput)`
  text-align: center;
`

const Swatch = styled.button`
  cursor: pointer;
  border: none;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  will-change: transform;

  :focus {
    outline: none;
  }
`

export const SmallButton = styled(Button)`
  background: transparent;
  padding: 0;
  opacity: 0;

  ${Wrapper}:hover & {
    opacity: 1;
  }
`
