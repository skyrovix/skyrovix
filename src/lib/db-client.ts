import type { Database } from './database.types';
import { runMysqlQueryServerFn, runMysqlRpcServerFn } from '@/lib/mysql-bridge';

export interface UserMetadata {
  full_name?: string;
  [key: string]: any;
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: UserMetadata;
  app_metadata?: {
    provider?: string;
    role?: string;
    [key: string]: any;
  };
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface Session {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: { message: string } | null;
}

const STORAGE_KEY = "skyrovix_auth_session";

function getStoredSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredSession(session: Session | null) {
  if (typeof window === "undefined") return;
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
}

export type AuthChangeEvent = "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED" | "PASSWORD_RECOVERY" | "INITIAL_SESSION";
type AuthChangeCallback = (event: AuthChangeEvent, session: Session | null) => void;
const authListeners = new Set<AuthChangeCallback>();

function emitAuthChange(event: AuthChangeEvent, session: Session | null) {
  authListeners.forEach((cb) => {
    try {
      cb(event, session);
    } catch (e) {
      console.error("[AuthListener Error]:", e);
    }
  });
}

class QueryBuilder {
  private _table: string;
  private _action: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private _select: string = "*";
  private _values: any = null;
  private _filters: Array<{
    type: "eq" | "neq" | "in" | "lte" | "gte" | "gt" | "lt" | "like" | "ilike" | "is" | "not" | "contains";
    column: string;
    operator?: string;
    value?: any;
    values?: any[];
  }> = [];
  private _order?: { column: string; ascending?: boolean };
  private _limit?: number;
  private _single = false;
  private _maybeSingle = false;

  private _count?: "exact" | "planned" | "estimated";
  private _head?: boolean;

  constructor(table: string) {
    this._table = table;
  }

  select(columns: string = "*", options?: { count?: "exact" | "planned" | "estimated"; head?: boolean }) {
    if (this._action !== "select") {
      this._select = columns;
      if (options?.count) this._count = options.count;
      if (options?.head !== undefined) this._head = options.head;
      return this;
    }
    this._action = "select";
    this._select = columns;
    if (options?.count) this._count = options.count;
    if (options?.head !== undefined) this._head = options.head;
    return this;
  }

  insert(values: any) {
    this._action = "insert";
    this._values = values;
    return this;
  }

  update(values: any) {
    this._action = "update";
    this._values = values;
    return this;
  }

  upsert(values: any, _options?: any) {
    this._action = "upsert";
    this._values = values;
    return this;
  }

  delete() {
    this._action = "delete";
    return this;
  }

  eq(column: string, value: any) {
    this._filters.push({ type: "eq", column, value });
    return this;
  }

  neq(column: string, value: any) {
    this._filters.push({ type: "neq", column, value });
    return this;
  }

  gt(column: string, value: any) {
    this._filters.push({ type: "gt", column, value });
    return this;
  }

  gte(column: string, value: any) {
    this._filters.push({ type: "gte", column, value });
    return this;
  }

  lt(column: string, value: any) {
    this._filters.push({ type: "lt", column, value });
    return this;
  }

  lte(column: string, value: any) {
    this._filters.push({ type: "lte", column, value });
    return this;
  }

  is(column: string, value: any) {
    this._filters.push({ type: "is", column, value });
    return this;
  }

  not(column: string, operator: string, value: any) {
    this._filters.push({ type: "not", column, operator, value });
    return this;
  }

  contains(column: string, value: any) {
    this._filters.push({ type: "contains", column, value });
    return this;
  }

  in(column: string, values: any[]) {
    this._filters.push({ type: "in", column, values });
    return this;
  }

  like(column: string, pattern: string) {
    this._filters.push({ type: "like", column, value: pattern });
    return this;
  }

  ilike(column: string, pattern: string) {
    this._filters.push({ type: "ilike", column, value: pattern });
    return this;
  }

  range(from: number, to: number) {
    this._limit = to - from + 1;
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this._order = { column, ascending: options?.ascending ?? true };
    return this;
  }

  limit(count: number) {
    this._limit = count;
    return this;
  }

  single() {
    this._single = true;
    return this;
  }

  maybeSingle() {
    this._maybeSingle = true;
    return this;
  }

  async execute(): Promise<{ data: any; count: number | null; error: any }> {
    const payload = {
      table: this._table,
      action: this._action,
      select: this._select,
      values: this._values,
      filters: this._filters,
      order: this._order,
      limit: this._limit,
      single: this._single,
      maybeSingle: this._maybeSingle,
      count: this._count,
      head: this._head,
    };

    try {
      const res = await runMysqlQueryServerFn({ data: payload });
      return {
        data: res?.data ?? null,
        count: res?.count ?? (Array.isArray(res?.data) ? res.data.length : null),
        error: res?.error ?? null,
      };
    } catch (err: any) {
      return { data: null, count: null, error: { message: err.message || "Query failed" } };
    }
  }

  then(onfulfilled?: (value: { data: any; count: number | null; error: any }) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const dbClient = {
  auth: {
    async getSession(): Promise<{ data: { session: Session | null }; error: null }> {
      const session = getStoredSession();
      return { data: { session }, error: null };
    },

    async getUser(token?: string): Promise<{ data: { user: User | null }; error: any }> {
      if (typeof window === "undefined") {
        return { data: { user: null }, error: null };
      }
      const stored = getStoredSession();
      if (!token && stored?.user) {
        return { data: { user: stored.user }, error: null };
      }
      const activeToken = token || stored?.access_token;
      if (!activeToken) {
        return { data: { user: null }, error: null };
      }

      try {
        const res = await fetch("/api/auth/user", {
          headers: { Authorization: `Bearer ${activeToken}` },
        });
        const json = await res.json();
        if (json.user && stored) {
          stored.user = json.user;
          setStoredSession(stored);
        }
        return { data: { user: json.user || null }, error: json.error ? { message: json.error } : null };
      } catch (err: any) {
        return { data: { user: stored?.user || null }, error: { message: err.message } };
      }
    },

    async signInWithPassword(credentials: { email: string; password: string }): Promise<AuthResponse> {
      try {
        const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const json = await res.json();
        if (json.error) {
          return { data: { user: null, session: null }, error: { message: json.error } };
        }

        setStoredSession(json.session);
        emitAuthChange("SIGNED_IN", json.session);
        return { data: { user: json.user, session: json.session }, error: null };
      } catch (err: any) {
        return { data: { user: null, session: null }, error: { message: err.message || "Sign in failed" } };
      }
    },

    async signUp(credentials: {
      email: string;
      password: string;
      options?: { data?: { full_name?: string }; emailRedirectTo?: string };
    }): Promise<AuthResponse> {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const json = await res.json();
        if (json.error) {
          return { data: { user: null, session: null }, error: { message: json.error } };
        }

        if (json.session) {
          setStoredSession(json.session);
          emitAuthChange("SIGNED_IN", json.session);
        }
        return { data: { user: json.user, session: json.session }, error: null };
      } catch (err: any) {
        return { data: { user: null, session: null }, error: { message: err.message || "Registration failed" } };
      }
    },

    async signOut(): Promise<{ error: null }> {
      try {
        if (typeof window !== "undefined") {
          await fetch("/api/auth/signout", { method: "POST" });
        }
      } catch {}

      setStoredSession(null);
      emitAuthChange("SIGNED_OUT", null);
      return { error: null };
    },

    onAuthStateChange(callback: AuthChangeCallback): { data: { subscription: { unsubscribe: () => void } } } {
      authListeners.add(callback);
      const current = getStoredSession();
      try {
        callback(current ? "SIGNED_IN" : "SIGNED_OUT", current);
      } catch {}

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners.delete(callback);
            },
          },
        },
      };
    },

    async resetPasswordForEmail(_email: string, _options?: any): Promise<{ data: any; error: any }> {
      return { data: {}, error: null };
    },

    async setSession(session: any): Promise<{ data: { session: Session | null }; error: any }> {
      setStoredSession(session);
      emitAuthChange("SIGNED_IN", session);
      return { data: { session }, error: null };
    },

    async exchangeCodeForSession(_code: string): Promise<{ data: { session: Session | null; user: User | null }; error: any }> {
      const session = getStoredSession();
      return { data: { session, user: session?.user || null }, error: null };
    },

    async verifyOtp(_params: any): Promise<{ data: { session: Session | null; user: User | null }; error: any }> {
      const session = getStoredSession();
      return { data: { session, user: session?.user || null }, error: null };
    },

    async updateUser(updates: { password?: string; data?: any }): Promise<{ data: { user: User | null }; error: any }> {
      if (!updates.password) return { data: { user: null }, error: null };
      const session = getStoredSession();
      if (!session) return { data: { user: null }, error: { message: "Not authenticated" } };

      try {
        const res = await fetch("/api/auth/update-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ password: updates.password }),
        });
        const json = await res.json();
        return { data: { user: session.user }, error: json.error ? { message: json.error } : null };
      } catch (err: any) {
        return { data: { user: null }, error: { message: err.message } };
      }
    },
  },

  from(table: string) {
    return new QueryBuilder(table);
  },

  storage: {
    from(bucket: string) {
      return {
        async upload(
          pathStr: string,
          file: File | Blob | any,
          _options?: { upsert?: boolean; contentType?: string; cacheControl?: string }
        ) {
          const cleanPath = pathStr.replace(/^(\.\.(\/|\\|$))+/, "").replace(/^\/+/, "");

          try {
            const formData = new FormData();
            formData.append("bucket", bucket);
            formData.append("path", cleanPath);
            formData.append("file", file);

            const res = await fetch("/api/storage/upload", {
              method: "POST",
              body: formData,
            });
            const json = await res.json();
            return { data: json.data, error: json.error };
          } catch (err: any) {
            return { data: null, error: { message: err.message || "File upload failed" } };
          }
        },

        getPublicUrl(pathStr: string) {
          const cleanPath = pathStr.replace(/^\/+/, "");
          return {
            data: {
              publicUrl: `/uploads/${bucket}/${cleanPath}`,
            },
          };
        },

        async createSignedUrl(pathStr: string, _expiresIn?: number) {
          const cleanPath = pathStr.replace(/^\/+/, "");
          return {
            data: {
              signedUrl: `/uploads/${bucket}/${cleanPath}`,
            },
            error: null,
          };
        },

        async download(pathStr: string) {
          try {
            const cleanPath = pathStr.replace(/^\/+/, "");
            const res = await fetch(`/uploads/${bucket}/${cleanPath}`);
            if (!res.ok) throw new Error("File not found");
            const blob = await res.blob();
            return { data: blob, error: null };
          } catch (err: any) {
            return { data: null, error: { message: err.message } };
          }
        },

        async list(_folder?: string, _options?: any) {
          return { data: [], error: null };
        },

        async remove(_paths: string[]) {
          return { data: null, error: null };
        },
      };
    },
  },

  async rpc(fnName: string, params: Record<string, any> = {}): Promise<{ data: any; error: any }> {
    try {
      return await runMysqlRpcServerFn({ data: { fnName, params } });
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  channel(_name: string) {
    const channelObj = {
      on(_event: string, _filter: any, _callback?: any) {
        return channelObj;
      },
      subscribe(callback?: (status: string) => void) {
        if (callback) {
          setTimeout(() => callback("SUBSCRIBED"), 10);
        }
        return channelObj;
      },
      unsubscribe() {
        return channelObj;
      },
    };
    return channelObj;
  },

  removeChannel(_channel: any) {},
};

export const supabase = dbClient;
export const supabaseAdmin = dbClient;
export default dbClient;
