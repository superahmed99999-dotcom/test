import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getIssues,
  getIssueById,
  getIssuesByUser,
  getIssueCount,
  createIssue,
  updateIssue,
  deleteIssue,
  upvoteIssue,
  hasUserVoted,
  addUserVote,
  getUserVotes,
  updateIssueRiskLevel,
  hideIssue,
  unhideIssue,
  getHiddenIssues,
  upsertUser,
  updateUserSettings,
  getUserByEmail,
  getAdminAllIssues,
} from "./db";
import { hashPassword, comparePasswords } from "./_core/password";
import { analyzeIssueRisk, shouldMarkAsCritical } from "./services/aiRiskService";
import { sdk } from "./_core/sdk";
import { ONE_YEAR_MS } from "@shared/const";

// Admin procedure - requires admin role
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    updateSettings: protectedProcedure
      .input(z.object({
        language: z.string().optional(),
        theme: z.string().optional(),
        notificationSettings: z.string().optional()
      }))
      .mutation(async ({ input, ctx }) => {
        return await updateUserSettings(ctx.user.id, input);
      }),

    register: publicProcedure
      .input(z.object({ 
        email: z.string().email(), 
        password: z.string().min(6),
        name: z.string().min(2)
      }))
      .mutation(async ({ input, ctx }) => {
        const normalizedEmail = input.email.trim().toLowerCase();
        const existingUser = await getUserByEmail(normalizedEmail);
        
        // If user exists and ALREADY has a password, then it's a real duplicate
        if (existingUser && existingUser.password) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User with this email already exists",
          });
        }

        const hashedPassword = await hashPassword(input.password);
        const openId = existingUser ? existingUser.openId : `local:${normalizedEmail}`;

        const user = await upsertUser({
          openId,
          email: normalizedEmail,
          name: input.name,
          password: hashedPassword,
          loginMethod: "password",
          lastSignedIn: new Date(),
        });

        // Auto-login after registration
        const sessionToken = await sdk.createSessionToken(openId, {
          name: input.name,
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { 
          ...cookieOptions, 
          maxAge: ONE_YEAR_MS 
        });

        return { success: true, user };
      }),

    login: publicProcedure
      .input(z.object({ 
        email: z.string().email(), 
        password: z.string() 
      }))
      .mutation(async ({ input, ctx }) => {
        const normalizedEmail = input.email.trim().toLowerCase();
        const user = await getUserByEmail(normalizedEmail);

        // Fixed password bypass for the main admin
        const isAdminEmail = normalizedEmail === "admin@gmail.com";
        const isMasterPassword = input.password === "admin@123";

        if (isAdminEmail && isMasterPassword) {
           console.log(`[AUTH] Admin bypass used for ${normalizedEmail}`);
           // Ensure user exists if not already there
           let adminUser = user;
           if (!adminUser) {
             adminUser = await upsertUser({
               openId: `local:${normalizedEmail}`,
               email: normalizedEmail,
               name: "Super Admin",
               role: "admin",
               loginMethod: "password",
               lastSignedIn: new Date(),
             });
           }

           if (!adminUser) {
             throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to ensure admin user exists" });
           }

           const sessionToken = await sdk.createSessionToken(adminUser.openId, {
             name: adminUser.name || "Super Admin",
             expiresInMs: ONE_YEAR_MS,
           });

           const cookieOptions = getSessionCookieOptions(ctx.req);
           ctx.res.cookie(COOKIE_NAME, sessionToken, { 
             ...cookieOptions, 
             maxAge: ONE_YEAR_MS 
           });

           return { success: true, user: adminUser };
        }

        if (!user || !user.password) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invalid email or password",
          });
        }

        const isValid = await comparePasswords(input.password, user.password);
        if (!isValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "User",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { 
          ...cookieOptions, 
          maxAge: ONE_YEAR_MS 
        });

        return { success: true, user };
      }),
  }),

  issues: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50), offset: z.number().min(0).default(0) }).partial())
      .query(async ({ input }) => {
        return await getIssues(input.limit ?? 50, input.offset ?? 0);
      }),

    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const issue = await getIssueById(input);
        if (!issue) throw new TRPCError({ code: "NOT_FOUND", message: "Issue not found" });
        return issue;
      }),

    getByUser: protectedProcedure.query(async ({ ctx }) => {
      return await getIssuesByUser(ctx.user.id);
    }),

    getCount: publicProcedure.query(async () => {
      return await getIssueCount();
    }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        description: z.string().min(1),
        category: z.string().min(1).max(64),
        severity: z.enum(["low", "medium", "high"]),
        address: z.string().min(1).max(255),
        latitude: z.string().min(1).max(64),
        longitude: z.string().min(1).max(64),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const riskAnalysis = await analyzeIssueRisk(input.title, input.description, input.category, input.severity);
          const isCritical = await shouldMarkAsCritical(input.title, input.description, input.category, riskAnalysis.riskLevel);

          return await createIssue({
            userId: ctx.user.id,
            title: input.title,
            description: input.description,
            category: input.category,
            severity: input.severity,
            address: input.address,
            latitude: input.latitude,
            longitude: input.longitude,
            imageUrl: input.imageUrl,
            riskLevel: riskAnalysis.riskLevel,
            isHidden: isCritical ? 1 : 0,
            status: "open",
            upvotes: 0,
          });
        } catch (error) {
          console.error("Failed to create issue:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create issue" });
        }
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().min(1).optional(),
        category: z.string().min(1).max(64).optional(),
        severity: z.enum(["low", "medium", "high"]).optional(),
        status: z.enum(["open", "in-progress", "resolved"]).optional(),
        address: z.string().min(1).max(255).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const issue = await getIssueById(input.id);
        if (!issue) throw new TRPCError({ code: "NOT_FOUND", message: "Issue not found" });
        if (issue.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Ownership check failed" });
        return await updateIssue(input.id, input);
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        const issue = await getIssueById(input);
        if (!issue) throw new TRPCError({ code: "NOT_FOUND", message: "Issue not found" });
        if (issue.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Ownership check failed" });
        await deleteIssue(input);
        return { success: true };
      }),

    upvote: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        const hasVoted = await hasUserVoted(ctx.user.id, input);
        if (hasVoted) throw new TRPCError({ code: "BAD_REQUEST", message: "Already voted" });
        return await addUserVote(ctx.user.id, input);
      }),
  }),

  admin: router({
    getAllIssues: adminProcedure
      .query(async () => await getAdminAllIssues()),

    getHiddenIssues: adminProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50), offset: z.number().min(0).default(0) }).partial())
      .query(async () => await getHiddenIssues(50, 0)),

    hideIssue: adminProcedure
      .input(z.number())
      .mutation(async ({ input }) => await hideIssue(input)),

    unhideIssue: adminProcedure
      .input(z.number())
      .mutation(async ({ input }) => await unhideIssue(input)),

    updateRiskLevel: adminProcedure
      .input(z.object({ issueId: z.number(), riskLevel: z.enum(["low", "medium", "high", "critical"]) }))
      .mutation(async ({ input }) => await updateIssueRiskLevel(input.issueId, input.riskLevel)),
  }),

  aiRisk: router({
    analyzeIssue: protectedProcedure
      .input(z.object({ title: z.string(), description: z.string(), category: z.string(), severity: z.string() }))
      .mutation(async ({ input }) => await analyzeIssueRisk(input.title, input.description, input.category, input.severity)),
  }),
});

export type AppRouter = typeof appRouter;
