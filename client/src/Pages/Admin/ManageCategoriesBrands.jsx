import React, { useState } from 'react';

const ManageCategoriesBrands = () => {
  const [categories, setCategories] = useState([
    { name: 'Smartphones', brands: ['Apple', 'Samsung', 'Google'] },
    { name: 'Laptops', brands: ['Apple', 'Dell', 'HP'] },
  ]);

  const [newCategory, setNewCategory] = useState('');
  const [newBrand, setNewBrand] = useState('');

  const addCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, { name: newCategory, brands: [] }]);
      setNewCategory('');
    }
  };

  const addBrand = (categoryIndex) => {
    if (newBrand.trim()) {
      const updatedCategories = [...categories];
      updatedCategories[categoryIndex].brands.push(newBrand);
      setCategories(updatedCategories);
      setNewBrand('');
    }
  };

  const removeCategory = (categoryIndex) => {
    const updatedCategories = categories.filter((_, index) => index !== categoryIndex);
    setCategories(updatedCategories);
  };

  const removeBrand = (categoryIndex, brandIndex) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].brands.splice(brandIndex, 1);
    setCategories(updatedCategories);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Categories & Brands</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Add New Category</h2>
        <input
          type="text"
          placeholder="Enter category name (e.g., Tablets, Cameras)"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <button
          onClick={addCategory}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Category
        </button>
      </div>

      {categories.map((category, categoryIndex) => (
        <div key={categoryIndex} className="mb-6 border p-4 rounded">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{category.name}</h2>
            <button
              onClick={() => removeCategory(categoryIndex)}
              className="text-red-500 hover:text-red-700"
            >
              &times;
            </button>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Current Brands</h3>
            <div className="flex flex-wrap gap-2">
              {category.brands.map((brand, brandIndex) => (
                <span
                  key={brandIndex}
                  className="bg-gray-200 px-3 py-1 rounded flex items-center gap-2"
                >
                  {brand}
                  <button
                    onClick={() => removeBrand(categoryIndex, brandIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Add New Brand</h3>
            <input
              type="text"
              placeholder="Enter brand name"
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
              className="border p-2 rounded w-full mb-2"
            />
            <button
              onClick={() => addBrand(categoryIndex)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Brand
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ManageCategoriesBrands;
