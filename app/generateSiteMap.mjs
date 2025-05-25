import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { modelOptions, yearOptions } from './src/helpers/formOptions.js';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define output path - defaults to public directory but can be overridden with env variable
const outputDir = process.env.SITEMAP_OUTPUT_DIR || path.join(__dirname, 'public');
const outputPath = path.join(outputDir, 'sitemap.xml');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate sitemap content
const generateSitemap = () => {
  const lastMod = new Date().toISOString().slice(0, 10);
  
  let sitemap = `<?xml version="1.0" encoding="utf-8" standalone="yes" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // Include the homepage
  sitemap += `
<url>
  <loc>https://theevfinder.com/</loc>
  <lastmod>${lastMod}</lastmod>
  <priority>1.0</priority>
</url>`;

  yearOptions.forEach((year) => {
    modelOptions.forEach((m) => {
      const manufacturer = m.label.toLowerCase();
      m.options.forEach((option) => {
        sitemap += `
<url>
  <loc>https://theevfinder.com/inventory/${year.value}/${manufacturer}/${option.value}/</loc>
  <lastmod>${lastMod}</lastmod>
</url>`;
      });
    });
  });

  sitemap += '\n</urlset>';
  return sitemap;
};

// Write sitemap to file
try {
  const sitemap = generateSitemap();
  fs.writeFileSync(outputPath, sitemap);
  console.log(`Sitemap successfully generated at ${outputPath}`);
} catch (error) {
  console.error('Error generating sitemap:', error);
  process.exit(1);
}
