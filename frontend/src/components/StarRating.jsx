import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export function StarRating({ healerId, avgRating = 0, ratingCount = 0, onRate, size = 'md' }) {
    const [hoverIndex, setHoverIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const { t } = useLanguage();

    const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5';
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

    const handleClick = async (score) => {
        if (submitting) return;
        setSubmitting(true);
        try {
            await onRate(healerId, score);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center gap-1.5">
            <div
                className="flex items-center gap-0.5"
                onMouseLeave={() => setHoverIndex(0)}
            >
                {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = hoverIndex ? star <= hoverIndex : star <= Math.round(avgRating);
                    return (
                        <button
                            key={star}
                            type="button"
                            disabled={submitting}
                            className={`transition-all duration-150 cursor-pointer hover:scale-110 disabled:cursor-wait ${isFilled
                                ? 'text-amber-400 drop-shadow-sm'
                                : 'text-gray-300 dark:text-gray-600'
                                }`}
                            onMouseEnter={() => setHoverIndex(star)}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClick(star);
                            }}
                            data-testid={`star-${healerId}-${star}`}
                        >
                            <Star
                                className={`${starSize} ${isFilled ? 'fill-amber-400' : 'fill-transparent'}`}
                            />
                        </button>
                    );
                })}
            </div>
            <span className={`${textSize} text-muted-foreground font-medium tabular-nums`}>
                {avgRating > 0 ? (
                    <>
                        {avgRating.toFixed(1)}
                        <span className="ml-0.5 opacity-70">({ratingCount})</span>
                    </>
                ) : (
                    <span className="opacity-60">{t('no_ratings')}</span>
                )}
            </span>
        </div>
    );
}
