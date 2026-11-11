# Changelog

What changed in each version of Shelfprint. The version in use appears at the bottom of the page.

Shelfprint uses [semantic versioning](https://semver.org): the middle number goes up for new features, and the last number for fixes.

## 1.2.0 — 2026-11-11

Manga and comics in the images. They still count in every total, rating, and cover gallery. If your log has none, or doesn't use the Form column, nothing changes for you.

### Added
- **Include manga and comics** in the share image dialog, when some of the books in the month (or the year's one image) are manga or comics. It's named for what's there, such as "Include 2 manga," and starts ticked. Untick it to leave them off that image: the stats line and other counts on the image then cover only the books shown, and the dialog says how many were left off. Your page and your sheet don't change.
- **Form values in genre shelves.** In My Year in Books, a shelf can now include Form values, such as Manga, alongside Genre and Sub-genre values. They're offered when the year has manga or comics, in a group of their own headed Form. Shelves you've already made work as before.
- **Art by** on book cards for manga and comics, under the author, from the Illustrator / artist column. It's left off when the artist is the author, however the names are written ("Sato, Ren" and "Ren Sato" match). It's one of the Include choices, on to start with and remembered like the others.

## 1.1.0 — 2026-11-11

Manga and comics get more attention on the page. If your log has none, or doesn't use the Form column, nothing changes for you.

### Added
- **A tile for manga and comics** in a month's or year's headline numbers, with a count for each form. It appears only when the books in view include some, and is named for what you read: "manga," "graphic memoirs," or "manga and comics" for a mix. When every book in a month is the same one form, the books finished tile says so ("all manga") in place of a second tile.
- **Pages read** and **days per book** keep their totals for all books, and their notes now add the figure for manga and comics.
- **Form and Audience charts.** The page now charts both columns when your books have more than one value in them. Click a bar to filter. Until now these two columns were read but not shown.
- A book's details show its **Form** and **Audience**. Click either to filter.
- **Webtoon** and **Manhua** are in the template's Form list. If you copied the template earlier, you can add them on your Lists tab.
- `tests/`: checks for people changing the page's code.

### Changed
- A series of manga or comics is counted in volumes ("vols. 1–5") in the year's Series list.
- The Series list joins numbers with a dash only when they follow one another. A series where you read books 1, 3, and 5 now reads "books 1, 3, 5" where it used to read "books 1–5."

## 1.0.1 — 2026-11-11

Nothing changes in how the page looks or works. Your sheet, your saved choices, and the `SETTINGS` block are untouched.

### Changed
- **The page's code is reorganized to be easier to read and change.** It's laid out one statement per line, opens with a contents list, and gives its parts descriptive names. The three kinds of image (the month or year image, My Year in Books, and book cards) now share one set of code for sizes, type, covers, and saving, copying, and sharing, so a fix to one reaches all three.
- Code that no longer did anything was removed.

## 1.0.0 — 2026-11-06

Shelfprint's first stable version. From here, your sheet's columns, what's saved in your browser, and the `SETTINGS` block stay stable through every 1.x version. See [Versions and what stays stable](README.md#versions-and-what-stays-stable).

### Changed
- The welcome screen and README lead with **Track once. Share anywhere.**
- The welcome screen links to the guide, the Excel and LibreOffice templates, and the source code on GitHub. The footer's link is now **Guide and source**, and a copy of the page opened from your own computer links to Shelfprint's repository too.
- The welcome screen, footer, and README say your file stays in your browser, replacing "never uploaded" and "isn't uploaded to Shelfprint." Optional connections are still listed with exactly what they send.
- The README's Quick start uses the Shelfprint website and Google Sheets, with Excel, LibreOffice, a downloaded copy of the page, and publishing your sheet as alternatives.
- The README explains how saved choices are matched to books, and that Safari may clear saved data after seven days without a visit.

## 0.5.1 — 2026-11-06

### Changed
- **Long-form divides text more evenly.** Each way of dividing the text is measured as the cards will be drawn, counting the cover and book details on the first card and the credit, matrix scores, and tags on the last, and the most even set is used. A nearly empty continuation card is avoided.
- **Clause breaks.** If breaking between sentences would leave one card with much less of your text than another, a break can fall inside a sentence, after a semicolon, colon, or dash. A sentence too long for one card also breaks at a clause before it breaks between words.
- The type stays the largest size that needs no more cards. It's made smaller only to keep a sentence from breaking between words, never just to even out the cards.

### Fixed
- A sentence could break between words at a larger type size when a smaller size with the same number of cards kept it whole.
- At the square size with matrix scores and tags, a Long-form set could collapse into one card that ran past its edges and couldn't be saved.

## 0.5.0 — 2026-11-06

### Added
- **Long-form**, a third layout for image cards: a long review becomes a numbered set of up to 10 cards. The first card shows the book; later cards repeat the title with "Continued" and are numbered "2 / 3." Your complete text is kept.
- Breaks fall between sentences, at the end of a paragraph where they can, and the cards are filled about equally. A passage too long for one card continues onto the next, and the card says so.
- The type is the largest size from 36 to 46 px that needs no more cards than 36 px would. Every card in a set uses the same size.
- Matrix scores, tags, and a quotation's credit close the set on the last card. Mixed italics carry across cards.
- When the text doesn't fit a Standard card, the card switches to Long-form and says why, unless you chose a layout yourself.
- Preview every card in the set, download them all as a ZIP or one at a time, copy one card, or share the whole set. Files are named so they sort in order: `book-card-title-01-of-03.png`.

## 0.4.1 — 2026-11-06

### Added
- The month image and My Year in Books carry the same small "Shelfprint" credit as book cards, with the same **Shelfprint name in small type** toggle. It's one choice for all images: turning it off in one place turns it off everywhere.
- When a cover in the month image or My Year in Books is a different image than the one you chose (because your chosen cover's host won't let it into an image), the status line says how many.

## 0.4.0 — 2026-11-06

### Added
- **Create image card**, in each book's details: an image about one book to share wherever you like, in post, square, or story size, on Paper or Ink.
- Two layouts: **Standard** (cover, title, and your words) and **Cover feature** (a large cover, for cards with no writing). Cards with words start as Standard; you can switch.
- **Text to share** can be **As written**, **Edit for card** (shorten, tighten, or rewrite it for that card, at any length, or paste in a passage to quote), or **None**. Your sheet isn't changed, and **Revert to Tracker text** puts its text back. Books with no Freeform thoughts can still have text: choose **Write for card**. Text that's only on the card comes with a reminder and a **Copy text** button for pasting it into your sheet. A line or two shows in large type. Text is never cut off to fit: if it doesn't fit at a readable size, the card says so and can't be saved until something changes.
- **Present as Review, Quotation, or Mixed**, starting from your quotation marks and changeable either way. Quotations get a large quotation mark, a **Quotation author**, and a **Source work**, which start as the book's author and title and can be changed, for example to quote another reviewer.
- Choose what to include: rating, sub-genres and genre (sub-genres by default when a book has them), when you read it, the new-author note, reread, matrix scores, format and length, and tags. Matrix scores and tags are for the Standard layout and are greyed out in Cover feature.
- Source, How I found it, and Recommended by are left off every card until you turn them on, one card at a time, and are never remembered.
- An optional name or handle, and the word "Shelfprint" in small type, which you can turn off.
- If a cover can't be copied into the image, use an image from your device, or fetch that one cover through images.weserv.nl, for that card only. If the card could only use a different cover than the one you chose, such as the one in your sheet's Found cover column, it says so instead of swapping quietly.
- Covers are shown whole, never cropped, whatever their shape.
- Nothing on a card is cut off: titles print whole, long words and text without spaces wrap, quotation credits wrap, and tags wrap onto up to three rows. If something still doesn't fit, the card names it and can't be saved until something changes. As a last check, any text that would run past the card's edges or into the footer also keeps the card from being saved.

## 0.3.0 — 2026-11-06

### Added
- **Arrow keys between books.** With a book's details open, Left and Right open the previous or next book in the list you opened it from, in that list's order (its rank numbers, where it shows them). At the first or last book, nothing happens.
- In the year's month-by-month strips, Left and Right stay within the month, and Up and Down open the first book of the month above or below.
- In the table, the arrow keys move through the rows in their current sort order.
- Closing the book returns you to the last book you moved to.

## 0.2.0 — 2026-11-06

### Added
- **Find a book in [year]**, near the top of the year view. Type part of a title or author to see matching books from that year, with a small cover, the author, and the month read, then open one to see its details. Capital letters and accents don't matter. Finding a book doesn't filter the page or change any numbers. Use the arrow keys and Enter to choose a result, and Escape to close the list.

### Changed
- The page footer and the README now say your reading data "isn't uploaded to Shelfprint," rather than that it never leaves your browser. Cover lookup, when you turn it on, does send titles to Open Library, so the new wording is the accurate one.

## 0.1.1 — 2026-11-06

### Fixed
- Book details no longer show "Translator: from English" for a book with no translator. A Translator row appears only when a translator is named.
- Without a named translator, book details show **Original language** when Language read says the book was read in another language, and **Original title** on its own.

### Added
- **Show all of [year]** in a month's filter bar opens the year view and keeps the filter.

### Changed
- Share images leave out the value of a Recommended by, How I found it, or Source filter, because it may name a person. A checkbox in the share dialog puts it back for that image.

## 0.1.0 — 2026-11-03

The first versioned release: the Shelfprint page and the Shelfprint Tracker templates as first published.
