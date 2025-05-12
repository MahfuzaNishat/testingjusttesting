import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { jest } from "@jest/globals";

// Mock Firebase
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: "testUser123" },
  })),
  signInWithEmailAndPassword: jest.fn(),
  setPersistence: jest.fn(),
  browserLocalPersistence: {},
}));

jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(),
  ref: jest.fn(),
  get: jest.fn(),
}));

describe("Firebase Authentication Tests", () => {
  let auth, database;

  beforeEach(() => {
    initializeApp.mockClear();
    auth = getAuth();
    database = getDatabase();
  });

  test("should successfully sign in user", async () => {
    const userCredentialMock = { user: { uid: "testUser123" } };
    signInWithEmailAndPassword.mockResolvedValue(userCredentialMock);

    const email = "test@example.com";
    const password = "password123";

    await expect(signInWithEmailAndPassword(auth, email, password)).resolves.toEqual(userCredentialMock);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, email, password);
  });

  test("should fetch user data and redirect properly", async () => {
    const snapshotMock = {
      exists: () => true,
      val: () => ({ resumeUploaded: false, careerInfoCompleted: false }),
    };
    get.mockResolvedValue(snapshotMock);

    const userRef = ref(database, "users/testUser123");
    await expect(get(userRef)).resolves.toEqual(snapshotMock);
    expect(get).toHaveBeenCalledWith(userRef);
  });

  test("should handle login failure", async () => {
    const errorMessage = "Invalid email or password";
    signInWithEmailAndPassword.mockRejectedValue(new Error(errorMessage));

    const email = "wrong@example.com";
    const password = "wrongpassword";

    await expect(signInWithEmailAndPassword(auth, email, password)).rejects.toThrow(errorMessage);
  });
});
