import '../css/app.css'

import { createApp, h, type DefineComponent } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import AppLayout from './Layouts/AppLayout.vue'

createInertiaApp({
  title: (title) => (title ? `${title} — Facturo` : 'Facturo'),
  resolve: async (name) => {
    const pages = import.meta.glob<DefineComponent>('./Pages/**/*.vue')
    const page = await pages[`./Pages/${name}.vue`]()
    page.default.layout ??= (pageEl: any) => h(AppLayout, null, { default: () => pageEl })
    return page
  },
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
  progress: { color: '#2457F5' },
})
