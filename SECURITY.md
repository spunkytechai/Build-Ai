# Security Policy

## Reporting a vulnerability

Please do not publish security vulnerabilities, exploit details, credentials, or private property data in public issues.

If private vulnerability reporting is available, use the repository's **Security → Report a vulnerability** workflow. If it is unavailable, contact the repository maintainer through the GitHub profile and request a private disclosure channel.

Include the affected commit or version, impact, reproduction steps, and a suggested mitigation where possible. Redact personal data and secrets.

## Security expectations

- Never commit API keys, service-role keys, credentials, or production environment files.
- Keep authorization and row-level access controls server-side.
- Treat uploaded documents and user-supplied data as untrusted input.
- Do not present generated architectural or regulatory outputs as verified professional advice.
