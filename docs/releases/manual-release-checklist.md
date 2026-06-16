# Manual Release Checklist

## Pre-build

- [ ] Working tree is clean
- [ ] Version number is correct in root package.json
- [ ] Renderer build passes
- [ ] Desktop syntax checks pass
- [ ] App boots in dev mode

## Build

- [ ] Run `pnpm release:linux`
- [ ] Confirm AppImage appears in `release/`
- [ ] Confirm unpacked Linux app exists in `release/linux-unpacked/`

## Smoke test

- [ ] Launch AppImage
- [ ] Confirm main UI loads
- [ ] Confirm menu opens
- [ ] Confirm New Project works
- [ ] Confirm Open Project works
- [ ] Confirm Import Project works
- [ ] Confirm Export Project works
- [ ] Confirm Plugins panel loads
- [ ] Confirm Local AI status panel loads

## Post-build

- [ ] Do not commit `release/`
- [ ] Commit release config/docs only
- [ ] Push to GitHub
- [ ] Tag release if needed
