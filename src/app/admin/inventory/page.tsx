'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useProducts } from '@/context/products-context';
import { calculateLandedCost, DEFAULT_CONFIG } from '@/lib/pricing';
import {
  Layers,
  Plus,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  Trash2,
  Package,
  Sparkles,
  X,
  Tag,
  DollarSign,
  Shirt,
  Flame,
  Check
} from 'lucide-react';

const PRESET_SAMPLE_TEMPLATES = [
  {
    title: "Polo Ralph Lauren Classic Fit Mesh Polo Shirt",
    brand: "Polo Ralph Lauren",
    category: "Clothes",
    retailerName: "Polo Ralph Lauren Factory Store (Las Vegas North)",
    basePriceUsd: 49.50,
    weightLbs: 0.8,
    stockQuantity: 6,
    imageUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80",
    description: "Iconic mesh cotton polo with embroidered pony. 100% authentic US outlet purchase with physical receipt.",
    isLiveShoppingDrop: true,
  },
  {
    title: "Tommy Hilfiger Women's Signature Crossbody Bag",
    brand: "Tommy Hilfiger",
    category: "Bags",
    retailerName: "Tommy Hilfiger Outlet (Woodbury Common NY)",
    basePriceUsd: 38.00,
    weightLbs: 1.2,
    stockQuantity: 4,
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80",
    description: "Compact and chic with Tommy Hilfiger gold crest hardware and adjustable shoulder strap.",
    isLiveShoppingDrop: false,
  },
  {
    title: "Calvin Klein Men's Monogram Leather Bi-fold Wallet",
    brand: "Calvin Klein",
    category: "Wallets",
    retailerName: "Calvin Klein Outlet (San Ysidro CA)",
    basePriceUsd: 22.00,
    weightLbs: 0.4,
    stockQuantity: 8,
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80",
    description: "Genuine pebbled leather with embossed CK logo. Includes original gift box.",
    isLiveShoppingDrop: false,
  },
  {
    title: "Lacoste Classic Petit Piqué Cotton Cap",
    brand: "Lacoste",
    category: "Caps",
    retailerName: "Lacoste Outlet Special Drop",
    basePriceUsd: 32.00,
    weightLbs: 0.5,
    stockQuantity: 5,
    imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80",
    description: "Breathable cotton piqué with iconic green crocodile patch on the side. Adjustable strap.",
    isLiveShoppingDrop: true,
  }
];

export default function AdminInventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct, toggleStockStatus, resetToDefault } = useProducts();
  const [marginMultiplier, setMarginMultiplier] = useState<number>(15); // 15%
  const [updatedNotice, setUpdatedNotice] = useState<string | null>(null);

  // Modal State for Adding a New Product
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('Calvin Klein');
  const [category, setCategory] = useState('Clothes');
  const [retailerName, setRetailerName] = useState('Calvin Klein Outlet (Las Vegas North)');
  const [basePriceUsd, setBasePriceUsd] = useState<number>(29.50);
  const [weightLbs, setWeightLbs] = useState<number>(0.8);
  const [stockQuantity, setStockQuantity] = useState<number>(5);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80');
  const [description, setDescription] = useState('100% authentic US outlet find with brand tags and store gift receipt.');
  const [isLiveShoppingDrop, setIsLiveShoppingDrop] = useState(false);

  // Live Landed Cost calculation for form preview
  const liveBreakdown = calculateLandedCost({
    basePriceUsd: Number(basePriceUsd) || 0,
    weightLbs: Number(weightLbs) || 0.5,
    usdToPhpRate: DEFAULT_CONFIG.usdToPhpRate,
    profitMarginRate: marginMultiplier / 100,
  });

  const handleApplyTemplate = (tpl: typeof PRESET_SAMPLE_TEMPLATES[0]) => {
    setTitle(tpl.title);
    setBrand(tpl.brand);
    setCategory(tpl.category);
    setRetailerName(tpl.retailerName);
    setBasePriceUsd(tpl.basePriceUsd);
    setWeightLbs(tpl.weightLbs);
    setStockQuantity(tpl.stockQuantity);
    setImageUrl(tpl.imageUrl);
    setDescription(tpl.description);
    setIsLiveShoppingDrop(tpl.isLiveShoppingDrop);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newProd = addProduct({
      title: title.trim(),
      brand,
      category,
      retailerName: retailerName.trim() || `${brand} Outlet`,
      sourceUrl: 'https://usgoodspasabuy.ph',
      imageUrls: [imageUrl.trim() || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'],
      basePriceUsd: Number(basePriceUsd),
      weightLbs: Number(weightLbs),
      sellingPricePhp: liveBreakdown.finalSellingPricePhp,
      stockQuantity: Number(stockQuantity),
      allocatedSlots: Number(stockQuantity),
      claimedSlots: 0,
      description: description.trim(),
      isCustomRequest: false,
      isActive: true,
      isLiveShoppingDrop,
      lineupTag: isLiveShoppingDrop ? 'LIVE_BATCH_DROP' : undefined,
    });

    setIsAddModalOpen(false);
    setUpdatedNotice(`Successfully added "${newProd.title}" to catalog!`);
    setTimeout(() => setUpdatedNotice(null), 4000);

    // Reset fields to defaults
    setTitle('');
  };

  const handleBulkRecalculate = () => {
    products.forEach((p) => {
      const breakdown = calculateLandedCost({
        basePriceUsd: p.basePriceUsd,
        weightLbs: p.weightLbs,
        usdToPhpRate: DEFAULT_CONFIG.usdToPhpRate,
        profitMarginRate: marginMultiplier / 100,
      });
      updateProduct(p.id, {
        sellingPricePhp: breakdown.finalSellingPricePhp,
      });
    });
    setUpdatedNotice('All catalog selling prices recalculated with new service margin!');
    setTimeout(() => setUpdatedNotice(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header with Add Product CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">US Catalog & Inventory Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Post newly arrived on-hand items to sell, manage stocks, and calculate real-time landed profit margins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product to Sell</span>
          </button>

          <button
            type="button"
            onClick={resetToDefault}
            title="Reset to factory sample items"
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition border border-slate-800"
          >
            Reset Catalog
          </button>
        </div>
      </div>

      {/* Margin Adjuster Bar */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Bulk Service Margin Adjuster
          </h3>
          <p className="text-xs text-slate-400">
            Recalculate all catalog landed selling prices with a new service markup percentage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="number"
              min="5"
              max="50"
              value={marginMultiplier}
              onChange={(e) => setMarginMultiplier(parseInt(e.target.value) || 15)}
              className="w-24 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
          </div>

          <button
            onClick={handleBulkRecalculate}
            className="px-4 py-2 bg-gradient-to-r from-brand-700 to-brand-600 hover:from-brand-800 hover:to-brand-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 ring-1 ring-gold-400/30 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Apply to Catalog</span>
          </button>
        </div>
      </div>

      {updatedNotice && (
        <div className="p-3 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{updatedNotice}</span>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gold-400" />
            <h3 className="font-bold text-white text-xs">
              Current Products for Sale ({products.length} Items)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Click &ldquo;Toggle Stock&rdquo; to test out-of-stock customer Restock Requests
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-5">Product Title</th>
                <th className="py-3 px-5">Brand / Retailer</th>
                <th className="py-3 px-5">US Price</th>
                <th className="py-3 px-5">Weight</th>
                <th className="py-3 px-5">Landed Selling Price</th>
                <th className="py-3 px-5">50% Deposit</th>
                <th className="py-3 px-5">Stock Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {products.map((p) => {
                const isOutOfStock = p.stockQuantity <= 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        {p.imageUrls?.[0] && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-800 relative">
                            <Image
                              src={p.imageUrls[0]}
                              alt={p.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-white block line-clamp-1">{p.title}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400">{p.category}</span>
                            {p.isLiveShoppingDrop && (
                              <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/30">
                                Live Drop
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-gold-400 block">{p.brand || 'Outlet'}</span>
                      <span className="text-[10px] text-slate-400">{p.retailerName}</span>
                    </td>
                    <td className="py-3.5 px-5 font-mono">${p.basePriceUsd.toFixed(2)} USD</td>
                    <td className="py-3.5 px-5 font-mono">{p.weightLbs} lbs</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-400 font-mono">
                      ₱{p.sellingPricePhp.toLocaleString()} PHP
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-400">
                      ₱{(Math.ceil(p.sellingPricePhp * 0.5)).toLocaleString()} PHP
                    </td>
                    <td className="py-3.5 px-5">
                      {isOutOfStock ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
                          <span>Out of Stock</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{p.stockQuantity} on-hand</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleStockStatus(p.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
                            isOutOfStock
                              ? 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-700/50'
                              : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {isOutOfStock ? 'Set In Stock' : 'Mark Out of Stock'}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProduct(p.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Product to Sell */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-gold-400 uppercase tracking-wider block">
                  Add New Item
                </span>
                <h2 className="text-xl font-black text-white">Post Product to Sell</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Template Picker */}
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                ⚡ Quick 1-Click Outlet Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_SAMPLE_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.title}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition border border-slate-700"
                  >
                    {tpl.brand} ({tpl.category})
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Calvin Klein Monogram Crewneck Tee"
                  className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-gold-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Brand *
                  </label>
                  <select
                    value={brand}
                    onChange={(e) => {
                      setBrand(e.target.value);
                      setRetailerName(`${e.target.value} Outlet`);
                    }}
                    className="w-full px-3 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-gold-400 font-semibold"
                  >
                    <option value="Calvin Klein">Calvin Klein</option>
                    <option value="Tommy Hilfiger">Tommy Hilfiger</option>
                    <option value="Polo Ralph Lauren">Polo Ralph Lauren</option>
                    <option value="Lacoste">Lacoste</option>
                    <option value="Other US Outlet">Other US Outlet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-gold-400 font-semibold"
                  >
                    <option value="Clothes">Clothes</option>
                    <option value="Bags">Bags</option>
                    <option value="Watches">Watches</option>
                    <option value="Wallets">Wallets</option>
                    <option value="Caps">Caps</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    US Base Price ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={basePriceUsd}
                    onChange={(e) => setBasePriceUsd(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-gold-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Weight (lbs) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(parseFloat(e.target.value) || 0.5)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-gold-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    On-Hand Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-gold-400"
                  />
                </div>
              </div>

              {/* Real-Time Landed Cost Calculation Box */}
              <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-600/40 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Automated Landed Selling Price (Philippine Pesos):
                </span>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Final Customer Price (All-In):</span>
                  <span className="text-base font-black text-emerald-300 font-mono">
                    ₱{liveBreakdown.finalSellingPricePhp.toLocaleString()} PHP
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px] border-t border-emerald-900/50 pt-1.5">
                  <span>50% Downpayment (Pay Half Later):</span>
                  <span className="font-bold text-white font-mono">
                    ₱{liveBreakdown.minimum50PctDownpaymentPhp.toLocaleString()} PHP
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Product Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-gold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-gold-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="liveDropToggle"
                  checked={isLiveShoppingDrop}
                  onChange={(e) => setIsLiveShoppingDrop(e.target.checked)}
                  className="w-4 h-4 rounded text-gold-500 bg-slate-900 border-slate-700 focus:ring-gold-400"
                />
                <label htmlFor="liveDropToggle" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Feature as Live Shopping Drop / Special Arrival
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs transition shadow-md"
                >
                  Post Item to Storefront
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
