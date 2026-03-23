import { FileText } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-semibold text-foreground">Página no encontrada</h1>
        <p className="text-muted-foreground mt-2">La página que buscas no existe.</p>
      </div>
    </div>
  );
}