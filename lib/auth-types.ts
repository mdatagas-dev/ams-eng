export type UserRole = "SUPER_USER" | "ADMIN"

export type AuthUser = {
  id: string
  name: string
  username: string
  role: UserRole
}

export type ManagedUser = AuthUser & {
  active: boolean
  createdAt: string
}
