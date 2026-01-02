import { useAuth } from '../store/contexts/useAuth'
import { useNavigate } from 'react-router-dom'

/**
 * Dashboard Page Component
 * 
 * Main dashboard page after login with navigation to master data modules.
 * 
 * Reference: Phase 1 - Master Data Module
 */
export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">BAITIN Trading Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.username} ({user?.role}) - {user?.company}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Master Data</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/items')}
              className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-lg transition-all text-left"
            >
              <h3 className="text-lg font-semibold mb-2">📦 Item Master</h3>
              <p className="text-gray-600 text-sm">Manage item catalog and inventory</p>
            </button>

            <button
              onClick={() => navigate('/customers')}
              className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-lg transition-all text-left"
            >
              <h3 className="text-lg font-semibold mb-2">👥 Customer Master</h3>
              <p className="text-gray-600 text-sm">Manage customer information</p>
            </button>

            <button
              onClick={() => navigate('/vendors')}
              className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-lg transition-all text-left"
            >
              <h3 className="text-lg font-semibold mb-2">🏭 Vendor Master</h3>
              <p className="text-gray-600 text-sm">Manage vendor and supplier data</p>
            </button>

            <button
              onClick={() => navigate('/reference')}
              className="p-6 bg-white border-2 border-indigo-300 rounded-lg hover:border-indigo-500 hover:shadow-lg transition-all text-left border-dashed"
            >
              <h3 className="text-lg font-semibold mb-2">📋 Reference Data (Migration)</h3>
              <p className="text-gray-600 text-sm">View migrated reference data for validation</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}


