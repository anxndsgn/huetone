import { action, computed, map } from 'nanostores'
import { selectedStore } from './currentPosition'

export type TOverlayMode = 'APCA' | 'WCAG' | 'NONE' | 'DELTA_E'
export type TBWContrastMode = 'white' | 'black' | 'max'
type TVersus = 'selected' | string

export const overlayStore = map<{ mode: TOverlayMode; versus: TVersus; bwContrastMode: TBWContrastMode }>({
  mode: 'APCA',
  versus: 'white',
  bwContrastMode: 'max',
})

export const versusColorStore = computed(
  [overlayStore, selectedStore],
  (overlay, selected) => {
    if (overlay.versus === 'selected') {
      return selected.color.hex
    }
    return overlay.versus
  }
)

// ACTIONS

export const setOverlayMode = action(
  overlayStore,
  'setOverlayMode',
  (store, mode: TOverlayMode) => {
    store.setKey('mode', mode)
  }
)

export const setVersusColor = action(
  overlayStore,
  'setVersusColor',
  (store, color: TVersus) => {
    store.setKey('versus', color)
  }
)

export const setBWContrastMode = action(
  overlayStore,
  'setBWContrastMode',
  (store, bwContrastMode: TBWContrastMode) => {
    store.setKey('bwContrastMode', bwContrastMode)
  }
)
