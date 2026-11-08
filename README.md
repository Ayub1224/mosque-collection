# Mosque Collection Management

A responsive, web-based application for mosque administrators to manage member records and track monthly and yearly contributions. The project uses Google Sheets as its data store and Google OAuth for administrator sign-in, so it can be deployed without maintaining a traditional application server or database.

> **Forking this project?** Follow the setup instructions below and create your own Google Cloud project, spreadsheet, OAuth credentials, service account, and Netlify site. Do not reuse another deployment's credentials or spreadsheet.

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started locally](#getting-started-locally)
- [Google Cloud and Google Sheets setup](#google-cloud-and-google-sheets-setup)
- [Environment variables](#environment-variables)
- [Run and verify the application](#run-and-verify-the-application)
- [Deploy to Netlify](#deploy-to-netlify)
- [Google Sheets structure](#google-sheets-structure)
- [Project structure](#project-structure)
- [Important security and operational notes](#important-security-and-operational-notes)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Administrator authentication:** Sign in with Google. Only verified email addresses listed in `ADMIN_EMAILS` can access the application. Configure between one and five administrators.
- **Dashboard:** View member counts and collection summaries for the current month and Indian financial year (April–March).
- **Member management:** Register, edit, search, activate, and deactivate members. Phone numbers are normalized and checked for duplicates.
- **Collection tracking:** Record monthly contributions or yearly contributions allocated across the April–March financial year. Edit or cancel collection records while retaining their history.
- **Member contribution history:** Review contributions by member and financial year.
- **Admin profile and language:** Save administrator profile details and choose English or Hindi.
- **WhatsApp reminder assistance:** Prepare a monthly contribution reminder message for a member. The application provides a message workflow; it does not send messages through a WhatsApp Business API.
- **Responsive interface:** Designed for desktop and mobile screens.

The current implementation focuses on member records and regular contributions. Review the code and adapt the workflow to your organisation's accounting and reporting requirements before using it for live financial records.

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js App Router |
| Language | TypeScript |
| UI | React, Tailwind CSS, shadcn/ui components |
| Authentication | Auth.js / NextAuth v5 with Google OAuth |
| Data store | Google Sheets API |
| Google API client | `googleapis` |
| Server state | TanStack Query |
| Tables | TanStack Table |
| Forms and validation | React Hook Form and Zod |
| Hosting | Netlify |

Dependency versions are maintained in `package.json` and the lockfiles.

## Architecture

```text
Browser
  |
  | Google sign-in / authenticated application requests
  v
Next.js application (Netlify)
  |                         |
  | Auth.js + Google OAuth  | Google Sheets API
  v                         v
Authorized admins       Your Google spreadsheet
                         - Members
                         - Collections
                         - AdminProfiles
```

- Google OAuth authenticates administrators.
- `ADMIN_EMAILS` is the application-level allowlist. A Google account not on this list is not an administrator.
- A Google Cloud **service account** accesses the spreadsheet from server-side code. This is separate from the OAuth client used for administrator sign-in.
- Google Sheets is the data store. Keep service-account credentials and OAuth secrets on the server; never expose them through `NEXT_PUBLIC_*` variables or browser code.

## Getting started locally

### Prerequisites

Install the following before continuing:

- Node.js version compatible with the Next.js version in `package.json`.
- pnpm (recommended; the repository includes `pnpm-lock.yaml`).
- A Google account to create and administer the Google Cloud project and spreadsheet.
- A Netlify account for deployment (optional for local development).

### 1. Fork and clone

Fork the repository on GitHub, then clone your fork:

```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/mosque-collection.git
cd mosque-collection
```

Add the original repository as an optional upstream remote:

```bash
git remote add upstream https://github.com/Ayub1224/mosque-collection.git
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure Google services

Complete [Google Cloud and Google Sheets setup](#google-cloud-and-google-sheets-setup) before starting the application. You need both OAuth credentials and service-account credentials.

### 4. Create your local environment file

Create `.env.local` in the project root and populate the variables documented in [Environment variables](#environment-variables).

```bash
touch .env.local
```

Do not commit `.env.local`. Environment files are ignored by the repository's `.gitignore`.

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Google Cloud and Google Sheets setup

This application uses two Google identities for two different purposes. Set up both:

1. **OAuth 2.0 client ID** — lets an administrator sign in to the web application using Google.
2. **Service account** — lets the server read and write rows in the spreadsheet.

They are not interchangeable. The OAuth client does not grant the server permission to edit the spreadsheet, and the service account is not an administrator login.

### Part A: Create a Google Cloud project

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project for your own deployment, or select a project you control.
3. Select that project before enabling APIs or creating credentials.
4. Open **APIs & Services → Library**.
5. Search for **Google Sheets API** and click **Enable**.

Keep a note of the project you selected. All credentials in the following steps should belong to this project.

### Part B: Create the Google spreadsheet

1. Create a new spreadsheet in [Google Sheets](https://sheets.google.com/).
2. Give it a recognisable name, such as `Mosque Collection - Production`.
3. Create the tabs listed below, using the exact spelling and capitalisation:
   - `Members`
   - `Collections`
   - `AdminProfiles`
4. Add the header row for each tab using the exact column order in [Google Sheets structure](#google-sheets-structure).
5. Copy the spreadsheet ID from its URL.

For a URL like:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

The value between `/d/` and `/edit` is your `GOOGLE_SHEETS_SPREADSHEET_ID`.

The application currently reads and writes the `Members`, `Collections`, and `AdminProfiles` tabs. Additional tabs such as `Payments` and `MonthlyAllocations` are named in the shared Sheets configuration for the payment/allocation data model; do not assume that adding those tabs alone activates a workflow that is not exposed in the current UI/API.

### Part C: Create a service account for spreadsheet access

1. In Google Cloud Console, open **IAM & Admin → Service Accounts**.
2. Create a service account, for example `mosque-collection-sheets`.
3. Give it a descriptive name and finish creating it. The application accesses Sheets using the service account's credentials; it does not need broad project-owner permissions.
4. Open the new service account and copy its email address. It will look like:

   `mosque-collection-sheets@YOUR_PROJECT_ID.iam.gserviceaccount.com`

   This becomes `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
5. Open the service account's **Keys** tab.
6. Select **Add Key → Create new key → JSON** and download the key file.
7. Keep this JSON file private. Do not upload it to GitHub, add it to the project, or share it publicly. Google does not let you download the same private key again later, so store it in a secure password manager or secrets vault. If it is lost or exposed, create a replacement key, update the deployment secret, and delete the old key.
8. Open your spreadsheet, click **Share**, and share it with the service-account email address.
9. Give the service account **Editor** access to this spreadsheet.

The spreadsheet must be shared with the service account even when you own the spreadsheet with a different Google account.

From the downloaded JSON key, use:
- `client_email` as `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
- `private_key` as `GOOGLE_PRIVATE_KEY`.

When putting the private key into Netlify or `.env.local`, preserve the full key including the BEGIN/END lines. For an environment variable entered as one line, replace each newline with the two characters `\n`. The application converts those escaped newlines back into real newlines.

### Part D: Configure Google OAuth for administrator sign-in

1. In Google Cloud Console, open **Google Auth Platform** (or **APIs & Services → OAuth consent screen**, depending on the console interface).
2. Configure the app name, support email, and developer contact information.
3. Select the appropriate audience:
   - For a Google Workspace organisation, use the audience/access mode appropriate for that organisation.
   - For a general Google account deployment, configure **External** access.
4. Add the necessary test users while the OAuth app is in testing mode. Before making the application available to your intended administrators, complete Google's publishing/verification requirements applicable to your app and audience.
5. Open **Clients** and create an **OAuth client ID**.
6. Choose **Web application** as the application type.
7. Add the following authorised redirect URI for local development:

   `http://localhost:3000/api/auth/callback/google`

8. For production, add your Netlify site's callback URL as another authorised redirect URI:

   `https://YOUR_SITE_DOMAIN/api/auth/callback/google`

   Replace `YOUR_SITE_DOMAIN` with the actual Netlify domain or custom domain. The URI must match exactly, including protocol and path.
9. Save the OAuth client and copy its **Client ID** and **Client Secret**.

Set these as `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

**Important:** OAuth consent-screen test-user access and the application's `ADMIN_EMAILS` allowlist are separate checks. An administrator must be allowed by Google's OAuth configuration and must also be listed in `ADMIN_EMAILS`.

## Environment variables

Create `.env.local` for local development and add the same variables in Netlify for production.

| Variable | Required | Description |
| --- | --- | --- |
| `AUTH_SECRET` | Yes | Random secret used by Auth.js to protect/encrypt authentication state and tokens. Generate a unique value for each deployment. |
| `AUTH_GOOGLE_ID` | Yes | OAuth 2.0 Web Client ID from Google Cloud. |
| `AUTH_GOOGLE_SECRET` | Yes | OAuth 2.0 Web Client Secret from Google Cloud. |
| `ADMIN_EMAILS` | Yes | Comma-separated list of 1–5 authorised administrator Google email addresses. |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Yes | ID of the spreadsheet created for this deployment. |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Yes | Service account email from the downloaded Google Cloud JSON key. |
| `GOOGLE_PRIVATE_KEY` | Yes | Service account private key from the JSON key. Preserve the full key; use escaped `\n` line breaks when entering it as a single line. |

Example template (replace every placeholder with your own values):

```dotenv
AUTH_SECRET="generate-a-long-random-secret"
AUTH_GOOGLE_ID="your-google-oauth-client-id"
AUTH_GOOGLE_SECRET="your-google-oauth-client-secret"

# One to five comma-separated Google account email addresses.
ADMIN_EMAILS="admin1@example.com,admin2@example.com"

GOOGLE_SHEETS_SPREADSHEET_ID="your-spreadsheet-id"
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT\n-----END PRIVATE KEY-----\n"
```

Generate a strong Auth.js secret locally, for example:

```bash
openssl rand -base64 32
```

Use a new secret for each environment. Never reuse the example placeholder values. Do not prefix server-only secrets with `NEXT_PUBLIC_`.

## Run and verify the application

After configuring `.env.local`:

1. Start the app:

   ```bash
   pnpm dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) and sign in with an email address listed in `ADMIN_EMAILS`.
3. Verify that an unlisted Google account is denied access.
4. Verify the Sheets connection using:

   `http://localhost:3000/api/test-google-sheets`

   A successful response confirms that the credentials can access the spreadsheet and that the `Members` tab exists. It does not validate every tab or every column, so also test member creation, collection creation, editing, cancellation, and admin profile saving with non-production data.
5. Confirm that the expected rows are written to your own spreadsheet.

The test endpoint returns connection information. Consider restricting or removing it for deployments where you do not need it.

Useful commands:

```bash
pnpm dev       # Start local development
pnpm lint      # Run ESLint
pnpm build     # Create a production build
pnpm start     # Run the production build locally
```

## Deploy to Netlify

### 1. Create a Netlify site from your fork

1. Push your changes to your fork on GitHub.
2. Sign in to [Netlify](https://app.netlify.com/).
3. Choose **Add new site → Import an existing project**.
4. Connect GitHub and select your fork.
5. Configure the build:

   | Setting | Value |
   | --- | --- |
   | Base directory | Leave empty (repository root) |
   | Build command | `pnpm build` |
   | Publish directory | Follow the Next.js Runtime/plugin configuration supplied by Netlify; do not manually publish the `.next` directory as a static site. |
   
   Netlify's Next.js integration/runtime should be detected or enabled for the site. Use the current Netlify Next.js deployment guidance if the build setup screen differs.

### 2. Add production environment variables

In Netlify, open **Site configuration → Environment variables** and add all variables listed in the [Environment variables](#environment-variables) section.

Use production credentials and your production spreadsheet. Do not copy credentials from another deployment.

### 3. Add the production OAuth callback URL

After you know your site's domain, return to your Google OAuth client and add:

`https://YOUR_SITE_DOMAIN/api/auth/callback/google`

If you use a custom domain, add its callback URL as well. Keep the local callback URI for local development.

### 4. Deploy and verify

Trigger a new Netlify deployment after adding the environment variables and OAuth redirect URI. Once deployed:

- Open the production URL and sign in with an authorised Google account.
- Confirm that dashboard data loads.
- Create a test member and collection and check the production spreadsheet.
- Check that an unauthorised account cannot access protected pages or API routes.
- Remove test records before using the deployment for real data.

If you change an environment variable, trigger a new deploy so the deployed functions receive the updated configuration.

## Google Sheets structure

Create the following tabs and headers in row 1. Keep column order unchanged because the server code reads and writes values by position.

### `Members` tab

| Column | Header | Description |
| --- | --- | --- |
| A | `memberId` | Unique internal member ID |
| B | `fullName` | Member's full name |
| C | `phoneNumber` | Normalised phone number; used to detect duplicate members |
| D | `address` | Member address |
| E | `joiningDate` | Joining date (`YYYY-MM-DD`) |
| F | `status` | `Active` or `Inactive` |
| G | `createdAt` | Record creation timestamp |
| H | `updatedAt` | Last update timestamp |
| I | `serialNo` | Three-digit display serial (for example, `001`) |

### `Collections` tab

| Column | Header | Description |
| --- | --- | --- |
| A | `collectionId` | Unique collection/allocation record ID |
| B | `memberId` | ID of the member associated with the collection |
| C | `amount` | Amount allocated to this record |
| D | `donationDate` | Month/date to which the contribution is allocated (`YYYY-MM-DD`) |
| E | `recordStatus` | `Active` or `Cancelled` |
| F | `note` | Optional note |
| G | `createdAt` | Record creation timestamp |
| H | `updatedAt` | Last update timestamp |
| I | `paymentType` | `Monthly` or `Yearly` |
| J | `paymentGroupId` | Shared ID connecting the 12 allocations of a yearly payment |
| K | `paymentReceivedDate` | Date the payment was received (`YYYY-MM-DD`) |

A normal monthly contribution creates one collection row. A yearly contribution creates 12 monthly allocation rows for the relevant April–March financial year, connected by a shared `paymentGroupId`.

### `AdminProfiles` tab

| Column | Header | Description |
| --- | --- | --- |
| A | `email` | Administrator's Google email (normalised to lowercase) |
| B | `name` | Display name |
| C | `designation` | Administrator designation |
| D | `language` | `en` or `hi` |
| E | `theme` | Current profile theme value |
| F | `profileCompleted` | Profile completion flag |
| G | `createdAt` | Profile creation timestamp |
| H | `updatedAt` | Last profile update timestamp |

### Additional configured tabs

The shared Google Sheets module also defines ranges for `Payments` and `MonthlyAllocations`. These belong to the payment/allocation data model. The current collection API paths documented above use the `Collections` tab, so treat those two tabs as reserved for the related model/migration work unless you have verified newer code in your branch that writes to them.

**Formatting:** Keep the header row in row 1 and do not merge cells, rename tabs, reorder columns, or insert columns in the middle. Format phone numbers and serial numbers as plain text if editing them manually. Do not add totals or formulas inside the application-managed data ranges.

## Project structure

A simplified view of the main application folders:

```text
.
├── auth.ts                         # Auth.js Google provider and admin allowlist
├── public/                         # Static assets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/              # Admin profile and migration endpoints
│   │   │   ├── auth/               # Auth.js route handler
│   │   │   ├── collections/        # Collection API
│   │   │   ├── members/            # Member API
│   │   │   └── test-google-sheets/ # Sheets connectivity check
│   │   └── dashboard/              # Dashboard, member and collection screens
│   ├── components/                 # Shared UI components
│   ├── hooks/                      # TanStack Query hooks
│   ├── i18n/                       # English and Hindi translations
│   ├── lib/
│   │   ├── collections/            # Collection overview calculations
│   │   ├── google-sheets.ts        # Sheets client and tab/range constants
│   │   ├── admin-profiles.ts       # Admin profile persistence
│   │   └── validations/            # Zod schemas
│   └── types/                      # TypeScript domain types
├── package.json
└── pnpm-lock.yaml
```

## Important security and operational notes

- **Use your own Google resources.** A fork must have its own Google Cloud project, OAuth client, service account, spreadsheet, Auth.js secret, and Netlify site.
- **Never commit secrets.** Do not commit `.env.local`, service-account JSON files, OAuth client secrets, private keys, or real member/financial data.
- **Limit administrators.** The current authentication configuration requires between one and five comma-separated emails in `ADMIN_EMAILS`. Each administrator must use a verified Google account.
- **Protect the spreadsheet.** Share it only with the service account and trusted spreadsheet administrators. A service account with Editor access can change all data in that spreadsheet.
- **Back up the spreadsheet.** Google Sheets is the system of record. Set up a regular backup/export process and test restoring it.
- **Understand concurrency limits.** The duplicate-phone guard is an in-process lock, not a distributed lock. It does not guarantee duplicate prevention across multiple server instances or simultaneous serverless invocations. For larger or high-concurrency deployments, move to a database with unique constraints and transactions.
- **Test before production.** Use a separate test spreadsheet first. Verify all workflows and reporting logic with representative data before entering real records.
- **Review privacy and local requirements.** Member contact details and contribution histories are sensitive. Establish appropriate consent, access, retention, and backup practices for your jurisdiction and organisation.
- **Review your deployment costs and quotas.** Netlify and Google Cloud/Sheets usage are subject to their current plans, limits, and terms. This architecture avoids managing a dedicated database/server, but it should not be described as guaranteed zero-cost.

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a focused branch from `main`.
3. Make your changes and run `pnpm lint` and `pnpm build`.
4. Test changes against your own Google Cloud project and test spreadsheet.
5. Open a pull request describing the change and the tests performed.

Please do not include credentials, private spreadsheet links, or real member data in issues or pull requests.

## Useful official documentation

- [Google Sheets API: Node.js quickstart](https://developers.google.com/workspace/sheets/api/quickstart/nodejs)
- [Google OAuth 2.0 for web server applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Create Google Cloud service accounts](https://cloud.google.com/iam/docs/service-accounts-create)
- [Create and delete service-account keys](https://cloud.google.com/iam/docs/keys-create-delete)
- [Deploy Next.js on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/)

## License

This project is distributed under the license in [LICENSE](./LICENSE).
