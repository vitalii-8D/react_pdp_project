# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev         # start dev server (React Router Framework Mode, HMR) — http://localhost:3003
npm run build        # production build (build/client + build/server)
npm run start         # run the production build (react-router-serve ./build/server/index.js)
npm run typecheck     # react-router typegen && tsc — regenerates route types, then type-checks
npm run format        # prettier --write on app/**/*.ts(x)
npm run codegen       # regenerate app/graphql/__generated__/graphql.ts from app/graphql/**/*.graphql
npm run schema:download  # refresh schema.graphql from the running API (SERVER_URL), then run codegen
```

There is no test suite and no lint script configured in this repo. `npm run typecheck` is the primary correctness check — always regenerate route types before trusting a type error, since stale `.react-router/types/` output can mask or fabricate errors.

The dev server binds to the port in `.env` (`PORT`, default 3003) to match the sibling backend's `WEB_URL` expectation — don't change the default port casually.

## Architecture

This is a **React Router v8 Framework Mode** app (`@react-router/dev`) — server-rendered, with per-route `loader`/`action` exports, no client-side `useEffect`+`fetch` for route data. It is a thin frontend client for a sibling NestJS + GraphQL backend (`SERVER_URL` in `.env`, default `http://localhost:3000/graphql`).

**Read `.local/REACT-APP-EXPLAINED.md` first for anything non-trivial** — it's a complete, up-to-date architecture walkthrough (routing, loaders/actions/fetchers, auth/session flow, the GraphQL client layer, component conventions, Tailwind setup) written for this exact codebase. The summary below is index, not substitute.

### Layout
- `app/routes.ts` — explicit route config (not filesystem routing). `login`/`register`/`logout` render standalone; everything else nests inside `layout("routes/app-layout.tsx", [...])`, which renders `Header`/`Footer` around an `<Outlet/>`.
- `app/routes/` is grouped into per-feature subfolders (`auth/`, `posts/`, `my-posts/`, `profile/`), each still containing the flat, dot-separated filenames (`posts/posts.$postId.$slug.tsx`, `my-posts/my-posts.$postId.edit.tsx`, etc.) that map 1:1 to entries in `routes.ts`. A route file can export `loader` (GET/data), `action` (mutations from `<Form>`/`fetcher.submit`), `meta` (page `<title>`/OG tags from `loaderData`), and a default component receiving `loaderData`/`actionData` as props. `posts.$postId.share-links.tsx` and `my-posts.$postId.destroy.tsx` are *resource routes* — no default export, hit only via `useFetcher`.
- `posts/posts.$postId.$slug.tsx` is the public post-detail page: it uses `getOptionalUser` (renders for both logged-in and anonymous visitors) and its `meta` export calls `buildOgMetaTags` to emit Open Graph/Twitter tags for link unfurling. Its view count is posted once per visit from the browser to the `posts/:postId/view` resource route (with `defaultShouldRevalidate: false`) rather than incremented in the loader, which re-runs after every comment action.
- `app/lib/paths.ts` exports a `paths` object (`paths.postDetail(id, slug)`, `paths.myPostEdit(id)`, ...) — the single source of truth for route URLs. Always build links/redirects through `paths.*` rather than hand-writing a template string, so a route path change only needs updating here.
- `app/components/*` — presentational only. Never call `loader`/`action`/`gqlRequest` directly; data flows in as props from the route that renders them. A small shared UI kit lives alongside the feature components (`Button`, `Card`, `Modal`, `TextField`, `NavLink`, `AuthLayout`, `LogoMark`) — `Button` uses `class-variance-authority` (`buttonStyles`/`cva`) for its variant/size props, which is the pattern to follow for any new component that needs style variants rather than ad hoc conditional `className` strings.
- `app/enums/*.ts` — string-literal constants (form field names, meta tag names, social platforms) are defined as TS enums (`PostFormField`, `AuthFormField`, `MetaProperty`/`MetaName`/`TwitterCardType`, `SocialPlatform`) and referenced by their enum member rather than a raw string, e.g. in form `name=`/`formData.get()` calls. API enums (`PostStatus`, `UserRole`, `PostPaymentStatus`, `UploadPurpose`, `ChatPresenceEventType`, ...) are generated from the schema as native TS enums (`PostStatus.Published`, `UserRole.Admin`) and only re-exported from `app/enums`.
- `app/lib/*.server.ts` — server-only helpers (session/auth, the GraphQL client, `meta.ts`'s OG tag builder, `site-url.server.ts`'s canonical URL). The `.server.ts` suffix is enforced by the build: anything imported only from a loader/action is stripped from the browser bundle, which is how the JWT and backend URL stay off the client. Note `getSiteUrl()` (used to build absolute OG URLs) reads `HOST`, a *different* env var than the `PORT` the dev server binds to — don't conflate the two.
- `app/graphql/<domain>/{fragments,queries,mutations,subscriptions}.graphql` — the only place GraphQL operations live. `npm run codegen` turns them into typed `XxxDocument`s in `app/graphql/__generated__/graphql.ts` (generated, never edit; it reads the local `schema.graphql` snapshot, not the live API). After editing any `.graphql` file, run codegen.
- `app/lib/graphql/*.server.ts` — thin typed wrappers over the generated documents (`posts.server.ts`, `users.server.ts`, `categories.server.ts`, `open-graph.server.ts`, `payments.server.ts`, `comments.server.ts`, `chat.server.ts`, `uploads.server.ts`, `analytics.server.ts`). Route modules call these functions, never `gqlRequest` directly.
- `app/lib/types.ts` gives domain names (`PostEntity`, `CurrentUser`, `ChatRoomEntity`, ...) to the generated fragment types — use these in components instead of hand-written interfaces.
- `./+types/<route>` imports are generated by `react-router typegen` into `.react-router/types/` — never hand-edit, just re-run typecheck if they look stale.

### Auth
- JWT lives only in an httpOnly, signed session cookie (`app/lib/sessions.server.ts`), never in `localStorage` — the browser JS never sees the token.
- `app/lib/auth.server.ts`: `requireToken` (cheap, cookie-only, throws `redirect("/login")`) vs `requireUser` (also calls the backend `me` query — validates the token and fetches profile; on a 401 it destroys the session and redirects to login). `getOptionalUser` is the non-throwing variant for routes that render differently for logged-in vs anonymous users.
- `app-layout.tsx`'s loader calls `requireUser` on every navigation into the protected area, which is what makes session validation/auto-logout work without per-route boilerplate.
- Logout is a `<Form method="post">` to `/logout`, deliberately not a `loader`-triggered GET, to avoid CSRF via a stray `<img>`/link.
- `app/lib/safe-redirect.ts` guards any user-supplied redirect target (e.g. the `?from=` param `AuthLayout`'s back-link and login/register use) against open-redirect — always route redirect targets through `safeRedirectPath`, never use a raw query param.

### GraphQL client
- `app/lib/graphql-client.server.ts` wraps `graphql-request`; `gqlRequest(document, variables, token)` takes a generated `XxxDocument` (result/variables types are inferred) and is the single chokepoint for backend HTTP calls. It throws `GqlRequestError` (with an unwrapped, human-readable message and status) instead of the raw `ClientError`. `errorMessage(error, fallback)` turns a caught error into a UI string, and `toActionError(error, fallback)` is the standard way an `action` turns it into the `data({ error }, { status: 400 })` shape consumed by `actionData`. Loaders that can degrade (posts/users search, post comments) catch and return `error` so the rest of the page still renders (`ErrorMessage` in `components/PageStatus.tsx`).
- Fragments (e.g. `PostFields` in `app/graphql/posts/fragments.graphql`) keep each field list in one place. `PostFields` also selects the Open Graph fields the post page's `meta` needs — the one selection the CSR sibling (`../react_pdp_project_csr`, same operations otherwise) doesn't have.
- `open-graph.server.ts`'s `generateShareLinksQuery` backs the Share modal's per-platform links (`SocialPlatform` enum); it accepts an optional token since share links can be generated for anonymous visitors on the public post page.
- `schema.graphql` (repo root) is the backend's GraphQL schema snapshot — check it for available fields/types/mutations.

### Payments (Stripe)
- Posts require payment to publish. `my-posts/my-posts.$postId.publish.tsx` and `my-posts/my-posts.$postId.retry-payment.tsx` are resource routes whose `action()` calls `publishPostMutation`/`retryPostPaymentMutation` (`app/lib/graphql/payments.server.ts`) — the backend creates the Stripe Checkout session, not this app. If the mutation resolves with a `checkoutUrl`, the action returns it as data instead of redirecting; a free republish (post already paid once) instead resolves synchronously with no `checkoutUrl` and the action redirects straight to `paths.myPosts()`.
- The client-side half of that handoff lives in `PostActionsBar.tsx` (and the new/edit post pages): a `useEffect` watches for the `checkoutUrl` and calls `redirectToCheckout` (`app/lib/checkout.ts`) — it lazy-loads Stripe.js via the side-effect-free `@stripe/stripe-js/pure` entry, then does a full browser navigation to Stripe's hosted Checkout page, deliberately not a `<Form>`/redirect, since Checkout is an external domain. Retry-payment behaves the same as publish: no `checkoutUrl` means a redirect to `paths.myPosts()`.
- `app/lib/stripe.server.ts` only exposes `getStripePublishableKey()` (reads `STRIPE_PUBLISHABLE_KEY`); the app-layout loader returns it once and components read it with `useStripePublishableKey()`. All secret-key/webhook logic lives in the sibling NestJS backend, not here.
- Stripe confirms payment **asynchronously via a backend webhook**, not synchronously in this app. `routes/payments/payments.success.tsx` and `payments.cancel.tsx` (Stripe's redirect targets after Checkout) just read whatever `PaymentTransactionStatus` (`app/enums/payment-status.enum.ts`) the webhook has already written via `transactionsForPostQuery` — they never poll or confirm with Stripe themselves, so a `Pending` status on that page is normal if the webhook hasn't landed yet.
- `PostPaymentStatus` (also in `payment-status.enum.ts`) is the *post's* derived status (`NotRequired`/`Pending`/`Succeeded`/`Failed`/`Refunded`), distinct from `PaymentTransactionStatus` on individual transactions — don't conflate the two enums.
- Refunds are admin/owner-initiated from `profile/profile.transactions.$transactionId.refund.tsx` (resource route → `refundPaymentMutation`), listed via `myTransactionsQuery` on `profile.tsx`.

### Chat (Socket.IO)
- `routes/chat/*` (`chat.tsx` list/create-room, `chat.$roomId.tsx` a room, plus `chat.users-search.tsx`/`chat.start-dm.tsx` resource routes) is real-time via `socket.io-client`, layered on top of the same loader/action data flow used everywhere else (initial messages/room list still come from GraphQL loaders; the socket only pushes live updates after mount).
- `ChatWindow.tsx` (Socket.IO) and `ChatWindowV2.tsx` (graphql-ws) each own their connection in a single effect (connect, subscribe, join, tear down together); the room routes key the window by room id, so switching rooms remounts it instead of resetting state in effects. `ChatWindow` still keeps its `Socket` in a `useRef` because the send/broadcast handlers outside the effect need it. History always comes from the loader's HTTP query (attachments included) — the socket's `joinedRoom` payload is ignored because the backend sends it without attachments. Chat V2's subscription documents are printed for graphql-ws in `app/lib/graphql/chat-v2-browser.ts`, and a replayed `chatMessageAdded` that's already in the list is dropped.

### Comments & Elasticsearch
- `app/lib/graphql/comments.server.ts` backs the nested comment routes (`posts.$postId.comments.tsx` and its `.$commentId`/`.$commentId.destroy` children) and also feeds the admin analytics dashboard (`commentsPerPostQuery`, `commentsPerUserQuery`, `commentsPerPeriodQuery`, `commentRatingDistributionQuery`).
- `routes/users/users.tsx` is an Elasticsearch-backed user search (`searchUsersFullQuery` in `users.server.ts`) supporting free-text query, geo-radius filtering (`useMyLocation`/`radiusKm`, only offered when the current user has lat/lng set), and cursor pagination — the `useInfiniteScroll` hook (`app/hooks/`) appends pages from a `useFetcher` load rather than a full navigation.

### Analytics
`routes/analytics/analytics.tsx` is an admin-only (`UserRole.ADMIN`, else redirects to `paths.posts()`) Recharts dashboard combining `analyticsDashboardQuery` with the comments queries above. Chart colors follow the `dataviz` skill's validated reference palette (see the constants at the top of that file) — reuse those constants rather than picking new colors for any new chart.

### S3 direct uploads
`routes/uploads/uploads.presign.tsx` is a resource route that returns a pre-signed S3 URL; `ImageUploadField.tsx` uses it as a third data-loading pattern alongside `useNavigation`/`useFetcher` (see `.local/webhooks.md`'s hooks conspect, §4 — despite the filename, it's a React Router hooks writeup, not about webhooks): plain `fetch()` with no `<Form>`/fetcher involved, PUTting the file directly to S3 and exposing the result to the parent `<Form>` via hidden inputs so it rides along on the next real submit.

### Styling
Tailwind CSS v4 via `@tailwindcss/vite`, utility classes only — no per-component CSS/module files. `app/app.css` is the single stylesheet entry (theme tokens + base rules).

### Reference docs in `.local/`
Beyond `REACT-APP-EXPLAINED.md` (the GraphQL schema now lives in `schema.graphql` at the repo root): `auth-docs.md` (session/auth flow — `requireToken` vs `requireUser` vs `getOptionalUser`), `webhooks.md` (misnamed — actually a React Router data-hooks conspect: `useNavigation` vs `useFetcher` vs plain `fetch`, with this repo's exact call sites), `chat-explain.md` (why `ChatWindow` uses a socket ref — predates the single-effect connection described above), `s3-upload.md`, and `refactoring-plan.md`.

## Code style

Same rules as the CSR sibling: always wrap the body of an `if` in braces (even a single statement), and always put an empty line before a `return` statement unless it's the first statement in its block.
