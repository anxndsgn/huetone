import React, { FC, useEffect, useState } from 'react'
import { useStore } from '@nanostores/react'
import chroma from 'chroma-js'
import styled from 'styled-components'
import { selectedStore } from 'store/currentPosition'
import { paletteStore } from 'store/palette'
import { Input } from '../inputs'
import { ContrastBadgeAPCA, ContrastBadgeWCAG } from './ContrastBadge'
import * as Menu from '../DropdownMenu'
import { ChevronDown } from 'shared/icons/ChevronDown'
import { Button } from '../inputs'

export const ColorInfo: FC = () => {
  const { tones } = useStore(paletteStore)
  return (
    <ContrastStack>
      <ToneContrastGroup versusColor={tones[0]} />
      <ContrastGroup versusColor={'white'} />
      <ContrastGroup versusColor={'black'} />
    </ContrastStack>
  )
}
const ContrastStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const ToneContrastGroup: FC<{ versusColor: string }> = props => {
  const { color, hueId, toneId } = useStore(selectedStore)
  const { colors, tones, hues } = useStore(paletteStore)
  const hex = color.hex
  const [selectedToneId, setSelectedToneId] = useState(0)
  const additionalColor = colors[hueId][selectedToneId].hex
  const name = hues[hueId] + '-' + tones[toneId]

  return (
    <Wrapper>
      <Heading>
        <h4> {name} vs. </h4>

        <Menu.Root>
          <Menu.Trigger asChild>
            <Button style={{ width: 100, justifyContent: 'space-between' }}>
              <span>
                {hues[hueId]}-{tones[selectedToneId]}
              </span>
              <ChevronDown />
            </Button>
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Content align="start" sideOffset={4}>
              {tones.map((tone, index) => (
                <Menu.Item
                  key={tone}
                  selected={index === selectedToneId}
                  onSelect={() => setSelectedToneId(index)}
                >
                  {hues[hueId]}-{tone}
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Portal>
        </Menu.Root>
      </Heading>
      <ContrastBadgeAPCA background={additionalColor} color={hex} />
      <ContrastBadgeAPCA background={hex} color={additionalColor} />
      <ContrastBadgeWCAG background={additionalColor} color={hex} />
    </Wrapper>
  )
}
const ContrastGroup: FC<{ versusColor: string }> = props => {
  const { color, hueId, toneId } = useStore(selectedStore)
  const { colors, tones, hues } = useStore(paletteStore)
  const hex = color.hex
  const [colorInput, setColorInput] = useState(props.versusColor)
  const [additionalColor, setAdditionalColor] = useState(colors[hueId][0].hex)
  const name = hues[hueId] + '-' + tones[toneId]

  useEffect(() => {
    const i = tones.indexOf(colorInput)
    if (i >= 0) {
      setAdditionalColor(colors[hueId][i].hex)
    } else if (chroma.valid(colorInput)) {
      setAdditionalColor(colorInput)
    }
  }, [colorInput, colors, hueId, tones])
  return (
    <Wrapper>
      <Heading>
        <h4>
          {name} vs.{' '}
          <Input
            value={colorInput}
            onChange={e => {
              const value = e.target.value
              setColorInput(value)
            }}
          />
        </h4>
      </Heading>
      <ContrastBadgeAPCA background={additionalColor} color={hex} />
      <ContrastBadgeAPCA background={hex} color={additionalColor} />
      <ContrastBadgeWCAG background={additionalColor} color={hex} />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`
const Heading = styled.div`
  padding-top: 8px;
  width: 100%;
  grid-column: 1 / -1;
  text-align: center;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
`
