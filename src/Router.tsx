import type { ReactNode } from 'react'

interface RouterProps {
  children?: ReactNode
}

/**
 * Legacy Router compatibility wrapper.
 *
 * Sprig's active page and record navigation now lives in App.tsx.
 * This file remains as a lightweight wrapper so older imports do not
 * interfere with the production TypeScript build.
 */
export default function Router({
  children,
}: RouterProps) {
  return <>{children}</>
}