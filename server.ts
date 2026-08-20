import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { dbStore } from './src/lib/databaseStore';
import { otpService } from './src/services/otp/otpService';
import { paymentService } from './src/services/payment/paymentService';
import { storageService } from './src/services/storage/storageService';
import { askTaxWithRohitAI } from './src/services/ai/aiService';
import { compareTaxRegimes } from './src/services/taxEngine';
import { SUBSCRIPTION_PLANS } from './src/config/seedData';
import { UserRole } from './src/types';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parsing with security limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// Mock Session Auth middleware (Simulates JWT / session cookies)
function getAuthUser(req: Request) {
  const authHeader = req.headers['authorization'] || '';
  const userId = (req.headers['x-user-id'] as string) || (authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null);
  
  if (userId) {
    const user = dbStore.getUserById(userId);
    if (user) return user;
  }
  // Default demo fallback user if not specified for smooth dev preview
  return dbStore.getUserById('user_demo_101');
}

// -------------------------------------------------------------
// 1. AUTHENTICATION APIS
// -------------------------------------------------------------

// Send Mobile OTP
app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid mobile number is required' });
    }

    const result = await otpService.generateAndSendOTP(phone);
    if (!result.success) {
      return res.status(429).json(result);
    }
    return res.json(result);
  } catch (error: any) {
    console.error('Error in send-otp:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while sending OTP' });
  }
});

// Verify Mobile OTP & Login/Signup
app.post('/api/auth/verify-otp', async (req: Request, res: Response) => {
  try {
    const { phone, otp, name } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    const verification = await otpService.verifyOTP(phone, otp);
    if (!verification.success) {
      return res.status(400).json(verification);
    }

    let user = dbStore.getUserByPhone(phone);
    let isNewUser = false;

    if (!user) {
      user = dbStore.createUser(phone, undefined, name || undefined, 'USER');
      isNewUser = true;
    }

    const profile = dbStore.getProfile(user.id);
    const subscription = dbStore.getUserSubscription(user.id);

    return res.json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Logged in successfully',
      token: user.id,
      user,
      profile,
      subscription,
    });
  } catch (error: any) {
    console.error('Error in verify-otp:', error);
    return res.status(500).json({ success: false, message: 'Verification error' });
  }
});

// Google OAuth Login Simulation
app.post('/api/auth/google', async (req: Request, res: Response) => {
  try {
    const { email, name, avatarUrl } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required' });
    }

    let user = dbStore.getUserByEmail(email);
    if (!user) {
      const generatedPhone = '98' + Math.floor(10000000 + Math.random() * 90000000);
      user = dbStore.createUser(generatedPhone, email, name || 'Google User', 'USER');
      if (avatarUrl) user.avatarUrl = avatarUrl;
    }

    const profile = dbStore.getProfile(user.id);
    const subscription = dbStore.getUserSubscription(user.id);

    return res.json({
      success: true,
      token: user.id,
      user,
      profile,
      subscription,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Google auth failed' });
  }
});

// Quick Dev Role Switcher Login (Demo, CA Expert, Admin)
app.post('/api/auth/dev-login', async (req: Request, res: Response) => {
  const { role } = req.body;
  let targetId = 'user_demo_101';
  if (role === 'TAX_EXPERT') targetId = 'user_expert_201';
  if (role === 'ADMIN') targetId = 'user_admin_301';

  const user = dbStore.getUserById(targetId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const profile = dbStore.getProfile(user.id);
  const subscription = dbStore.getUserSubscription(user.id);

  return res.json({
    success: true,
    token: user.id,
    user,
    profile,
    subscription,
  });
});

// Get Current User Session
app.get('/api/auth/session', async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ authenticated: false });
  }
  const profile = dbStore.getProfile(user.id);
  const subscription = dbStore.getUserSubscription(user.id);

  return res.json({
    authenticated: true,
    user,
    profile,
    subscription,
  });
});

// -------------------------------------------------------------
// 2. USER PROFILE APIS
// -------------------------------------------------------------

app.get('/api/profile', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const profile = dbStore.getProfile(user.id);
  return res.json(profile || {});
});

app.put('/api/profile', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const updated = dbStore.updateProfile(user.id, req.body);
  return res.json(updated);
});

// -------------------------------------------------------------
// 3. ITR FILING APIS
// -------------------------------------------------------------

app.get('/api/itr', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const ay = (req.query.ay as string) || '2025-26';
  const itr = dbStore.getITRByUser(user.id, ay);
  return res.json(itr);
});

app.put('/api/itr/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;
  const updated = dbStore.updateITR(id, req.body);
  if (!updated) return res.status(404).json({ error: 'ITR record not found' });

  return res.json(updated);
});

app.post('/api/itr/:id/calculate', (req: Request, res: Response) => {
  const { salary, other, business, capitalGains, deductions } = req.body;
  const comp = compareTaxRegimes(salary, other, business, capitalGains || [], deductions);
  return res.json(comp);
});

app.post('/api/itr/:id/submit-prep', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;
  const ack = `ITR-V-${new Date().getFullYear()}-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  
  const updated = dbStore.updateITR(id, {
    status: 'READY_TO_SUBMIT',
    progressPercent: 100,
    ackNumber: ack,
    submittedAt: new Date().toISOString(),
  });

  return res.json({
    success: true,
    ackNumber: ack,
    message: 'ITR Return Computation & JSON Draft Prepared for e-Verification!',
    record: updated,
  });
});

// -------------------------------------------------------------
// 4. TAX NOTICES APIS
// -------------------------------------------------------------

app.get('/api/tax-notices', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const notices = dbStore.getNoticesByUser(user.id);
  return res.json(notices);
});

app.post('/api/tax-notices', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { noticeType, assessmentYear, noticeDate, dinNumber, demandAmount, fileName } = req.body;

  const newNotice = dbStore.createNotice({
    userId: user.id,
    noticeType: noticeType || 'SECTION_143_1',
    assessmentYear: assessmentYear || '2024-25',
    noticeDate: noticeDate || new Date().toISOString().split('T')[0],
    dinNumber: dinNumber || `DIN-${Date.now()}`,
    demandAmount: Number(demandAmount) || 0,
    status: 'UNDER_REVIEW',
    documentUrl: '#',
    fileName: fileName || 'Uploaded_Notice.pdf',
    assignedExpertName: 'CA Priya Sundaram (FCA)',
    timeline: [
      { title: 'Notice Uploaded', description: 'Notice received and queued for audit review', timestamp: new Date().toISOString().split('T')[0], completed: true },
      { title: 'CA Assessment', description: 'Chartered Accountant is analyzing DIN and tax computations', timestamp: 'In Progress', completed: false },
      { title: 'Response Preparation', description: 'Drafting reply for IT e-proceedings portal', timestamp: 'Pending', completed: false },
    ],
  });

  return res.json(newNotice);
});

// -------------------------------------------------------------
// 5. DOCUMENTS CLOUD APIS
// -------------------------------------------------------------

app.get('/api/documents', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const docs = dbStore.getDocumentsByUser(user.id);
  return res.json(docs);
});

app.post('/api/documents', async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { name, type, fileSize, assessmentYear, fileData } = req.body;

  const uploadRes = await storageService.getProvider().uploadFile(
    fileData || 'mock_file_data',
    name || 'document.pdf',
    'application/pdf'
  );

  const doc = dbStore.createDocument({
    userId: user.id,
    name: name || 'Uploaded Document',
    type: type || 'OTHER',
    fileSize: fileSize || '1.2 MB',
    status: 'UPLOADED',
    assessmentYear: assessmentYear || '2025-26',
    fileUrl: uploadRes.url,
  });

  return res.json(doc);
});

app.delete('/api/documents/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const success = dbStore.deleteDocument(req.params.id, user.id);
  return res.json({ success });
});

// -------------------------------------------------------------
// 6. SERVICES APIS
// -------------------------------------------------------------

app.get('/api/services', (_req: Request, res: Response) => {
  const services = dbStore.getAllServices();
  return res.json(services);
});

app.get('/api/services/:slug', (req: Request, res: Response) => {
  const service = dbStore.getServiceBySlug(req.params.slug);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  return res.json(service);
});

// -------------------------------------------------------------
// 7. INVESTMENTS & TAX OPTIMIZATION APIS
// -------------------------------------------------------------

app.get('/api/investments', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const investments = dbStore.getInvestmentsByUser(user.id);
  return res.json(investments);
});

app.post('/api/investments', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const newInv = dbStore.addInvestment(user.id, req.body);
  return res.json(newInv);
});

// -------------------------------------------------------------
// 8. NOTIFICATIONS & SUPPORT APIS
// -------------------------------------------------------------

app.get('/api/notifications', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const notifs = dbStore.getNotificationsByUser(user.id);
  return res.json(notifs);
});

app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const success = dbStore.markNotificationRead(req.params.id, user.id);
  return res.json({ success });
});

app.get('/api/support/tickets', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const tickets = dbStore.getTicketsByUser(user.id);
  return res.json(tickets);
});

app.post('/api/support/tickets', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { subject, category, priority, message } = req.body;
  const newTicket = dbStore.createTicket({
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userPhone: user.phone,
    subject: subject || 'General Query',
    category: category || 'ITR',
    priority: priority || 'MEDIUM',
    status: 'OPEN',
    messages: [
      {
        sender: 'USER',
        senderName: user.name,
        message: message || '',
        timestamp: new Date().toISOString(),
      },
    ],
  });

  return res.json(newTicket);
});

app.post('/api/support/tickets/:id/reply', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { message, senderRole } = req.body;
  const senderType = (senderRole === 'SUPPORT_AGENT' || user.role === 'ADMIN') ? 'SUPPORT_AGENT' : 'USER';
  const updated = dbStore.addTicketMessage(req.params.id, senderType, user.name, message);

  if (!updated) return res.status(404).json({ error: 'Ticket not found' });
  return res.json(updated);
});

// -------------------------------------------------------------
// 9. BLOGS & FAQS APIS
// -------------------------------------------------------------

app.get('/api/blogs', (_req: Request, res: Response) => {
  return res.json(dbStore.getAllBlogs());
});

app.get('/api/blogs/:slug', (req: Request, res: Response) => {
  const blog = dbStore.getBlogBySlug(req.params.slug);
  if (!blog) return res.status(404).json({ error: 'Article not found' });
  return res.json(blog);
});

// -------------------------------------------------------------
// 10. SUBSCRIPTIONS & PAYMENTS APIS
// -------------------------------------------------------------

app.get('/api/subscriptions/plans', (_req: Request, res: Response) => {
  return res.json(SUBSCRIPTION_PLANS);
});

app.post('/api/payments/create-order', async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { amount, planId } = req.body;
  const order = await paymentService.getGateway().createOrder(amount || 799, 'INR', planId || 'PREMIUM', user.id);
  return res.json(order);
});

app.post('/api/payments/verify', async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { orderId, paymentId, signature, planId } = req.body;
  const verified = await paymentService.getGateway().verifyPayment(orderId, paymentId, signature);

  if (verified && planId) {
    dbStore.setUserSubscription(user.id, planId);
  }

  return res.json({ success: verified, message: verified ? 'Subscription Activated Successfully!' : 'Payment verification failed' });
});

// -------------------------------------------------------------
// 11. AI TAX ASSISTANT API (Gemini 3.7 Flash Server-Side)
// -------------------------------------------------------------

app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Query message is required' });
    }

    const reply = await askTaxWithRohitAI(message, history || []);
    return res.json({ response: reply });
  } catch (error: any) {
    console.error('AI chat endpoint error:', error);
    return res.status(500).json({ error: 'Failed to process AI tax query' });
  }
});

// -------------------------------------------------------------
// 12. ADMIN & EXPERT APIS
// -------------------------------------------------------------

app.get('/api/admin/metrics', (req: Request, res: Response) => {
  const users = dbStore.getAllUsers();
  const itrs = dbStore.getAllITRs();
  const notices = dbStore.getAllNotices();
  const tickets = dbStore.getAllTickets();

  const statsObj = {
    totalUsers: users.length + 1300000,
    totalITRsFiled: itrs.length + 1420,
    totalRevenue: 28450000,
    activeNotices: notices.filter(n => n.status !== 'RESOLVED').length + 86,
    pendingReviews: tickets.filter(t => t.status !== 'RESOLVED').length + 12,
    caTeamSize: 124,
  };

  return res.json({
    stats: statsObj,
    recentITRs: itrs,
    ...statsObj,
    activeFilings: statsObj.totalITRsFiled,
    pendingNotices: statsObj.activeNotices,
    openSupportTickets: statsObj.pendingReviews,
    activeExperts: statsObj.caTeamSize,
  });
});

app.get('/api/admin/users', (_req: Request, res: Response) => {
  return res.json(dbStore.getAllUsers());
});

app.get('/api/admin/itrs', (_req: Request, res: Response) => {
  return res.json(dbStore.getAllITRs());
});

app.post('/api/admin/assign-ca', (req: Request, res: Response) => {
  const { itrId, expertName, expertId } = req.body;
  if (!itrId) return res.status(400).json({ error: 'itrId is required' });
  const updated = dbStore.updateITR(itrId, {
    assignedExpertName: expertName || 'CA Priya Sundaram (FCA)',
    assignedExpertId: expertId || 'user_expert_201',
  });
  return res.json({ success: true, updated });
});

app.put('/api/admin/itrs/:id/assign', (req: Request, res: Response) => {
  const { expertName, expertId } = req.body;
  const updated = dbStore.updateITR(req.params.id, {
    assignedExpertName: expertName || 'CA Priya Sundaram (FCA)',
    assignedExpertId: expertId || 'user_expert_201',
  });
  return res.json(updated);
});

app.get('/api/expert/itrs', (_req: Request, res: Response) => {
  return res.json(dbStore.getAllITRs());
});

app.get('/api/expert/assigned-itrs', (_req: Request, res: Response) => {
  return res.json(dbStore.getAllITRs());
});

app.post('/api/expert/review-itr', (req: Request, res: Response) => {
  const { itrId, status, reviewNote, notes } = req.body;
  if (!itrId) return res.status(400).json({ error: 'itrId is required' });
  const updated = dbStore.updateITR(itrId, {
    expertReviewNotes: reviewNote || notes,
    expertApproved: status === 'FILED' || status === 'VERIFIED',
    status: status === 'FILED' ? 'SUBMITTED' : (status === 'VERIFIED' ? 'READY_TO_SUBMIT' : 'DOCUMENTS_PENDING'),
  });
  return res.json({ success: true, updated });
});

app.put('/api/expert/itrs/:id/review', (req: Request, res: Response) => {
  const { notes, approved, status } = req.body;
  const updated = dbStore.updateITR(req.params.id, {
    expertReviewNotes: notes,
    expertApproved: approved !== undefined ? approved : true,
    status: status || (approved ? 'READY_TO_SUBMIT' : 'DOCUMENTS_PENDING'),
  });
  return res.json(updated);
});

// API 404 Guard to prevent returning HTML for unknown API requests
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `API route ${req.method} ${req.path} not found`,
  });
});

// -------------------------------------------------------------
// VITE SPA MIDDLEWARE / PRODUCTION STATIC SERVING
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TaxWithRohit] Server started on http://127.0.0.1:${PORT}`);
  });
}

startServer();
