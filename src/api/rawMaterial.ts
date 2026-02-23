import type { AxiosError } from 'axios';
import api from './axiosConfig';

export async function createRawMaterial(rawMaterialData: unknown) {
  try {
    const response = await api.post(`/raw-material`, rawMaterialData);
    return response.data;
  } catch (error: unknown) {
    console.error(
      'Error creating raw material:',
      (error as AxiosError).response?.data,
    );
    throw error; // Repassa para o handleCreate tratar
  }
}

export async function listRawMaterials() {
  try {
    const response = await api.get('/raw-material');
    return response.data;
  } catch (error: unknown) {
    console.error(
      'Error fetching raw materials:',
      (error as AxiosError).response?.data,
    );
    throw error;
  }
}

export async function updateRawMaterial(
  rawMaterialID: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawMaterialData: any,
) {
  try {
    const response = await api.put(
      `/raw-material/${rawMaterialID}`,
      rawMaterialData,
    );
    return response.data;
  } catch (error: unknown) {
    console.error(
      'Error updating raw material:',
      (error as AxiosError).response?.data,
    );
    throw error; // Repassa para o handleUpdate tratar
  }
}

export async function deleteRawMaterial(id: string) {
  try {
    const response = await api.delete(`/raw-material/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.error(
      'Error deleting raw material:',
      (error as AxiosError).response?.data,
    );
    throw error;
  }
}
