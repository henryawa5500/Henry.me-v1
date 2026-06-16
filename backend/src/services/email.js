import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
const resend = apiKey ? new Resend(apiKey) : null

const fromEmail = process.env.FROM_EMAIL || 'HenryME <onboarding@resend.dev>'
const adminEmail = process.env.ADMIN_EMAIL || ''

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!resend || !to) return { skipped: true }

  try {
    const response = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      text,
    })
    return { skipped: false, response }
  } catch (error) {
    console.error('Email send failed:', error)
    return { skipped: false, error }
  }
}

export const sendOrderCreatedEmails = async (order) => {
  const itemList = order.items
    ?.map((item) => `<li>${item.quantity}x ${item.name} (${item.size})</li>`)
    .join('')

  await sendEmail({
    to: order.customer.email,
    subject: `HenryME order #${order.id} received`,
    text: `Your order #${order.id} has been received. Total: ${formatCurrency(order.total)}.`,
    html: `
      <h2>Order received</h2>
      <p>Hi ${order.customer.name}, your order #${order.id} has been received.</p>
      <p>Total: <strong>${formatCurrency(order.total)}</strong></p>
      <ul>${itemList || ''}</ul>
      <p>We'll verify your payment and update your order status.</p>
    `,
  })

  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `New HenryME order #${order.id}`,
      text: `New order #${order.id} from ${order.customer.name}. Total: ${formatCurrency(order.total)}.`,
      html: `
        <h2>New order #${order.id}</h2>
        <p>${order.customer.name} placed an order for <strong>${formatCurrency(order.total)}</strong>.</p>
        <p>Email: ${order.customer.email}</p>
        <ul>${itemList || ''}</ul>
      `,
    })
  }
}

export const sendPaymentStatusEmail = async (order, status) => {
  const isVerified = status === 'Verified' || status === 'Paid'
  const subject = isVerified
    ? `HenryME payment verified for order #${order.id}`
    : `HenryME payment update for order #${order.id}`

  await sendEmail({
    to: order.customer.email,
    subject,
    text: `Payment status for order #${order.id}: ${status}.`,
    html: `
      <h2>Payment status updated</h2>
      <p>Hi ${order.customer.name}, payment status for order #${order.id} is <strong>${status}</strong>.</p>
      <p>Order total: <strong>${formatCurrency(order.total)}</strong></p>
    `,
  })
}
