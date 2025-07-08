import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";

interface HeaderProps {
  totalRegistros: number;
}

export default function Header({ totalRegistros }: HeaderProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-6 w-6" />
              Administración de Correos Automáticos
            </CardTitle>
            <CardDescription>Gestiona el envío de notificaciones automáticas para manifiestos</CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            Empresas: {totalRegistros}
          </Badge>
        </div>
      </CardHeader>
    </Card>
  );
}