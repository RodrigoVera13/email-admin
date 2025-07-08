import { Card, CardContent } from "@/components/ui/card";

interface DashboardStatsProps {
  totalRegistros: number;
  filtrados: number;
  seleccionados: number;
  totalManifiestos: number;
}

export default function DashboardStats({
  totalRegistros,
  filtrados,
  seleccionados,
  totalManifiestos,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{totalRegistros}</div>
          <p className="text-xs text-muted-foreground">Total Registros</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{filtrados}</div>
          <p className="text-xs text-muted-foreground">Filtrados</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{seleccionados}</div>
          <p className="text-xs text-muted-foreground">Seleccionados</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{totalManifiestos}</div>
          <p className="text-xs text-muted-foreground">Total Manifiestos</p>
        </CardContent>
      </Card>
    </div>
  );
}