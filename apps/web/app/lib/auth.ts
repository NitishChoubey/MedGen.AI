import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { Adapter } from "next-auth/adapters"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  
  providers: [
    // Email/Password Authentication
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        // Check account status
        if (user.status === "SUSPENDED") {
          throw new Error("Account suspended. Please contact support.")
        }

        if (user.status === "PENDING_VERIFICATION") {
          throw new Error("Please verify your email before logging in.")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        // Log audit event
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "LOGIN",
            success: true,
            ipAddress: "unknown", // Will be set by middleware
          }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      }
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
      }
      
      // Handle OAuth sign in
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: token.email! }
        })

        if (existingUser) {
          // Update user status to active if signing in with OAuth
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { 
              status: "ACTIVE",
              emailVerified: new Date(),
              lastLoginAt: new Date()
            }
          })

          token.role = existingUser.role
          token.id = existingUser.id
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.email = token.email!
      }
      return session
    },

    async signIn({ user, account, profile }) {
      // Allow OAuth sign in
      if (account?.provider === "google") {
        return true
      }

      // For credentials, check if email is verified
      if (account?.provider === "credentials") {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })

        if (!dbUser?.emailVerified && dbUser?.status === "PENDING_VERIFICATION") {
          return false
        }
      }

      return true
    }
  },

  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        // Send welcome email
        console.log(`New user registered: ${user.email}`)
        // TODO: Implement email sending
      }
    },
    
    async signOut({ token }) {
      // Log audit event
      if (token?.id) {
        await prisma.auditLog.create({
          data: {
            userId: token.id as string,
            action: "LOGOUT",
            success: true,
          }
        })
      }
    }
  },

  debug: process.env.NODE_ENV === "development",
}

