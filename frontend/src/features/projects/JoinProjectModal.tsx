import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { joinProjectByCode } from './project.service'
import { ApiError } from '../../services/apiClient'
import { CheckCircle2 } from 'lucide-react'

type JoinProjectModalProps = {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function JoinProjectModal({
  open,
  onClose,
  onSuccess,
}: JoinProjectModalProps) {
  const [projectCode, setProjectCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  function reset() {
    setProjectCode('')
    setError('')
    setLoading(false)
    setSuccessMessage('')
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    const trimmedCode = projectCode.trim()
    if (!trimmedCode) {
      setError('Please enter a valid project code.')
      return
    }

    setLoading(true)
    try {
      const res = await joinProjectByCode(trimmedCode)
      setSuccessMessage(
        res.message ?? 'Join request sent successfully! The project owner will review it.',
      )
      setTimeout(() => {
        reset()
        onSuccess?.()
        onClose()
      }, 1800)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to send join request. Please verify the project code.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Join a Project"
      description="Enter the unique project code shared by the project owner to request access."
      size="md"
    >
      {successMessage ? (
        <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Request Sent</h3>
          <p className="text-sm text-slate-500 max-w-xs">{successMessage}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <Input
            label="Project Code"
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
            value={projectCode}
            onChange={(e) => {
              setProjectCode(e.target.value)
              if (error) setError('')
            }}
            hint="Ask the project owner or admin for the project code."
            autoFocus
            required
          />

          <div className="mt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Send Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
