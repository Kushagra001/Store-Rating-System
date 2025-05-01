import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  value = 0,
  onChange,
  size = 'md',
  readonly = false,
}) => {
  const [rating, setRating] = useState(value);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    setRating(value);
  }, [value]);

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-7 w-7';
      default:
        return 'h-5 w-5';
    }
  };

  const handleRating = (ratingValue: number) => {
    if (readonly) return;
    
    setRating(ratingValue);
    if (onChange) {
      onChange(ratingValue);
    }
  };

  const starSize = getSize();

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => handleRating(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          className={`${
            readonly ? 'cursor-default' : 'cursor-pointer'
          } p-0.5 transition-colors focus:outline-none focus:ring-0`}
          aria-label={`Rate ${star} out of 5 stars`}
        >
          <Star
            className={`${starSize} ${
              (hoverRating || rating) >= star
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;