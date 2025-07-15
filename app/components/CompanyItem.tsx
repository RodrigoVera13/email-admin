import type React from "react";
import { memo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Badge } from "../../components/ui/badge";
import { ShipWheel } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Collapsible, CollapsibleContent } from "../../components/ui/collapsible";
import { Loader2, Send, ChevronDown, ChevronRight, Save, SearchCode } from "lucide-react";
import { CompanyGroup } from "../types";


interface CompanyItemProps {
  company: CompanyGroup;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleExpansion: (id: string) => void;
   onSendToCompany: (ruc: string, name: string, email: string) => void; 
  onEmailChange: (companyId: string, email: string) => void;
  onSaveEmail: (companyId: string, email: string, companyName: string) => void;
  savingEmails: Set<string>;
  isVerifying: boolean;
  onVerify: (ruc: string) => void;
}

const CompanyItem = memo(
  ({
    company,
    isSelected,
    onSelect,
    onToggleExpansion,
    onSendToCompany,
    onEmailChange,
    onSaveEmail,
    savingEmails,
       isVerifying,
    onVerify,
  }: CompanyItemProps) => {
    const handleSelect = useCallback(() => {
      onSelect(company.id);
    }, [onSelect, company.id]);

    const handleToggleExpansion = useCallback(() => {
      onToggleExpansion(company.id);
    }, [onToggleExpansion, company.id]);

      const handleSend = useCallback(() => {
      onSendToCompany(company.ruc, company.nombre, company.email);
    }, [onSendToCompany, company.ruc, company.nombre, company.email]);

    const handleEmailChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onEmailChange(company.id, e.target.value);
      },
      [onEmailChange, company.id],
    );

    const handleSaveEmail = useCallback(() => {
      onSaveEmail(company.id, company.email, company.nombre);
    }, [onSaveEmail, company.id, company.email, company.nombre]);

     const handleVerify = useCallback(() => onVerify(company.ruc), [onVerify, company.ruc]);
    const isSavingEmail = savingEmails.has(company.id);

    return (
      <div className="border rounded-lg">
        <div
          className={`flex items-center justify-between p-4 transition-colors ${
            isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center space-x-4 flex-1">
            <Checkbox checked={isSelected} onCheckedChange={handleSelect} />

            <button
              onClick={handleToggleExpansion}
              className="flex items-center space-x-2 hover:text-blue-600 p-1"
            >
              {company.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Freight Forwarder</Label>
                  <p className="font-medium text-sm">{company.nombre}</p>
                  <p className="font-mono text-xs text-muted-foreground">{company.ruc}</p>
                </div>

                <div className="flex items-center gap-2 mx-4 flex-1 max-w-md">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Email de Notificaciones</Label>
                    <Input
                      type="email"
                      placeholder="email@empresa.com"
                      value={company.email}
                      onChange={handleEmailChange}
                      className="mt-1 text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleSaveEmail}
                    disabled={isSavingEmail || !company.email.trim()}
                    size="sm"
                    variant="outline"
                    className="mt-5 bg-transparent"
                  >
                    {isSavingEmail ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  </Button>
                </div>

                <div className="text-center">
                  <Badge variant="secondary" className="mb-2">
                    {company.cantidadManifiestos} Manifiestos
                  </Badge>
                </div>
              </div>
            </div>
          </div>

            <div className="flex flex-col gap-2 ml-4">
              <Button onClick={handleVerify} size="sm" variant="outline" disabled={isVerifying}>
                {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <SearchCode className="mr-2 h-4 w-4" />}
                Verificar
              </Button>
              <Button onClick={handleSend} size="sm">
                <Send className="mr-2 h-4 w-4" />
                Enviar
              </Button>
          </div>
        </div>

        <Collapsible open={company.isExpanded}>
          <CollapsibleContent>
            <div className="px-4 pb-4 border-t bg-gray-50">
              <div className="mt-4 space-y-2">
                {company.manifiestos.map((manifiesto, index) => (
<div 
                    key={`${manifiesto.MANIFIESTO}-${index}`} 
                    className={`grid grid-cols-6 gap-4 p-3 bg-white rounded border-l-4 text-sm ${
                      manifiesto.isNumerado === true
                        ? 'border-l-green-500' 
                        : manifiesto.isNumerado === false
                        ? 'border-l-red-500'  
                        : 'border-l-gray-300'  
                    }`}
                  >
                    <div>
                      <Label className="text-xs text-muted-foreground">Manifiesto</Label>
                      <p className="font-mono font-medium">{manifiesto.MANIFIESTO}</p>
                      <p className="text-xs text-muted-foreground">Aduana: {manifiesto.ADUANA} - Año: {manifiesto.ANIO}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Nave</Label>
                      <p className="font-medium">{manifiesto.DES_NAVE}</p>
                      <p className="text-xs text-muted-foreground">OMI: {manifiesto.OMI}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Ruta</Label>
                      <p>{manifiesto.POL} → {manifiesto.POD}</p>
                      <p className="text-xs text-muted-foreground">BL: {manifiesto.NROBLM}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">ETA / ATA</Label>
                      <p>{manifiesto.ETA}</p>
                      {manifiesto.ATA && <p className="text-green-600">{manifiesto.ATA}</p>}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Agente</Label>
                      <p className="text-xs">{manifiesto.DES_AGENTE}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Puerto Cercano</Label>
                      {manifiesto.PTO_CERCANO && manifiesto.PTO_CERCANO !== "NO" ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1">
                          <ShipWheel className="h-3 w-3"/> {manifiesto.PTO_CERCANO}
                        </Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  },
);

CompanyItem.displayName = "CompanyItem";

export default CompanyItem;