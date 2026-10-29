export type MenuItem = { id: string; name: string; price: number; category: string };

export const MENU: MenuItem[] = [
  { id: "rice-idiyappam", name: "Rice Idiyappam", price: 30, category: "Idiyappam" },
  { id: "ragi-idiyappam", name: "Ragi Idiyappam", price: 35, category: "Idiyappam" },
  { id: "wheat-idiyappam", name: "Wheat Idiyappam", price: 35, category: "Idiyappam" },
  { id: "lamb-kurma", name: "Lamb Kurma / Gravy", price: 140, category: "Kurma & gravy" },
  { id: "chicken-kurma", name: "Chicken Kurma / Gravy", price: 100, category: "Kurma & gravy" },
  { id: "egg-kurma", name: "Egg Kurma", price: 90, category: "Kurma & gravy" },
  { id: "veg-white-kurma", name: "Veg White Kurma", price: 80, category: "Kurma & gravy" },
  { id: "egg-semiya", name: "Egg Semiya", price: 80, category: "Sides" },
  { id: "coconut-milk", name: "Coconut Milk", price: 50, category: "Sides" },
  { id: "chicken-combo", name: "Chicken Combo (2 plates Idiyappam + Chicken)", price: 140, category: "Combos" },
  { id: "vegetarian-combo", name: "Vegetarian Combo (2 plates Idiyappam + Veg White Kurma + Coconut Milk)", price: 125, category: "Combos" }
];
