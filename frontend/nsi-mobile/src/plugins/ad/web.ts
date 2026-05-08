import { WebPlugin } from '@capacitor/core'
import type { AdPlugin, AdOptions, AdResult } from './definitions'

export class AdWeb extends WebPlugin implements AdPlugin {
  async showBanner(options: AdOptions): Promise<void> {
    console.log('[AdWeb] showBanner', options)
  }

  async hideBanner(): Promise<void> {
    console.log('[AdWeb] hideBanner')
  }

  async showInterstitial(options: AdOptions): Promise<AdResult> {
    console.log('[AdWeb] showInterstitial', options)
    return { shown: true, clicked: false }
  }

  async showRewardVideo(options: AdOptions): Promise<AdResult> {
    console.log('[AdWeb] showRewardVideo', options)
    return { shown: true, clicked: false, rewardEarned: true }
  }

  async preloadRewardVideo(options: AdOptions): Promise<void> {
    console.log('[AdWeb] preloadRewardVideo', options)
  }
}
