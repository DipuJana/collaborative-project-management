import { apiRequest } from '../../services/apiClient'
import type {
  InviteMemberInput,
  InviteMemberResponse,
  ProjectMember,
  ProjectMembersResponse,
} from './member.types'

export async function getProjectMembers(
  projectId: string,
): Promise<ProjectMember[]> {
  const response = await apiRequest<ProjectMembersResponse>(
    `/projects/${projectId}/members`,
    {
      requiresAuth: true,
    },
  )
  return response.members
}

export async function inviteMember(
  projectId: string,
  input: InviteMemberInput,
): Promise<InviteMemberResponse> {
  return apiRequest<InviteMemberResponse>(`/projects/${projectId}/invitations`, {
    method: 'POST',
    body: input,
    requiresAuth: true,
  })
}
