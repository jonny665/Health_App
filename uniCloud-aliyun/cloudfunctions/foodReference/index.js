'use strict';

const db = uniCloud.database();

exports.main = async () => {
  const res = await db
    .collection('food_calorie_reference')
    .orderBy('category', 'asc') // 命中 idx_food_category 的第 1 个字段
    .orderBy('foodId', 'asc')   // 命中 idx_food_category 的第 2 个字段
    .get();

  const docs = res.data || res.result?.data || [];
  const map = new Map();

  docs.forEach((doc) => {
    const category = doc.category || '未分类';
    if (!map.has(category)) map.set(category, []);
    map.get(category).push({
      foodId: doc.foodId,
      name: doc.name,
      unit: doc.unit,
      calories: doc.calories,
      updatedAt: doc.updatedAt || ''
    });
  });

  const categories = Array.from(map.keys());
  const groups = categories.map((category) => ({
    category,
    items: map.get(category)
  }));

  return { code: 0, data: { categories, groups } };
};