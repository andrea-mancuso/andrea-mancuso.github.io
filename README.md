# Sito personale – Andrea Mancuso

Sito statico realizzato con [Astro](https://astro.build), pubblicato gratuitamente su GitHub Pages.
La struttura riprende il sito di [Cristian Tommasino](https://github.com/cristiantommasino/cristiantommasino.github.io),
con contenuti, colori e illustrazioni rifatti a tema Ricerca Operativa.

Tutti i contenuti stanno in file di testo nella cartella `src/data/`: per aggiornare il sito
non serve toccare il codice.

## Dove si modificano i contenuti

| Cosa | File |
|---|---|
| Nome, ruoli, bio breve e lunga, link (email, Scholar, Scopus, ORCID), numeri in home, percorso di carriera, collaborazioni, lingue | `src/data/profile.yaml` |
| Pubblicazioni (anche quelle in revisione) | `src/data/publications.bib` |
| Quartili delle riviste (SCImago) | `src/data/quartiles.yaml` |
| News | `src/data/news.yaml` |
| Linee di ricerca (testi, parole chiave, paper collegati) | `src/data/research.yaml` |
| Progetti e collaborazioni | `src/data/projects.yaml` |
| Service (EUROYoung/AIROYoung, comitati, panel, revisioni, premi, seminari, talk) | `src/data/service.yaml` |
| Corsi, tesi seguite, proposte di tesi | `src/data/teaching.yaml` |
| Foto, immagini | cartella `public/` |

Ogni file ha in cima un commento che spiega i campi.

### Aggiungere una pubblicazione
Apri `publications.bib`, copia una voce esistente e modificala. Oltre ai campi BibTeX standard puoi usare:

- `pubtype` – `journal`, `conference`, `chapter`, `submitted` (in revisione), `preprint`, `edited`, `thesis` (serve per i filtri).
  I lavori `submitted` compaiono nella pagina Publications con l'etichetta "Under review" ma non vengono contati in home.
- `abbr` – sigla della rivista o della conferenza mostrata come etichetta (es. `TR-C`, `EJOR`)
- `selected = {true}` – compare tra le "Selected publications" in home
- `award = {...}` – etichetta evidenziata sotto il paper (es. `Top 10 most-cited of 2023`)
- `nonalpha = {true}` – autori non in ordine alfabetico: compare la † come nel CV
- `pdf`, `code`, `arxiv`, `url` – link ai pulsanti PDF / Code / arXiv / Web (un link SSRN diventa il pulsante "SSRN")

Il tuo nome viene messo in grassetto automaticamente. Questi campi extra vengono tolti dal BibTeX mostrato ai visitatori.
Quando un lavoro in revisione viene accettato, cambia `@unpublished` in `@article`, `pubtype` in `journal`
e aggiungi `volume`, `pages`, `doi`.

### Quartili delle riviste
Accanto a ogni articolo su rivista compare il miglior quartile della rivista secondo lo
[SCImago Journal Rank](https://www.scimagojr.com) (Q1 verde, Q2 arancione), con il link alla pagina SCImago.
I valori sono in `src/data/quartiles.yaml`: SCImago li aggiorna una volta l'anno, di solito in primavera.
Quando succede, cambia `year` e i quartili. Se pubblichi su una rivista nuova, aggiungila alla lista
(nome della rivista come nel `.bib`, quartile e link): il badge compare da solo.

### Aggiungere una news
In `news.yaml` aggiungi in qualunque punto:

```yaml
- date: 2026-12-01
  tag: talk
  text: Invited seminar at [Nome evento](https://...) on covering tour problems.
```

La home mostra le 5 più recenti; c'è anche un feed RSS (`/feed.xml`).

### Percorso di carriera (home)
In fondo alla home la carriera è disegnata come un percorso, senza date: la linea continua passa per studi e
posizioni, i periodi all'estero sono "sortite del drone" tratteggiate che escono dalla linea e ci rientrano.
Le tappe sono nella lista `career` di `profile.yaml`, in ordine dalla prima a oggi. Per ogni tappa:
`kind` (`education`, `position` o `visiting`), `what`, `where`, `detail` facoltativo e `current: true`
per i ruoli in corso, che vengono evidenziati in arancione.

### Proposte di tesi
In `teaching.yaml` ci sono quattro proposte già scritte, in inglese come il resto del sito (città dei 15 minuti,
camion e droni, ML per il routing, collegi elettorali), con `draft: true`: sono visibili solo nell'anteprima locale,
con l'etichetta "Draft".
Rileggile e metti `draft: false` per pubblicarle.

### Foto e immagini
- **Foto**: `public/images/profile.jpg` (quadrata, circa 600×600 px). Se manca, compaiono le iniziali.
- **CV in PDF**: al momento il sito non lo mostra. Per rimettere il pulsante "CV (PDF)" copia il file in
  `public/cv/` e scrivi il percorso in `cv_pdf` dentro `profile.yaml` (es. `cv/Andrea_Mancuso_CV.pdf`).
- **Animazione in home**: è in `src/components/HeroCanvas.astro` (tour del camion con TSP nearest neighbour + 2-opt,
  sortite del drone, facility che copre la domanda attorno al cursore). Con "riduci movimento" attivo nel sistema
  operativo viene mostrato un solo fotogramma fisso.
- **Anteprima social** (`public/og.png`): se cambi nome o ruolo, rigenerala con `python scripts/make-og.py`
  (serve Pillow: `pip install pillow`).

## Aggiornamenti automatici (ogni lunedì)

Il workflow `.github/workflows/update-data.yml` gira ogni lunedì alle 5:00 UTC (oppure a mano da
**Actions → Update data → Run workflow**) ed esegue `scripts/update-data.mjs`, che usa
[OpenAlex](https://openalex.org) tramite il tuo ORCID:

- **h-index e citazioni**: aggiorna `src/data/metrics.json`; se i numeri cambiano li salva direttamente
  e il sito si ripubblica da solo. In home compaiono con la nota "OpenAlex, mese anno".
  Finché il workflow non è girato la prima volta questi due numeri non vengono mostrati: lancialo a mano
  subito dopo la prima pubblicazione. Per usare numeri tuoi (es. Scopus) scrivi il valore in `stats`
  di `profile.yaml` al posto di `auto:...`.
- **Nuove pubblicazioni**: confronta i tuoi lavori su OpenAlex con `publications.bib` (per DOI o titolo)
  e apre una **pull request** con le voci mancanti, scaricate da doi.org. Controlla autori, venue e `pubtype`,
  aggiungi se vuoi `abbr`, poi fai *Merge*: a quel punto vanno online.

Perché il workflow possa aprire le pull request va abilitato una volta:
**Settings → Actions → General → Workflow permissions →** "Read and write permissions" e
"Allow GitHub Actions to create and approve pull requests".

In locale: `node scripts/update-data.mjs --dry-run` mostra cosa cambierebbe senza modificare i file.

## Pubblicare su GitHub Pages (la prima volta)

L'indirizzo del sito dipende dal nome del repository:

- repository `<utente>.github.io` → sito su `https://<utente>.github.io`
- qualunque altro nome (es. `website`) → sito su `https://<utente>.github.io/website/` (i link si adattano da soli)

Se il tuo username GitHub non è quello che vuoi nell'indirizzo, puoi fare come Cristian: crea un'organizzazione
gratuita (**+ → New organization → Free**, es. `andreamancuso`) e metti lì il repository `andreamancuso.github.io`.

1. Su GitHub crea un repository **pubblico** e **vuoto** (senza README) con il nome scelto.
2. Dalla cartella del progetto:
   ```bash
   git init -b main
   git add .
   git commit -m "Primo commit del sito"
   git remote add origin https://github.com/<utente>/<utente>.github.io.git
   git push -u origin main
   ```
3. Nel repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Il workflow `.github/workflows/deploy.yml` parte a ogni push; dopo 1–2 minuti il sito è online
   (lo stato si vede nella scheda **Actions**).
5. Lancia una volta a mano **Actions → Update data → Run workflow** per avere h-index e citazioni.

### Dominio personalizzato (facoltativo)
In **Settings → Pages → Custom domain** inserisci il dominio e configura il DNS come indicato da GitHub.
Non serve cambiare il codice: il workflow usa automaticamente l'indirizzo giusto.

## Aggiornare il sito

**Dal browser (senza installare nulla):** apri il file su github.com, clicca la matita ✏️, modifica e fai
*Commit changes*. Il sito si aggiorna da solo in 1–2 minuti. Se qualcosa non va, la scheda **Actions** mostra l'errore
(di solito una virgola o una parentesi graffa mancante nel `.bib`, o un'indentazione sbagliata nello YAML).

**In locale (per vedere l'anteprima prima di pubblicare):** installa [Node.js](https://nodejs.org) 22 o superiore, poi:

```bash
npm install
npm run dev
```

e apri http://localhost:4321. Con `npm run build` generi la versione finale nella cartella `dist/`.

## Struttura del codice

```
src/
  data/        contenuti modificabili (YAML + BibTeX)
  lib/         lettura dei dati e parser BibTeX
  components/  pezzi riutilizzabili (pubblicazione, news, icone, animazione)
  layouts/     struttura comune delle pagine (header, footer, SEO)
  pages/       una pagina per sezione
  styles/      colori, caratteri e layout (palette blu notte / ambra / verde acqua, tema chiaro e scuro)
public/        file copiati così come sono (favicon, og.png, foto)
scripts/       aggiornamento dati da OpenAlex, generazione dell'anteprima social
```
