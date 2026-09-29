import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
          <FileQuestion className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">404</h1>
        <h2 className="text-lg font-bold text-slate-800">Page Not Found</h2>
        <p className="text-xs text-slate-500">
          The page you are looking for does not exist or has been relocated.
        </p>
        <div className="pt-2">
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
            <Link to="/">
              <Home className="h-4 w-4 mr-1.5" />
              Go to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
