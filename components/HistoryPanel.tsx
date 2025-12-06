import React from 'react';

interface HistoryPanelProps {
    isVisible: boolean;
    history: string[];
    onSelect: (entry: string) => void;
    onClose: () => void;
    onDelete: (index: number) => void;
    onClearAll: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isVisible, history, onSelect, onClose, onDelete, onClearAll }) => {
    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black bg-opacity-50 z-10 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                aria-hidden="true"
            ></div>

            {/* Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-4/5 max-w-xs bg-neutral-900 shadow-lg z-20 transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="history-title"
            >
                <div className="p-4 flex justify-between items-center border-b border-neutral-700">
                    <h2 id="history-title" className="text-white text-xl">History</h2>
                    <div>
                        {history.length > 0 && (
                            <button
                                onClick={onClearAll}
                                className="text-orange-500 hover:text-orange-400 text-sm mr-4"
                                aria-label="Clear all history"
                            >
                                Clear
                            </button>
                        )}
                        <button onClick={onClose} className="text-neutral-400 hover:text-white inline-block" aria-label="Close history panel">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="p-4 text-neutral-300 overflow-y-auto h-[calc(100%-65px)]">
                    {history.length === 0 ? (
                        <p className="text-center text-neutral-500 mt-8">No history yet.</p>
                    ) : (
                        <ul className="space-y-2 text-right">
                            {history.slice().reverse().map((entry, index) => {
                                const [expression, result] = entry.split(' = ');
                                const originalIndex = history.length - 1 - index;
                                return (
                                    <li key={originalIndex} className="group hover:bg-neutral-800 p-2 rounded-md flex justify-between items-center gap-2">
                                        <button
                                            onClick={() => onDelete(originalIndex)}
                                            className="text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                                            aria-label={`Delete entry: ${entry}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>
                                        <div onClick={() => onSelect(entry)} className="flex-grow cursor-pointer">
                                            <div className="text-neutral-500 text-sm">{expression} =</div>
                                            <div className="text-white text-2xl">{result}</div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
};

export default HistoryPanel;
