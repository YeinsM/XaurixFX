export class ApiError extends Error { constructor(message:string,public status:number) { super(message); } }
export async function api<T>(path:string, options:RequestInit = {}):Promise<T> {
 const res = await fetch(`/api${path}`, { credentials:'same-origin', ...options, headers:{ ...(options.body ? {'Content-Type':'application/json'} : {}), ...options.headers } });
 const data = await res.json().catch(() => ({}));
 if (!res.ok) throw new ApiError(data.message ?? 'No pudimos conectar. Inténtalo de nuevo.', res.status);
 return data as T;
}
