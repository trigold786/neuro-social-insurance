import { useState, useEffect } from 'react'
import { api } from '../api/client'

// 广告配置（实际应从后端配置中心拉取）
interface AdConfig {
  enabled: boolean
  provider: string
  showBanner: boolean
  showInterstitial: boolean
  showRewardVideo: boolean
  maxPerSession: number
  cooldownSeconds: number
}

const defaultAdConfig: AdConfig = {
  enabled: false,
  provider: 'none',
  showBanner: true,
  showInterstitial: true,
  showRewardVideo: false,
  maxPerSession: 5,
  cooldownSeconds: 30,
}

// 全局广告状态
let sessionAdCount = 0
let lastAdShowTime = 0

export function useAdManager() {
  const [config, setConfig] = useState<AdConfig>(defaultAdConfig)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 从后端拉取广告配置
    api.get('/configs/category/ads')
      .then((res: any) => {
        const items = res.data || []
        const map: Record<string, string> = {}
        items.forEach((item: any) => {
          map[item.config_key] = item.config_value
        })
        setConfig({
          enabled: map['ads.enabled'] === 'true',
          provider: map['ads.provider'] || 'none',
          showBanner: map['ads.show_banner'] !== 'false',
          showInterstitial: map['ads.show_interstitial'] !== 'false',
          showRewardVideo: map['ads.show_reward_video'] === 'true',
          maxPerSession: parseInt(map['ads.max_per_session'] || '5'),
          cooldownSeconds: parseInt(map['ads.cooldown_seconds'] || '30'),
        })
      })
      .catch(() => {
        // 使用默认配置
      })
      .finally(() => setLoading(false))
  }, [])

  const canShowAd = (): boolean => {
    if (!config.enabled || config.provider === 'none') return false
    if (sessionAdCount >= config.maxPerSession) return false
    const now = Date.now()
    if (now - lastAdShowTime < config.cooldownSeconds * 1000) return false
    return true
  }

  const showInterstitial = (): boolean => {
    if (!canShowAd() || !config.showInterstitial) return false
    // TODO: 调用 Capacitor 插件展示插屏广告
    // await AdPlugin.showInterstitial({ id: config.gdtInterstitialId || config.pangleCodeId })
    sessionAdCount++
    lastAdShowTime = Date.now()
    return true
  }

  const showRewardVideo = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!canShowAd() || !config.showRewardVideo) {
        resolve(false)
        return
      }
      // TODO: 调用 Capacitor 插件展示激励视频
      // const result = await AdPlugin.showRewardVideo({ id: config.gdtRewardVideoId })
      sessionAdCount++
      lastAdShowTime = Date.now()
      resolve(true) // 假设用户看完视频
    })
  }

  return {
    config,
    loading,
    bannerVisible: config.enabled && config.showBanner,
    showInterstitial,
    showRewardVideo,
    canShowAd,
  }
}
