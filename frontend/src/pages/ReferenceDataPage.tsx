import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../store/contexts/useAuth'
import { useNavigate } from 'react-router-dom'
import { referenceApi } from '../services/api/reference'

/**
 * Reference Data Page Component
 * 
 * Displays migrated reference data (zstdcode, zorigin) for validation.
 * 
 * Reference: Phase 1.5 - Legacy Data Migration
 */
export function ReferenceDataPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Fetch standard codes
  const { data: standardCodes, isLoading: loadingCodes, error: errorCodes } = useQuery({
    queryKey: ['standardCodes'],
    queryFn: () => referenceApi.getStandardCodes(),
  })

  // Fetch origins
  const { data: origins, isLoading: loadingOrigins, error: errorOrigins } = useQuery({
    queryKey: ['origins'],
    queryFn: () => referenceApi.getOrigins(),
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold">Reference Data - Migration Validation</h1>
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
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Migrated Reference Data</h2>
            <p className="text-gray-600">View migrated data from legacy DBF files for validation</p>
          </div>

          {/* Standard Codes Section */}
          <div className="mb-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Standard Codes (zstdcode)</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {loadingCodes ? 'Loading...' : standardCodes ? `${standardCodes.length} records` : ''}
                </p>
              </div>
              <div className="p-6">
                {loadingCodes && <div className="text-center py-8 text-gray-500">Loading...</div>}
                {errorCodes && (
                  <div className="text-center py-8 text-red-600">
                    Error loading standard codes: {String(errorCodes)}
                  </div>
                )}
                {standardCodes && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Code
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {standardCodes.map((code) => (
                          <tr key={code.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {code.stdCode}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {code.description || <span className="text-gray-400 italic">(empty)</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Origins Section */}
          <div className="mb-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Origins (zorigin)</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {loadingOrigins ? 'Loading...' : origins ? `${origins.length} records` : ''}
                </p>
              </div>
              <div className="p-6">
                {loadingOrigins && <div className="text-center py-8 text-gray-500">Loading...</div>}
                {errorOrigins && (
                  <div className="text-center py-8 text-red-600">
                    Error loading origins: {String(errorOrigins)}
                  </div>
                )}
                {origins && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Origin
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Code
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {origins.map((origin) => (
                          <tr key={origin.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {origin.origin}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {origin.description || <span className="text-gray-400 italic">(empty)</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

