import { BrowserRouter } from 'react-router'
import { ConfigProvider } from '@/hooks/useConfig'
import SetupWizard from '@/components/SetupWizard/SetupWizard'

export default function App() {
  return (
    <BrowserRouter>
      <ConfigProvider>
        <SetupWizard />
      </ConfigProvider>
    </BrowserRouter>
  )
}
