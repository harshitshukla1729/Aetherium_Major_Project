import { jest } from "@jest/globals";

// ---------------- MOCKS ----------------
const mockSort = jest.fn();
const mockFindOne = jest.fn(() => ({ sort: mockSort }));
const mockCallAIAgent = jest.fn();

// Mock Mongoose model
jest.unstable_mockModule("../models/surveyModel.js", () => ({
  default: { findOne: mockFindOne },
}));

// Mock AI service
jest.unstable_mockModule("../services/aiService.js", () => ({
  callAIAgent: mockCallAIAgent,
}));

// Import controller after mocks
const { generatePlan } = await import("../controllers/PlannerController.js");

// Suppress console.error spam in test output
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
});

describe("PlannerController.generatePlan", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: "507f1f77bcf86cd799439011" }, // valid ObjectId format
      body: { activities: ["Hiking", "Cycling"] },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      headersSent: false,
    };
    jest.clearAllMocks();
  });

  // ---- TEST 1: 400 ----
  test("should return 400 if no activities are selected", async () => {
    req.body.activities = [];

    await generatePlan(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/no activities selected/i),
      })
    );
  });

  // ---- TEST 2: 404 ----
  test("should return 404 if no survey is found", async () => {
    mockSort.mockResolvedValueOnce(null);

    await generatePlan(req, res);

    expect(mockFindOne).toHaveBeenCalledWith({ userId: req.user.id });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/no survey found/i),
      })
    );
  });

  // ---- TEST 3: 200 OK ----
  test("should return 200 with normalized schedule if AI gives valid response", async () => {
    const mockSurvey = { _id: "survey001", userId: req.user.id };
    const mockSchedule = [
      { day: "Saturday", activity: "Hiking", duration: "2 hours", goalType: "Weekly", priority: "high" },
      { day: "Monday", activity: "Yoga", duration: 30, goalType: "Daily", priority: "normal" },
    ];

    mockSort.mockResolvedValueOnce(mockSurvey);
    mockCallAIAgent.mockResolvedValueOnce(mockSchedule);

    await generatePlan(req, res);

    expect(mockCallAIAgent).toHaveBeenCalledWith(mockSurvey, ["Hiking", "Cycling"]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      schedule: expect.arrayContaining([
        expect.objectContaining({
          activity: "Hiking",
          goalType: "Weekly",
          duration: expect.anything(),
        }),
        expect.objectContaining({
          activity: "Yoga",
          goalType: "Daily",
          duration: expect.anything(),
        }),
      ]),
    });
  });

  // ---- TEST 4: INVALID DATA ----
  test("should handle AI returning invalid data and fallback gracefully", async () => {
    const mockSurvey = { _id: "survey001", userId: req.user.id };
    mockSort.mockResolvedValueOnce(mockSurvey);
    mockCallAIAgent.mockResolvedValueOnce("not-an-array");

    await generatePlan(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/invalid plan/i),
      })
    );
  });

  // ---- TEST 5: AI SERVICE ERROR ----
  test("should return 500 if AI service throws an error", async () => {
    const mockSurvey = { _id: "survey001", userId: req.user.id };
    mockSort.mockResolvedValueOnce(mockSurvey);
    mockCallAIAgent.mockRejectedValueOnce(new Error("AI crashed"));

    await generatePlan(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/server error/i),
      })
    );
  });
});
