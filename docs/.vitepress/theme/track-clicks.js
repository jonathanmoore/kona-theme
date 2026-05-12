export function track(name, props) {
  if (typeof window === 'undefined') return
  window.umami?.track(name, props)
}

export function setupClickTracking() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a')
    if (link && link.href) {
      const url = new URL(link.href, window.location.origin)

      if (url.origin !== window.location.origin) {
        track('outbound_link_click', {
          url: link.href,
          text: link.textContent.trim(),
          section: document.querySelector('h1')?.textContent || 'Unknown',
        })
      }
    }

    const copyButton = e.target.closest('.copy')
    if (copyButton) {
      const codeBlock = copyButton.closest('div[class*="language-"]')
      const language = codeBlock?.className.match(/language-(\w+)/)?.[1] || 'unknown'

      track('code_copied', {
        language,
        section: document.querySelector('h1')?.textContent || 'Unknown',
      })
    }
  })
}
