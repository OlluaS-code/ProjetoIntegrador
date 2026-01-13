import { ClientRepository } from "./ClientRepository";
import { Client } from "../core/models/Client";
import { pool } from "../adapters/config/config";
import { RowDataPacket } from 'mysql2';

// Mock do módulo de conexão com o banco
jest.mock("../../src/adapters/config/config", () => ({
  pool: {
    execute: jest.fn(),
  },
}));

describe("ClientRepository", () => {
  let repository: ClientRepository;

  beforeEach(() => {
    repository = new ClientRepository();
    jest.clearAllMocks();
  });

  describe("save", () => {
    it("should insert a new client and return it with an ID", async () => {
      const newClient = new Client(null, 123, "Nick", "Company", "123456");
      const mockResult = [{ insertId: 1 }];
      
      (pool.execute as jest.Mock).mockResolvedValue(mockResult);

      const result = await repository.save(newClient);

      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO client"),
        [123, "Nick", "Company", "123456"]
      );
      expect(result.id).toBe(1);
    });

    it("should update an existing client", async () => {
      const existingClient = new Client(1, 123, "Nick", "Company", "123456");
      (pool.execute as jest.Mock).mockResolvedValue([{}]);

      const result = await repository.save(existingClient);

      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE client SET"),
        [123, "Nick", "Company", "123456", 1]
      );
      expect(result).toBe(existingClient);
    });
  });

  describe("findById", () => {
    it("should return a Client instance if found", async () => {
      const mockRow = { id: 1, code: 10, nickname: "N", company_name: "C", cnpj: "123" };
      (pool.execute as jest.Mock).mockResolvedValue([[mockRow]]);

      const result = await repository.findById(1);

      expect(result).toBeInstanceOf(Client);
      expect(result?.nickname).toBe("N");
    });

    it("should return null if no client is found", async () => {
      (pool.execute as jest.Mock).mockResolvedValue([[]]);

      const result = await repository.findById(99);

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should execute delete query with correct ID", async () => {
      (pool.execute as jest.Mock).mockResolvedValue([{}]);

      await repository.delete(5);

      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM client"),
        [5]
      );
    });
  });

  describe("findByCnpj", () => {
    it("should return a Client instance if found by CNPJ", async () => {
      const mockRow = { id: 2, code: 20, nickname: "NN", company_name: "testfindbycnpj", cnpj: "99999999999999" };
      (pool.execute as jest.Mock).mockResolvedValue([[mockRow]]);

      const result = await repository.findByCnpj("99999999999999");

      expect(result).toBeInstanceOf(Client);
      expect(result?.cnpj).toBe("99999999999999");
  });
});

  describe("findByCode", () => {
    it("should return a Client instance if found by code", async () => {
      const mockRow = { id: 3, code: 30, nickname: "NNN", company_name: "testfindbycode", cnpj: "88888888888888" };
      (pool.execute as jest.Mock).mockResolvedValue([[mockRow]]);

      const result = await repository.findByCode(30);

      expect(result).toBeInstanceOf(Client);
      expect(result?.code).toBe(30);
    });
  });

  describe("listAll", () => {
    it("should return an array of Client objects", async () => {
      const mockRows = [
        { id: 1, code: 1, nickname: "A", company_name: "CA", cnpj: "11" },
        { id: 2, code: 2, nickname: "B", company_name: "CB", cnpj: "22" }
      ];
      (pool.execute as jest.Mock).mockResolvedValue([mockRows]);

      const result = await repository.listAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Client);
      expect(result[1].nickname).toBe("B");
    });
  });
});