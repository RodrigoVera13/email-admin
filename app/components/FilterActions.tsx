import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { Search, Plus, Send, Loader2 } from "lucide-react";

interface FilterActionsProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSelectAll: () => void;
  onSaveSelected: () => void;
  onSendToAll: () => void;
  saving: boolean;
  sending: boolean;
  selectedCount: number;
  filteredCount: number;
  isAllSelected: boolean;
}

export default function FilterActions({
  searchTerm,
  onSearchTermChange,
  onSelectAll,
  onSaveSelected,
  onSendToAll,
  saving,
  sending,
  selectedCount,
  filteredCount,
  isAllSelected,
}: FilterActionsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por FFW, RUC, manifiesto, nave o BL..."
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onSelectAll} disabled={filteredCount === 0}>
              {isAllSelected ? "Deseleccionar Todo" : "Seleccionar Todo"}
            </Button>
            <Button
              onClick={onSaveSelected}
              disabled={saving || selectedCount === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Filtrados
                </>
              )}
            </Button>
            <Button onClick={onSendToAll} disabled={sending} className="bg-blue-600 hover:bg-blue-700">
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar a Clientes
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}