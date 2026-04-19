<script setup lang="ts">
type AdminPost = {
  path?: string
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

const categories = [
  'tech',
  'retrospective',
  'life',
  'review',
]

const session = ref<{ login: string } | null>(null)
const posts = ref<AdminPost[]>([])
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const notice = ref('')
const bodyEl = ref<HTMLTextAreaElement | null>(null)

const form = reactive<AdminPost>({
  slug: '',
  title: '',
  description: '',
  category: 'tech',
  image: '',
  created: new Date().toISOString().slice(0, 10),
  updated: new Date().toISOString().slice(0, 10),
  published: false,
  body: '',
})

function applyPost(post?: AdminPost) {
  form.path = post?.path
  form.slug = post?.slug || ''
  form.title = post?.title || ''
  form.description = post?.description || ''
  form.category = post?.category || 'tech'
  form.image = post?.image || ''
  form.created = post?.created || new Date().toISOString().slice(0, 10)
  form.updated = post?.updated || new Date().toISOString().slice(0, 10)
  form.published = Boolean(post?.published)
  form.body = post?.body || ''
}

async function refreshPosts() {
  const response = await $fetch<{ posts: AdminPost[] }>('/api/admin/posts')
  posts.value = response.posts
}

async function loadSession() {
  try {
    session.value = await $fetch('/api/admin/session')
    await refreshPosts()
  }
  catch {
    session.value = null
  }
  finally {
    loading.value = false
  }
}

async function editPost(path: string) {
  errorMessage.value = ''
  notice.value = ''

  const response = await $fetch<{ post: AdminPost }>('/api/admin/post', {
    query: { path },
  })

  applyPost(response.post)
}

function newDraft() {
  notice.value = ''
  errorMessage.value = ''
  applyPost()
}

async function savePost(published: boolean) {
  saving.value = true
  errorMessage.value = ''
  notice.value = ''
  form.updated = new Date().toISOString().slice(0, 10)

  try {
    const response = await $fetch<{ path: string }>('/api/admin/post', {
      method: 'PUT',
      body: {
        ...form,
        published,
      },
    })

    form.path = response.path
    form.published = published
    notice.value = published ? 'Published to GitHub.' : 'Draft saved to GitHub.'
    await refreshPosts()
  }
  catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '저장 중 문제가 발생했습니다.'
  }
  finally {
    saving.value = false
  }
}

async function uploadImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  const formData = new FormData()
  formData.append('image', file)

  try {
    const result = await $fetch<{ url: string }>('/api/admin/images', {
      method: 'POST',
      body: formData,
    })

    const markdown = `\n![${file.name}](${result.url})\n`
    const textarea = bodyEl.value

    if (textarea) {
      const start = textarea.selectionStart || form.body.length
      const end = textarea.selectionEnd || form.body.length
      form.body = `${form.body.slice(0, start)}${markdown}${form.body.slice(end)}`
    }
    else {
      form.body += markdown
    }

    notice.value = 'Image uploaded and inserted.'
  }
  catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '이미지 업로드에 실패했습니다.'
  }
  finally {
    input.value = ''
  }
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  session.value = null
}

onMounted(loadSession)
</script>

<template>
  <div class="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8">
    <header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-700)]">
          Admin
        </p>
        <h1 class="mt-3 font-serif text-4xl font-bold tracking-[-0.04em] text-[var(--color-ink-900)]">
          Mobile-first markdown workspace
        </h1>
      </div>

      <div v-if="session" class="flex items-center gap-3">
        <span class="rounded-full bg-[var(--color-ink-50)] px-3 py-1 text-xs font-semibold text-[var(--color-ink-700)]">
          {{ session.login }}
        </span>
        <button class="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[var(--color-ink-900)]" @click="logout">
          Logout
        </button>
      </div>
    </header>

    <div v-if="loading" class="shell-panel rounded-[32px] p-6 text-sm text-[var(--color-ink-700)]">
      Loading admin workspace...
    </div>

    <div v-else-if="!session" class="shell-panel rounded-[32px] p-8 text-center">
      <p class="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-700)]">
        Private area
      </p>
      <h2 class="mt-4 font-serif text-3xl font-bold tracking-[-0.04em] text-[var(--color-ink-900)]">
        GitHub 계정으로 로그인해서 글을 작성하세요.
      </h2>
      <p class="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--color-ink-700)]">
        지정된 GitHub 계정만 접근할 수 있고, 저장 시 markdown 파일이 GitHub 저장소의 main 브랜치에 직접 커밋됩니다.
      </p>
      <a
        href="/api/auth/github"
        class="mt-8 inline-flex rounded-full bg-[var(--color-ink-900)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-700)]"
      >
        Sign in with GitHub
      </a>
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside class="shell-panel rounded-[32px] p-5">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-700)]">
              Articles
            </p>
            <p class="mt-1 text-sm text-[var(--color-ink-700)]">
              {{ posts.length }} items synced from GitHub
            </p>
          </div>
          <button class="rounded-full bg-[var(--color-ink-900)] px-4 py-2 text-sm font-semibold text-white" @click="newDraft">
            New
          </button>
        </div>

        <ul class="mt-5 space-y-3">
          <li v-for="post in posts" :key="post.path">
            <button
              class="w-full rounded-2xl border border-black/5 px-4 py-3 text-left transition hover:border-black/10 hover:bg-[var(--color-ink-50)]"
              @click="editPost(post.path!)"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="font-serif text-lg font-semibold tracking-[-0.02em] text-[var(--color-ink-900)]">
                  {{ post.title || post.slug }}
                </p>
                <span
                  class="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                  :class="post.published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                >
                  {{ post.published ? 'live' : 'draft' }}
                </span>
              </div>
              <p class="mt-2 text-xs text-[var(--color-ink-700)]">
                {{ post.updated || post.created }}
              </p>
            </button>
          </li>
        </ul>
      </aside>

      <section class="shell-panel rounded-[32px] p-5 sm:p-7">
        <div class="grid gap-4 md:grid-cols-2">
          <label class="block">
            <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-700)]">Title</span>
            <input v-model="form.title" class="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none ring-0" placeholder="글 제목" />
          </label>

          <label class="block">
            <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-700)]">Slug</span>
            <input v-model="form.slug" class="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none ring-0" placeholder="my-post-slug" />
          </label>

          <label class="block md:col-span-2">
            <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-700)]">Description</span>
            <input v-model="form.description" class="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none ring-0" placeholder="목록과 SEO에 사용할 짧은 설명" />
          </label>

          <label class="block">
            <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-700)]">Category</span>
            <select v-model="form.category" class="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none ring-0">
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </label>

          <label class="block">
            <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-700)]">Hero image URL</span>
            <input v-model="form.image" class="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none ring-0" placeholder="https://..." />
          </label>

          <label class="block">
            <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-700)]">Created</span>
            <input v-model="form.created" type="date" class="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none ring-0" />
          </label>

          <label class="block">
            <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-700)]">Updated</span>
            <input v-model="form.updated" type="date" class="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none ring-0" />
          </label>
        </div>

        <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label class="inline-flex items-center gap-2 text-sm text-[var(--color-ink-700)]">
            <input v-model="form.published" type="checkbox" class="size-4 rounded border-black/20" />
            Published
          </label>

          <div class="flex flex-wrap gap-3">
            <label class="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[var(--color-ink-900)]">
              Upload image
              <input type="file" accept="image/*" class="hidden" @change="uploadImage" />
            </label>
            <button
              class="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[var(--color-ink-900)]"
              :disabled="saving"
              @click="savePost(false)"
            >
              Save draft
            </button>
            <button
              class="rounded-full bg-[var(--color-ink-900)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-700)] disabled:opacity-60"
              :disabled="saving"
              @click="savePost(true)"
            >
              Publish
            </button>
          </div>
        </div>

        <p v-if="notice" class="mt-4 text-sm font-medium text-emerald-700">
          {{ notice }}
        </p>
        <p v-if="errorMessage" class="mt-4 text-sm font-medium text-red-700">
          {{ errorMessage }}
        </p>

        <label class="mt-6 block">
          <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-700)]">Markdown</span>
          <textarea
            ref="bodyEl"
            v-model="form.body"
            class="min-h-[420px] w-full rounded-[28px] border border-black/10 bg-[var(--color-ink-50)] px-4 py-4 font-mono text-sm leading-7 text-[var(--color-ink-900)] outline-none"
            placeholder="# Title&#10;&#10;Write here..."
          />
        </label>
      </section>
    </div>
  </div>
</template>
