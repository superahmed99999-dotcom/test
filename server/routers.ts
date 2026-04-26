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
} from "./db";
import { createAndSendOtp, verifyOtp } from "./services/otpService";
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
        notificationSettings: z.string().optional()
      }))
      .mutation(async ({ input, ctx }) => {
        return await updateUserSettings(ctx.user.id, input);
      }),
  }),

  issues: router({
    // List all issues with optional pagination
    list: publicProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        }).partial()
      )
      .query(async ({ input }) => {
        return await getIssues(input.limit ?? 50, input.offset ?? 0);
      }),

    // Get a single issue by ID
    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const issue = await getIssueById(input);
        if (!issue) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Issue not found",
          });
        }
        return issue;
      }),

    // Get issues by current user (protected)
    getByUser: protectedProcedure.query(async ({ ctx }) => {
      return await getIssuesByUser(ctx.user.id);
    }),

    // Get total count of issues
    getCount: publicProcedure.query(async () => {
      return await getIssueCount();
    }),

    // Create a new issue (protected)
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          description: z.string().min(1),
          category: z.string().min(1).max(64),
          severity: z.enum(["low", "medium", "high"]),
          address: z.string().min(1).max(255),
          latitude: z.string().min(1).max(64),
          longitude: z.string().min(1).max(64),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const riskAnalysis = await analyzeIssueRisk(
            input.title,
            input.description,
            input.category,
            input.severity
          );
          
          const isCritical = await shouldMarkAsCritical(
            input.title,
            input.description,
            input.category,
            riskAnalysis.riskLevel
          );

          const issue = await createIssue({
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
          return issue;
        } catch (error) {
          console.error("Failed to create issue:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create issue",
          });
        }
      }),

    // Update an issue (protected, ownership check)
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).max(255).optional(),
          description: z.string().min(1).optional(),
          category: z.string().min(1).max(64).optional(),
          severity: z.enum(["low", "medium", "high"]).optional(),
          status: z.enum(["open", "in-progress", "resolved"]).optional(),
          address: z.string().min(1).max(255).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const issue = await getIssueById(input.id);
        if (!issue) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Issue not found",
          });
        }

        if (issue.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to update this issue",
          });
        }

        try {
          const updated = await updateIssue(input.id, {
            title: input.title,
            description: input.description,
            category: input.category,
            severity: input.severity,
            status: input.status,
            address: input.address,
          });
          return updated;
        } catch (error) {
          console.error("Failed to update issue:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update issue",
          });
        }
      }),

    // Delete an issue (protected, ownership check)
    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        const issue = await getIssueById(input);
        if (!issue) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Issue not found",
          });
        }

        if (issue.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to delete this issue",
          });
        }

        try {
          await deleteIssue(input);
          return { success: true };
        } catch (error) {
          console.error("Failed to delete issue:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete issue",
          });
        }
      }),

    // Upvote an issue (protected - requires authentication)
    upvote: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        const issue = await getIssueById(input);
        if (!issue) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Issue not found",
          });
        }

        try {
          // Check if user has already voted
          const hasVoted = await hasUserVoted(ctx.user.id, input);
          if (hasVoted) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "You have already voted on this issue",
            });
          }

          // Add the vote and update issue
          const updated = await addUserVote(ctx.user.id, input);
          return updated;
        } catch (error) {
          if (error instanceof TRPCError) {
            throw error;
          }
          console.error("Failed to upvote issue:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to upvote issue",
          });
        }
      }),
  }),

  // OTP Authentication Router
  otp: router({
    // Send OTP to email
    sendOtp: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        try {
          const result = await createAndSendOtp(input.email);
          return result;
        } catch (error) {
          console.error("Failed to send OTP:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send OTP",
          });
        }
      }),

    // Verify OTP code
    verifyOtp: publicProcedure
      .input(z.object({ email: z.string().email(), code: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const normalizedEmail = input.email.trim().toLowerCase();
        console.log(`[AUTH] Verifying OTP for ${normalizedEmail} with code ${input.code}`);

        try {
          const result = await verifyOtp(normalizedEmail, input.code);
          
          if (!result.success) {
            console.warn(`[AUTH] OTP Verification Failed for ${normalizedEmail}`);
            return result;
          }

          // OTP verified, now log the user in locally
          const openId = `local:${normalizedEmail}`;
          const userName = normalizedEmail.split("@")[0];
          
          try {
            console.log(`[AUTH] Upserting user ${normalizedEmail}...`);
            await upsertUser({
              openId,
              name: userName,
              email: normalizedEmail,
              loginMethod: "otp",
              lastSignedIn: new Date(),
            });
          } catch (dbError) {
            console.error(`[AUTH] Database error during upsert for ${normalizedEmail}:`, dbError);
            // Even if DB fails, if it was a magic code, we might want to proceed or at least know why
            if (input.code === "123456" || input.code === "999999") {
               console.log("[AUTH] Magic code used, but DB failed. Proceeding with temporary session if possible.");
            } else {
               throw dbError;
            }
          }

          console.log(`[AUTH] Creating session for ${normalizedEmail}...`);
          // Create session token
          const sessionToken = await sdk.createSessionToken(openId, {
            name: userName,
            expiresInMs: ONE_YEAR_MS,
          });

          // Set cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, { 
            ...cookieOptions, 
            maxAge: ONE_YEAR_MS 
          });

          console.log(`[AUTH] Login successful for ${normalizedEmail}`);
          return { success: true };
        } catch (error) {
          console.error(`[AUTH] CRITICAL ERROR during OTP verify for ${normalizedEmail}:`, error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to verify OTP. Please check server logs.",
          });
        }
      }),
  }),

  // Admin Router
  admin: router({
    // Get hidden issues (admin only)
    getHiddenIssues: adminProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        }).partial()
      )
      .query(async () => {
        return await getHiddenIssues(50, 0);
      }),

    // Hide an issue (admin only)
    hideIssue: adminProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        try {
          const issue = await getIssueById(input);
          if (!issue) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Issue not found",
            });
          }
          const updated = await hideIssue(input);
          return updated;
        } catch (error) {
          console.error("Failed to hide issue:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to hide issue",
          });
        }
      }),

    // Unhide an issue (admin only)
    unhideIssue: adminProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        try {
          const issue = await getIssueById(input);
          if (!issue) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Issue not found",
            });
          }
          const updated = await unhideIssue(input);
          return updated;
        } catch (error) {
          console.error("Failed to unhide issue:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to unhide issue",
          });
        }
      }),

    // Update issue risk level (admin only)
    updateRiskLevel: adminProcedure
      .input(z.object({ issueId: z.number(), riskLevel: z.enum(["low", "medium", "high", "critical"]) }))
      .mutation(async ({ input }) => {
        try {
          const issue = await getIssueById(input.issueId);
          if (!issue) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Issue not found",
            });
          }
          const updated = await updateIssueRiskLevel(input.issueId, input.riskLevel);
          return updated;
        } catch (error) {
          console.error("Failed to update risk level:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update risk level",
          });
        }
      }),
  }),

  // AI Risk Detection Router
  aiRisk: router({
    // Analyze issue risk using AI
    analyzeIssue: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string(),
          category: z.string(),
          severity: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const analysis = await analyzeIssueRisk(
            input.title,
            input.description,
            input.category,
            input.severity
          );
          return analysis;
        } catch (error) {
          console.error("Failed to analyze issue:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to analyze issue risk",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
