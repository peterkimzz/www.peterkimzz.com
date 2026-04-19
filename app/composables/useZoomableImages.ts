export function useZoomableImages() {
  onMounted(async () => {
    const { default: mediumZoom } = await import('medium-zoom')

    mediumZoom('[data-zoomable]', {
      background: '#16120de6',
      margin: 24,
    })
  })
}
