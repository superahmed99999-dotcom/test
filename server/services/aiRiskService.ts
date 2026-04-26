/**
 * AI Risk Detection Service
 * Uses AI to analyze issues and detect risk levels
 */

import { invokeLLM } from "../_core/llm";

type RiskLevel = "low" | "medium" | "high" | "critical";

interface RiskAnalysisResult {
  riskLevel: RiskLevel;
  confidence: number;
  reasoning: string;
}

/**
 * Analyze an issue and detect its risk level using AI
 */
export async function analyzeIssueRisk(
  title: string,
  description: string,
  category: string,
  severity: string
): Promise<RiskAnalysisResult> {
  try {
    const prompt = `You are a civic issue risk assessment expert. Analyze the following issue and determine its risk level.

Issue Title: ${title}
Issue Description: ${description}
Category: ${category}
Severity: ${severity}

Based on the issue details, determine the risk level (low, medium, high, or critical) and provide your reasoning.

Respond in JSON format:
{
  "riskLevel": "low|medium|high|critical",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a civic infrastructure risk assessment AI. Analyze issues and determine their risk levels based on potential impact and urgency.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema" as const,
        json_schema: {
          name: "risk_analysis",
          strict: true,
          schema: {
            type: "object" as const,
            properties: {
              riskLevel: {
                type: "string" as const,
                enum: ["low", "medium", "high", "critical"],
                description: "The assessed risk level",
              },
              confidence: {
                type: "number" as const,
                description: "Confidence score from 0 to 1",
              },
              reasoning: {
                type: "string" as const,
                description: "Explanation of the risk assessment",
              },
            },
            required: ["riskLevel", "confidence", "reasoning"],
            additionalProperties: false,
          },
        },
      }
    });

    const content = response.choices[0]?.message.content;
    if (!content || typeof content !== "string") {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);

    return {
      riskLevel: result.riskLevel as RiskLevel,
      confidence: result.confidence,
      reasoning: result.reasoning,
    };
  } catch (error) {
    console.error("[AI Risk] Error analyzing issue:", error);
    // Default to medium risk if analysis fails
    return {
      riskLevel: "medium",
      confidence: 0,
      reasoning: "Risk analysis failed, defaulting to medium risk",
    };
  }
}

/**
 * Determine if an issue should be marked as critical (hidden from public)
 */
export async function shouldMarkAsCritical(
  title: string,
  description: string,
  category: string,
  riskLevel: RiskLevel
): Promise<boolean> {
  // Mark as critical if risk level is critical or high with certain categories
  if (riskLevel === "critical") {
    return true;
  }

  // Check for sensitive categories that should be hidden when high risk
  const sensitiveCategories = ["Security", "Safety", "Emergency"];
  if (riskLevel === "high" && sensitiveCategories.some((cat) => category.includes(cat))) {
    return true;
  }

  return false;
}
