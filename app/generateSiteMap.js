import { modelOptions, yearOptions } from './src/helpers/formOptions.js'

const lastMod = new Date().toISOString().slice(0, 10)

console.log(`<?xml version="1.0" encoding="utf-8" standalone="yes" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`)
yearOptions.forEach((year) => {
  modelOptions.forEach((m) => {
    const manufacturer = m.label.toLowerCase()
    m.options.forEach((option) => {
      console.log(`
<url>
  <loc>https://theevfinder.com/inventory/${year.value}/${manufacturer}/${option.value}/</loc>
  <lastmod>${lastMod}</lastmod>
</url>`)
    })
  })
})

console.log('</urlset>')
