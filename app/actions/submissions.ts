'use server'

import { getEditorialRecipientList, getResendClient, getResendFromEmail } from '@/lib/resend'

const MAX_FILE_SIZE = 4.5 * 1024 * 1024
const ALLOWED_EXTENSIONS = new Set(['doc', 'docx', 'md', 'pdf'])
const ALLOWED_MIME_TYPES = new Set([
  'application/msword',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown',
  'text/plain',
  'text/x-markdown',
])

interface SubmissionActionResult {
  success: boolean
  message: string
}

interface SubmissionPayload {
  author: string
  category: string
  contactEmail: string
  description: string
  title: string
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function getFileExtension(filename: string) {
  const parts = filename.toLowerCase().split('.')
  return parts.length > 1 ? parts.pop() ?? '' : ''
}

function isAllowedFile(file: File) {
  const extension = getFileExtension(file.name)
  const mimeType = file.type.toLowerCase()

  return (
    ALLOWED_EXTENSIONS.has(extension) &&
    (mimeType === '' || ALLOWED_MIME_TYPES.has(mimeType))
  )
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function buildSubmissionHtml(data: SubmissionPayload) {
  const author = escapeHtml(data.author)
  const title = escapeHtml(data.title)
  const category = escapeHtml(data.category)
  const contactEmail = escapeHtml(data.contactEmail)
  const description = escapeHtml(data.description)

  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; color: #2c2c2c; line-height: 1.7;">
      <h1 style="font-size: 24px; margin-bottom: 24px;">收到新的投稿</h1>
      <p><strong>作者：</strong>${author}</p>
      <p><strong>标题：</strong>${title}</p>
      <p><strong>栏目：</strong>${category}</p>
      <p><strong>联系邮箱：</strong>${contactEmail}</p>
      <div style="margin-top: 24px;">
        <strong>简短描述：</strong>
        <p style="margin-top: 8px; white-space: pre-wrap;">${description}</p>
      </div>
      <p style="margin-top: 24px; color: #7d7d7d;">附件中包含作者上传的原稿文件。</p>
    </div>
  `
}

function buildSubmissionText(data: SubmissionPayload) {
  return [
    '收到新的投稿',
    '',
    `作者：${data.author}`,
    `标题：${data.title}`,
    `栏目：${data.category}`,
    `联系邮箱：${data.contactEmail}`,
    '',
    '简短描述：',
    data.description,
  ].join('\n')
}

export async function submitManuscript(
  formData: FormData
): Promise<SubmissionActionResult> {
  try {
    const website = getString(formData, 'website')
    if (website) {
      return {
        success: true,
        message: '投稿已发送。',
      }
    }

    const author = getString(formData, 'author')
    const title = getString(formData, 'title')
    const category = getString(formData, 'category')
    const description = getString(formData, 'description')
    const contactEmail = getString(formData, 'contactEmail')
    const file = formData.get('manuscript')

    if (!author || !title || !category || !description || !contactEmail) {
      return {
        success: false,
        message: '请填写所有必填字段。',
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return {
        success: false,
        message: '请填写有效的联系邮箱。',
      }
    }

    if (!(file instanceof File) || file.size === 0) {
      return {
        success: false,
        message: '请上传稿件文件。',
      }
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        message: '文件大小不能超过 4.5MB。',
      }
    }

    if (!isAllowedFile(file)) {
      return {
        success: false,
        message: '仅支持 PDF、Word（.doc/.docx）和 Markdown（.md）文件。',
      }
    }

    const resend = getResendClient()
    const attachment = Buffer.from(await file.arrayBuffer()).toString('base64')
    const payload: SubmissionPayload = {
      author,
      title,
      category,
      description,
      contactEmail,
    }

    const { error } = await resend.emails.send({
      from: getResendFromEmail(),
      to: getEditorialRecipientList(),
      replyTo: contactEmail,
      subject: `新投稿｜${category}｜${title}`,
      text: buildSubmissionText(payload),
      html: buildSubmissionHtml(payload),
      attachments: [
        {
          filename: file.name,
          content: attachment,
        },
      ],
    })

    if (error) {
      console.error('[submitManuscript] Failed to send email:', error)
      return {
        success: false,
        message: '投稿发送失败，请稍后重试。',
      }
    }

    return {
      success: true,
      message: '投稿已发送到编辑部邮箱。',
    }
  } catch (error) {
    console.error('[submitManuscript] Unexpected error:', error)
    return {
      success: false,
      message: '投稿发送失败，请检查邮件配置。',
    }
  }
}
