import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { buildFinancialDocumentDto } from '@/lib/billing/documents';
import { formatMoneyDisplay } from '@/lib/billing/catalog';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const invoice = await db.bachsInvoice.findUnique({
      where: { id },
      include: { organization: { select: { id: true, name: true } } },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    const isSuperAdmin = dbUser?.role === 'SUPER_ADMIN' || dbUser?.role === 'OPERATOR';
    const sessionOrgId = (session as any).organizationId;

    if (!isSuperAdmin && invoice.organizationId !== sessionOrgId) {
      return NextResponse.json({ error: 'Forbidden: Cross-tenant invoice access denied' }, { status: 403 });
    }

    const dto = buildFinancialDocumentDto(invoice, invoice.organization?.name);
    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'json';

    if (format === 'html') {
      const rowsHtml = dto.lineItems
        .map(
          (item) => `
          <tr>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${item.description}</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatMoneyDisplay(item.unitPrice, dto.currency)}</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatMoneyDisplay(item.total, dto.currency)}</td>
          </tr>`
        )
        .join('');

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${dto.documentKind} ${dto.receiptNumber || dto.invoiceNumber} — CloseCraft HQ</title>
</head>
<body style="font-family:Inter,system-ui,sans-serif;background:#f8fafc;color:#0f172a;padding:32px;">
  <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0f172a;padding-bottom:20px;margin-bottom:24px;">
      <div>
        <h1 style="margin:0;font-size:22px;color:#0f172a;">${dto.brand.name}</h1>
        <p style="margin:4px 0 0;font-size:12px;color:#64748b;">${dto.brand.legalEntity} (${dto.brand.registration})</p>
        <p style="margin:2px 0 0;font-size:12px;color:#64748b;">${dto.brand.supportEmail}</p>
      </div>
      <div style="text-align:right;">
        <span style="display:inline-block;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;background:${dto.documentKind === 'RECEIPT' ? '#dcfce7' : '#fef3c7'};color:${dto.documentKind === 'RECEIPT' ? '#166534' : '#92400e'};">${dto.documentKind} (${dto.status})</span>
        <p style="margin:8px 0 0;font-size:13px;font-weight:700;">Invoice: ${dto.invoiceNumber}</p>
        ${dto.receiptNumber ? `<p style="margin:2px 0 0;font-size:12px;color:#059669;font-weight:700;">Receipt: ${dto.receiptNumber}</p>` : ''}
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:24px;font-size:13px;">
      <div>
        <strong>Billed To:</strong><br/>
        ${dto.customer.organizationName}<br/>
        ${dto.customer.contactName}<br/>
        ${dto.customer.contactEmail}
      </div>
      <div style="text-align:right;">
        <strong>Issue Date:</strong> ${new Date(dto.issueDate).toLocaleDateString()}<br/>
        ${dto.paidAt ? `<strong>Paid Date:</strong> ${new Date(dto.paidAt).toLocaleDateString()}<br/>` : `<strong>Due Date:</strong> ${new Date(dto.dueDate).toLocaleDateString()}<br/>`}
        <strong>Gateway:</strong> ${dto.paymentProvider}<br/>
        <strong>Reference:</strong> ${dto.transactionReference}
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px;">
      <thead>
        <tr style="background:#f1f5f9;">
          <th style="padding:10px;text-align:left;">Description</th>
          <th style="padding:10px;text-align:center;">Qty</th>
          <th style="padding:10px;text-align:right;">Unit Price</th>
          <th style="padding:10px;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <div style="max-width:280px;margin-left:auto;font-size:13px;">
      <div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Subtotal</span><span>${formatMoneyDisplay(dto.subtotalAmount, dto.currency)}</span></div>
      ${dto.discountAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;color:#059669;"><span>Discount ${dto.promotionalCode ? `(${dto.promotionalCode})` : ''}</span><span>-${formatMoneyDisplay(dto.discountAmount, dto.currency)}</span></div>` : ''}
      ${dto.taxAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Tax (${dto.taxRatePercent}%)</span><span>${formatMoneyDisplay(dto.taxAmount, dto.currency)}</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:10px 0 0;margin-top:8px;border-top:2px solid #0f172a;font-weight:800;font-size:15px;"><span>Total (${dto.currency})</span><span>${formatMoneyDisplay(dto.totalAmount, dto.currency)}</span></div>
    </div>
  </div>
</body>
</html>`;

      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="CloseCraftHQ-${dto.receiptNumber || dto.invoiceNumber}.html"`,
        },
      });
    }

    return NextResponse.json(dto);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate document' }, { status: 500 });
  }
}
