# www.peterkimzz.com

Nuxt 4 기반 개인 블로그입니다.

## Stack

- `Nuxt 4`
- `@nuxt/content v3`
- `Nuxt UI`
- `GitHub Pages`
- `GitHub Actions`

## Development

```bash
yarn install
yarn dev
yarn generate
```

## Writing Workflow

Posts stay in `content/*.md`, and post images live in `public/posts/<slug>/`.

```bash
yarn new:post my-post
yarn paste:image my-post
yarn add:image my-post ~/Desktop/foo.png
```

- `yarn new:post <slug>` creates a markdown file from `content/.template/basic.md`
- `yarn add:image <slug> <file...>` copies local image files into `public/posts/<slug>/` and prints markdown image links
- `yarn paste:image <slug>` saves the current clipboard image into `public/posts/<slug>/` using `pngpaste` when available, then prints the markdown image link
- generated local image paths look like `/posts/<slug>/<filename>`
- external image URLs are still supported when you want to use them manually

## Environment Variables

```bash
NUXT_PUBLIC_SITE_URL=https://www.peterkimzz.com
```

## GitHub Pages Notes

- `yarn build` runs `nuxt generate` and produces static output in `.output/public`
- The repository includes a GitHub Actions workflow that deploys the generated site to GitHub Pages
- Keep `public/CNAME` committed so the custom domain stays attached to the static site
- Content is still managed as markdown files under `content/`
