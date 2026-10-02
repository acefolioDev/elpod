# Security policy

## Supported versions

Elpod is a working alpha. Until 1.0.0, security fixes are handled on a best-effort basis for the latest `0.x` release line. Pin Elpod and Bun in applications, review the changelog before upgrades, and keep application adapters and dependencies current.

| Version line | Support |
| --- | --- |
| Latest `0.x` | Best-effort security triage |
| Older `0.x` tags | No guaranteed backports |
| `1.x` and later | Not released |

## Reporting a vulnerability

Please use [GitHub private vulnerability reporting](https://github.com/acefolioDev/elpod/security/advisories/new) rather than a public issue. Include the affected version or commit, a minimal reproduction, impact, and any suggested mitigation. Do not include real credentials or private user data.

If private reporting is unavailable, use the placeholder maintainer contact in the repository until it is replaced before launch: **[dev.muhammad.atif@gmail.com](mailto:dev.muhammad.atif@gmail.com)**

Maintainers aim to acknowledge a report within 2 business days and provide an initial assessment within 10 business days. These are targets, not a guaranteed SLA. We will coordinate disclosure timing with the reporter when a fix is available.

## Scope

Reports about Elpod’s source, published package, CLI, templates, or documentation are in scope. Reports about an application built with Elpod, its deployment, identity provider, database, broker, cloud account, or third-party dependency should be sent to the relevant owner as well; we will triage framework-specific impact where possible.

The authentication, session, password, signed-URL, CSRF, rate-limit, and tenant primitives are alpha components and have not been independently audited. Their presence does not guarantee secure application configuration or deployment. Please report suspected issues in these areas privately.
