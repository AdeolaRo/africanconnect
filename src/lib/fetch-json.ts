export async function fetchJson<T>(url: string, init?: RequestInit): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const res = await fetch(url, init);
    const text = await res.text();

    if (!text) {
      return {
        data: null,
        error: res.ok ? "Réponse vide du serveur" : `Erreur ${res.status}`,
        status: res.status,
      };
    }

    const data = JSON.parse(text) as T;
    if (!res.ok) {
      const err = (data as { error?: string })?.error || `Erreur ${res.status}`;
      return { data: null, error: err, status: res.status };
    }

    return { data, error: null, status: res.status };
  } catch {
    return { data: null, error: "Erreur réseau ou réponse invalide", status: 0 };
  }
}
