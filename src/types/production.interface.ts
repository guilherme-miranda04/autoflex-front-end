// DTO para associar um material a um produto (POST /products/{id}/materials)
export interface AddRawMaterialToProductDTO {
  id: string; // ID da matéria-prima
  quantityNeeded: number;
}

// DTO para a sugestão de produção (GET /production-suggestion)
export interface ProductionSuggestionDTO {
  productID: string;
  productName: string;
  unitPrice: number;
  quantityPossible: number;
  totalValue: number;
}
