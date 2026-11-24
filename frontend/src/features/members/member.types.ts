import type { ProjectMemberRole } from '../projects/project.types'

export type ProjectMember = {
  userId: string
  name: string
  email: string
  role: ProjectMemberRole
  joinedAt: string
}

export type ProjectMembersResponse = {
  members: ProjectMember[]
}

export type InviteMemberInput = {
  email: string
}

export type InviteMemberResponse = {
  message: string
  invitation?: {
    id: string
    projectId: string
    invitedUserId: string
    status: string
  }
}
