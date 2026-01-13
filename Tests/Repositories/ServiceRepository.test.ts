import { IServiceRepository } from '../core/interfaces/IService';
import { Service } from '../core/models/Service';
import { pool } from '../adapters/config/config';
import { RowDataPacket } from 'mysql2';
import { ServiceRepository } from './ServiceRepository';

// Mock do módulo de conexão com o banco
jest.mock("../../src/adapters/config/config", () => ({
  pool: {
    execute: jest.fn(),
  },
}));

describe("ServiceRepository", () => {
  let repository: ServiceRepository;

  beforeEach(() => {
    repository = new ServiceRepository();
    jest.clearAllMocks();
  });


describe("save", () => {
    it("should insert a new service and return it with an ID", async () => {
      const newService = new Service(null, "Teste do Service", "RVS001", 150.00);
        const mockResult = [{ insertId: 1 }, []] as [any, RowDataPacket[]];
        (pool.execute as jest.Mock).mockResolvedValue(mockResult);

        const result = await repository.save(newService);
        expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO service"),
          [
            newService.name,
            newService.code,
            newService.defaultPrice,
          ]    
    )})});

describe("findById", () => {
    it("should return a Service instance if a Id is found", async () => {
    const mockRow = { id: 100, name: "Teste do Service", code: "RVS001", default_price: 1000.00 };
      (pool.execute as jest.Mock).mockResolvedValue([[mockRow]]);
        const repository = new ServiceRepository();
        const result = await repository.findById(100);
    // Verificações
    expect(result).toBeInstanceOf(Service);
    expect(result?.id).toBe(100);
    expect(result?.name).toBe("Teste do Service");
    expect(result?.code).toBe("RVS001");
    expect(result?.defaultPrice).toBe(1000.00);
    expect(pool.execute).toHaveBeenCalledWith(
      expect.stringContaining("SELECT id, name, code, default_price FROM service WHERE id = ?"),
      [100]
    );
})});

describe("findByCode", () => {
    it("should return a Service instance if a Code is found", async () => {
    const mockRow = { id: 200, name: "O Outro Service", code: "RVS002", default_price: 200.00 };
      (pool.execute as jest.Mock).mockResolvedValue([[mockRow]]);
        const repository = new ServiceRepository();
        const result = await repository.findByCode("AS002");
    // Verificações
    expect(result).toBeInstanceOf(Service);
    expect(result?.id).toBe(200);
    expect(result?.name).toBe("O Outro Service");
    expect(result?.code).toBe("RVS002");
    expect(result?.defaultPrice).toBe(200.00);
    expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT id, name, code, default_price FROM service WHERE code = ?"),
        ["RVS002"]
    );
})});
});

describe("delete", () => {
    it("should delete a service by ID", async () => {
    const repository = new ServiceRepository(); 
    await repository.delete(1);
    expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM service WHERE id = ?"),
        [1]
    )})});

describe("listAll", () => {
    it("should return an array of Service instances", async () => {
    const mockRows = [
        { id: 150, name: "Service One", code: "LOU001", default_price: 150.00 },
        { id: 250, name: "Service Two", code: "LOU002", default_price: 250.00 },
    ];
    (pool.execute as jest.Mock).mockResolvedValue([mockRows]);
    const repository = new ServiceRepository();
    const result = await repository.listAll();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0]).toBeInstanceOf(Service);
    expect(result[0].id).toBe(150);
    expect(result[0].name).toBe("Service One");
    expect(result[0].code).toBe("LOU001");
    expect(result[0].defaultPrice).toBe(150.00);
    expect(result[1]).toBeInstanceOf(Service);
    expect(result[1].id).toBe(250);
    expect(result[1].name).toBe("Service Two");
    expect(result[1].code).toBe("LOU002");
    expect(result[1].defaultPrice).toBe(250.00);
    expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT id, name, code, default_price FROM service")
    )})});


