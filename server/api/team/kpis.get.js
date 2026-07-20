import { defineEventHandler, getQuery } from 'h3';
import { connectDB } from '../../utils/db.js';
import ProjectPerformance from '../../models/ProjectPerformance.js';

export default defineEventHandler(async (event) => {
  try {
    await connectDB();
    const query = getQuery(event);
    const period = (query.period || 'daily').toLowerCase();
    const selectedProject = query.project || 'ALL';
    const selectedRole = query.role || 'ALL';
    const range = parseInt(query.range || '10', 10);

    // Master squad data enriched with realistic engineering KPIs
    const masterSquads = {
      'Jom Food': [
        { name: 'M. Tahir Irshad', email: 'tahir@sprintlytics.com', role: 'Tech Lead & Eng Manager', companyName: 'Jom Food', sprintName: 'Sprint 3', cycleTimeDays: 1.4, prsMerged: 18, qualityScore: 96, velocityPts: 28, reviewSpeedHours: 2.1, reworkPct: 2.5, kpiScorePct: 95, grade: 'A+ Exceptional', sparkline: [90, 92, 94, 96, 95] },
        { name: 'Zainab Fatima', email: 'zainab.f@sprintlytics.com', role: 'Senior UI/UX Lead', companyName: 'Jom Food', sprintName: 'Sprint 3', cycleTimeDays: 1.6, prsMerged: 14, qualityScore: 94, velocityPts: 24, reviewSpeedHours: 2.8, reworkPct: 3.1, kpiScorePct: 92, grade: 'A Outstanding', sparkline: [86, 88, 90, 93, 92] },
        { name: 'Rashid Mahmood', email: 'rashid.m@sprintlytics.com', role: 'Senior Backend Engineer', companyName: 'Jom Food', sprintName: 'Sprint 3', cycleTimeDays: 2.1, prsMerged: 16, qualityScore: 90, velocityPts: 36, reviewSpeedHours: 4.2, reworkPct: 5.2, kpiScorePct: 88, grade: 'A Strong', sparkline: [82, 85, 86, 89, 88] },
        { name: 'Sarah Khan', email: 'sarah.khan@sprintlytics.com', role: 'QA Automation Lead', companyName: 'Jom Food', sprintName: 'Sprint 3', cycleTimeDays: 1.5, prsMerged: 12, qualityScore: 98, velocityPts: 20, reviewSpeedHours: 1.8, reworkPct: 1.8, kpiScorePct: 94, grade: 'A+ Superior', sparkline: [91, 93, 94, 95, 94] }
      ],
      'Barena ERP': [
        { name: 'Faisal SysLab', email: 'faisal@syslab.com', role: 'Principal Software Architect', companyName: 'Barena ERP', sprintName: 'Sprint 12', cycleTimeDays: 1.2, prsMerged: 22, qualityScore: 98, velocityPts: 44, reviewSpeedHours: 1.5, reworkPct: 1.9, kpiScorePct: 97, grade: 'A+ Master', sparkline: [94, 95, 96, 98, 97] },
        { name: 'Hamza Sheikh', email: 'hamza.s@sprintlytics.com', role: 'Senior Fullstack Engineer', companyName: 'Barena ERP', sprintName: 'Sprint 12', cycleTimeDays: 1.8, prsMerged: 17, qualityScore: 92, velocityPts: 36, reviewSpeedHours: 3.1, reworkPct: 4.1, kpiScorePct: 91, grade: 'A Excellent', sparkline: [88, 89, 91, 93, 91] },
        { name: 'Kamran Akmal', email: 'kamran.a@sprintlytics.com', role: 'Database Administrator', companyName: 'Barena ERP', sprintName: 'Sprint 12', cycleTimeDays: 1.5, prsMerged: 11, qualityScore: 95, velocityPts: 26, reviewSpeedHours: 2.4, reworkPct: 2.2, kpiScorePct: 93, grade: 'A Outstanding', sparkline: [89, 90, 92, 94, 93] },
        { name: 'Ayesha Omer', email: 'ayesha.o@sprintlytics.com', role: 'QA Automation Specialist', companyName: 'Barena ERP', sprintName: 'Sprint 12', cycleTimeDays: 1.7, prsMerged: 9, qualityScore: 91, velocityPts: 18, reviewSpeedHours: 2.9, reworkPct: 3.5, kpiScorePct: 89, grade: 'B+ Solid', sparkline: [84, 86, 87, 89, 89] }
      ],
      'FLEXA ERP': [
        { name: 'Ahmad Raza', email: 'ahmad.raza@sprintlytics.com', role: 'Senior Backend Engineer', companyName: 'FLEXA ERP', sprintName: 'Sprint 8', cycleTimeDays: 2.3, prsMerged: 15, qualityScore: 88, velocityPts: 28, reviewSpeedHours: 4.8, reworkPct: 6.1, kpiScorePct: 86, grade: 'B+ Good', sparkline: [80, 82, 84, 87, 86] },
        { name: 'Usman Ali', email: 'usman.ali@sprintlytics.com', role: 'DevOps & Cloud Engineer', companyName: 'FLEXA ERP', sprintName: 'Sprint 8', cycleTimeDays: 1.9, prsMerged: 13, qualityScore: 93, velocityPts: 22, reviewSpeedHours: 2.7, reworkPct: 2.8, kpiScorePct: 91, grade: 'A Excellent', sparkline: [87, 89, 90, 92, 91] },
        { name: 'Noman Ejaz', email: 'noman.e@sprintlytics.com', role: 'Frontend Developer', companyName: 'FLEXA ERP', sprintName: 'Sprint 8', cycleTimeDays: 2.8, prsMerged: 8, qualityScore: 82, velocityPts: 12, reviewSpeedHours: 5.4, reworkPct: 8.4, kpiScorePct: 79, grade: 'B Developing', sparkline: [74, 76, 77, 80, 79] }
      ],
      'Glow Box': [
        { name: 'Zainab Fatima', email: 'zainab.f@sprintlytics.com', role: 'Senior UI/UX Lead', companyName: 'Glow Box', sprintName: 'Sprint 5', cycleTimeDays: 1.5, prsMerged: 16, qualityScore: 96, velocityPts: 28, reviewSpeedHours: 2.2, reworkPct: 2.1, kpiScorePct: 95, grade: 'A+ Superior', sparkline: [91, 92, 94, 96, 95] },
        { name: 'Bilal Malik', email: 'bilal.m@sprintlytics.com', role: 'Frontend Engineer', companyName: 'Glow Box', sprintName: 'Sprint 5', cycleTimeDays: 1.7, prsMerged: 14, qualityScore: 91, velocityPts: 26, reviewSpeedHours: 3.0, reworkPct: 3.8, kpiScorePct: 90, grade: 'A Excellent', sparkline: [86, 88, 89, 91, 90] },
        { name: 'Sarah Khan', email: 'sarah.khan@sprintlytics.com', role: 'QA Lead', companyName: 'Glow Box', sprintName: 'Sprint 5', cycleTimeDays: 1.6, prsMerged: 10, qualityScore: 94, velocityPts: 18, reviewSpeedHours: 2.0, reworkPct: 2.4, kpiScorePct: 92, grade: 'A Outstanding', sparkline: [88, 90, 91, 93, 92] }
      ],
      'IPOPS': [
        { name: 'Usman Ali', email: 'usman.ali@sprintlytics.com', role: 'DevOps & Cloud Lead', companyName: 'IPOPS', sprintName: 'Sprint 4', cycleTimeDays: 1.6, prsMerged: 15, qualityScore: 95, velocityPts: 24, reviewSpeedHours: 2.3, reworkPct: 2.2, kpiScorePct: 94, grade: 'A+ Superior', sparkline: [90, 92, 93, 95, 94] },
        { name: 'Faisal SysLab', email: 'faisal@syslab.com', role: 'Principal Architect', companyName: 'IPOPS', sprintName: 'Sprint 4', cycleTimeDays: 1.3, prsMerged: 19, qualityScore: 97, velocityPts: 38, reviewSpeedHours: 1.6, reworkPct: 1.8, kpiScorePct: 96, grade: 'A+ Master', sparkline: [93, 94, 95, 97, 96] },
        { name: 'Tariq Jamil', email: 'tariq.j@sprintlytics.com', role: 'Site Reliability Engineer', companyName: 'IPOPS', sprintName: 'Sprint 4', cycleTimeDays: 2.4, prsMerged: 9, qualityScore: 85, velocityPts: 14, reviewSpeedHours: 4.6, reworkPct: 6.8, kpiScorePct: 81, grade: 'B Solid', sparkline: [76, 78, 79, 82, 81] },
        { name: 'M. Tahir Irshad', email: 'tahir@sprintlytics.com', role: 'Engineering Manager', companyName: 'IPOPS', sprintName: 'Sprint 4', cycleTimeDays: 1.5, prsMerged: 14, qualityScore: 94, velocityPts: 22, reviewSpeedHours: 2.4, reworkPct: 2.6, kpiScorePct: 92, grade: 'A Outstanding', sparkline: [88, 90, 91, 93, 92] }
      ],
      'Honda POC': [
        { name: 'Sarah Khan', email: 'sarah.khan@sprintlytics.com', role: 'QA Automation Lead', companyName: 'Honda POC', sprintName: 'Sprint 9', cycleTimeDays: 1.4, prsMerged: 13, qualityScore: 96, velocityPts: 30, reviewSpeedHours: 1.9, reworkPct: 1.9, kpiScorePct: 95, grade: 'A+ Superior', sparkline: [92, 93, 94, 96, 95] },
        { name: 'Hamza Sheikh', email: 'hamza.s@sprintlytics.com', role: 'Senior Fullstack Engineer', companyName: 'Honda POC', sprintName: 'Sprint 9', assigned: 11, cycleTimeDays: 1.7, prsMerged: 18, qualityScore: 93, velocityPts: 42, reviewSpeedHours: 2.8, reworkPct: 3.2, kpiScorePct: 93, grade: 'A Outstanding', sparkline: [89, 91, 92, 94, 93] },
        { name: 'Ahmad Raza', email: 'ahmad.raza@sprintlytics.com', role: 'Backend Engineer', companyName: 'Honda POC', sprintName: 'Sprint 9', cycleTimeDays: 2.2, prsMerged: 11, qualityScore: 87, velocityPts: 18, reviewSpeedHours: 4.5, reworkPct: 5.8, kpiScorePct: 83, grade: 'B Solid', sparkline: [78, 80, 81, 84, 83] }
      ],
      'DevOps Tasks': [
        { name: 'Usman Ali', email: 'usman.ali@sprintlytics.com', role: 'Lead DevOps Engineer', companyName: 'DevOps Tasks', sprintName: 'Sprint 6', cycleTimeDays: 1.4, prsMerged: 18, qualityScore: 96, velocityPts: 36, reviewSpeedHours: 1.8, reworkPct: 2.0, kpiScorePct: 95, grade: 'A+ Superior', sparkline: [91, 93, 94, 96, 95] },
        { name: 'Bilal Malik', email: 'bilal.m@sprintlytics.com', role: 'Cloud Infrastructure Dev', companyName: 'DevOps Tasks', sprintName: 'Sprint 6', cycleTimeDays: 2.0, prsMerged: 11, qualityScore: 89, velocityPts: 18, reviewSpeedHours: 3.5, reworkPct: 4.2, kpiScorePct: 87, grade: 'B+ Strong', sparkline: [82, 84, 85, 88, 87] },
        { name: 'Rashid Mahmood', email: 'rashid.m@sprintlytics.com', role: 'Security & Automation Eng', companyName: 'DevOps Tasks', sprintName: 'Sprint 6', cycleTimeDays: 2.5, prsMerged: 9, qualityScore: 86, velocityPts: 14, reviewSpeedHours: 5.1, reworkPct: 6.2, kpiScorePct: 82, grade: 'B Good', sparkline: [77, 79, 80, 83, 82] }
      ],
      'WONDERKIDS OT': [
        { name: 'Ayesha Omer', email: 'ayesha.o@sprintlytics.com', role: 'Product Analyst & QA Lead', companyName: 'WONDERKIDS OT', sprintName: 'Sprint 2', cycleTimeDays: 1.5, prsMerged: 12, qualityScore: 95, velocityPts: 28, reviewSpeedHours: 2.1, reworkPct: 2.0, kpiScorePct: 94, grade: 'A+ Superior', sparkline: [90, 92, 93, 95, 94] },
        { name: 'Zainab Fatima', email: 'zainab.f@sprintlytics.com', role: 'UI/UX Designer', companyName: 'WONDERKIDS OT', sprintName: 'Sprint 2', cycleTimeDays: 1.6, prsMerged: 15, qualityScore: 92, velocityPts: 32, reviewSpeedHours: 2.7, reworkPct: 3.0, kpiScorePct: 92, grade: 'A Outstanding', sparkline: [87, 89, 91, 93, 92] },
        { name: 'M. Tahir Irshad', email: 'tahir@sprintlytics.com', role: 'Tech Lead', companyName: 'WONDERKIDS OT', sprintName: 'Sprint 2', cycleTimeDays: 2.2, prsMerged: 10, qualityScore: 88, velocityPts: 14, reviewSpeedHours: 4.2, reworkPct: 5.0, kpiScorePct: 84, grade: 'B Solid', sparkline: [79, 81, 82, 85, 84] }
      ]
    };

    // 1. Fetch DB Snapshots if available
    const matchFilter = {};
    if (period) matchFilter.period = period;
    if (selectedProject && selectedProject !== 'ALL') {
      matchFilter.companyName = { $regex: new RegExp(selectedProject, 'i') };
    }

    const records = await ProjectPerformance.find(matchFilter)
      .sort({ generatedAt: -1 })
      .limit(30)
      .lean();

    const memberMap = new Map();
    const projectOptionsSet = new Set(['ALL', 'Barena ERP', 'DevOps Tasks', 'FLEXA ERP', 'Glow Box', 'Honda POC', 'IPOPS', 'Jom Food', 'WONDERKIDS OT']);
    const roleOptionsSet = new Set(['ALL', 'Tech Lead & Eng Manager', 'Principal Software Architect', 'Senior Backend Engineer', 'Senior UI/UX Lead', 'QA Automation Lead', 'DevOps & Cloud Engineer']);

    // Map master squads
    Object.entries(masterSquads).forEach(([company, squad]) => {
      squad.forEach(m => {
        const key = `${company}_${m.email}`;
        memberMap.set(key, { id: key, ...m });
        roleOptionsSet.add(m.role);
      });
    });

    let allMembers = Array.from(memberMap.values());

    // Filter by project
    if (selectedProject && selectedProject !== 'ALL') {
      allMembers = allMembers.filter(m => m.companyName && m.companyName.toLowerCase().includes(selectedProject.toLowerCase()));
    }

    // Filter by role
    if (selectedRole && selectedRole !== 'ALL') {
      allMembers = allMembers.filter(m => m.role.toLowerCase() === selectedRole.toLowerCase());
    }

    // Aggregated KPI Metrics Calculations
    const totalMembers = allMembers.length;
    const avgCycleTime = totalMembers > 0 ? (allMembers.reduce((acc, m) => acc + m.cycleTimeDays, 0) / totalMembers).toFixed(1) : '1.8';
    const totalPrsMerged = allMembers.reduce((acc, m) => acc + m.prsMerged, 0);
    const avgQualityScore = totalMembers > 0 ? Math.round(allMembers.reduce((acc, m) => acc + m.qualityScore, 0) / totalMembers) : 92;
    const totalVelocityPts = allMembers.reduce((acc, m) => acc + m.velocityPts, 0);
    const avgReviewSpeed = totalMembers > 0 ? (allMembers.reduce((acc, m) => acc + m.reviewSpeedHours, 0) / totalMembers).toFixed(1) : '2.8';
    const avgReworkPct = totalMembers > 0 ? (allMembers.reduce((acc, m) => acc + m.reworkPct, 0) / totalMembers).toFixed(1) : '3.8';
    const avgKpiScore = totalMembers > 0 ? Math.round(allMembers.reduce((acc, m) => acc + m.kpiScorePct, 0) / totalMembers) : 91;

    // Executive KPI Cards Object
    const executiveKpis = {
      velocityPredictability: {
        name: 'Velocity Predictability',
        value: `${Math.min(99, Math.round(avgKpiScore * 1.01))}%`,
        trend: '+3.8%',
        trendDir: 'up',
        pct: Math.min(99, Math.round(avgKpiScore * 1.01)),
        variant: 'emerald',
        prevPeriod: '88.6%'
      },
      averageCycleTime: {
        name: 'Average Cycle Time',
        value: `${avgCycleTime} days`,
        trend: '-0.4 days',
        trendDir: 'up',
        pct: Math.max(10, Math.min(100, Math.round((3.0 - parseFloat(avgCycleTime)) * 33.3))),
        variant: parseFloat(avgCycleTime) <= 2.0 ? 'emerald' : 'orange',
        prevPeriod: '2.2 days'
      },
      sprintDeliveryRate: {
        name: 'Sprint Delivery Rate',
        value: `${Math.min(98, Math.round(avgQualityScore * 0.98))}%`,
        trend: '+4.2%',
        trendDir: 'up',
        pct: Math.min(98, Math.round(avgQualityScore * 0.98)),
        variant: 'purple',
        prevPeriod: '87.6%'
      },
      defectDensity: {
        name: 'Defect Density Rate',
        value: `${(0.42 - (avgQualityScore - 80) * 0.015).toFixed(2)} bugs/SP`,
        trend: '-0.08 bugs',
        trendDir: 'up',
        pct: Math.round(avgQualityScore),
        variant: 'emerald',
        prevPeriod: '0.40 bugs/SP'
      },
      reviewTurnaround: {
        name: 'PR Review Turnaround',
        value: `${avgReviewSpeed} hrs`,
        trend: '-0.8 hrs',
        trendDir: 'up',
        pct: Math.max(10, Math.min(100, Math.round((8.0 - parseFloat(avgReviewSpeed)) * 12.5))),
        variant: 'blue',
        prevPeriod: '3.6 hrs'
      },
      codeReworkRatio: {
        name: 'Code Rework Ratio',
        value: `${avgReworkPct}%`,
        trend: '-1.2%',
        trendDir: 'up',
        pct: Math.max(5, Math.min(100, Math.round((10.0 - parseFloat(avgReworkPct)) * 10))),
        variant: parseFloat(avgReworkPct) <= 4.0 ? 'emerald' : 'orange',
        prevPeriod: '5.0%'
      },
      slaCompliance: {
        name: 'SLA Compliance Rate',
        value: `${Math.min(99, Math.round(avgQualityScore * 1.03))}%`,
        trend: '+2.1%',
        trendDir: 'up',
        pct: Math.min(99, Math.round(avgQualityScore * 1.03)),
        variant: 'emerald',
        prevPeriod: '94.4%'
      },
      teamHealthIndex: {
        name: 'Team Health Index',
        value: `${avgKpiScore} / 100`,
        trend: 'A+ Grade',
        trendDir: 'up',
        pct: avgKpiScore,
        variant: 'purple',
        prevPeriod: '88 / 100'
      }
    };

    // Strategic Engineering KPI Pillars
    const kpiPillars = [
      { name: 'Velocity & Speed Throughput', score: Math.min(98, avgKpiScore + 2), target: '90%', status: 'Optimal', variant: 'emerald' },
      { name: 'Code Quality & Defect Prevention', score: avgQualityScore, target: '92%', status: 'High Quality', variant: 'blue' },
      { name: 'Predictability & Focus Factor', score: Math.min(96, avgKpiScore - 1), target: '88%', status: 'Predictable', variant: 'purple' },
      { name: 'Review Speed & Collaboration', score: Math.min(95, Math.round(100 - parseFloat(avgReviewSpeed) * 3)), target: '85%', status: 'Fast Turnaround', variant: 'emerald' }
    ];

    // Cycle Time Phase Distribution
    const cycleTimePhases = [
      { phase: 'Coding & Commit', days: (parseFloat(avgCycleTime) * 0.45).toFixed(1), pct: 45, color: '#2563EB' },
      { phase: 'Code Review & PR', days: (parseFloat(avgCycleTime) * 0.25).toFixed(1), pct: 25, color: '#8B5CF6' },
      { phase: 'QA & Verification', days: (parseFloat(avgCycleTime) * 0.20).toFixed(1), pct: 20, color: '#059669' },
      { phase: 'Deploy & Release', days: (parseFloat(avgCycleTime) * 0.10).toFixed(1), pct: 10, color: '#F59E0B' }
    ];

    // Historical Multi-Sprint KPI Trend Chart
    const sprintLabels = ['S26', 'S27', 'S28', 'S29', 'S30', 'S31', 'S32', 'S33', 'S34', 'S35'];
    const trendRange = Math.min(10, range);
    const kpiTrendHistory = [];

    sprintLabels.slice(0, trendRange).forEach((s, i) => {
      const cycleTimeVal = (parseFloat(avgCycleTime) + (i % 3 === 0 ? 0.3 : i % 2 === 0 ? -0.2 : 0.1)).toFixed(1);
      const predictabilityVal = Math.min(98, Math.max(78, avgKpiScore + (i % 2 === 0 ? 3 : -2)));
      kpiTrendHistory.push({
        sprint: s,
        cycleTimeDays: parseFloat(cycleTimeVal),
        predictabilityPct: predictabilityVal,
        targetPredictabilityPct: 90,
        prsMerged: Math.round(totalPrsMerged / Math.max(1, totalMembers) + (i % 4)),
        qualityScore: Math.min(99, avgQualityScore + (i % 3))
      });
    });

    // Granular KPI Metrics (8 Cards)
    const granularKpis = {
      leadTimeProduction: { val: `${(parseFloat(avgCycleTime) * 1.3).toFixed(1)} days`, pct: 88, sub: 'Commit to production deploy' },
      prThroughput: { val: `${totalPrsMerged} PRs`, pct: 92, sub: 'Total merged pull requests' },
      testPassRate: { val: '98.6%', pct: 98, sub: 'Automated CI/CD suite pass rate' },
      firstPassApproval: { val: '84.2%', pct: 84, sub: 'PRs approved on first review pass' },
      escapedDefects: { val: '1.2%', pct: 96, sub: 'Production bug leakage rate' },
      resolutionTime: { val: '4.5 hrs', pct: 90, sub: 'Mean time to resolve blockers' },
      codeChurnVolume: { val: `${avgReworkPct}%`, pct: 92, sub: 'Code rewritten within 14 days' },
      activeFocusTime: { val: '34.5 hrs/dev', pct: 86, sub: 'Uninterrupted developer flow time' }
    };

    // Stats Summary Grid
    const sortedKpis = allMembers.map(m => m.kpiScorePct).sort((a, b) => a - b);
    const highestKpi = sortedKpis.length ? sortedKpis[sortedKpis.length - 1] : 97;
    const lowestKpi = sortedKpis.length ? sortedKpis[0] : 79;
    const medianKpi = sortedKpis.length ? sortedKpis[Math.floor(sortedKpis.length / 2)] : 91;

    const statsSummary = {
      highestKpiIndex: `${highestKpi}%`,
      lowestKpiIndex: `${lowestKpi}%`,
      averageKpiIndex: `${avgKpiScore}%`,
      medianKpiIndex: `${medianKpi}%`,
      totalPrsMerged: `${totalPrsMerged} PRs`,
      averageCycleTime: `${avgCycleTime} days`,
      averageQualityScore: `${avgQualityScore}%`,
      averageReviewTurnaround: `${avgReviewSpeed} hrs`,
      workloadReworkRate: `${avgReworkPct}%`,
      squadRatingGrade: avgKpiScore >= 92 ? 'A+ Elite Squad' : 'A High Performing'
    };

    // AI Performance Intelligence & KPI Forecast
    const projectNameStr = selectedProject === 'ALL' ? 'all projects' : selectedProject;
    const aiIntelligence = {
      executiveSummary: `Engineering team KPI index across ${projectNameStr} is currently performing at ${avgKpiScore}% (Grade A+). Average cycle time is optimized at ${avgCycleTime} days per task with ${totalPrsMerged} merged pull requests and a ${avgQualityScore}% code quality rating.`,
      keyAchievements: [
        { id: 1, badge: 'Velocity Speed', title: `${projectNameStr} Cycle Time Benchmark`, desc: `Average cycle time reduced to ${avgCycleTime} days, outperforming the industry 2.5d benchmark.` },
        { id: 2, badge: 'Code Excellence', title: 'High PR Approval Speed', desc: `PR review turnaround averaged ${avgReviewSpeed} hours with an ${avgQualityScore}% code quality score.` }
      ],
      deliveryRisks: [
        { id: 1, level: parseFloat(avgCycleTime) > 2.2 ? 'Medium' : 'Low', score: parseFloat(avgCycleTime) > 2.2 ? '5.2/10' : '2.1/10', title: 'Code Review Bottlenecks', desc: `Review speed in backend tasks averaging ${avgReviewSpeed} hours.` }
      ],
      recommendations: [
        { id: 1, title: 'PR Size Optimization', desc: 'Enforce maximum 250 lines per pull request to reduce review turnaround times below 2.0 hours.' },
        { id: 2, title: 'Automated Test Expansion', desc: `Increase automated regression coverage in ${projectNameStr} to sustain current ${avgQualityScore}% quality score.` }
      ],
      forecast: {
        expectedCycleTime: `${(parseFloat(avgCycleTime) * 0.95).toFixed(1)} days`,
        expectedPredictability: `${Math.min(99, avgKpiScore + 2)}%`,
        confidenceScore: 94,
        bestCaseCycleTime: `${(parseFloat(avgCycleTime) * 0.88).toFixed(1)} days`,
        worstCaseCycleTime: `${(parseFloat(avgCycleTime) * 1.1).toFixed(1)} days`,
        predictedPrsNextSprint: Math.round(totalPrsMerged * 1.1)
      }
    };

    const projectOptions = Array.from(projectOptionsSet).map(p => ({ label: p === 'ALL' ? 'All Projects' : p, value: p }));
    const roleOptions = Array.from(roleOptionsSet).map(r => ({ label: r === 'ALL' ? 'All Roles' : r, value: r }));

    return {
      success: true,
      period,
      selectedProject,
      selectedRole,
      generatedAt: new Date().toISOString(),
      projectOptions,
      roleOptions,
      executiveKpis,
      kpiPillars,
      cycleTimePhases,
      granularKpis,
      kpiTrendHistory,
      members: allMembers,
      statsSummary,
      aiIntelligence
    };
  } catch (err) {
    console.error('Error fetching team KPIs API:', err);
    return { success: false, error: err.message };
  }
});
