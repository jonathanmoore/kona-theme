import { trackEvent } from './posthog'

export function setupClickTracking() {
  // Track outbound link clicks
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a')
    if (link && link.href) {
      const url = new URL(link.href, window.location.origin)

      // External links
      if (url.origin !== window.location.origin) {
        trackEvent('outbound_link_click', {
          url: link.href,
          text: link.textContent.trim(),
          section: document.querySelector('h1')?.textContent || 'Unknown',
        })
      }
    }

    // Track code copy button clicks
    const copyButton = e.target.closest('.copy')
    if (copyButton) {
      const codeBlock = copyButton.closest('div[class*="language-"]')
      const language = codeBlock?.className.match(/language-(\w+)/)?.[1] || 'unknown'

      trackEvent('code_copied', {
        language,
        section: document.querySelector('h1')?.textContent || 'Unknown',
      })
    }
  })
}
