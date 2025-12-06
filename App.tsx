import React, { useState, useCallback, useRef } from 'react';
import CalculatorButton from './components/CalculatorButton';
import HistoryPanel from './components/HistoryPanel';
import ConfirmationModal from './components/ConfirmationModal';
import { ButtonType } from './types';

// FIX: Define an interface for button configuration objects to allow an optional `className` property.
// This resolves the TypeScript error when trying to access `btn.className`.
interface ButtonConfig {
    label: string;
    type: ButtonType;
    className?: string;
}

const App: React.FC = () => {
    const [displayValue, setDisplayValue] = useState<string>('0');
    const [previousValue, setPreviousValue] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<string[]>([]);
    const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(false);
    const [isClearConfirmVisible, setIsClearConfirmVisible] = useState(false);
    const [expression, setExpression] = useState<string>('');
    const [isCopied, setIsCopied] = useState(false);

    const touchStartX = useRef<number | null>(null);
    // FIX: Replaced `NodeJS.Timeout` with `number` because `setTimeout` in a browser environment returns a number, which resolves the "Cannot find namespace 'NodeJS'" error.
    const longPressTimer = useRef<number | null>(null);
    const touchMoved = useRef(false);

    const calculate = useCallback((first: number, second: number, op: string): number => {
        switch (op) {
            case '+': return first + second;
            case '-': return first - second;
            case '×': return first * second;
            case '÷': 
                if (second === 0) {
                    setError("Cannot divide by zero");
                    return NaN;
                }
                return first / second;
            default: return second;
        }
    }, []);

    const formattedDisplayValue = useCallback(() => {
        if (error) return error;

        // If the number is already in scientific notation, format it for consistent precision.
        if (displayValue.toLowerCase().includes('e')) {
            const num = parseFloat(displayValue);
            return isNaN(num) ? displayValue : num.toPrecision(9);
        }
        
        const [integerPart, fractionalPart] = displayValue.split('.');

        // Switch to scientific notation if the integer part is too long for standard display.
        const cleanedIntegerPart = integerPart.startsWith('-') ? integerPart.substring(1) : integerPart;
        if (cleanedIntegerPart.length > 15) {
            const num = parseFloat(displayValue);
            return isNaN(num) ? displayValue : num.toPrecision(10);
        }

        // Preserve user input as they type a decimal or negative sign.
        if (displayValue.endsWith('.') || displayValue === '-') {
            return displayValue;
        }

        let formattedInteger;
        try {
            // Format with Indian numbering system for readability.
            formattedInteger = new Intl.NumberFormat('en-IN').format(BigInt(integerPart || '0'));
        } catch {
            if (isNaN(Number(integerPart))) return displayValue; // Safeguard
            formattedInteger = new Intl.NumberFormat('en-IN').format(Number(integerPart || '0'));
        }

        if (fractionalPart !== undefined) {
            return `${formattedInteger}.${fractionalPart}`;
        }

        return formattedInteger;
    }, [displayValue, error]);

    const clearAll = useCallback(() => {
        setDisplayValue('0');
        setPreviousValue(null);
        setOperator(null);
        setWaitingForOperand(false);
        setError(null);
        setExpression('');
    }, []);

    const clearEntry = useCallback(() => {
        setDisplayValue('0');
        setError(null);
        setWaitingForOperand(false);
    }, []);

    const toggleSign = useCallback(() => {
        if (displayValue === '0' || error) return;
        setDisplayValue(prev => (prev.startsWith('-') ? prev.substring(1) : `-${prev}`));
    }, [displayValue, error]);
    
    const inputDigit = useCallback((digit: string) => {
        if (error) return;
        if (waitingForOperand) {
            setDisplayValue(digit);
            setWaitingForOperand(false);
        } else {
            setDisplayValue(prev => (prev === '0' ? digit : prev + digit));
        }
    }, [waitingForOperand, error]);

    const inputDecimal = useCallback(() => {
        if (error) return;
        if (waitingForOperand) {
            setDisplayValue('0.');
            setWaitingForOperand(false);
            return;
        }
        if (!displayValue.includes('.')) {
            setDisplayValue(displayValue + '.');
        }
    }, [displayValue, waitingForOperand, error]);

    const handleOperator = useCallback((nextOperator: string) => {
        if (error) return;
        const inputValue = parseFloat(displayValue);
        
        if (waitingForOperand && expression) {
            setOperator(nextOperator);
            setExpression(prev => prev.replace(/[\+\-×÷]$/, nextOperator));
            return;
        }
        
        const formattedVal = formattedDisplayValue();
        
        if (operator && previousValue !== null) {
            const result = calculate(previousValue, inputValue, operator);
            if (isNaN(result)) return;
            
            setExpression(prev => `${prev} ${formattedVal} ${nextOperator}`);
            setDisplayValue(String(result));
            setPreviousValue(result);
        } else {
            setPreviousValue(inputValue);
            setExpression(`${formattedVal} ${nextOperator}`);
        }
        
        setWaitingForOperand(true);
        setOperator(nextOperator);
    }, [displayValue, operator, previousValue, waitingForOperand, error, calculate, formattedDisplayValue, expression]);

    const handleEquals = useCallback(() => {
        if (error || operator === null || previousValue === null || waitingForOperand) return;
        const inputValue = parseFloat(displayValue);
        const result = calculate(previousValue, inputValue, operator);
        if (isNaN(result)) return;

        const formattedOperand = formattedDisplayValue();
        const historyExpression = `${expression} ${formattedOperand}`;
        setHistory(prev => [...prev, `${historyExpression} = ${result}`]);

        setDisplayValue(String(result));
        setPreviousValue(null);
        setOperator(null);
        setWaitingForOperand(true);
        setExpression('');
    }, [displayValue, operator, previousValue, error, calculate, expression, waitingForOperand, formattedDisplayValue]);

    const handleHistorySelect = (entry: string) => {
        const result = entry.split(' = ')[1];
        if (result) {
            setDisplayValue(result);
            setWaitingForOperand(true);
            setIsHistoryVisible(false);
            setError(null);
            setExpression('');
        }
    };

    const handleDeleteHistoryEntry = (indexToDelete: number) => {
        setHistory(prev => prev.filter((_, index) => index !== indexToDelete));
    };

    const handleConfirmClearHistory = () => {
        setHistory([]);
        setIsClearConfirmVisible(false);
    };

    const deleteLastDigit = useCallback(() => {
        if (error || waitingForOperand) return;
        setDisplayValue(prev => {
            if (prev.length === 1 || (prev.length === 2 && prev.startsWith('-'))) {
                return '0';
            }
            return prev.slice(0, -1);
        });
    }, [error, waitingForOperand]);

    const handleBackspace = useCallback(() => {
        if (error) return;

        if (waitingForOperand) {
            if (operator) {
                setExpression('');
                setOperator(null);
                setPreviousValue(null);
            }
            setWaitingForOperand(false);
        } else {
            deleteLastDigit();
        }
    }, [error, waitingForOperand, operator, deleteLastDigit]);

    const handleButtonClick = (label: string) => {
        if (error && label !== 'AC' && label !== 'CE') return;

        switch (label) {
            case 'AC': clearAll(); break;
            case 'CE': clearEntry(); break;
            case '+/-': toggleSign(); break;
            case '⌫': handleBackspace(); break;
            case '.': inputDecimal(); break;
            case '+': case '-': case '×': case '÷': handleOperator(label); break;
            case '=': handleEquals(); break;
            default: if (!isNaN(Number(label))) { inputDigit(label); } break;
        }
    };
    
    const currentFormattedValue = formattedDisplayValue();

    const getDisplayFontSize = () => {
        if (error) return 'text-4xl';
        const length = currentFormattedValue.length;
        if (length > 17) return 'text-3xl';
        if (length > 13) return 'text-4xl';
        if (length > 11) return 'text-5xl';
        if (length > 9) return 'text-6xl';
        if (length > 7) return 'text-7xl';
        return 'text-8xl';
    };

    const isPristine = displayValue === '0' && previousValue === null && !waitingForOperand && !error;
    const clearButtonLabel = isPristine ? 'AC' : 'CE';

    const buttonLayout: ButtonConfig[][] = [
        [{ label: clearButtonLabel, type: ButtonType.FUNCTION }, { label: '+/-', type: ButtonType.FUNCTION }, { label: '⌫', type: ButtonType.FUNCTION }, { label: '÷', type: ButtonType.OPERATOR }],
        [{ label: '7', type: ButtonType.NUMBER }, { label: '8', type: ButtonType.NUMBER }, { label: '9', type: ButtonType.NUMBER }, { label: '×', type: ButtonType.OPERATOR }],
        [{ label: '4', type: ButtonType.NUMBER }, { label: '5', type: ButtonType.NUMBER }, { label: '6', type: ButtonType.NUMBER }, { label: '-', type: ButtonType.OPERATOR }],
        [{ label: '1', type: ButtonType.NUMBER }, { label: '2', type: ButtonType.NUMBER }, { label: '3', type: ButtonType.NUMBER }, { label: '+', type: ButtonType.OPERATOR }],
        [{ label: '0', type: ButtonType.NUMBER, className: 'col-span-2 !justify-start pl-8' }, { label: '.', type: ButtonType.NUMBER }, { label: '=', type: ButtonType.OPERATOR }],
    ];

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchMoved.current = false;
        longPressTimer.current = setTimeout(() => {
            if (!touchMoved.current) {
                navigator.clipboard.writeText(displayValue);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 1500);
            }
            longPressTimer.current = null;
        }, 500);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (touchStartX.current === null) return;
        const deltaX = Math.abs(e.targetTouches[0].clientX - touchStartX.current);
        if (deltaX > 10) {
            touchMoved.current = true;
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
        }
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }

        if (touchMoved.current && touchStartX.current !== null) {
            const touchEndX = e.changedTouches[0].clientX;
            const deltaX = touchEndX - touchStartX.current;
            if (Math.abs(deltaX) > 50) {
                deleteLastDigit();
            }
        }
        touchStartX.current = null;
    };

    return (
        <div className="bg-black flex justify-center items-center h-screen w-screen">
            <div className="w-full max-w-sm mx-auto h-full p-4 flex flex-col justify-end relative">
                <div 
                    className="text-white text-right h-28 flex flex-col items-end justify-center pr-6 overflow-hidden relative"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                     {isCopied && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-neutral-700 text-white text-xs px-3 py-1 rounded-full animate-fade-in-out">
                            Copied!
                        </div>
                    )}
                    <button
                        onClick={() => setIsHistoryVisible(true)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white focus:outline-none p-2 rounded-full hover:bg-neutral-800"
                        aria-label="View calculation history"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    {expression && (
                        <div className="text-white text-4xl font-light w-full truncate mb-2" aria-live="polite">
                            {expression}
                        </div>
                    )}
                    <h1 className={`font-light transition-all duration-200 w-full ${expression ? 'text-neutral-400 text-5xl' : getDisplayFontSize()}`}>
                        {currentFormattedValue}
                    </h1>
                </div>

                <div className="grid grid-cols-4 gap-3 py-4">
                    {buttonLayout.flat().map((btn) => (
                        <CalculatorButton
                            key={btn.label}
                            label={btn.label}
                            onClick={handleButtonClick}
                            type={btn.type}
                            className={btn.className}
                        />
                    ))}
                </div>

                <HistoryPanel
                    isVisible={isHistoryVisible}
                    history={history}
                    onSelect={handleHistorySelect}
                    onClose={() => setIsHistoryVisible(false)}
                    onDelete={handleDeleteHistoryEntry}
                    onClearAll={() => setIsClearConfirmVisible(true)}
                />

                <ConfirmationModal
                    isOpen={isClearConfirmVisible}
                    onClose={() => setIsClearConfirmVisible(false)}
                    onConfirm={handleConfirmClearHistory}
                    title="Clear History"
                >
                   <p>Are you sure you want to clear all calculation history? This action cannot be undone.</p>
                </ConfirmationModal>
            </div>
        </div>
    );
};

export default App;
