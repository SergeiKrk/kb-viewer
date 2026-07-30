1|1|1|1|# AGENTS.md — green-crown-seo-unu
2|2|2|2|
3|3|3|3|## Domain
4|4|4|4|SEO-анализ сайта green-crown.ru
5|5|5|5|
6|6|6|6|## Project Structure
7|7|7|7|```
8|8|8|8|green-crown-seo-unu/
9|9|9|9|├── AGENTS.md          ← This file: schema, conventions, workflows
10|10|10|10|├── raw/               ← Immutable source documents (articles, PDFs, notes)
11|11|11|11|├── wiki/              ← LLM-maintained markdown knowledge base
12|12|12|12|│   ├── index.md       (moved to root)
13|13|13|13|│   └── *.md           Entity pages, summaries, synthesis
14|14|14|14|├── index.md           ← Catalog of all wiki pages
15|15|15|15|└── log.md             ← Chronological record of all operations
16|16|16|16|```
17|17|17|17|
18|18|18|18|## Conventions
19|19|19|19|- All wiki pages in `wiki/` are LLM-written and LLM-maintained
20|20|20|20|- Raw sources in `raw/` are never modified by LLM — read-only
21|21|21|21|- Every wiki page has YAML frontmatter: `title`, `date`, `tags`, `category`
22|22|22|22|- Cross-references use `[[wikilinks]]` for Obsidian navigation
23|23|23|23|- index.md is updated on every ingest
24|24|24|24|- log.md is append-only
25|25|25|25|
26|26|26|26|## Workflows
27|27|27|27|
28|28|28|28|### Ingest a new source
29|29|29|29|1. Read the source from `raw/`
30|30|30|30|2. Discuss key takeaways with user
31|31|31|31|3. Write summary page in `wiki/` (naming: descriptive, kebab-case or Russian)
32|32|32|32|4. Update `index.md` — add entry with link + one-line summary
33|33|33|33|5. Update relevant entity/concept pages across `wiki/`
34|34|34|34|6. Append entry to `log.md`: `## [2026-06-17] ingest | <Source Title>`
35|35|35|35|
36|36|36|36|### Query
37|37|37|37|1. Read `index.md` first to find relevant pages
38|38|38|38|2. Drill into specific wiki pages
39|39|39|39|3. Synthesize answer with citations (`[[page]]`)
40|40|40|40|4. Good answers → file as new pages in `wiki/`
41|41|41|41|
42|42|42|42|### Lint
43|43|43|43|1. Scan all wiki pages for contradictions
44|44|44|44|2. Check for orphan pages (no inbound links)
45|45|45|45|3. Flag stale claims superseded by newer sources
46|46|46|46|4. Suggest missing pages for important concepts
47|47|47|47|5. Append lint report to `log.md`
48|48|48|48|
49|49|49|49|## Page Template
50|50|50|50|```markdown
51|51|51|51|---
52|52|52|52|title: "Page Title"
53|53|53|53|date: YYYY-MM-DD
54|54|54|54|tags: [tag1, tag2]
55|55|55|55|category: entity|concept|summary|analysis|reference
56|56|56|56|source_count: N
57|57|57|57|---
58|58|58|58|
59|59|59|59|# Title
60|60|60|60|
61|61|61|61|Content...
62|62|62|62|
63|63|63|63|## Related
64|64|64|64|- [[other-page]]
65|65|65|65|```
66|66|66|66|
67|67|67|67|## Tools
68|68|68|68|- Obsidian for browsing and graph view
69|69|69|69|- Git for version control (all files are markdown)
70|70|70|70|- Dataview for dynamic queries (if YAML frontmatter is populated)
71|71|71|71|