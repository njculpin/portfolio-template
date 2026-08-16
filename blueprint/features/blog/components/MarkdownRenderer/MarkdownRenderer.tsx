import { useState, useEffect } from 'react'
import styles from './MarkdownRenderer.module.css'

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function parseMarkdown(md) {
  // Sanitize raw HTML tags in source
  let html = md.replace(/<(\/?)(script|iframe|object|embed|form|input|button|textarea|select|style|link|meta)(\s[^>]*)?\/?>/gi, '')

  html = html
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`)
    // Inline code
    .replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`)
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Bold (must run before italic)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic (use negative lookbehind/ahead to avoid matching inside bold markers)
    .replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '<em>$1</em>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr />')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')

  // Paragraphs: wrap remaining lines that aren't already HTML
  html = html
    .split('\n\n')
    .map((block) => {
      block = block.trim()
      if (!block) return ''
      if (block.startsWith('<')) return block
      return `<p>${block.replace(/\n/g, '<br />')}</p>`
    })
    .join('\n')

  return html
}

export default function MarkdownRenderer({ contentLoader, slug }) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    if (!contentLoader) return
    contentLoader().then((raw) => {
      // Rewrite relative image paths to point to blog folder
      const processed = raw.replace(
        /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
        (_, alt, src) => `![${alt}](/blog/${slug}/${src})`,
      )
      setHtml(parseMarkdown(processed))
    })
  }, [contentLoader, slug])

  if (!html) return null

  return (
    <div
      className={styles.markdown}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
