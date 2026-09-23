# Security Policy / 安全策略

## Reporting a vulnerability

Please report security issues **privately** through [GitHub Security Advisories](https://github.com/thinkingjimmy/Image-Prompt-Book/security/advisories/new). Do not open a public issue for vulnerabilities.

Include the affected URL or file, steps to reproduce and the impact you observed. We aim to acknowledge reports within 7 days.

## Scope notes

- The site has no accounts, database, uploads or model API keys. It needs only a public `SITE_URL` at runtime.
- Prompt text and sources are treated as data: rendered as escaped text, never executed. Links must be absolute HTTPS URLs; `javascript:` and `data:` URLs are rejected by content validation.
- Share links carry only enumerated option IDs in the URL hash, which never reaches the server.
- CI for pull requests runs with a read-only token and without production secrets (`pull_request`, not `pull_request_target`).

Rights or privacy concerns about content are not security issues — please use the [rights request](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=rights-request.yml) template. You never need to post identity documents publicly.

## 报告漏洞

请通过 [GitHub Security Advisories](https://github.com/thinkingjimmy/Image-Prompt-Book/security/advisories/new) **私下**报告安全问题，不要公开提交 Issue。内容的权利或隐私问题请使用“权利或隐私反馈”模板，无需公开任何身份证明材料。
