import React from 'react';
import { FoodCategory } from '../../utils/mockData';

interface CategoryStripProps {
  categories: FoodCategory[];
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
}

export const CategoryStrip: React.FC<CategoryStripProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
}) => {
  return (
    <section className="bg-[#FEFCF9] border-b border-[#E8D8C6] py-4 shadow-saigon-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {categories.map((category) => {
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wide border-2 border-neutral-900 whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-[#BF3A20] text-white shadow-retro-sm translate-x-[1px] translate-y-[1px]'
                    : 'bg-[#FAF0D2] text-[#2C1A0E] hover:bg-[#FAF0D2]/80 hover:scale-95'
                }`}
              >
                <span className="text-sm">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryStrip;
