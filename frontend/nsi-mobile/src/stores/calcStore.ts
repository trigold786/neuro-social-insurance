import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 策略类型
type StrategyType = 'conservative' | 'balanced' | 'aggressive'

// 现金流数据
export interface Cashflow {
  year: number
  age: number
  outflow: number
  inflow: number
  cumulative_invested: number
  cumulative_benefit: number
  pension_outflow: number
  medical_outflow: number
  unemployment_outflow: number
  housing_outflow: number
  employer_pension_outflow: number
  employer_medical_outflow: number
}

// 单方案结果
export interface StrategyResult {
  strategy: StrategyType
  region_code: string
  base_salary: number
  retirement_age: number
  total_invested: number
  total_benefit: number
  irr: number
  break_even_age: number
  monthly_pension_estimate: number
  cashflows: Cashflow[]
  basic_pension: number
  personal_account_pension: number
  transitional_pension: number
  total_monthly_deduction: number
  monthly_take_home: number
}

// 参保历史记录
export interface ContributionRecord {
  id: string
  start_date: string
  end_date: string
  region_code: string
  base_salary: number
  employment_type: string
  is_transitional: boolean
}

// 用户偏好设置
export interface UserPreferences {
  target_monthly_pension: number
  monthly_budget: number
  risk_appetite: StrategyType
  priority: 'max-pension' | 'min-cost' | 'balance'
}

// 高级假设
export interface AdvancedAssumptions {
  inflation_rate: number
  wage_growth_rate: number
  expected_return: number
  life_expectancy: number
}

// 方案历史记录
export interface SavedScenario {
  id: string
  name: string
  created_at: string
  params: Partial<CalcState>
  results: StrategyResult[]
}

export interface CalcState {
  // 基础参数
  regionCode: string
  gender: string
  age: number
  baseSalary: number
  retirementAge: number
  strategy: StrategyType
  employmentType: string
  cumulativeMonths: number
  personalAccountBalance: number
  contributionIndex: number
  isTransitional: boolean
  priorYears: number
  birthDate: string | null

  // 扩展数据
  contributionHistory: ContributionRecord[]
  preferences: UserPreferences
  assumptions: AdvancedAssumptions
  savedScenarios: SavedScenario[]

  // 计算结果
  currentResult: StrategyResult | null
  allResults: StrategyResult[] | null
  loading: boolean

  // UI状态
  funnelStep: number
  showAdvanced: boolean
  completeness: number

  // 方法
  setParams: (params: Partial<CalcState>) => void
  setResult: (result: StrategyResult | null) => void
  setAllResults: (results: StrategyResult[] | null) => void
  setLoading: (loading: boolean) => void
  addContributionRecord: (record: ContributionRecord) => void
  updateContributionRecord: (id: string, record: Partial<ContributionRecord>) => void
  removeContributionRecord: (id: string) => void
  saveScenario: (name: string, results: StrategyResult[]) => void
  deleteScenario: (id: string) => void
  setFunnelStep: (step: number) => void
  setShowAdvanced: (show: boolean) => void
  reset: () => void
}

const defaultPreferences: UserPreferences = {
  target_monthly_pension: 0,
  monthly_budget: 0,
  risk_appetite: 'balanced',
  priority: 'balance',
}

const defaultAssumptions: AdvancedAssumptions = {
  inflation_rate: 0.03,
  wage_growth_rate: 0.05,
  expected_return: 0.065,
  life_expectancy: 85,
}

const initialState = {
  regionCode: '310000',
  gender: 'male',
  age: 32,
  baseSalary: 7384,
  retirementAge: 60,
  strategy: 'balanced' as StrategyType,
  employmentType: 'Flexible_Employment',
  cumulativeMonths: 0,
  personalAccountBalance: 0,
  contributionIndex: 1.0,
  isTransitional: false,
  priorYears: 0,
  birthDate: null,
  contributionHistory: [] as ContributionRecord[],
  preferences: defaultPreferences,
  assumptions: defaultAssumptions,
  savedScenarios: [] as SavedScenario[],
  currentResult: null as StrategyResult | null,
  allResults: null as StrategyResult[] | null,
  loading: false,
  funnelStep: 1,
  showAdvanced: false,
  completeness: 0.6,
}

export const useCalcStore = create<CalcState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setParams: (params) => set((state) => ({ ...state, ...params })),

      setResult: (result) => set({ currentResult: result }),

      setAllResults: (results) => set({ allResults: results }),

      setLoading: (loading) => set({ loading }),

      addContributionRecord: (record) => set((state) => ({
        contributionHistory: [...state.contributionHistory, record],
      })),

      updateContributionRecord: (id, record) => set((state) => ({
        contributionHistory: state.contributionHistory.map((r) => r.id === id ? { ...r, ...record } : r),
      })),

      removeContributionRecord: (id) => set((state) => ({
        contributionHistory: state.contributionHistory.filter((r) => r.id !== id),
      })),

      saveScenario: (name, results) => {
        const state = get()
        const newScenario: SavedScenario = {
          id: `scenario-${Date.now()}`,
          name,
          created_at: new Date().toISOString(),
          params: {
            regionCode: state.regionCode,
            gender: state.gender,
            age: state.age,
            baseSalary: state.baseSalary,
            retirementAge: state.retirementAge,
            strategy: state.strategy,
            cumulativeMonths: state.cumulativeMonths,
            personalAccountBalance: state.personalAccountBalance,
            contributionIndex: state.contributionIndex,
            isTransitional: state.isTransitional,
            priorYears: state.priorYears,
          },
          results,
        }
        set({ savedScenarios: [...state.savedScenarios, newScenario] })
      },

      deleteScenario: (id) => set((state) => ({
        savedScenarios: state.savedScenarios.filter((s) => s.id !== id),
      })),

      setFunnelStep: (step) => set({ funnelStep: step }),

      setShowAdvanced: (show) => set({ showAdvanced: show }),

      reset: () => set(initialState),
    }),
    {
      name: 'nsi-calc-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        savedScenarios: state.savedScenarios,
        contributionHistory: state.contributionHistory,
        preferences: state.preferences,
        assumptions: state.assumptions,
      }),
    }
  )
)
