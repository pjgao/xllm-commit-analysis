# xLLM Official Engineering Insights

Static GitHub Pages report for the official [`jd-opensource/xllm`](https://github.com/jd-opensource/xllm) repository.

The site shows:

- cumulative repository contribution metrics
- cumulative hot module distribution
- cumulative contributor ranking
- daily activity, module, contributor, risk, and test-focus analysis
- commit-level records and CSV export

## Local Usage

```bash
npm run build:data
npm run serve
```

Local preview:

```text
http://localhost:4175
```

## Automation

GitHub Actions runs daily and on manual dispatch:

1. fetches `jd-opensource/xllm`
2. runs `scripts/build-official-data.mjs`
3. generates AI summaries for new commits through GitHub Models
4. updates `site/data/official-xllm.json`
5. deploys `site/` to GitHub Pages

AI summary behavior:

- Browser-side code never calls AI APIs.
- GitHub Actions uses `GITHUB_TOKEN` with `models: read`.
- Existing commit summaries are reused from `site/data/official-xllm.json`.
- Only new commits without `aiSummary` are sent to the model.
- `AI_SUMMARY_MAX_PER_RUN` defaults to `20` to control free quota usage.
- `AI_MODEL` defaults to `openai/gpt-4.1-mini`; configure repository variables to switch models.

For local data builds without AI:

```bash
npm run build:data
```

For local AI summary generation, provide a GitHub token with GitHub Models access:

```bash
$env:ENABLE_AI_SUMMARY = "true"
$env:GITHUB_TOKEN = "<token>"
$env:AI_SUMMARY_MAX_PER_RUN = "5"
npm run build:data
```

Expected Pages URL:

```text
https://pjgao.github.io/xllm-commit-analysis/
```
