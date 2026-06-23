import { MenuItem } from '../models/MenuItem';
import { Cart } from '../models/Cart';
import { CartItem } from '../models/CartItem';
import { Op } from 'sequelize';

const keywordMappings: Record<string, { categories?: string[], keywords?: string[] }> = {
  'ăn kiêng': { categories: ['Salad'], keywords: ['ức gà', 'rau', 'ít calo', 'bơ', 'yến mạch'] },
  'giảm cân': { categories: ['Salad'], keywords: ['ức gà', 'rau', 'ít calo', 'bơ', 'yến mạch'] },
  'healthy': { categories: ['Salad'], keywords: ['ức gà', 'rau', 'ít calo', 'bơ', 'yến mạch'] },
  'chay': { keywords: ['chay', 'đậu hũ', 'đậu phụ', 'nấm', 'rau củ'] },
  'thanh đạm': { keywords: ['chay', 'đậu hũ', 'canh', 'rau', 'cháo', 'thanh mát'] },
  'miền trung': { keywords: ['quảng', 'bèo', 'bột lọc', 'chả bò'] },
  'miền nam': { keywords: ['cơm tấm', 'hủ tiếu', 'bánh mì'] },
  'miền bắc': { keywords: ['phở', 'bún chả', 'bún đậu'] },
  'giải khát': { categories: ['Đồ uống'], keywords: ['trà', 'nước', 'pepsi', 'coca', 'sinh tố', 'sữa'] },
  'nước': { categories: ['Đồ uống'], keywords: ['trà', 'nước', 'pepsi', 'coca', 'sinh tố', 'sữa'] },
  'đồ uống': { categories: ['Đồ uống'] },
};

function expandSearchQuery(query: string): any {
  const whereClause: any = {
    isAvailable: true,
    isDeleted: false,
  };

  if (!query || query.trim() === '') {
    return whereClause;
  }

  const normalizedQuery = query.toLowerCase().trim();
  const orConditions: any[] = [
    { name: { [Op.like]: `%${query}%` } },
    { description: { [Op.like]: `%${query}%` } },
    { category: { [Op.like]: `%${query}%` } }
  ];

  // Kiểm tra so khớp từ khóa
  for (const [key, mapping] of Object.entries(keywordMappings)) {
    if (normalizedQuery.includes(key)) {
      if (mapping.categories) {
        for (const cat of mapping.categories) {
          orConditions.push({ category: { [Op.like]: `%${cat}%` } });
        }
      }
      if (mapping.keywords) {
        for (const kw of mapping.keywords) {
          orConditions.push({ name: { [Op.like]: `%${kw}%` } });
          orConditions.push({ description: { [Op.like]: `%${kw}%` } });
        }
      }
    }
  }

  whereClause[Op.or] = orConditions;
  return whereClause;
}

interface ComboItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
}

interface ComboOption {
  name: string;
  totalPrice: number;
  items: ComboItem[];
  description: string;
}

function generateBudgetCombos(items: any[], budget: number, servings: number = 1): ComboOption[] {
  const servingsCount = servings > 0 ? servings : 1;
  
  const mains: any[] = [];
  const sides: any[] = [];
  const drinks: any[] = [];

  items.forEach(item => {
    const nameLower = item.name.toLowerCase();
    const catLower = (item.category || '').toLowerCase();
    
    const isDrink = catLower.includes('uống') || nameLower.match(/(trà|nước|pepsi|coca|sinh tố|sữa|juice|soda)/);
    const isSide = catLower.includes('khai vị') || nameLower.match(/(khoai|nem|gỏi|salad|súp|bánh tráng|chả giò)/);
    
    if (isDrink) {
      drinks.push(item);
    } else if (isSide) {
      sides.push(item);
    } else {
      mains.push(item);
    }
  });

  // Sắp xếp tăng dần theo giá để dễ tối ưu hóa
  mains.sort((a, b) => a.price - b.price);
  sides.sort((a, b) => a.price - b.price);
  drinks.sort((a, b) => a.price - b.price);

  const combos: ComboOption[] = [];

  // Combo 1: Tiết kiệm (1 món chính rẻ nhất + 1 nước rẻ nhất per serving)
  if (mains.length > 0) {
    const main = mains[0];
    const drink = drinks.length > 0 ? drinks[0] : null;
    
    const comboItems: ComboItem[] = [{
      id: main.id,
      name: main.name,
      price: Number(main.price),
      quantity: servingsCount,
      restaurantId: main.restaurantId
    }];
    
    let total = Number(main.price) * servingsCount;
    if (drink) {
      comboItems.push({
        id: drink.id,
        name: drink.name,
        price: Number(drink.price),
        quantity: servingsCount,
        restaurantId: drink.restaurantId
      });
      total += Number(drink.price) * servingsCount;
    }

    if (total <= budget) {
      combos.push({
        name: "Combo Tiết kiệm",
        totalPrice: total,
        items: comboItems,
        description: `Thực đơn tiết kiệm gồm ${servingsCount} phần ${main.name}${drink ? ` và ${servingsCount} phần ${drink.name}` : ''}.`
      });
    }
  }

  // Combo 2: Đầy đủ (Dinh dưỡng) (1 món chính trung bình + 1 món phụ chia sẻ + 1 nước per serving)
  if (mains.length > 0) {
    const mainIdx = Math.floor(mains.length / 2);
    const main = mains[mainIdx];
    const side = sides.length > 0 ? sides[0] : null;
    const drink = drinks.length > 0 ? drinks[0] : null;

    const comboItems: ComboItem[] = [{
      id: main.id,
      name: main.name,
      price: Number(main.price),
      quantity: servingsCount,
      restaurantId: main.restaurantId
    }];

    let total = Number(main.price) * servingsCount;

    if (side) {
      const sideQty = Math.ceil(servingsCount / 2); // 1 món phụ cho mỗi 2 người ăn
      comboItems.push({
        id: side.id,
        name: side.name,
        price: Number(side.price),
        quantity: sideQty,
        restaurantId: side.restaurantId
      });
      total += Number(side.price) * sideQty;
    }

    if (drink) {
      comboItems.push({
        id: drink.id,
        name: drink.name,
        price: Number(drink.price),
        quantity: servingsCount,
        restaurantId: drink.restaurantId
      });
      total += Number(drink.price) * servingsCount;
    }

    if (total <= budget) {
      combos.push({
        name: "Combo Đầy đủ (Dinh dưỡng)",
        totalPrice: total,
        items: comboItems,
        description: `Thực đơn đầy đủ gồm ${servingsCount} phần ${main.name}${side ? `, ${sideQty} phần ${side.name} ăn kèm` : ''}${drink ? ` và ${servingsCount} phần ${drink.name}` : ''}.`
      });
    }
  }

  // Combo 3: Đa dạng (Mix 2 món chính khác nhau + 1 nước per serving)
  if (mains.length >= 2 && servingsCount >= 2) {
    const mainA = mains[0];
    const mainB = mains[Math.min(1, mains.length - 1)];
    const drink = drinks.length > 0 ? drinks[0] : null;

    const qtyA = Math.floor(servingsCount / 2);
    const qtyB = servingsCount - qtyA;

    const comboItems: ComboItem[] = [
      {
        id: mainA.id,
        name: mainA.name,
        price: Number(mainA.price),
        quantity: qtyA,
        restaurantId: mainA.restaurantId
      },
      {
        id: mainB.id,
        name: mainB.name,
        price: Number(mainB.price),
        quantity: qtyB,
        restaurantId: mainB.restaurantId
      }
    ];

    let total = Number(mainA.price) * qtyA + Number(mainB.price) * qtyB;

    if (drink) {
      comboItems.push({
        id: drink.id,
        name: drink.name,
        price: Number(drink.price),
        quantity: servingsCount,
        restaurantId: drink.restaurantId
      });
      total += Number(drink.price) * servingsCount;
    }

    if (total <= budget) {
      combos.push({
        name: "Combo Đa dạng phong phú",
        totalPrice: total,
        items: comboItems,
        description: `Thực đơn phong phú mix giữa ${qtyA} phần ${mainA.name} và ${qtyB} phần ${mainB.name}${drink ? `, kèm ${servingsCount} phần ${drink.name}` : ''}.`
      });
    }
  }

  return combos;
}

export const aiCustomerTools = {
  searchMenuItems: async (query: string, maxPrice?: number, servings?: number) => {
    const whereClause = expandSearchQuery(query);

    if (maxPrice) {
      whereClause.price = { [Op.lte]: maxPrice };
    }

    const items = await MenuItem.findAll({
      where: whereClause,
      limit: 100,
      attributes: ['id', 'name', 'description', 'price', 'restaurantId', 'category']
    });

    if (items.length === 0) {
      return {
        items: [],
        suggested_combos: []
      };
    }

    // Nhóm món ăn theo restaurantId
    const itemsByRestaurant = items.reduce((acc: any, item) => {
      if (!acc[item.restaurantId]) acc[item.restaurantId] = [];
      acc[item.restaurantId].push(item);
      return acc;
    }, {});

    // Tìm nhà hàng có nhiều món ăn phù hợp nhất
    let maxRestaurantId = Object.keys(itemsByRestaurant)[0];
    let maxItemsCount = itemsByRestaurant[maxRestaurantId].length;

    for (const rId in itemsByRestaurant) {
      if (itemsByRestaurant[rId].length > maxItemsCount) {
        maxItemsCount = itemsByRestaurant[rId].length;
        maxRestaurantId = rId;
      }
    }

    const restaurantItems = itemsByRestaurant[maxRestaurantId];

    // Sinh các Combo món ăn nếu người dùng yêu cầu ngân sách
    let suggestedCombos: ComboOption[] = [];
    if (maxPrice) {
      suggestedCombos = generateBudgetCombos(restaurantItems, maxPrice, servings || 1);
    }

    return {
      items: restaurantItems,
      suggested_combos: suggestedCombos
    };
  },

  addItemsToCart: async (userId: string, itemsToAdd: { menuItemId: string, quantity: number, restaurantId: string }[]) => {
    if (!itemsToAdd || itemsToAdd.length === 0) return { status: 'failed', message: 'No items provided' };

    // Tìm hoặc tạo giỏ hàng cho người dùng
    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId, restaurantId: itemsToAdd[0].restaurantId });
    } else if (cart.restaurantId && cart.restaurantId !== itemsToAdd[0].restaurantId) {
      // Xóa giỏ hàng cũ nếu thêm món từ nhà hàng khác
      await CartItem.destroy({ where: { cartId: cart.id } });
      cart.restaurantId = itemsToAdd[0].restaurantId;
      await cart.save();
    }

    for (const item of itemsToAdd) {
      const existingItem = await CartItem.findOne({
        where: { cartId: cart.id, menuItemId: item.menuItemId }
      });

      if (existingItem) {
        existingItem.quantity += item.quantity;
        await existingItem.save();
      } else {
        await CartItem.create({
          cartId: cart.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity
        });
      }
    }

    return { status: 'success', message: `Đã thêm ${itemsToAdd.length} loại món ăn vào giỏ hàng.` };
  }
};
