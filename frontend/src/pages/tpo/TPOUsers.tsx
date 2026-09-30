import React, { useEffect, useState } from 'react';
import tpoUserService, { TpoUser } from '@/services/tpo-user.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { toast } from 'sonner';
import { ShieldCheck, Plus, Search, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const TPOUsers: React.FC = () => {
  const [users, setUsers] = useState<TpoUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add TPO User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await tpoUserService.getTpoUsers();
      setUsers(Array.isArray(res) ? res : []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load TPO users.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error('Email and password are required.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await tpoUserService.createTpoUser({
        email: email.trim(),
        password,
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      toast.success('TPO User created successfully!');
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      await loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create TPO user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const nameMatches = u.name ? u.name.toLowerCase().includes(term) : false;
    const emailMatches = u.email ? u.email.toLowerCase().includes(term) : false;
    return nameMatches || emailMatches;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            TPO Users
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage TPO users and their account details.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9 bg-white border-slate-200"
            />
          </div>
          <Button onClick={() => setIsModalOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-9 shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" /> Add TPO User
          </Button>
        </div>
      </div>

      {isLoading && users.length === 0 ? (
        <div className="flex h-96 items-center justify-center">
          <LoadingSpinner size="lg" text="Loading TPO users..." />
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No TPO Users Found"
          description="There are currently no matching TPO users."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-12 text-center text-xs font-semibold uppercase text-slate-500">#</TableHead>
                <TableHead className="text-xs font-semibold uppercase text-slate-500">Name</TableHead>
                <TableHead className="text-xs font-semibold uppercase text-slate-500">Email & Phone</TableHead>
                <TableHead className="text-xs font-semibold uppercase text-slate-500">Role</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase text-slate-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u, index) => (
                <TableRow key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <TableCell className="text-center font-medium text-slate-400 text-xs">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-slate-900 text-sm">{u.name || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-slate-700">{u.email}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{u.phone || 'No Phone'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="purple" className="text-[10px] font-semibold uppercase tracking-wider">
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs font-semibold text-slate-400 hover:text-blue-600 bg-transparent hover:bg-blue-50"
                      onClick={() => toast.info('View/Edit functionality is coming soon')}
                    >
                      <Eye className="h-4 w-4 mr-1.5" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add TPO User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                  Add TPO User
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">Create a new administrator account.</p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setName('');
                  setEmail('');
                  setPhone('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                <Input
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-colors text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Email <span className="text-blue-500">*</span>
                </label>
                <Input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-colors text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Phone</label>
                <Input
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-colors text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Password <span className="text-blue-500">*</span>
                </label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-colors text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Confirm Password <span className="text-blue-500">*</span>
                </label>
                <Input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-colors text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl font-semibold border-slate-200 text-slate-600 hover:bg-slate-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 px-6 min-w-32"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Create User'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TPOUsers;
