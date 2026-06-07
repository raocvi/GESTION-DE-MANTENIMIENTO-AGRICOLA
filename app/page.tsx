import { redirect } from 'next/navigation'

// ⚠️ Auth desactivada temporalmente — redirige directo al dashboard
export default function RootPage() {
  redirect('/dashboard')
}
