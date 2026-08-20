import { 
  User, 
  UserProfile, 
  ITRFilingRecord, 
  TaxNoticeItem, 
  DocumentItem, 
  ServiceItem, 
  InvestmentItem, 
  BlogPost, 
  SupportTicket, 
  NotificationItem, 
  SubscriptionPlanId,
  TaxReturnStatus
} from '../types';
import { 
  SEED_USERS, 
  SEED_PROFILE, 
  SEED_ITR, 
  SEED_NOTICES, 
  SEED_DOCUMENTS, 
  SEED_SERVICES, 
  SEED_INVESTMENTS, 
  SEED_BLOGS, 
  SEED_NOTIFICATIONS, 
  SEED_SUPPORT_TICKETS 
} from '../config/seedData';
import { compareTaxRegimes } from '../services/taxEngine';

class DatabaseStore {
  private users: Map<string, User> = new Map();
  private profiles: Map<string, UserProfile> = new Map();
  private itrs: Map<string, ITRFilingRecord> = new Map();
  private notices: Map<string, TaxNoticeItem> = new Map();
  private documents: Map<string, DocumentItem> = new Map();
  private services: Map<string, ServiceItem> = new Map();
  private investments: Map<string, InvestmentItem> = new Map();
  private blogs: Map<string, BlogPost> = new Map();
  private notifications: Map<string, NotificationItem> = new Map();
  private tickets: Map<string, SupportTicket> = new Map();
  private userSubscriptions: Map<string, { planId: SubscriptionPlanId; expiresAt: string }> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    SEED_USERS.forEach(u => this.users.set(u.id, { ...u }));
    this.profiles.set(SEED_PROFILE.userId, { ...SEED_PROFILE });
    this.itrs.set(SEED_ITR.id, { ...SEED_ITR });
    SEED_NOTICES.forEach(n => this.notices.set(n.id, { ...n }));
    SEED_DOCUMENTS.forEach(d => this.documents.set(d.id, { ...d }));
    SEED_SERVICES.forEach(s => this.services.set(s.id, { ...s }));
    SEED_INVESTMENTS.forEach(i => this.investments.set(i.id, { ...i }));
    SEED_BLOGS.forEach(b => this.blogs.set(b.id, { ...b }));
    SEED_NOTIFICATIONS.forEach(n => this.notifications.set(n.id, { ...n }));
    SEED_SUPPORT_TICKETS.forEach(t => this.tickets.set(t.id, { ...t }));
    this.userSubscriptions.set('user_demo_101', { planId: 'PREMIUM', expiresAt: '2026-06-30' });
  }

  // --- Users & Profiles ---
  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByPhone(phone: string): User | undefined {
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    return Array.from(this.users.values()).find(u => u.phone.replace(/[^0-9]/g, '').slice(-10) === cleanPhone);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(phone: string, email?: string, name?: string, role: User['role'] = 'USER'): User {
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newUser: User = {
      id,
      name: name || `Taxpayer ${cleanPhone.slice(-4)}`,
      email: email || `user_${cleanPhone}@taxwithrohit.in`,
      phone: cleanPhone,
      role,
      createdAt: new Date().toISOString(),
      isVerified: true,
    };
    this.users.set(id, newUser);

    // Auto create default empty profile
    const defaultProfile: UserProfile = {
      userId: id,
      fullName: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      dob: '1995-01-01',
      gender: 'MALE',
      pan: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      assessmentYear: '2025-26',
      financialYear: '2024-25',
      residentialStatus: 'RESIDENT',
      employmentType: 'SALARIED',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountType: 'SAVINGS',
      profileCompletion: 40,
    };
    this.profiles.set(id, defaultProfile);

    return newUser;
  }

  getProfile(userId: string): UserProfile | undefined {
    return this.profiles.get(userId);
  }

  updateProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
    const current = this.profiles.get(userId) || {
      userId,
      fullName: 'Taxpayer',
      email: '',
      phone: '',
      dob: '1995-01-01',
      gender: 'MALE',
      pan: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      assessmentYear: '2025-26',
      financialYear: '2024-25',
      residentialStatus: 'RESIDENT',
      employmentType: 'SALARIED',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountType: 'SAVINGS',
      profileCompletion: 50,
    };

    const updated = { ...current, ...updates };
    
    // Calculate profile completion score
    let score = 0;
    if (updated.fullName) score += 15;
    if (updated.email) score += 15;
    if (updated.phone) score += 15;
    if (updated.pan) score += 20;
    if (updated.address) score += 15;
    if (updated.bankName && updated.accountNumber) score += 20;
    updated.profileCompletion = Math.min(100, score);

    this.profiles.set(userId, updated);
    return updated;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // --- ITR Records ---
  getITRByUser(userId: string, assessmentYear = '2025-26'): ITRFilingRecord {
    let record = Array.from(this.itrs.values()).find(
      r => r.userId === userId && r.assessmentYear === assessmentYear
    );

    if (!record) {
      // Create fresh default ITR record for this user
      const id = `itr_${Date.now()}_${userId.slice(-4)}`;
      const emptySalary = { employerName: '', grossSalary: 0, basicSalary: 0, hra: 0, specialAllowance: 0, lta: 0, standardDeduction: 75000, professionalTax: 0, tdsDeducted: 0 };
      const emptyOther = { savingsInterest: 0, fdInterest: 0, dividendIncome: 0, rentalIncome: 0, homeLoanInterestLetOut: 0, otherSources: 0 };
      const emptyBusiness = { businessName: '', businessType: 'PRESUMPTIVE_44AD' as const, grossTurnover: 0, grossReceipts: 0, declaredProfit: 0, expenses: 0, netProfit: 0 };
      const emptyDeductions = { sec80C: 0, sec80CCC: 0, sec80CCD1: 0, sec80CCD1B: 0, sec80CCD2: 0, sec80D_Self: 0, sec80D_Parents: 0, sec80E: 0, sec80EEA: 0, sec80G: 0, sec80TTA: 0, sec80TTB: 0, sec24b_HomeLoan: 0, otherDeductions: 0 };
      
      const comparison = compareTaxRegimes(emptySalary, emptyOther, emptyBusiness, [], emptyDeductions);

      record = {
        id,
        userId,
        assessmentYear,
        financialYear: '2024-25',
        itrType: 'ITR-1',
        status: 'NOT_STARTED',
        progressPercent: 10,
        selectedRegime: 'NEW',
        salaryIncome: emptySalary,
        otherIncome: emptyOther,
        businessIncome: emptyBusiness,
        capitalGains: [],
        deductions: emptyDeductions,
        calculatedTaxOld: comparison.oldRegime,
        calculatedTaxNew: comparison.newRegime,
        assignedExpertName: 'CA Priya Sundaram (FCA)',
        expertApproved: false,
        documentsRequired: ['Form 16', 'Bank Statement'],
        documentsAttached: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.itrs.set(id, record);
    }
    return record;
  }

  updateITR(id: string, updates: Partial<ITRFilingRecord>): ITRFilingRecord | null {
    const record = this.itrs.get(id);
    if (!record) return null;

    const merged = { ...record, ...updates, updatedAt: new Date().toISOString() };

    // Recompute taxes dynamically
    const comp = compareTaxRegimes(
      merged.salaryIncome,
      merged.otherIncome,
      merged.businessIncome,
      merged.capitalGains,
      merged.deductions
    );
    merged.calculatedTaxOld = comp.oldRegime;
    merged.calculatedTaxNew = comp.newRegime;

    this.itrs.set(id, merged);
    return merged;
  }

  getAllITRs(): ITRFilingRecord[] {
    return Array.from(this.itrs.values());
  }

  // --- Tax Notices ---
  getNoticesByUser(userId: string): TaxNoticeItem[] {
    return Array.from(this.notices.values()).filter(n => n.userId === userId);
  }

  getAllNotices(): TaxNoticeItem[] {
    return Array.from(this.notices.values());
  }

  createNotice(notice: Omit<TaxNoticeItem, 'id' | 'createdAt'>): TaxNoticeItem {
    const id = `notice_${Date.now()}`;
    const newNotice: TaxNoticeItem = {
      ...notice,
      id,
      createdAt: new Date().toISOString(),
    };
    this.notices.set(id, newNotice);
    return newNotice;
  }

  updateNotice(id: string, updates: Partial<TaxNoticeItem>): TaxNoticeItem | null {
    const current = this.notices.get(id);
    if (!current) return null;
    const updated = { ...current, ...updates };
    this.notices.set(id, updated);
    return updated;
  }

  // --- Documents ---
  getDocumentsByUser(userId: string): DocumentItem[] {
    return Array.from(this.documents.values()).filter(d => d.userId === userId);
  }

  createDocument(doc: Omit<DocumentItem, 'id' | 'uploadDate'>): DocumentItem {
    const id = `doc_${Date.now()}`;
    const newDoc: DocumentItem = {
      ...doc,
      id,
      uploadDate: new Date().toISOString().split('T')[0],
    };
    this.documents.set(id, newDoc);
    return newDoc;
  }

  deleteDocument(id: string, userId: string): boolean {
    const doc = this.documents.get(id);
    if (doc && (doc.userId === userId || userId === 'ADMIN')) {
      return this.documents.delete(id);
    }
    return false;
  }

  getAllDocuments(): DocumentItem[] {
    return Array.from(this.documents.values());
  }

  updateDocumentStatus(id: string, status: DocumentItem['status'], reason?: string): DocumentItem | null {
    const doc = this.documents.get(id);
    if (!doc) return null;
    doc.status = status;
    if (reason) doc.rejectionReason = reason;
    this.documents.set(id, doc);
    return doc;
  }

  // --- Services ---
  getAllServices(): ServiceItem[] {
    return Array.from(this.services.values());
  }

  getServiceBySlug(slug: string): ServiceItem | undefined {
    return Array.from(this.services.values()).find(s => s.slug === slug);
  }

  // --- Investments ---
  getInvestmentsByUser(userId: string): InvestmentItem[] {
    return Array.from(this.investments.values()).filter(i => i.userId === userId);
  }

  addInvestment(userId: string, inv: Omit<InvestmentItem, 'id' | 'userId'>): InvestmentItem {
    const id = `inv_${Date.now()}`;
    const newInv: InvestmentItem = { ...inv, id, userId };
    this.investments.set(id, newInv);
    return newInv;
  }

  // --- Blogs ---
  getAllBlogs(): BlogPost[] {
    return Array.from(this.blogs.values());
  }

  getBlogBySlug(slug: string): BlogPost | undefined {
    return Array.from(this.blogs.values()).find(b => b.slug === slug);
  }

  // --- Notifications ---
  getNotificationsByUser(userId: string): NotificationItem[] {
    return Array.from(this.notifications.values()).filter(n => n.userId === userId);
  }

  markNotificationRead(id: string, userId: string): boolean {
    const notif = this.notifications.get(id);
    if (notif && notif.userId === userId) {
      notif.read = true;
      this.notifications.set(id, notif);
      return true;
    }
    return false;
  }

  // --- Support Tickets ---
  getTicketsByUser(userId: string): SupportTicket[] {
    return Array.from(this.tickets.values()).filter(t => t.userId === userId);
  }

  getAllTickets(): SupportTicket[] {
    return Array.from(this.tickets.values());
  }

  createTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): SupportTicket {
    const id = `tkt_${Date.now()}`;
    const newTicket: SupportTicket = {
      ...ticket,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tickets.set(id, newTicket);
    return newTicket;
  }

  addTicketMessage(ticketId: string, sender: 'USER' | 'SUPPORT_AGENT' | 'SYSTEM', senderName: string, message: string): SupportTicket | null {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return null;
    ticket.messages.push({
      sender,
      senderName,
      message,
      timestamp: new Date().toISOString(),
    });
    ticket.updatedAt = new Date().toISOString();
    this.tickets.set(ticketId, ticket);
    return ticket;
  }

  // --- Subscription ---
  getUserSubscription(userId: string): { planId: SubscriptionPlanId; expiresAt: string } {
    return this.userSubscriptions.get(userId) || { planId: 'FREE', expiresAt: '2099-12-31' };
  }

  setUserSubscription(userId: string, planId: SubscriptionPlanId): void {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    this.userSubscriptions.set(userId, { planId, expiresAt: nextYear.toISOString().split('T')[0] });
  }
}

export const dbStore = new DatabaseStore();
