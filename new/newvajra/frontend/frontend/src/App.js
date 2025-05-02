import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MenuManagement from "./pages/MenuManagement";
import AddMenuItem from "./pages/AddMenuItem";
import EditMenuItem from "./pages/EditMenuItem";
import InventoryManagement from "./pages/InventoryManagement";
import GeneratePO from "./pages/GeneratePO";
import PurchaseOrders from "./pages/PurchaseOrders";
import Reports from "./pages/Reports";
import OrderEntry from "./pages/OrderEntry";
import GenerateBill from "./pages/GenerateBill";
import ChefInventory from "./pages/ChefInventory";
import SupplyRequest from "./pages/SupplyRequest";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import CashBalanceSummary from './components/cash-balance/CashBalanceSummary';
import InvoiceList from './components/invoices/InvoiceList';

// ✅ Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu"
            element={
              <ProtectedRoute>
                <MenuManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-menu-item"
            element={
              <ProtectedRoute>
                <AddMenuItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-menu-item/:id"
            element={
              <ProtectedRoute>
                <EditMenuItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-po"
            element={
              <ProtectedRoute>
                <GeneratePO />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-orders"
            element={
              <ProtectedRoute>
                <PurchaseOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-entry"
            element={
              <ProtectedRoute>
                <OrderEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-bill"
            element={
              <ProtectedRoute>
                <GenerateBill />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chef-inventory"
            element={
              <ProtectedRoute>
                <ChefInventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supply-request"
            element={
              <ProtectedRoute>
                <SupplyRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <InvoiceList />
              </ProtectedRoute>
            }
          />
          {/* Default route */}
          <Route path="*" element={<Register />} />
        </Routes>

        <ToastContainer position="top-center" autoClose={2000} />
      </>
    </Router>
  );
}

export default App;
