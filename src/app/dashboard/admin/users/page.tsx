
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";
import { useRoleGuard } from "@/hooks/use-role-guard";
import { apiFetch } from "@/lib/api";

type AdminUser = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  plan?: string;
  createdAt?: string;
};

type AdminUsersResponse = { data?: AdminUser[] } | AdminUser[];

const fetchAdminUsers = (): Promise<AdminUsersResponse> =>
  apiFetch<AdminUsersResponse>("/api/admin/users");

const UserManagementPage = () => {
  const { user, isLoading, isAuthorized } = useRoleGuard("admin");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const applyUsers = useCallback((response: AdminUsersResponse) => {
    setUsers(Array.isArray(response) ? response : response.data ?? []);
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      applyUsers(await fetchAdminUsers());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load users.");
    } finally {
      setLoading(false);
    }
  }, [applyUsers]);

  useEffect(() => {
    if (!isAuthorized || !user) return;

    let cancelled = false;

    fetchAdminUsers()
      .then((response) => {
        if (!cancelled) {
          applyUsers(response);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(
            error instanceof Error ? error.message : "Could not load users."
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthorized, user, applyUsers]);

  const changeRole = async (id: string, role: string) => {
    try {
      setUpdating(id);

      await apiFetch(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        body: { role },
      });

      setUsers((current) =>
        current.map((item) => item._id === id ? { ...item, role } : item)
      );
      toast.success("User role updated successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update user role.");
    } finally {
      setUpdating(null);
    }
  };

  if (isLoading || !isAuthorized || !user) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-indigo-600" /></div>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-900 p-7 text-white shadow-lg">
          <Link href="/dashboard/admin" className="mb-4 inline-flex items-center text-sm text-blue-100 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Admin Dashboard
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="mt-2 text-blue-100">Manage registered users and their roles.</p>
            </div>
            <div className="rounded-xl bg-white/15 p-3"><Users className="h-8 w-8" /></div>
          </div>
        </header>

        <section className="overflow-hidden rounded-2xl border border-white bg-white/90 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
            <div>
              <h2 className="font-bold text-slate-800">Registered Users</h2>
              <p className="text-sm text-slate-500">{users.length} users loaded</p>
            </div>
            <button onClick={loadUsers} disabled={loading} className="inline-flex items-center rounded-lg border px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-7 w-7 animate-spin text-indigo-600" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="bg-indigo-50 text-slate-600">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((item) => (
                    <tr key={item._id} className="hover:bg-indigo-50/50">
                      <td className="p-4 font-semibold text-slate-800">{item.name || "Unnamed"}</td>
                      <td className="p-4 text-slate-600">{item.email}</td>
                      <td className="p-4 capitalize text-slate-600">{item.plan || "Free"}</td>
                      <td className="p-4 text-slate-600">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}</td>
                      <td className="p-4">
                        <select
                          value={item.role || "student"}
                          disabled={updating === item._id || item._id === (user as { id?: string; _id?: string }).id || item._id === (user as { id?: string; _id?: string })._id}
                          onChange={(event) => changeRole(item._id, event.target.value)}
                          className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium capitalize text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
                        >
                          <option value="student">Student</option>
                          <option value="tutor">Tutor</option>
                          <option value="admin">Admin</option>
                        </select>
                        {updating === item._id && <Loader2 className="ml-2 inline h-4 w-4 animate-spin" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <p className="p-10 text-center text-slate-500">No users found.</p>}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default UserManagementPage;
