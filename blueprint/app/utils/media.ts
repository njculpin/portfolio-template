const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif']
const videoExtensions = ['mp4', 'webm', 'mov']

export function getMediaType(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  if (videoExtensions.includes(ext)) return 'video'
  if (imageExtensions.includes(ext)) return 'image'
  return 'image'
}

export function getMediaUrl(projectSlug: string, filename: string) {
  return `/portfolio/${projectSlug}/${filename}`
}

export function getProductImageUrl(productSlug: string, filename: string) {
  return `/store/${productSlug}/${filename}`
}
