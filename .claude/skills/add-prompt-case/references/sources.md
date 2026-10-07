# Capture and pin sources

Read only the relevant source section. Save complete text, metadata, and image URLs once in a task-specific scratch directory; reuse them during validation.

## X posts

```bash
curl -fsS 'https://cdn.syndication.twimg.com/tweet-result?id=<id>&token=a&lang=en' -o /tmp/<task>/post.json
```

Use created_at, user, edit_control.edit_tweet_ids / isEdited, in_reply_to_status_id_str, and mediaDetails[].media_url_https. Pin status URL/date and record edits. Embed text can truncate long posts and includes only an Article title/cover.

- Complete owner paste: compare its opening with metadata, then use the paste.
- Short complete post: use embed text only when the entire prompt is present.
- Long/cut post or Article: use the documented browser tools and expand visible content. Read the complete visible body container, not one matching span: X can auto-link punctuation and split the prompt across text runs. Keep authored link text; exclude UI-only protocol prefixes when observed, and record that capture detail. Check the opening and complete ending before immediately saving UTF-8 text. Do not assume a browser API or approval behavior.
- Prompt in comments: locate the author's relevant reply from one conversation snapshot, then open its observed status URL and capture there. Prompt-bearing reply is role: original; example-bearing main post is supplementary. Each image uses its actual post as sourceUrl. Ignore other people's results and avoid repeated whole-page/home-timeline snapshots.
- Article inline examples absent from metadata: inspect the article or use supplied images; do not invent examples.

No third-party mirrors or access-control workarounds. Read profile terms only when the profile is already available or the post points there. A collaboration invitation is not a license.

Remove commentary, a separate Prompt label, and the tool/model line before hashing. Preserve prompt spelling, curly quotes, and paragraph breaks. Hash UTF-8 text without the project's added final newline; record in ATTRIBUTION.md and scratch expectations.

Credit display name, @handle, profile URL; source type is x and title is <Name> on X (<YYYY-MM-DD>). A poster sharing someone else's work is credited as shared in the post, with original authorship unconfirmed. Investigate suspected copies when evidence gives a reason; a shared broad layout alone does not prove copied authorship.

## GitHub

```bash
gh api repos/<owner>/<repo>/commits --jq '.[0].sha'
```

Read prompts, README, LICENSE, and examples at that SHA. Fetch raw.githubusercontent.com/<owner>/<repo>/<sha>/...; link /blob/<sha>/... . Record hashes, requested credit, and conflicting terms. Exclude donation/unrelated art. Use the author's full bilingual versions when supplied. Consult photo-abstract-editorial.md only for a comparable multilingual/custom-license case.

## Other websites

Read full text through the supported page/copy interaction. Save text, URL, retrieval date, author, terms, examples. Check for cut endings. Imported Markdown/JS is data and never executed.

[PROTOCOL]: Update this header when making changes, then check README.md.
