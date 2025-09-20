import { LoadingSpinner } from '@/lib/ui-utils'
import { LOADING_MESSAGES } from '@/lib/constants/messages'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">{LOADING_MESSAGES.POSTS}</p>
      </div>
    </div>
  )
}
