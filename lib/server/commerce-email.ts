import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/data";
import { sendTransactionalEmail } from "@/lib/server/mailer";

interface EmailLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string | null;
}

interface OrderEmailPayload {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryStateName: string;
  paymentGateway?: string | null;
  subtotalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  createdAt: string;
  items: EmailLineItem[];
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "http://localhost:3000";
}

function getSupportEmail() {
  return process.env.SUPPORT_EMAIL ?? "hello@nakishaempire.com";
}

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long"
  }).format(new Date(value));
}

function renderLineItems(items: EmailLineItem[]) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #1f2937;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td width="72" valign="top" style="padding-right:16px;">
                  ${
                    item.imageUrl
                      ? `<img src="${item.imageUrl}" alt="${escapeHtml(item.name)}" width="64" height="64" style="display:block;border-radius:14px;object-fit:cover;background:#111827;" />`
                      : `<div style="width:64px;height:64px;border-radius:14px;background:#111827;"></div>`
                  }
                </td>
                <td valign="top" style="color:#f8fafc;font-size:15px;line-height:1.5;font-weight:600;">${escapeHtml(item.name)}</td>
                <td valign="top" align="center" style="color:#cbd5e1;font-size:14px;line-height:1.5;">x${item.quantity}</td>
                <td valign="top" align="right" style="color:#f8fafc;font-size:15px;line-height:1.5;font-weight:600;">${formatCurrency(item.totalPrice)}</td>
              </tr>
              <tr>
                <td></td>
                <td colspan="3" style="padding-top:4px;color:#94a3b8;font-size:13px;">${formatCurrency(item.unitPrice)} each</td>
              </tr>
            </table>
          </td>
        </tr>
      `
    )
    .join("");
}

function renderOrderEmailTemplate(input: {
  preview: string;
  heading: string;
  intro: string;
  order: OrderEmailPayload;
}) {
  const orderDate = formatOrderDate(input.order.createdAt);
  const shippingAddress = `${escapeHtml(input.order.deliveryAddress)}<br />${escapeHtml(input.order.deliveryStateName)}, Nigeria`;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <body style="margin:0;background:#06080d;font-family:Arial,Helvetica,sans-serif;color:#f8fafc;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preview)}</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#06080d;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#0b1020;border:1px solid #111827;border-radius:28px;overflow:hidden;">
                <tr>
                  <td style="padding:32px 32px 8px;">
                    <div style="display:inline-block;padding:8px 12px;border-radius:999px;background:#10231b;color:#6ee7b7;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">
                      Nakisha Empire
                    </div>
                    <h1 style="margin:20px 0 8px;font-size:40px;line-height:1.05;letter-spacing:-0.04em;color:#ffffff;">${escapeHtml(input.heading)}</h1>
                    <p style="margin:0;color:#cbd5e1;font-size:16px;line-height:1.7;">Hi ${escapeHtml(input.order.customerName)},</p>
                    <p style="margin:16px 0 0;color:#cbd5e1;font-size:16px;line-height:1.7;">${escapeHtml(input.intro)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 32px 32px;">
                    <div style="padding:24px;border-radius:24px;background:#0f172a;border:1px solid #1e293b;">
                      <p style="margin:0 0 8px;color:#ffffff;font-size:24px;font-weight:700;">Order summary</p>
                      <p style="margin:0;color:#94a3b8;font-size:14px;">Order #${input.order.orderNumber} (${orderDate})</p>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;">
                        <tr>
                          <td style="padding-bottom:12px;color:#94a3b8;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Product</td>
                          <td style="padding-bottom:12px;color:#94a3b8;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;" align="center">Quantity</td>
                          <td style="padding-bottom:12px;color:#94a3b8;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;" align="right">Price</td>
                        </tr>
                        ${renderLineItems(input.order.items)}
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;">
                        <tr>
                          <td style="padding:6px 0;color:#94a3b8;">Subtotal</td>
                          <td align="right" style="padding:6px 0;color:#ffffff;font-weight:600;">${formatCurrency(input.order.subtotalAmount)}</td>
                        </tr>
                        ${
                          input.order.discountAmount > 0
                            ? `<tr><td style="padding:6px 0;color:#94a3b8;">Discount</td><td align="right" style="padding:6px 0;color:#fda4af;font-weight:600;">- ${formatCurrency(input.order.discountAmount)}</td></tr>`
                            : ""
                        }
                        <tr>
                          <td style="padding:6px 0;color:#94a3b8;">Delivery</td>
                          <td align="right" style="padding:6px 0;color:#ffffff;font-weight:600;">${formatCurrency(input.order.shippingAmount)}</td>
                        </tr>
                        <tr>
                          <td style="padding:14px 0 0;color:#ffffff;font-size:18px;font-weight:700;">Total</td>
                          <td align="right" style="padding:14px 0 0;color:#ffffff;font-size:18px;font-weight:700;">${formatCurrency(input.order.totalAmount)}</td>
                        </tr>
                      </table>
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;">
                      <tr>
                        <td style="width:50%;padding-right:8px;" valign="top">
                          <div style="padding:20px;border-radius:24px;background:#0f172a;border:1px solid #1e293b;height:100%;">
                            <p style="margin:0 0 10px;color:#94a3b8;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Delivery address</p>
                            <p style="margin:0;color:#f8fafc;font-size:15px;line-height:1.7;">${shippingAddress}</p>
                          </div>
                        </td>
                        <td style="width:50%;padding-left:8px;" valign="top">
                          <div style="padding:20px;border-radius:24px;background:#0f172a;border:1px solid #1e293b;height:100%;">
                            <p style="margin:0 0 10px;color:#94a3b8;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Payment method</p>
                            <p style="margin:0;color:#f8fafc;font-size:15px;line-height:1.7;">${escapeHtml(input.order.paymentGateway ?? "Online payment")}</p>
                            <p style="margin:16px 0 0;color:#94a3b8;font-size:13px;line-height:1.7;">Need help with your order? Reply to this email or contact ${getSupportEmail()}.</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function renderOrderEmailText(input: { heading: string; intro: string; order: OrderEmailPayload }) {
  const items = input.order.items
    .map((item) => `- ${item.name} x${item.quantity}: ${formatCurrency(item.totalPrice)}`)
    .join("\n");

  return `${input.heading}

Hi ${input.order.customerName},

${input.intro}

Order #${input.order.orderNumber} (${formatOrderDate(input.order.createdAt)})
${items}

Subtotal: ${formatCurrency(input.order.subtotalAmount)}
${input.order.discountAmount > 0 ? `Discount: - ${formatCurrency(input.order.discountAmount)}\n` : ""}Delivery: ${formatCurrency(input.order.shippingAmount)}
Total: ${formatCurrency(input.order.totalAmount)}

Delivery address:
${input.order.deliveryAddress}
${input.order.deliveryStateName}, Nigeria

  Support: ${getSupportEmail()}`;
}

async function loadOrderEmailPayload(orderId: string): Promise<OrderEmailPayload | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      orderNumber: true,
      customerName: true,
      customerEmail: true,
      deliveryAddress: true,
      deliveryStateName: true,
      paymentGateway: true,
      subtotalAmount: true,
      discountAmount: true,
      shippingAmount: true,
      totalAmount: true,
      createdAt: true,
      items: {
        select: {
          productName: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true,
          product: {
            select: {
              imageUrl: true
            }
          }
        }
      }
    }
  });

  if (!order) {
    return null;
  }

  return {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    deliveryAddress: order.deliveryAddress,
    deliveryStateName: order.deliveryStateName,
    paymentGateway: order.paymentGateway,
    subtotalAmount: order.subtotalAmount,
    discountAmount: order.discountAmount,
    shippingAmount: order.shippingAmount,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      name: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      imageUrl: item.product?.imageUrl
    }))
  };
}

export async function sendOrderReceivedEmail(orderId: string) {
  const order = await loadOrderEmailPayload(orderId);

  if (!order) {
    return;
  }

  const heading = "Thank you for your order";
  const intro = "Just to let you know, we've received your order and it is now being processed.";

  await sendTransactionalEmail({
    to: order.customerEmail,
    subject: `Nakisha Empire order ${order.orderNumber} received`,
    html: renderOrderEmailTemplate({
      preview: `Order ${order.orderNumber} has been received.`,
      heading,
      intro,
      order
    }),
    text: renderOrderEmailText({ heading, intro, order })
  });
}

export async function sendOrderInTransitEmail(orderId: string) {
  const order = await loadOrderEmailPayload(orderId);

  if (!order) {
    return;
  }

  const heading = "Good things are heading your way!";
  const intro = "We have finished processing your order and it is now in transit.";

  await sendTransactionalEmail({
    to: order.customerEmail,
    subject: `Your Nakisha Empire order ${order.orderNumber} is on its way`,
    html: renderOrderEmailTemplate({
      preview: `Order ${order.orderNumber} is now in transit.`,
      heading,
      intro,
      order
    }),
    text: renderOrderEmailText({ heading, intro, order })
  });
}

export async function sendBackInStockEmail(input: {
  email: string;
  productName: string;
  productUrl: string;
  imageUrl?: string | null;
  priceLabel: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <body style="margin:0;background:#06080d;font-family:Arial,Helvetica,sans-serif;color:#f8fafc;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#06080d;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#0b1020;border:1px solid #111827;border-radius:28px;">
                <tr>
                  <td style="padding:32px;">
                    <div style="display:inline-block;padding:8px 12px;border-radius:999px;background:#10231b;color:#6ee7b7;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">Nakisha Empire</div>
                    <h1 style="margin:20px 0 12px;font-size:36px;line-height:1.08;letter-spacing:-0.04em;color:#ffffff;">It's back in stock</h1>
                    <p style="margin:0;color:#cbd5e1;font-size:16px;line-height:1.7;">${input.productName} is available again and ready to shop.</p>
                    <div style="margin-top:24px;padding:20px;border-radius:24px;background:#0f172a;border:1px solid #1e293b;">
                      ${
                        input.imageUrl
                          ? `<img src="${input.imageUrl}" alt="${escapeHtml(input.productName)}" width="120" height="120" style="display:block;border-radius:20px;object-fit:cover;background:#111827;margin-bottom:16px;" />`
                          : ""
                      }
                      <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${escapeHtml(input.productName)}</p>
                      <p style="margin:10px 0 0;color:#cbd5e1;font-size:15px;">${escapeHtml(input.priceLabel)}</p>
                      <a href="${input.productUrl}" style="display:inline-block;margin-top:18px;padding:14px 20px;border-radius:999px;background:#f8fafc;color:#0b1020;text-decoration:none;font-weight:700;">Shop now</a>
                    </div>
                    <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;line-height:1.7;">Questions? Reply to this email or contact ${getSupportEmail()}.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await sendTransactionalEmail({
    to: input.email,
    subject: `${input.productName} is back in stock at Nakisha Empire`,
    html,
    text: `${input.productName} is back in stock. Shop now: ${input.productUrl}`
  });
}

export function getProductUrl(slug: string) {
  return `${getSiteUrl()}/shop/${slug}`;
}
