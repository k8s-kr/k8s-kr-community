import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      githubUsername?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    githubUsername?: string
  }

  interface Profile {
    login?: string
    id?: string
    name?: string
    email?: string
    avatar_url?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    githubUsername?: string
    id?: string
  }
}