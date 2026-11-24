
export type User = {
  id: string
  name: string
  email: string
}

export type LoginCredentials = {
  email: string
  password: string
}

export type RegisterCredentials = {
  name: string
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  user: User
}

// Backend returns { message, user: { id, name, email, createdAt } }
// We only need the User subset.
export type RegisterResponse = {
  message: string
  user: User & { createdAt?: string }
}

export type CurrentUserResponse = {
  userId: string
}
