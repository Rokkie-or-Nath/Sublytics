import { useState } from 'react';
import { useStore, categories } from '../../store/useStore';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export function AddSubscriptionModal() {
  const { isAddModalOpen, setIsAddModalOpen, addSubscription } = useStore();
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState('streaming');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setName('');
    setCost('');
    setCategory('streaming');
    setBillingCycle('monthly');
    setNextBillingDate('');
    setDescription('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    setIsAddModalOpen(false);
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!cost || parseFloat(cost) <= 0) newErrors.cost = 'Valid cost is required';
    if (!nextBillingDate) newErrors.date = 'Next billing date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedCategory = categories.find((c) => c.id === category);

    addSubscription({
      name: name.trim(),
      cost: parseFloat(cost),
      category,
      billingCycle: billingCycle as 'monthly' | 'yearly' | 'weekly' | 'quarterly',
      nextBillingDate,
      status: 'active',
      color: selectedCategory?.color || '#6B7B8F',
      description: description.trim() || undefined,
    });

    handleClose();
  };

  const billingOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  return (
    <Modal isOpen={isAddModalOpen} onClose={handleClose} title="Add Subscription">
      <div className="space-y-4">
        <Input
          label="Subscription Name"
          placeholder="e.g., Netflix, Spotify"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Cost"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            error={errors.cost}
          />
          <Select
            label="Billing Cycle"
            options={billingOptions}
            value={billingCycle}
            onChange={setBillingCycle}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            options={categoryOptions}
            value={category}
            onChange={setCategory}
          />
          <Input
            label="Next Billing Date"
            type="date"
            value={nextBillingDate}
            onChange={(e) => setNextBillingDate(e.target.value)}
            error={errors.date}
          />
        </div>
        <Input
          label="Description (optional)"
          placeholder="e.g., Premium plan, Family sharing"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Subscription</Button>
        </div>
      </div>
    </Modal>
  );
}
