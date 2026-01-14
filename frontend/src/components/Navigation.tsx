import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../store/contexts/useAuth'

/**
 * Navigation Header Component
 * 
 * Provides consistent navigation bar across all pages with links to main sections.
 */
export function Navigation() {
  const location = useLocation()
  const { logout } = useAuth()

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold text-gray-900 hover:text-indigo-600">
              BAITIN Trading Management
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`text-sm ${isActive('/') && location.pathname === '/' ? 'font-medium text-indigo-600' : 'text-gray-700 hover:text-indigo-600'}`}
            >
              Dashboard
            </Link>
            <Link
              to="/items"
              className={`text-sm ${isActive('/items') ? 'font-medium text-indigo-600' : 'text-gray-700 hover:text-indigo-600'}`}
            >
              Items
            </Link>
            <Link
              to="/customers"
              className={`text-sm ${isActive('/customers') ? 'font-medium text-indigo-600' : 'text-gray-700 hover:text-indigo-600'}`}
            >
              Customers
            </Link>
            <Link
              to="/vendors"
              className={`text-sm ${isActive('/vendors') ? 'font-medium text-indigo-600' : 'text-gray-700 hover:text-indigo-600'}`}
            >
              Vendors
            </Link>
            <Link
              to="/order-enquiry/control"
              className={`text-sm ${isActive('/order-enquiry/control') ? 'font-medium text-indigo-600' : 'text-gray-700 hover:text-indigo-600'}`}
            >
              OE Control
            </Link>
            <Link
              to="/order-enquiry/entry"
              className={`text-sm ${isActive('/order-enquiry/entry') ? 'font-medium text-indigo-600' : 'text-gray-700 hover:text-indigo-600'}`}
            >
              OE Entry
            </Link>
            <Link
              to="/order-enquiry/list"
              className={`text-sm ${isActive('/order-enquiry/list') ? 'font-medium text-indigo-600' : 'text-gray-700 hover:text-indigo-600'}`}
            >
              OE List
            </Link>
            <button
              onClick={logout}
              className="text-sm text-gray-700 hover:text-indigo-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

