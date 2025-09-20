import NextAuth from "next-auth"
import GitHubProvider from "next-auth/providers/github"

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
      }
      if (profile?.login) {
        token.githubUsername = profile.login
      }
      return token
    },
    async session({ session, token }) {
      if (token.githubUsername && session.user) {
        session.user.githubUsername = token.githubUsername as string
      }
      return session
    },
  },
  pages: {
    signIn: "/",
  },
})

export { handler as GET, handler as POST }