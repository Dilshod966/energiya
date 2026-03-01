export const database = {
  ustachilik: [
    { id: 1, name: "1-sonli ustachilik bo'limi", usta: "Eshmuradov Nodir", ns: 2 },
    { id: 2, name: "2-sonli ustachilik bo'limi", usta: "Jumaniyozov Faxriddin", ns: 1 },
    { id: 3, name: "3-sonli ustachilik bo'limi", usta: "Sadullayev Abror", ns: 0 },
  ],
  nimstansiya: [
    { id: 101, parentId: 1, name: "PS 110/10 'Yangiariq'", quvvat: "25 MVA" },
    { id: 102, parentId: 1, name: "PS 35/10 'G'alaba'", quvvat: "6.3 MVA" },
    { id: 103, parentId: 2, name: "PS 110/35/10 'Katta Bog''", quvvat: "16 MVA" },
  ],
  liniya: [
    { id: 201, parentId: 101, name: "L-Do'stlik-1", uzunlik: "12.4 km" },
    { id: 202, parentId: 101, name: "L-Navoiy-2", uzunlik: "5.8 km" },
  ],
  transformator: [
    { id: 301, parentId: 201, name: "TP-45", quvvat: "400 kVA", holat: "Ishchi" },
    { id: 302, parentId: 201, name: "TP-112", quvvat: "250 kVA", holat: "Ta'mirda" },
  ],
};