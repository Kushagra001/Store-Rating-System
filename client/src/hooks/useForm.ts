import { useState, ChangeEvent, FormEvent } from 'react';

interface FormData {
  [key: string]: string;
}

export const useForm = (initialState: FormData) => {
  const [formData, setFormData] = useState<FormData>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (
    e: FormEvent,
    submitFn: (data: FormData) => Promise<void>
  ) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await submitFn(formData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    error,
    isLoading,
    handleChange,
    handleSubmit
  };
}; 