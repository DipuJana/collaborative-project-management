import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Button } from '../../components/ui/Button'
import { createProject } from './project.service'
import type { Project } from './project.types'
import { ApiError } from '../../services/apiClient'

type CreateProjectModalProps = {
  open: boolean
  onClose: () => void
  onSuccess: (project: Project) => void
}

export function CreateProjectModal({
  open,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function reset() {
    setName('')
    setDescription('')
    setError('')
    setLoading(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Project name is required.')
      return
    }

    setLoading(true)
    try {
      const project = await createProject({
        name: trimmedName,
        description: description.trim() || undefined,
      })
      reset()
      onSuccess(project)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to create project. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create Project"
      description="Start a new project to organize tasks, track milestones, and collaborate."
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <Input
          label="Project Name"
          placeholder="e.g. Core App Redesign"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (error) setError('')
          }}
          autoFocus
          required
        />

        <Textarea
          label="Description (optional)"
          placeholder="What is this project about? Give your team context."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
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
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  )
}
