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
3. updates `site/data/official-xllm.json`
4. deploys `site/` to GitHub Pages

Expected Pages URL:

```text
https://pjgao.github.io/xllm-commit-analysis/
```
