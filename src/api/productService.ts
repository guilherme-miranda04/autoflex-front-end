// /* eslint-disable @typescript-eslint/no-explicit-any */
import type { ProductMaterialResponseDTO } from '@/types/product.interface';
import type { RawMaterialResponseDTO } from '@/types/raw-material.interface';
import type { AxiosError } from 'axios';
import api from './axiosConfig';

export async function createProduct(productData: unknown) {
  try {
    const response = await api.post(`/product`, productData);

    return response.data;
  } catch (error: unknown) {
    console.error(
      'Error creating product:',
      (error as AxiosError).response?.data,
    );
    throw error;
  }
}

export async function listProducts() {
  try {
    const response = await api.get('/product');

    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

export async function updateProduct(
  productID: string | undefined,
  productData: unknown,
) {
  try {
    const response = await api.put(`/product/${productID}`, productData);

    return response.data;
  } catch (error: unknown) {
    console.error(
      'Error updating product:',
      (error as AxiosError).response?.data,
    );
    throw error;
  }
}

export async function deleteProduct(productID: string) {
  try {
    const response = await api.delete(`/product/${productID}`);

    return response.data;
  } catch (error: unknown) {
    console.error(
      'Error deleting product:',
      (error as AxiosError).response?.data,
    );
    throw error;
  }
}

// Raw Material in Product:

export async function createRawMaterialInProduct(
  productID: string | undefined,
  productData: RawMaterialResponseDTO[],
  existingMaterials: ProductMaterialResponseDTO[] = [],
) {
  try {
    const onlyNewMaterials = productData.filter(
      (newMat) =>
        !existingMaterials.some((oldMat) => oldMat.materialID === newMat.id),
    );

    if (onlyNewMaterials.length === 0) {
      console.info('Nenhum material novo para adicionar.');
      return null;
    }

    const promises = onlyNewMaterials.map((material) =>
      api.post(`/product/${productID}/raw-material`, {
        materialID: material.id,
        quantityNeeded: material.stockQuantity,
      }),
    );

    const responses = await Promise.all(promises);
    return responses.map((r) => r.data);
  } catch (error: unknown) {
    console.error(
      'Error create raw-material in product:',
      (error as AxiosError).response?.data,
    );
    throw Error;
  }
}

export async function updateRawMaterialInProduct(
  productID: string | undefined,
  productData: RawMaterialResponseDTO[], // O que está na tela (atual)
  existingMaterials: ProductMaterialResponseDTO[] = [], // O que veio do banco
) {
  try {
    // Identificar o que deve ser ADICIONADO
    const onlyNewMaterials = productData.filter(
      (newMat) =>
        !existingMaterials.some((oldMat) => oldMat.materialID === newMat.id),
    );

    const createPromise = onlyNewMaterials.map((material) =>
      api.post(`/product/${productID}/raw-material`, {
        materialID: material.id,
        quantityNeeded: material.stockQuantity,
      }),
    );

    const changedMaterials = productData.filter((newMat) => {
      const isExisting = existingMaterials.find(
        (oldMat) => oldMat.materialID === newMat.id,
      );
      return (
        isExisting &&
        Number(newMat.stockQuantity) !== Number(isExisting.quantityNeeded)
      );
    });

    // Executa as Atualizações
    const updatePromise = changedMaterials.map((mat) =>
      api.put(`/product/${productID}/raw-material/${mat.id}`, {
        quantityNeeded: mat.stockQuantity,
      }),
    );

    await Promise.all([createPromise, updatePromise]);

    return true;
  } catch (error: unknown) {
    console.error(
      'Error updating composition:',
      (error as AxiosError).response?.data,
    );
    throw error;
  }
}

export async function deleteRawMaterialInProduct(
  productID: string,
  materialID: string,
) {
  try {
    const response = await api.delete(
      `/product/${productID}/raw-material/${materialID}`,
    );
    return response.data;
  } catch (error: unknown) {
    console.error(
      'Error to delete a raw-material in product',
      (error as AxiosError).response?.data,
    );
    throw Error;
  }
}

export async function getProduction() {
  try {
    const response = await api.get('/product/production-suggestion');
    return response.data;
  } catch (error: unknown) {
    console.error(
      'Error ao buscar o Production:',
      (error as AxiosError).response?.data,
    );
    throw Error;
  }
}
