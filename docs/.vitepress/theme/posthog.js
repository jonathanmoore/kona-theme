import posthog from 'posthog-js'

export function setupPostHog(router) {
  // Initialize PostHog
  posthog.init('phc_zMRKup374yVWNDZnfLqhrFSaw6kPybRxE6yqRRcqaoDo', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only', // Only create profiles for identified users
    capture_pageview: false, // Manual pageview tracking
    capture_pageleave: true, // Track time on page
    autocapture: false, // Manual event tracking for better control
  })

  // Track initial pageview
  posthog.capture('$pageview', {
    $current_url: window.location.href,
  })

  // Track SPA navigation using VitePress router
  router.onAfterRouteChanged = (to) => {
    posthog.capture('$pageview', {
      $current_url: window.location.href,
    })
  }

  return posthog
}

export function trackEvent(eventName, properties = {}) {
  posthog.capture(eventName, properties)
}
