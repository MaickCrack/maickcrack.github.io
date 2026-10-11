# KogasonOS

A Windows 11-style desktop that works as kogason2010's portfolio. Every project is a standalone app: it runs from this site's own copy, in its own window, with screenshots in Showcase and Photos.

Plain HTML, CSS and JavaScript. No framework and no build step, so GitHub Pages serves the folder as it is.

## What's on the desktop

- **Showcase**: the front page. Every project with a cover, screenshots and details.
- **Project apps**: Nexera IC, Nexera IC Applications, Exposed: EPSA by SFC (all three in the *Nexera App Notes* folder) and Solvane. Links between projects open the other project's window.
- **File Explorer** with Tiles, Large icons and Details views, **Photos**, **Notepad**, **Terminal** (`help`), **Settings**.
- Windows 11 touches: snap to sides and corners, snap layouts on the maximize button, Task view, Start menu search, notification center, quick settings, draggable desktop icons, light and dark mode.

## Adding a project

Everything is configured in **`js/config.js`**.

**1. Add the repo.** One line is enough; the live URL, source link and icon come from the repo name:

```js
{ type: "github", repo: "kogason2010/my-new-site", bundle: true },
```

Add `title`, `description`, `stack`, `icon`, `group` or `tip` to override the defaults. Leave out `bundle: true` to open the live GitHub Pages site in the window instead of a bundled copy.

**2. Copy the built site into `apps/`.** Run `node tools/sync-apps.mjs`, or push the config change and let the GitHub Action do it. It expects the built site at the repo root (source code in `source/` is skipped), which is how all of your current projects are set up.

**3. Add screenshots** (optional but recommended):

```bash
npm install --no-save playwright
npx playwright install chromium
node tools/capture-shots.mjs my-new-site
```

That saves four screenshots to `media/my-new-site/` and prints the `shots: [...]` lines to paste into the config. Replace the placeholder captions with real ones. The first shot is the cover unless you set `cover`.

**4. Choose where it shows up:** add its id, or `"group:<id>"` for a folder, to `desktop`, `pinned` (Start menu), `taskbar` or `startup`.

**Other websites** (not on GitHub):

```js
{ type: "website", id: "my-shop", title: "My Shop", url: "https://example.com/", embed: false },
```

`embed: false` opens the site in a new tab for sites that refuse to load inside another page.

**Folders:** add an entry to `groups`, then give apps `group: "<id>"`.

**Documents** open in Notepad: ``{ type: "document", id: "cv", title: "CV.txt", text: `...` }``.

**Automatic discovery:** with `github.autoDiscover: true`, any repo of yours with GitHub Pages turned on that isn't listed or excluded appears in Projects, opening its live site. Update dates and stars refresh from GitHub when the page loads.

**A new kind of built-in app:** register it in `js/apps.js`

```js
OS.APPDEFS.player = { size: [600, 400], mount(win, spec) { win.setTitle("Player"); win.body.append(/* your UI */); } };
```

then add `{ type: "builtin", id: "player", title: "Player", app: "player" }` to `config.js`.

## Keeping bundled apps up to date

`.github/workflows/sync-apps.yml` runs `tools/sync-apps.mjs` every Monday, whenever `js/config.js` changes, and on demand from the **Actions** tab (*Sync bundled apps → Run workflow*). It commits any changes to `apps/`. After pushing an update to a project repo, run it by hand to see the change straight away.

## Publishing on GitHub Pages

1. Create a repo named **`kogason2010.github.io`**.
2. Put the contents of this folder at its root, including the hidden `.github` folder and `.nojekyll`, and push.
3. In the repo's **Settings → Pages**, deploy from the `main` branch, root folder.
4. In **Settings → Actions → General**, set *Workflow permissions* to **Read and write** so the sync workflow can commit.

The portfolio will be at `https://kogason2010.github.io/`.

## Files

| Path | What it is |
| --- | --- |
| `js/config.js` | Apps, folders, screenshots, desktop, Start menu, taskbar |
| `js/core.js` | App registry, settings, window manager, snapping |
| `js/apps.js` | File Explorer, project app windows, Notepad, Terminal, Settings |
| `js/showcase.js` | Showcase and Photos |
| `js/shell.js` | Desktop, taskbar, Start, Task view, notifications, quick settings |
| `js/icons.js` | Built-in icons |
| `css/os.css`, `css/apps.css` | All styling, light and dark |
| `apps/` | Bundled copies of each project's built site |
| `media/` | Screenshots |
| `icons/`, `wallpapers/` | Project icons and the molecular-field wallpaper |
| `tools/` | `sync-apps.mjs` and `capture-shots.mjs` |
