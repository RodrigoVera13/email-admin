import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import { ManifiestoItem, CompanyGroup } from "../types";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
  const [showOnlySelected, setShowOnlySelected] = useState(false);


  const filteredCompanies = useMemo(() => {
    const bySearchTerm = companies.filter(
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

    if (showOnlySelected) {
      return bySearchTerm.filter(company => selectedCompanies.has(company.id));
    }

    return bySearchTerm;
  }, [companies, searchTerm, showOnlySelected, selectedCompanies]);

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
          fetch(`${API_BASE_URL}/api_noti_clientes.php`),
        ]);

        if (!manifiestoResponse.ok) throw new Error("Error al obtener manifiestos");
        if (!dbClientsResponse.ok) throw new Error("Error al obtener clientes de la BD");

        const manifiestoData = await manifiestoResponse.json();
        const dbClients: DbClient[] = await dbClientsResponse.json();
        
        const dbClientsMap = new Map(dbClients.map(c => [c.ruc, c]));
        const groupedData = groupByCompany(manifiestoData);
        const initialSelected = new Set<string>();

        // --- LÓGICA CORRECTA ---
        const companiesWithDbData = groupedData.map(company => {
          const dbClient = dbClientsMap.get(company.ruc);

          // Primero, verificamos si la empresa existe en la base de datos
          if (dbClient) {
            // Si existe, SIEMPRE asignamos su email
            const updatedCompany = { ...company, email: dbClient.email || "" };
            
            // DE FORMA SEPARADA, decidimos si debe estar seleccionada
            if (dbClient.flag_activo === 1) {
              initialSelected.add(company.id);
            }
            
            return updatedCompany;
          }
          
          // Si la empresa no está en la BD, se retorna sin cambios
          return company;
        });

        setManifiestos(manifiestoData);
        setCompanies(companiesWithDbData);
        setSelectedCompanies(initialSelected);

        toast.info(`Datos cargados. ${initialSelected.size} empresas activas.`);
      } catch (error) {
        console.error("Error:", error);
        toast.error("No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();saveSelectedToDatabase 
  }, [groupByCompany]); 

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSelectCompany = useCallback((companyId: string) => {
    setSelectedCompanies((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(companyId)) {
        newSelected.delete(companyId);
      } else {
        newSelected.add(companyId);
      }
      return newSelected;
    });
  }, []);

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
      toast.error("El email es requerido");
      return;
    }
    setSavingEmails(prev => new Set(prev).add(companyId));
    try {
      const response = await fetch(`${API_BASE_URL}/api_noti_clientes.php`, {
        method: 'PUT', // Usamos PUT para esta acción específica
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruc: companyId, nombre: companyName, email: email })
      });

      if (!response.ok) throw new Error('Error al guardar el email.');

      toast.success(`Email para ${companyName} guardado exitosamente.`);
    } catch (error) {
      console.error("Error:", error);
      toast.error(`No se pudo guardar el email para ${companyName}.`);
    } finally {
      setSavingEmails(prev => {
        const newSet = new Set(prev);
        newSet.delete(companyId);
        return newSet;
      });
    }
  }, [toast]);

  const sendToCompany = useCallback(
    async (ruc: string, companyName: string, email: string) => {
      // 1. Mostramos un toast de carga inicial
      const toastId = toast.loading(`📨 Iniciando envío para: ${companyName}`, {
        description: "Conectando con el servidor...",
      });

      try {
        const baseUrl = "https://www.node.miranda-soft.com.pe/notificaciones/verificar_estado.php";
        const response = await fetch(`${baseUrl}?ruc=${ruc}&email=${email}`);

        if (!response.body) {
          throw new Error("El servidor no proporcionó una respuesta válida.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        // 2. Bucle para leer el stream de datos
        while (true) {
          const { done, value } = await reader.read();

          // Si el stream ha terminado, salimos del bucle.
          // La notificación de éxito o error ya se habrá mostrado.
          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          // Un chunk puede contener varios eventos, los separamos
          const events = chunk.split('\n\n').filter(e => e.startsWith('data: '));

          for (const event of events) {
            try {
              // Extraemos y parseamos el JSON del evento
              const data = JSON.parse(event.replace('data: ', ''));

              // 3. Lógica para mostrar el toast correcto según el tipo de mensaje
              if (data.tipo === 'exito') {
                // Si es el mensaje de éxito, actualizamos el toast a "success"
                toast.success(`✅ Envío a ${companyName} completado`, {
                  id: toastId,
                  description: data.mensaje, // <-- Usamos el mensaje del servidor
                });
              } else if (data.tipo !== 'finalizado') {
                // Para cualquier otro tipo (info, progreso), actualizamos el de carga
                toast.loading(`Procesando: ${companyName}`, {
                  id: toastId,
                  description: data.mensaje || `${data.manifiesto} → ${data.estado || ''} (${data.conteo || ''})`,
                });
              }
              // Ignoramos el mensaje de tipo "finalizado" para no sobreescribir el de éxito

            } catch (e) {
              // Ignoramos errores si un chunk de JSON llega incompleto
            }
          }
        }
      } catch (error) {
        console.error("Error durante el envío:", error);
        // Si algo falla, actualizamos el toast para mostrar un mensaje de error
        toast.error(`❌ Error en envío a ${companyName}`, {
          id: toastId,
          description: "No se pudo completar el proceso. Revisa la consola para más detalles.",
        });
      }
    },
    [], // Ya no se necesita `toast` como dependencia
  );

  // --- LÓGICA DE ENVÍO MASIVO  ---

  const sendNotifications = useCallback(async ({ flag, rucs = '', type = 'general' }) => {
    setSending(true);
    const toastId = toast.loading(`Iniciando envío para: ${type}...`, {
      description: "Conectando con el servidor...",
    });

    try {
      const baseUrl = "https://www.node.miranda-soft.com.pe/notificaciones/verificar_estado.php";
      const response = await fetch(`${baseUrl}?ruc=&email=&flag=${flag}`);

      if (!response.ok || !response.body) {
        throw new Error("El servidor no proporcionó una respuesta válida.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let finalMessage = "El proceso finalizó sin un mensaje de confirmación.";
      let hasSucceeded = false;

      // Leemos el stream hasta el final
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const events = chunk.split('\n\n').filter(e => e.startsWith('data: '));

        for (const event of events) {
          try {
            const data = JSON.parse(event.replace('data: ', ''));
            // Actualizamos el toast de carga con el progreso
            if (data.mensaje) {
              toast.loading(`Enviando a ${type}`, {
                id: toastId,
                description: data.mensaje
              });
            }
            // Guardamos el último mensaje de éxito o finalización
            if (data.tipo === 'exito' || data.tipo === 'finalizado') {
              finalMessage = data.mensaje;
              hasSucceeded = true;
            }
          } catch (e) { /* Ignorar errores de parseo de chunks incompletos */ }
        }
      }

      // Mostramos el toast final con el último mensaje guardado
      if (hasSucceeded) {
        toast.success("Envío completado", {
          id: toastId,
          description: finalMessage,
        });
      } else {
        throw new Error(finalMessage);
      }

    } catch (error: any) {
      console.error("Error en el envío masivo:", error);
      toast.error("Error en el envío", {
        id: toastId,
        description: error.message || "No se pudo completar el proceso.",
      });
    } finally {
      setSending(false);
    }
  }, []);

  const sendToActiveClients = useCallback(() => {
    // Flag 1: Envía a los clientes marcados como activos en la BD
    sendNotifications({ flag: 1, type: 'Clientes Activos' });
  }, [sendNotifications]);

  const sendToSelectedClients = useCallback(() => {
    // Flag 2: Envía solo a los RUCs seleccionados en la UI
    const rucs = Array.from(selectedCompanies).join(',');
    sendNotifications({ flag: 2, rucs, type: 'Clientes Seleccionados' });
  }, [sendNotifications, selectedCompanies]);

  const sendToAll = useCallback(() => {
    // Flag 3: Envía a todos los clientes sin distinción
    sendNotifications({ flag: 3, type: 'Todos los Clientes' });
  }, [sendNotifications]);

  const saveSelectedToDatabase = useCallback(async () => {
    if (filteredCompanies.length === 0) {
      toast.error("Sin cambios", {
        description: "No hay empresas en la lista para guardar."
      }); return;
    }

    setSaving(true);
    try {
      // Preparamos el payload con todas las empresas visibles y los RUCs de las seleccionadas.
      const payload = {
        companies: filteredCompanies,
        selectedRucs: Array.from(selectedCompanies),
      };

      const response = await fetch(`${API_BASE_URL}/api_noti_clientes.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la respuesta del servidor');
      }

      toast.success("Guardado Exitoso", {
        description: "Los cambios han sido guardados en la base de datos.",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Error al Guardar", {
        description: error.message || "No se pudo guardar la selección.",
      });
    } finally {
      setSaving(false);
    }
  }, [filteredCompanies, selectedCompanies, toast]);
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
    sendToActiveClients,
    sendToSelectedClients,
    sendToAll,
    saveSelectedToDatabase,
    showOnlySelected,
    setShowOnlySelected,
  };
}