// Representa o uso da matéria-prima em um produto específico
export interface MaterialUsageDTO {
  productName: string;
  productCode: string;
}

// Representa a resposta da API para Matéria-Prima
export interface RawMaterialResponseDTO {
  id?: string;
  code: string;
  name: string;
  stockQuantity: number;
  quantityNeeded?: number;
  usedInProducts?: MaterialUsageDTO[];
}

// DTO para enviar na criação ou atualização
export interface CreateUpdateRawMaterialDTO {
  code: string;
  name: string;
  stockQuantity: number;
}
