# www.peterkimzz.com

Nuxt 4 기반 개인 블로그입니다.

Agent rules: [`AGENTS.md`](./AGENTS.md)

## Stack

- `Nuxt 4`
- `@nuxt/content v3`
- `Nuxt Studio`
- `Nuxt UI`
- `Vercel` (SSR target)
- `GitHub Actions`

## Development

```bash
yarn install
yarn dev
yarn generate
```

## Writing Workflow

### Browser editor

Production content is edited at `https://www.peterkimzz.com/admin` with Nuxt
Studio. GitHub OAuth is restricted to the moderator email configured through
`STUDIO_GITHUB_MODERATORS`.

- Studio keeps drafts in the current browser until `Finish update`.
- `Finish update` creates a commit on `main`; Vercel then rebuilds the site,
  and every document committed under `content/` is public.
- Uploaded media stays in Git under `public/` and uses Nuxt Studio's default
  media browser and upload behavior.
- Studio uses its default 10 MB per-file limit and default image, video, and
  audio type policy.
- The visual editor uses Nuxt Studio's default commands, image properties, and
  component discovery. The project-specific `Callout` and `YouTubeEmbed`
  components remain available when Studio discovers them.
- Frontmatter forms support tags, series ordering, and SEO overrides. Tags get
  dedicated `/tags/<tag>` pages, series entries get previous/next navigation,
  and authenticated Studio sessions see an SEO preview in each article.
- `title`, `category`, `created`, and `updated` are required. Categories use
  `tech`, `retrospective`, `design`, `life`, or `nuxt3`.
- Keep the category in `tags` by default. `description` is optional; when it is
  omitted, Nuxt Content uses the first paragraph.
- Dates use `YYYY-MM-DD`. Update `updated` manually whenever an existing post
  changes.
- Long-lived private drafts must not be committed under `content/`.

In local development, run `yarn dev` and open `/admin`. Studio writes changes
directly to the local content and public directories without OAuth.

Content block examples:

```mdc
::callout{type="tip" title="알아두세요"}
강조할 내용을 작성합니다.
::

::youtube-embed{url="https://www.youtube.com/watch?v=..." caption="영상 설명"}
::
```

### Command-line fallback

Posts stay in `content/*.md`, and post images live in `public/posts/<slug>/`.

```bash
yarn new:post my-post
yarn paste:image my-post
yarn add:image my-post ~/Desktop/foo.png
```

- `yarn new:post <slug>` creates a markdown file from
  `scripts/templates/basic.md`
- `yarn add:image <slug> <file...>` copies local image files into `public/posts/<slug>/` and prints markdown image links
- `yarn paste:image <slug>` saves the current clipboard image into `public/posts/<slug>/` using `pngpaste` when available, then prints the markdown image link
- generated local image paths look like `/posts/<slug>/<filename>`
- external image URLs are still supported when you want to use them manually

## Environment Variables

```bash
NUXT_PUBLIC_SITE_URL=https://www.peterkimzz.com
STUDIO_GITHUB_CLIENT_ID=
STUDIO_GITHUB_CLIENT_SECRET=
STUDIO_GITHUB_MODERATORS=peterkimzz69@gmail.com
STUDIO_GITHUB_REDIRECT_URL=https://www.peterkimzz.com/__nuxt_studio/auth/github
```

Copy `.env.example` to an ignored local env file for production-mode Studio
testing. Keep OAuth secrets in Vercel environment variables, never in Git.

## Deployment

- `yarn build` creates the SSR/hybrid output used by Vercel.
- `yarn generate` remains available for the static regression test suite.
- Vercel Git integration deploys `main` to production and other branches as
  previews.
- Public pages use Vercel ISR; Studio and its authentication routes are always
  dynamic, private, and excluded from search indexing.

### GitHub Pages migration safety

The GitHub Pages workflow and `public/CNAME` intentionally remain in place until
the Vercel deployment, OAuth login, custom domains, and TLS have all been
verified. Remove them and disable GitHub Pages only after that cutover succeeds.
