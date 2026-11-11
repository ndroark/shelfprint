# Tests

Checks for people changing `shelfprint.html`. You don't need any of this to use Shelfprint.

The page is one file with no build step, and these checks keep it that way. They open the page in a headless browser, use it the way a reader would, and look at what comes out. Outside services (cover lookup, the web font) are blocked or replaced with stand-ins, so nothing is sent anywhere, and all the books are invented.

## Setting up

You need [Node.js](https://nodejs.org) 18 or later.

```
cd tests
npm install
npx playwright install chromium
```

## The three scripts

**`node features.js`** checks single features, each written as what a reader should see: for example, "a month with only manga among them says 'manga'." It prints `ok` or `FAIL` for each. Add a check here when you add a feature.

**`node compare.js [git-ref]`** checks that you didn't change anything you didn't mean to. It takes the page as it is on `main` (or another branch, tag, or commit), runs both versions through the same long session, and lists what differs: page snapshots at desktop and phone sizes, every kind of generated image compared pixel for pixel, downloads, clipboard text, and browser storage. The version number is masked, so a version bump alone shows no differences.

- A change that isn't supposed to alter behaviour should report **0 differ**.
- A change that is supposed to alter the page will report differences. Open the files it names under `tests/out/old` and `tests/out/new` and check that they differ in the way you meant, and in no other.
- To include a real reading log in the comparison, set `SHELFPRINT_OWN_CSV` to the path of a Reading Log export. The log stays on your computer.

**`node format.js`** formats the page's script and stylesheet with Prettier, and leaves the HTML markup and the `SETTINGS` block alone. Run it before you commit.

## What these don't cover

They run in Chromium only. Safari, Firefox, and sharing from a real phone need checking by hand.
