import 'vite/modulepreload-polyfill'
import { initDisclosureWidgets } from '@/lib/a11y'
import 'vite-plugin-shopify-theme-islands/revive'

const summaries = document.querySelectorAll('[id^="Details-"] summary')

initDisclosureWidgets(summaries)
