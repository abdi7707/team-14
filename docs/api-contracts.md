# SENED AI — API contracts

The schemas live in [`lib/api-zod`](../lib/api-zod/src) (`@workspace/api-zod`). The server validates
every request with them, and the mobile app should import its types from there instead of keeping a
second copy. JSON is camelCase. All routes are under `/api`.

## Conventions

- **Auth:** protected routes need `Authorization: Bearer <token>`. Tokens come from register or login
  and last 30 days.
- **Errors:** every non-2xx JSON response is `ApiErrorBody`:

  ```json
  { "code": "EMAIL_TAKEN", "message": "An account with this email already exists." }
  ```

  `message` is safe to show to the user. Clients should branch on the HTTP status or `code`, never on
  the message text. Codes: `VALIDATION_ERROR`, `INVALID_REQUEST`, `UNAUTHORIZED`,
  `INVALID_CREDENTIALS`, `EMAIL_TAKEN`, `NOT_FOUND`, `DOCUMENT_NOT_READY`, `GENERATION_FAILED`,
  `RATE_LIMITED`, `INTERNAL_ERROR`.
- **Wording:** responses never say "approved", "eligible" or "guaranteed". Every generated document
  ends with the trilingual draft disclaimer.

## Endpoints

| Method and path               | Auth   | Request body           | Success response                |
| ----------------------------- | ------ | ---------------------- | ------------------------------- |
| `GET /healthz`                | none   | —                      | 200 `{ "status": "ok" }`        |
| `POST /auth/register`         | none   | `RegisterBody`         | 201 `AuthResponse`              |
| `POST /auth/login`            | none   | `LoginBody`            | 200 `AuthResponse`              |
| `GET /auth/me`                | bearer | —                      | 200 `MeResponse`                |
| `POST /documents/generate`    | bearer | `GenerateDocumentBody` | 201 `GeneratedDocument`         |
| `GET /documents/mine`         | bearer | —                      | 200 `DocumentSummary[]`         |
| `GET /documents/:id`          | bearer | —                      | 200 `GeneratedDocument`         |
| `GET /documents/:id/pdf`      | bearer | —                      | 200 `application/pdf` (binary)  |

### Errors by endpoint

- **Register:** 400 `VALIDATION_ERROR` (same messages as the app's form checks), 409 `EMAIL_TAKEN`.
- **Login:** 400 `VALIDATION_ERROR`, 401 `INVALID_CREDENTIALS` ("Email or password is incorrect.").
- **Any bearer route:** 401 `UNAUTHORIZED` when the token is missing, expired or invalid.
- **Generate:** 400 `VALIDATION_ERROR`, 502 `GENERATION_FAILED` when the AI fails twice or times out.
  The document is saved as `FAILED`; the client can simply try again.
- **Document by id and PDF:** 404 `NOT_FOUND` when the document does not exist or belongs to someone
  else, 409 `DOCUMENT_NOT_READY` when it is still `GENERATING` or `FAILED`.
- **Rate limits:** 429 `RATE_LIMITED`. Register and login share 30 requests per 15 minutes per IP
  address; generation allows 6 requests per minute per user.

## Shapes

```ts
type Language = "EN" | "AM" | "OM";

type RegisterBody = { email: string; password: string; fullName: string };
type LoginBody = { email: string; password: string };

type User = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: "user" | "admin";
  preferredLanguage: Language;
};
type AuthResponse = { token: string; user: User };
type MeResponse = { user: User };

type GenerateDocumentBody = {
  docType: "LOAN_REQUEST_LETTER";
  language: Language;
  businessId: string; // the app's local business id, 1–100 characters
  passport: BusinessPassport; // see lib/api-zod/src/passport.ts
};

type DocumentContent = { title: string; sections: { heading: string; body: string }[] };
type GeneratedDocument = {
  id: string;
  docType: "LOAN_REQUEST_LETTER";
  language: Language;
  status: "GENERATING" | "READY" | "FAILED";
  content: DocumentContent;
};
type DocumentSummary = {
  id: string;
  docType: "LOAN_REQUEST_LETTER";
  language: Language;
  status: "GENERATING" | "READY" | "FAILED";
  businessId: string;
  createdAt: string; // ISO 8601
};
```

Validation rules for register and login match `artifacts/sened-mobile/src/lib/validation.ts`: the
email is trimmed and lowercased, passwords are 8–72 characters, and full names are 2–80 characters.
Passport text fields are optional strings of up to 1,000 characters; amounts are `StructuredAmount`
or `null`.
