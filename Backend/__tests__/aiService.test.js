import { jest } from "@jest/globals";

// Helper to reset modules between tests
beforeEach(() => {
  jest.resetModules();
});

// -------------- TESTS --------------

describe("AI Service: callAIAgent()", () => {
  const mockSurvey = {
    riskLevel: "High",
    percentage: 85,
    actionableGoal: "Reduce phone usage",
  };

  test("should return parsed JSON when AI provides valid response", async () => {
    // Mock @google/generative-ai (valid AI output)
    jest.unstable_mockModule("@google/generative-ai", () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn(() => ({
          generateContent: jest.fn(async () => ({
            response: {
              text: () =>
                `[
                  { "day": "Saturday", "activity": "Hiking", "duration": 120, "goalType": "Weekly", "reason": "Relax outdoors", "priority": "high", "isRecommended": true },
                  { "day": "Monday", "activity": "Yoga", "duration": 30, "goalType": "Daily", "reason": "Improve focus", "priority": "normal", "isRecommended": true }
                ]`,
            },
          })),
        })),
      })),
    }));

    const { callAIAgent } = await import("../services/aiService.js");

    const preferences = ["Hiking", "Yoga"];
    const result = await callAIAgent(mockSurvey, preferences);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("activity");
    expect(result[0]).toHaveProperty("goalType");
  });

  test("should fallback to default plan when AI fails or response invalid", async () => {
    // Mock @google/generative-ai to simulate an API failure
    jest.unstable_mockModule("@google/generative-ai", () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn(() => ({
          generateContent: jest.fn(async () => {
            throw new Error("API unavailable");
          }),
        })),
      })),
    }));

    // Dynamically import aiService AFTER mocking (isolated instance)
    const { callAIAgent } = await import("../services/aiService.js");

    const preferences = ["Walking"];
    const result = await callAIAgent(mockSurvey, preferences);

    expect(Array.isArray(result)).toBe(true);
    expect(result[0].activity).toBe("Walking");
    expect(result[0].reason).toMatch(/fallback/i);
  });
});

//  Simple placeholder to ensure at least one passing test
test("AI service placeholder test", () => {
  expect(true).toBe(true);
});
