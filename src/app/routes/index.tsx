import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/app/layouts/DashboardLayout";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import InventoryPage from "@/features/products/pages/InventoryPage";
import AddProductPage from "@/features/products/pages/AddProductPage";
import EditProductPage from "@/features/products/pages/EditProductPage";
import OrdersPage from "@/features/orders/pages/OrdersPage";
import AnalyticsPage from "@/features/analytics/pages/AnalyticsPage";
import CategoriesPage from "@/features/categories/pages/CategoriesPage";
import LoginPage from "@/features/auth/pages/login";
import ProtectedRoute from "@/app/routes/ProtectedRoute";
import GuestRoute from "@/app/routes/GuestRoute";
import { CookiesProvider } from "react-cookie";

const AppRouter = () => (
  <CookiesProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="inventory/new" element={<AddProductPage />} />
            <Route path="inventory/:id/edit" element={<EditProductPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </CookiesProvider>
);

export default AppRouter;
