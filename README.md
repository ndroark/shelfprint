# Shelfprint

**Make something of your reading.**

Explore your reading habits with charts and cover galleries. Make monthly wrap-ups and a shareable year in books, all from your own reading log. No account required. Your file is read in your browser and never uploaded.

I spent a year closely cataloging my reading in a spreadsheet, adding new fields and finding new questions I wanted the data to answer. Eventually, the visualizations I wanted exceeded what I could comfortably build in Excel, so I began experimenting with HTML.

I wanted to keep the spreadsheet experience for entering and managing books, without depending on an external reading platform. I also wanted to share my reading with friends and communities, including people who don't use reading apps themselves. Shelfprint grew out of those experiments.

Two pieces work together to make your own shelfprint:

- **Shelfprint Tracker**, a spreadsheet template for Google Sheets, Excel, or LibreOffice Calc, where you log your books.
- **The Shelfprint page**, a single web page that reads an export of that spreadsheet and turns it into monthly wrap-ups, a full-year dashboard, share images, and **My Year in Books**, a set of year-end images you can download, copy, save, and post.

Plenty of sites will make a year-end recap from your reading. They decide what goes in it, using rules you can't see, from data they keep. Shelfprint works the other way around. Your log stays in your own spreadsheet. The page reads it in your browser and never uploads it. Every image in My Year in Books comes with a note on precisely what it counted and how, and you choose which images to include, which books to feature, and what order they go in.

No server, and no Goodreads, Kindle, or Amazon. Use whichever spreadsheet program you like.

> **Video tutorial:** *(link coming soon)*

---

## Contents

- [Quick start](#quick-start)
- [What's included](#whats-included)
- [The spreadsheet](#the-spreadsheet)
  - [The minimum you need](#the-minimum-you-need)
  - [How books are placed in a year and a month](#how-books-are-placed-in-a-year-and-a-month)
  - [Tabs](#tabs)
  - [Reading Log columns](#reading-log-columns)
  - [The rating matrix](#the-rating-matrix)
  - [The Checks tab](#the-checks-tab)
  - [Capacity](#capacity)
  - [Using Excel instead of Google Sheets](#using-excel-instead-of-google-sheets)
  - [Using LibreOffice Calc](#using-libreoffice-calc)
- [The page](#the-page)
  - [Loading your log](#loading-your-log)
  - [Year and month views](#year-and-month-views)
  - ["Check your sheet"](#check-your-sheet)
  - [Covers](#covers)
  - [Share images](#share-images)
- [My Year in Books](#my-year-in-books)
- [Privacy and outside connections](#privacy-and-outside-connections)
- [What's saved in your browser](#whats-saved-in-your-browser)
- [Hosting your own copy](#hosting-your-own-copy)
- [Troubleshooting](#troubleshooting)
- [Known limits](#known-limits)
- [License](#license)
- [Credits](#credits)

---

## Quick start

1. **Copy or download the template.** Open the [Shelfprint Tracker Google Sheets template](https://docs.google.com/spreadsheets/d/1dd7IoW6CZ1FUxA6jXaDFAfBWa-cRUX_9D34pGI1SGjk/copy) and choose **Make a copy**, or download `Shelfprint_Tracker.xlsx` for Excel or `Shelfprint_Tracker.ods` for LibreOffice Calc from this repository.
2. **Log your books** on the **Reading Log** tab. Only **Title** and **End date** are required. No End date? Use **Month read** plus **Year read**. Row 3 is an example; type over it or clear it.
3. **Export the Reading Log tab as a CSV file.**
   - Google Sheets: open the Reading Log tab, then **File → Download → Comma-separated values (.csv)**.
   - Excel: see [Using Excel instead of Google Sheets](#using-excel-instead-of-google-sheets).
   - LibreOffice Calc: see [Using LibreOffice Calc](#using-libreoffice-calc).
4. **Open `shelfprint.html`** in a web browser, and drop the CSV onto it or click **Choose a file…**.

Just want to see what it does? On the first screen, click **try it with sample books**. The samples are public-domain classics with an invented reader's ratings and notes. Nothing is saved.

---

## What's included

| File | What it is |
|---|---|
| `shelfprint.html` | The whole Shelfprint page in one file: no install, no build step. Open it locally, or host it anywhere that serves static files. |
| `Shelfprint_Tracker.xlsx` | The Shelfprint Tracker template for Excel (Microsoft 365 or Excel 2019 and later). |
| `Shelfprint_Tracker.ods` | The OpenDocument version of the tracker for LibreOffice Calc. Major spreadsheet functions and CSV import into Shelfprint have been tested. |
| [Google Sheets template](https://docs.google.com/spreadsheets/d/1dd7IoW6CZ1FUxA6jXaDFAfBWa-cRUX_9D34pGI1SGjk/copy) | The same template for Google Sheets. The link makes a copy in your own Google Drive. |
| `index.html` | Sends visitors to `shelfprint.html`, so the page opens at the site's main address on GitHub Pages. |
| `README.md` | This file. |
| `LICENSE` | The MIT License. |

---

## The spreadsheet

### The minimum you need

Every finished or DNF book needs a **Title** and one of these:

- an **End date**, or
- a **Month read** plus a four-digit **Year read**.

That's all. Every other column is optional. Leave a column blank, and the page skips the sections that need it. A reader who tracks only titles and dates still gets a complete, shorter wrap-up. Tracking more (ratings, formats, genres, and tags) adds more charts and images.

### How books are placed in a year and a month

The spreadsheet and the page use the same rules, so the counts in your sheet and on the page agree.

**Year**, for books marked Finished or DNF:

1. The year of the **End date**.
   - One exception: if **Month read** is December and the End date is in early January, the book stays in December's year. A book you finished just after New Year can still count toward the year you mostly read it in.
2. Otherwise, **Year read**, if it's a whole four-digit year.
3. Otherwise, the book has **no year**. It isn't counted in any year, and both the Checks tab and the page tell you about it. Neither ever guesses a year.

**Month:** **Month read** when it's filled in, otherwise the month of the End date. A Month read one month before the End date is treated as normal (a book that straddles two months). Larger differences are flagged as advisories, and Month read still wins.

**Reading** and **Paused** books don't belong to a finishing year. The page shows them under **Currently reading**, which covers all years.

If both an End date and a Year read are present and they disagree, the End date wins, and the disagreement is flagged.

### Tabs

| Tab | What it's for |
|---|---|
| **Reading Log** | One row per book you read, are reading, or set aside. The page reads this tab. |
| **TBR** | Books you want to read: where you heard about them, library holds, and wait times. The strip at the top counts holds and how long the oldest book has waited. When you start a book, tick **Started?** and keep the row. The Reading Log looks up where you heard about it, if you have entered that data. |
| **Series** | One row per series. Read this year, Last read #, Next up #, Left to read, and Next access fill themselves in from the Reading Log and TBR. |
| **Fields** | A guide to every column: what to enter, an example, and what it's used for in Shelfprint. |
| **Lists** | The choices behind every dropdown (genres, formats, statuses, sources, and so on). Add your own at the bottom of any list. |
| **Settings** | **Reading year**, which only sets the year counted in the Series tab's *Read this year* column. It doesn't decide which year a book belongs to. |
| **Checks** | Data checks that update as you type. See [The Checks tab](#the-checks-tab). |
| **Found covers** | Optional. Covers the page looked up, pasted back into your sheet so they stay with your data. See [Covers](#covers). |
| `_ChecksData` (hidden) | Helper calculations for the Checks, Series, and Reading Log tabs. Don't edit or delete it. |

Gray (calculated) columns fill themselves in. Don't type in them.

### Reading Log columns

The **Fields** tab describes every column in detail. In order:

| Group | Columns |
|---|---|
| **Core data** | Title, Author, Status |
| **When you read it** | Start date, End date, Month read, Year read |
| **About the book** | New-to-me author?, Genre, Sub-genre(s) |
| **Rating matrix** | Character pressure, Style & Voice, Conceptual Charge, Structure & Form, Affective Afterlife, Matrix Average *(calculated)* |
| **Simple rating** | Rating |
| **Additional data** | Series, Series #, Publication year, Audience, Form, Format, Page count, Word count, Audio length, Listening speed |
| **Reading data** | Days to read, Percent at DNF?, Reread?, Source, How I found it, Recommended by, Publisher, Imprint, Original title, Original language, Language read, Author gender, Bipoc author?, Tags, Narrative perspective, Freeform thoughts, Translator, Narrator, Illustrator / artist |
| **Identifiers** | ISBN, Cover URL, Found cover *(calculated)*, Record ID |

A few columns worth knowing about:

- **Author:** "Last, First" or "First Last" both work. Separate co-authors with a semicolon.
- **Rating and matrix scores:** any number from 0.5 to 5, in whatever steps you like (3.75 is fine).
- **Audio length:** hours:minutes, such as `10:30`. **Listening speed:** a decimal such as `1.5`; blank means 1×. The page reports both total audio length and actual listening time.
- **Tags and Sub-genre(s):** comma-separated, all in one cell. Reuse the same wording each time ("Grief", not "Grieving") so they count together. The Checks tab catches tags that differ only by capital letters or a final s.
- **How I found it / Recommended by:** fill themselves in from the TBR tab when the title matches there. Type over them for books that weren't on your TBR.
- **Cover URL:** a link to a cover image you chose. It always wins over looked-up covers.
- **Record ID:** optional. A code for the row that never changes, such as `2026-001`. Use it when you log two editions of the same title, or a reread, and want each row to keep its own cover. Don't reuse an ID.

The page finds columns **by their header names**, not their positions. You can reorder columns, and other spreadsheets work too, as long as the headers match. A few alternative headers are also recognized, such as "Date finished" for End date or "Pages" for Page count.

### The rating matrix

The five matrix categories are a suggestion. You can rename them, and you can add or remove categories, as long as all the score columns sit **directly to the left of Matrix Average**:

- The page uses up to eight matrix columns and shows whatever names you give them.
- **Matrix Average** is calculated only when every score in the row is filled in. One blank score means no average, never a misleading partial one.
- Scores outside 0.5–5 are left out, and the page reports them.

### The Checks tab

The Checks tab lists problems the page would trip over, with a count, a severity, the rows involved, and how to fix each one.

- **Errors** stop a book from appearing correctly in Shelfprint:
  - books that can't be placed in a month
  - a Month read with no year
  - an End date and Year read that disagree
  - a Status not on the list
  - Record IDs used more than once
- **Advisories** are worth a look but won't break anything:
  - a Month read that doesn't match the End date
  - finished books missing a rating
  - a partly filled matrix
  - titles logged twice without Reread? ticked
  - repeated titles without Record IDs
  - series names missing from the Series tab
  - tag and author spelling variants
  - TBR books not ticked Started?
  - values that aren't on their dropdown lists

A count of **0** means the check passed. **Check failed** means a helper formula broke, usually because the hidden `_ChecksData` tab was edited. The check never shows a reassuring 0 when it couldn't run.

### Capacity

The Reading Log supports rows **3 to 1000**, which is about 998 books. The TBR supports rows 4 to 1001. Dropdowns, validation, and every check cover those full ranges.

You can keep several years in one sheet. At 100–150 books a year, that's six years or more. Each book's year comes from its own dates, so years never mix. In testing, a sheet with all 998 rows filled recalculated in well under a second after a normal edit. Rows beyond 1000 get no dropdowns or checks.

### Using Excel instead of Google Sheets

The Excel template has the same tabs, formulas, dropdowns, and checks as the Google Sheets version.

- **Requires Microsoft 365 or Excel 2019 or later.** The checks use TEXTJOIN, MAXIFS, and MINIFS, which older versions show as `#NAME?`.
- **To export:** select the **Reading Log** tab, then **File → Save a Copy** (or **Save As**) **→ CSV UTF-8 (Comma delimited)**. Excel saves only the active tab, so make sure Reading Log is the one selected.
- LibreOffice Calc also opens the template and calculates it correctly.

### Using LibreOffice Calc

The repository also includes `Shelfprint_Tracker.ods`, an OpenDocument Spreadsheet version of the tracker for LibreOffice Calc. It does not require Excel or a Google account.

The major spreadsheet functions have been checked in LibreOffice Calc, and a CSV exported from the tracker has been successfully imported into the Shelfprint page. This was a practical compatibility check, not an exhaustive test of every formula, validation rule, or edge case.

**To export:** select the **Reading Log** tab, choose **File → Save As**, select **Text CSV (.csv)** as the file type, and confirm that you're exporting only the current sheet. Keep UTF-8 and comma-separated fields when prompted. Load the resulting CSV into `shelfprint.html`.

---

## The page

### Loading your log

Drop a CSV onto the page, or click **Choose a file…**. The file is read in your browser and kept in that browser, so the page shows the same data next time you open it. To update, export again, and use **Load new export…** at the top of the page.

**Optional: load straight from a published sheet.** In Google Sheets you can publish the Reading Log tab as a CSV (**File → Share → Publish to web**, then choose the Reading Log tab and CSV) and paste that link into the page's **Settings**. The page then loads your latest data each time it opens. Publishing makes that tab readable by anyone with the link. If the link can't be reached, the page shows the copy saved in your browser with a **Not up to date** notice, rather than presenting old data as current.

### Year and month views

The bar at the top switches between the year and each month, with the number of books finished in each. Month pages also have links back to the year and to the months on either side.

- **Year view:** headline numbers (books, hours of audio, pages, average rating, new-to-you authors, busiest month, and pace), then:
  - books finished each month
  - your top-rated books
  - genre, format, and rating breakdowns
  - who you read
  - series progress
  - books you set aside (DNF)
  - your currently reading list
  - if you use the matrix: matrix charts, including *Gut vs. rubric*
- **Month view:** the month's shelf, ranked by your rating, with the same kinds of breakdowns for that month.
- **Book details:** click any cover to see everything you logged about that book, choose its cover, and pick it for My Year in Books.
- **Filters:** click a bar, a tag, an author, and so on to show only matching books. **Clear filter**, or your browser's back button, undoes it.
- **Table:** every view ends with a collapsible table of its books.

If your file covers more than one year, a year picker appears next to the year.

### "Check your sheet"

After each load, the page lists anything it couldn't settle, with a **Show which** list:

- books with no year
- Year read values that aren't a four-digit year
- End dates that disagree with Year read
- Month read values that don't match the End date
- duplicate Record IDs
- matrix scores outside 0.5–5

Nothing drops out of the counts without a mention.

### Covers

Each book's cover comes from the first of these that has one:

1. **A cover you chose on the page.** In a book's details, paste a link to any cover image under **Choose your cover**. It's saved in your browser. To keep it everywhere, click **Copy link**, and paste it into that book's **Cover URL** cell.
2. **Cover URL** from your sheet.
3. **Found cover** from your sheet (filled from the Found covers tab).
4. **Cover lookup**, if you turned it on: Open Library, then optionally Google Books for books Open Library can't find. A book's title is sent out only when the sheet has no cover for it.
5. Otherwise, a **title card**: a colored card with the title and author. The book's details say so and link straight to the cover chooser.

**Keeping looked-up covers in your sheet** (optional): in **Settings → Advanced: keep looked-up covers in your sheet**, click **Copy found covers**, then paste at cell **A2** of the **Found covers** tab. The Found cover column then picks them up, matching by Record ID first and then by title. You can then turn cover lookup off and keep the covers.

**Two editions of the same title?** Give each row its own **Record ID**. Saved covers are keyed by Record ID when there is one, so each edition keeps its own. Rows without IDs that share a title and author also share a cover choice.

### Share images

Month views have a **Share image…** button at the top of the page. In the year view, the same single image is available as **One image** inside **Create My Year in Books**.

- **Sizes:** post (4:5), square, or story (9:16)
- **Look:** Paper (light) or Ink (dark)
- **Year images:** your top 10, top 20, or all books
- **Options:** titles under covers, a stats line, rank numbers, and your handle (optional and blank by default)

**Download PNG**, **Copy image**, or on phones, **Share…**. The status line under the preview says how many covers made it in. Some image hosts don't allow their covers to be copied into an image. Those books show title cards, and the optional **Share-image fallback** in Settings can usually fix that.

---

## My Year in Books

In the year view, click **Create My Year in Books** to make a set of images about your year, sized for an Instagram-style carousel: **1080 × 1350 (4:5)**, in Paper or Ink. Text on the images is in the first person, since they're yours to post.

| Image | Shows | Appears when |
|---|---|---|
| **The year** | The year, books finished, and up to four measures (pages read, hours listened, books by new-to-me authors, and books in translation), with a row of covers | You finished at least one book that year |
| **My five-star reads** / **My top reads** / **My top picks** | Every book at your highest rating, in reading order. If you've picked books yourself, exactly those instead. | Always. With no ratings or picks, it becomes **From my shelf**: books spread through the year, with no ranking. |
| **Genre shelves** *(optional, your own)* | The best of a genre you choose, such as Romantasy or Non-fiction | You add them (see below) |
| **Genres, sub-genres, and tags** | Top genres with bars, plus the sub-genres and tags that came up on at least two books | At least two genres, sub-genres, or tags repeat |
| **Month by month** | Books finished each month, naming the busiest month only when it clearly stands out | At least six books across three or more months |
| **Gut vs. rubric** | Your average matrix scores, the book with the highest matrix average, and the book whose rating differs most from its matrix average | At least five books with every matrix score |
| **The whole shelf** | Every book you finished, in reading order. Continues onto further images past 60 covers. | Always |

**How the top images choose books.** There's no hidden ranking:

- **Without picks,** the image shows every book at your top rating. If fewer than three books share it, the image widens in half-star steps, up to one star lower, and says so: "Rated 4 and up". Matrix averages are never used to choose or order these books.
- **With picks,** the image shows the books you picked, in the order you picked them. Ratings play no part.
- **To pick books** (up to 10), use the checklist for that image in the My Year in Books panel, or **Include in my top picks** in any book's details.

**Genre shelves.** Click **Add a shelf…**, and tick one or more **Genre** or **Sub-genre(s)** values. A book goes on the shelf if it matches any of them, so "Romantasy" and "Romantic fantasy" can share one shelf. You can give the shelf its own name. Each shelf follows the same rules as the top image, with its own separate picks.

**You can see how every image was made.** Open **What … is based on** under the list of images to see:

- the columns used and the rule applied
- any cut-offs
- any books left out, such as books with no year

**Arranging the set.** Use the checkboxes to include or leave out images, and the ↑ ↓ buttons to reorder them. Your choices, picks, and shelves are saved in your browser for each year.

**Exporting:**

- **Download this image:** one PNG.
- **Download all (ZIP):** every image, numbered in order: `my-year-in-books-2026.zip`, containing `my-year-in-books-2026-01.png`, `-02.png`, and so on. The ZIP is made in your browser. A progress line counts the images as they're made.
- **On phones, Share all…** makes the images first. Then tap **Share 7 images** (or however many there are) to open your share sheet. Phones only allow the share sheet right after a tap, so this is two steps.

My Year in Books always covers the whole year. A filter on the page isn't applied to it.

---

## Privacy and outside connections

Your reading data never leaves your browser. The page has no server, no analytics, and no account.

A few optional features reach outside services to fetch images or fonts. Each one is listed under **Privacy & outside connections** on the first screen and in **Settings**, with exactly what it sends. Anything that would send information about your books starts **off**.

| Setting | Default | What it sends, and to whom |
|---|---|---|
| **Use cover links from my sheet** | On | Loads only the image links in your sheet's Cover URL and Found cover columns, plus any link you paste on a book. |
| **Look up covers** | Off | Each book's title, author, and ISBN, to [Open Library](https://openlibrary.org), the Internet Archive's nonprofit book catalog. Only for books without a cover in your sheet. Results are remembered in your browser. |
| **Also try Google Books** | Off | For books Open Library can't find: the title and author, to Google Books. |
| **Share-image fallback** | Off | When a cover's host won't let it be copied into a share image: that image's address, to [images.weserv.nl](https://images.weserv.nl). |
| **Web font** | On | Loads the Newsreader typeface from Google Fonts. Sends nothing about your books. Off uses Georgia. |

Turning a setting off stops those requests.

---

## What's saved in your browser

All of these live in your browser's local storage, on that device only. Nothing syncs between devices, and clearing your browser's site data removes them.

- The last CSV you loaded, its file name, and when it was saved
- Your Settings choices
- Covers you picked for individual books, and remembered cover-lookup results
- Your share-image handle
- My Year in Books choices for each year: image order, images switched off, top picks, and genre shelves

To keep a picked cover permanently, copy its link into your sheet's Cover URL column. To keep looked-up covers, use **Copy found covers**.

---

## Hosting your own copy

`shelfprint.html` is a single self-contained file. You can:

- open it straight from your computer, or
- put it on any static host, such as **GitHub Pages**.

**Copy image** and phone sharing work most reliably when the page is served over https rather than opened as a local file.

**Defaults for your copy.** The `SETTINGS` block at the top of the file sets the starting choices:

```js
const SETTINGS = {
  handle: "",               // optional default handle for share images
  lockSettings: false,      // true = readers can see the connections but can't change them
  coverUrls:   true,        // show Cover URL / Found cover images from the sheet
  coverLookup: false,       // Open Library cover lookup
  googleBooks: false,       // also try Google Books (only with coverLookup)
  exportProxy: false,       // share-image fallback through images.weserv.nl
  webFont:     true,        // Newsreader from Google Fonts
  dataUrl:     ""           // optional published-CSV link to load on open
};

const TEMPLATE_URL = "…";   // the "Make a copy" link shown on the welcome screen
const SOURCE_URL = "";      // "About and source" link in the footer; on GitHub Pages it fills itself in
```

Readers can change these in **Settings**, saved in their own browser, unless `lockSettings` is `true`. That's useful when you set the page up for someone else, such as a library or a classroom, and want the connections fixed.

---

## Troubleshooting

**A book isn't showing up in its year.** Look at **Check your sheet** at the top of the page, or the **Checks** tab. A Finished or DNF book needs an End date, or a Month read plus a four-digit Year read.

**Lots of books "aren't in any year" after updating.** Earlier versions guessed a year for books with only a Month read. The current version doesn't. Fill in **Year read** for those rows. The Checks tab lists them under *Month read with no year*.

**Covers are missing from the share image but show on the page.** Some image hosts don't allow their images to be copied into a picture. Turn on **Share-image fallback** in Settings, or use a cover link from another host. Those books show title cards in the meantime.

**"Sharing didn't work here."** Sharing needs a browser that supports it, and works best when the page is opened from a website (https) rather than a saved file. Use **Download this image**, **Download all (ZIP)**, or **Download PNG** instead.

**A Checks count says "Check failed."** A helper formula returned an error, usually because the hidden `_ChecksData` tab was changed. Copy that tab from a fresh copy of the template.

**`#NAME?` in Excel.** Your Excel version is older than 2019. Use Microsoft 365, Excel 2019 or later, Google Sheets, or LibreOffice.

**Matrix Average is blank.** Every matrix score in the row must be filled in.

---

## Known limits

- The template supports about **998 books** per sheet (Reading Log rows 3–1000).
- My Year in Books images are **4:5** only. The single share image also offers square and story sizes.
- Picks, genre shelves, picked covers, and other choices are saved **per browser**. They don't move between devices.
- The Excel template needs **Excel 2019 or Microsoft 365**. A separately supplied `.ods` version is available for LibreOffice Calc; its major functions and CSV export/import workflow have been tested, but not every feature and edge case.
- Cover lookup depends on Open Library's (and optionally Google Books') catalog. New, indie, and self-published books are the most likely to need a Cover URL.

---

## License

Shelfprint (the page, the spreadsheet template, and this README) is released under the [MIT License](LICENSE). You're free to use, change, and share it, including in your own projects, as long as you keep the copyright and license notice. The fingerprint icon is used under a separate purchased royalty-free license from The Noun Project. It is not included under Shelfprint's MIT License.

---

## Credits

- Cover lookup: [Open Library](https://openlibrary.org) (Internet Archive) and, optionally, [Google Books](https://books.google.com)
- Typeface: [Newsreader](https://fonts.google.com/specimen/Newsreader) via Google Fonts
- Optional share-image fallback: [images.weserv.nl](https://images.weserv.nl)
- Fingerprint favicon: licensed from The Noun Project under a purchased royalty-free license; attribution is not required.
- Some formulas and most html generated by Claude Opus 5.5, reviewed by GPT 6.

Shelfprint is made by NDSR.
