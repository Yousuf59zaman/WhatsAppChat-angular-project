# WhatsappChat

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.8.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests
Playwright has been set up for browser-based E2E tests.

### Install browsers (first time)

```
npx playwright install
```

### Run all tests headless

```
npm run test:e2e
```

### Run with UI mode (watch / trace viewer)

```
npm run test:e2e:ui
```

### Debug a single test

```
npm run test:e2e -- --project=chromium tests/auth.spec.ts -g "login form validation"
```

Or launch with the debug helpers:

```
npm run test:e2e:debug -- --project=chromium
```

### Base URL / server

The config points to `http://localhost:4200`. Make sure the dev server is running in another terminal:

```
npm start
```

Optionally override base URL:

```
set PLAYWRIGHT_BASE_URL=http://localhost:4300; npm run test:e2e
```

### Notes

- Some tests are currently skipped because backend functionality (registration, messaging persistence) may not yet be implemented.
- Added `data-testid` attributes in key templates for selector stability.
- Update or unskip tests once backend endpoints are available.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
