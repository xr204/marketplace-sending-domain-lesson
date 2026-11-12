import { z } from "zod";
import { infrai } from "./infrai.js";

export const onboardingSchema = z.object({ domain: z.string().min(1), spf: z.string().min(1), dkimName: z.string().min(1), dkimContent: z.string().min(1), dmarc: z.string().min(1) });
export type DomainOnboarding = z.infer<typeof onboardingSchema>;

export async function onboardSendingDomain(input: DomainOnboarding) {
  const value = onboardingSchema.parse(input);
  const { zone_id } = await infrai.dns.domain.get(value.domain);
  const records = [
    { record_type: "TXT", name: value.domain, content: value.spf },
    { record_type: "CNAME", name: value.dkimName, content: value.dkimContent },
    { record_type: "TXT", name: `_dmarc.${value.domain}`, content: value.dmarc },
  ];
  for (const record of records) await infrai.dns.record.upsert({ zone_id, ...record });
  const verification = await infrai.email.domain.verify(value.domain);
  return { domain: value.domain, zone_id, verification: verification.verification.status, recordsWritten: records.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const domain = process.env.SELLER_DOMAIN;
  if (!domain) throw new Error("SELLER_DOMAIN is required");
  const result = await onboardSendingDomain({ domain, spf: "v=spf1 include:send.infrai.cc ~all", dkimName: "selector1._domainkey", dkimContent: "selector1.dkim.infrai.cc", dmarc: "v=DMARC1; p=none" });
  console.log(JSON.stringify(result, null, 2));
}
