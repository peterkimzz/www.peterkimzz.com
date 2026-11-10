# www.peterkimzz.com

Nuxt 4 기반 개인 블로그입니다.

Agent rules: [`AGENTS.md`](./AGENTS.md)

## Stack

- `Nuxt 4`
- `@nuxt/content v3`
- `Nuxt UI`
- `Bun` (package manager and runtime)
- `Cloudflare Pages` (static hosting)
- `GitHub Actions` (CI)

## Development

```bash
bun install
bun run dev
bun run generate
```

## Writing Workflow

### Obsidian

Obsidian에서 `content/` 폴더를 vault로 연다. 공유 설정은
`content/.obsidian/app.json`에 커밋되어 있다.

- 커뮤니티 플러그인 `Custom Attachment Location`을 설치한다 (설정은 기본값
  그대로). 붙여넣은 이미지가 글별 폴더 `posts/<글 이름>/<시각>.png`에
  저장된다. 플러그인이 없으면 `posts/` 바로 아래에 쌓인다.
- 이미지는 실제로 `public/posts/`에 저장된다 (`content/posts`는 그 폴더를
  가리키는 심볼릭 링크). 링크는 `posts/…` 형태로 들어가고 렌더링할 때
  `/posts/…`로 바뀐다.
- `content/drafts/` 안의 글은 `bun run dev`에서만 보이고 프로덕션 빌드에서
  빠진다. 발행할 때 파일을 `content/` 바로 아래로 옮긴다. 저장소가 공개라
  커밋한 초안은 GitHub에서는 보인다.
- 새 글의 frontmatter는 `bun run new:post <slug>`로 만든다.

### Frontmatter

- `title`, `category`, `created`, and `updated` are required. Categories use
  `tech`, `retrospective`, `design`, `life`, or `nuxt3`.
- Keep the category in `tags` by default. `description` is optional; when it is
  omitted, Nuxt Content uses the first paragraph.
- Dates use `YYYY-MM-DD`. Update `updated` manually whenever an existing post
  changes.
- Tags get dedicated `/tags/<tag>` pages, and series entries get previous/next
  navigation.

Content block examples:

```mdc
::callout{type="tip" title="알아두세요"}
강조할 내용을 작성합니다.
::

::youtube-embed{url="https://www.youtube.com/watch?v=..." caption="영상 설명"}
::
```

### Command-line helpers

Posts stay in `content/*.md`, and post images live in `public/posts/<slug>/`.

```bash
bun run new:post my-post
bun run paste:image my-post
bun run add:image my-post ~/Desktop/foo.png
```

- `bun run new:post <slug>` creates a markdown file from
  `scripts/templates/basic.md`
- `bun run add:image <slug> <file...>` copies local image files into `public/posts/<slug>/` and prints markdown image links
- `bun run paste:image <slug>` saves the current clipboard image into `public/posts/<slug>/` using `pngpaste` when available, then prints the markdown image link
- generated local image paths look like `/posts/<slug>/<filename>`
- external image URLs are still supported when you want to use them manually

## Environment Variables

```bash
NUXT_PUBLIC_SITE_URL=https://www.peterkimzz.com
```

## Deployment

The site is fully static. `bun run generate` writes it to `.output/public`.

Cloudflare Pages builds and deploys every push to `main` through its Git
integration:

- Build command: `bun run generate`
- Build output directory: `dist`
- Environment variable: `NUXT_PUBLIC_SITE_URL=https://www.peterkimzz.com`

`bunfig.toml` makes every `bun run` script use the Bun runtime instead of Node.
