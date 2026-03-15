import 'server-only'

import { Resend } from 'resend'

let resendClient: Resend | null = null

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY')
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }

  return resendClient
}

export function getEditorialRecipientList() {
  const raw = process.env.EDITORIAL_SUBMISSIONS_EMAIL

  if (!raw) {
    throw new Error('Missing EDITORIAL_SUBMISSIONS_EMAIL')
  }

  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function getResendFromEmail() {
  const from = process.env.RESEND_FROM_EMAIL

  if (!from) {
    throw new Error('Missing RESEND_FROM_EMAIL')
  }

  return from
}
