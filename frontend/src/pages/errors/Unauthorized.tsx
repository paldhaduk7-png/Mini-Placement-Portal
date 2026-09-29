import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="h-16 w-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">403</h1>
        <h2 className="text-lg font-bold text-slate-800">Access Restricted</h2>
        <p className="text-xs text-slate-500">
          You do not have the required permissions to view this section of the portal.
        </p>
        <div className="pt-2">
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
