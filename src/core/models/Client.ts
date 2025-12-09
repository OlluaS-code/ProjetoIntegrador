import { BaseEntity } from './BaseEntity';

export class Client extends BaseEntity {
  constructor(
    id: string | null,
    tenantId: string,
    public code: number,
    public nickname: string,
    public companyName: string,
    private cnpj: string
  ) {
    super(id, tenantId);
  }
}