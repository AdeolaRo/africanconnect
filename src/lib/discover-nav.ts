const STORAGE_KEY = "africanconnect-discover-nav";

export interface DiscoverNav {
  ids: string[];
  from: "discover";
}

export function saveDiscoverNav(ids: string[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ids, from: "discover" }));
}

export function getDiscoverNav(): DiscoverNav | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as DiscoverNav;
    if (data.from === "discover" && Array.isArray(data.ids) && data.ids.length > 0) {
      return data;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function getDiscoverNavIndex(currentId: string): { index: number; total: number; ids: string[] } | null {
  const nav = getDiscoverNav();
  if (!nav) return null;
  const index = nav.ids.indexOf(currentId);
  if (index === -1) return null;
  return { index, total: nav.ids.length, ids: nav.ids };
}

export function discoverProfileUrl(id: string, withNav = true) {
  return withNav ? `/profil/${id}?from=discover` : `/profil/${id}`;
}
