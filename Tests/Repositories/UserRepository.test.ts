import { IUserRepository } from '../core/interfaces/IUsers.ts';
import { User } from '../core/models/User.ts';
import { pool } from '../adapters/config/config.ts';
import * as bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2';
import { UserRepository } from './UserRepository.ts';
import { email } from 'zod/v4';


// Mock do módulo de conexão com o banco
jest.mock("../../src/adapters/config/config", () => ({
  pool: {
    execute: jest.fn(),
  },
}));

describe("UserRepository", () => {
  let repository: UserRepository;

  beforeEach(() => {
    repository = new UserRepository();
    jest.clearAllMocks();
  });

  // TODOS os testes devem ficar aqui dentro para reconhecer o 'repository'

  describe("save", () => {
    it("should insert a new user and return it with an ID", async () => {
      const newUser = new User(null, "bla@bla.com.br", "123456", "EMPLOYEE");
      const mockResult = [{ insertId: 100 }, []];
      (pool.execute as jest.Mock).mockResolvedValue(mockResult);

      const result = await repository.save(newUser);

      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO User"),
        [newUser.email, newUser.passwordHash, newUser.role]
      );
      expect(result.id).toBe(100);
    })});

  describe("findById", () => {
    it("should return a User instance if Id is found", async () => {
      const mockRow = { id: 120, email: "lou@email.com", password_hash: "hashed_password", role: "EMPLOYEE" };
      (pool.execute as jest.Mock).mockResolvedValue([[mockRow], []]);

      const result = await repository.findById(120);
      
      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe("lou@email.com");
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT id, email, password_hash, role FROM user WHERE id = ?"),
        [120]
      )});
  });

  describe("findByEmail", () => {
    it("should return a User instance if Email is found", async () => {
      const mockRow = { id: 130, email: "rods@email.com", password_hash: "hashed_password", role: "EMPLOYEE" };
      (pool.execute as jest.Mock).mockResolvedValue([[mockRow], []]);

      const result = await repository.findByEmail("rods@email.com");

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe(130);
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT id, email, password_hash, role FROM user WHERE email = ?"),
        ["rods@email.com"]
      )});
  });

  describe("delete", () => {
    it("should delete a user by Id", async () => {
      const mockResultSetHeader = { affectedRows: 1 };
      (pool.execute as jest.Mock).mockResolvedValue([mockResultSetHeader, []]);

      await repository.delete(130);

      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM user WHERE id = ?"),
        [130]
      )});
  });

  describe("listAll", () => {
    it("should return an array of User instances", async () => {
      const mockRows = [
        { id: 1000, email: "karol@email.com.br", password_hash: "hashed1", role: "EMPLOYEE" },
        { id: 2000, email: "saulo@email.com", password_hash: "hashed2", role: "EMPLOYEE" }
      ];
      (pool.execute as jest.Mock).mockResolvedValue([mockRows, []]);

      const result = await repository.listAll();

      // Ajustado para bater com o tamanho do mockRows (2 itens)
      expect(result.length).toBe(2);
      expect(result[0]).toBeInstanceOf(User);
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT id, email, password_hash, role FROM user")
      )});
  });
}); 

