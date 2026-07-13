import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (location.pathname === '/login' || location.pathname === '/') {
    return null;
  }

  // Helper to capitalize and format names
  const formatName = (string) => {
    if (!string) return '';
    // If it's a number (ID), prefix with "Product #" or show the ID
    if (!isNaN(string)) {
      return `ID: ${string}`;
    }
    return string
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <nav className="flex items-center space-x-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 py-3 px-1">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            {isLast ? (
              <span className="text-slate-900 dark:text-slate-100 font-semibold truncate max-w-[150px] sm:max-w-xs">
                {formatName(value)}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors truncate max-w-[100px] sm:max-w-xs"
              >
                {formatName(value)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
