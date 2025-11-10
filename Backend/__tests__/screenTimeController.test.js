/**
 * @jest-environment node
 */
import { jest } from "@jest/globals";
import mongoose from "mongoose";

//  Mock dependencies safely
jest.unstable_mockModule("../models/screenTimeModel.js", () => ({
  default: {
    find: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule("mongoose", () => ({
  default: {
    Types: { ObjectId: { isValid: jest.fn() } },
  },
  Types: { ObjectId: { isValid: jest.fn() } },
}));

//  Import after mocks are registered
const {
  logScreenTime,
  getMyScreenTime,
  deleteScreenTimeLog,
} = await import("../controllers/screenTimeController.js");

//  Helper to mock Express responses
function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

//  Begin the actual tests
describe("ScreenTime Controller (ESM-compatible)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 if required fields are missing", async () => {
    const req = { user: { id: "user1" }, body: {} };
    const res = mockResponse();

    await logScreenTime(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/provide device type/i),
      })
    );
  });

  test("should return success when logs are fetched", async () => {
    const ScreenTime = (await import("../models/screenTimeModel.js")).default;
    ScreenTime.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([{ deviceType: "Mobile", durationMinutes: 60 }]),
    });

    const req = { user: { id: "user1" } };
    const res = mockResponse();

    await getMyScreenTime(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        data: expect.any(Array),
      })
    );
  });

  test("should return 400 for invalid ObjectId during delete", async () => {
    const mongooseModule = await import("mongoose");
    mongooseModule.default.Types.ObjectId.isValid.mockReturnValue(false);

    const req = { params: { id: "invalid" }, user: { id: "user1" } };
    const res = mockResponse();

    await deleteScreenTimeLog(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/invalid log id/i),
      })
    );
  });
});
