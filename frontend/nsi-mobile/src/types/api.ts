export interface Policy {
  policy_id: string
  region_code: string
  city_name: string
  policy_type: string
  status: 'Draft' | 'Conflict' | 'Verified'
  effective_date: string
  items: Record<string, any>
}

export interface CalcResult {
  strategy: string
  total_invested: number
  total_benefit: number
  irr: number
  break_even_age: number
  monthly_pension_estimate: number
  warning?: string
}
