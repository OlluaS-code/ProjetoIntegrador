import { ServiceService } from "../../src/services/ServiceService";
import { Service } from "../../src/core/models/Service";
import { IServiceRepository } from "../../src/core/interfaces/IService";

/**
 * Inline repository mock
 * IMPORTANT: must implement the entire IServiceRepository interface
 */
const makeServiceRepositoryMock = (): jest.Mocked<IServiceRepository> => ({
  findById: jest.fn(),
  findByCode: jest.fn(),
  listAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn()
});

describe("ServiceService", () => {
  let repo: jest.Mocked<IServiceRepository>;
  let serviceService: ServiceService;

  beforeEach(() => {
    repo = makeServiceRepositoryMock();
    serviceService = new ServiceService(repo);
  });

  describe("create", () => {
    it("should create a new service", async () => {
      repo.findByCode.mockResolvedValue(null);

      const savedService = new Service(
        1,
        "Hosting",
        "HOST",
        99.9
      );

      repo.save.mockResolvedValue(savedService);

      const result = await serviceService.create({
        name: "Hosting",
        code: "HOST",
        defaultPrice: 99.9
      });

      expect(repo.findByCode).toHaveBeenCalledWith("HOST");
      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual(savedService);
    });

    it("should throw error if service code already exists", async () => {
      repo.findByCode.mockResolvedValue({} as Service);

      await expect(
        serviceService.create({
          name: "Hosting",
          code: "HOST"
        })
      ).rejects.toThrow("Service with this code already exists.");
    });
  });

  describe("getById", () => {
    it("should return a service", async () => {
      const service = {} as Service;
      repo.findById.mockResolvedValue(service);

      const result = await serviceService.getById(1);

      expect(result).toBe(service);
    });
  });

  describe("getAll", () => {
    it("should return all services", async () => {
      const services = [{} as Service, {} as Service];
      repo.listAll.mockResolvedValue(services);

      const result = await serviceService.getAll();

      expect(result).toEqual(services);
    });
  });

  describe("update", () => {
    it("should update service fields", async () => {
      const service = new Service(
        1,
        "Old Name",
        "OLD",
        50
      );

      repo.findById.mockResolvedValue(service);
      repo.findByCode.mockResolvedValue(null);
      repo.save.mockResolvedValue(service);

      const result = await serviceService.update(1, {
        name: "New Name",
        code: "NEW",
        defaultPrice: 120
      });

      expect(result.name).toBe("New Name");
      expect(result.code).toBe("NEW");
      expect(result.defaultPrice).toBe(120);
      expect(repo.save).toHaveBeenCalledWith(service);
    });

    it("should throw error if service not found", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        serviceService.update(99, { name: "Test" })
      ).rejects.toThrow("Service not found.");
    });

    it("should throw error if new code is already in use", async () => {
      const service = new Service(
        1,
        "Old Name",
        "OLD",
        null
      );

      repo.findById.mockResolvedValue(service);
      repo.findByCode.mockResolvedValue({} as Service);

      await expect(
        serviceService.update(1, { code: "NEW" })
      ).rejects.toThrow("Service code already in use.");
    });
  });

  describe("delete", () => {
    it("should delete service", async () => {
      repo.findById.mockResolvedValue({} as Service);
      repo.delete.mockResolvedValue();

      await serviceService.delete(1);

      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it("should throw error if service does not exist", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(serviceService.delete(1)).rejects.toThrow(
        "Service not found."
      );
    });
  });
});
