import { UserService } from "../../src/services/UserService";
import { User } from "../../src/core/models/User";
import { IUserRepository } from "../../src/core/interfaces/IUsers";

/**
 * Inline repository mock
 * Must fully implement IUserRepository
 */
const makeUserRepositoryMock = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  listAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn()
});

describe("UserService", () => {
  let repo: jest.Mocked<IUserRepository>;
  let service: UserService;

  beforeEach(() => {
    repo = makeUserRepositoryMock();
    service = new UserService(repo);
  });

  describe("register", () => {
    it("should register a new user", async () => {
      repo.findByEmail.mockResolvedValue(null);

      const savedUser = new User(
        1,
        "test@email.com",
        "hashed-password",
        "EMPLOYEE"
      );

      repo.save.mockResolvedValue(savedUser);

      const result = await service.register({
        email: "test@email.com",
        password: "123456"
      });

      expect(repo.findByEmail).toHaveBeenCalledWith("test@email.com");
      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual(savedUser);
    });

    it("should throw error if email already exists", async () => {
      repo.findByEmail.mockResolvedValue({} as User);

      await expect(
        service.register({
          email: "test@email.com",
          password: "123456"
        })
      ).rejects.toThrow("User with this email already exists.");
    });
  });

  describe("getById", () => {
    it("should return user without password", async () => {
      const user = new User(
        1,
        "test@email.com",
        "hashed-password",
        "EMPLOYEE"
      );

      repo.findById.mockResolvedValue(user);

      const result = await service.getById(1);

      expect(result).toEqual(
        new User(1, "test@email.com", "", "EMPLOYEE")
      );
    });

    it("should return null if user not found", async () => {
      repo.findById.mockResolvedValue(null);

      const result = await service.getById(1);

      expect(result).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return users without passwords", async () => {
      const users = [
        new User(1, "a@email.com", "hash1", "EMPLOYEE"),
        new User(2, "b@email.com", "hash2", "EMPLOYEE")
      ];

      repo.listAll.mockResolvedValue(users);

      const result = await service.getAll();

      expect(result).toEqual([
        new User(1, "a@email.com", "", "EMPLOYEE"),
        new User(2, "b@email.com", "", "EMPLOYEE")
      ]);
    });
  });

  describe("update", () => {
    it("should update user email", async () => {
      const user = new User(
        1,
        "old@email.com",
        "hash",
        "EMPLOYEE"
      );

      repo.findById.mockResolvedValue(user);
      repo.save.mockResolvedValue(user);

      const result = await service.update(1, {
        email: "new@email.com"
      });

      expect(result.email).toBe("new@email.com");
      expect(repo.save).toHaveBeenCalledWith(user);
    });

    it("should update user password", async () => {
      const user = new User(
        1,
        "test@email.com",
        "old-hash",
        "EMPLOYEE"
      );

      repo.findById.mockResolvedValue(user);
      repo.save.mockResolvedValue(user);

      await service.update(1, {
        password: "new-password"
      });

      expect(user.passwordHash).toBe("new-password");
    });

    it("should throw error if user not found", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.update(1, { email: "x@email.com" })
      ).rejects.toThrow("User not found.");
    });
  });

  describe("delete", () => {
    it("should delete user", async () => {
      repo.findById.mockResolvedValue({} as User);
      repo.delete.mockResolvedValue();

      await service.delete(1);

      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it("should throw error if user does not exist", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow(
        "User not found."
      );
    });
  });
});
