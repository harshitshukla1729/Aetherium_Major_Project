import { jest } from "@jest/globals";

// ------------------------------------------------------------
// MOCK SETUP
// ------------------------------------------------------------

const mockUser = {
  _id: "507f1f77bcf86cd799439011",
  email: "test@example.com",
  password: "hashedpassword",
  name: "John",
  username: "john123",
  createPasswordResetToken: jest.fn(),
  save: jest.fn(),
};

const User = {
  findOne: jest.fn(),
  create: jest.fn(),
};

const bcrypt = {
  hash: jest.fn(),
  compare: jest.fn(),
};

const jwt = {
  sign: jest.fn(),
};

const sendEmail = jest.fn();

const crypto = {
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue("hashedtoken123"),
  })),
};

// ------------------------------------------------------------
//  Register mocks BEFORE importing controller
// ------------------------------------------------------------

jest.unstable_mockModule("../models/userModel.js", () => ({
  default: User,
}));

jest.unstable_mockModule("bcrypt", () => ({
  ...bcrypt,
  default: bcrypt, //  ESM-compatible mock
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  ...jwt,
  default: jwt, //  ESM-compatible mock
}));

jest.unstable_mockModule("../utils/sendEmail.js", () => ({
  default: sendEmail,
}));

jest.unstable_mockModule("crypto", () => ({
  ...crypto,
  default: crypto, // ESM-compatible mock
}));

// ------------------------------------------------------------
//  Import controllers AFTER mocks are set
// ------------------------------------------------------------
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
} = await import("../controllers/authController.js");

// ------------------------------------------------------------
// Helper: Mock Express Response
// ------------------------------------------------------------
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ------------------------------------------------------------
//TEST SUITE
// ------------------------------------------------------------
describe("Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------------------------------------------
  describe("signup", () => {
    test("should register a new user successfully", async () => {
      const req = {
        body: {
          username: "john123",
          name: "John",
          email: "test@example.com",
          password: "password123",
        },
      };
      const res = mockResponse();

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedpassword");
      User.create.mockResolvedValue(mockUser);

      await signup(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          password: "hashedpassword",
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "User created" })
      );
    });

    test("should return 400 if user already exists", async () => {
      const req = { body: { email: "test@example.com" } };
      const res = mockResponse();

      User.findOne.mockResolvedValue(mockUser);

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "User already exists" })
      );
    });
  });

  // ------------------------------------------------------------
  describe("login", () => {
    test("should login successfully and return token", async () => {
      const req = {
        body: { email: "test@example.com", password: "password123" },
      };
      const res = mockResponse();

      User.findOne.mockResolvedValue({ ...mockUser });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("jwt-token");

      await login(req, res);

      expect(bcrypt.compare).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Login successful",
          token: "jwt-token",
        })
      );
    });

    test("should return 404 if user not found", async () => {
      const req = { body: { email: "notfound@example.com", password: "x" } };
      const res = mockResponse();

      User.findOne.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Invalid credentials" })
      );
    });

    test("should return 400 if password invalid", async () => {
      const req = { body: { email: "test@example.com", password: "wrongpass" } };
      const res = mockResponse();

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Invalid credentials" })
      );
    });
  });

  // ------------------------------------------------------------
  describe("forgotPassword", () => {
    test("should send reset link successfully", async () => {
      const req = { body: { email: "test@example.com" } };
      const res = mockResponse();

      mockUser.createPasswordResetToken.mockReturnValue("resettoken123");
      mockUser.save.mockResolvedValue(true);
      User.findOne.mockResolvedValue(mockUser);
      sendEmail.mockResolvedValue(true);

      await forgotPassword(req, res);

      expect(sendEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/reset link sent/i),
        })
      );
    });

    test("should return 404 if user not found", async () => {
      const req = { body: { email: "no@example.com" } };
      const res = mockResponse();

      User.findOne.mockResolvedValue(null);

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "User not found" })
      );
    });

    test("should handle email sending failure gracefully", async () => {
      const req = { body: { email: "test@example.com" } };
      const res = mockResponse();

      mockUser.createPasswordResetToken.mockReturnValue("resettoken123");
      mockUser.save.mockResolvedValue(true);
      User.findOne.mockResolvedValue(mockUser);
      sendEmail.mockRejectedValue(new Error("Email failed"));

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/error sending the email/i),
        })
      );
    });
  });

  // ------------------------------------------------------------
  describe("resetPassword", () => {
    test("should reset password successfully", async () => {
      const req = {
        params: { token: "rawtoken" },
        body: { password: "newpass123" },
      };
      const res = mockResponse();

      bcrypt.hash.mockResolvedValue("hashednewpass");
      User.findOne.mockResolvedValue(mockUser);
      mockUser.save.mockResolvedValue(true);

      await resetPassword(req, res);

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(mockUser.passwordResetToken).toBeUndefined();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Password reset successful!",
        })
      );
    });

    test("should return 400 if token invalid or expired", async () => {
      const req = { params: { token: "badtoken" }, body: {} };
      const res = mockResponse();

      User.findOne.mockResolvedValue(null);

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/invalid|expired/i),
        })
      );
    });
  });
});
