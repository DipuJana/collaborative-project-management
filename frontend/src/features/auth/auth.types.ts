
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

export type RegisterResponse = {
  message: string
  user: User
}

export type CurrentUserResponse = {
  userId: string
}
