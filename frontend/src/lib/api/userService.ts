import { http } from "./client";
import { setToken, clearToken } from "../auth/token";

// Types aligned with services/user-service/app/schemas.py
export type EmailStr = string;

export interface UserOut {
  user_id: string;
  email: EmailStr;
  role: string; // comma-separated roles
  company_id?: string | null;
  created_at: string; // ISO string
}

export interface SignInRequest {
  email: EmailStr;
  password: string;
}

export interface AccessTokenResponse {
  access_token?: string | null;
  token_type: "bearer";
  expires_at?: string | null; // ISO
  user?: UserOut; // optional: backend may include user payload
}

export interface UserCreate {
  email: EmailStr;
  password: string;
  role?: string; // default "user"
  company_id?: string | null;
}

export interface UserUpdate {
  email?: EmailStr;
  password?: string;
  role?: string;
  company_id?: string | null;
}

export interface SetCompanyRequest {
  company_id: string;
}

// Company-scoped types
export interface CompanyUserCreate {
  email: EmailStr;
  password: string;
  roles: string[];
}

export interface CompanyUserOut {
  user_id: string;
  email: EmailStr;
  roles: string[];
  role: string;
  company_id?: string | null;
  created_at: string;
}

export interface CompanyUserUpdateRoles {
  roles: string[];
}

export const userService = {
  // Auth
  signup: async (payload: UserCreate) => {
    const created = await http.post<UserOut, UserCreate>("/users/auth/signup", payload);
    return created;
  },
  signin: async (payload: SignInRequest) => {
  const res = await http.post<AccessTokenResponse, SignInRequest>("/users/auth/signin", payload);
  if (res?.access_token) setToken(res.access_token, { expiresAt: res.expires_at || undefined });
    return res;
  },
  signout: async () => {
    try {
      await http.post<{ message: string }>("/users/auth/signout");
    } finally {
      clearToken();
    }
  },

  // Users
  me: () => http.get<UserOut>("/users/me"),
  list: () => http.get<UserOut[]>("/users"),
  get: (userId: string) => http.get<UserOut>(`/users/${encodeURIComponent(userId)}`),
  update: (userId: string, payload: UserUpdate) => http.patch<UserOut, UserUpdate>(`/users/${encodeURIComponent(userId)}`, payload),
  remove: (userId: string) => http.delete<void>(`/users/${encodeURIComponent(userId)}`),
  setMyCompany: (payload: SetCompanyRequest) => http.post<UserOut, SetCompanyRequest>("/users/me/company", payload),

  // Company-scoped management
  companyUsers: {
    list: () => http.get<CompanyUserOut[]>("/users/company/users"),
    create: (payload: CompanyUserCreate) => http.post<CompanyUserOut, CompanyUserCreate>("/users/company/users", payload),
    remove: (userId: string) => http.delete<void>(`/users/company/users/${encodeURIComponent(userId)}`),
    updateRoles: (userId: string, payload: CompanyUserUpdateRoles) =>
      http.patch<CompanyUserOut, CompanyUserUpdateRoles>(`/users/company/users/${encodeURIComponent(userId)}/roles`, payload),
  },
};
