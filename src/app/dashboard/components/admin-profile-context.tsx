"use client";

import { createContext, useContext } from "react";

const AdminProfileContext = createContext<string>("");

export function AdminProfileProvider({
  adminName,
  children,
}: {
  adminName: string;
  children: React.ReactNode;
}) {
  return (
    <AdminProfileContext.Provider value={adminName}>
      {children}
    </AdminProfileContext.Provider>
  );
}

export function useAdminName() {
  return useContext(AdminProfileContext);
}