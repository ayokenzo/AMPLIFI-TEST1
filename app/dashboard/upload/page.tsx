import { getReleaseFee } from '@/app/dashboard/actions'
import { UploadForm } from '@/components/dashboard/upload-form'

export default async function UploadPage() {
  const releaseFee = await getReleaseFee()
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Upload a release
        </h1>
        <p className="text-sm text-muted-foreground">
          Add your details, submit for review, and we&apos;ll send your music to
          150+ stores.
        </p>
      </div>
      <UploadForm releaseFee={releaseFee} />
    </div>
  )
}
