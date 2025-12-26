import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ProductsEnhanced from "./pages/ProductsEnhanced";
import Suppliers from "./pages/Suppliers";
import PurchaseInvoicesRefactored from "./pages/PurchaseInvoicesRefactored";
import SalesInvoicesRefactored from "./pages/SalesInvoicesRefactored";
import QuickCheckout from "./pages/QuickCheckout";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsEnhanced />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="purchase-invoices" element={<PurchaseInvoicesRefactored />} />
          <Route path="sales-invoices" element={<SalesInvoicesRefactored />} />
          <Route path="quick-checkout" element={<QuickCheckout />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
