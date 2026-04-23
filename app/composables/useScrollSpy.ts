type TocLink = {
  id: string;
  text: string;
  depth?: number;
  children?: TocLink[];
};

type FlattenedHeading = {
  id: string;
  parentId: string | null;
  depth: number;
};

const SCROLL_SPY_OFFSET = 80;

function flattenTocLinks(
  links: TocLink[],
  parentId: string | null = null,
): FlattenedHeading[] {
  return links.flatMap((link) => {
    const depth = typeof link.depth === "number" ? link.depth : 2;

    return [
      {
        id: link.id,
        parentId,
        depth,
      },
      ...flattenTocLinks(link.children || [], link.id),
    ];
  });
}

function getActiveHeadingId(
  headings: Array<{ id: string; element: HTMLElement }>,
  offset: number,
) {
  if (!headings.length) {
    return null;
  }

  const passedHeadings = headings.filter(({ element }) => {
    return element.getBoundingClientRect().top <= offset;
  });

  if (passedHeadings.length) {
    return passedHeadings.at(-1)?.id || null;
  }

  return headings[0]?.id || null;
}

export function useScrollSpy(links: MaybeRefOrGetter<TocLink[]>) {
  const activeHeadingId = ref<string | null>(null);
  const route = useRoute();

  const headings = computed(() => flattenTocLinks(toValue(links)));
  const parentById = computed(() => {
    return new Map(
      headings.value.map((heading) => [heading.id, heading.parentId] as const),
    );
  });

  let observer: IntersectionObserver | null = null;

  function disconnectObserver() {
    observer?.disconnect();
    observer = null;
  }

  function updateActiveHeading() {
    if (!import.meta.client) {
      return;
    }

    const observedHeadings = headings.value
      .map(({ id }) => {
        const element = document.getElementById(id);

        if (!(element instanceof HTMLElement)) {
          return null;
        }

        return { id, element };
      })
      .filter((heading): heading is { id: string; element: HTMLElement } => {
        return heading !== null;
      });

    activeHeadingId.value = getActiveHeadingId(
      observedHeadings,
      SCROLL_SPY_OFFSET,
    );
  }

  async function setupObserver() {
    if (!import.meta.client) {
      return;
    }

    disconnectObserver();
    activeHeadingId.value = null;

    if (!headings.value.length) {
      return;
    }

    await nextTick();

    const elements = headings.value
      .map(({ id }) => document.getElementById(id))
      .filter(
        (element): element is HTMLElement => element instanceof HTMLElement,
      );

    if (!elements.length) {
      return;
    }

    updateActiveHeading();

    observer = new IntersectionObserver(updateActiveHeading, {
      rootMargin: `-${SCROLL_SPY_OFFSET}px 0px -65% 0px`,
      threshold: [0, 1],
    });

    elements.forEach((element) => {
      observer?.observe(element);
    });
  }

  function isActive(id: string) {
    return activeHeadingId.value === id;
  }

  function isAncestorActive(id: string) {
    let currentId = activeHeadingId.value;

    while (currentId) {
      const parentId = parentById.value.get(currentId) || null;

      if (!parentId) {
        return false;
      }

      if (parentId === id) {
        return true;
      }

      currentId = parentId;
    }

    return false;
  }

  onMounted(() => {
    void setupObserver();
  });

  watch(
    [() => route.fullPath, headings],
    () => {
      void setupObserver();
    },
    { flush: "post" },
  );

  onBeforeUnmount(() => {
    disconnectObserver();
  });

  return {
    activeHeadingId: readonly(activeHeadingId),
    isActive,
    isAncestorActive,
  };
}
