import { useState } from 'react'
import styled from 'styled-components'
import * as DropdownMenu from './DropdownMenu'

type ImportProps = {
  onImport: (type: 'design-token' | 'css-variables', content: string) => void
}

export function Import({ onImport }: ImportProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const content = await file.text()
    const fileType = file.name.endsWith('.json')
      ? 'design-token'
      : 'css-variables'
    onImport(fileType, content)
  }

  return (
    <Container>
      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenu.Trigger asChild>
          <ImportButton>Import</ImportButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content>
            <DropdownMenu.Item
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.json'
                input.onchange = handleFileUpload as any
                input.click()
              }}
            >
              Import from Design Token
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.css'
                input.onchange = handleFileUpload as any
                input.click()
              }}
            >
              Import from CSS Variables
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </Container>
  )
}

const Container = styled.div`
  position: relative;
`

const ImportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: var(--radius-m);
  font-size: 14px;
  color: var(--c-text-primary);
  background: var(--c-btn-bg);
  border: none;
  cursor: pointer;

  &:hover {
    background: var(--c-btn-bg-hover);
  }

  &:active {
    background: var(--c-btn-bg-active);
  }
`
