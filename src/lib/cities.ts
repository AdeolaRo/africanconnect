export const CITIES = [
  "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Montpellier",
  "Strasbourg", "Bordeaux", "Lille", "Rennes", "Reims", "Saint-Étienne",
  "Toulon", "Le Havre", "Grenoble", "Dijon", "Angers", "Nîmes", "Villeurbanne",
  "Clermont-Ferrand", "Le Mans", "Aix-en-Provence", "Brest", "Tours",
  "Amiens", "Limoges", "Annecy", "Perpignan", "Boulogne-Billancourt",
  "Metz", "Besançon", "Orléans", "Rouen", "Mulhouse", "Caen", "Nancy",
  "Argenteuil", "Saint-Denis", "Montreuil", "Roubaix", "Tourcoing",
  "Nanterre", "Avignon", "Créteil", "Dunkerque", "Poitiers", "Versailles",
  "Courbevoie", "Vitry-sur-Seine", "Colombes", "Aulnay-sous-Bois",
  "La Rochelle", "Champigny-sur-Marne", "Rueil-Malmaison", "Antibes",
  "Saint-Maur-des-Fossés", "Cannes", "Calais", "Béziers", "Drancy",
  "Mérida", "Ajaccio", "Saint-Nazaire", "Issy-les-Moulineaux",
  "Noisy-le-Grand", "Levallois-Perret", "Troyes", "Antony", "La Seyne-sur-Mer",
  "Neuilly-sur-Seine", "Sarcelles", "Lorient", "Chambéry", "Pessac",
  "Évry-Courcouronnes", "Cergy", "Vénissieux", "Clichy", "Valence",
  "Pantin", "Bondy", "Le Blanc-Mesnil", "Bayonne", "Sète", "Roanne",
  "Dakar", "Abidjan", "Casablanca", "Alger", "Tunis", "Rabat",
  "Lomé", "Cotonou", "Douala", "Yaoundé", "Kinshasa", "Brazzaville",
  "Bamako", "Conakry", "Niamey", "Ouagadougou", "Libreville", "Bangui",
  "N'Djamena", "Antananarivo", "Port-Louis", "Bruxelles", "Genève",
  "Montréal", "Liège", "Namur", "Charleroi",
];

export function searchCities(query: string, limit = 8): string[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return CITIES.filter((city) => {
    const normalized = city.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    return normalized.includes(q);
  }).slice(0, limit);
}
