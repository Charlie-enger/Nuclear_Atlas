import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import AppHeader from "@/components/AppHeader";
import CompareTray from "@/components/CompareTray";
import { CompareProvider } from "@/lib/compare";
import Programs from "@/pages/Programs";
import Workforce from "@/pages/Workforce";
import Compare from "@/pages/Compare";
import Sources from "@/pages/Sources";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <CompareProvider>
      <div className="min-h-screen bg-page atomic-grid">
        <AppHeader />
        <Routes>
          <Route path="/" element={<Programs />} />
          <Route path="/workforce" element={<Workforce />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="*" element={<Programs />} />
        </Routes>
        <CompareTray />
      </div>
      <Toaster richColors />
    </CompareProvider>
  );
}
