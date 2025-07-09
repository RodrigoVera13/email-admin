// app/components/FilterActions.tsx
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { Search, Plus, Send, Loader2 } from "lucide-react";

interface FilterActionsProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSelectAll: () => void;
  onSaveSelected: () => void;
  onSendToActive: () => void;
  onSendToSelected: () => void;
  onSendToAll: () => void;
  saving: boolean;
  sending: boolean;
  selectedCount: number;
  filteredCount: number;
  isAllSelected: boolean;
  showOnlySelected: boolean;
  onShowOnlySelectedChange: (value: boolean) => void;
}

// 2. Asegúrate de que las props se estén recibiendo en los parámetros de la función
export default function FilterActions({
  searchTerm,
  onSearchTermChange,
  onSelectAll,
  onSaveSelected,
  onSendToActive,
  onSendToSelected,
  onSendToAll,
  saving,
  sending,
  selectedCount,
  filteredCount,
  isAllSelected,
  showOnlySelected,
  onShowOnlySelectedChange,
}: FilterActionsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
           <div className="relative flex-1 w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
            placeholder="Buscar por FFW, RUC, manifiesto, nave o BL..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-10"
        />
    </div>
    <div className="flex items-center space-x-2">
        <Checkbox
            id="show-selected"
            checked={showOnlySelected}
            onCheckedChange={onShowOnlySelectedChange}
        />
        <Label htmlFor="show-selected" className="text-sm font-medium">
            Mostrar solo seleccionados
        </Label>
    </div>
          </div>

          <div className="flex gap-2 flex-wrap justify-end">
            <Button variant="outline" onClick={onSelectAll} disabled={filteredCount === 0}>
              {isAllSelected ? "Deseleccionar" : "Seleccionar Todo"}
            </Button>
            <Button
              onClick={onSaveSelected}
              disabled={saving || selectedCount === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Actualizar
            </Button>
            
            {/* --- BOTONES DE ENVÍO MODIFICADOS --- */}
            <Button onClick={onSendToActive} disabled={sending} className="bg-blue-600 hover:bg-blue-700">
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Enviar a Clientes
            </Button>
            <Button onClick={onSendToSelected} disabled={sending || selectedCount === 0} className="bg-orange-500 hover:bg-orange-600">
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Enviar a Seleccionados
            </Button>
            <Button onClick={onSendToAll} disabled={sending} className="bg-red-600 hover:bg-red-700">
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Enviar a Todos
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}