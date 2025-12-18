import { AuthenticateUserService } from "../../src/services/AuthenticateUserService";
import { IUserRepository } from "../../src/core/interfaces/IUsers";
import { User } from "../../src/core/models/User";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { config } from "../../src/adapters/config/config";

// =========================
// Mocks de libs externas
// =========================
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../src/adapters/config/config", () => ({
  config: {
    JWT: jest.fn()
  }
}));

// =========================
// Mock do repositório
// =========================
const userRepositoryMock: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
  save: jest.fn(),
  findById: jest.fn(),
  delete: jest.fn(),
  listAll: jest.fn(),
};

describe("AuthenticateUserService", () => {
  let service: AuthenticateUserService;

  beforeEach(() => {
    service = new AuthenticateUserService(userRepositoryMock);
    jest.clearAllMocks();
  });

  // =========================
  // Sucesso
  // =========================
  it("deve autenticar o usuário com credenciais válidas", async () => {
    // Arrange
    const fakeUser = new User(
      1,
      "teste@email.com",
      "hashed-password",
      "EMPLOYEE"
    );

    userRepositoryMock.findByEmail.mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (config.JWT as jest.Mock).mockReturnValue("jwt-secret");
    (jwt.sign as jest.Mock).mockReturnValue("fake-token");

    // Act
    const result = await service.execute(
      "teste@email.com",
      "123456"
    );

    // Assert
    expect(result.user.email).toBe("teste@email.com");
    expect(result.user).not.toHaveProperty("0");
    expect(result.token).toBe("fake-token");

    expect(userRepositoryMock.findByEmail)
      .toHaveBeenCalledWith("teste@email.com");
    expect(bcrypt.compare).toHaveBeenCalled();
    expect(jwt.sign).toHaveBeenCalled();
  });

  // =========================
  // Usuário não existe
  // =========================
  it("deve lançar erro se o usuário não existir", async () => {
    // Arrange
    userRepositoryMock.findByEmail.mockResolvedValue(null);

    // Act + Assert
    await expect(
      service.execute("x@email.com", "123")
    ).rejects.toThrow("Invalid credentials.");
  });

  // =========================
  // Senha inválida
  // =========================
  it("deve lançar erro se a senha for inválida", async () => {
    // Arrange
    const fakeUser = new User(
      1,
      "teste@email.com",
      "hashed-password",
      "EMPLOYEE"
    );

    userRepositoryMock.findByEmail.mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // Act + Assert
    await expect(
      service.execute("teste@email.com", "senha-errada")
    ).rejects.toThrow("Invalid credentials.");

    expect(bcrypt.compare).toHaveBeenCalled();
    expect(jwt.sign).not.toHaveBeenCalled();
  });
});
