# Changelog

What changed in each version of Shelfprint. The version in use appears at the bottom of the page.

Shelfprint uses [semantic versioning](https://semver.org): the middle number goes up for new features, and the last number for fixes.

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
