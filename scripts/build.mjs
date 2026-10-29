import { mkdir, rm, cp, readFile } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('src', 'dist', { recursive: true });
await cp('public', 'dist', { recursive: true });
await rm('docs', { recursive: true, force: true });
await cp('dist', 'docs', { recursive: true });
const html = await readFile('dist/index.html', 'utf8');
for (const marker of ['Worldgraph', 'app.js', 'style.css', './downloads/worldgraph-architecture-introduction.md']) {
  if (!html.includes(marker)) throw new Error(`Missing required site content: ${marker}`);
}
console.log('Built dist/ and GitHub Pages docs/ with Markdown download.');
