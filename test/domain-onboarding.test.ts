import assert from "node:assert/strict";
import { onboardingSchema } from "../src/domain-onboarding.js";

const parsed = onboardingSchema.safeParse({ domain: "shop.example", spf: "v=spf1 ~all", dkimName: "selector._domainkey", dkimContent: "selector.dkim.example", dmarc: "v=DMARC1; p=none" });
assert.equal(parsed.success, true);
assert.equal(onboardingSchema.safeParse({ domain: "", spf: "x", dkimName: "x", dkimContent: "x", dmarc: "x" }).success, false);
console.log("domain input boundary passes");
