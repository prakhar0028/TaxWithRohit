import { 
  SalaryIncome, 
  OtherIncome, 
  BusinessIncome, 
  CapitalGainItem, 
  ChapterVIA_Deductions, 
  TaxRegimeCalculation 
} from '../types';

export function calculateOldRegimeTax(
  salary: SalaryIncome,
  other: OtherIncome,
  business: BusinessIncome,
  capitalGains: CapitalGainItem[],
  deductions: ChapterVIA_Deductions
): TaxRegimeCalculation {
  // Gross Salary
  const grossSalary = salary.grossSalary || (salary.basicSalary + salary.hra + salary.specialAllowance + salary.lta);
  const salaryStandardDeduction = grossSalary > 0 ? Math.min(50000, grossSalary) : 0;
  const professionalTax = salary.professionalTax || 0;
  
  // HRA Exemption estimation for old regime
  const rentExemption = Math.min(salary.hra || 0, salary.basicSalary ? salary.basicSalary * 0.4 : 0);
  
  const netSalaryIncome = Math.max(0, grossSalary - salaryStandardDeduction - professionalTax - rentExemption);
  
  // House Property (Self-occupied home loan interest loss max 2L)
  const homeLoanLoss = Math.min(200000, deductions.sec24b_HomeLoan || 0);
  const rentalNet = Math.max(-200000, (other.rentalIncome || 0) - (other.homeLoanInterestLetOut || 0) - homeLoanLoss);
  
  // Other Sources
  const otherSourcesIncome = (other.savingsInterest || 0) + (other.fdInterest || 0) + (other.dividendIncome || 0) + (other.otherSources || 0);
  
  // Business Income
  const businessProfit = business.declaredProfit || Math.max(0, business.grossTurnover - business.expenses) || business.netProfit || 0;
  
  // Capital Gains
  const totalCapitalGains = capitalGains.reduce((sum, item) => sum + Math.max(0, item.gainAmount || (item.sellValue - item.buyValue - (item.transferExpenses || 0))), 0);
  
  const grossTotalIncome = Math.max(0, netSalaryIncome + rentalNet + otherSourcesIncome + businessProfit + totalCapitalGains);
  
  // Calculate Eligible Chapter VI-A Deductions
  const sec80C_Total = Math.min(150000, (deductions.sec80C || 0) + (deductions.sec80CCC || 0) + (deductions.sec80CCD1 || 0));
  const sec80CCD1B_Total = Math.min(50000, deductions.sec80CCD1B || 0);
  const sec80D_Total = Math.min(75000, (deductions.sec80D_Self || 0) + (deductions.sec80D_Parents || 0));
  const sec80TTA_Total = Math.min(10000, Math.min(other.savingsInterest || 0, deductions.sec80TTA || 10000));
  const sec80E_Total = deductions.sec80E || 0;
  const sec80G_Total = deductions.sec80G || 0;
  const otherDed = deductions.otherDeductions || 0;
  
  const totalDeductions = sec80C_Total + sec80CCD1B_Total + sec80D_Total + sec80TTA_Total + sec80E_Total + sec80G_Total + otherDed;
  const taxableIncome = Math.max(0, grossTotalIncome - totalDeductions);
  
  // Slabs for Old Regime:
  // 0 - 2.5L: 0%
  // 2.5L - 5L: 5%
  // 5L - 10L: 20%
  // > 10L: 30%
  let basicTax = 0;
  const slabBreakdown: { slab: string; rate: string; tax: number }[] = [];
  
  if (taxableIncome > 1000000) {
    const taxAbove10L = (taxableIncome - 1000000) * 0.30;
    basicTax += taxAbove10L + 100000 + 12500;
    slabBreakdown.push({ slab: 'Above ₹10,00,000', rate: '30%', tax: taxAbove10L });
    slabBreakdown.push({ slab: '₹5,00,001 - ₹10,00,000', rate: '20%', tax: 100000 });
    slabBreakdown.push({ slab: '₹2,50,001 - ₹5,00,000', rate: '5%', tax: 12500 });
    slabBreakdown.push({ slab: 'Up to ₹2,50,000', rate: '0%', tax: 0 });
  } else if (taxableIncome > 500000) {
    const tax5to10L = (taxableIncome - 500000) * 0.20;
    basicTax += tax5to10L + 12500;
    slabBreakdown.push({ slab: '₹5,00,001 - ₹10,00,000', rate: '20%', tax: tax5to10L });
    slabBreakdown.push({ slab: '₹2,50,001 - ₹5,00,000', rate: '5%', tax: 12500 });
    slabBreakdown.push({ slab: 'Up to ₹2,50,000', rate: '0%', tax: 0 });
  } else if (taxableIncome > 250000) {
    const tax25to5L = (taxableIncome - 250000) * 0.05;
    basicTax += tax25to5L;
    slabBreakdown.push({ slab: '₹2,50,001 - ₹5,00,000', rate: '5%', tax: tax25to5L });
    slabBreakdown.push({ slab: 'Up to ₹2,50,000', rate: '0%', tax: 0 });
  } else {
    slabBreakdown.push({ slab: 'Up to ₹2,50,000', rate: '0%', tax: 0 });
  }
  
  // Rebate u/s 87A (Up to ₹12,500 if income <= 5L)
  let rebate87A = 0;
  if (taxableIncome <= 500000) {
    rebate87A = Math.min(basicTax, 12500);
    basicTax = Math.max(0, basicTax - rebate87A);
  }
  
  // Surcharge
  let surcharge = 0;
  if (taxableIncome > 5000000 && taxableIncome <= 10000000) {
    surcharge = basicTax * 0.10;
  } else if (taxableIncome > 10000000) {
    surcharge = basicTax * 0.15;
  }
  
  // Health and Education Cess (4%)
  const healthAndEducationCess = Math.round((basicTax + surcharge) * 0.04);
  const totalTaxLiability = Math.round(basicTax + surcharge + healthAndEducationCess);
  
  const tdsPaid = salary.tdsDeducted || 0;
  const advanceTaxPaid = 0;
  const selfAssessmentTax = 0;
  const netPayable = totalTaxLiability - (tdsPaid + advanceTaxPaid + selfAssessmentTax);
  
  return {
    regime: 'OLD',
    grossTotalIncome,
    totalExemptions: salaryStandardDeduction + professionalTax + rentExemption,
    totalDeductions,
    taxableIncome,
    taxSlabBreakdown: slabBreakdown,
    basicTax,
    rebate87A,
    surcharge,
    healthAndEducationCess,
    totalTaxLiability,
    tdsPaid,
    advanceTaxPaid,
    selfAssessmentTax,
    refundOrPayable: netPayable < 0 ? 'REFUND' : 'PAYABLE',
    balanceAmount: Math.abs(netPayable),
    recommendationNote: 'Old regime allows major deductions (80C, 80D, HRA, Home Loan Interest).',
  };
}

export function calculateNewRegimeTax(
  salary: SalaryIncome,
  other: OtherIncome,
  business: BusinessIncome,
  capitalGains: CapitalGainItem[],
  deductions: ChapterVIA_Deductions
): TaxRegimeCalculation {
  // New Regime for AY 2025-26: Standard Deduction is ₹75,000 for salaried
  const grossSalary = salary.grossSalary || (salary.basicSalary + salary.hra + salary.specialAllowance + salary.lta);
  const salaryStandardDeduction = grossSalary > 0 ? Math.min(75000, grossSalary) : 0;
  
  const netSalaryIncome = Math.max(0, grossSalary - salaryStandardDeduction);
  
  // House Property in New Regime (No loss from self-occupied allowed)
  const rentalNet = Math.max(0, (other.rentalIncome || 0) - (other.homeLoanInterestLetOut || 0));
  
  // Other Sources
  const otherSourcesIncome = (other.savingsInterest || 0) + (other.fdInterest || 0) + (other.dividendIncome || 0) + (other.otherSources || 0);
  
  // Business Income
  const businessProfit = business.declaredProfit || Math.max(0, business.grossTurnover - business.expenses) || business.netProfit || 0;
  
  // Capital Gains
  const totalCapitalGains = capitalGains.reduce((sum, item) => sum + Math.max(0, item.gainAmount || (item.sellValue - item.buyValue - (item.transferExpenses || 0))), 0);
  
  const grossTotalIncome = Math.max(0, netSalaryIncome + rentalNet + otherSourcesIncome + businessProfit + totalCapitalGains);
  
  // In New Regime, only Employer NPS 80CCD(2) is deductible
  const employerNPS = deductions.sec80CCD2 || 0;
  const totalDeductions = employerNPS;
  
  const taxableIncome = Math.max(0, grossTotalIncome - totalDeductions);
  
  // New Regime Slabs (AY 2025-26 / FY 2024-25):
  // 0 - 3,00,000: 0%
  // 3,00,001 - 7,00,000: 5%
  // 7,00,001 - 10,00,000: 10%
  // 10,00,001 - 12,00,000: 15%
  // 12,00,001 - 15,00,000: 20%
  // > 15,00,000: 30%
  let basicTax = 0;
  const slabBreakdown: { slab: string; rate: string; tax: number }[] = [];
  
  if (taxableIncome > 1500000) {
    const taxAbove15L = (taxableIncome - 1500000) * 0.30;
    basicTax += taxAbove15L + 60000 + 30000 + 30000 + 20000;
    slabBreakdown.push({ slab: 'Above ₹15,00,000', rate: '30%', tax: taxAbove15L });
    slabBreakdown.push({ slab: '₹12,00,001 - ₹15,00,000', rate: '20%', tax: 60000 });
    slabBreakdown.push({ slab: '₹10,00,001 - ₹12,00,000', rate: '15%', tax: 30000 });
    slabBreakdown.push({ slab: '₹7,00,001 - ₹10,00,000', rate: '10%', tax: 30000 });
    slabBreakdown.push({ slab: '₹3,00,001 - ₹7,00,000', rate: '5%', tax: 20000 });
    slabBreakdown.push({ slab: 'Up to ₹3,00,000', rate: '0%', tax: 0 });
  } else if (taxableIncome > 1200000) {
    const tax12to15L = (taxableIncome - 1200000) * 0.20;
    basicTax += tax12to15L + 30000 + 30000 + 20000;
    slabBreakdown.push({ slab: '₹12,00,001 - ₹15,00,000', rate: '20%', tax: tax12to15L });
    slabBreakdown.push({ slab: '₹10,00,001 - ₹12,00,000', rate: '15%', tax: 30000 });
    slabBreakdown.push({ slab: '₹7,00,001 - ₹10,00,000', rate: '10%', tax: 30000 });
    slabBreakdown.push({ slab: '₹3,00,001 - ₹7,00,000', rate: '5%', tax: 20000 });
    slabBreakdown.push({ slab: 'Up to ₹3,00,000', rate: '0%', tax: 0 });
  } else if (taxableIncome > 1000000) {
    const tax10to12L = (taxableIncome - 1000000) * 0.15;
    basicTax += tax10to12L + 30000 + 20000;
    slabBreakdown.push({ slab: '₹10,00,001 - ₹12,00,000', rate: '15%', tax: tax10to12L });
    slabBreakdown.push({ slab: '₹7,00,001 - ₹10,00,000', rate: '10%', tax: 30000 });
    slabBreakdown.push({ slab: '₹3,00,001 - ₹7,00,000', rate: '5%', tax: 20000 });
    slabBreakdown.push({ slab: 'Up to ₹3,00,000', rate: '0%', tax: 0 });
  } else if (taxableIncome > 700000) {
    const tax7to10L = (taxableIncome - 700000) * 0.10;
    basicTax += tax7to10L + 20000;
    slabBreakdown.push({ slab: '₹7,00,001 - ₹10,00,000', rate: '10%', tax: tax7to10L });
    slabBreakdown.push({ slab: '₹3,00,001 - ₹7,00,000', rate: '5%', tax: 20000 });
    slabBreakdown.push({ slab: 'Up to ₹3,00,000', rate: '0%', tax: 0 });
  } else if (taxableIncome > 300000) {
    const tax3to7L = (taxableIncome - 300000) * 0.05;
    basicTax += tax3to7L;
    slabBreakdown.push({ slab: '₹3,00,001 - ₹7,00,000', rate: '5%', tax: tax3to7L });
    slabBreakdown.push({ slab: 'Up to ₹3,00,000', rate: '0%', tax: 0 });
  } else {
    slabBreakdown.push({ slab: 'Up to ₹3,00,000', rate: '0%', tax: 0 });
  }
  
  // Rebate u/s 87A for New Regime (Up to ₹25,000 if taxable income <= ₹7,00,000)
  let rebate87A = 0;
  if (taxableIncome <= 700000) {
    rebate87A = Math.min(basicTax, 25000);
    basicTax = Math.max(0, basicTax - rebate87A);
  }
  
  // Surcharge (capped at 25% under new regime)
  let surcharge = 0;
  if (taxableIncome > 5000000 && taxableIncome <= 10000000) {
    surcharge = basicTax * 0.10;
  } else if (taxableIncome > 10000000 && taxableIncome <= 20000000) {
    surcharge = basicTax * 0.15;
  } else if (taxableIncome > 20000000) {
    surcharge = basicTax * 0.25;
  }
  
  // Health and Education Cess (4%)
  const healthAndEducationCess = Math.round((basicTax + surcharge) * 0.04);
  const totalTaxLiability = Math.round(basicTax + surcharge + healthAndEducationCess);
  
  const tdsPaid = salary.tdsDeducted || 0;
  const advanceTaxPaid = 0;
  const selfAssessmentTax = 0;
  const netPayable = totalTaxLiability - (tdsPaid + advanceTaxPaid + selfAssessmentTax);
  
  return {
    regime: 'NEW',
    grossTotalIncome,
    totalExemptions: salaryStandardDeduction,
    totalDeductions,
    taxableIncome,
    taxSlabBreakdown: slabBreakdown,
    basicTax,
    rebate87A,
    surcharge,
    healthAndEducationCess,
    totalTaxLiability,
    tdsPaid,
    advanceTaxPaid,
    selfAssessmentTax,
    refundOrPayable: netPayable < 0 ? 'REFUND' : 'PAYABLE',
    balanceAmount: Math.abs(netPayable),
    recommendationNote: 'New regime offers lower slab tax rates and higher ₹75,000 standard deduction.',
  };
}

export function calculateHRAExemption(
  basicSalary: number,
  hraReceived: number,
  rentPaid: number,
  isMetro: boolean
): number {
  if (hraReceived <= 0 || rentPaid <= 0 || basicSalary <= 0) return 0;
  const metroFactor = isMetro ? 0.5 : 0.4;
  const cond1 = hraReceived;
  const cond2 = Math.max(0, rentPaid - (basicSalary * 0.1));
  const cond3 = basicSalary * metroFactor;
  return Math.min(cond1, cond2, cond3);
}

export function compareTaxRegimes(
  salary: SalaryIncome,
  other: OtherIncome,
  business: BusinessIncome,
  capitalGains: CapitalGainItem[],
  deductions: ChapterVIA_Deductions
) {
  const oldRegime = calculateOldRegimeTax(salary, other, business, capitalGains, deductions);
  const newRegime = calculateNewRegimeTax(salary, other, business, capitalGains, deductions);
  
  const diff = oldRegime.totalTaxLiability - newRegime.totalTaxLiability;
  const recommendedRegime: 'OLD' | 'NEW' = diff > 0 ? 'NEW' : 'OLD';
  const taxSaved = Math.abs(diff);
  
  return {
    oldRegime,
    newRegime,
    recommendedRegime,
    taxSaved,
    summary: diff > 0 
      ? `The New Tax Regime saves you ₹${taxSaved.toLocaleString('en-IN')} in taxes.` 
      : diff < 0 
      ? `The Old Tax Regime saves you ₹${taxSaved.toLocaleString('en-IN')} due to high deductions claimed.`
      : 'Both tax regimes yield the exact same tax liability.',
  };
}

