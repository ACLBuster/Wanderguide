# WanderGuide

A mobile-first photo-to-story travel app built with Next.js App Router, TypeScript, Tailwind CSS, and a server-side AI provider abstraction. Designed for Vercel.

## Run locally

Use Node.js 20.9 or later (Node.js 22 LTS recommended).

```sh
npm ci
cp .env.example .env.local
# Add AI_API_KEY to .env.local
npm run dev
```

On Windows PowerShell use `Copy-Item .env.example .env.local` instead of `cp` if preferred. Open http://localhost:3000. The labeled Colosseum sample tour works without an API key; user photo recognition and tailored conversations require the key. Set `AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/` and use a Google AI Studio key in `AI_API_KEY`. Set `AI_MODEL` to a Gemini model available to your account supporting image input and structured outputs; the included default is `gemini-3.8-flash`.

```sh
npm run typecheck
npm test
npm run build
npm start
```

## Deploy to Vercel

1. Push this folder to a Git repository and import it into Vercel.
2. Select the **Next.js** framework preset. If this is a subdirectory, use this folder as the Root Directory.
3. Add `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL` in Vercel's server environment settings. Never use a `NEXT_PUBLIC_` prefix for secrets.
4. Deploy using the default build command `npm run build` and framework-managed output.
5. For a public deployment, configure both Upstash Redis REST variables for a shared rate limit across serverless instances, set provider spending limits, and enable Vercel's firewall/rate protections as appropriate. The built-in memory limiter is useful locally but is not a global serverless limit.

No database or image bucket is required. API routes use the Node.js runtime with a 60-second guide timeout. Camera, geolocation, and speech permissions work on HTTPS or localhost. Testing a phone against a plain HTTP LAN address will not provide the same permission support as Vercel HTTPS.

## Experience

- Camera preview and shutter, plus JPG/PNG/WebP upload and compression (1400px longest side).
- Explicit photo-analysis action and optional approximate location context.
- Validated structured identification with confidence, image quality, alternatives, grounded facts, and labeled History/Culture/Legend/Disputed stories.
- Five guide modes affect the initial narration, regenerated narration, and subsequent answers.
- Follow-up chat includes the photograph, current attraction, recent conversation, and summaries of visited places. Input text remains available when a request fails.
- Browser narration includes play, pause/resume, restart, and speed. Device/browser speech capabilities vary; uninterrupted playback with the screen locked is not guaranteed.
- Voice questions use SpeechRecognition where supported. Dictation fills the text box for review before sending. Browser speech services may process audio remotely.
- Nearby discoveries use live Wikipedia geosearch, prioritize historical/cultural descriptions and topic overlap, and show approximate straight-line distances with source links. These are not route instructions or verified live visitor information.
- My Journey restores photos, mode, and conversations from IndexedDB only after opt-in. Otherwise discoveries stay in memory for the session. Clear Journey deletes stored and in-memory visits. Landmark coordinates and construction year support future maps and comparisons.
- Offline notification, retained photo for retry, camera denial, location denial, unavailable provider, unsupported image, blurry photo, and uncertain identification states.

## Privacy and architecture

API keys stay in server-only modules. The provider sends photos and conversation context to Google Gemini through its OpenAI-compatible Chat Completions endpoint. Google’s applicable API data-use and retention terms apply; the app makes no provider-side zero-retention guarantee. Photos are redrawn through a canvas to remove embedded metadata. Device coordinates are rounded to 0.01 degrees before being used and are held in memory, not persisted with a journey. Saved coordinates refer to the identified landmark, not the device's exact position. Nearby lookup sends an approximate search center to Wikipedia. The app adds no analytics or server-side photo storage.

```
src/app/page.tsx                 Journey and conversation orchestration; screen layouts
src/app/globals.css              Responsive theme and Tailwind import
src/components/Camera.tsx        Camera lifecycle and capture
src/components/ModePicker.tsx    Shared guide-mode control
src/components/AudioGuide.tsx    Browser text-to-speech
src/components/VoiceQuestion.tsx Browser speech recognition
src/lib/types.ts                 Domain types and request/response validation
src/lib/ai/provider.ts           GuideProvider interface and Gemini-compatible implementation
src/lib/geo.ts                   Permission-gated location and distance calculations
src/lib/photo.ts                 Client image preparation
src/lib/journey.ts               Opt-in IndexedDB persistence
src/lib/image-validation.ts      Server image signature validation
src/lib/server/guard.ts          Origin checks, rate limits, bounded JSON reader
src/app/api/guide/route.ts       Vision, narration, and conversation endpoint
src/app/api/nearby/route.ts      Live nearby place lookup
tests/core.test.ts               Privacy, distance, validation tests
```

The server reads `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL`. `AI_BASE_URL` must be an HTTPS API base URL (not a full `/chat/completions` URL); a trailing slash is optional. It defaults to Google’s Gemini compatibility endpoint, and `AI_MODEL` defaults to `gemini-3.8-flash`. Compatible providers can be configured with these variables; providers with a different protocol can implement `GuideProvider.respond`. The UI consumes the domain schema rather than a provider SDK. In supporting browsers, an optional read-only WebMCP tool exposes journey names and visit times (not photos or conversations). Unsupported browsers need no polyfill.

## Validation and practical limits

Production build and TypeScript checks passed. Browser checks covered desktop and 390px mobile layouts without horizontal overflow, the sample tour, mode changes, questions, persistence after reload, restored conversations, denied camera, and mocked uncertain/blurry recognition. API checks covered invalid inputs and cross-origin rejection. Live Wikipedia nearby lookup returned results around Rome.

The Gemini update passed all five automated tests and a production build using `next build --webpack` (the sandbox blocked Turbopack’s worker connection). Gemini migration checks cover the Chat Completions URL, authorization, image and conversation payloads, structured output parsing, refusal/truncation handling, and provider errors with mocked responses. No Gemini API key was supplied, so live AI identification and live model answers were not executed; the provider integration is implemented and the app displays a clear setup message. Physical camera capture, microphone capture, actual audio output, location prompts on a real phone, and the optional WebMCP browser integration still require device testing. An embedded preview could not reach the local server from this environment; the production server itself returned HTTP 200 and was exercised in automated browser checks.

Saved stories are accessible while the app is open offline. This first version does not cache the application shell for a cold offline launch. There is no account sync, map view, or live source retrieval for AI historical answers. The model is instructed to express uncertainty and refer changing visitor information to official sources; model knowledge is not a substitute for verification.

## Sources and assets

- Sample photograph: [Colosseum on Unsplash](https://unsplash.com/photos/colosseum-amphitheatre-in-rome-italy-B_FylPoY0tg). Delivered from the Unsplash image CDN.
- Sample attraction reference: [Parco archeologico del Colosseo](https://colosseo.it/en/area/the-colosseum/).
- Nearby summaries: Wikipedia, linked per result; content is subject to [CC BY-SA](https://creativecommons.org/licenses/by-sa/4.0/).
- AI integration: [Google Gemini OpenAI compatibility](https://ai.google.dev/gemini-api/docs/openai), including image input and structured output.

The supplied screenshot files show the app's desktop home and mobile views. They contain sample content, not a claim of live AI recognition.
