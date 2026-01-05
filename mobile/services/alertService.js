/**
 * Alert Service - Frontend
 * Calculates health monitoring alerts from visit data
 */

// Monitoring mode thresholds
const THRESHOLDS = {
    strict: {
        weight: { urgent: 0.02, trend: 0.04, gain: 0.04 },
        frequency: { critical: 2, highPercent: 0.3, lowHours: 24 }
    },
    standard: {
        weight: { urgent: 0.03, trend: 0.05, gain: 0.05 },
        frequency: { critical: 3, highPercent: 0.5, lowHours: 24 }
    },
    kitten: {
        weight: { urgent: 0.04, trend: 0.07, gain: 0.07 },
        frequency: { critical: 5, highPercent: 1.0, lowHours: 36 }
    }
};

/**
 * Calculate baseline weight from historical visits
 */
const getBaselineWeight = (visits, days = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const baselineVisits = visits.filter(v => {
        const visitDate = new Date(v.entryTime);
        return visitDate >= cutoffDate;
    });

    if (baselineVisits.length === 0) return null;

    const totalWeight = baselineVisits.reduce((sum, v) => sum + v.weightIn, 0);
    return totalWeight / baselineVisits.length;
};

/**
 * Calculate average daily visit frequency
 */
const getAverageFrequency = (visits, days = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentVisits = visits.filter(v => {
        const visitDate = new Date(v.entryTime);
        return visitDate >= cutoffDate;
    });

    return recentVisits.length / days;
};

/**
 * Calculate weight-based alerts
 */
export const calculateWeightAlerts = (visits, catName = "Your cat", mode = "standard") => {
    const alerts = [];
    const thresholds = THRESHOLDS[mode].weight;

    // Check if we have enough data (7 days minimum)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const oldestVisit = visits.length > 0 ? visits[visits.length - 1] : null;
    if (!oldestVisit || new Date(oldestVisit.entryTime) > sevenDaysAgo) {
        // Not enough data yet
        return alerts;
    }

    // Get baseline weight (average of days 8-14)
    const baselineStart = new Date();
    baselineStart.setDate(baselineStart.getDate() - 14);
    const baselineEnd = new Date();
    baselineEnd.setDate(baselineEnd.getDate() - 7);

    const baselineVisits = visits.filter(v => {
        const visitDate = new Date(v.entryTime);
        return visitDate >= baselineStart && visitDate <= baselineEnd;
    });

    if (baselineVisits.length === 0) return alerts;

    const baselineWeight = baselineVisits.reduce((sum, v) => sum + v.weightIn, 0) / baselineVisits.length;

    // 1. Check for URGENT LOSS (>threshold% in 48 hours)
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    const recentVisits = visits
        .filter(v => new Date(v.entryTime) >= fortyEightHoursAgo)
        .sort((a, b) => new Date(a.entryTime) - new Date(b.entryTime));

    if (recentVisits.length >= 2) {
        const earliest = recentVisits[0].weightIn;
        const latest = recentVisits[recentVisits.length - 1].weightIn;
        const change = (latest - earliest) / baselineWeight;

        if (change < -thresholds.urgent) {
            alerts.push({
                id: `weight_urgent_${Date.now()}`,
                type: 'weight_urgent',
                severity: 'critical',
                message: `Sudden weight drop detected. ${catName} has lost ${Math.abs(change * 100).toFixed(1)}% in 48 hours. Significant changes can indicate dehydration. Please monitor closely.`,
                triggerData: {
                    baselineWeight: baselineWeight.toFixed(2),
                    currentWeight: latest.toFixed(2),
                    changePercent: (change * 100).toFixed(1),
                    timeframe: '48 hours'
                },
                createdAt: new Date().toISOString()
            });
        }
    }

    // 2. Check for TREND WARNING (threshold% over 14-30 days)
    const last7Days = visits.filter(v => {
        const visitDate = new Date(v.entryTime);
        return visitDate >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    });

    if (last7Days.length > 0) {
        const recentAvg = last7Days.reduce((sum, v) => sum + v.weightIn, 0) / last7Days.length;
        const trendChange = (recentAvg - baselineWeight) / baselineWeight;

        if (trendChange < -thresholds.trend) {
            alerts.push({
                id: `weight_trend_${Date.now()}`,
                type: 'weight_trend',
                severity: 'warning',
                message: `${catName} has lost ${Math.abs(trendChange * 100).toFixed(1)}% of their body weight over the last month. This gradual trend often warrants a vet consultation.`,
                triggerData: {
                    baselineWeight: baselineWeight.toFixed(2),
                    currentAverage: recentAvg.toFixed(2),
                    changePercent: (trendChange * 100).toFixed(1),
                    timeframe: '30 days'
                },
                createdAt: new Date().toISOString()
            });
        }

        // 3. Check for WEIGHT GAIN
        if (trendChange > thresholds.gain) {
            alerts.push({
                id: `weight_gain_${Date.now()}`,
                type: 'weight_gain',
                severity: 'info',
                message: `${catName} is trending upward in weight (+${(trendChange * 100).toFixed(1)}%). Consider reviewing their daily calorie intake to maintain ideal joint health.`,
                triggerData: {
                    baselineWeight: baselineWeight.toFixed(2),
                    currentAverage: recentAvg.toFixed(2),
                    changePercent: (trendChange * 100).toFixed(1),
                    timeframe: '30 days'
                },
                createdAt: new Date().toISOString()
            });
        }
    }

    return alerts;
};

/**
 * Calculate frequency-based alerts
 */
export const calculateFrequencyAlerts = (visits, catName = "Your cat", mode = "standard") => {
    const alerts = [];
    const thresholds = THRESHOLDS[mode].frequency;

    // 1. Check for CRITICAL HIGH (threshold+ visits in 1 hour)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const lastHourVisits = visits.filter(v => new Date(v.entryTime) >= oneHourAgo);

    if (lastHourVisits.length >= thresholds.critical) {
        alerts.push({
            id: `frequency_critical_${Date.now()}`,
            type: 'frequency_critical',
            severity: 'critical',
            message: `Emergency Alert: ${catName} is visiting the box repeatedly in a very short time (${lastHourVisits.length} visits in 1 hour). This may indicate a life-threatening blockage.`,
            triggerData: {
                visitCount: lastHourVisits.length,
                timeframe: '1 hour',
                threshold: thresholds.critical
            },
            createdAt: new Date().toISOString()
        });
    }

    // 2. Check for INCREASED ACTIVITY (threshold% above 7-day average)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const last7DaysVisits = visits.filter(v => new Date(v.entryTime) >= sevenDaysAgo);

    if (last7DaysVisits.length > 0) {
        const avgDaily = last7DaysVisits.length / 7;

        // Get today's count
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayVisits = visits.filter(v => new Date(v.entryTime) >= todayStart);

        if (todayVisits.length > avgDaily * (1 + thresholds.highPercent)) {
            alerts.push({
                id: `frequency_high_${Date.now()}`,
                type: 'frequency_high',
                severity: 'warning',
                message: `${catName} is visiting the box more often than usual today (${todayVisits.length} visits vs. ${avgDaily.toFixed(1)} average). Monitor for signs of discomfort or increased thirst.`,
                triggerData: {
                    todayCount: todayVisits.length,
                    averageCount: avgDaily.toFixed(1),
                    increasePercent: (((todayVisits.length - avgDaily) / avgDaily) * 100).toFixed(0)
                },
                createdAt: new Date().toISOString()
            });
        }
    }

    // 3. Check for LOW ACTIVITY (0 visits in threshold hours)
    const lowActivityCutoff = new Date();
    lowActivityCutoff.setHours(lowActivityCutoff.getHours() - thresholds.lowHours);

    const recentVisits = visits.filter(v => new Date(v.entryTime) >= lowActivityCutoff);

    if (recentVisits.length === 0) {
        alerts.push({
            id: `frequency_low_${Date.now()}`,
            type: 'frequency_low',
            severity: 'warning',
            message: `No activity detected in the litter box for ${thresholds.lowHours} hours. Please check if ${catName} is hydrated or using a different area.`,
            triggerData: {
                hoursSinceLastVisit: thresholds.lowHours,
                lastVisitTime: null
            },
            createdAt: new Date().toISOString()
        });
    }

    return alerts;
};

/**
 * Generate all alerts for a cat
 */
export const generateAllAlerts = (visits, catName = "Your cat", mode = "standard") => {
    const weightAlerts = calculateWeightAlerts(visits, catName, mode);
    const frequencyAlerts = calculateFrequencyAlerts(visits, catName, mode);

    return [...weightAlerts, ...frequencyAlerts].sort((a, b) => {
        // Sort by severity (critical first, then warning, then info)
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
    });
};
