// 支持的城市列表 - 与后端 actuarial-engine region_data.go 保持一致
export interface City {
  code: string
  name: string
  tier: 1 | 2 | 3
}

export const CITIES: City[] = [
  // Tier 1
  { code: '110000', name: '北京', tier: 1 },
  { code: '310000', name: '上海', tier: 1 },
  { code: '440100', name: '广州', tier: 1 },
  { code: '440300', name: '深圳', tier: 1 },
  // Tier 2
  { code: '330100', name: '杭州', tier: 2 },
  { code: '320100', name: '南京', tier: 2 },
  { code: '510100', name: '成都', tier: 2 },
  { code: '420100', name: '武汉', tier: 2 },
  { code: '500000', name: '重庆', tier: 2 },
  { code: '370100', name: '济南', tier: 2 },
  { code: '330200', name: '宁波', tier: 2 },
  { code: '610100', name: '西安', tier: 2 },
  { code: '120000', name: '天津', tier: 2 },
  { code: '320500', name: '苏州', tier: 2 },
  { code: '410100', name: '郑州', tier: 2 },
  { code: '430100', name: '长沙', tier: 2 },
  { code: '370200', name: '青岛', tier: 2 },
  { code: '441900', name: '东莞', tier: 2 },
  { code: '320200', name: '无锡', tier: 2 },
  { code: '350200', name: '厦门', tier: 2 },
]

export const CITY_MAP: Record<string, string> = Object.fromEntries(
  CITIES.map((c) => [c.code, c.name])
)

export const TIER_1_CITIES = CITIES.filter((c) => c.tier === 1)
export const TIER_2_CITIES = CITIES.filter((c) => c.tier === 2)

export function getCityName(code: string): string {
  return CITY_MAP[code] || code
}

export function getCityByCode(code: string): City | undefined {
  return CITIES.find((c) => c.code === code)
}
