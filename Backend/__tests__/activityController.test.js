import { jest } from "@jest/globals";
import mongoose from "mongoose";

// Create a mock Activity model (constructor + methods)
const mockSave = jest.fn();
const Activity = jest.fn().mockImplementation(() => ({
  save: mockSave,
}));
Activity.find = jest.fn();
Activity.findById = jest.fn();
Activity.updateMany = jest.fn();
Activity.deleteOne = jest.fn();
Activity.create = jest.fn();

// Mock ScreenTime model
const ScreenTime = {
  find: jest.fn(),
};

// Register mocks before importing controllers
jest.unstable_mockModule("../models/activityModel.js", () => ({
  default: Activity,
}));

jest.unstable_mockModule("../models/screenTimeModel.js", () => ({
  default: ScreenTime,
}));

// Import controller functions *after mocks*
const {
  createActivity,
  getMyActivities,
  deleteActivity,
  updateActivityProgress,
  getActivitySummary,
  getFeedback,
} = await import("../controllers/activityController.js");

// Helper: mock Express res
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Activity Controller", () => {
  // ------------------------------------------------------------
  describe("createActivity", () => {
    test("should create activity successfully", async () => {
      const req = {
        user: { id: "507f1f77bcf86cd799439011" },
        body: {
          activityName: "Yoga",
          durationMinutes: 0,
          targetMinutes: 60,
          date: new Date(),
          taskType: "Daily",
        },
      };
      const res = mockResponse();

      mockSave.mockResolvedValue(req.body);

      await createActivity(req, res);

      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: req.body });
    });

    test("should return 400 for missing fields", async () => {
      const req = { user: { id: "1" }, body: {} };
      const res = mockResponse();

      await createActivity(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    //  BONUS: Handle AI Planner-style payload
    test("should handle AI-style payload like { name: 'Hiking (2 hours)' }", async () => {
      const req = {
        user: { id: "507f1f77bcf86cd799439011" },
        body: {
          name: "Hiking (2 hours)",
          targetMinutes: "2 hours",
          taskType: "Weekly",
          date: new Date(),
        },
      };
      const res = mockResponse();

      mockSave.mockResolvedValue({
        activityName: "Hiking (2 hours)",
        targetMinutes: 120,
      });

      await createActivity(req, res);

      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            activityName: expect.stringMatching(/hiking/i),
          }),
        })
      );
    });
  });

  // ------------------------------------------------------------
  describe("getMyActivities", () => {
    test("should return all user activities", async () => {
      const req = { user: { id: "507f1f77bcf86cd799439011" } };
      const res = mockResponse();

      const mockActivities = [{ activityName: "Running" }];
      const mockSort = jest.fn().mockResolvedValue(mockActivities);
      Activity.find.mockReturnValue({ sort: mockSort });

      await getMyActivities(req, res);

      expect(Activity.find).toHaveBeenCalledWith({
        userId: "507f1f77bcf86cd799439011",
      });
      expect(mockSort).toHaveBeenCalledWith({ date: -1 });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          data: mockActivities,
        })
      );
    });
  });

  // ------------------------------------------------------------
  describe("deleteActivity", () => {
    test("should delete activity successfully", async () => {
      const req = {
        user: { id: "507f1f77bcf86cd799439011" },
        params: { id: "activity123" },
      };
      const res = mockResponse();

      const mockActivity = {
        userId: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
        deleteOne: jest.fn(),
      };
      Activity.findById.mockResolvedValue(mockActivity);

      await deleteActivity(req, res);

      expect(Activity.findById).toHaveBeenCalledWith("activity123");
      expect(mockActivity.deleteOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Activity removed successfully.",
      });
    });

    test("should return 404 if not found", async () => {
      const req = { user: { id: "1" }, params: { id: "x" } };
      const res = mockResponse();

      Activity.findById.mockResolvedValue(null);
      await deleteActivity(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ------------------------------------------------------------
  describe("updateActivityProgress", () => {
    test("should update progress and sync Daily <-> Weekly", async () => {
      const req = {
        user: { id: "507f1f77bcf86cd799439011" },
        params: { id: "act1" },
        body: { minutesToAdd: 30 },
      };
      const res = mockResponse();

      const mockActivity = {
        _id: "act1",
        userId: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
        activityName: "Yoga",
        taskType: "Daily",
        date: new Date(),
      };

      Activity.findById.mockResolvedValue(mockActivity);
      Activity.updateMany.mockResolvedValue({});

      await updateActivityProgress(req, res);

      expect(Activity.updateMany).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/synced/i),
        })
      );
    });
  });

  // ------------------------------------------------------------
  describe("getActivitySummary", () => {
    test("should return daily and weekly summary", async () => {
      const req = { user: { id: "507f1f77bcf86cd799439011" } };
      const res = mockResponse();

      Activity.find.mockResolvedValue([
        { targetMinutes: 60, durationMinutes: 30 },
      ]);

      await getActivitySummary(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          data: expect.objectContaining({
            daily: expect.any(Object),
            weekly: expect.any(Object),
          }),
        })
      );
    });
  });

  // ------------------------------------------------------------
  describe("getFeedback", () => {
    test("should return progress and screen time data", async () => {
      const req = { user: { id: "507f1f77bcf86cd799439011" } };
      const res = mockResponse();

      Activity.find.mockResolvedValue([
        { targetMinutes: 60, durationMinutes: 60 },
      ]);
      ScreenTime.find.mockResolvedValue([
        { deviceType: "phone", durationMinutes: 120 },
      ]);

      await getFeedback(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          data: expect.objectContaining({
            daily: expect.any(Object),
            weekly: expect.any(Object),
          }),
        })
      );
    });
  });
});
