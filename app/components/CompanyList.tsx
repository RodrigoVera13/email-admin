import { ScrollArea } from "../../components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { AlertCircle } from "lucide-react";
import CompanyItem from "./CompanyItem";
import { CompanyGroup } from "../types";

interface CompanyListProps {
  companies: CompanyGroup[];
  selectedCompanies: Set<string>;
  savingEmails: Set<string>;
  onSelectCompany: (id: string) => void;
  onToggleExpansion: (id: string) => void;
  onSendToCompany: (ruc: string, name: string, email: string) => void;
  onEmailChange: (companyId: string, email: string) => void;
  onSaveEmail: (companyId: string, email: string, companyName: string) => void;
    verifyingRuc: string | null;
  onVerifyCompany: (ruc: string) => void;
}

export default function CompanyList({
  companies,
  selectedCompanies,
  savingEmails,
  onSelectCompany,
  onToggleExpansion,
  onSendToCompany,
  onEmailChange,
  onSaveEmail,
    verifyingRuc,
  onVerifyCompany,
}: CompanyListProps) {
  return (
    <Card className="relative z-10">
      <CardHeader>
        <CardTitle>Lista de Manifiestos</CardTitle>
        <CardDescription>Selecciona los elementos a los que deseas enviar notificaciones</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-2">
            {companies.map((company) => (
              <CompanyItem
                key={company.id}
                company={company}
                isSelected={selectedCompanies.has(company.id)}
                onSelect={onSelectCompany}
                onToggleExpansion={onToggleExpansion}
                onSendToCompany={onSendToCompany}
                onEmailChange={onEmailChange}
                onSaveEmail={onSaveEmail}
                savingEmails={savingEmails}
                  isVerifying={verifyingRuc === company.ruc}
                onVerify={onVerifyCompany}
              />
            ))}

            {companies.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-muted-foreground">No se encontraron registros</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}