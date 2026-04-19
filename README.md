# www.peterkimzz.com

Nuxt 4 기반 개인 블로그입니다.

## Stack

- `Nuxt 4`
- `@nuxt/content v3`
- `Nuxt UI`
- `Cloudflare Pages`
- `Cloudflare R2` for image uploads
- `GitHub OAuth + GitHub Contents API` for admin editing

## Development

```bash
yarn install
yarn dev
```

## Required Environment Variables

```bash
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_ALLOWED_LOGIN=peterkimzz
GITHUB_REPO_OWNER=peterkimzz
GITHUB_REPO_NAME=www.peterkimzz.com
GITHUB_REPO_BRANCH=main

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_BASE_URL=https://images.peterkimzz.com

NUXT_PUBLIC_SITE_URL=https://www.peterkimzz.com
```

## Cloudflare Pages Notes

- Build command: `yarn build`
- Output directory: `.output/public`
- If using `@nuxt/content` on Cloudflare Pages, bind a D1 database as `DB`.
- Bind the R2 bucket or provide the R2 credentials above as environment variables.
- Enable the `nodejs_compat` compatibility flag because the admin image uploader uses the AWS S3 client against R2.
- Connect the existing custom domain after the first deploy.
