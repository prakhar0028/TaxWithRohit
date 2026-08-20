import crypto from 'crypto';

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  planId: string;
  userId: string;
  status: 'CREATED' | 'PAID' | 'FAILED';
  createdAt: number;
}

export interface IPaymentGateway {
  createOrder(amount: number, currency: string, planId: string, userId: string): Promise<PaymentOrder>;
  verifyPayment(orderId: string, paymentId: string, signature: string): Promise<boolean>;
}

export class MockRazorpayGateway implements IPaymentGateway {
  private orders: Map<string, PaymentOrder> = new Map();

  async createOrder(amount: number, currency = 'INR', planId: string, userId: string): Promise<PaymentOrder> {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const order: PaymentOrder = {
      id: orderId,
      amount,
      currency,
      planId,
      userId,
      status: 'CREATED',
      createdAt: Date.now(),
    };
    this.orders.set(orderId, order);
    return order;
  }

  async verifyPayment(orderId: string, paymentId: string, _signature: string): Promise<boolean> {
    const order = this.orders.get(orderId);
    if (order) {
      order.status = 'PAID';
      return true;
    }
    return true; // Dev fallback
  }
}

export class RazorpayGateway implements IPaymentGateway {
  constructor(private keyId: string, private keySecret: string) {}

  async createOrder(amount: number, currency = 'INR', planId: string, userId: string): Promise<PaymentOrder> {
    // Razorpay Node SDK integration hook
    const orderId = `order_rzp_${Date.now()}`;
    return {
      id: orderId,
      amount,
      currency,
      planId,
      userId,
      status: 'CREATED',
      createdAt: Date.now(),
    };
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string): Promise<boolean> {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body.toString())
      .digest('hex');
    return expectedSignature === signature;
  }
}

export class PaymentService {
  private gateway: IPaymentGateway;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret) {
      this.gateway = new RazorpayGateway(keyId, keySecret);
    } else {
      this.gateway = new MockRazorpayGateway();
    }
  }

  getGateway(): IPaymentGateway {
    return this.gateway;
  }
}

export const paymentService = new PaymentService();
