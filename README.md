# CampusHire

**University Placement Cell Mobile Application**
Dr. Hari Singh Gour Central University, Sagar, Madhya Pradesh

A mobile-first placement management ecosystem built with React Native + Expo, featuring an
**automated eligibility engine**, an **application tracking system (ATS)**, and separate
portals for students and the Training & Placement Office.

---

## Quick start

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `w` to run in the browser.

Verify everything type-checks:

```bash
npx tsc --noEmit
```

> **Note:** notifications require a development build and do not work in Expo Go. Every
> notification call is wrapped defensively, so the app runs fine without them.

---

## Demo accounts

The login screen lets you switch roles — each opens a completely different portal.

| Role | User | What you see |
| :--- | :--- | :--- |
| Student | Sarthak Upadhyay (CGPA 8.5, CSE) | Drives, eligibility, ATS tracker, prep hub |
| Placement Officer | Dr. Anjali Verma | Analytics, drive management, CSV export |
| Coordinator | Rohit Sharma | Broadcasts and campus notices |

---

## The eligibility engine

The centrepiece of the app. `src/lib/eligibility.ts` is a pure, side-effect-free function that
compares a student profile against a drive's criteria and returns **every rule** — passing and
failing — so the UI can show exactly *why* someone is or isn't eligible.

```typescript
evaluateEligibility(student, criteria, policy)
// → { isEligible, score, passedCount, totalRules, reasons[], failures[], warnings[] }
```

Rules evaluated: CGPA cutoff, eligible branches, active backlogs, class 10th %, class 12th / diploma %,
and an optional gender criterion for diversity hiring drives.

Because it is pure, it is unit-testable in isolation and reusable on both sides of the app — it
gates the student's Apply button and reports applicant quality to the TPO dashboard.

**Try this:** open the Goldman Sachs drive (a female-only diversity hire) as the demo student.
The scorecard shows `✕ Gender Criteria` and disables Apply, naming the failed rule.

---

## Project structure

```
src/
├── app/                        # Expo Router — folder structure IS the navigation
│   ├── index.tsx               # Login + role picker
│   ├── (student)/              # Student portal (5 tabs)
│   │   ├── home.tsx            #   Dashboard
│   │   ├── drives/             #   Feed + [id] detail (eligibility scorecard)
│   │   ├── applications/       #   List + tracker (ATS stepper)
│   │   ├── prep/               #   Interview experiences + [id]
│   │   └── profile/            #   Academic scorecard + resume upload
│   └── (admin)/                # TPO / Coordinator portal (4 tabs)
│       ├── dashboard.tsx       #   Placement analytics
│       ├── drives/             #   Manage + create + applicants
│       ├── broadcasts.tsx      #   Campus notice board
│       └── students.tsx        #   Student directory
├── components/
│   ├── ui-kit.tsx              # Design system (Text, Card, Glass, Button, Badge…)
│   ├── eligibility-scorecard.tsx
│   └── pipeline-stepper.tsx    # ATS progress stepper
├── constants/theme.ts          # Colour, type, elevation and glass tokens
└── lib/
    ├── eligibility.ts          # The eligibility engine (pure)
    ├── demo-data.ts            # Seed data — swap for API later
    ├── store.tsx               # App state (React Context)
    ├── csv.ts                  # CSV generation + native share
    ├── notifications.ts        # Local notification helpers
    └── types.ts                # Domain types (mirror the DB schema)
```

---

## Design system

- **Monochrome editorial palette** — greyscale throughout; colour is reserved strictly for
  meaning (green = eligible, red = ineligible, amber = deadline).
- **Typography** — Playfair Display for display type, Inter for UI and body copy.
- **Glassmorphism** — frosted `BlurView` surfaces for the tab bar and hero panels.
- **Elevation** — a restrained four-step shadow scale for depth hierarchy.

Tokens live in `src/constants/theme.ts`. Use `useTheme()` in components — never hardcode hex
values, or dark mode will break.

---

## Tech stack

| Layer | Choice |
| :--- | :--- |
| Framework | Expo SDK 57 (React Native 0.86) |
| Navigation | Expo Router (file-based) |
| Styling | `StyleSheet` + theme tokens |
| State | React Context |
| Forms | React Hook Form + Zod |
| Fonts | `expo-font` + `@expo-google-fonts` |
| Effects | `expo-blur`, `expo-linear-gradient` |
| Export | Hand-rolled CSV + `expo-sharing` |

> CSV export is implemented by hand (~40 lines in `src/lib/csv.ts`) instead of using `xlsx`,
> which carries a high-severity advisory and has been unpublished from npm.

---

## Current status

The app runs entirely on local demo data. **Postgres + an Express API are the next phase** —
`src/lib/types.ts` already mirrors the database schema, so wiring real data is mostly a matter of
replacing the bodies of the store's actions.

---

## License

MIT — see [LICENSE](./LICENSE).
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
