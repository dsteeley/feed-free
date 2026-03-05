# Contributing to Feed Free

## Running Tests

```bash
npm test                 # Unit tests (lib/__tests__/) — < 5s
npm run test:functional  # Functional tests against DOM fixtures — < 30s
npm run test:e2e         # E2E tests (real Firefox + extension) — < 2min
npm run test:all         # All of the above
```

E2E tests require a built extension:

```bash
npm run build:firefox
npm run test:e2e
```

## Selector Update Workflow

When a platform redesigns their site and selectors break:

1. **Run the health check** (see what's broken):

   ```bash
   npm run selector:health
   ```

2. **Capture fresh DOM** (optional but helpful):

   ```bash
   npm run fixtures:update
   ```

3. **Update selectors** in `lib/selectors/<platform>.ts` to match the new DOM.

4. **Update the fixture** in `tests/fixtures/<platform>.html` to match the new DOM structure the selectors expect.

5. **Run tests** to confirm everything passes:

   ```bash
   npm run test:functional
   ```

6. Open a PR with the selector + fixture changes.

## Adding a New Platform

Checklist:

- [ ] Add selector constants → `lib/selectors/<platform>.ts`
- [ ] Add storage items → `lib/storage.ts` (platform switch + peek timestamps)
- [ ] Create content script → `entrypoints/<platform>.content.ts`
- [ ] Create CSS → `entrypoints/<platform>.content/style.css`
- [ ] Add platform toggle to popup → `entrypoints/popup/index.html` + `main.ts`
- [ ] Create fixture → `tests/fixtures/<platform>.html`
- [ ] Create functional tests → `tests/functional/<platform>.test.ts`
- [ ] Create E2E tests → `tests/e2e/<platform>.spec.ts`
- [ ] Add to health check → `tests/health/check-selectors.ts`
- [ ] Update `README.md`

## Release Process

1. Ensure all tests pass: `npm run test:all`
2. Tag the release:
   ```bash
   git tag v1.2.0
   git push --tags
   ```
3. GitHub Actions automatically:
   - Runs all tests
   - Builds Firefox + Chrome
   - Signs the Firefox XPI (via AMO API)
   - Creates a GitHub Release with `.zip` and `.xpi` artifacts

Credentials required in GitHub Secrets:

- `WEB_EXT_API_KEY` — AMO JWT issuer
- `WEB_EXT_API_SECRET` — AMO JWT secret

## Code Style

ESLint + Prettier are enforced. Run:

```bash
npm run lint:fix   # Auto-fix lint issues
npm run format     # Auto-format code
```
