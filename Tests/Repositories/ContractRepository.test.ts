import { IContractRepository } from "../core/interfaces/IContracts.ts";
import { ContractRepository } from "./ContractRepository.ts";
import { Contract } from "../core/models/Contract.ts";
import { pool } from "../adapters/config/config.ts";
import { RowDataPacket } from "mysql2";
import { ContractStatus } from "../core/interfaces/enum.ts";
import { _null } from "zod/v4/core";

// Mock do módulo de conexão com o banco
jest.mock("../../src/adapters/config/config", () => ({
  pool: {
    execute: jest.fn(),
  },
}));

describe("ContractRepository", () => {
  let repository: ContractRepository;

  beforeEach(() => {
    repository = new ContractRepository();
    jest.clearAllMocks();
  });

describe("save", () => {
    it("should insert a new contract and return it with an ID", async () => {
      const { ACTIVE } = ContractStatus;
      const newContract = new Contract( 1, "1a", 100, 1, 1, 500.00, new Date("2020-02-02"), null, ACTIVE, null);

// O mysql2 retorna [dados, campos]. Simulamos isso com [[{insertId: 1}], []]
      const mockResult = [{ insertId: 1 }, []] as [any, RowDataPacket[]];

        (pool.execute as jest.Mock).mockResolvedValue(mockResult);

// VALIDAÇÃO: Verifica se o SQL contém o comando e se o ARRAY de valores está correto
        const result = await repository.save(newContract);

        expect(pool.execute).toHaveBeenCalledWith(

        expect.stringContaining("INSERT INTO Contract"),
          [
            newContract.contractCode,
            newContract.clientId,
            newContract.serviceId,
            newContract.quantity,
            newContract.unitPrice,
            newContract.startDate,
            newContract.endDate,
            newContract.status,
            newContract.observation,
          ]

      );
// VERIFICAÇÃO FINAL: O ID retornado deve ser o mockado
      expect(result.id).toBe(1);
})});

describe("findById", () => {
    it("should return a Contract instance if Id is found", async () => {
    const mockRow = { id: 1, contract_code: 10, client_id: 1, service_id: 1, quantity: 5, unit_price: 500.00, start_date: new Date("2020-02-02"), end_date: null, status: "ACTIVE", observation: "bla bla bla" };
    // O mysql2 retorna [rows, fields]. Mockamos o primeiro como array de objetos.
    (pool.execute as jest.Mock).mockResolvedValue([[mockRow], []]); 

    const result = await repository.findById(1);

    // Verificações
    expect(result).toBeInstanceOf(Contract);
    
    // IMPORTANTE: Verifique se seu repository converte 'contract_code' do banco para 'contractCode' da classe
    expect(result?.contractCode).toBe("10"); 
    expect(result?.id).toBe(1);

    expect(pool.execute).toHaveBeenCalledWith(
      expect.stringContaining("SELECT * FROM contract WHERE id = ?"),
      [1]
    );
  });

  it("should return null if contract is not found", async () => {
    // Simula o banco retornando um array vazio de linhas
    (pool.execute as jest.Mock).mockResolvedValue([[], []]);

    const result = await repository.findById(999);

    expect(result).toBeNull();
  });
});

describe("findByCode", () => {
    it("should return a Contract instance if a Code is found", async () => {
    const mockRow = { id: 2, contract_code: 5, client_id: 1, service_id: 1, quantity: 5, unit_price: 500.00, start_date: new Date("2020-02-02"), end_date: null, status: "ACTIVE", observation: "bla bla bla" };
    // O mysql2 retorna [rows, fields]. Mockamos o primeiro como array de objetos.

    (pool.execute as jest.Mock).mockResolvedValue([[mockRow]]); 

        const result = await repository.findByCode("5");

// Verificações
    expect(result).toBeInstanceOf(Contract);
    
    // IMPORTANTE: Verifique se seu repository converte 'contract_code' do banco para 'contractCode' da classe
    expect(result?.contractCode).toBe("5"); 
    expect(result?.id).toBe(1);

    expect(pool.execute).toHaveBeenCalledWith(
      expect.stringContaining("SELECT * FROM contract WHERE contract_code = ?"),
      ["5"]
    );
  });
    });
    });


describe("findByClientId", () => {
    it("should return a Contract instance if a ClientId is found", async () => {
    const mockRow = { id: 3, contract_code: 500, client_id: 15, service_id: 2, quantity: 1, unit_price: 1500.00, start_date: new Date("2020-02-27"), end_date: null, status: "ACTIVE", observation: "bla bla bla" };
     
      (pool.execute as jest.Mock).mockResolvedValue([[mockRow], []]); 
        
    const repository = new ContractRepository();
    const result = await repository.findByClientId(15);
    const contract = result[0];

     expect(contract).toBeInstanceOf(Contract);
    expect(contract.contractCode).toBe("500"); 
    expect(contract.id).toBe(3);

    expect(pool.execute).toHaveBeenCalledWith(
      expect.stringContaining("SELECT * FROM contract WHERE client_id = ?"),
      [15]
    );
  });
});


describe("delete", () => {
    it("should delete a contract by ID", async () => {
    const mockRows = [
      { id: 1, contract_code: 10, client_id: 1, service_id: 1, quantity: 5, unit_price: 500.00, start_date: new Date("2020-02-02"), end_date: null, status: "ACTIVE", observation: "bla bla bla" },
      { id: 2, contract_code: 20, client_id: 2, service_id: 2, quantity: 10, unit_price: 1000.00, start_date: new Date("2020-03-03"), end_date: null, status: "INACTIVE", observation: "ble ble ble" },
    ];
    (pool.execute as jest.Mock).mockResolvedValue([[mockRows]]);
    const repository = new ContractRepository(); 
    await repository.delete(1);
    expect(pool.execute).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM contract WHERE id = ?"),
      [1]
    );
  }
    );
});

describe("listAll", () => {
    it("should return an array of Contracts", async () => {
    const mockRows = [
      { id: 1, contract_code: 10, client_id: 1, service_id: 1, quantity: 5, unit_price: 500.00, start_date: new Date("2020-02-02"), end_date: null, status: "ACTIVE", observation: "bla bla bla" },
      { id: 2, contract_code: 20, client_id: 2, service_id: 2, quantity: 10, unit_price: 1000.00, start_date: new Date("2020-03-03"), end_date: null, status: "INACTIVE", observation: "foo bar" },
    ];
    (pool.execute as jest.Mock).mockResolvedValue([mockRows, []]);
    const repository = new ContractRepository();
    const result = await repository.listAll();
    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(Contract);
    expect(result[1]).toBeInstanceOf(Contract);
    expect(pool.execute).toHaveBeenCalledWith(
      expect.stringContaining("SELECT * FROM contract")
    );
  }
    );
});