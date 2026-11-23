import { db } from '../db';
import { createCommitment } from './commitmentService';

export interface CreateOrderInput {
  organizationId: string;
  title: string;
  agreedAmount: number;
  amountPaid?: number;
  currency?: string;
  deadline?: Date | null;
  leadId?: string | null;
  dealId?: string | null;
  assignedUserId?: string | null;
  fulfilmentNotes?: string | null;
  userId?: string | null;
}

/**
 * Creates a lightweight customer order and initializes fulfilment commitments
 */
export async function createCustomerOrder(input: CreateOrderInput) {
  const {
    organizationId,
    title,
    agreedAmount,
    amountPaid = 0,
    currency = 'NGN',
    deadline,
    leadId,
    dealId,
    assignedUserId,
    fulfilmentNotes,
    userId
  } = input;

  const count = await db.customerOrder.count({ where: { organizationId } });
  const year = new Date().getFullYear();
  const orderNumber = `ORD-${year}-${String(count + 1).padStart(3, '0')}`;

  const balanceRemaining = Math.max(0, agreedAmount - amountPaid);
  const paymentStatus = amountPaid >= agreedAmount
    ? 'PAID_IN_FULL'
    : amountPaid > 0
    ? 'PARTIALLY_PAID'
    : 'UNPAID';

  const order = await db.customerOrder.create({
    data: {
      organizationId,
      orderNumber,
      title,
      agreedAmount,
      amountPaid,
      balanceRemaining,
      currency,
      paymentStatus,
      fulfilmentStatus: 'IN_PROGRESS',
      deadline: deadline || null,
      leadId: leadId || null,
      dealId: dealId || null,
      assignedUserId: assignedUserId || null,
      fulfilmentNotes: fulfilmentNotes || null
    }
  });

  // Automatically attach an initial kickoff / deliverable commitment to the Promise Ledger
  const targetDueDate = deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days default
  await createCommitment({
    organizationId,
    title: `Deliverable Kickoff: ${title}`,
    description: `Complete technical onboarding and initial deliverables for order ${orderNumber}. Balance remaining: ${currency} ${balanceRemaining.toLocaleString()}`,
    commitmentType: 'DELIVERABLE',
    dueDate: targetDueDate,
    priority: 'HIGH',
    leadId: leadId || null,
    dealId: dealId || null,
    assignedUserId: assignedUserId || null,
    orderId: order.id,
    userId: userId || null
  });

  // Audit log
  await db.auditLog.create({
    data: {
      organizationId,
      actorId: userId || null,
      actorType: 'USER',
      action: 'CUSTOMER_ORDER_CREATED',
      resourceType: 'CustomerOrder',
      resourceId: order.id,
      reason: `Created order ${orderNumber} (${currency} ${agreedAmount.toLocaleString()})`
    }
  });

  return order;
}

/**
 * Records an incremental payment against an active order
 */
export async function recordOrderPayment(params: {
  orderId: string;
  organizationId: string;
  paymentAmount: number;
  userId?: string | null;
}) {
  const { orderId, organizationId, paymentAmount, userId } = params;

  const order = await db.customerOrder.findFirst({
    where: { id: orderId, organizationId }
  });

  if (!order) {
    throw new Error('Order not found');
  }

  const newAmountPaid = Number(order.amountPaid) + paymentAmount;
  const newBalance = Math.max(0, Number(order.agreedAmount) - newAmountPaid);
  const newPaymentStatus = newAmountPaid >= Number(order.agreedAmount)
    ? 'PAID_IN_FULL'
    : 'PARTIALLY_PAID';

  const updated = await db.customerOrder.update({
    where: { id: orderId },
    data: {
      amountPaid: newAmountPaid,
      balanceRemaining: newBalance,
      paymentStatus: newPaymentStatus
    }
  });

  await db.auditLog.create({
    data: {
      organizationId,
      actorId: userId || null,
      actorType: 'USER',
      action: 'ORDER_PAYMENT_RECONCILED',
      resourceType: 'CustomerOrder',
      resourceId: orderId,
      reason: `Recorded payment of ${order.currency} ${paymentAmount.toLocaleString()}. New balance: ${order.currency} ${newBalance.toLocaleString()}`
    }
  });

  return updated;
}
