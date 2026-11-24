// Ready-made citations for the "Cite" dialog, built once at build time from the BibTeX fields:
// MLA, APA, Chicago, Harvard and Vancouver (the styles Google Scholar offers), plus RIS for
// EndNote, Zotero and Mendeley. The styles return HTML (titles of journals and books in <i>).

import { cleanLatex, splitAuthors, type BibEntry } from './bibtex';

export interface CiteStyle {
  name: string;
  html: string;
}

export interface Citation {
  styles: CiteStyle[];
  ris: string;
  doi: string;
}

interface Person {
  last: string;
  initials: string[]; // ["A.", "M."] or hyphenated ["J.-P."]
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const it = (s: string) => (s ? `<i>${esc(s)}</i>` : '');

function people(field: string): Person[] {
  return splitAuthors(field).map(({ first, last }) => ({
    last,
    initials: first
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.split('-').map((p) => `${p.replace(/\.$/, '')[0]}.`).join('-')),
  }));
}

// "Last, A. M."
const lastFirst = (p: Person) => `${p.last}, ${p.initials.join(' ')}`.trim();
// "A. M. Last"
const firstLast = (p: Person) => `${p.initials.join(' ')} ${p.last}`.trim();
// "Last AM"
const vancouverName = (p: Person) => `${p.last} ${p.initials.join('').replace(/[.\-]/g, '')}`.trim();

function joinList(items: string[], last: string): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')}${last}${items[items.length - 1]}`;
}

// End a sentence with exactly one full stop ("Title?" stays as it is).
const stop = (s: string) => (/[.?!]$/.test(s) ? s : `${s}.`);

const isRange = (pages: string) => /[–-]/.test(pages);
// "254--276" -> "254–276"
const dash = (pages: string) => cleanLatex(pages).replace(/\s*[–-]+\s*/, '–');
// Vancouver: "254-76"
function vancouverPages(pages: string): string {
  const [a, b] = dash(pages).split('–');
  if (!b) return a;
  let i = 0;
  while (i < a.length && i < b.length - 1 && a.length === b.length && a[i] === b[i]) i++;
  return `${a}-${b.slice(i)}`;
}

type Kind = 'article' | 'chapter' | 'thesis';

export function buildCitation(entry: BibEntry): Citation | null {
  const f = entry.fields;
  if (!f.author || f.pubtype === 'submitted' || entry.type === 'unpublished') return null;

  // Proceedings published as a journal (IFAC-PapersOnLine, Transportation Research Procedia)
  // are cited like journal articles.
  const kind: Kind =
    entry.type === 'phdthesis' || entry.type === 'mastersthesis'
      ? 'thesis'
      : entry.type === 'article' || (entry.type === 'inproceedings' && !f.publisher && f.volume)
        ? 'article'
        : 'chapter';

  const authors = people(f.author);
  const title = cleanLatex(f.title);
  const container = cleanLatex(f.journal || f.booktitle || '');
  const series = cleanLatex(f.series || '');
  const publisher = cleanLatex(f.publisher || '');
  const school = cleanLatex(f.school || '');
  const year = f.year || 'n.d.';
  const volume = f.volume || '';
  const number = f.number || '';
  const pages = f.pages ? dash(f.pages) : '';
  const doi = f.doi || '';
  const doiUrl = doi ? `https://doi.org/${doi}` : '';
  const link = doiUrl || f.url || '';

  // ------------------------------------------------------------------ MLA (9th ed.)
  const mlaAuthors =
    authors.length === 1
      ? lastFirst(authors[0])
      : authors.length === 2
        ? `${lastFirst(authors[0])}, and ${firstLast(authors[1])}`
        : `${lastFirst(authors[0])}, et al`;
  const mlaPages = pages ? (isRange(pages) ? `pp. ${pages}` : `p. ${pages}`) : '';
  let mla = `${esc(stop(mlaAuthors))} “${esc(stop(title))}” `;
  if (kind === 'article')
    mla += [it(container), volume && `vol. ${volume}`, number && `no. ${number}`, year, mlaPages].filter(Boolean).join(', ') + '.';
  else if (kind === 'chapter') mla += [it(container), esc(publisher), year, mlaPages].filter(Boolean).join(', ') + '.';
  else mla = `${esc(stop(mlaAuthors))} ${it(stop(title))} ${year}. ${esc(school)}, PhD dissertation.`;

  // ------------------------------------------------------------------ APA (7th ed.)
  const apaNames = authors.map(lastFirst);
  const apaAuthors =
    apaNames.length > 20
      ? `${apaNames.slice(0, 19).join(', ')}, … ${apaNames[apaNames.length - 1]}`
      : joinList(apaNames, ', & ');
  let apa = `${esc(apaAuthors)} (${year}). `;
  if (kind === 'article') {
    const loc = pages ? (isRange(pages) ? pages : `Article ${pages}`) : '';
    apa += `${esc(stop(title))} ${it(container)}${volume ? `, ${it(volume)}` : ''}${number ? `(${esc(number)})` : ''}${loc ? `, ${esc(loc)}` : ''}.`;
  } else if (kind === 'chapter') {
    const inner = [series && volume ? `Vol. ${volume}` : '', pages && `pp. ${pages}`].filter(Boolean).join(', ');
    apa += `${esc(stop(title))} In ${it(container)}${inner ? ` (${esc(inner)})` : ''}.${publisher ? ` ${esc(publisher)}.` : ''}`;
  } else {
    apa += `${it(title)} [Doctoral dissertation, ${esc(school)}].`;
  }
  if (link) apa += ` ${esc(link)}`;

  // ------------------------------------------------------------------ Chicago (17th ed., bibliography)
  const chiList = authors.length > 10 ? authors.slice(0, 7) : authors;
  const chiNames = chiList.map((p, i) => (i === 0 ? lastFirst(p) : firstLast(p)));
  const chiAuthors = authors.length > 10 ? `${chiNames.join(', ')}, et al` : joinList(chiNames, ', and ');
  let chicago = `${esc(stop(chiAuthors))} “${esc(stop(title))}” `;
  if (kind === 'article')
    chicago += `${it(container)}${volume ? ` ${esc(volume)}` : ''}${number ? `, no. ${esc(number)}` : ''} (${year})${pages ? `: ${esc(pages)}` : ''}.`;
  else if (kind === 'chapter')
    chicago += `In ${it(container)}${pages ? `, ${esc(pages)}` : ''}.${series ? ` ${esc(series)}${volume ? ` ${esc(volume)}` : ''}.` : ''} ${[publisher, year].filter(Boolean).map(esc).join(', ')}.`;
  else chicago = `${esc(stop(chiAuthors))} “${esc(stop(title))}” PhD diss., ${esc(school)}, ${year}.`;
  if (doiUrl) chicago += ` ${esc(doiUrl)}.`;

  // ------------------------------------------------------------------ Harvard
  const harvAuthors = joinList(authors.map(lastFirst), ' and ');
  let harvard = `${esc(harvAuthors)}, ${year}. `;
  if (kind === 'article')
    harvard += `${esc(stop(title))} ${it(container)}${volume ? `, ${esc(volume)}` : ''}${number ? `(${esc(number)})` : ''}${pages ? `, ${isRange(pages) ? 'pp.' : 'p.'}${esc(pages)}` : ''}.`;
  else if (kind === 'chapter')
    harvard += `${esc(stop(title))} In ${it(container)}${pages ? ` (pp. ${esc(pages)})` : ''}.${publisher ? ` ${esc(publisher)}.` : ''}`;
  else harvard += `${it(stop(title))} Doctoral dissertation, ${esc(school)}.`;

  // ------------------------------------------------------------------ Vancouver
  const vanNames = authors.map(vancouverName);
  const vanAuthors = vanNames.length > 6 ? `${vanNames.slice(0, 6).join(', ')}, et al` : vanNames.join(', ');
  let vancouver = `${esc(vanAuthors)}. ${esc(stop(title))} `;
  const vp = pages ? vancouverPages(f.pages) : '';
  if (kind === 'article')
    vancouver += `${esc(container)}. ${year}${volume ? `;${esc(volume)}` : ''}${number ? `(${esc(number)})` : ''}${vp ? `:${esc(vp)}` : ''}.`;
  else if (kind === 'chapter')
    vancouver += `In: ${esc(container)}. ${publisher ? `${esc(publisher)}; ` : ''}${year}.${vp ? ` p. ${esc(vp)}.` : ''}`;
  else vancouver = `${esc(vanAuthors)}. ${esc(title)} [dissertation]. ${esc(school)}; ${year}.`;

  // ------------------------------------------------------------------ RIS
  const ty = kind === 'thesis' ? 'THES' : kind === 'article' ? (entry.type === 'inproceedings' ? 'CONF' : 'JOUR') : entry.type === 'inproceedings' ? 'CONF' : 'CHAP';
  const [sp, ep] = pages.split('–');
  const ris = [
    `TY  - ${ty}`,
    ...authors.map((p) => `AU  - ${lastFirst(p)}`),
    `TI  - ${title}`,
    container && `T2  - ${container}`,
    ty === 'JOUR' && container && `JO  - ${container}`,
    series && `T3  - ${series}`,
    `PY  - ${year}`,
    volume && `VL  - ${volume}`,
    number && `IS  - ${number}`,
    sp && `SP  - ${sp}`,
    ep && `EP  - ${ep}`,
    publisher && `PB  - ${publisher}`,
    school && `PB  - ${school}`,
    doi && `DO  - ${doi}`,
    link && `UR  - ${link}`,
    'ER  - ',
    '',
  ]
    .filter(Boolean)
    .join('\r\n');

  return {
    styles: [
      { name: 'MLA', html: mla },
      { name: 'APA', html: apa },
      { name: 'Chicago', html: chicago },
      { name: 'Harvard', html: harvard },
      { name: 'Vancouver', html: vancouver },
    ],
    ris,
    doi,
  };
}
