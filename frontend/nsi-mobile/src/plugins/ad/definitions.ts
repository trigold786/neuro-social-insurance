export interface AdOptions {
  id?: string
  position?: string
}

export interface AdResult {
  shown: boolean
  clicked?: boolean
  rewardEarned?: boolean
}

export interface AdPlugin {
  showBanner(options: AdOptions): Promise<void>
  hideBanner(): Promise<void>
  showInterstitial(options: AdOptions): Promise<AdResult>
  showRewardVideo(options: AdOptions): Promise<AdResult>
  preloadRewardVideo(options: AdOptions): Promise<void>
}
