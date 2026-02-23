// Representa o insumo necessário dentro do produto
export interface ProductMaterialResponseDTO {
  materialID?: string;
  materialName: string;
  materialCode: string;
  quantityNeeded: number;
}

// Representa a resposta da API para Produto
export interface ProductResponseDTO {
  id?: string;
  code: string;
  name: string;
  price: number;
  materials?: ProductMaterialResponseDTO[];
}

// DTO para criar/atualizar Produto
export interface CreateUpdateProductDTO {
  code: string;
  name: string;
  price: number;
}
