// Template data to clone for new businesses

export const templateCategories = [
  { name: 'Lanches', description: 'Hambúrgueres e sanduíches artesanais', sort_order: 1 },
  { name: 'Bebidas', description: 'Refrigerantes, sucos e drinks', sort_order: 2 },
  { name: 'Acompanhamentos', description: 'Porções e complementos', sort_order: 3 },
  { name: 'Sobremesas', description: 'Doces e sobremesas especiais', sort_order: 4 },
  { name: 'Combos', description: 'Promoções e combos especiais', sort_order: 5 },
]

export const templateProducts = [
  {
    category: 'Lanches',
    name: 'Hambúrguer Clássico',
    description: 'Hambúrguer artesanal 180g, queijo cheddar, alface, tomate, cebola roxa e molho especial',
    price: 28.90,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    prep_time: '15-20 min',
  },
  {
    category: 'Lanches',
    name: 'Bacon Burger',
    description: 'Duplo hambúrguer 160g cada, bacon crocante, queijo cheddar duplo, cebola caramelizada',
    price: 35.90,
    image_url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400&h=300&fit=crop',
    prep_time: '20-25 min',
  },
  {
    category: 'Lanches',
    name: 'Frango Crispy',
    description: 'Frango empanado crocante, queijo suíço, alface americana, tomate e maionese temperada',
    price: 26.90,
    image_url: 'https://images.unsplash.com/photo-1606755962773-d324e9a13086?w=400&h=300&fit=crop',
    prep_time: '15-18 min',
  },
  {
    category: 'Lanches',
    name: 'Veggie Burger',
    description: 'Hambúrguer de grão-de-bico, queijo vegano, rúcula, tomate seco e molho pesto',
    price: 24.90,
    image_url: 'https://images.unsplash.com/photo-1525059696034-4967a729002e?w=400&h=300&fit=crop',
    prep_time: '12-15 min',
  },
  {
    category: 'Bebidas',
    name: 'Coca-Cola 350ml',
    description: 'Refrigerante gelado',
    price: 5.90,
    image_url: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop',
    prep_time: '2 min',
  },
  {
    category: 'Bebidas',
    name: 'Suco Natural',
    description: 'Suco de laranja natural 400ml',
    price: 8.90,
    image_url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop',
    prep_time: '3-5 min',
  },
  {
    category: 'Acompanhamentos',
    name: 'Batata Frita',
    description: 'Porção generosa de batatas fritas crocantes',
    price: 12.90,
    image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
    prep_time: '8-10 min',
  },
  {
    category: 'Acompanhamentos',
    name: 'Onion Rings',
    description: '8 unidades de anéis de cebola empanados',
    price: 14.90,
    image_url: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&h=300&fit=crop',
    prep_time: '10-12 min',
  },
  {
    category: 'Sobremesas',
    name: 'Brownie com Sorvete',
    description: 'Brownie de chocolate quente com bola de sorvete de baunilha',
    price: 16.90,
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
    prep_time: '5-8 min',
  },
  {
    category: 'Combos',
    name: 'Combo Clássico',
    description: 'Hambúrguer Clássico + Batata Frita + Refrigerante',
    price: 42.90,
    image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
    prep_time: '18-22 min',
  },
]

export const templateAdditionals = [
  { name: 'Bacon Extra', price: 4.00 },
  { name: 'Queijo Cheddar', price: 3.50 },
  { name: 'Ovo Frito', price: 2.50 },
  { name: 'Cebola Caramelizada', price: 2.00 },
  { name: 'Molho Especial', price: 1.50 },
  { name: 'Alface Extra', price: 1.00 },
  { name: 'Tomate Extra', price: 1.00 },
  { name: 'Picles', price: 1.50 },
]

export const templateDeliveryAreas = [
  { name: 'Centro', fee: 3.00 },
  { name: 'Zona Norte', fee: 5.00 },
  { name: 'Zona Sul', fee: 5.00 },
  { name: 'Zona Leste', fee: 6.00 },
  { name: 'Zona Oeste', fee: 6.00 },
]
