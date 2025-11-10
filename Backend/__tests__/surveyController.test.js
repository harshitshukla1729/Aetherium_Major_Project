/**
 * @jest-environment node
 */
import { jest } from "@jest/globals";

// --- STEP 1: Mock the Survey model before importing controller ---
const mockAggregate = jest.fn();
const mockFindOneAndUpdate = jest.fn();

jest.unstable_mockModule("../models/surveyModel.js", () => ({
  default: {
    aggregate: mockAggregate,
    findOneAndUpdate: mockFindOneAndUpdate,
  },
}));

// --- STEP 2: Import controller AFTER mocks are registered ---
const { submitSurvey } = await import("../controllers/surveyController.js");

// --- STEP 3: Helper: mock Express res object ---
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// --- STEP 4: Helper data ---
const validSet1 = Array(25).fill(3);
const validSet2 = Array(25).fill(2);
const validSet3 = Array(20).fill(4);

describe("Survey Controller - submitSurvey", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Test 1: Missing required Set 1 ---
  test("should return 400 if Set 1 is missing or invalid", async () => {
    const req = { body: { scoresSet2: validSet2 } };
    const res = mockResponse();

    await submitSurvey(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/Score Set 1 is required/i),
      })
    );
  });

  // --- Test 2: Invalid Set 2 length ---
  test("should return 400 if Set 2 has incorrect length", async () => {
    const req = { body: { scoresSet1: validSet1, scoresSet2: [1, 2, 3] } };
    const res = mockResponse();

    await submitSurvey(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/Score Set 2 must contain 25/i),
      })
    );
  });

  // --- Test 3: Handles aggregation and threshold extraction properly ---
  test("should calculate assessment and return 201 with success message", async () => {
    const req = {
      user: { id: "user123" },
      body: { scoresSet1: validSet1, scoresSet2: validSet2, scoresSet3: validSet3 },
    };
    const res = mockResponse();

    // Mock aggregation returning percentiles
    mockAggregate.mockResolvedValue([
      { percentiles: [30, 60] },
    ]);
    mockFindOneAndUpdate.mockResolvedValue({ _id: "survey001" });

    await submitSurvey(req, res);

    expect(mockAggregate).toHaveBeenCalled();
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { userId: "user123" },
      expect.objectContaining({
        userId: "user123",
        riskLevel: expect.any(String),
        percentage: expect.any(Number),
      }),
      expect.objectContaining({ new: true, upsert: true })
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/survey submitted successfully/i),
        assessment: expect.objectContaining({
          riskLevel: expect.any(String),
          percentage: expect.any(Number),
        }),
      })
    );
  });

  // --- Test 4: Should fallback to default thresholds if aggregation fails ---
  test("should use fallback thresholds if aggregation returns empty array", async () => {
    const req = {
      user: { id: "user123" },
      body: { scoresSet1: validSet1 },
    };
    const res = mockResponse();

    mockAggregate.mockResolvedValue([]);

    await submitSurvey(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/survey submitted successfully/i),
      })
    );
  });

  // --- Test 5: Handles server error gracefully ---
  test("should return 500 if Survey.aggregate throws an error", async () => {
    const req = {
      user: { id: "user123" },
      body: { scoresSet1: validSet1 },
    };
    const res = mockResponse();

    mockAggregate.mockRejectedValue(new Error("DB failure"));

    await submitSurvey(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/server error/i),
      })
    );
  });
});
