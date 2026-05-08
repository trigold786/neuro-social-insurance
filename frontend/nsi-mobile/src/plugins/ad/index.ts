import { registerPlugin } from '@capacitor/core'
import type { AdPlugin } from './definitions'

const AdPlugin = registerPlugin<AdPlugin>('AdPlugin', {
  web: () => import('./web').then((m) => new m.AdWeb()),
})

export default AdPlugin
export * from './definitions'
