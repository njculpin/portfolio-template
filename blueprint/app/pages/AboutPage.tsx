import About from '@/components/About/About'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function AboutPage() {
  useDocumentTitle('About')
  return <About />
}
