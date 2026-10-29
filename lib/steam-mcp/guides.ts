import { parse, type HTMLElement, type Node } from 'node-html-parser'
import { SteamApiError } from './steam-api'

// Steam Community guides have no API for their content, so read the public
// guide page and turn its sections into plain Markdown-like text.

export type GuideSection = { title: string; text: string }

export type Guide = {
  id: string
  title: string
  author?: string
  description?: string
  url: string
  sections: GuideSection[]
}

export function parseGuideId(input: string): string | null {
  const trimmed = input.trim()
  if (/^\d+$/.test(trimmed)) return trimmed
  try {
    const url = new URL(trimmed)
    if (!/(^|\.)steamcommunity\.com$/.test(url.hostname)) return null
    const id = url.searchParams.get('id')
    return id && /^\d+$/.test(id) ? id : null
  } catch {
    return null
  }
}

export async function fetchGuide(id: string): Promise<Guide> {
  const url = `https://steamcommunity.com/sharedfiles/filedetails/?id=${id}`
  const res = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    next: { revalidate: 60 * 60 * 24 },
  })
  if (!res.ok) {
    throw new SteamApiError(
      `Could not load guide ${id}: it may not exist, or Steam is unavailable (${res.status}).`,
      res.status,
    )
  }
  const root = parse(await res.text())

  const title = clean(root.querySelector('.workshopItemTitle')?.text ?? '')
  const sectionNodes = root.querySelectorAll('.subSection')
  if (!title || sectionNodes.length === 0) {
    throw new SteamApiError(
      'This page is not a readable Steam guide (it may be private, removed or not a guide).',
    )
  }

  const sections = sectionNodes.map((section) => ({
    title: clean(section.querySelector('.subSectionTitle')?.text ?? ''),
    text: tidy(toText(section.querySelector('.subSectionDesc'))),
  }))
  const author = clean(root.querySelector('.guideAuthors')?.text ?? '').replace(
    /^By\s+/i,
    '',
  )
  const description = tidy(toText(root.querySelector('.guideTopDescription')))

  return {
    id,
    title,
    author: author || undefined,
    description: description || undefined,
    url,
    sections,
  }
}

function clean(text: string): string {
  return decode(text).replace(/\s+/g, ' ').trim()
}

function tidy(text: string): string {
  return text
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function decode(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
}

// Steam routes external links through steamcommunity.com/linkfilter/?u=...
function unwrapLinkFilter(href?: string): string | undefined {
  if (!href?.includes('/linkfilter/')) return href
  try {
    return new URL(href).searchParams.get('u') ?? href
  } catch {
    return href
  }
}

function toText(node: Node | null | undefined): string {
  if (!node) return ''
  if (node.nodeType === 3) return decode(node.rawText).replace(/\s+/g, ' ')
  if (node.nodeType !== 1) return ''

  const el = node as HTMLElement
  const tag = el.tagName?.toLowerCase()
  const inner = () => el.childNodes.map(toText).join('')

  switch (tag) {
    case 'br':
      return '\n'
    case 'img':
    case 'script':
    case 'style':
      return ''
    case 'b':
    case 'strong': {
      const text = inner().trim()
      return text ? `**${text}** ` : ''
    }
    case 'i':
    case 'em': {
      const text = inner().trim()
      return text ? `_${text}_ ` : ''
    }
    case 'li':
      return `\n- ${inner().trim()}`
    case 'ul':
    case 'ol':
      return `${inner()}\n`
    case 'div':
      if (el.classList.contains('bb_h1')) return `\n\n## ${inner().trim()}\n`
      if (el.classList.contains('bb_h2')) return `\n\n### ${inner().trim()}\n`
      if (el.classList.contains('bb_h3')) return `\n\n#### ${inner().trim()}\n`
      if (el.classList.contains('bb_code')) return `\n\`\`\`\n${el.text}\n\`\`\`\n`
      return `\n${inner()}\n`
    case 'blockquote':
      return `\n> ${inner().trim().replace(/\n/g, '\n> ')}\n`
    case 'tr':
      return `\n| ${el.childNodes.map(toText).filter((c) => c.trim()).join(' | ')} |`
    case 'td':
    case 'th':
      return inner().trim()
    case 'table':
      return `${inner()}\n`
    case 'a': {
      // Skip image wrappers; keep real links readable.
      const text = inner().trim()
      if (!text) return ''
      const href = unwrapLinkFilter(el.getAttribute('href'))
      return href && href.startsWith('http') && href !== text
        ? `[${text}](${href})`
        : text
    }
    case 'span':
      if (el.classList.contains('bb_spoiler')) return `||${inner().trim()}||`
      return inner()
    default:
      return inner()
  }
}
