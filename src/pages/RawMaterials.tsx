import {
  createRawMaterial,
  deleteRawMaterial,
  listRawMaterials,
  updateRawMaterial,
} from '@/api/rawMaterial';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { RawMaterialResponseDTO } from '@/types/raw-material.interface';
import { motion } from 'framer-motion';
import { Layers, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function RawMaterialsPage() {
  const [search, setSearch] = useState('');
  const [rawMaterials, setRawMaterials] = useState<RawMaterialResponseDTO[]>(
    [],
  );
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [stockQuantity, setStockQuantity] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RawMaterialResponseDTO | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortByCode = (list: any) =>
    [...list].sort((a, b) => {
      const codeA = parseInt(a.code.replace(/\D/g, ''));
      const codeB = parseInt(b.code.replace(/\D/g, ''));

      return codeA - codeB;
    });

  useEffect(() => {
    async function fetchData() {
      try {
        const prodData = await listRawMaterials();

        setRawMaterials(sortByCode(prodData));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load initial data.');
      }
    }

    fetchData();
  }, []);

  const filtered = rawMaterials.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.code?.toLowerCase().includes(search.toLowerCase()),
  );

  function openCreate() {
    setEditing(null);
    setCode('');
    setName('');
    setStockQuantity(0);
    setDialogOpen(true);
  }

  function openEdit(mat: RawMaterialResponseDTO) {
    setEditing(mat);
    setCode(mat.code);
    setName(mat.name);
    setStockQuantity(mat.stockQuantity);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    const materialToRemove = rawMaterials.find((r) => r.id === id);
    const materialName = materialToRemove?.name || 'Material';

    try {
      toast.promise(deleteRawMaterial(id), {
        loading: 'Removing Raw Material...',
        success: () => {
          setRawMaterials(rawMaterials.filter((mat) => mat.id !== id));

          return `Raw Material ${materialName} removed!`;
        },
        error: (err) =>
          err.response?.data?.message ||
          'Error deleting raw-material in product.',
      });
    } catch (error) {
      console.error('Error deleting raw material:', error);
    }
  }

  async function handleSave() {
    if (!name.trim() || !code.trim()) return;

    const codeUppercase = code.toUpperCase();

    const rawMaterialPayload = { code: codeUppercase, name, stockQuantity };

    try {
      if (editing) {
        toast.promise(updateRawMaterial(editing.id || '', rawMaterialPayload), {
          loading: 'Updating Raw Material...',
          success: (data) => {
            setRawMaterials((prev) =>
              prev.map((mat) => (mat.id === data.id ? data : mat)),
            );

            setDialogOpen(false);

            setCode('');
            setName('');
            setStockQuantity(0);
            return `${data.name} successfully updated!`;
          },
          error: (err) => {
            toast.error('Failed to update raw material. Please try again.');
            const errorMsg =
              err.response?.data?.message || 'Error on update raw material';
            return `Error: ${errorMsg}`;
          },
        });
      } else {
        toast.promise(createRawMaterial(rawMaterialPayload), {
          loading: 'Saving Raw Material...',
          success: (data) => {
            setRawMaterials((prev) => [...prev, data]);

            setCode('');
            setName('');
            setStockQuantity(0);

            setDialogOpen(false);
            return `${data.name} successfully created!`;
          },
          error: (err) => {
            toast.error('Failed to create raw material. Please try again.');
            const errorMsg =
              err.response?.data?.message || 'Error on create raw material';
            return `Error: ${errorMsg}`;
          },
        });
      }
    } catch (error) {
      toast.error('Failed to save raw material. Please try again.');
      console.error('Error saving raw material:', error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl md:text-3xl font-bold tracking-tight">
            <Layers className="w-7 h-7 text-primary" />
            Raw Materials
          </h1>
          <p className="text-muted-foreground mt-2">Manage raw material.</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Raw Material
        </Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search raw materials..."
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
                <TableHead className="text-muted-foreground">
                  Stock Quantity
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
                    className="text-center py-12 text-muted-foreground"
                  >
                    No Raw Materials found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((mat, i) => {
                  return (
                    <motion.tr
                      key={mat.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="p-4 font-mono text-muted-foreground">
                        #{mat.code}
                      </TableCell>
                      <TableCell className="font-medium">{mat.name}</TableCell>
                      <TableCell className="font-semibold">
                        {mat.stockQuantity.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-2 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(mat)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(mat.id || '')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Raw Material' : 'New Raw Material'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: RAW-000"
              />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Raw Material name"
              />
            </div>
            <div className="space-y-2">
              <Label>Stock Quantity</Label>
              <Input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                placeholder="Stock quantity"
                min="0"
              />
            </div>
          </div>
          <DialogFooter>
            {' '}
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim() || !code.trim() || stockQuantity < 0}
            >
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
