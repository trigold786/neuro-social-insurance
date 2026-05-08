package models

type RegionRateData struct {
	RegionCode          string
	RegionName          string
	LocalAvgSalary      float64
	MinContributionBase float64
	MaxContributionBase float64
	EmployerPensionRate float64
	PersonalPensionRate float64
	EmployerMedicalRate float64
	PersonalMedicalRate float64
	UnemploymentRate    float64
	WorkInjuryRate      float64
	MaternityRate       float64
	HousingFundRate     float64
	TransitionalCoeff   float64
}

var regionDataMap = map[string]RegionRateData{
	// Tier 1 Cities
	"110000": {
		RegionCode: "110000", RegionName: "Beijing",
		LocalAvgSalary: 13930, MinContributionBase: 8358, MaxContributionBase: 41790,
		EmployerPensionRate: 0.16, PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.098, PersonalMedicalRate: 0.02,
		UnemploymentRate: 0.005, WorkInjuryRate: 0.004, MaternityRate: 0.008,
		HousingFundRate: 0.12, TransitionalCoeff: 1.0,
	},
	"310000": {
		RegionCode: "310000", RegionName: "Shanghai",
		LocalAvgSalary: 13486, MinContributionBase: 8092, MaxContributionBase: 40458,
		EmployerPensionRate: 0.16, PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.098, PersonalMedicalRate: 0.02,
		UnemploymentRate: 0.005, WorkInjuryRate: 0.004, MaternityRate: 0.008,
		HousingFundRate: 0.12, TransitionalCoeff: 1.2,
	},
	"440100": {
		RegionCode: "440100", RegionName: "Guangzhou",
		LocalAvgSalary: 13194, MinContributionBase: 7917, MaxContributionBase: 39582,
		EmployerPensionRate: 0.16, PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.055, PersonalMedicalRate: 0.02,
		UnemploymentRate: 0.005, WorkInjuryRate: 0.004, MaternityRate: 0.008,
		HousingFundRate: 0.12, TransitionalCoeff: 1.2,
	},
	"440300": {
		RegionCode: "440300", RegionName: "Shenzhen",
		LocalAvgSalary: 13730, MinContributionBase: 8238, MaxContributionBase: 41190,
		EmployerPensionRate: 0.16, PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.052, PersonalMedicalRate: 0.02,
		UnemploymentRate: 0.005, WorkInjuryRate: 0.004, MaternityRate: 0.008,
		HousingFundRate: 0.12, TransitionalCoeff: 1.2,
	},
	// Tier 2 Cities
	"330100": {
		RegionCode: "330100", RegionName: "Hangzhou",
		LocalAvgSalary: 11250, MinContributionBase: 6750, MaxContributionBase: 33750,
		EmployerPensionRate: 0.14, PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.092, PersonalMedicalRate: 0.02,
		UnemploymentRate: 0.005, WorkInjuryRate: 0.004, MaternityRate: 0.008,
		HousingFundRate: 0.12, TransitionalCoeff: 1.3,
	},
	"320100": {
		RegionCode: "320100", RegionName: "Nanjing",
		LocalAvgSalary: 12100, MinContributionBase: 7260, MaxContributionBase: 36300,
		EmployerPensionRate: 0.16, PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.085, PersonalMedicalRate: 0.02,
		UnemploymentRate: 0.005, WorkInjuryRate: 0.004, MaternityRate: 0.008,
		HousingFundRate: 0.12, TransitionalCoeff: 1.2,
	},
	"510100": {
		RegionCode: "510100", RegionName: "Chengdu",
		LocalAvgSalary: 9687, MinContributionBase: 5813, MaxContributionBase: 29061,
		EmployerPensionRate: 0.16, PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.075, PersonalMedicalRate: 0.02,
		UnemploymentRate: 0.005, WorkInjuryRate: 0.004, MaternityRate: 0.008,
		HousingFundRate: 0.12, TransitionalCoeff: 1.3,
	},
	"420100": {
		RegionCode: "420100", RegionName: "Wuhan",
		LocalAvgSalary: 10395, MinContributionBase: 6237, MaxContributionBase: 31185,
		EmployerPensionRate: 0.16, PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.08, PersonalMedicalRate: 0.02,
		UnemploymentRate: 0.005, WorkInjuryRate: 0.004, MaternityRate: 0.008,
		HousingFundRate: 0.12, TransitionalCoeff: 1.3,
	},
	"500000": {
		RegionCode: "500000", RegionName: "Chongqing",
		LocalAvgSalary: 9224, MinContributionBase: 5535, MaxContributionBase: 27672,
		EmployerPensionRate: 0.16, PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.075, PersonalMedicalRate: 0.02,
		UnemploymentRate: 0.005, WorkInjuryRate: 0.004, MaternityRate: 0.008,
		HousingFundRate: 0.12, TransitionalCoeff: 1.4,
	},
	"370100": {
		RegionCode: "370100", RegionName: "Jinan",
		LocalAvgSalary: 9812, MinContributionBase: 5888, MaxContributionBase: 29436,
		EmployerPensionRate: 0.16, PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.075, PersonalMedicalRate: 0.02,
		UnemploymentRate: 0.005, WorkInjuryRate: 0.004, MaternityRate: 0.008,
		HousingFundRate: 0.12, TransitionalCoeff: 1.3,
	},
	"330200": {
		RegionCode: "330200", RegionName: "Ningbo",
		LocalAvgSalary: 10580, MinContributionBase: 6348, MaxContributionBase: 31740,
		EmployerPensionRate: 0.14, PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.075, PersonalMedicalRate: 0.02,
		UnemploymentRate: 0.005, WorkInjuryRate: 0.004, MaternityRate: 0.008,
		HousingFundRate: 0.12, TransitionalCoeff: 1.4,
	},
	// Additional 10 cities for V1.3.0 Phase2
	"610100": {
		RegionCode: "610100", RegionName: "Xian",
		LocalAvgSalary: 8724, MinContributionBase: 5235, MaxContributionBase: 26172,
		EmployerPensionRate: 0.16, PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.07, PersonalMedicalRate: 0.02,
		UnemploymentRate: 0.005, WorkInjuryRate: 0.004, MaternityRate: 0.008,
		HousingFundRate: 0.12, TransitionalCoeff: 1.3,
	},
	"120000": {
		RegionCode: "120000", RegionName: "Tianjin",
		LocalAvgSalary: 10240, MinContributionBase: 6144, MaxContributionBase: 30720,
		EmployerPensionRate: 0.16, PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.095, PersonalMedicalRate: 0.02,
		UnemploymentRate: 0.005, WorkInjuryRate: 0.004, MaternityRate: 0.008,
		HousingFundRate: 0.12, TransitionalCoeff: 1.2,
	},
	"320500": {
		RegionCode: "320500", RegionName: "Suzhou",
		LocalAvgSalary: 11580, MinContributionBase: 6948, MaxContributionBase: 34740,
		EmployerPensionRate: 0.16, PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.08, PersonalMedicalRate: 0.02,
		UnemploymentRate: 0.005, WorkInjuryRate: 0.004, MaternityRate: 0.008,
		HousingFundRate: 0.12, TransitionalCoeff: 1.2,
	},
	"410100": {
		RegionCode: "410100", RegionName: "Zhengzhou",
		LocalAvgSalary: 7895, MinContributionBase: 4737, MaxContributionBase: 23685,
		EmployerPensionRate: 0.16, PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.08, PersonalMedicalRate: 0.02,
		UnemploymentRate: 0.005, WorkInjuryRate: 0.004, MaternityRate: 0.008,
		HousingFundRate: 0.12, TransitionalCoeff: 1.3,
	},
	"430100": {
		RegionCode: "430100", RegionName: "Changsha",
		LocalAvgSalary: 8350, MinContributionBase: 5010, MaxContributionBase: 25050,
		EmployerPensionRate: 0.16, PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.08, PersonalMedicalRate: 0.02,
		UnemploymentRate: 0.005, WorkInjuryRate: 0.004, MaternityRate: 0.008,
		HousingFundRate: 0.12, TransitionalCoeff: 1.3,
	},
	"370200": {
		RegionCode: "370200", RegionName: "Qingdao",
		LocalAvgSalary: 9168, MinContributionBase: 5501, MaxContributionBase: 27504,
		EmployerPensionRate: 0.16, PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.08, PersonalMedicalRate: 0.02,
		UnemploymentRate: 0.005, WorkInjuryRate: 0.004, MaternityRate: 0.008,
		HousingFundRate: 0.12, TransitionalCoeff: 1.3,
	},
	"441900": {
		RegionCode: "441900", RegionName: "Dongguan",
		LocalAvgSalary: 8500, MinContributionBase: 5100, MaxContributionBase: 25500,
		EmployerPensionRate: 0.14, PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.065, PersonalMedicalRate: 0.02,
		UnemploymentRate: 0.005, WorkInjuryRate: 0.004, MaternityRate: 0.008,
		HousingFundRate: 0.12, TransitionalCoeff: 1.2,
	},
	"320200": {
		RegionCode: "320200", RegionName: "Wuxi",
		LocalAvgSalary: 9680, MinContributionBase: 5808, MaxContributionBase: 29040,
		EmployerPensionRate: 0.16, PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.08, PersonalMedicalRate: 0.02,
		UnemploymentRate: 0.005, WorkInjuryRate: 0.004, MaternityRate: 0.008,
		HousingFundRate: 0.12, TransitionalCoeff: 1.2,
	},
	"350200": {
		RegionCode: "350200", RegionName: "Xiamen",
		LocalAvgSalary: 8920, MinContributionBase: 5352, MaxContributionBase: 26760,
		EmployerPensionRate: 0.16, PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.07, PersonalMedicalRate: 0.02,
		UnemploymentRate: 0.005, WorkInjuryRate: 0.004, MaternityRate: 0.008,
		HousingFundRate: 0.12, TransitionalCoeff: 1.3,
	},
}

func GetRegionRateData(regionCode string) RegionRateData {
	if data, ok := regionDataMap[regionCode]; ok {
		return data
	}
	return RegionRateData{
		RegionCode:          regionCode,
		RegionName:          "Default",
		LocalAvgSalary:      10000,
		MinContributionBase: 6000,
		MaxContributionBase: 30000,
		EmployerPensionRate: 0.16,
		PersonalPensionRate: 0.08,
		EmployerMedicalRate: 0.08,
		PersonalMedicalRate: 0.02,
		UnemploymentRate:    0.005,
		WorkInjuryRate:      0.004,
		MaternityRate:       0.008,
		HousingFundRate:     0.12,
		TransitionalCoeff:   1.2,
	}
}
