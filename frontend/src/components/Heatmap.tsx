import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Tooltip } from './ui/Tooltip';
import type { HeatmapItem } from '../lib/api';

interface HeatmapProps {
  data: HeatmapItem[];
  isLoading: boolean;
}

export const Heatmap: React.FC<HeatmapProps> = ({ data, isLoading }) => {
  // Map dates in data to a fast lookup map
  const dataMap = React.useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(item => {
      map.set(item.date, item.count);
    });
    return map;
  }, [data]);

  // Generate date grid for the last 24 weeks
  const gridCells = React.useMemo(() => {
    const cells = [];
    const today = new Date();
    
    // We want 24 weeks of data (24 * 7 = 168 days)
    // Align starting day to 24 weeks ago
    const totalDays = 24 * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);

    // Roll back to the nearest Sunday of the start date to make columns neat
    const startDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDayOfWeek);

    const datePointer = new Date(startDate);

    // Loop until we cover everything up to today, padded to the end of today's week (Saturday)
    const endOfWeekToday = new Date(today);
    const endDayOfWeek = today.getDay();
    endOfWeekToday.setDate(today.getDate() + (6 - endDayOfWeek));

    while (datePointer <= endOfWeekToday) {
      const dateString = datePointer.toISOString().split('T')[0];
      const count = dataMap.get(dateString) || 0;
      
      cells.push({
        date: new Date(datePointer),
        dateString,
        count,
        isFuture: datePointer > today
      });

      datePointer.setDate(datePointer.getDate() + 1);
    }

    return cells;
  }, [dataMap]);

  // Group cells into columns (weeks)
  const columns = React.useMemo(() => {
    const cols = [];
    for (let i = 0; i < gridCells.length; i += 7) {
      cols.push(gridCells.slice(i, i + 7));
    }
    return cols;
  }, [gridCells]);

  // Helper to resolve intensity color
  const getColorClass = (count: number, isFuture: boolean) => {
    if (isFuture) return 'bg-transparent border-transparent pointer-events-none';
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700/60';
    if (count === 1) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-500/10 hover:bg-emerald-200/80 dark:hover:bg-emerald-950/50';
    if (count === 2) return 'bg-emerald-300 text-emerald-950 dark:bg-emerald-800/40 dark:text-emerald-300 border border-emerald-500/20 hover:bg-emerald-400/80 dark:hover:bg-emerald-800/60';
    if (count === 3) return 'bg-emerald-500 text-white dark:bg-emerald-600/70 border border-emerald-500/35 hover:bg-emerald-600 dark:hover:bg-emerald-600/90';
    return 'bg-emerald-700 text-white dark:bg-emerald-500 border border-emerald-400/50 hover:bg-emerald-800 dark:hover:bg-emerald-400/90 shadow-sm';
  };

  const formatDateLabel = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Focus Consistency</CardTitle>
        <CardDescription>Visualizing your daily completed tasks over the last 24 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-28 flex items-center justify-center bg-slate-50 dark:bg-slate-900/10 rounded-xl animate-pulse">
            <span className="text-xs text-slate-400">Loading contribution map...</span>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            
            {/* Heatmap Grid Wrapper */}
            <div className="overflow-x-auto pb-2 scrollbar-thin">
              <div className="flex gap-1.5 min-w-[640px] select-none p-1">
                
                {/* Day labels column */}
                <div className="flex flex-col justify-between text-[9px] font-semibold text-slate-400 dark:text-slate-500 pr-2 w-8 py-0.5 shrink-0">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>

                {/* Grid weeks */}
                <div className="flex gap-1.5 flex-1">
                  {columns.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1.5 justify-between">
                      {week.map((cell, cellIndex) => (
                        <Tooltip
                          key={cellIndex}
                          content={
                            <span className="text-[10px] leading-none">
                              {cell.isFuture 
                                ? 'Future date' 
                                : `${cell.count} task${cell.count === 1 ? '' : 's'} completed on ${formatDateLabel(cell.date)}`}
                            </span>
                          }
                        >
                          <div
                            className={cn(
                              "h-3 w-3 rounded-[3px] transition-colors duration-150 cursor-pointer",
                              getColorClass(cell.count, cell.isFuture)
                            )}
                          />
                        </Tooltip>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center justify-end gap-1.5 text-xs text-slate-400 dark:text-slate-500 px-1 pt-1">
              <span>Less</span>
              <div className="h-3 w-3 rounded-[3px] bg-slate-100 dark:bg-slate-800/60" />
              <div className="h-3 w-3 rounded-[3px] bg-emerald-100 dark:bg-emerald-950/30" />
              <div className="h-3 w-3 rounded-[3px] bg-emerald-300 dark:bg-emerald-800/40" />
              <div className="h-3 w-3 rounded-[3px] bg-emerald-500 dark:bg-emerald-600/70" />
              <div className="h-3 w-3 rounded-[3px] bg-emerald-700 dark:bg-emerald-500" />
              <span>More</span>
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Internal classname utility
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default Heatmap;
