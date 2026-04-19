import { createError } from 'h3'
import matter from 'gray-matter'
import { useRuntimeConfig } from '#imports'

type GithubContentResponse = {
  sha: string
  content: string
  encoding: string
}

export type AdminPostRecord = {
  path: string
  slug: string
  title: string
  description?: string
  category?: string
  image?: string
  created?: string
  updated?: string
  published: boolean
  body: string
}

function getGithubConfig() {
  const config = useRuntimeConfig()

  return {
    owner: config.githubRepoOwner,
    repo: config.githubRepoName,
    branch: config.githubRepoBranch,
    allowedLogin: config.githubAllowedLogin,
  }
}

async function githubRequest<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  return $fetch<T>(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.headers || {}),
    },
  })
}

export async function fetchGithubUser(token: string) {
  return githubRequest<{ login: string }>(token, '/user')
}

export async function assertAdminUser(token: string) {
  const config = getGithubConfig()
  const user = await fetchGithubUser(token)

  if (user.login !== config.allowedLogin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return user
}

export async function listRepoMarkdownFiles(token: string) {
  const config = getGithubConfig()
  const tree = await githubRequest<{ tree: Array<{ path: string, type: string }> }>(
    token,
    `/repos/${config.owner}/${config.repo}/git/trees/${config.branch}?recursive=1`,
  )

  return tree.tree
    .filter(item => item.type === 'blob')
    .map(item => item.path)
    .filter(path => path.startsWith('content/'))
    .filter(path => path.endsWith('.md'))
    .filter(path => !path.includes('/_'))
    .filter(path => !path.includes('/.'))
    .filter(path => !path.startsWith('content/.'))
    .filter(path => !path.startsWith('content/.template/'))
}

export async function getRepoFile(token: string, path: string) {
  const config = getGithubConfig()

  return githubRequest<GithubContentResponse>(
    token,
    `/repos/${config.owner}/${config.repo}/contents/${encodeURIComponent(path)}?ref=${config.branch}`,
  )
}

export async function getAdminPost(token: string, path: string): Promise<AdminPostRecord> {
  const file = await getRepoFile(token, path)
  const source = Buffer.from(file.content, 'base64').toString('utf8')
  const parsed = matter(source)
  const slug = path.replace(/^content\//, '').replace(/\.md$/, '')

  return {
    path,
    slug,
    title: String(parsed.data.title || ''),
    description: parsed.data.description ? String(parsed.data.description) : '',
    category: parsed.data.category ? String(parsed.data.category) : '',
    image: parsed.data.image ? String(parsed.data.image) : '',
    created: parsed.data.created ? String(parsed.data.created) : '',
    updated: parsed.data.updated ? String(parsed.data.updated) : '',
    published: Boolean(parsed.data.published),
    body: parsed.content.trim(),
  }
}

export async function listAdminPosts(token: string) {
  const paths = await listRepoMarkdownFiles(token)
  const posts = await Promise.all(paths.map(path => getAdminPost(token, path)))

  return posts.sort((left, right) => {
    const leftDate = left.updated || left.created || ''
    const rightDate = right.updated || right.created || ''

    return rightDate.localeCompare(leftDate)
  })
}

export async function saveRepoFile(token: string, path: string, content: string, message: string) {
  const config = getGithubConfig()
  let sha: string | undefined

  try {
    const existing = await getRepoFile(token, path)
    sha = existing.sha
  }
  catch {
    sha = undefined
  }

  return githubRequest(
    token,
    `/repos/${config.owner}/${config.repo}/contents/${encodeURIComponent(path)}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: Buffer.from(content, 'utf8').toString('base64'),
        branch: config.branch,
        sha,
      }),
    },
  )
}
