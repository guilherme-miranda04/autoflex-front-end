import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Toaster } from 'sonner';
import Layout from './components/Layout';
import { TooltipProvider } from './components/ui/tooltip';
import NotFound from './pages/NotFound';
import ProductionPage from './pages/Production';
import ProductsPage from './pages/Products';
import RawMaterialsPage from './pages/RawMaterials';

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Layout>
          <Toaster />
          <Routes>
            <Route path="/" element={<ProductsPage />} />
            <Route path="raw-materials" element={<RawMaterialsPage />} />
            <Route path="production" element={<ProductionPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
