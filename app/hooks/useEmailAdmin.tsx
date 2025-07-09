import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useToast } from "../../components/ui/use-toast";
import { ManifiestoItem, CompanyGroup } from "../types";


interface DbClient {
  ruc: string;
  description: string;
  email: string | null;
  flag_activo: number;
}
export function useEmailAdmin() {
  const [manifiestos, setManifiestos] = useState<ManifiestoItem[]>([]);
  const [companies, setCompanies] = useState<CompanyGroup[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [savingEmails, setSavingEmails] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredCompanies = useMemo(() => {
    if (!searchTerm) return companies;

    return companies.filter(
      (company) =>
        company.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.ruc.includes(searchTerm) ||
        company.manifiestos.some(
          (m) =>
            m.MANIFIESTO.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.DES_NAVE.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.NROBLM.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    );
  }, [companies, searchTerm]);

  const stats = useMemo(
    () => ({
      totalRegistros: companies.length,
      filtrados: filteredCompanies.length,
      seleccionados: selectedCompanies.size,
      totalManifiestos: manifiestos.length,
    }),
    [companies.length, filteredCompanies.length, selectedCompanies.size, manifiestos.length],
  );

  const groupByCompany = useCallback((data: ManifiestoItem[]): CompanyGroup[] => {
    const grouped = data.reduce(
      (acc, item) => {
        const key = item.RUC_FFW;
        if (!acc[key]) {
          acc[key] = {
            id: key,
            ruc: item.RUC_FFW,
            nombre: item.DES_FFW,
            cantidadManifiestos: 0,
            manifiestos: [],
            isExpanded: false,
            email: "",
          };
        }
        acc[key].manifiestos.push(item);
        acc[key].cantidadManifiestos = acc[key].manifiestos.length;
        return acc;
      },
      {} as Record<string, CompanyGroup>,
    );

    return Object.values(grouped).sort((a, b) => b.cantidadManifiestos - a.cantidadManifiestos);
  }, []);

  // -- LÓGICA DE CARGA INICIAL ACTUALIZADA --
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [manifiestoResponse, dbClientsResponse] = await Promise.all([
          fetch("https://msoftperu.azurewebsites.net/home/GetManifiestoNumerado?strRuc="),
          fetch("/api/Clientes"),
        ]);

        if (!manifiestoResponse.ok) throw new Error("Error al obtener manifiestos");
        if (!dbClientsResponse.ok) throw new Error("Error al obtener clientes de la BD");

        const manifiestoData = await manifiestoResponse.json();
        const dbClients: DbClient[] = await dbClientsResponse.json();

        // Un mapa para buscar clientes de la BD por RUC fácilmente
        const dbClientsMap = new Map(dbClients.map(c => [c.ruc, c]));

        const groupedData = groupByCompany(manifiestoData);
        const initialSelected = new Set<string>();

        // Mapeamos los datos agrupados para integrar la información de la BD
        const companiesWithDbData = groupedData.map(company => {
          const dbClient = dbClientsMap.get(company.ruc);
          if (dbClient) {
            // Si el cliente está activo (1), lo añadimos a la selección inicial
            if (dbClient.flag_activo === 1) {
              initialSelected.add(company.id);
            }
            // Retornamos la empresa con el email de la BD
            return { ...company, email: dbClient.email || "" };
          }
          return company; // Si no está en la BD, la retornamos como está
        });

        setManifiestos(manifiestoData);
        setCompanies(companiesWithDbData);
        setSelectedCompanies(initialSelected);

        toast({
          title: "Datos Cargados",
          description: `Se encontraron ${groupedData.length} empresas. ${initialSelected.size} activas.`,
        });
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error de Carga",
          description: "No se pudieron cargar los datos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [groupByCompany, toast]);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

const handleSelectCompany = useCallback((companyId: string) => {
        const newSelectedCompanies = new Set(selectedCompanies);
        const isCurrentlySelected = newSelectedCompanies.has(companyId);
        if (isCurrentlySelected) {
            newSelectedCompanies.delete(companyId);
        } else {
            newSelectedCompanies.add(companyId);
        }
        setSelectedCompanies(newSelectedCompanies);
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(async () => {
            const newStatus = !isCurrentlySelected ? 1 : 0;
            try {
                const response = await fetch('/api/Clientes/status', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ruc: companyId, flag_activo: newStatus }),
                });

                if (!response.ok) {
                    throw new Error('No se pudo actualizar el estado.');
                }
            } catch (error) {
                toast({
                    title: "Error de Sincronización",
                    description: "No se pudo guardar el último cambio.",
                    variant: "destructive",
                });
                console.error("Error updating company status:", error);
            }
        }, 500); 

    }, [selectedCompanies, toast]);

  const handleSelectAll = useCallback(() => {
    setSelectedCompanies((prev) => {
      if (prev.size === filteredCompanies.length) {
        return new Set();
      } else {
        return new Set(filteredCompanies.map((company) => company.id));
      }
    });
  }, [filteredCompanies]);

  const toggleCompanyExpansion = useCallback((companyId: string) => {
    setCompanies((prev) =>
      prev.map((company) => (company.id === companyId ? { ...company, isExpanded: !company.isExpanded } : company)),
    );
  }, []);

  const handleEmailChange = useCallback((companyId: string, email: string) => {
    setCompanies((prev) => prev.map((company) => (company.id === companyId ? { ...company, email } : company)));
  }, []);

  const saveCompanyEmail = useCallback(async (companyId: string, email: string, companyName: string) => {
    if (!email.trim()) {
      toast({ title: "Email requerido", variant: "destructive" });
      return;
    }
    setSavingEmails(prev => new Set(prev).add(companyId));
    try {
      const response = await fetch('/api/Clientes', {
        method: 'PUT', // Usamos PUT para esta acción específica
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruc: companyId, nombre: companyName, email: email })
      });

      if (!response.ok) throw new Error('Error al guardar el email.');

      toast({
        title: "Email Guardado",
        description: `Email ${email} guardado para ${companyName}.`,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: `No se pudo guardar el email para ${companyName}.`,
        variant: "destructive",
      });
    } finally {
      setSavingEmails(prev => {
        const newSet = new Set(prev);
        newSet.delete(companyId);
        return newSet;
      });
    }
  }, [toast]);

  const sendToCompany = useCallback(
    async (ruc: string, companyName: string) => {
      try {
        const baseUrl = "https://www.node.miranda-soft.com.pe/notificaciones/verificar_estado.php";
        const response = await fetch(`${baseUrl}?ruc=${ruc}`);

        if (response.ok) {
          toast({
            title: "Enviado exitosamente",
            description: `Notificación enviada a ${companyName}`,
          });
        } else {
          throw new Error("Error en el envío");
        }
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: `Error al enviar notificación a ${companyName}`,
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  const sendToAllClients = useCallback(async () => {
    try {
      setSending(true);
      const baseUrl = "https://www.node.miranda-soft.com.pe/notificaciones/verificar_estado.php";
      const response = await fetch(`${baseUrl}?ruc=`);

      if (response.ok) {
        toast({
          title: "Enviado exitosamente",
          description: `Notificaciones enviadas a todos los clientes`,
        });
      } else {
        throw new Error("Error en el envío");
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Error al enviar las notificaciones",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }, [toast]);

  const saveSelectedToDatabase = useCallback(async () => {
  
    const companiesToSave = companies.filter(company => selectedCompanies.has(company.id));

    if (companiesToSave.length === 0) {
      toast({
        title: "Sin selección",
        description: "No hay empresas seleccionadas para guardar.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Enviamos solo el array de empresas seleccionadas.
      const response = await fetch('/api/Clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companiesToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la respuesta del servidor');
      }

      toast({
        title: "Guardado Exitoso",
        description: `${companiesToSave.length} empresas han sido guardadas como activas.`,
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error al Guardar",
        description: error.message || "No se pudo guardar la selección.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [companies, selectedCompanies, toast]);
  return {
    manifiestos,
    companies,
    selectedCompanies,
    savingEmails,
    loading,
    sending,
    saving,
    searchTerm,
    filteredCompanies,
    stats,
    setSearchTerm,
    handleSelectCompany,
    handleSelectAll,
    toggleCompanyExpansion,
    handleEmailChange,
    saveCompanyEmail,
    sendToCompany,
    sendToAllClients,
    saveSelectedToDatabase,
  };
}