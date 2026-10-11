'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  PHILIPPINES_LOCATIONS,
  getProvincesList,
  getCitiesByProvince,
  getBarangaysByCity,
  fetchBarangaysForCity,
  getCityZipCode,
} from '@/data/philippines-locations';
import { MapPin, ChevronDown, Check, Search, AlertCircle, Loader2 } from 'lucide-react';

interface SearchableDropdownProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  disabledMessage?: string;
  required?: boolean;
  loading?: boolean;
}

function SearchableDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  disabledMessage,
  required = true,
  loading = false,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options by search term (case-insensitive)
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(term));
  }, [options, searchTerm]);

  // Limit rendered items to 150 for buttery 60fps scrolling performance
  const displayedOptions = useMemo(() => {
    return filteredOptions.slice(0, 150);
  }, [filteredOptions]);

  const handleOpen = () => {
    if (disabled || loading) return;
    setIsOpen(!isOpen);
    setSearchTerm('');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-bold text-slate-700 mb-1">
        {label} {required && '*'}
      </label>

      {/* Selector Trigger Button */}
      <button
        type="button"
        disabled={disabled || loading}
        onClick={handleOpen}
        className={`w-full px-3.5 py-2.5 text-xs rounded-xl border text-left flex items-center justify-between transition ${
          disabled
            ? 'bg-slate-100/80 border-slate-200 text-slate-400 cursor-not-allowed'
            : loading
            ? 'bg-slate-50 border-slate-300 text-slate-500 cursor-wait'
            : isOpen
            ? 'bg-white border-brand-700 ring-2 ring-brand-700/20 text-slate-900 shadow-sm'
            : value
            ? 'bg-slate-50 border-slate-300 text-slate-900 hover:border-slate-400'
            : 'bg-slate-50 border-slate-300 text-slate-400 hover:border-slate-400'
        }`}
      >
        <span className="truncate font-medium flex items-center gap-1.5">
          {loading && <Loader2 className="w-3.5 h-3.5 text-brand-600 animate-spin" />}
          {disabled && disabledMessage
            ? disabledMessage
            : loading
            ? 'Loading barangays...'
            : value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform ${
            disabled ? 'text-slate-300' : 'text-slate-500'
          } ${isOpen ? 'rotate-180 text-brand-700' : ''}`}
        />
      </button>

      {/* Floating Searchable Dropdown Menu */}
      {isOpen && !disabled && !loading && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Header */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (displayedOptions.length > 0) {
                      handleSelect(displayedOptions[0]);
                    } else if (searchTerm.trim()) {
                      handleSelect(searchTerm.trim());
                    }
                  } else if (e.key === 'Escape') {
                    setIsOpen(false);
                  }
                }}
                placeholder="Type initial or search..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-700 text-slate-900 placeholder:text-slate-400"
              />
            </div>
            {filteredOptions.length > 150 && (
              <p className="text-[10px] text-slate-500 mt-1 px-1">
                Showing first 150 of {filteredOptions.length} matches. Type to filter.
              </p>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-50 text-xs">
            {displayedOptions.length > 0 ? (
              displayedOptions.map((opt) => {
                const isSelected = opt === value;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full px-3.5 py-2 text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-brand-50 text-brand-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-100/80 font-normal'
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-700 shrink-0" />}
                  </button>
                );
              })
            ) : searchTerm.trim() ? (
              <div className="p-3 text-center space-y-2">
                <p className="text-slate-400 text-[11px]">
                  No exact match for &ldquo;{searchTerm}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => handleSelect(searchTerm.trim())}
                  className="w-full py-1.5 px-3 bg-brand-50 hover:bg-brand-100 text-brand-900 border border-brand-200 rounded-lg font-bold text-xs transition"
                >
                  Use &ldquo;{searchTerm.trim()}&rdquo;
                </button>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No location available.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export interface PhilippineAddressSelectorProps {
  province: string;
  onProvinceChange: (province: string) => void;
  city: string;
  onCityChange: (city: string) => void;
  barangay: string;
  onBarangayChange: (barangay: string) => void;
  postalCode: string;
  onPostalCodeChange: (postalCode: string) => void;
  required?: boolean;
}

export default function PhilippineAddressSelector({
  province,
  onProvinceChange,
  city,
  onCityChange,
  barangay,
  onBarangayChange,
  postalCode,
  onPostalCodeChange,
  required = true,
}: PhilippineAddressSelectorProps) {
  // All 84 Philippine provinces / regions
  const provinces = useMemo(() => getProvincesList(), []);

  // Available cities based on chosen province
  const availableCities = useMemo(() => {
    if (!province) return [];
    return getCitiesByProvince(province).map((c) => c.name);
  }, [province]);

  // Dynamic barangays list with asynchronous resolution
  const [barangaysList, setBarangaysList] = useState<string[]>(() => {
    if (province && city) {
      return getBarangaysByCity(province, city);
    }
    return [];
  });
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  // Load barangays whenever province or city changes
  useEffect(() => {
    if (!province || !city) {
      setBarangaysList([]);
      setLoadingBarangays(false);
      return;
    }

    // Check synchronous cache / popular list first
    const syncList = getBarangaysByCity(province, city);
    if (syncList.length > 0) {
      setBarangaysList(syncList);
      setLoadingBarangays(false);
    } else {
      setLoadingBarangays(true);
    }

    let isMounted = true;
    fetchBarangaysForCity(province, city).then((list) => {
      if (isMounted) {
        if (list && list.length > 0) {
          setBarangaysList(list);
        }
        setLoadingBarangays(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [province, city]);

  // When province changes, reset city & barangay
  const handleProvinceSelect = (newProvince: string) => {
    onProvinceChange(newProvince);
    onCityChange('');
    onBarangayChange('');
    onPostalCodeChange('');
  };

  // When city changes, reset barangay and auto-suggest zip code
  const handleCitySelect = (newCity: string) => {
    onCityChange(newCity);
    onBarangayChange('');
    const autoZip = getCityZipCode(province, newCity);
    if (autoZip) {
      onPostalCodeChange(autoZip);
    }
  };

  return (
    <div className="space-y-3">
      {/* 1. Province / Region Selector */}
      <SearchableDropdown
        label="Province / Region"
        value={province}
        onChange={handleProvinceSelect}
        options={provinces}
        placeholder="Choose Province / Region"
        required={required}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 2. City / Municipality Selector (Must be chosen before Barangay) */}
        <SearchableDropdown
          label="City / Municipality"
          value={city}
          onChange={handleCitySelect}
          options={availableCities}
          placeholder="Choose City / Municipality"
          disabled={!province}
          disabledMessage="Select Province first..."
          required={required}
        />

        {/* 3. Barangay Selector (Strictly requires City to be filled first) */}
        <SearchableDropdown
          label="Barangay"
          value={barangay}
          onChange={onBarangayChange}
          options={barangaysList}
          placeholder={loadingBarangays ? 'Loading barangays...' : 'Choose Barangay'}
          disabled={!city}
          disabledMessage="Select City first..."
          loading={loadingBarangays}
          required={required}
        />
      </div>

      {/* 4. Postal Code Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Postal / Zip Code {required && '*'}
        </label>
        <input
          type="text"
          required={required}
          value={postalCode}
          onChange={(e) => onPostalCodeChange(e.target.value)}
          placeholder="e.g. 1634"
          className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-700 focus:outline-none font-medium text-slate-900"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          Auto-suggested for selected city, or adjust if you have a specific district zip code.
        </p>
      </div>

      {/* Guidance Note */}
      {!city && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            Please select your <strong>City / Municipality</strong> first before selecting your{' '}
            <strong>Barangay</strong>.
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Format address helper: Never includes ", Philippines"
 */
export function formatPhilippineAddress(addr?: {
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}): string {
  if (!addr) return '';
  const parts: string[] = [];
  if (addr.street) parts.push(addr.street);
  if (addr.barangay) parts.push(`Brgy. ${addr.barangay}`);
  if (addr.city) parts.push(addr.city);
  if (addr.province) parts.push(addr.province);
  if (addr.postalCode) parts.push(addr.postalCode);
  return parts.join(', ');
}
