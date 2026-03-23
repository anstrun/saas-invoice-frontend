import { Routes, Route, Navigate } from "react-router-dom";
import InvoicePage from "@/features/invoices/pages/InvoicePage";
import NotFound from "@/pages/NotFound";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<InvoicePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
