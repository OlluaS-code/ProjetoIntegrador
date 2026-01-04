import { ContractService } from "../../src/services/ContractService";
import { Contract } from "../../src/core/models/Contract";
import { IContractRepository } from "../../src/core/interfaces/IContracts";
import { ContractStatus } from "../../src/core/interfaces/enum";

/**
 * Inline repository mock
 */
const makeContractRepositoryMock = (): jest.Mocked<IContractRepository> => ({
  findById: jest.fn(),
  findByCode: jest.fn(),
  findByClientId: jest.fn(),
  listAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn()
});

describe("ContractService", () => {
  let repo: jest.Mocked<IContractRepository>;
  let service: ContractService;

  beforeEach(() => {
    repo = makeContractRepositoryMock();
    service = new ContractService(repo);
  });

  describe("create", () => {
    it("should create a new contract", async () => {
      repo.findByCode.mockResolvedValue(null);

      const savedContract = new Contract(
        1,
        "CTR-001",
        10,
        20,
        5,
        100,
        new Date("2024-01-01"),
        null,
        ContractStatus.ACTIVE,
        null
      );

      repo.save.mockResolvedValue(savedContract);

      const result = await service.create({
        contractCode: "CTR-001",
        clientId: 10,
        serviceId: 20,
        quantity: 5,
        unitPrice: 100,
        startDate: new Date("2024-01-01"),
        status: ContractStatus.ACTIVE
      });

      expect(repo.findByCode).toHaveBeenCalledWith("CTR-001");
      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual(savedContract);
    });

    it("should throw error if contract code already exists", async () => {
      repo.findByCode.mockResolvedValue({} as Contract);

      await expect(
        service.create({
          contractCode: "CTR-001",
          clientId: 10,
          serviceId: 20,
          quantity: 5,
          unitPrice: 100,
          startDate: new Date(),
          status: ContractStatus.ACTIVE
        })
      ).rejects.toThrow("Contract with this code already exists.");
    });
  });

  describe("update", () => {
    it("should update contract fields", async () => {
      const contract = new Contract(
        1,
        "CTR-001",
        10,
        20,
        5,
        100,
        new Date("2024-01-01"),
        null,
        ContractStatus.ACTIVE,
        null
      );

      repo.findById.mockResolvedValue(contract);
      repo.save.mockResolvedValue(contract);

      const result = await service.update(1, {
        quantity: 10,
        unitPrice: 120,
        observation: "Updated contract"
      });

      expect(result.quantity).toBe(10);
      expect(result.unitPrice).toBe(120);
      expect(result.observation).toBe("Updated contract");
      expect(repo.save).toHaveBeenCalledWith(contract);
    });

    it("should throw error if contract not found", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.update(99, { quantity: 10 })
      ).rejects.toThrow("Contract not found.");
    });
  });

  describe("getById", () => {
    it("should return a contract", async () => {
      const contract = {} as Contract;
      repo.findById.mockResolvedValue(contract);

      const result = await service.getById(1);

      expect(result).toBe(contract);
    });
  });

  describe("getAll", () => {
    it("should return all contracts", async () => {
      const contracts = [{} as Contract, {} as Contract];
      repo.listAll.mockResolvedValue(contracts);

      const result = await service.getAll();

      expect(result).toEqual(contracts);
    });
  });

  describe("delete", () => {
    it("should delete a contract", async () => {
      repo.findById.mockResolvedValue({} as Contract);
      repo.delete.mockResolvedValue();

      await service.delete(1);

      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it("should throw error if contract does not exist", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow(
        "Contract not found."
      );
    });
  });
});
