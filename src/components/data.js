export const database = {
  ustachilik: [
    { id: 1, name: "1-sonli ustachilik bo'limmasi", usta: "Eshmuradov Nodir", jami: 4, tet: 3 },
    { id: 2, name: "2-sonli ustachilik bo'limmasi", usta: "Jumaniyozov Faxriddin", jami: 2, tet: 2 },
    { id: 3, name: "3-sonli ustachilik bo'limmasi", usta: "Sadullayev Abror", jami: 1, tet: 0 },
  ],
  nimstansiya: [
    { id: 101, parentId: 1, name: "PS 110/10 'Yangiariq'", quvvat: "25 MVA", jami: 20, tet: 14 },
    { id: 102, parentId: 1, name: "PS 35/10 'G'alaba'", quvvat: "6.3 MVA" , jami: 12, tet: 9},
    { id: 103, parentId: 2, name: "PS 110/35/10 'Katta Bog''", quvvat: "16 MVA" , jami: 4, tet: 0},
  ],
  liniya: [
    { id: 201, parentId: 101, name: "L-Do'stlik-1", uzunlik: "12.4 km", jami: 16, tet: 12 },
    { id: 202, parentId: 101, name: "L-Navoiy-2", uzunlik: "5.8 km", jami: 5, tet:2 },
  ],
  transformator: [
    { id: 301, parentId: 201, name: "TP-45", quvvat: "400 kVA", holat: "Ishchi" },
    { id: 302, parentId: 201, name: "TP-112", quvvat: "250 kVA", holat: "Ta'mirda" },
  ],
};