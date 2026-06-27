export const CATEGORIES = [
  { key: "all",            label: "All Products",      sub: "",              img: "https://www.bbassets.com/media/uploads/p/l/40232195_2-fresho-assorted-puja-flowers-greens-mix-to-decorate-for-festivals-puja.jpg" },
  { key: "pooja-premium",  label: "Pooja Flowers Mix", sub: "Premium",       img: "https://www.bbassets.com/media/uploads/p/l/40232195_2-fresho-assorted-puja-flowers-greens-mix-to-decorate-for-festivals-puja.jpg" },
  { key: "pooja-basic",    label: "Pooja Flowers Mix", sub: "Basic",         img: "https://m.media-amazon.com/images/I/81HWdtZ5kIL.jpg" },
  { key: "fresh",          label: "Fresh Flowers",     sub: "Daily Bloom",   img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbQDjTFJkNdcxUOir8IQ0JbBnjBdYSV6EbDA&s" },
  { key: "flower-strings", label: "Flower Strings",    sub: "Décor & Festive", img: "https://m.media-amazon.com/images/I/715TCG-Nf7L.jpg" },
  { key: "garlands",       label: "Garlands",          sub: "All Occasions", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCNpMYcZG5dy7pRt69t2EDW0fPIXeV-YgiMA&s" },
  { key: "poola-jada",     label: "Poola Jada",        sub: "Bridal",        img: "https://5.imimg.com/data5/ANDROID/Default/2023/10/355539021/XF/AY/IY/157964413/product-jpeg.jpg" },
  { key: "hair",           label: "Hair Accessories",  sub: "Fresh Flower",  img: "https://hairdramacompany.com/cdn/shop/files/CLP-0203_6f66cf7e-0e29-4eb0-8a4f-da3760e51e8d.jpg?v=1766742163" },
  { key: "jewellery",      label: "Flower Jewellery",  sub: "Traditional",   img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF2MY75g7VxRHwAhrMfZtRwBNyCGCQcImFXQ&s" },
  ];

export const PRODUCTS = [
  { id: 1,  name: "Premium Pooja Mix",       cat: "pooja-premium",  price: 599,  original: 749,  tag: "Premium",     img: "https://images.unsplash.com/photo-1585559604959-0f9e3413e8e8?w=600&h=600&fit=crop&q=85",  desc: "Curated premium blooms for daily pooja — roses, marigold & jasmine.",            quantity: "500g" },
  { id: 2,  name: "Basic Pooja Pack",        cat: "pooja-basic",    price: 129,  original: 169,  tag: "Value",       img: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&h=600&fit=crop&q=85",  desc: "Everyday pooja flowers — fresh marigold, chrysanthemum & tulsi.",                quantity: "250g" },
  { id: 3,  name: "Rose Bouquet",            cat: "fresh",          price: 499,  original: 599,  tag: "Best Seller", img: "https://images.unsplash.com/photo-1561128290-006b5bdf10a7?w=600&h=600&fit=crop&q=85",  desc: "Dozen velvety red roses, hand-tied with satin ribbon.",                          quantity: "12 Stems" },
  { id: 4,  name: "Sunflower Bunch",         cat: "fresh",          price: 349,  original: 449,  tag: "Cheerful",    img: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&h=600&fit=crop&q=85",  desc: "Bright, farm-fresh sunflowers that light up any room.",                          quantity: "5 Stems" },
  { id: 5,  name: "Lily Arrangement",        cat: "fresh",          price: 599,  original: 749,  tag: "Elegant",     img: "https://images.unsplash.com/photo-1490750967868-88df5691cc85?w=600&h=600&fit=crop&q=85",  desc: "White Asiatic lilies in a premium glass vase.",                                  quantity: "6 Stems" },
  { id: 6,  name: "Marigold Bunch",          cat: "fresh",          price: 149,  original: 199,  tag: "Fresh",       img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&q=85",  desc: "Vibrant orange & yellow marigolds, perfect for any occasion.",                   quantity: "500g" },
  { id: 7,  name: "Bridal Poola Jada Set",   cat: "poola-jada",     price: 1299, original: 1599, tag: "Bridal",      img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&h=600&fit=crop&q=85",  desc: "Traditional South Indian bridal hair floral set — jasmine & roses.",             quantity: "1 Set" },
  { id: 8,  name: "Mini Poola Jada",         cat: "poola-jada",     price: 699,  original: 899,  tag: "Popular",     img: "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=600&h=600&fit=crop&q=85",  desc: "Compact floral hair trail for receptions & functions.",                          quantity: "1 Set" },
  { id: 9,  name: "Jasmine Hair Pin Set",    cat: "hair",           price: 199,  original: 249,  tag: "Trending",    img: "https://images.unsplash.com/photo-1487530811015-780073b1225b?w=600&h=600&fit=crop&q=85",  desc: "Fresh jasmine pins — perfect for daily wear or festive styling.",                quantity: "6 Pcs" },
  { id: 10, name: "Rose Hair Clip",          cat: "hair",           price: 149,  original: 199,  tag: "New",         img: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=600&h=600&fit=crop&q=85",  desc: "Single bloom rose clip, hand-made fresh each morning.",                          quantity: "1 Pc" },
  { id: 11, name: "Jasmine Garland",         cat: "garlands",       price: 299,  original: 399,  tag: "Fragrant",    img: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&h=600&fit=crop&q=85",  desc: "Pure jasmine garland, 3 ft — freshly strung every morning.",                    quantity: "3 Ft" },
  { id: 12, name: "Marigold Garland",        cat: "garlands",       price: 199,  original: 249,  tag: "Pooja",       img: "https://images.unsplash.com/photo-1561181286-d5c73431a97b?w=600&h=600&fit=crop&q=85",  desc: "Traditional marigold mala for home & temple pooja.",                             quantity: "1 Pc (3 Ft)" },
  { id: 13, name: "Flower Jewellery Set",    cat: "jewellery",      price: 999,  original: 1299, tag: "Exclusive",   img: "https://images.unsplash.com/photo-1606166325683-e6deb697d301?w=600&h=600&fit=crop&q=85",  desc: "Full set — necklace, bangles & maang tikka in fresh flowers.",                  quantity: "1 Set" },
  { id: 14, name: "Floral Necklace",         cat: "jewellery",      price: 449,  original: 599,  tag: "Bridal",      img: "https://images.unsplash.com/photo-1596436902073-02b8fecf5a1d?w=600&h=600&fit=crop&q=85",  desc: "Handcrafted fresh-flower necklace for ceremonies & functions.",                  quantity: "1 Pc" },
  { id: 15, name: "Jasmine Flower String",   cat: "flower-strings", price: 149,  original: 199,  tag: "Fragrant",    img: "https://images.unsplash.com/photo-1627735483088-3dd6f56acfab?w=600&h=600&fit=crop&q=85",  desc: "Fresh jasmine strings — ideal for door décor, pooja rooms & events.",            quantity: "1 Meter" },
  { id: 16, name: "Marigold Flower String",  cat: "flower-strings", price: 99,   original: 129,  tag: "Festive",     img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&q=85",  desc: "Bright marigold strings for festive decoration & torana hanging.",               quantity: "1 Meter" },
  { id: 17, name: "Rose Petal String",       cat: "flower-strings", price: 199,  original: 249,  tag: "Premium",     img: "https://images.unsplash.com/photo-1561128290-006b5bdf10a7?w=600&h=600&fit=crop&q=85",  desc: "Delicate rose petal strings for wedding stages & mandap décor.",                quantity: "1 Meter" },
  { id: 18, name: "Mixed Flower String",     cat: "flower-strings", price: 179,  original: 229,  tag: "Popular",     img: "https://images.unsplash.com/photo-1490750967868-88df5691cc85?w=600&h=600&fit=crop&q=85",  desc: "Colourful mixed blooms strung together — perfect for any celebration.",          quantity: "1 Meter" },
];

export const POPULAR = [3, 1, 7, 11].map(id => PRODUCTS.find(p => p.id === id));
export const BESTSELLERS = [3, 2, 11, 9, 13, 6].map(id => PRODUCTS.find(p => p.id === id));

export const getProductQuantity = (product) => {
  if (!product) return "";
  if (product.quantity) return product.quantity;
  const name = product.name.toLowerCase();
  if (name.includes("premium pooja")) return "500g";
  if (name.includes("basic pooja")) return "250g";
  if (name.includes("rose bouquet")) return "12 Stems";
  if (name.includes("sunflower")) return "5 Stems";
  if (name.includes("lily")) return "6 Stems";
  if (name.includes("marigold bunch")) return "500g";
  if (name.includes("bridal poola jada")) return "1 Set";
  if (name.includes("mini poola jada")) return "1 Set";
  if (name.includes("jasmine hair pin")) return "6 Pcs";
  if (name.includes("rose hair clip")) return "1 Pc";
  if (name.includes("jasmine garland")) return "3 Ft";
  if (name.includes("marigold garland")) return "1 Pc (3 Ft)";
  if (name.includes("jewellery set")) return "1 Set";
  if (name.includes("floral necklace")) return "1 Pc";
  if (name.includes("string")) return "1 Meter";
  return "";
};
