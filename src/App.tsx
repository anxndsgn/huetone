import { useStore } from '@nanostores/react'
import React, { FC, useMemo } from 'react'
import styled from 'styled-components'
import { Scale } from './components/ColorGraph'
import { PaletteSwatches } from './components/PaletteSwatches'
import { setLchColor } from 'store/palette'
import { ExportField } from './components/Export'
import { ColorInfo } from './components/ColorInfo'
import { Help } from './components/Help'
import { KeyPressHandler } from './components/KeyPressHandler'
import { useKeyPress } from 'shared/hooks/useKeyPress'
import { paletteStore } from 'store/palette'
import { selectedStore, setSelected } from 'store/currentPosition'
import { Header } from './components/Header'
import { SampleButton } from './components/SampleButton'

const chartWidth = 500

export default function App() {
  const palette = useStore(paletteStore)
  const selected = useStore(selectedStore)

  const hueColors = useMemo(
    () => palette.colors.map(hue => hue[selected.toneId]),
    [palette.colors, selected.toneId]
  )

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Wrapper>
        <KeyPressHandler />
        <PaletteSection>
          <PaletteSwatches />
          <ColorInfo />
          <ControlRow>
            <ExportField />
          </ControlRow>
        </PaletteSection>

        <ChartsSection>
          <Charts>
            <div
              style={{
                gridColumn: '1/-1',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <h1>Lightness</h1>
            </div>
            <div
              style={{
                gridColumn: '1/-1',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <SampleButton />
            </div>
            <Scale
              width={chartWidth}
              selected={selected.toneId}
              channel="l"
              colors={palette.colors[selected.hueId]}
              onSelect={i => setSelected([selected.hueId, i])}
              onColorChange={(i, lch) => {
                setSelected([selected.hueId, i])
                setLchColor(lch, selected.hueId, i)
              }}
            />
            <ScaleIndicator axis="l" />
            <Scale
              width={chartWidth}
              selected={selected.hueId}
              channel="l"
              colors={hueColors}
              onSelect={i => setSelected([i, selected.toneId])}
              onColorChange={(i, lch) => {
                setSelected([i, selected.toneId])
                setLchColor(lch, i, selected.toneId)
              }}
            />

            <h1
              style={{
                gridColumn: '1/-1',
              }}
            >
              Chroma
            </h1>
            <Scale
              width={chartWidth}
              selected={selected.toneId}
              channel="c"
              colors={palette.colors[selected.hueId]}
              onSelect={i => setSelected([selected.hueId, i])}
              onColorChange={(i, lch) => {
                setSelected([selected.hueId, i])
                setLchColor(lch, selected.hueId, i)
              }}
            />
            <ScaleIndicator axis="c" />
            <Scale
              width={chartWidth}
              selected={selected.hueId}
              channel="c"
              colors={hueColors}
              onSelect={i => setSelected([i, selected.toneId])}
              onColorChange={(i, lch) => {
                setSelected([i, selected.toneId])
                setLchColor(lch, i, selected.toneId)
              }}
            />
            <h1
              style={{
                gridColumn: '1/-1',
              }}
            >
              Hue
            </h1>
            <Scale
              width={chartWidth}
              selected={selected.toneId}
              channel="h"
              colors={palette.colors[selected.hueId]}
              onSelect={i => setSelected([selected.hueId, i])}
              onColorChange={(i, lch) => {
                setSelected([selected.hueId, i])
                setLchColor(lch, selected.hueId, i)
              }}
            />
            <ScaleIndicator axis="h" />
            <Scale
              width={chartWidth}
              selected={selected.hueId}
              channel="h"
              colors={hueColors}
              onSelect={i => setSelected([i, selected.toneId])}
              onColorChange={(i, lch) => {
                setSelected([i, selected.toneId])
                setLchColor(lch, i, selected.toneId)
              }}
            />
          </Charts>
          <Help />
        </ChartsSection>
      </Wrapper>
    </div>
  )
}

const Wrapper = styled.main`
  flex-grow: 1;
  min-height: 0;
  display: flex;
  @media (max-width: 860px) {
    flex-direction: column;
  }
`
const ControlRow = styled.main`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`
const PaletteSection = styled.section`
  width: min-content;
  overflow: auto;
  min-width: 42rem;
  border-right: 1px solid var(--c-divider);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`
const Charts = styled.section`
  display: grid;
  gap: 16px;
  grid-template-columns: ${chartWidth}px 8px ${chartWidth}px;
`
const ChartsSection = styled.section`
  --c-bg: var(--c-bg-primary);
  overflow: auto;
  display: flex;
  gap: 16px;
  flex-direction: column;
  padding: 16px 24px;
  flex-grow: 1;
  background: var(--c-bg);
  overflow: auto;
`

const Axis = styled.div`
  border-radius: 8px;
  width: 8px;
`
const AxisL = styled(Axis)`
  background: linear-gradient(#fff, #b9b9b9, #777, #3b3b3b, #000);
`
const AxisC = styled(Axis)`
  background: linear-gradient(
    #ff00ff,
    #f440f3,
    #ea58e7,
    #df69dc,
    #d377d0,
    #c783c4,
    #bb8db8,
    #ad97ac,
    #9f9f9f
  );
`
const AxisH = styled(Axis)`
  background: linear-gradient(
    #e183a1,
    #b093e5,
    #55aee8,
    #2fbda7,
    #9bb054,
    #db9152,
    #e183a1
  );
`

const axises = {
  l: <AxisL />,
  c: <AxisC />,
  h: <AxisH />,
}

const ScaleIndicator: FC<{ axis: 'l' | 'c' | 'h' }> = ({ axis }) => {
  const pressed = useKeyPress('Key' + axis.toUpperCase())
  const style = pressed
    ? { fontWeight: 900, '--bg': 'var(--c-btn-bg-active)' }
    : { '--bg': 'var(--c-btn-bg)' }
  return (
    <ScaleIndicatorWrapper>
      <LetterContainer>
        <Letter style={style}>{axis.toUpperCase()}</Letter>
      </LetterContainer>
      {axises[axis]}
    </ScaleIndicatorWrapper>
  )
}

const LetterContainer = styled.span`
  position: relative;
`

const Letter = styled.span`
  width: 24px;
  text-align: center;
  line-height: 24px;
  color: var(--c-text-primary);
  background: var(--bg);
  border-radius: var(--radius-m);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

const ScaleIndicatorWrapper = styled.div`
  display: grid;
  grid-template-rows: 26px auto;
`
