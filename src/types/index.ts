export type UserRole = 'USER' | 'ADMIN' | 'TAX_EXPERT' | 'SUPPORT_AGENT';

export type TaxReturnStatus = 
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'DOCUMENTS_PENDING'
  | 'UNDER_REVIEW'
  | 'READY_TO_SUBMIT'
  | 'SUBMITTED';

export type NoticeStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'RESPONSE_PREPARED'
  | 'RESPONDED'
  | 'RESOLVED';

export type DocumentType =
  | 'PAN_CARD'
  | 'AADHAAR_CARD'
  | 'FORM_16'
  | 'SALARY_SLIP'
  | 'BANK_STATEMENT'
  | 'INVESTMENT_PROOF'
  | 'CAPITAL_GAINS_STATEMENT'
  | 'RENT_RECEIPT'
  | 'HOME_LOAN_CERTIFICATE'
  | 'PREVIOUS_ITR'
  | 'TAX_NOTICE'
  | 'OTHER';

export type DocumentStatus = 'REQUIRED' | 'UPLOADED' | 'VERIFIED' | 'REJECTED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type SubscriptionPlanId = 'FREE' | 'BASIC' | 'PREMIUM' | 'BUSINESS';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  isVerified: boolean;
}

export interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  pan: string;
  aadhaar?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  assessmentYear: string;
  financialYear: string;
  residentialStatus: 'RESIDENT' | 'NRI' | 'RNOR';
  employmentType: 'SALARIED' | 'BUSINESS' | 'PROFESSIONAL' | 'FREELANCER' | 'RETIRED';
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: 'SAVINGS' | 'CURRENT';
  profileCompletion: number;
}

export interface SalaryIncome {
  employerName: string;
  grossSalary: number;
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  lta: number;
  standardDeduction: number;
  professionalTax: number;
  tdsDeducted: number;
}

export interface OtherIncome {
  savingsInterest: number;
  fdInterest: number;
  dividendIncome: number;
  rentalIncome: number;
  homeLoanInterestLetOut: number;
  otherSources: number;
}

export interface BusinessIncome {
  businessName: string;
  businessType: 'PRESUMPTIVE_44AD' | 'PRESUMPTIVE_44ADA' | 'REGULAR_BUSINESS';
  grossTurnover: number;
  grossReceipts: number;
  declaredProfit: number;
  expenses: number;
  netProfit: number;
}

export interface CapitalGainItem {
  id: string;
  assetType: 'EQUITY_LISTED' | 'EQUITY_MF' | 'DEBT_MF' | 'REAL_ESTATE' | 'CRYPTO' | 'GOLD';
  buyDate: string;
  buyValue: number;
  sellDate: string;
  sellValue: number;
  transferExpenses: number;
  gainType: 'STCG' | 'LTCG';
  gainAmount: number;
}

export interface ChapterVIA_Deductions {
  sec80C: number; // Max 1,50,000 (EPF, PPF, ELSS, LIC, Tuition)
  sec80CCC: number; // Pension funds
  sec80CCD1: number; // Employee NPS
  sec80CCD1B: number; // Additional NPS (Max 50,000)
  sec80CCD2: number; // Employer NPS
  sec80D_Self: number; // Health insurance self/family (Max 25,000 / 50,000)
  sec80D_Parents: number; // Health insurance parents (Max 25,000 / 50,000)
  sec80E: number; // Education loan interest
  sec80EEA: number; // First home loan interest (Max 1,50,000)
  sec80G: number; // Donations
  sec80TTA: number; // Savings interest (Max 10,000 for regular)
  sec80TTB: number; // Senior citizen interest (Max 50,000)
  sec24b_HomeLoan: number; // Self-occupied home loan interest (Max 2,00,000)
  otherDeductions: number;
}

export interface TaxRegimeCalculation {
  regime: 'OLD' | 'NEW';
  grossTotalIncome: number;
  totalExemptions: number;
  totalDeductions: number;
  taxableIncome: number;
  taxSlabBreakdown: { slab: string; rate: string; tax: number }[];
  basicTax: number;
  rebate87A: number;
  surcharge: number;
  healthAndEducationCess: number;
  totalTaxLiability: number;
  tdsPaid: number;
  advanceTaxPaid: number;
  selfAssessmentTax: number;
  refundOrPayable: 'REFUND' | 'PAYABLE';
  balanceAmount: number;
  recommendationNote: string;
}

export interface ITRFilingRecord {
  id: string;
  userId: string;
  assessmentYear: string;
  financialYear: string;
  itrType: 'ITR-1' | 'ITR-2' | 'ITR-3' | 'ITR-4';
  status: TaxReturnStatus;
  progressPercent: number;
  selectedRegime: 'OLD' | 'NEW';
  salaryIncome: SalaryIncome;
  otherIncome: OtherIncome;
  businessIncome: BusinessIncome;
  capitalGains: CapitalGainItem[];
  deductions: ChapterVIA_Deductions;
  calculatedTaxOld: TaxRegimeCalculation;
  calculatedTaxNew: TaxRegimeCalculation;
  assignedExpertId?: string;
  assignedExpertName?: string;
  expertReviewNotes?: string;
  expertApproved: boolean;
  documentsRequired: string[];
  documentsAttached: string[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  ackNumber?: string;
}

export interface TaxNoticeItem {
  id: string;
  userId: string;
  noticeType: 'SECTION_143_1' | 'SECTION_139_9_DEFECTIVE' | 'SECTION_148_REOPENING' | 'SECTION_245_ADJUSTMENT' | 'OUTSTANDING_DEMAND';
  assessmentYear: string;
  noticeDate: string;
  dinNumber: string;
  demandAmount: number;
  status: NoticeStatus;
  documentUrl: string;
  fileName: string;
  assignedExpertName?: string;
  expertAdvice?: string;
  timeline: {
    title: string;
    description: string;
    timestamp: string;
    completed: boolean;
  }[];
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  userId: string;
  name: string;
  type: DocumentType;
  fileSize: string;
  uploadDate: string;
  status: DocumentStatus;
  fileUrl?: string;
  assessmentYear: string;
  verifiedBy?: string;
  rejectionReason?: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  category: 'TAX_FILING' | 'COMPLIANCE' | 'BUSINESS' | 'ADVISORY';
  shortDesc: string;
  fullDesc: string;
  icon: string;
  badge?: string;
  pricing: {
    amount: number;
    originalPrice: number;
    period: string;
    isPopular?: boolean;
  };
  benefits: string[];
  processSteps: { step: number; title: string; desc: string }[];
  requiredDocs: string[];
  faqs: { question: string; answer: string }[];
  ctaText: string;
  ctaLink: string;
}

export interface InvestmentItem {
  id: string;
  userId: string;
  category: 'ELSS' | 'PPF' | 'NPS' | 'EPF' | 'MUTUAL_FUNDS' | 'STOCKS' | 'FD' | 'SUKANYA' | 'LIC';
  name: string;
  investedAmount: number;
  currentValue: number;
  taxSection: string;
  taxSavingAchieved: number;
  growthPercent: number;
  frequency: 'MONTHLY_SIP' | 'ONE_TIME' | 'ANNUAL';
  startDate: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  readTime: string;
  publishedDate: string;
  featuredImage: string;
  tags: string[];
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  subject: string;
  category: 'ITR' | 'GST' | 'TDS' | 'PAYMENTS' | 'ACCOUNT' | 'DOCUMENTS' | 'SUBSCRIPTION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';
  messages: {
    sender: 'USER' | 'SUPPORT_AGENT' | 'SYSTEM';
    senderName: string;
    message: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ITR_REMINDER' | 'DOCUMENT_REQUIRED' | 'TAX_NOTICE' | 'PAYMENT' | 'SUBSCRIPTION' | 'SUPPORT' | 'SYSTEM';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  isPopular?: boolean;
  targetAudience: string;
}
