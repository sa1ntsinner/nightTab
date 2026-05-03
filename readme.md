# [![nightTab](asset/banner/banner-1400-560.png)](https://zombiefox.github.io/nightTab/)

A neutral new tab page accented with a chosen colour. Customise the layout, style, background and bookmarks in nightTab -- a custom start page.

| [See the demo in action](https://zombiefox.github.io/nightTab/) | [Install nightTab Extension](https://chrome.google.com/webstore/detail/nighttab/hdpcadigjkbcpnlcpbcohpafiaefanki) | [Install nightTab Add On](https://addons.mozilla.org/en-GB/firefox/addon/nighttab/) | [Buy me a coffee](https://www.buymeacoffee.com/zombieFox/) | [Join the community](https://www.reddit.com/r/nighttab/) |
|:-------------:|:-------------:|:-------------:|:-------------:|:-------------:|
| [<img src="./src/icon/icon-48.png" width="48px" height="48px">](https://zombiefox.github.io/nightTab/) | [![Chrome](asset/logo/chrome-48.png)](https://chrome.google.com/webstore/detail/nighttab/hdpcadigjkbcpnlcpbcohpafiaefanki) | [![Firefox](asset/logo/firefox-48.png)](https://addons.mozilla.org/en-GB/firefox/addon/nighttab/) | [![coffee](asset/logo/bymeacoffee-48.png)](https://www.buymeacoffee.com/zombieFox/) | [![Reddit](asset/logo/reddit-48.png)](https://www.reddit.com/r/nighttab/) |

| [Install nightTab Extension](https://github.com/samrth012/nightTab/releases/latest) |
|:-------------:|
| [![Safari](asset/logo/safari-48.png)](https://github.com/samrth012/nightTab/releases/latest)

---

## macOS / Safari

This repository is a Safari/macOS port of [nightTab by @zombieFox](https://github.com/zombieFox/nightTab), originally ported by [@samrth012](https://github.com/samrth012/nightTab). This build includes Phase A performance optimisations contributed by [@sa1ntsinner](https://github.com/sa1ntsinner).

### Install on macOS

1. Download **`nightTab-7.6.0-safari.dmg`** from the [Releases page](https://github.com/samrth012/nightTab/releases/latest).
2. Open the DMG and drag **nightTab.app** into your **Applications** folder.
3. **First-launch Gatekeeper bypass** — because the build is ad-hoc signed (no Apple Developer ID), macOS will block the first open:
   - Right-click `nightTab.app` → **Open** → click **Open** in the dialog.
   - Alternatively, run once in Terminal: `xattr -dr com.apple.quarantine /Applications/nightTab.app`
4. **Open nightTab.app** — this step is required. Safari Web Extensions only register with Safari after their host app has been launched at least once. The app shows a simple window; you can keep it in the background or quit it after this first run.
5. **Quit and reopen Safari**, then go to **Settings → Extensions**. nightTab will now appear in the list — enable it.
6. Click **Always Allow on Every Website** when prompted.
7. Open a new tab — nightTab will appear as your start page.

> **Note:** existing nightTab settings stored by a previous build will not carry over (the bundle ID changed). Export your data first via the nightTab menu before updating.

### Building locally (macOS)

Requirements: Node.js ≥18, npm, Xcode (full app, not just Command Line Tools), Homebrew.

```bash
# 1. Install dependencies and build the web bundle
npm install
npm run build

# 2. Convert to a Safari Web Extension Xcode project
xcrun safari-web-extension-converter dist/web \
  --app-name "nightTab" \
  --bundle-identifier "com.sa1ntsinner.nightTab" \
  --project-location ./SafariApp \
  --macos-only --no-prompt --copy-resources

# 3. Build and sign the macOS app
# Requires your Apple ID to be added in Xcode → Settings → Accounts.
# Replace YOUR_TEAM_ID with the 10-character Team ID shown in Xcode
# (Settings → Accounts → your name → Team ID).
xcodebuild \
  -project SafariApp/nightTab/nightTab.xcodeproj \
  -scheme nightTab -configuration Release \
  -arch arm64 \
  -derivedDataPath build \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM=YOUR_TEAM_ID

# 5. Package into a DMG (requires: brew install create-dmg)
create-dmg \
  --volname "nightTab" \
  --window-size 540 380 \
  --icon-size 96 \
  --icon "nightTab.app" 140 180 \
  --app-drop-link 400 180 \
  --no-internet-enable \
  "nightTab-7.6.0-safari.dmg" "$APP"
```

### Attribution

- **Original nightTab** — [zombieFox/nightTab](https://github.com/zombieFox/nightTab) by [@zombieFox](https://github.com/zombieFox). Licensed under GPL-3.0.
- **Safari port** — [samrth012/nightTab](https://github.com/samrth012/nightTab) by [@samrth012](https://github.com/samrth012).
- **Phase A performance optimisations** — contributed by [@sa1ntsinner](https://github.com/sa1ntsinner): dropped moment.js (~−250 KB), clock/date DOM caching, shared visibility-aware ticker, debounced `localStorage` writes, cross-browser API shim, WOFF2-only fonts.

---

# Support

- [Project goals](https://github.com/zombieFox/nightTab/wiki/Project-goals)
- [Applying bookmark settings to all](https://github.com/zombieFox/nightTab/wiki/Applying-bookmark-settings-to-all)
- [Browser support](https://github.com/zombieFox/nightTab/wiki/Browser-support)
- [Cookies and cache](https://github.com/zombieFox/nightTab/wiki/Cookies-and-cache)
- [Data backup and restore](https://github.com/zombieFox/nightTab/wiki/Data-backup-and-restore)
- [Local background image](https://github.com/zombieFox/nightTab/wiki/Local-background-image)
- [Protected URLs](https://github.com/zombieFox/nightTab/wiki/Protected-URLs)
- [Recovering settings and bookmarks](https://github.com/zombieFox/nightTab/wiki/Recovering-settings-and-bookmarks)
- [Resetting when opening the browser](https://github.com/zombieFox/nightTab/wiki/Resetting-when-opening-the-browser)
- [Respecting your privacy](https://github.com/zombieFox/nightTab/wiki/Respecting-your-privacy)
- [Setting a background video or image](https://github.com/zombieFox/nightTab/wiki/Setting-a-background-video-or-image)
- [Setting nightTab as your Firefox homepage](https://github.com/zombieFox/nightTab/wiki/Setting-nightTab-as-your-Firefox-homepage)

# Development

When developing use:
- `npm start`

A development server will automatically open the project in your browser. Normally here: `http://localhost:8080`.


To build the project use:
- `npm run build`

A web ready folder will be created in `/dist/web/`.
A browser addon/extension ready zip will be created in `/dist/extension/`.

For the macOS/Safari build, see the [Building locally](#building-locally-macos) section above.

# Screenshots

[![nightTab Demo](asset/screenshot/screenshot-001.png)](https://zombiefox.github.io/nightTab/)
[![nightTab Demo](asset/screenshot/screenshot-002.png)](https://zombiefox.github.io/nightTab/)

## Example nightTab setups:

- [Where to find these setups](https://github.com/zombieFox/nightTab/tree/main/asset/screenshot)
- [How to import these setups](https://github.com/zombieFox/nightTab/wiki/Data-backup-and-restore#restore-data)

[![nightTab Demo](asset/screenshot/screenshot-003.png)](https://zombiefox.github.io/nightTab/)
[![nightTab Demo](asset/screenshot/screenshot-004.png)](https://zombiefox.github.io/nightTab/)
[![nightTab Demo](asset/screenshot/screenshot-005.png)](https://zombiefox.github.io/nightTab/)
[![nightTab Demo](asset/screenshot/screenshot-006.png)](https://zombiefox.github.io/nightTab/)
[![nightTab Demo](asset/screenshot/screenshot-007.png)](https://zombiefox.github.io/nightTab/)
[![nightTab Demo](asset/screenshot/screenshot-008.png)](https://zombiefox.github.io/nightTab/)
[![nightTab Demo](asset/screenshot/screenshot-009.gif)](https://zombiefox.github.io/nightTab/)
[![nightTab Demo](asset/screenshot/screenshot-010.png)](https://zombiefox.github.io/nightTab/)
[![nightTab Demo](asset/screenshot/screenshot-011.png)](https://zombiefox.github.io/nightTab/)
