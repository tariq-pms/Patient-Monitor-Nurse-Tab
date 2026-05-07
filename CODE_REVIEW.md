# Code Review — PMS_MVP (NeoLife Sentinel)

**Reviewer:** Claude Code (claude-sonnet-4-6)
**Date:** 2026-05-06
**Branch:** stable-fix
**Scope:** Security, Performance, Maintainability

> **Context:** React 18 SPA, TypeScript, Vite, Auth0, FHIR backend, real-time WebSocket vitals.
> Handles neonatal PHI (Protected Health Information). HIPAA compliance is in scope.

---

## Summary

| Category | Critical | High | Medium | Low |
|---|---|---|---|---|
| Security | 5 | 3 | 1 | 2 |
| Performance | — | 2 | 3 | — |
| Maintainability | — | — | 5 | 6 |

### Top 3 Immediate Actions

1. **Remove all hardcoded FHIR credentials from the frontend** and route all FHIR calls through the server-side proxy that already exists in `.env`. This eliminates direct PHI exposure.
2. **Add `withAuthenticationRequired` to every protected route** — one wrapper component closes the entire class of unauthenticated route access.
3. **Strip `console.log` from production builds** via Vite's `esbuild.drop` — zero code changes needed, eliminates PHI from browser consoles immediately.

---

## CRITICAL — Fix Before Production

---

### C-1. FHIR Credentials Hardcoded in 40+ Frontend Files

**Severity:** Critical (HIPAA / Data Breach Risk)
**Files:** `src/contexts/PermissionContext.tsx:66`, `src/contexts/DeviceContext.tsx:71`,
`src/pages/AllPatient.tsx`, `src/pages/PatientMonitor.tsx`, `src/pages/PatientDetails.tsx`,
`src/pages/PatientProfile.tsx`, `src/pages/NurseMonitor.tsx`, `src/pages/Organization.tsx`,
`src/pages/Rooms.tsx`, `src/components/BallardScore.tsx`, `src/utils/fhirVitals.ts` — and more

Every FHIR call encodes the same credential directly in the compiled JavaScript bundle:

```ts
// Repeated in 40+ locations across the codebase
Authorization: "Basic " + btoa("fhiruser:change-password"),
```

Any visitor can open DevTools → Network tab, read these credentials, and query the FHIR server directly to access all patient records without any authentication. The comment in `.env` acknowledges the correct architecture (a server-side proxy that injects credentials and is never exposed to the browser), but that proxy is not configured in `vite.config.ts` and the credentials are still embedded everywhere.

**Fix:**

Step 1 — Add a proxy in `vite.config.ts` that forwards `/fhir/*` to the real server, injecting credentials server-side:

```ts
// vite.config.ts
server: {
  proxy: {
    '/fhir': {
      target: process.env.FHIR_URL,
      changeOrigin: true,
      headers: {
        Authorization: 'Basic ' + Buffer.from(
          `${process.env.FHIR_USERNAME}:${process.env.FHIR_PASSWORD}`
        ).toString('base64'),
      },
    },
  },
},
```

Step 2 — Remove every `btoa("fhiruser:change-password")` call from the frontend. `VITE_FHIRAPI_URL` is already `/fhir` (relative), so the proxy will handle routing. The `FHIR_USERNAME`/`FHIR_PASSWORD` variables in `.env` already lack the `VITE_` prefix specifically to prevent Vite from baking them into the bundle — the proxy just needs to be wired up.

---

### C-2. No Route-Level Authentication Guard

**Severity:** Critical
**File:** `src/App.tsx`

All routes are accessible to unauthenticated users. The only "protection" is that each page component conditionally renders its content or shows a login button — but the route itself is reachable:

```tsx
// NurseMonitor.tsx:363 — typical pattern across all pages
{isAuthenticated && (  // renders null, but URL is still accessible
```

Direct URL navigation to `/patient-profile/123` or `/admin` bypasses login entirely at the routing layer.

**Fix:** Use Auth0's `withAuthenticationRequired` HOC:

```tsx
// Create once — reuse for all protected routes
const ProtectedRoute = ({ component }: { component: ComponentType }) => {
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => <CircularProgress />,
  });
  return <Component />;
};

// App.tsx — apply to every non-public route
<Route path="/patient-monitor" element={<ProtectedRoute component={PatientMonitor} />} />
<Route path="/patient-profile/:id" element={<ProtectedRoute component={PatientProfile} />} />
<Route path="/admin"              element={<ProtectedRoute component={AdminPage} />} />
// ... and so on for all routes except "/"
```

---

### C-3. Permission Lookup Uses Mutable Display Name, Not Unique Identifier

**Severity:** Critical
**File:** `src/contexts/PermissionContext.tsx:133`

The permission system resolves a practitioner's FHIR record — and their permissions — by display name:

```ts
const userName = user.name || user.nickname || user.email || '';
// Then queries: /Practitioner?name=${encodedUserName}
// Picks the most-recently-updated match if multiple exist
```

Display names are not unique. Two practitioners with the same name will receive each other's permissions. This is a privilege escalation vector — a user with a common name could gain administrative access.

**Fix:** Store the Auth0 `sub` (globally unique, immutable user ID) in the FHIR Practitioner resource as an identifier, and query on that:

```ts
// PermissionContext.tsx
const response = await fetch(
  `${FHIR_BASE}/Practitioner?identifier=${encodeURIComponent(user.sub)}`,
  { headers: authHeader }
);
```

---

### C-4. 731 `console.log` Statements, Many Logging PHI

**Severity:** Critical (HIPAA)
**Files:** All 60 source files (731 total occurrences)

There are 731 `console.log/warn/error` calls throughout the codebase. Many log patient records, FHIR responses, user roles, organization identifiers, and permissions verbatim:

```ts
// App.tsx:60–66
console.log('fetched res in app', res);          // ID token claims
console.log('fetched UserRole', res?.role);
console.log('fetched UserOrganization', res?.organization);

// PermissionContext.tsx:73, 87
console.log("🔍 FHIR Response:", data);          // Full FHIR bundle with patient data
console.log("🔐 Parsed permissions:", userPermissions);
```

Any person at a shared workstation who opens browser DevTools can read all patient data logged during that session. This is a HIPAA violation in any production environment.

**Fix — fastest path (zero code changes):** Add to `vite.config.ts`:

```ts
build: {
  minify: 'esbuild',
},
esbuild: {
  drop: ['console', 'debugger'],  // strips all console.* in production builds
},
```

Long-term: replace diagnostic logs with a structured logger that has severity levels and is disabled below `ERROR` in production.

---

### C-5. Auth0 `audience` Not Configured — Wrong Token Used for API Authorization

**Severity:** Critical
**File:** `src/main.tsx:25`, `src/App.tsx:58`, `src/components/Header.tsx:78`

The Auth0 provider has no `audience` parameter:

```tsx
// main.tsx — current
<Auth0Provider
  domain={import.meta.env.VITE_AUTH0_DOMAIN}
  clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
  authorizationParams={{ redirect_uri: window.location.origin }}
>
```

Without an audience, `getAccessTokenSilently()` returns an opaque token. The app compensates by reading `getIdTokenClaims()` for role and organization. ID tokens identify the user to the *client app* — they are not for authorizing API requests. The FHIR backend cannot reliably validate an ID token.

**Fix:**

```tsx
// main.tsx
authorizationParams={{
  redirect_uri: window.location.origin,
  audience: import.meta.env.VITE_AUTH0_AUDIENCE,  // e.g. "https://pmsind.co.in/fhir"
}}
```

Then replace `getIdTokenClaims()` in `App.tsx` and `Header.tsx` with `getAccessTokenSilently()`, and pass the resulting Bearer token to API calls (via the proxy) rather than the hardcoded Basic credential.

---

## HIGH — Fix in Next Sprint

---

### H-1. WebSocket Messages Parsed Without Validation or Error Handling

**Severity:** High
**File:** `src/contexts/DeviceContext.tsx:97–108`

```ts
socket.onmessage = (event) => {
    const message = JSON.parse(event.data);  // no try/catch
    // message.type, message.device, message.topic used without validation
```

A malformed or malicious WebSocket message will throw an uncaught exception and crash the entire device data context. Additionally, there is no reconnect logic — `socket.onerror` only logs, so on any network interruption the app silently stops receiving vital signs, with no indication to clinical staff.

**Fix:**

```ts
socket.onmessage = (event) => {
  try {
    const message = JSON.parse(event.data);
    if (!message?.type) return;
    // ... rest of handling
  } catch {
    // log only — do not propagate
  }
};

// Add reconnection with exponential backoff
socket.onclose = () => {
  setTimeout(() => initSocket(), Math.min(retryDelay * 2, 30000));
};
```

---

### H-2. DeviceContext WebSocket Reconnects on Every Device State Change

**Severity:** High
**File:** `src/contexts/DeviceContext.tsx:83`

The WebSocket `useEffect` depends on the `devices` array:

```ts
useEffect(() => {
  const socket = new WebSocket(STREAM_URL);
  // ...
  return () => { socket.close(); };
}, [devices]);  // recreates the socket every time devices changes
```

Adding or removing a device via the WebSocket triggers a state update → effect reruns → socket closes and reopens → all device subscriptions are resent. With many connected devices this creates a connection storm.

**Fix:** Use a `useRef` to hold the socket, open it once on mount, and send subscription updates in a separate effect that doesn't recreate the connection:

```ts
const socketRef = useRef<WebSocket | null>(null);

useEffect(() => {
  socketRef.current = new WebSocket(STREAM_URL);
  // ... attach handlers
  return () => socketRef.current?.close();
}, []);  // open once

useEffect(() => {
  if (socketRef.current?.readyState === WebSocket.OPEN) {
    devices.forEach(device => socketRef.current!.send(...));
  }
}, [devices]);  // subscribe when devices change, without recreating socket
```

---

### H-3. No React Error Boundaries

**Severity:** High
**Files:** All page and component files

There are no `ErrorBoundary` components anywhere in the application. An unhandled JavaScript error in any chart, vital signs display, or data component will crash the entire page. In a clinical monitoring context, this means a nurse or doctor loses visibility of all patients simultaneously.

**Fix:** Wrap independent sections in error boundaries. MUI does not provide one, but a simple class component suffices:

```tsx
class PanelErrorBoundary extends React.Component<{children: ReactNode}, {hasError: boolean}> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <Alert severity="error">Panel failed to load. Reload page.</Alert>;
    return this.props.children;
  }
}

// Wrap critical independent panels
<PanelErrorBoundary><Graphs patientId={id} /></PanelErrorBoundary>
<PanelErrorBoundary><VentiChart /></PanelErrorBoundary>
```

---

## MEDIUM — Address Before v1.0

---

### M-1. `PatientProfile.tsx` is 3,749 Lines

**File:** `src/pages/PatientProfile.tsx`

A single component handles patient demographics, admission details, growth charts, nurse assessments, prescriptions, and more. At 3,749 lines it is unreviable, untestable, and a source of recurring merge conflicts. The tab structure already maps to a natural decomposition.

**Fix:** Split along tab boundaries:

```
PatientProfile.tsx (router, tab state only)
├── tabs/PatientDemographicsTab.tsx
├── tabs/AdmissionDetailsTab.tsx
├── tabs/GrowthChartTab.tsx
├── tabs/NurseAssessmentTab.tsx
├── tabs/PrescriptionTab.tsx
└── tabs/DiagnosticsTab.tsx
```

---

### M-2. Duplicate Component Files

The following files are live forks with no documented differences. Bug fixes in one are never applied to the other:

| Canonical (keep) | Duplicates (delete) |
|---|---|
| `src/components/Header.tsx` | `src/components/Header copy.tsx` |
| `src/components/Sidebar.tsx` | `src/components/Sidebar1.tsx`, `src/components/SidebarOg.tsx` |
| `src/components/Treatment.tsx` | `src/components/Treatment1.tsx` |
| `src/components/Trends.tsx` | `src/components/Trends1.tsx` |
| `src/components/DeviceManagement.tsx` | `src/components/DeviceManagement1.tsx` |
| `src/components/RoomCard.tsx` | `src/components/RoomCard1.tsx` |

Identify the version with the most complete behaviour, remove the others, and use props or composition for any needed variations.

---

### M-3. Extensive Commented-Out Code in Production Files

`vite.config.ts` has 17 lines of commented-out old config before the active config block. `main.tsx` contains a full commented-out `Auth0Provider` block including old credentials from a previous deployment. `App.tsx` has commented-out routes with inline comments referencing old feature flags.

**Fix:** Delete all dead code. Git history preserves it if recovery is needed.

---

### M-4. `any` Types Throughout

`DeviceContext.tsx` types `devices` as `any[]` and all device data values as `any`. Numerous component props across the codebase are typed `any`. For a healthcare system, type safety is a correctness guarantee — an untyped device payload can cause silent data corruption or incorrect vital sign display with no compile-time warning.

**Fix:** Define proper interfaces for FHIR resource types. The `@types/fhir` package on DefinitelyTyped covers FHIR R4 resources and is a practical starting point:

```ts
import type { Patient, Practitioner, Observation, Bundle } from 'fhir/r4';
```

---

### M-5. Both MUI v4 and MUI v5 Installed Simultaneously

`package.json` includes `@material-ui/core: ^4.12.4` alongside `@mui/material: ^5.16.11`. These are incompatible at the theming and styling-engine level, roughly double the CSS-in-JS runtime cost, and significantly inflate the JavaScript bundle size.

**Fix:** Audit which components use `@material-ui/core`, migrate them to the MUI v5 equivalents (the API is mostly compatible), and remove `@material-ui/core` from `package.json`.

---

### M-6. Server-Side Packages in Frontend `dependencies`

The following packages are listed in `dependencies` but are Node.js/server-only packages that have no place in a browser bundle:

`express`, `cors`, `multer`, `nodemailer`, `jsonwebtoken`, `googleapis`,
`@google-cloud/vision`, `canvas`, `sharp`, `isomorphic-fetch`

Vite will attempt to bundle or polyfill these, inflating bundle size and potentially including sensitive server logic.

**Fix:** Move any server-side logic to a separate `server/` package or remove packages used only in `Generate_NICU.mjs`. Only packages that run in the browser belong in the frontend `dependencies`.

---

### M-7. Large JSON Files Loaded as Static Assets

`public/neofax_structured_guidelines.json` (1.97 MB) and `public/final_neofax_output.json` (2.1 MB) are served as static files. If any component loads these on mount, the initial page load blocks on ~4 MB of JSON before the app becomes interactive.

**Fix:** Load lazily — fetch only when the component that needs them mounts, and only once:

```ts
const [guidelines, setGuidelines] = useState(null);
useEffect(() => {
  fetch('/neofax_structured_guidelines.json')
    .then(r => r.json())
    .then(setGuidelines);
}, []);
```

Long-term: serve from the FHIR backend with proper `Cache-Control` headers so repeat visits avoid re-downloading.

---

## LOW — Polish and Best Practices

| # | Issue | Location | Recommended Fix |
|---|---|---|---|
| L-1 | No `React.StrictMode` | `src/main.tsx` | Wrap root render in `<React.StrictMode>` to surface double-invoke bugs in development |
| L-2 | `window.matchMedia` called during render | `src/App.tsx:42` | Move into `useState` initializer: `useState(() => window.matchMedia('...').matches)` to avoid SSR/hydration issues |
| L-3 | `UserInfo` page has no auth guard | `src/App.tsx:109` | Apply `withAuthenticationRequired` like all other protected routes |
| L-4 | No Content Security Policy | Nginx / Dockerfile | Add CSP response headers in Nginx config; restrict `script-src`, `connect-src` to known origins |
| L-5 | `basicSsl()` in Vite config | `vite.config.ts` | Remove from production build — use real TLS via a reverse proxy (Nginx/Caddy); `basicSsl` is for local dev only |
| L-6 | No tests | entire `src/` | Start with unit tests for `hasPermission` logic and integration tests for FHIR fetch paths |
| L-7 | Clinical alerts lost on page refresh | `src/contexts/NotificationContext.tsx` | Persist critical alarms to `sessionStorage` so a browser refresh does not silently clear them |
| L-8 | `roomChange` prop typed `any` | `src/App.tsx:81` | Change to `function roomChange(roomId: string)` |
| L-9 | `vite dev --host` exposes dev server | `package.json` | Remove `--host` from the `dev` script; only bind to `0.0.0.0` when explicitly needed for device testing |
| L-10 | `Dockerfile` uses `node:latest` | `Dockerfile:2` | Pin to `node:20-alpine` for reproducible, minimal-attack-surface builds; add `USER node` to avoid running build as root |
| L-11 | `.env` file may be tracked in git | `.env` | Run `git rm --cached .env` and rotate FHIR credentials; purge history with `git filter-repo` |

---

## Appendix — Files Reviewed

| File | Primary Concern |
|---|---|
| `.env` | Hardcoded credentials, committed secrets |
| `src/main.tsx` | Auth0 audience, StrictMode, dead code |
| `src/App.tsx` | Route guards, token usage, console logs |
| `src/contexts/PermissionContext.tsx` | Permission lookup identity, hardcoded Basic auth |
| `src/contexts/DeviceContext.tsx` | WebSocket safety, reconnect logic, `any` types |
| `src/contexts/NotificationContext.tsx` | Alert persistence |
| `src/components/ProtectedModule.tsx` | Correct pattern — enforce consistently |
| `src/pages/PatientProfile.tsx` | 3,749 lines — split required |
| `src/pages/Home.tsx` | Missing `isLoading` guard on redirect |
| `src/pages/AdminPage.tsx` | Role check done UI-side only |
| `vite.config.ts` | No proxy, basicSsl in prod, dead config blocks |
| `package.json` | Mixed server/browser deps, dual MUI versions |
| `Dockerfile` | `node:latest`, runs as root |
| `docker-compose.yml` | `.env` mounted into production container |
