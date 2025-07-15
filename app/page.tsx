"use client";

import type React from "react";
import { Card, CardContent } from "../components/ui/card";
import { Loader2 } from "lucide-react";
import Header from "./components/Header";
import FilterActions from "./components/FilterActions";
import DashboardStats from "./components/DashboardStats";
import CompanyList from "./components/CompanyList";
import { useEmailAdmin } from "./hooks/useEmailAdmin";

export default function EmailAdminPage() {
  const {
    loading,
    filteredCompanies,
    selectedCompanies,
    savingEmails,
    sending,
    saving,
    searchTerm,
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
      verifyingRuc,
    verifyCompanyNumerados,
  } = useEmailAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-muted-foreground">Cargando manifiestos...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 isolate">
     <div className="max-w-screen-2xl mx-auto space-y-6">
        <Header totalRegistros={stats.totalRegistros} />
        <FilterActions
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSelectAll={handleSelectAll}
          onSaveSelected={saveSelectedToDatabase}
           showOnlySelected={showOnlySelected}
    onShowOnlySelectedChange={setShowOnlySelected}
          onSendToActive={sendToActiveClients}
          onSendToSelected={sendToSelectedClients}
          onSendToAll={sendToAll}
          saving={saving}
          sending={sending}
          selectedCount={selectedCompanies.size}
          filteredCount={filteredCompanies.length}
          isAllSelected={selectedCompanies.size === filteredCompanies.length && filteredCompanies.length > 0}
        />
        <DashboardStats
          totalRegistros={stats.totalRegistros}
          filtrados={stats.filtrados}
          seleccionados={stats.seleccionados}
          totalManifiestos={stats.totalManifiestos}
        />
        <CompanyList
          companies={filteredCompanies}
          selectedCompanies={selectedCompanies}
          savingEmails={savingEmails}
          onSelectCompany={handleSelectCompany}
          onToggleExpansion={toggleCompanyExpansion}
          onSendToCompany={sendToCompany}
          onEmailChange={handleEmailChange}
          onSaveEmail={saveCompanyEmail}
           verifyingRuc={verifyingRuc}
          onVerifyCompany={verifyCompanyNumerados}
        />
      </div>
    </div>
  );
}