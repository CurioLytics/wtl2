'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface DateRangeFilterProps {
    onDateRangeChange: (startDate: string | null, endDate: string | null) => void;
}

export function DateRangeFilter({ onDateRangeChange }: DateRangeFilterProps) {
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [isOpen, setIsOpen] = useState(false);

    const handleApply = () => {
        onDateRangeChange(
            startDate || null,
            endDate || null
        );
        setIsOpen(false);
    };

    const handleClear = () => {
        setStartDate('');
        setEndDate('');
        onDateRangeChange(null, null);
        setIsOpen(false);
    };

    const hasActiveFilter = startDate || endDate;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors min-w-[150px] justify-between ${hasActiveFilter ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                        }`}
                >
                    <span className={`text-sm font-medium ${hasActiveFilter ? 'text-blue-700' : 'text-gray-700'}`}>
                        Lọc ngày
                    </span>
                    <Calendar className={`h-4 w-4 ${hasActiveFilter ? 'text-blue-500' : 'text-gray-500'}`} />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 bg-white z-50" align="start">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Từ ngày</label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Đến ngày</label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button onClick={handleClear} className="btn-black-outline px-4 py-2 text-sm">
                            Xóa
                        </button>
                        <button onClick={handleApply} className="btn-black-primary px-4 py-2 text-sm">
                            Áp dụng
                        </button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
