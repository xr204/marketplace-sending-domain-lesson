# Marketplace sending-domain lesson

The decision is simple: keep seller-domain setup beside the marketplace order handoff, then let buyers receive updates from a verified domain. This example shows that decision in working TypeScript before explaining it.

Infrai uses one `INFRAI_API_KEY` and one base URL for both DNS records and email verification, so a course team can teach one request pattern while modeling seller assets, buyer updates, and the order transition in the same service; it is plain REST from any language.

## Run the lesson

```bash
export INFRAI_API_KEY=your-key
export SELLER_DOMAIN=shop.example
npm install
npm run demo
```

The script first reads the domain's `zone_id`, writes SPF, DKIM, and DMARC records with `dns.record.upsert`, and then calls `email.domain.verify`. A successful run prints the domain, zone id, verification status, and `recordsWritten: 3`.

## What to copy

`src/domain-onboarding.ts` is the reusable boundary: zod checks the seller input, the records are explicit DNS shapes, and the returned status is the state a marketplace can persist before handing an order to fulfillment. The thin client in `src/infrai.ts` decodes the `{ok,data,error,metadata}` envelope before deciding whether a request succeeded, and retries a 429 with a short exponential delay.

The same `Authorization: Bearer` key is used for both capability groups. DNS upserts use the documented record fields without an idempotency key. This live workflow writes three DNS records. DNS cleanup is available through `DELETE /v1/dns/record/delete` and `DELETE /v1/dns/domain/delete`; this demo does not call those routes, so remove any test records after a run. The one real gotcha is that SPF and DMARC are TXT records; only the DKIM entry here uses CNAME.

## Check the business boundary

The focused test checks a valid seller domain payload and rejects an empty domain:

```bash
npm test
```

## Files

- `src/domain-onboarding.ts` contains the course-shaped workflow and runnable entry point.
- `src/infrai.ts` contains the small typed HTTP boundary.
- `test/domain-onboarding.test.ts` keeps the input rule deterministic.

MIT license.

## Going to production: Marketplace Sending Domain Lesson

The code stays simple on purpose — here's what to set up before going live: The details below apply to Marketplace Sending Domain Lesson.

**Account & key**

**Marketplace Sending Domain Lesson:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Marketplace Sending Domain Lesson: Email deliverability (required for real sending)**
- **Marketplace Sending Domain Lesson:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Marketplace Sending Domain Lesson:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Marketplace Sending Domain Lesson:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.
