# StellarSplit 200-Point Issue Backlog

Each issue below is intentionally self-contained within a single surface so contributors can work frontend-only, backend-only, docs-only, or contracts-only without waiting on another repo area to be deployed first.

## Frontend

### FE-001 - Router/App Shell Consolidation
Complexity: High (200)
Problem: `frontend/src/App.tsx` contains an alternate app shell and service worker setup, but `frontend/src/main.tsx` mounts the router directly and never imports it.
Scope: Consolidate application bootstrapping into a single shell so providers, live regions, service worker registration, and route rendering have one source of truth.
Implementation guidance: Move provider and shell composition into a reusable bootstrap component and remove dead entrypoint logic.
Acceptance criteria: The frontend has one canonical app entry flow, `App.tsx` is either used intentionally or removed, and service worker registration only happens once.
Validation: Route smoke tests, shell render tests, and a regression test that confirms the live region and router both mount from the same tree.
Files to modify: `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/layouts/RootLayout.tsx`
Files to create: `frontend/src/components/AppProviders.tsx`

### FE-002 - Analytics Data Provider Abstraction
Complexity: High (200)
Problem: `frontend/src/utils/analytics-api.ts` silently falls back to inline mock datasets, mixing transport, fixtures, and feature behavior in one module.
Scope: Separate analytics fetching from fallback policy so production pages can choose strict API mode, fixture mode, or hybrid development mode explicitly.
Implementation guidance: Introduce a provider contract, isolate fallback fixtures, and propagate source metadata to the UI.
Acceptance criteria: Analytics pages no longer depend on embedded mock arrays inside the transport helper and can show when data is live versus fixture-backed.
Validation: Tests for live success, transport failure, fixture mode, and source-label rendering in `useAnalytics`.
Files to modify: `frontend/src/utils/analytics-api.ts`, `frontend/src/hooks/useAnalytics.ts`, `frontend/src/pages/AnalyticsDashboard.tsx`
Files to create: `frontend/src/services/analyticsDataProvider.ts`

### FE-003 - Split History Repository Extraction
Complexity: High (200)
Problem: `frontend/src/pages/SplitHistoryPage.tsx` owns fetching, mock fallback, CSV export, filtering, pagination, and rendering in a single page module.
Scope: Move data access and export responsibilities out of the page so the UI stays focused on state transitions and presentation.
Implementation guidance: Extract a history repository plus CSV export utility and keep the page responsible only for filter state and layout.
Acceptance criteria: The page contains no inline mock dataset and no raw export implementation details.
Validation: Tests for repository fallback behavior, CSV escaping, pagination reset on filter changes, and empty-state rendering.
Files to modify: `frontend/src/pages/SplitHistoryPage.tsx`, `frontend/src/components/SplitHistory/HistoryFilters.tsx`, `frontend/src/components/SplitHistory/SplitTimeline.tsx`
Files to create: `frontend/src/services/splitHistoryRepository.ts`, `frontend/src/utils/exportHistoryCsv.ts`

### FE-004 - Split Group Data Layer Extraction
Complexity: High (200)
Problem: `frontend/src/pages/SplitGroup.tsx` boots from `MOCK_GROUPS` and still uses `console.log` plus `alert()` for split creation.
Scope: Replace in-page fixtures and placeholders with a frontend-owned data layer that can swap between seeded data, local persistence, or future remote adapters without rewriting the page.
Implementation guidance: Add a group data source contract, migrate seed data to optional fixtures, and wire create/update/delete/create-split handlers through that abstraction.
Acceptance criteria: The page no longer imports mock groups directly and split creation does not use browser alerts or console placeholders.
Validation: Tests for initial load, optimistic create/update/delete, empty repository state, and split creation action dispatch.
Files to modify: `frontend/src/pages/SplitGroup.tsx`, `frontend/src/components/SplitGroup/data.ts`, `frontend/src/services/groupApi.ts`
Files to create: `frontend/src/services/splitGroupDataSource.ts`

### FE-005 - Collaboration Socket Session Alignment
Complexity: High (200)
Problem: `frontend/src/components/Collaboration/CollaborationProvider.tsx` reads `localStorage.getItem('token')` directly, logs raw updates, and uses loosely typed socket payloads.
Scope: Align collaboration session handling with the app’s auth/session utilities and introduce typed socket event boundaries.
Implementation guidance: Centralize token lookup, wrap socket wiring in a client helper, and replace `any` event payloads with shared types.
Acceptance criteria: CollaborationProvider contains no direct token string lookup and no raw `console.log` debugging in the steady-state flow.
Validation: Tests for reconnect behavior, token refresh propagation, event typing, join/leave lifecycle, and stale socket cleanup.
Files to modify: `frontend/src/components/Collaboration/CollaborationProvider.tsx`, `frontend/src/utils/session.ts`, `frontend/src/types/collaboration.ts`
Files to create: `frontend/src/services/collaborationClient.ts`

### FE-006 - API Endpoint Catalog Cleanup
Complexity: High (200)
Problem: `frontend/src/utils/api-client.ts` probes multiple path variants to compensate for backend prefix drift, making request behavior implicit and hard to reason about.
Scope: Replace path guessing with an explicit frontend-owned endpoint catalog and one clearly selected base-path strategy.
Implementation guidance: Introduce a route registry, remove opportunistic `/v1` and `/api` permutations, and require endpoint definitions to declare their final relative path explicitly.
Acceptance criteria: Requests are built from explicit route definitions rather than fallback permutations.
Validation: Frontend unit tests for canonical route building, 404 handling, version-prefix configuration, and error normalization.
Files to modify: `frontend/src/utils/api-client.ts`, `frontend/src/constants/api.ts`
Files to create: `frontend/src/services/apiRouteRegistry.ts`

### FE-007 - Wallet Session Persistence Hardening
Complexity: High (200)
Problem: Wallet/session state is spread across `use-wallet.tsx` and `utils/session.ts`, with localStorage persistence but no schema versioning, expiry, or cross-tab synchronization.
Scope: Make wallet session storage resilient, explicit, and upgrade-safe.
Implementation guidance: Add a typed storage layer with versioning, storage-event listeners, and helper methods for auth token and active user lifecycle.
Acceptance criteria: Session reads/writes go through one abstraction and stale/corrupt values are handled gracefully.
Validation: Tests for storage migration, logout propagation across tabs, corrupt payload recovery, and reconnect after refresh.
Files to modify: `frontend/src/hooks/use-wallet.tsx`, `frontend/src/utils/session.ts`, `frontend/src/components/wallet-button.tsx`
Files to create: `frontend/src/utils/sessionStore.ts`

### FE-008 - Theme Context Renaming and Bootstrap Safety
Complexity: High (200)
Problem: Theme state lives in `ThemeContex.tsx` with a misspelled filename and immediate browser-storage assumptions that complicate bootstrap and maintenance.
Scope: Normalize naming and make theme initialization more robust during first paint.
Implementation guidance: Rename the context module, add a minimal pre-hydration theme bootstrap, and update all consumers to the canonical import path.
Acceptance criteria: The theme module has a consistent name, all imports are updated, and theme flash is minimized on reload.
Validation: Tests for light/dark/system toggling, persisted theme restore, and import-path regression coverage.
Files to modify: `frontend/src/components/ThemeContex.tsx`, `frontend/src/main.tsx`, `frontend/src/components/ThemeToggle.tsx`, `frontend/src/components/Analytics/SpendingChart.tsx`, `frontend/src/components/Analytics/CategoryPieChart.tsx`, `frontend/src/components/Analytics/DebtTracker.tsx`, `frontend/src/components/Analytics/PaymentHeatmap.tsx`, `frontend/src/components/Analytics/TimeAnalysis.tsx`
Files to create: `frontend/src/utils/themeBootstrap.ts`

### FE-009 - Payment Flow Orchestrator Unification
Complexity: High (200)
Problem: `PaymentModal.tsx` and `PaymentURIPage.tsx` duplicate wallet gating, network mismatch messaging, and submission-state handling.
Scope: Centralize pay-flow orchestration so modal, deep-link, and QR entrypoints share the same transaction readiness logic.
Implementation guidance: Extract a checkout hook/state machine and let UI wrappers render around a common payment execution contract.
Acceptance criteria: Wallet status rules and payment submission states are defined once and reused by both payment entry screens.
Validation: Tests for disconnected wallet, wrong-network flow, successful payment, failed submission, and duplicate submit prevention.
Files to modify: `frontend/src/components/Payment/PaymentModal.tsx`, `frontend/src/pages/PaymentURIPage.tsx`, `frontend/src/components/Payment/PaymentURIHandler.tsx`
Files to create: `frontend/src/hooks/usePaymentCheckout.ts`

### FE-010 - Notification Store Persistence and Server Rehydration
Complexity: High (200)
Problem: `frontend/src/store/notifications.ts` is purely in-memory, so unread state and filters disappear on reload and cannot merge local events with server data.
Scope: Add notification persistence and hydration strategy without coupling components to storage details.
Implementation guidance: Introduce a storage adapter, add merge semantics for fetched and optimistic notifications, and keep selectors pure.
Acceptance criteria: Notifications survive reloads and can be rehydrated from storage or API without duplicating records.
Validation: Tests for rehydrate-on-load, dedupe behavior, mark-as-read persistence, and clear-all flows.
Files to modify: `frontend/src/store/notifications.ts`, `frontend/src/components/Notifications/NotificationCenter.tsx`, `frontend/src/components/Notifications/NotificationDropdown.tsx`
Files to create: `frontend/src/store/notificationPersistence.ts`

### FE-011 - Shared Draft Registry for Wizard and Receipt Flows
Complexity: High (200)
Problem: `SplitCreationWizard.tsx` and `ReceiptCaptureFlow.tsx` each manage their own `localStorage` draft logic with separate keys and recovery behavior.
Scope: Build a shared draft registry so save/resume/clear logic is consistent across multi-step flows.
Implementation guidance: Introduce a typed draft registry with timestamps and versioned payloads, then delegate both flows to it.
Acceptance criteria: Neither flow performs raw `localStorage` reads/writes directly.
Validation: Tests for save, resume, clear, expiry pruning, and version mismatch fallback.
Files to modify: `frontend/src/components/SplitWizard/SplitCreationWizard.tsx`, `frontend/src/components/Receipt/ReceiptCaptureFlow.tsx`, `frontend/src/utils/session.ts`
Files to create: `frontend/src/utils/draftRegistry.ts`

### FE-012 - Route-Level Error and Pending Boundaries
Complexity: High (200)
Problem: Lazy routes in `frontend/src/main.tsx` rely on a shell error boundary but do not declare route-specific error or loading boundaries at the router layer.
Scope: Add route-level loading and failure handling so navigation errors are isolated per screen.
Implementation guidance: Use router `errorElement` and shared pending UI components instead of relying only on shell-level catching.
Acceptance criteria: Route failures render scoped recovery actions and lazy route loading has a consistent fallback.
Validation: Router tests for lazy import failure, retry flow, and successful recovery after navigation.
Files to modify: `frontend/src/main.tsx`, `frontend/src/layouts/RootLayout.tsx`
Files to create: `frontend/src/components/routing/RouteErrorBoundary.tsx`, `frontend/src/components/routing/RoutePending.tsx`

### FE-013 - Modal and Overlay Accessibility Hardening
Complexity: High (200)
Problem: Several overlays rely on ad hoc focus behavior, including `PaymentModal`, the sidebar, and related popovers.
Scope: Standardize focus trapping, escape handling, and initial focus behavior for overlays across the app.
Implementation guidance: Introduce a reusable accessibility utility for modal focus management and retrofit existing overlays.
Acceptance criteria: Overlays trap focus correctly, restore focus on close, and expose predictable keyboard behavior.
Validation: Accessibility tests for tab order, escape-to-close, focus restoration, and screen-reader labeling.
Files to modify: `frontend/src/components/Payment/PaymentModal.tsx`, `frontend/src/components/SIdebar.tsx`, `frontend/src/components/LanguageSelector.tsx`, `frontend/src/components/Split/ShareModal.tsx`
Files to create: `frontend/src/hooks/useFocusTrap.ts`

### FE-014 - Design Token Enforcement Across Purple-Hardcoded UI
Complexity: High (200)
Problem: Many feature screens still hardcode purple utility classes despite the broader theme-token direction.
Scope: Replace hardcoded accent colors with semantic design tokens so theme changes do not require component-by-component rewrites.
Implementation guidance: Define missing semantic variables and refactor high-traffic screens to consume them.
Acceptance criteria: Payment, receipt, wizard, and history surfaces no longer depend on hardcoded purple classes for primary actions.
Validation: Visual regression checks for light/dark themes and tests that key components still expose accessible contrast ratios.
Files to modify: `frontend/src/index.css`, `frontend/src/pages/SplitHistoryPage.tsx`, `frontend/src/components/Payment/PaymentModal.tsx`, `frontend/src/components/Receipt/ReceiptCaptureFlow.tsx`, `frontend/src/components/SplitWizard/StepIndicator.tsx`
Files to create: `frontend/src/styles/tokens.css`

### FE-015 - Wizard Submission Mapping Extraction
Complexity: High (200)
Problem: `SplitCreationWizard.tsx` mixes field validation, UUID normalization, pricing calculation, API payload mapping, and participant directory persistence in one submit handler.
Scope: Separate submission mapping from UI state progression to make the wizard easier to maintain and reuse.
Implementation guidance: Extract a submission mapper that receives validated wizard state and returns normalized API payloads plus local cache updates.
Acceptance criteria: The component submit handler becomes orchestration-only and mapping logic is covered independently.
Validation: Tests for equal, custom, and itemized split payload generation, participant ID mapping, and local directory output.
Files to modify: `frontend/src/components/SplitWizard/SplitCreationWizard.tsx`, `frontend/src/utils/split-calculations.ts`, `frontend/src/utils/api-client.ts`
Files to create: `frontend/src/components/SplitWizard/wizardSubmissionMapper.ts`

### FE-016 - Abortable Analytics and Dashboard Fetches
Complexity: High (200)
Problem: `useAnalytics` and dashboard loading flows can race when filters or active user state change quickly because requests are not cancel-aware.
Scope: Add cancellation and stale-response protection for analytics/dashboard fetch hooks.
Implementation guidance: Use abort-aware helpers or request tokens and make hooks ignore or cancel superseded work.
Acceptance criteria: Rapid filter changes and account changes do not flash stale data from outdated requests.
Validation: Tests for aborted requests, stale response suppression, retry after error, and consecutive refresh calls.
Files to modify: `frontend/src/hooks/useAnalytics.ts`, `frontend/src/pages/Dashboard.tsx`, `frontend/src/utils/api-client.ts`
Files to create: `frontend/src/hooks/useAbortableRequest.ts`

### FE-017 - Service Worker Update Lifecycle UX
Complexity: High (200)
Problem: `frontend/src/utils/sw-register.ts` only logs registration and does not surface updates, failures, or stale-cache recovery to users.
Scope: Turn service worker registration into a user-facing lifecycle with update prompts and recoverable failure states.
Implementation guidance: Emit registration/update events, connect them to install/update UI, and expose a forced-refresh path.
Acceptance criteria: Users can detect when a new version is ready and refresh intentionally instead of relying on console output.
Validation: Tests for registration success, update-available event, failed registration handling, and refresh action wiring.
Files to modify: `frontend/src/utils/sw-register.ts`, `frontend/src/components/InstallPrompt.tsx`, `frontend/src/main.tsx`
Files to create: `frontend/src/store/serviceWorkerStore.ts`

### FE-018 - Internationalization Coverage Audit
Complexity: High (200)
Problem: Core screens like dashboard, split history, and payment still embed many English strings directly in components.
Scope: Expand translation coverage so key surfaces are fully localizable and copy changes stay centralized.
Implementation guidance: Replace hardcoded strings with translation keys and add missing locale entries with sensible fallbacks.
Acceptance criteria: Dashboard, split history, and payment screens render through i18n keys instead of inline English copy.
Validation: Tests that keys resolve in the default locale and a secondary locale smoke test for the affected screens.
Files to modify: `frontend/src/pages/Dashboard.tsx`, `frontend/src/pages/SplitHistoryPage.tsx`, `frontend/src/pages/PaymentURIPage.tsx`, `frontend/src/components/Payment/PaymentModal.tsx`, `frontend/src/i18n/locales/en.json`, `frontend/src/i18n/locales/fr.json`, `frontend/src/i18n/locales/de.json`, `frontend/src/i18n/locales/es.json`, `frontend/src/i18n/locales/pt.json`, `frontend/src/i18n/locales/ja.json`, `frontend/src/i18n/locales/zh.json`
Files to create: None

### FE-019 - Frontend API Adapter Regression Tests
Complexity: High (200)
Problem: Route building and error handling in the frontend API adapter can regress silently because behavior is assembled dynamically.
Scope: Add frontend-only regression tests around endpoint construction, fallback removal, and normalized error behavior.
Implementation guidance: Use mocked transport fixtures and deterministic endpoint definitions so the test suite does not depend on any live backend.
Acceptance criteria: Route-builder or error-normalization regressions fail in the frontend test suite immediately.
Validation: Tests for canonical route resolution, version-prefix configuration, field-error extraction, and request failure normalization.
Files to modify: `frontend/src/utils/api-client.ts`, `frontend/src/test/setup.ts`
Files to create: `frontend/src/utils/api-client.spec.ts`

### FE-020 - Receipt OCR Provider Abstraction
Complexity: High (200)
Problem: Receipt OCR behavior is split between transport helpers and simulated flows, making it hard to switch between simulated, deferred, and manual-review modes cleanly.
Scope: Introduce an OCR provider boundary that the receipt flow can consume without knowing which local strategy produced the result.
Implementation guidance: Move OCR strategy selection into a provider and keep `ReceiptCaptureFlow` focused on UX state.
Acceptance criteria: Receipt flow components contain no direct simulation branching and no hardcoded OCR strategy decisions.
Validation: Tests for simulated OCR, deferred-result resolution, OCR failure fallback, and manual-entry continuation.
Files to modify: `frontend/src/utils/receiptOcr.ts`, `frontend/src/components/Receipt/ReceiptCaptureFlow.tsx`, `frontend/src/components/ReceiptUpload/ReceiptUpload.tsx`
Files to create: `frontend/src/services/receiptOcrProvider.ts`

## Backend

### BE-001 - Route Prefix Normalization
Complexity: High (200)
Problem: Several controllers hardcode `api/...` in `@Controller()` while `main.ts` already applies the global `/api` prefix and URI versioning, producing inconsistent path behavior.
Scope: Normalize controller prefixes so routing is explicit, version-safe, and consistent across modules.
Implementation guidance: Remove embedded `api/` segments from controllers, introduce route-prefix guidelines, and align tests/docs around canonical paths.
Acceptance criteria: No controller depends on hardcoded global prefix duplication and route behavior is consistent under `/api/v1`.
Validation: E2E tests for analytics, receipts, compliance, short-links, reputation, debt-simplification, and receipt-to-split routes.
Files to modify: `backend/src/main.ts`, `backend/src/analytics/analytics.controller.ts`, `backend/src/compliance/compliance.controller.ts`, `backend/src/receipts/receipts.controller.ts`, `backend/src/short-links/short-links.controller.ts`, `backend/src/reputation/reputation.controller.ts`, `backend/src/debt-simplification/debt-simplification.controller.ts`, `backend/src/modules/receipt-to-split/receipt-to-split.controller.ts`
Files to create: `backend/src/common/route-prefix.constants.ts`

### BE-002 - Auth User Shape Unification
Complexity: High (200)
Problem: Different modules expect `req.user.id`, `req.user.walletAddress`, or `req.user.wallet`, creating fragile auth assumptions throughout the backend.
Scope: Define one authenticated-user contract and migrate guards/controllers to it.
Implementation guidance: Introduce a shared auth user interface plus helpers/decorators and update controllers to consume that shape consistently.
Acceptance criteria: Controllers and guards no longer disagree about the authenticated user fields.
Validation: Guard/unit tests and endpoint smoke tests for payments, receipts, short-links, reputation, and dashboard.
Files to modify: `backend/src/auth/guards/jwt-auth.guard.ts`, `backend/src/auth/guards/authorization.guard.ts`, `backend/src/short-links/short-links.controller.ts`, `backend/src/reputation/reputation.controller.ts`, `backend/src/receipts/receipts.controller.ts`, `backend/src/dashboard/dashboard.controller.ts`
Files to create: `backend/src/auth/interfaces/auth-user.interface.ts`

### BE-003 - Dispute Controller Auth Context Completion
Complexity: High (200)
Problem: `backend/src/disputes/disputes.controller.ts` still injects placeholder actor IDs like `"G..."` instead of real authenticated users.
Scope: Complete dispute request attribution so every mutation is tied to the caller from auth context.
Implementation guidance: Add a reusable current-user decorator or request helper and remove placeholder identities from controller methods.
Acceptance criteria: Dispute create/update/resolve/reject/appeal flows use authenticated actor IDs only.
Validation: Controller and integration tests for actor propagation, authorization failure, and audit trail attribution.
Files to modify: `backend/src/disputes/disputes.controller.ts`, `backend/src/disputes/disputes.service.ts`, `backend/src/auth/guards/jwt-auth.guard.ts`
Files to create: `backend/src/auth/decorators/current-user.decorator.ts`

### BE-004 - Governance Voting Power Integration
Complexity: High (200)
Problem: `backend/src/governance/governance.service.ts` still returns mock voting-power totals, so proposal thresholds and quorum checks are not real.
Scope: Replace placeholder governance math with a real provider backed by staking, token, or ledger-derived voting power.
Implementation guidance: Introduce a provider interface, wire governance to it, and remove hardcoded defaults from vote and proposal flows.
Acceptance criteria: Voting power and total system power are loaded from a real data source or clearly configurable provider.
Validation: Tests for proposal threshold checks, quorum calculation, abstain handling, and queued execution timing with realistic power inputs.
Files to modify: `backend/src/governance/governance.service.ts`, `backend/src/governance/governance.module.ts`, `backend/src/stellar/stellar.service.ts`
Files to create: `backend/src/governance/governance-power.provider.ts`

### BE-005 - Collaboration Notification Delivery Integration
Complexity: High (200)
Problem: `CollaborationNotificationService` logs invitation/response/removal events instead of delivering them through actual notification channels.
Scope: Integrate collaboration events with push, email, and in-app notification infrastructure.
Implementation guidance: Introduce a delivery coordinator that can fan out collaboration notifications to existing notification modules.
Acceptance criteria: Collaboration notifications no longer stop at debug logs and delivery failures are observable.
Validation: Tests for push/email/in-app dispatch selection, retry behavior, and no-op handling when user preferences disable channels.
Files to modify: `backend/src/collaboration/services/notification.service.ts`, `backend/src/push-notifications/push-notifications.service.ts`, `backend/src/email/email.service.ts`, `backend/src/modules/activities/activities.service.ts`
Files to create: `backend/src/collaboration/services/collaboration-notification-dispatcher.ts`

### BE-006 - Payment Idempotency Contract Unification
Complexity: High (200)
Problem: Payments accept idempotency data both via DTO fields and header inspection, which risks mismatched behavior and ambiguous replay semantics.
Scope: Define one payment idempotency contract and propagate it consistently from controller through processor and persistence layers.
Implementation guidance: Prefer header-driven idempotency with explicit request context binding and remove duplicate DTO responsibility unless truly needed.
Acceptance criteria: Payment submission uses one canonical idempotency source and replayed requests return stable responses.
Validation: Tests for same-key same-body replay, same-key different-body rejection, and missing-key passthrough.
Files to modify: `backend/src/payments/payments.controller.ts`, `backend/src/payments/dto/submit-payment.dto.ts`, `backend/src/common/idempotency/idempotency.interceptor.ts`, `backend/src/payments/payments.service.ts`
Files to create: `backend/src/payments/payment-request-context.ts`

### BE-007 - Authorization Service Hardening
Complexity: High (200)
Problem: `AuthorizationService` contains duplicated access logic, deprecated repository patterns, and assumptions about eagerly loaded group members.
Scope: Refactor authorization checks into clearer resource-scoped helpers with reliable query behavior.
Implementation guidance: Replace deprecated lookups, normalize group-member loading, and remove repeated split-access branching.
Acceptance criteria: Authorization checks are deterministic, repository calls are modernized, and resource policies are easier to extend.
Validation: Unit tests for split, participant, receipt, dispute, group, and short-link access paths.
Files to modify: `backend/src/auth/services/authorization.service.ts`, `backend/src/group/entities/group.entity.ts`, `backend/src/auth/guards/authorization.guard.ts`
Files to create: `backend/src/auth/services/access-scope.service.ts`

### BE-008 - WebSocket Event Schema Consolidation
Complexity: High (200)
Problem: Websocket event payloads are spread across gateway handlers and emitters with no single typed schema inside the backend.
Scope: Formalize websocket event payloads and align join, presence, activity, and payment event semantics across gateway methods.
Implementation guidance: Add typed event definitions, use them throughout the gateway, and emit stable payload shapes for room lifecycle events.
Acceptance criteria: Gateway event emission is defined in code and no backend websocket payload relies on ad hoc `Record<string, unknown>`.
Validation: Gateway tests for join/leave/presence/activity flows and payload-schema regression fixtures.
Files to modify: `backend/src/gateway/events.gateway.ts`, `backend/src/gateway/events.gateway.spec.ts`, `backend/src/gateway/gateway.module.ts`
Files to create: `backend/src/gateway/ws-events.types.ts`

### BE-009 - Structured Observability and Correlation IDs
Complexity: High (200)
Problem: Logging currently depends on scattered `console.log` calls and a minimal JSON helper without request correlation or standard metadata.
Scope: Add request-scoped correlation IDs and structured logs for API, background jobs, and outbound integrations.
Implementation guidance: Introduce request context middleware/interceptor, expand observability helpers, and replace ad hoc logs in hot paths.
Acceptance criteria: API requests, queue jobs, webhooks, and payment flows emit correlated structured logs.
Validation: Tests for correlation ID propagation and smoke verification that webhook/payment logs include shared request metadata.
Files to modify: `backend/src/utils/observability.ts`, `backend/src/main.ts`, `backend/src/common/filters/http-exception.filter.ts`, `backend/src/webhooks/webhook-delivery.service.ts`, `backend/src/payments/payments.service.ts`
Files to create: `backend/src/common/request-context.middleware.ts`

### BE-010 - Standard Error Envelope and Codes
Complexity: High (200)
Problem: Global exception filters can return inconsistent `message` shapes and do not expose stable machine-readable error codes.
Scope: Standardize error serialization across HTTP and TypeORM exceptions.
Implementation guidance: Define a normalized error DTO plus code catalog and make both global filters emit the same envelope.
Acceptance criteria: Errors from validation, domain exceptions, and persistence failures share one predictable response structure.
Validation: Tests for HTTP exceptions, validation exceptions, TypeORM conflicts, and unknown errors.
Files to modify: `backend/src/common/filters/http-exception.filter.ts`, `backend/src/common/filters/typeorm-exception.filter.ts`, `backend/src/common/dto/api-error-response.dto.ts`
Files to create: `backend/src/common/errors/error-codes.ts`

### BE-011 - Environment Validation Schema Consolidation
Complexity: High (200)
Problem: Environment validation uses a custom function in `main.ts` and a partially modeled validation file instead of one authoritative schema.
Scope: Move environment validation to a single typed schema that runs consistently at bootstrap.
Implementation guidance: Define a unified env schema, bind it through `ConfigModule`, and remove duplicate bootstrap validation assembly.
Acceptance criteria: Missing or invalid env values are reported from one source of truth and docs can be generated from it.
Validation: Tests for development, test, and production env permutations, including invalid numeric/string coercion cases.
Files to modify: `backend/src/config/env.validation.ts`, `backend/src/main.ts`, `backend/src/config/app.config.ts`
Files to create: `backend/src/config/env.schema.ts`

### BE-012 - Security Middleware Wiring
Complexity: High (200)
Problem: The backend includes security-related dependencies and partial header hardening, but security middleware setup is still fragmented.
Scope: Consolidate HTTP security middleware, cookie/csrf expectations, and production-only hardening behavior.
Implementation guidance: Add a security bootstrap module/middleware and centralize header, origin, and request-sanitization setup.
Acceptance criteria: Security middleware is enabled intentionally from one place and environment-specific behavior is documented in code.
Validation: Tests for headers, CORS behavior, CSRF opt-in routes, and dev-bypass safety checks.
Files to modify: `backend/src/main.ts`, `backend/src/security/security.module.ts`, `backend/src/security/throttle.guard.ts`, `backend/src/security/rate-limit.guard.ts`
Files to create: `backend/src/security/security.middleware.ts`

### BE-013 - Rate Limit Identity Fallback Cleanup
Complexity: High (200)
Problem: `RateLimitGuard` builds keys from wallet values that can be undefined, producing weak or inconsistent throttling keys.
Scope: Normalize request identity extraction for rate-limited endpoints.
Implementation guidance: Add a shared request identity helper and ensure unauthenticated or dev-bypass requests still generate deterministic throttle keys.
Acceptance criteria: Rate limiting works predictably for authenticated, dev-bypass, and anonymous request modes.
Validation: Tests for wallet-auth requests, header-based dev requests, anonymous fallback, and per-handler isolation.
Files to modify: `backend/src/security/rate-limit.guard.ts`, `backend/src/security/throttle.guard.ts`, `backend/src/auth/guards/jwt-auth.guard.ts`
Files to create: `backend/src/security/request-identity.util.ts`

### BE-014 - Profile and Dashboard Authorization Boundary
Complexity: High (200)
Problem: Dashboard endpoints are auth-guarded, but profile mutation still keys off walletAddress params without an explicit ownership policy.
Scope: Clarify which profile operations are public reads versus authenticated self-service updates.
Implementation guidance: Add authenticated self-update semantics and avoid letting arbitrary callers patch any wallet-address profile.
Acceptance criteria: Profile update routes require the authenticated owner or an explicit admin policy.
Validation: Tests for own-profile update, foreign-profile rejection, public profile read, and dashboard/profile consistency.
Files to modify: `backend/src/profile/profile.controller.ts`, `backend/src/profile/profile.service.ts`, `backend/src/auth/guards/authorization.guard.ts`
Files to create: `backend/src/profile/profile-policy.guard.ts`

### BE-015 - Receipt Upload Policy Cleanup
Complexity: High (200)
Problem: Receipt routes combine double-prefixed controller paths with mixed permission expectations, including a standalone upload path that is not policy-aligned.
Scope: Normalize receipt route paths and authorization rules for split-bound and standalone uploads.
Implementation guidance: Define receipt policies, apply guards consistently, and clearly separate split-scoped versus personal upload use cases.
Acceptance criteria: Receipt routes have stable canonical paths and each mutation has an explicit permission rule.
Validation: Tests for split upload, standalone upload, signed URL access, OCR reprocess, and delete authorization.
Files to modify: `backend/src/receipts/receipts.controller.ts`, `backend/src/receipts/receipts.service.ts`, `backend/src/auth/decorators/permissions.decorator.ts`
Files to create: `backend/src/receipts/receipt-policy.service.ts`

### BE-016 - Batch Split Processor Real Split Execution
Complexity: High (200)
Problem: `split-batch.processor.ts` still simulates successful split creation instead of delegating to the actual split service.
Scope: Replace placeholder batch behavior with real split creation and partial-failure handling.
Implementation guidance: Add an adapter around the split creation service and persist per-operation outcomes with actionable error messages.
Acceptance criteria: Batch split jobs create real splits and expose accurate operation status for success and failure cases.
Validation: Tests for full success, partial failure, retry, cancellation, and idempotent reprocessing.
Files to modify: `backend/src/batch/processors/split-batch.processor.ts`, `backend/src/batch/batch.service.ts`, `backend/src/modules/splits/splits.service.ts`
Files to create: `backend/src/batch/processors/split-batch.adapter.ts`

### BE-017 - Dispute Notification and Audit Outbox
Complexity: High (200)
Problem: Dispute listeners still rely on TODO comments and `console.log` calls for notifications and audit logging.
Scope: Add a durable outbox or dispatcher path for dispute side effects.
Implementation guidance: Persist dispute events for downstream delivery to notification and audit systems instead of logging inline.
Acceptance criteria: Dispute side effects survive retries and no production listener depends on `console.log`.
Validation: Tests for event persistence, retry-safe delivery, and listener idempotency.
Files to modify: `backend/src/disputes/listeners/dispute-notification.listener.ts`, `backend/src/disputes/listeners/dispute-audit.listener.ts`, `backend/src/audit-trail/audit.service.ts`
Files to create: `backend/src/disputes/dispute-outbox.publisher.ts`

### BE-018 - Short Links Auth and URL Builder Hardening
Complexity: High (200)
Problem: Short-link routes assume `req.user.wallet` even though no guard enforces that shape and NFC URLs are assembled ad hoc from environment variables.
Scope: Secure short-link endpoints and centralize short-link URL building.
Implementation guidance: Add guards, use the unified auth user contract, and extract public short-link URL composition into a dedicated builder.
Acceptance criteria: Short-link generate/remove/analytics routes enforce auth consistently and generated URLs use one canonical builder.
Validation: Tests for authenticated access, unauthorized rejection, resolve tracking, analytics access, and NFC payload generation.
Files to modify: `backend/src/short-links/short-links.controller.ts`, `backend/src/short-links/short-links.service.ts`, `backend/src/short-links/nfc-payload.service.ts`
Files to create: `backend/src/short-links/short-link-url.builder.ts`

### BE-019 - Backend Route Regression Coverage Expansion
Complexity: High (200)
Problem: Route coverage inside the backend does not fully guard against prefix and registration regressions in the most fragile controllers.
Scope: Expand backend integration coverage to include versioning and formerly double-prefixed modules.
Implementation guidance: Add route manifest assertions and integration coverage for analytics, receipts, compliance, short-links, and reputation endpoints.
Acceptance criteria: Controller-prefix regressions are caught by backend automated tests.
Validation: Backend integration tests for canonical path registration and representative request/response flows.
Files to modify: `backend/src/test-setup.ts`
Files to create: `backend/src/contracts/route-regression.integration.spec.ts`, `backend/src/contracts/route-contract.fixture.ts`

### BE-020 - Queue Policy Standardization Across Background Jobs
Complexity: High (200)
Problem: Background processors use inconsistent retry, logging, and failure semantics across analytics, settlements, compliance, push, and batch jobs.
Scope: Define shared queue-job policy defaults for retries, backoff, dead-lettering, and structured logs.
Implementation guidance: Introduce reusable job policy helpers and retrofit processors to use them.
Acceptance criteria: All major Bull processors declare consistent retry/backoff behavior and failure metadata.
Validation: Tests for retry counts, backoff timing configuration, dead-letter routing, and failure log structure.
Files to modify: `backend/src/analytics/analytics.processor.ts`, `backend/src/payments/payment-settlement.processor.ts`, `backend/src/compliance/compliance.processor.ts`, `backend/src/push-notifications/push-notifications.processor.ts`, `backend/src/batch/processors/payment-batch.processor.ts`, `backend/src/batch/processors/scheduled-batch.processor.ts`
Files to create: `backend/src/common/queue-job-policy.ts`

## Documentation

### DOC-001 - Root Monorepo README Reality Alignment
Complexity: High (200)
Problem: The root `README.md` still describes a two-project monorepo and references scripts that do not exist in the root `package.json`.
Scope: Rewrite the root README so it accurately reflects the frontend, backend, contracts, docs, and ML service surfaces.
Implementation guidance: Document the actual workspace layout, current entrypoints, and per-package commands instead of aspirational root-level scripts.
Acceptance criteria: New contributors can understand the current repo shape and start the right services without guesswork.
Validation: Manual doc walk-through against the current directory tree and package scripts.
Files to modify: `README.md`
Files to create: `docs/repository-map.md`

### DOC-002 - Frontend README Replacement
Complexity: High (200)
Problem: `frontend/README.md` is still the generic Vite starter text and does not describe StellarSplit’s actual UI architecture or scripts.
Scope: Replace the template README with project-specific frontend onboarding.
Implementation guidance: Cover routing, theming, wallet integration, testing, and build commands that actually exist in `frontend/package.json`.
Acceptance criteria: The frontend README is project-specific and no longer reads like a stock Vite scaffold.
Validation: New-developer walkthrough using only the README instructions.
Files to modify: `frontend/README.md`
Files to create: `frontend/docs/developer-onboarding.md`

### DOC-003 - Backend README Config and Script Correction
Complexity: High (200)
Problem: `backend/README.md` references outdated env variable names, inconsistent Swagger paths, and stale script expectations.
Scope: Update backend setup docs to match the current NestJS bootstrap and package scripts.
Implementation guidance: Align env names with `config/` usage, clarify versioned API prefixing, and add an accurate test/build command section.
Acceptance criteria: The backend README can be followed end-to-end against the current codebase.
Validation: Manual setup review plus cross-check with `backend/package.json` and `backend/src/main.ts`.
Files to modify: `backend/README.md`
Files to create: `backend/.env.example`

### DOC-004 - API Versioning and Prefix Matrix
Complexity: High (200)
Problem: `docs/API.md` documents `/api/...` routes broadly, but the backend also enables `/api/v1/...` versioning and contains modules with historically doubled prefixes.
Scope: Add a route matrix that distinguishes canonical, legacy, and transitional paths.
Implementation guidance: Document the actual versioning rules and identify modules that require cleanup or compatibility notes.
Acceptance criteria: Readers can determine the correct route format for any documented endpoint family.
Validation: Spot-check docs against controller decorators and the global prefix/versioning setup in `main.ts`.
Files to modify: `docs/API.md`
Files to create: `docs/API_ROUTE_MATRIX.md`

### DOC-005 - Controller-to-Docs Synchronization Guidance
Complexity: High (200)
Problem: API documentation drift is recurring because there is no documented source-of-truth workflow tying docs to controller changes.
Scope: Add contributor guidance for keeping controllers, tests, and API docs synchronized.
Implementation guidance: Document the update workflow, review checklist, and ownership expectations for route changes.
Acceptance criteria: Contributors have a clear process for updating API docs alongside route changes.
Validation: Review checklist coverage in contributor documentation.
Files to modify: `CONTRIBUTING.md`, `docs/API.md`
Files to create: `docs/api-source-of-truth.md`

### DOC-006 - WebSocket Contract Rewrite
Complexity: High (200)
Problem: `docs/ws-gateway-contract.md` does not fully match the current websocket gateway event shapes and room semantics.
Scope: Rewrite the websocket contract around actual implemented events, auth options, and room behavior.
Implementation guidance: Include request/response examples, event payload schemas, and error cases.
Acceptance criteria: The websocket docs can be used directly without reverse-engineering the gateway source.
Validation: Compare documented events against `backend/src/gateway/events.gateway.ts`.
Files to modify: `docs/ws-gateway-contract.md`
Files to create: `docs/ws-event-examples.md`

### DOC-007 - Contracts Guide Status Matrix Correction
Complexity: High (200)
Problem: `docs/CONTRACTS.md` presents split escrow as an active integration target even though `contracts/README.md` calls several contracts broken.
Scope: Update contract docs to reflect current status, support level, and known blockers.
Implementation guidance: Add a contract status table and differentiate production-ready, experimental, and broken modules.
Acceptance criteria: Docs no longer imply broken contracts are deployable or fully integrated.
Validation: Compare the docs against `contracts/README.md` and workspace/CI script reality.
Files to modify: `docs/CONTRACTS.md`
Files to create: `docs/contracts-status.md`

### DOC-008 - Component Catalog Regeneration Workflow
Complexity: High (200)
Problem: `docs/COMPONENTS.md` is large but drifts easily and already contains stale dependency notes for several components.
Scope: Add a repeatable regeneration workflow and refresh the component catalog content.
Implementation guidance: Document how component docs are produced and optionally scaffold a generator to reduce manual drift.
Acceptance criteria: The component catalog matches current props/dependencies and contributors know how to refresh it.
Validation: Spot-check a sample of split, payment, receipt, and collaboration components against source.
Files to modify: `docs/COMPONENTS.md`
Files to create: `docs/scripts/generate-components-docs.ts`

### DOC-009 - Deployment Guide Path Fixes
Complexity: High (200)
Problem: `docs/DEPLOYMENT.md` still references health and swagger routes that do not consistently match the current versioned backend setup.
Scope: Correct deployment-time path references and health probe examples.
Implementation guidance: Audit all route references in deployment docs and note which endpoints are versioned or compatibility aliases.
Acceptance criteria: Deployment examples, health checks, and reverse-proxy snippets point at valid routes.
Validation: Search-based doc audit plus manual verification against backend bootstrap configuration.
Files to modify: `docs/DEPLOYMENT.md`
Files to create: `docs/runbooks/healthchecks.md`

### DOC-010 - Stellar Wallet Integration Drift Audit
Complexity: High (200)
Problem: `docs/STELLAR_INTEGRATION.md` needs to reflect the current `use-wallet` hook behavior, payment URI page, and network mismatch messaging.
Scope: Align wallet docs with how the frontend actually connects, refreshes, signs, and blocks payments on the wrong network.
Implementation guidance: Use the current hook and page flow as the basis for diagrams and snippets.
Acceptance criteria: Wallet integration docs match the actual frontend wallet UX and helper APIs.
Validation: Compare docs against `frontend/src/hooks/use-wallet.tsx`, `frontend/src/pages/PaymentURIPage.tsx`, and `frontend/src/components/Payment/PaymentModal.tsx`.
Files to modify: `docs/STELLAR_INTEGRATION.md`
Files to create: `docs/payment-uri-flow.md`

### DOC-011 - Contract CI Contributor Guide
Complexity: High (200)
Problem: The contracts CI script has its own supported-contract list, but contributors do not have a dedicated guide explaining what is in or out of scope.
Scope: Document contract CI expectations, supported crates, and broken-contract policy.
Implementation guidance: Explain how `scripts/ci-contracts.sh` relates to the workspace and how to handle experimental contracts.
Acceptance criteria: Contributors know which contracts must pass CI and how to graduate a contract into the supported set.
Validation: Docs review against `contracts/scripts/ci-contracts.sh` and `contracts/Cargo.toml`.
Files to modify: `contracts/README.md`, `CONTRIBUTING.md`
Files to create: `docs/contract-ci.md`

### DOC-012 - Environment Variable Reference
Complexity: High (200)
Problem: Environment variables are described piecemeal across readmes and code, with no authoritative catalog for frontend, backend, contracts, and ML service settings.
Scope: Create one environment reference with service ownership, defaults, and required/optional status.
Implementation guidance: Derive values from config modules and readmes, then centralize them in a maintained reference document.
Acceptance criteria: Developers can find every required variable and understand where it is consumed.
Validation: Cross-check against `backend/src/config`, frontend env access, and deployment docs.
Files to modify: `README.md`, `backend/README.md`, `frontend/README.md`, `docs/DEPLOYMENT.md`
Files to create: `docs/ENVIRONMENT_VARIABLES.md`

### DOC-013 - API Example Payload Audit
Complexity: High (200)
Problem: Several examples in `docs/API.md` use fields or response shapes that may not match current DTOs/entities.
Scope: Audit request/response examples across the API reference and replace stale payloads with validated examples.
Implementation guidance: Build examples directly from DTOs/controllers and note any gaps that need code cleanup.
Acceptance criteria: Example payloads are consistent with the current documented API surface.
Validation: Spot-check examples against DTO classes and controller signatures.
Files to modify: `docs/API.md`
Files to create: `docs/examples/api-payload-fixtures.json`

### DOC-014 - Receipt Flow End-to-End Documentation
Complexity: High (200)
Problem: Receipt functionality is documented in fragments across API docs and component README files, but there is no single end-to-end flow document.
Scope: Document the full receipt journey from capture/upload through OCR, review, storage, and split application.
Implementation guidance: Tie together frontend components, backend receipt endpoints, and OCR expectations in one flow document.
Acceptance criteria: Contributors can understand the complete receipt path without reading multiple scattered files.
Validation: Cross-check against `ReceiptCaptureFlow`, upload components, and receipt backend routes.
Files to modify: `docs/API.md`, `docs/COMPONENTS.md`
Files to create: `docs/RECEIPT_FLOW.md`

### DOC-015 - Mock and Fallback Data Provenance Notes
Complexity: High (200)
Problem: Documentation does not clearly call out which frontend experiences currently rely on mocks, simulation, or graceful fallback behavior.
Scope: Add a provenance note for analytics, history, groups, and OCR simulation flows.
Implementation guidance: Document which screens are live-backed, hybrid, or fixture-backed today and what production expectations should be.
Acceptance criteria: Stakeholders can distinguish demo-ready behavior from fully integrated production paths.
Validation: Compare docs against current mock usage in frontend service modules and pages.
Files to modify: `docs/COMPONENTS.md`, `docs/API.md`, `README.md`
Files to create: `docs/data-provenance.md`

### DOC-016 - Authentication and Dev Bypass Documentation
Complexity: High (200)
Problem: The backend supports JWT auth and a dev bypass via `x-user-id`, but that distinction is not documented clearly for contributors.
Scope: Document authentication modes, dev-only bypass behavior, and security expectations.
Implementation guidance: Include examples for JWT and dev bypass plus warnings about production constraints.
Acceptance criteria: Developers can authenticate local requests correctly without relying on source-code reading.
Validation: Compare docs against `JwtAuthGuard` and relevant API examples.
Files to modify: `docs/API.md`, `backend/README.md`
Files to create: `docs/AUTHENTICATION.md`

### DOC-017 - Error Response Catalog
Complexity: High (200)
Problem: API docs list endpoints but do not offer a concise catalog of response error shapes, field errors, and notable failure cases.
Scope: Add a dedicated error-reference document and link it from the main API reference.
Implementation guidance: Document global error envelope expectations, common status codes, and field-validation examples.
Acceptance criteria: Consumers can reason about backend failures without inferencing from controller code.
Validation: Align the document with global exception filters and representative validation errors.
Files to modify: `docs/API.md`
Files to create: `docs/ERRORS.md`

### DOC-018 - Contract Integration Playbook
Complexity: High (200)
Problem: Contract docs explain individual pieces, but there is no practical playbook for contract deployment, contract ID tracking, event handling, and rollback considerations.
Scope: Add an operations guide for working with the Soroban contract layer.
Implementation guidance: Cover deployment artifacts, contract IDs, event listeners, settlement coordination, and failure recovery patterns.
Acceptance criteria: Contributors have a practical playbook for operating and integrating with the contract layer.
Validation: Review against `contracts/README.md`, `docs/CONTRACTS.md`, and Stellar integration docs.
Files to modify: `docs/CONTRACTS.md`, `docs/STELLAR_INTEGRATION.md`
Files to create: `docs/CONTRACT_INTEGRATION_PLAYBOOK.md`

### DOC-019 - Unified Testing Guide
Complexity: High (200)
Problem: Test entrypoints are scattered across frontend, backend, contracts, and ML service without a single contributor-oriented testing guide.
Scope: Create a testing matrix that explains what to run for each surface and when.
Implementation guidance: Document unit, integration, contract, and smoke test commands with expected prerequisites.
Acceptance criteria: Contributors can choose the right test suite for their change area quickly.
Validation: Check all documented commands against package scripts and contract CI scripts.
Files to modify: `README.md`, `frontend/README.md`, `backend/README.md`, `contracts/README.md`
Files to create: `docs/TESTING.md`

### DOC-020 - Release Readiness Checklist
Complexity: High (200)
Problem: There is no cross-surface release checklist covering frontend, backend, contracts, docs, and environment readiness.
Scope: Add a release checklist that makes hidden deployment and documentation work visible.
Implementation guidance: Include route checks, env verification, build/test requirements, wallet flow sanity checks, and contract status review.
Acceptance criteria: Release preparation has an explicit checklist instead of tribal knowledge.
Validation: Manual review with maintainers against current deployment practices.
Files to modify: `CONTRIBUTING.md`, `docs/DEPLOYMENT.md`
Files to create: `docs/RELEASE_CHECKLIST.md`

## Smart Contracts

### SC-001 - Workspace Membership and Status Drift Cleanup
Complexity: High (200)
Problem: `contracts/Cargo.toml`, `contracts/README.md`, and `scripts/ci-contracts.sh` disagree about which contracts are supported versus broken.
Scope: Reconcile workspace membership, support status, and CI targeting rules.
Implementation guidance: Decide whether broken crates remain in the workspace, move unsupported crates to explicit experimental policy, and align docs/scripts.
Acceptance criteria: Workspace membership and CI support lists tell the same story.
Validation: Cargo workspace inspection plus CI script dry run on the declared supported set.
Files to modify: `contracts/Cargo.toml`, `contracts/README.md`, `contracts/scripts/ci-contracts.sh`
Files to create: `contracts/docs/workspace-policy.md`

### SC-002 - Split Escrow Compile Recovery
Complexity: High (200)
Problem: `contracts/split-escrow/src/lib.rs` contains compile blockers including duplicate parameters, invalid local variable usage, and conflicting state updates.
Scope: Restore the contract to a compiling baseline before deeper feature work continues.
Implementation guidance: Fix function signatures, resolve undefined variables, and align storage/event calls with the intended contract API.
Acceptance criteria: `split-escrow` compiles cleanly under the pinned Soroban toolchain.
Validation: Contract build and unit-test execution for the split-escrow crate.
Files to modify: `contracts/split-escrow/src/lib.rs`, `contracts/split-escrow/src/types.rs`, `contracts/split-escrow/src/storage.rs`, `contracts/split-escrow/src/errors.rs`
Files to create: `contracts/split-escrow/RECOVERY.md`

### SC-003 - Split Escrow Create API Simplification
Complexity: High (200)
Problem: `create_escrow` currently exposes conflicting inputs such as duplicate metadata parameters and a `whitelist_enabled` flag that is later ignored.
Scope: Redesign the create API so it is coherent, minimal, and enforceable on-chain.
Implementation guidance: Collapse overlapping inputs, define optional metadata/note semantics clearly, and ensure whitelist configuration is honored or removed.
Acceptance criteria: `create_escrow` has one unambiguous parameter contract and the implementation matches it.
Validation: Unit tests for create flow with and without optional note/metadata/whitelist settings.
Files to modify: `contracts/split-escrow/src/lib.rs`, `contracts/split-escrow/src/types.rs`, `contracts/split-escrow/src/events.rs`
Files to create: `contracts/split-escrow/src/interface.rs`

### SC-004 - Split Escrow Deposit Accounting Bug Fix
Complexity: High (200)
Problem: Deposit logic duplicates balance reads and references an undefined `current_balance`, making participant accounting incorrect and uncompilable.
Scope: Repair deposit accounting and make the balance update path auditable.
Implementation guidance: Remove duplicate balance mutation branches, define one source of truth for participant balances, and tighten tests around repeated deposits.
Acceptance criteria: Repeated deposits update balances deterministically and transition to `Ready` only when obligations are met.
Validation: Tests for first deposit, repeat deposit, overpayment, participant cap, and ready-state transition.
Files to modify: `contracts/split-escrow/src/lib.rs`, `contracts/split-escrow/src/test.rs`
Files to create: `contracts/split-escrow/src/test_helpers.rs`

### SC-005 - Split Escrow State Machine Hardening
Complexity: High (200)
Problem: Cancellation and release behavior currently mix refund logic, participant mutation, and status transitions in a way that can weaken auditability.
Scope: Introduce a clearer escrow state machine for pending, ready, released, cancelled, and refunded paths.
Implementation guidance: Centralize transition rules and event emission around explicit state changes instead of incidental storage edits.
Acceptance criteria: Invalid transitions are rejected consistently and lifecycle events map cleanly to state changes.
Validation: Tests for allowed/forbidden transitions, creator-only mutations, and refund integrity.
Files to modify: `contracts/split-escrow/src/lib.rs`, `contracts/split-escrow/src/types.rs`, `contracts/split-escrow/src/events.rs`
Files to create: `contracts/split-escrow/src/state_machine.rs`

### SC-006 - Dispute Resolution Action Adapter
Complexity: High (200)
Problem: `dispute-resolution` hardcodes settlement action choices directly in the main flow, which makes outcome handling harder to reason about and test.
Scope: Isolate resolution outcomes behind an internal action adapter so voting results map cleanly to named settlement intents.
Implementation guidance: Move outcome-to-action mapping behind an adapter layer with explicit intent names and error mapping.
Acceptance criteria: Dispute resolution no longer scatters settlement action decisions through the core resolve flow.
Validation: Unit tests for upheld, dismissed, and tied outcome mapping plus adapter error handling.
Files to modify: `contracts/dispute-resolution/src/lib.rs`, `contracts/dispute-resolution/src/types.rs`
Files to create: `contracts/dispute-resolution/src/action_adapter.rs`

### SC-007 - Dispute Resolution Event Coverage
Complexity: High (200)
Problem: The dispute contract stores state transitions but does not emit a robust event stream for raise, vote, and resolve actions.
Scope: Add event coverage for traceability and auditability.
Implementation guidance: Introduce an events module and emit typed events at each major lifecycle transition.
Acceptance criteria: Raise, vote, and resolve operations all emit machine-consumable events.
Validation: Unit tests asserting emitted event topics and payload contents.
Files to modify: `contracts/dispute-resolution/src/lib.rs`, `contracts/dispute-resolution/src/types.rs`
Files to create: `contracts/dispute-resolution/src/events.rs`

### SC-008 - Multi-Sig Ownership and Mutation Fix
Complexity: High (200)
Problem: `multi-sig-splits` is called out as broken and its storage/mutation code uses patterns that can trigger ownership and move errors.
Scope: Repair signer mutation logic so the contract compiles and signer management is safe.
Implementation guidance: Refactor signer list updates into helper routines that avoid moving values out of Soroban collections incorrectly.
Acceptance criteria: The contract compiles cleanly and add/remove signer flows preserve signer ordering and state integrity.
Validation: Tests for add signer, remove signer, duplicate signer rejection, and execution readiness after signature updates.
Files to modify: `contracts/multi-sig-splits/src/lib.rs`, `contracts/multi-sig-splits/src/storage.rs`, `contracts/multi-sig-splits/src/test.rs`
Files to create: `contracts/multi-sig-splits/src/helpers.rs`

### SC-009 - Multi-Sig Execution Intent Modeling
Complexity: High (200)
Problem: The multi-sig contract models approvals and time locks but does not clearly represent the action that execution is authorizing.
Scope: Add explicit execution-intent metadata so each multi-sig split carries a well-defined internal action description.
Implementation guidance: Define execution-intent payloads, persist them with the split, and emit events around execution decisions.
Acceptance criteria: Executing a multi-sig split produces a clear internal action record and event trail.
Validation: Tests for intent creation, approval threshold handling, timelock expiry, and execution-event contents.
Files to modify: `contracts/multi-sig-splits/src/lib.rs`, `contracts/multi-sig-splits/src/types.rs`, `contracts/multi-sig-splits/src/events.rs`
Files to create: `contracts/multi-sig-splits/src/execution_intent.rs`

### SC-010 - Achievement Badge Eligibility Provider
Complexity: High (200)
Problem: `achievement-badges` still uses mock eligibility checks that effectively only gate on whether a badge has been minted already.
Scope: Replace placeholder eligibility with a provider-based approach tied to real platform achievements.
Implementation guidance: Extract eligibility evaluation into its own module and make it queryable or parameterized from explicit contract inputs.
Acceptance criteria: Badge minting can be backed by real achievement evidence rather than mock assumptions.
Validation: Tests for eligible, ineligible, already-minted, and provider-failure cases.
Files to modify: `contracts/achievement-badges/src/lib.rs`, `contracts/achievement-badges/src/storage.rs`, `contracts/achievement-badges/README.md`
Files to create: `contracts/achievement-badges/src/eligibility.rs`

### SC-011 - Achievement Badge Metadata Standardization
Complexity: High (200)
Problem: Badge storage exists, but the contract surface does not clearly define NFT-style ownership and metadata retrieval conventions.
Scope: Clarify and standardize metadata and ownership query behavior.
Implementation guidance: Introduce structured metadata helpers and document the intended token semantics within the contract API.
Acceptance criteria: Callers can retrieve consistent badge metadata and ownership information through a stable contract API.
Validation: Tests for metadata lookup, user badge enumeration, and deterministic token metadata output.
Files to modify: `contracts/achievement-badges/src/lib.rs`, `contracts/achievement-badges/src/types.rs`, `contracts/achievement-badges/README.md`
Files to create: `contracts/achievement-badges/src/metadata.rs`

### SC-012 - Split Template Deterministic ID Hashing
Complexity: High (200)
Problem: `split-template` currently returns `name.clone()` from `generate_template_id`, which makes template IDs non-unique and easy to collide.
Scope: Replace the placeholder ID strategy with a real deterministic hash.
Implementation guidance: Use creator, name, and ledger/context input to derive a stable hashed ID and update tests/documentation accordingly.
Acceptance criteria: Template IDs are deterministic and unique enough for production use.
Validation: Tests for same-name different-creator, same-creator different-time, and duplicate-name collision handling.
Files to modify: `contracts/split-template/src/lib.rs`, `contracts/split-template/src/utils.rs`, `contracts/split-template/src/test.rs`
Files to create: `contracts/split-template/src/id.rs`

### SC-013 - Split Template Duplicate Name Collision Protection
Complexity: High (200)
Problem: Creator indexing in the template contract does not protect against duplicate-name or duplicate-ID collisions gracefully.
Scope: Add explicit duplicate-handling policy for template creation and retrieval.
Implementation guidance: Track creator/name pairs or collision-resistant IDs and expose domain errors for duplicate submissions when appropriate.
Acceptance criteria: Duplicate template submissions are either rejected cleanly or stored under distinct IDs without ambiguity.
Validation: Tests for duplicate-name create attempts and creator index integrity.
Files to modify: `contracts/split-template/src/lib.rs`, `contracts/split-template/src/storage.rs`, `contracts/split-template/src/types.rs`
Files to create: `contracts/split-template/src/name_index.rs`

### SC-014 - Flash Loan Unique Loan IDs
Complexity: High (200)
Problem: `flash-loan` generates every loan ID as `"loan_"`, which makes concurrent or repeated flash loans indistinguishable.
Scope: Introduce collision-resistant loan identifiers.
Implementation guidance: Derive IDs from caller plus ledger sequence/timestamp or a monotonic counter stored in contract state.
Acceptance criteria: Each flash loan is assigned a unique retrievable ID.
Validation: Tests for back-to-back flash loans and loan lookup/replay behavior.
Files to modify: `contracts/flash-loan/src/lib.rs`, `contracts/flash-loan/src/storage.rs`, `contracts/flash-loan/src/test.rs`
Files to create: `contracts/flash-loan/src/id.rs`

### SC-015 - Flash Loan Reentrancy Guard Recovery
Complexity: High (200)
Problem: The flash loan reentrancy guard is set before callback execution but cleanup is not guaranteed if an intermediate step errors.
Scope: Make reentrancy protection safe under failure paths.
Implementation guidance: Encapsulate guard activation/deactivation and ensure failures cannot leave the contract permanently locked.
Acceptance criteria: Reentrancy guard resets correctly after both success and failure scenarios.
Validation: Tests for callback failure, insufficient repayment, and successful retry after a failed loan.
Files to modify: `contracts/flash-loan/src/lib.rs`, `contracts/flash-loan/src/errors.rs`, `contracts/flash-loan/src/test.rs`
Files to create: `contracts/flash-loan/src/guard.rs`

### SC-016 - Flash Loan Callback Target Validation
Complexity: High (200)
Problem: `flash-loan` invokes the borrower address as if it were a contract implementing `on_loan`, which is not necessarily safe or true.
Scope: Validate callback targets and distinguish wallet borrowers from callback contracts clearly.
Implementation guidance: Add explicit callback target input or contract-type assumptions and reject unsupported borrower/callback combinations.
Acceptance criteria: Flash loan execution no longer assumes any borrower address is a callable contract.
Validation: Tests for valid callback contract, invalid borrower-as-contract case, and callback authorization behavior.
Files to modify: `contracts/flash-loan/src/lib.rs`, `contracts/flash-loan/src/types.rs`, `contracts/flash-loan/src/test.rs`
Files to create: `contracts/flash-loan/src/callback.rs`

### SC-017 - Staking Admin Authorization and Error Semantics
Complexity: High (200)
Problem: `staking` initialization and admin-only reward deposit flows use inconsistent authorization/error semantics, including unauthorized cases returning `NotInitialized`.
Scope: Tighten admin auth requirements and make error codes reflect real failure causes.
Implementation guidance: Require admin auth consistently and introduce or reuse precise unauthorized/admin-only error cases.
Acceptance criteria: Unauthorized callers receive accurate errors and admin setup is explicitly authenticated.
Validation: Tests for initialize auth, reward deposit auth, and incorrect-admin rejection.
Files to modify: `contracts/staking/src/lib.rs`, `contracts/staking/src/errors.rs`, `contracts/staking/src/test.rs`
Files to create: None

### SC-018 - Staking Event Coverage Expansion
Complexity: High (200)
Problem: Some important staking lifecycle actions lack corresponding event assertions or explicit event coverage.
Scope: Ensure staking emits useful events for stake, unstake, withdraw, delegate, reward deposit, and reward claim flows.
Implementation guidance: Extend event definitions and add event-focused tests, especially around withdrawal completion and delegation changes.
Acceptance criteria: Staking lifecycle actions are fully reconstructable from emitted events in the test suite.
Validation: Tests that assert event emission and payloads for each major public action.
Files to modify: `contracts/staking/src/lib.rs`, `contracts/staking/src/events.rs`, `contracts/staking/src/test.rs`
Files to create: `contracts/staking/src/event_assertions.rs`

### SC-019 - Path Payment Error Semantics Cleanup
Complexity: High (200)
Problem: `path-payment` returns `Error::NotInitialized` even when already initialized, which obscures actual failure causes and complicates integration logic.
Scope: Normalize error semantics and improve initialization/path-execution clarity.
Implementation guidance: Add specific error variants for already-initialized and other invalid-state cases, then update call sites/tests.
Acceptance criteria: Initialization and path-payment failures return precise, meaningful errors.
Validation: Tests for double initialization, missing router, invalid path, missing rate, and slippage violations.
Files to modify: `contracts/path-payment/src/lib.rs`, `contracts/path-payment/src/errors.rs`, `contracts/path-payment/src/test.rs`
Files to create: `contracts/path-payment/src/error_map.rs`

### SC-020 - Reminder Contract Integration or Retirement
Complexity: High (200)
Problem: `contracts/reminder/` is an orphaned contract area with incomplete structure and missing supporting files, but it still lives inside the contracts tree.
Scope: Decide whether to promote reminder into a real workspace crate or formally retire/archive it.
Implementation guidance: If keeping it, add a proper Cargo package and missing storage support; if retiring it, document and relocate it out of the active contracts surface.
Acceptance criteria: The reminder module is either buildable and documented or clearly marked as archived/non-production code.
Validation: Workspace/build verification for the chosen path and docs alignment in the contracts guide.
Files to modify: `contracts/README.md`, `contracts/Cargo.toml`, `contracts/reminder/lib.rs`, `contracts/reminder/mod.rs`, `contracts/reminder/events.rs`, `contracts/reminder/types.rs`
Files to create: `contracts/reminder/Cargo.toml`, `contracts/reminder/storage.rs`
