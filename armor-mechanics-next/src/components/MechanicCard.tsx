'use client';

import { useState } from 'react';
import { Mechanic, MechanicInput } from '@/types/mechanics';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ComparePanel } from '@/components/ComparePanel';

interface MechanicCardProps {
  mechanic: Mechanic;
}

export function MechanicCard({ mechanic }: MechanicCardProps) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const initialValues: Record<string, any> = {};
    mechanic.inputs.forEach(input => {
      initialValues[input.key] = input.value;
    });
    return initialValues;
  });
  
  const [result, setResult] = useState<string>('');

  const handleInputChange = (key: string, value: any) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleCalculate = () => {
    try {
      const res = mechanic.compute(values);
      if (typeof res === 'string') {
        setResult(res);
      } else {
        setResult(res.text || '');
      }
    } catch (error) {
      setResult(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const renderInput = (input: MechanicInput) => {
    if (input.type === 'checkbox') {
      return (
        <div key={input.key} className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={values[input.key] || false}
              onChange={(e) => handleInputChange(input.key, e.target.checked)}
              className="w-4 h-4 text-text-accent bg-background border-border rounded focus:ring-text-accent/50"
            />
            {input.label}
          </label>
        </div>
      );
    }

    if (input.type === 'select' && input.options) {
      return (
        <div key={input.key} className="flex flex-col gap-1.5">
          <label className="text-xs text-text-secondary font-medium">
            {input.label}
          </label>
          <select
            value={values[input.key] || input.value}
            onChange={(e) => handleInputChange(input.key, e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-text-accent/50"
          >
            {input.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <Input
        key={input.key}
        label={input.label}
        type="number"
        value={values[input.key] || input.value}
        onChange={(e) => handleInputChange(input.key, parseFloat(e.target.value) || 0)}
      />
    );
  };

  // Специальная панель для сравнения
  if (mechanic.key === 'compare') {
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text-accent mb-2">
            {mechanic.name}
          </h3>
          <p className="text-sm text-text-secondary">
            {mechanic.desc}
          </p>
        </div>
        <ComparePanel />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-accent mb-2">
          {mechanic.name}
        </h3>
        <p className="text-sm text-text-secondary">
          {mechanic.desc}
        </p>
      </div>

      {mechanic.inputs.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {mechanic.inputs.map(renderInput)}
          </div>
      