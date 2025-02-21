import React, { useState } from 'react';

interface BottomBarButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
}

export const BottomBarButton: React.FC<BottomBarButtonProps> = ({ label, onClick, disabled }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        setIsLoading(true);
        try {
            await onClick();
        } finally {
            setTimeout(() => setIsLoading(false), 500); // Simulate loader for a moment
        }
    };

    return (
        <button
            className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-4 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:bg-cta-active active:shadow-button-push'
            onClick={handleClick}
            disabled={disabled || isLoading}
        >
            {isLoading ? (
                <div className="flex items-center justify-center">
                    <svg className="animate-spin mr-2 h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z"></path>
                    </svg>
                    Processing...
                </div>
            ) : (
                label
            )}
        </button>
    );
};
