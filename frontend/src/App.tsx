import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './store/contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import { ItemMasterPage } from './pages/ItemMasterPage'
import { CustomerMasterPage } from './pages/CustomerMasterPage'
import { VendorMasterPage } from './pages/VendorMasterPage'
import { ReferenceDataPage } from './pages/ReferenceDataPage'
import OrderEnquiryQtyBreakdownPage from './pages/OrderEnquiryQtyBreakdownPage'
import OrderConfirmationPostPage from './pages/OrderConfirmationPostPage'
import OrderConfirmationEntryPage from './pages/OrderConfirmationEntryPage'
import OrderConfirmationEnquiryPage from './pages/OrderConfirmationEnquiryPage'
import ContractGeneratePage from './pages/ContractGeneratePage'
import ContractEntryPage from './pages/ContractEntryPage'
import ContractEnquiryPage from './pages/ContractEnquiryPage'
import BomManagementPage from './pages/BomManagementPage'
import ProtectedRoute from './components/ProtectedRoute'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/items"
              element={
                <ProtectedRoute>
                  <ItemMasterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <CustomerMasterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendors"
              element={
                <ProtectedRoute>
                  <VendorMasterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reference"
              element={
                <ProtectedRoute>
                  <ReferenceDataPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-enquiry/qty-breakdown"
              element={
                <ProtectedRoute>
                  <OrderEnquiryQtyBreakdownPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-confirmation/post"
              element={
                <ProtectedRoute>
                  <OrderConfirmationPostPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-confirmation/entry"
              element={
                <ProtectedRoute>
                  <OrderConfirmationEntryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-confirmation/enquiry"
              element={
                <ProtectedRoute>
                  <OrderConfirmationEnquiryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contract/generate"
              element={
                <ProtectedRoute>
                  <ContractGeneratePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contract/entry"
              element={
                <ProtectedRoute>
                  <ContractEntryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contract/enquiry"
              element={
                <ProtectedRoute>
                  <ContractEnquiryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bom"
              element={
                <ProtectedRoute>
                  <BomManagementPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App


