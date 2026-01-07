
const fetch = require('node-fetch'); // Using node-fetch for script
const API_URL = "https://purrbackend.onrender.com/api";

const THRESHOLDS = {
    strict: { weight: { urgent: 0.02 }, frequency: { critical: 2 } },
    standard: { weight: { urgent: 0.03 }, frequency: { critical: 3 } },
    kitten: { weight: { urgent: 0.04 }, frequency: { critical: 5 } }
};

const calculateWeightAlerts = (visits, mode = "standard") => {
    const alerts = [];
    const thresholds = THRESHOLDS[mode].weight;

    // Simple logic replication from alertService.js
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Baseline (8-14 days ago)
    const baselineStart = new Date();
    baselineStart.setDate(baselineStart.getDate() - 14);
    const baselineEnd = new Date();
    baselineEnd.setDate(baselineEnd.getDate() - 7);

    const baselineVisits = visits.filter(v => {
        const d = new Date(v.entryTime);
        return d >= baselineStart && d <= baselineEnd;
    });

    if (baselineVisits.length === 0) return ["No baseline data"];

    const baselineWeight = baselineVisits.reduce((sum, v) => sum + v.weightIn, 0) / baselineVisits.length;
    console.log(`Baseline Weight: ${baselineWeight.toFixed(2)}kg (from ${baselineVisits.length} visits)`);

    // Urgent Loss Check
    const recentVisits = visits.sort((a, b) => new Date(a.entryTime) - new Date(b.entryTime));
    const latest = recentVisits[recentVisits.length - 1];

    if (latest) {
        console.log(`Latest Weight: ${latest.weightIn}kg at ${latest.entryTime}`);
        const change = (latest.weightIn - baselineWeight) / baselineWeight;
        console.log(`Weight Change: ${(change * 100).toFixed(1)}%`);

        if (change < -thresholds.urgent) {
            alerts.push(`URGENT WEIGHT LOSS: ${(change * 100).toFixed(1)}%`);
        }
    }

    return alerts;
};

const calculateFrequencyAlerts = (visits, mode = "standard") => {
    const alerts = [];
    const thresholds = THRESHOLDS[mode].frequency;

    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const lastHourVisits = visits.filter(v => new Date(v.entryTime) >= oneHourAgo);
    console.log(`Visits in last hour: ${lastHourVisits.length}`);

    if (lastHourVisits.length >= thresholds.critical) {
        alerts.push(`CRITICAL FREQUENCY: ${lastHourVisits.length} visits in 1 hour`);
    }

    return alerts;
};

const run = async () => {
    try {
        console.log(`Fetching from ${API_URL}/cats/visits...`);
        const res = await fetch(`${API_URL}/cats/visits`);
        if (!res.ok) {
            console.error("API Error:", res.status, res.statusText);
            return;
        }
        const visits = await res.json();
        console.log(`Fetched ${visits.length} visits.`);

        if (visits.length === 0) {
            console.log("No visits found. Seed script might have failed?");
            return;
        }

        console.log("--- Analyze Standard Mode ---");
        const wAlerts = calculateWeightAlerts(visits, "standard");
        const fAlerts = calculateFrequencyAlerts(visits, "standard");

        console.log("\n--- RESULTS ---");
        console.log("Weight Alerts:", wAlerts);
        console.log("Frequency Alerts:", fAlerts);

        if (wAlerts.length > 0 || fAlerts.length > 0) {
            console.log("\nSUCCESS: Alerts should be generating!");
        } else {
            console.log("\nFAILURE: No alerts generated despite data.");
        }

    } catch (e) {
        console.error("Execution error:", e);
    }
};

run();
