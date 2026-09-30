# CBOS Product Operating System

CBOS uses a small set of systems with explicit ownership. The goal is to avoid duplicating product truth across tools.

## System ownership

| System | Owns |
| --- | --- |
| Notion | clinic evidence, validation synthesis, product boundaries, external research |
| Linear | validated product/engineering backlog, blockers, priorities |
| GitHub | source code, pull requests, CI, release history |
| Vercel | preview/production deployment health and runtime observability |
| PostHog | privacy-safe product behavior and workflow adoption |
| Figma | interaction design, responsive UX, component/design-system work |
| Firecrawl / research tools | vendor, interoperability, EHR and market evidence |
| Context7 | current library and SDK documentation |

## Core links

- Linear project: https://linear.app/tobilobas-workspace/project/cbos-mvp-release-candidate-and-clinic-validation-35661e33da54
- Notion product operations: https://app.notion.com/p/3ebcd6d70fe8814bae50ca61c15a1dc3
- Notion EHR research: https://app.notion.com/p/3ebcd6d70fe881c0a44bf08b1c86dad4
- Notion healthcare UX evidence: https://app.notion.com/p/3ebcd6d70fe88108bed8d5f62c49fe37
- PostHog product health: https://us.posthog.com/project/636213/dashboard/2152957
- GitHub PR #7: https://github.com/Akannione/chiropractic-business-os/pull/7

## Decision flow

1. **Evidence enters Notion.** Clinic interviews, observed workflows, vendor/export facts, and research are captured with source strength.
2. **Validated work enters Linear.** A problem must have a real workflow, known source data, expected action/outcome, and a measurable acceptance condition before it becomes implementation work.
3. **Implementation lives in GitHub.** Code changes need tests and must preserve the product boundary.
4. **Vercel validates the deployed artifact.** Preview smoke and runtime health are release evidence.
5. **PostHog validates product behavior.** Only allowlisted, privacy-safe operational events are collected. No patient-identifying or clinical payloads.
6. **Results feed back into Notion/Linear.** Usage or clinic evidence may validate, refine, or reject a hypothesis.

## Current hard gates

- No PHI/ePHI pilot before actual real-data readiness/compliance review.
- No Intelligence V2 formulas before CJ's exact monthly calculations, joins, thresholds, and actions are documented.
- No broad integration platform build before selecting the first production ingestion adapter from real source-system evidence.
- No EHR replacement drift into SOAP notes, charting, claims, prescriptions, or full scheduling without substantial validation.
- No synthetic PostHog product-usage claims.

## Current integration evidence

### Jane
Jane's official integrations FAQ states that Jane does not currently offer an open API or API keys. For Jane-based clinics, CBOS should treat existing exports as the practical near-term ingestion path unless a direct vendor partnership is established.

### ChiroTouch
Official ChiroTouch documentation confirms patient-file export/transfer mechanisms, and vendor/migration documentation confirms structured CSV workflows exist. However, a general public API has not been established from official public documentation in the current research. Validate the clinic's exact ChiroTouch edition and export capabilities before selecting an adapter.

## Design evidence

Recent peer-reviewed reviews of EHR usability repeatedly identify workflow alignment, navigation burden, fragmented information, data entry, searchability, interoperability, automation, and user guidance as material usability factors. CBOS should use those findings as design hypotheses and validate them against chiropractic front-desk workflows.

The interaction target remains:

**attention → evidence → action → outcome**

not:

**menu → record → interpretation → another system → manual follow-up**

## Release-candidate definition

A release candidate is acceptable for deidentified/demo validation when:

- typecheck passes;
- unit/routing tests pass;
- production build passes;
- browser E2E passes;
- accessibility checks pass;
- auth-enabled smoke passes;
- deployment smoke passes;
- no critical runtime errors are present;
- no unsupported clinical scope was introduced.

Real-patient-data readiness is a separate gate.
