# Changelog

What changed in each version of Shelfprint. The version in use appears at the bottom of the page.

Shelfprint uses [semantic versioning](https://semver.org): the middle number goes up for new features, and the last number for fixes.

## 0.4.0 — 2026-11-06

### Added
- **Create image card**, in each book's details: an image about one book to share wherever you like, in post, square, or story size, on Paper or Ink.
- Two layouts: **Standard** (cover, title, and your words) and **Cover feature** (a large cover, for cards with no writing). Cards with words start as Standard; you can switch.
- Your words can be **As written**, **Edit for card** (shorten, tighten, or rewrite them for that card, at any length), or **None**. Your sheet isn't changed. A line or two shows in large type. Your words are never cut off to fit: if they don't fit at a readable size, the card says so and can't be saved until something changes.
- **Review, Quotation, or Mixed**, starting from your quotation marks and changeable either way. Quotations get a large quotation mark and an editable "who wrote it."
- Choose what to include: rating, genre, when you read it, the new-author note, reread, matrix scores, format and length, and tags.
- Source, How I found it, and Recommended by are left off every card until you turn them on, one card at a time, and are never remembered.
- An optional name or handle, and the word "Shelfprint" in small type, which you can turn off.
- If a cover can't be copied into the image, use an image from your device, or fetch that one cover through images.weserv.nl, for that card only.
- Covers are shown whole, never cropped, whatever their shape.

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
