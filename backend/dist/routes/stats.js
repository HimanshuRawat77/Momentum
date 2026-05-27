"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
// GET productivity statistics
router.get('/', async (req, res) => {
    try {
        const allTasks = await db_1.db.task.findMany({
            where: { userId: req.userId }
        });
        const now = new Date();
        // Set start of today (local time boundary)
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        // Filters
        const completedTasks = allTasks.filter(t => t.status === 'COMPLETED');
        const activeTasks = allTasks.filter(t => t.status !== 'COMPLETED');
        // 1. Calculate Today's Productivity Score
        // Points structure:
        // Low Priority = 10 pts, Medium = 15 pts, High = 25 pts
        // Bonus points based on energy level matching (e.g., Medium = +5 pts, High = +10 pts)
        const completedToday = completedTasks.filter(t => {
            if (!t.completedAt)
                return false;
            const completedDate = new Date(t.completedAt);
            return completedDate >= startOfToday && completedDate <= endOfToday;
        });
        let todayPoints = 0;
        completedToday.forEach(task => {
            let points = 10; // Base points
            if (task.priority === 'HIGH')
                points += 15;
            else if (task.priority === 'MEDIUM')
                points += 10;
            else if (task.priority === 'LOW')
                points += 5;
            if (task.energyLevel === 'HIGH')
                points += 10;
            else if (task.energyLevel === 'MEDIUM')
                points += 5;
            todayPoints += points;
        });
        // Score target: 100 points represents a 100% completed focus day
        const productivityScore = Math.min(100, todayPoints);
        // 2. GitHub Heatmap Data (last 6 months)
        // Gather counts of completed tasks for each YYYY-MM-DD
        const heatmapCounts = {};
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        // Seed empty dates for the last 6 months so client has full structure, or let client map it.
        // We will return an array of dates with completed counts
        completedTasks.forEach(task => {
            if (task.completedAt) {
                const completedDate = new Date(task.completedAt);
                if (completedDate >= sixMonthsAgo) {
                    const dateString = completedDate.toISOString().split('T')[0]; // YYYY-MM-DD
                    heatmapCounts[dateString] = (heatmapCounts[dateString] || 0) + 1;
                }
            }
        });
        const heatmapData = Object.keys(heatmapCounts).map(date => ({
            date,
            count: heatmapCounts[date]
        }));
        // 3. Energy Level Allocation Breakdown
        const energyBreakdown = {
            LOW: { total: 0, completed: 0, active: 0 },
            MEDIUM: { total: 0, completed: 0, active: 0 },
            HIGH: { total: 0, completed: 0, active: 0 }
        };
        allTasks.forEach(task => {
            const level = task.energyLevel;
            if (energyBreakdown[level]) {
                energyBreakdown[level].total += 1;
                if (task.status === 'COMPLETED') {
                    energyBreakdown[level].completed += 1;
                }
                else {
                    energyBreakdown[level].active += 1;
                }
            }
        });
        // 4. Category distribution
        const categoryCounts = {};
        allTasks.forEach(task => {
            const cat = task.category || 'General';
            if (!categoryCounts[cat]) {
                categoryCounts[cat] = { total: 0, completed: 0 };
            }
            categoryCounts[cat].total += 1;
            if (task.status === 'COMPLETED') {
                categoryCounts[cat].completed += 1;
            }
        });
        const categoryData = Object.keys(categoryCounts).map(name => ({
            name,
            total: categoryCounts[name].total,
            completed: categoryCounts[name].completed,
            active: categoryCounts[name].total - categoryCounts[name].completed
        }));
        // 5. Overall rates
        const totalTasksCount = allTasks.length;
        const completedTasksCount = completedTasks.length;
        const activeTasksCount = activeTasks.length;
        const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
        res.json({
            productivityScore,
            todayPoints,
            completionRate,
            totalTasksCount,
            completedTasksCount,
            activeTasksCount,
            completedTodayCount: completedToday.length,
            heatmapData,
            energyBreakdown,
            categoryData
        });
    }
    catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to retrieve statistics' });
    }
});
exports.default = router;
