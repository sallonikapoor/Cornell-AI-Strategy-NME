import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { renderSchedule } from './render-schedule.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const src = resolve(root, 'src');
const dist = resolve(root, 'dist');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read = path => readFileSync(resolve(src, path), 'utf8').replace(/\r\n/g, '\n');
const pages = JSON.parse(read('pages.json'));
const weeks = JSON.parse(read('data/weeks.json'));
const files = new Map();
const safePath = (base, path) => {
  const resolved = resolve(base, path);
  if (!resolved.startsWith(base + sep)) throw new Error(`Path outside ${base}: ${path}`);
  return resolved;
};

function collectAssets(directory) {
  for (const entry of readdirSync(directory, {withFileTypes:true})) {
    const path = resolve(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Asset symlinks are not supported: ${path}`);
    if (entry.isDirectory()) collectAssets(path);
    else {
      const content = readFileSync(path);
      files.set(relative(src, path).split(sep).join('/'), /\.(css|js)$/.test(path)
        ? content.toString('utf8').replace(/\r\n/g, '\n') : content);
    }
  }
}
collectAssets(resolve(src, 'assets'));
const outputs = new Set(pages.map(page => page.output));
if (outputs.size !== pages.length) throw new Error('Duplicate page output');
for (const name of readdirSync(resolve(src, 'weeks'))) {
  if (name.endsWith('.html') && !name.startsWith('_') && !pages.some(p => p.source === `weeks/${name}`)) {
    throw new Error(`Register weeks/${name} in src/pages.json`);
  }
}
const schedule = renderSchedule(weeks, outputs);
const layout = read('partials/layout.html').replace(/{{> (\w+)}}/g, (_, name) => read(`partials/${name}.html`).trim());

for (const page of pages) {
  safePath(dist, page.output);
  safePath(src, page.source);
  if (!page.output.endsWith('/index.html') && page.output !== 'index.html') throw new Error('Pages must use directory indexes');
  if (page.source.split('/').pop().startsWith('_')) throw new Error('Templates must never be published');
  const base = '../'.repeat(page.output.split('/').length - 1);
  const assetURL = name => {
    if (!files.has(name)) throw new Error(`Missing asset: ${name}`);
    const hash = createHash('sha256').update(files.get(name)).digest('hex').slice(0,12);
    return `${base}${name}?v=${hash}`;
  };
  const variables = Object.fromEntries(Object.entries(page).filter(([,v]) => typeof v === 'string').map(([k,v]) => [k,escape(v)]));
  Object.assign(variables, {
    base,
    courseLabelHtml:page.courseLabelHtml,
    sidebarContextHtml:page.sidebarContextHtml,
    bodyAttribute:page.bodyClass ? ` class="${escape(page.bodyClass)}"` : '',
    chapterLinks:page.chapters.map((chapter,i) => `<a href="#${escape(chapter.id)}"${i === 0 ? ' class="active" aria-current="location"' : ''}><span>${escape(chapter.number)}</span> ${escape(chapter.label)}</a>`).join(''),
    styles:page.styles.map(name => `<link rel="stylesheet" href="${assetURL(name)}">`).join(''),
    scripts:page.scripts.map(name => `<script src="${assetURL(name)}" ${page.moduleScripts ? 'type="module"' : 'defer'}></script>`).join(''),
    content:read(page.source).replace(/<!-- INCLUDE: (.*?) -->/g, (_, path) => { safePath(src, path); return read(path); }).replace('<!-- SCHEDULE_ROWS -->',schedule)
      .replace(/<!-- BLUEPRINT_TEMPLATE_LINK: (.*?) -->/g, (_, url) => {
        if (/^TEMPLATE_URL(?:_WEEK\d+)?$/.test(url)) return '';
        if (!/^https?:\/\//.test(url)) throw new Error('Blueprint template must use an HTTP(S) URL');
        new URL(url);
        return `<p>Want a head start? <a href="${escape(url)}">Make a copy of the template</a></p>`;
      }).trim()
  });
  const pageLayout = page.layout ? read(page.layout) : layout;
  const html = pageLayout.replace(/{{(\w+)}}/g, (_,key) => {
    if (!(key in variables)) throw new Error(`Unknown layout field: ${key}`);
    return variables[key];
  });
  if (/{{[^}]+}}/.test(html)) throw new Error(`Unresolved template in ${page.source}`);
  files.set(page.output,html);
}

// Offline cache is scoped to Week 2; it cannot intercept the hub or Week 1.
const offlinePaths = [...files.keys()].filter(path => path.startsWith('week-2/') || path.startsWith('assets/'));
const revision = createHash('sha256').update(offlinePaths.map(path => String(files.get(path))).join('')).digest('hex').slice(0,12);
files.set('week-2/sw.js', `const CACHE='cais-week-2-${revision}';
const URLS=${JSON.stringify(offlinePaths.map(path => '../' + path))};
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(URLS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('cais-week-2-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(async()=>{const direct=await caches.match(event.request,{ignoreSearch:true});if(direct)return direct;const url=new URL(event.request.url);if(url.pathname.endsWith('/'))url.pathname+='index.html';return (await caches.match(url.href,{ignoreSearch:true}))||Response.error();}));});`);

// Validate generated local routes, assets and anchors before replacing output.
const ids = new Map();
for (const [path,content] of files) if (path.endsWith('.html')) {
  const found=[...String(content).matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  if (new Set(found).size !== found.length) throw new Error(`Duplicate IDs in ${path}`);
  ids.set(path,new Set(found));
}
for (const [path,content] of files) if (path.endsWith('.html')) {
  for (const [,link] of String(content).matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    if (/^(?:[a-z]+:|\/\/)/i.test(link)) continue;
    const target=new URL(link,`https://build.invalid/${path}`);
    let targetPath=decodeURIComponent(target.pathname.slice(1));
    if (!targetPath || targetPath.endsWith('/')) targetPath+='index.html';
    if (!files.has(targetPath)) throw new Error(`Broken local link ${link} in ${path}`);
    if (target.hash && !ids.get(targetPath)?.has(decodeURIComponent(target.hash.slice(1)))) throw new Error(`Broken anchor ${link} in ${path}`);
  }
}
// Only the known project output directory may be cleaned. No authored input is
// read from dist, and all source validation happens before this removal.
if (dist !== resolve(root,'dist') || dirname(dist) !== resolve(root)) throw new Error('Unsafe output directory');
rmSync(dist,{recursive:true,force:true});
for (const [path,content] of files) {
  const output=safePath(dist,path);
  mkdirSync(dirname(output),{recursive:true});
  writeFileSync(output,content);
}
console.log(`Built ${pages.length} pages and ${files.size-pages.length} assets. All local links and anchors verified.`);
