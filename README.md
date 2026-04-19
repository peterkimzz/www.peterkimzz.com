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

## Environment Variables

```bash
NUXT_PUBLIC_SITE_URL=https://www.peterkimzz.com
```

## GitHub Pages Notes

- `yarn build` runs `nuxt generate` and produces static output in `.output/public`
- The repository includes a GitHub Actions workflow that deploys the generated site to GitHub Pages
- Keep `public/CNAME` committed so the custom domain stays attached to the static site
- Content is still managed as markdown files under `content/`
