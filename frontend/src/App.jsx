import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ProductsEnhanced from "./pages/ProductsEnhanced";
import Suppliers from "./pages/Suppliers";
import PurchaseInvoices from "./pages/PurchaseInvoices";
import SalesInvoices from "./pages/SalesInvoices";
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
          <Route path="purchase-invoices" element={<PurchaseInvoices />} />
          <Route path="sales-invoices" element={<SalesInvoices />} />
          <Route path="quick-checkout" element={<QuickCheckout />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
