import { ClientService } from "../../src/services/ClientService";
import { Client } from "../../src/core/models/Client";
import { IClientRepository } from "../../src/core/interfaces/IClient";

/**
 * Inline repository mock
 */
const makeClientRepositoryMock = (): jest.Mocked<IClientRepository> => ({
  findById: jest.fn(),
  findByCnpj: jest.fn(),
  findByCode: jest.fn(),
  listAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn()
});

describe("ClientService", () => {
  let repo: jest.Mocked<IClientRepository>;
  let service: ClientService;

  beforeEach(() => {
    repo = makeClientRepositoryMock();
    service = new ClientService(repo);
  });

  describe("register", () => {
    it("should register a new client", async () => {
      repo.findByCnpj.mockResolvedValue(null);
      repo.findByCode.mockResolvedValue(null);

      const savedClient = new Client(
        1,
        123,
        "Nick",
        "Company",
        "123456789"
      );

      repo.save.mockResolvedValue(savedClient);

      const result = await service.register({
        code: 123,
        nickname: "Nick",
        companyName: "Company",
        cnpj: "123456789"
      });

      expect(repo.findByCnpj).toHaveBeenCalledWith("123456789");
      expect(repo.findByCode).toHaveBeenCalledWith(123);
      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual(savedClient);
    });

    it("should throw error if CNPJ already exists", async () => {
      repo.findByCnpj.mockResolvedValue({} as Client);

      await expect(
        service.register({
          nickname: "Nick",
          companyName: "Company",
          cnpj: "123"
        })
      ).rejects.toThrow("Client with this CNPJ already exists.");
    });
  });

  describe("update", () => {
    it("should update client data", async () => {
      const client = new Client(1, 10, "Old", "Old Co", "111");

      repo.findById.mockResolvedValue(client);
      repo.findByCnpj.mockResolvedValue(null);
      repo.findByCode.mockResolvedValue(null);
      repo.save.mockResolvedValue(client);

      const result = await service.update(1, {
        nickname: "New",
        companyName: "New Co"
      });

      expect(result.nickname).toBe("New");
      expect(result.companyName).toBe("New Co");
      expect(repo.save).toHaveBeenCalledWith(client);
    });

    it("should throw error if client not found", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.update(99, { nickname: "Test" })
      ).rejects.toThrow("Client not found.");
    });
  });

  describe("delete", () => {
    it("should delete client", async () => {
      repo.findById.mockResolvedValue({} as Client);
      repo.delete.mockResolvedValue();

      await service.delete(1);

      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it("should throw error if client does not exist", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow("Client not found.");
    });
  });
});
