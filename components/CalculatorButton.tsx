import React from 'react';
import { ButtonType } from '../types';

interface CalculatorButtonProps {
    label: string;
    onClick: (label: string) => void;
    type: ButtonType;
    className?: string;
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({ label, onClick, type, className = '' }) => {
    const baseClasses = 'rounded-full h-20 flex items-center justify-center text-3xl sm:text-4xl font-normal focus:outline-none transition-all duration-75 ease-in-out';

    const typeClasses = {
        [ButtonType.FUNCTION]: 'bg-neutral-400 text-black hover:bg-neutral-500 active:bg-neutral-700 active:scale-90',
        [ButtonType.OPERATOR]: 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-800 active:scale-90',
        [ButtonType.NUMBER]: 'bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-500 active:scale-90',
    };

    const handleClick = () => {
        onClick(label);
    };

    return (
        <button
            onClick={handleClick}
            className={`${baseClasses} ${typeClasses[type]} ${className}`}
        >
            {label}
        </button>
    );
};

export default CalculatorButton;