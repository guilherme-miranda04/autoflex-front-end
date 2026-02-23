import {
  createProduct,
  createRawMaterialInProduct,
  deleteProduct,
  deleteRawMaterialInProduct,
  listProducts,
  updateProduct,
  updateRawMaterialInProduct,
} from '@/api/productService';
import { listRawMaterials } from '@/api/rawMaterial'; // Importação necessária
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ProductResponseDTO } from '@/types/product.interface';
import type { RawMaterialResponseDTO } from '@/types/raw-material.interface';
import { motion } from 'framer-motion';
import { Package, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<ProductResponseDTO[]>([]);

  // Estados para o Formulário
  const [productId, setProductId] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const [selectedMaterials, setSelectedMaterials] = useState<
    RawMaterialResponseDTO[]
  >([]);

  const [allRawMaterials, setAllRawMaterials] = useState<
    RawMaterialResponseDTO[]
  >([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductResponseDTO | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortByCode = (list: any[]) =>
    [...list].sort((a, b) => {
      const codeA = parseInt(a.code?.replace(/\D/g, '')) || 0;
      const codeB = parseInt(b.code?.replace(/\D/g, '')) || 0;
      return codeA - codeB;
    });

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodData, matData] = await Promise.all([
          listProducts(),
          listRawMaterials(),
        ]);
        setProducts(sortByCode(prodData));
        setAllRawMaterials(sortByCode(matData));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load initial data.');
      }
    }
    fetchData();
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toLowerCase().includes(search.toLowerCase()),
  );

  function openCreate() {
    setEditing(null);
    setName('');
    setCode('');
    setPrice('');
    setSelectedMaterials([]);
    setDialogOpen(true);
  }

  function openEdit(product: ProductResponseDTO) {
    setEditing(product);
    setName(product.name);
    setCode(product.code);
    setPrice(String(product.price));
    setProductId(product.id || '');
    const initialMaterials = product.materials
      ? product.materials.map((pm) => ({
          id: pm.materialID,
          name: pm.materialName,
          code: pm.materialCode,
          stockQuantity: pm.quantityNeeded,
          usedInProducts: [],
        }))
      : [];
    setSelectedMaterials(initialMaterials);
    setDialogOpen(true);
  }

  function addRawMaterial() {
    const available = allRawMaterials.find(
      (rm) => !selectedMaterials.some((selected) => selected.id === rm.id),
    );
    if (available) {
      setSelectedMaterials([
        ...selectedMaterials,
        { ...available, stockQuantity: 1 },
      ]);
    }
  }

  function removeRawMaterial(materialID: string, productID: string) {
    const materialToRemove = selectedMaterials.find((r) => r.id === materialID);
    const materialName = materialToRemove?.name || 'Material';

    try {
      toast.promise(deleteRawMaterialInProduct(productID, materialID), {
        loading: 'Deleting Raw Material...',
        success: () => {
          setProducts((prev) =>
            prev.map((prod) => {
              if (prod.id === productID) {
                return {
                  ...prod,
                  materials: prod.materials?.filter(
                    (m) => m.materialID !== materialID,
                  ),
                };
              }
              return prod;
            }),
          );

          setSelectedMaterials(
            selectedMaterials.filter((r) => r.id !== materialID),
          );
          setDialogOpen(false);
          return `Raw Material ${materialName} removed!`;
        },
        error: (err) =>
          err.response?.data?.message ||
          'Error deleting raw-material in product.',
      });
    } catch (error) {
      console.error('Error em Remover o Material Bruto:', error);
    }
  }

  function updateSelectedMaterial(
    index: number,
    field: 'id' | 'stockQuantity',
    val: string,
  ) {
    const updated = [...selectedMaterials];
    if (field === 'id') {
      const rm = allRawMaterials.find((r) => String(r.id) === val);
      if (rm) {
        updated[index] = { ...rm, stockQuantity: updated[index].stockQuantity };
      }
    } else {
      updated[index] = { ...updated[index], stockQuantity: Number(val) || 1 };
    }
    setSelectedMaterials(updated);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateGlobalState = (updatedData: any, isEditing: boolean) => {
    setProducts((prev) => {
      if (isEditing) {
        // Se editou, substitui o item antigo pelo novo com os materiais atuais
        return sortByCode(
          prev.map((p) =>
            p.id === updatedData.id
              ? { ...updatedData, materials: formatMaterialsForView() }
              : p,
          ),
        );
      }

      // Se criou, apenas adiciona no final
      return sortByCode([...prev, updatedData]);
    });
  };

  const formatMaterialsForView = () =>
    selectedMaterials.map((m) => ({
      materialID: m.id,
      materialCode: m.code,
      materialName: m.name,
      quantityNeeded: m.stockQuantity,
    }));

  async function handleSave() {
    if (!name.trim() || !price.trim() || !code.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    // Para garantir que o código mantenha o padrão.
    const codeUppercase = code.toUpperCase();

    const productPayload = { code: codeUppercase, name, price: Number(price) };
    const materialPayload = editing?.materials;

    try {
      if (editing) {
        const normalizeSelected = selectedMaterials.map((m) => ({
          materialID: m.id,
          materialName: m.name,
          materialCode: m.code,
          quantityNeeded: m.stockQuantity,
        }));

        const normalizeEditing = editing.materials?.map((m) => ({
          materialID: m.materialID,
          materialName: m.materialName,
          materialCode: m.materialCode,
          quantityNeeded: m.quantityNeeded,
        }));

        toast.promise(
          (async () => {
            // --- Modo Atualização do Produto & Criação/Atualização do RawMaterial dentro do produto ---
            const updatedProduct = await updateProduct(
              editing.id,
              productPayload,
            );

            const hasCompositionChanged =
              JSON.stringify(
                normalizeSelected.sort((a, b) =>
                  (a.materialID || '').localeCompare(b.materialID || ''),
                ),
              ) !==
              JSON.stringify(
                normalizeEditing?.sort((a, b) =>
                  (a.materialID || '').localeCompare(b.materialID || ''),
                ),
              );

            if (hasCompositionChanged && selectedMaterials.length > 0) {
              await updateRawMaterialInProduct(
                editing.id,
                selectedMaterials,
                editing.materials,
              );
            }

            return updatedProduct;
          })(),
          {
            loading: 'Atualizando produto e materiais...',
            success: (data) => {
              updateGlobalState(data, true);
              setDialogOpen(false);

              const hasCompositionChanged =
                JSON.stringify(
                  normalizeSelected.sort((a, b) =>
                    (a.materialID || '').localeCompare(b.materialID || ''),
                  ),
                ) !==
                JSON.stringify(
                  normalizeEditing?.sort((a, b) =>
                    (a.materialID || '').localeCompare(b.materialID || ''),
                  ),
                );

              if (selectedMaterials.length > 0 && hasCompositionChanged) {
                return 'Product and Raw-Materials updated!';
              } else {
                return `Product ${data.name} updated`;
              }
            },
            error: (err) => err.message || 'Erro na atualização.',
          },
        );
      } else {
        // --- MODO CRIAÇÃO ---
        toast.promise(
          (async () => {
            const newProduct = await createProduct(productPayload);

            if (selectedMaterials.length > 0) {
              const newRawMaterial = await createRawMaterialInProduct(
                newProduct.id,
                selectedMaterials,
                materialPayload,
              );

              return newRawMaterial;
            }

            return newProduct;
          })(),
          {
            loading: 'Criando produto...',
            success: (data) => {
              updateGlobalState(data, false);
              setDialogOpen(false);

              if (selectedMaterials.length > 0) {
                return `Product and Raw Material created`;
              } else {
                return `Product ${data.name} created!`;
              }
            },
            error: (err) => err.message || 'Erro ao criar produto.',
          },
        );
      }
    } catch (error) {
      console.error('Erro no salvamento:', error);
    }
  }

  async function handleDelete(id: string) {
    const productToRemove = products.find((r) => r.id === id);
    const productName = productToRemove?.name || 'Product';

    try {
      toast.promise(deleteProduct(id), {
        loading: 'Removing Product...',
        success: () => {
          setProducts(products.filter((p) => p.id !== id));

          return `Product ${productName} removed!`;
        },
        error: (err) => err.response?.data?.message || 'Error deleting product',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl md:text-3xl font-bold tracking-tight">
            <Package className="w-7 h-7 text-primary" />
            Products
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your product catalog and raw material compositions.
          </p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Product
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="p-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20 p-4 text-muted-foreground">
                  Code
                </TableHead>
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Price</TableHead>
                <TableHead className="text-muted-foreground">
                  Composition
                </TableHead>
                <TableHead className="w-28 p-4 text-muted-foreground text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((product, i) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="p-4 font-mono text-xs">
                      #{product.code}
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-blue-600 font-semibold">
                      $
                      {product.price.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.materials?.map((m) => (
                          <Badge
                            key={m.materialCode}
                            variant="secondary"
                            className="text-[10px]"
                          >
                            {m.materialName} x{m.quantityNeeded}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="py-2 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(product.id || '')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-description="DialogContent" className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Product' : 'New Product'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="PROD-001"
              />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* {editing && ( */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-base">Composition</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRawMaterial}
                disabled={selectedMaterials.length >= allRawMaterials.length}
              >
                <Plus className="h-3 w-3 mr-1" /> Add Material
              </Button>
            </div>

            {selectedMaterials.map((rm, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Select
                    value={String(rm.id)}
                    onValueChange={(v) =>
                      updateSelectedMaterial(index, 'id', v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {allRawMaterials.map((r) => {
                        // Verifica se esse material já está na lista de selecionados
                        const isAlreadySelected = selectedMaterials.some(
                          (s) => s.id === r.id,
                        );

                        return (
                          <SelectItem
                            key={r.id}
                            value={String(r.id)}
                            disabled={isAlreadySelected} // Desabilita se já foi escolhido
                          >
                            {r.name}
                            {isAlreadySelected ? '(Já adicionado)' : ''}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    min="1"
                    value={rm.stockQuantity}
                    onChange={(e) =>
                      updateSelectedMaterial(
                        index,
                        'stockQuantity',
                        e.target.value,
                      )
                    }
                  />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => removeRawMaterial(String(rm.id), productId)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          {/* )} */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
