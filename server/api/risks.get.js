import connectDB from '../utils/db.js';
import ProjectPerformance from '../models/ProjectPerformance.js';

export default defineEventHandler(async (event) => {
  try {
    await connectDB();
    const query = getQuery(event);
    const period = (query.period || 'daily').toLowerCase();
    const selectedProject = query.project || 'ALL';
    const selectedSeverity = query.severity || 'ALL';
    const range = parseInt(query.range || '10', 10);

    // 1. Fetch distinct projects list from DB
    const rawCompanies = await ProjectPerformance.distinct('companyName', {
      companyName: { $exists: true, $ne: '' }
    });
    const projectsList = [...new Set(rawCompanies.filter(Boolean).map(c => c.trim()))].sort();
    const fallbackProjects = ['Barena ERP', 'DevOps Tasks', 'FLEXA ERP', 'Glow Box', 'Honda POC', 'IPOPS', 'Jom Smart Central', 'WONDERKIDS OT'];
    if (!projectsList.length) projectsList.push(...fallbackProjects);

    // 2. Build Query Filter
    const dbFilter = {};
    if (period && ['daily', 'weekly', 'monthly'].includes(period)) {
      dbFilter.reportType = period;
    }
    if (selectedProject && selectedProject !== 'ALL') {
      dbFilter.companyName = { $regex: new RegExp(`^${selectedProject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
    }

    let records = await ProjectPerformance.find(dbFilter)
      .sort({ generatedAt: -1 })
      .limit(range * 6)
      .lean();

    // Fallback if specific reportType query yields no results
    if (!records.length && selectedProject !== 'ALL') {
      records = await ProjectPerformance.find({
        companyName: { $regex: new RegExp(`^${selectedProject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      })
        .sort({ generatedAt: -1 })
        .limit(range * 6)
        .lean();
    } else if (!records.length) {
      records = await ProjectPerformance.find({})
        .sort({ generatedAt: -1 })
        .limit(range * 6)
        .lean();
    }

    // Group latest snapshot per company
    const latestByCompany = {};
    records.forEach(rec => {
      const c = rec.companyName || 'General';
      if (!latestByCompany[c]) {
        latestByCompany[c] = rec;
      }
    });

    let activeSnapshots = Object.values(latestByCompany);
    if (selectedProject !== 'ALL') {
      activeSnapshots = activeSnapshots.filter(s =>
        (s.companyName || '').toLowerCase() === selectedProject.toLowerCase()
      );
    }

    // 3. Calculate Dynamic Risk KPIs
    let totalBlocked = 0;
    let totalOverdue = 0;
    let totalUnassigned = 0;
    let totalHighPriority = 0;
    let totalBugs = 0;
    let healthScores = [];
    let atRiskDevSet = new Set();
    let aggregatedRiskItems = [];

    // Create a deterministic index map for all projects
    const companyIndexMap = {};
    projectsList.forEach((p, idx) => {
      companyIndexMap[p] = idx;
    });

    activeSnapshots.forEach((snap, snapIdx) => {
      const kpis = snap.kpis || {};
      const comp = snap.companyName || 'General Project';
      const projIdx = companyIndexMap[comp] !== undefined ? companyIndexMap[comp] : snapIdx;

      totalBlocked += (kpis.blocked || 0);
      totalOverdue += (kpis.overdue || 0);
      totalUnassigned += (kpis.unassignedSprint || 0) + (kpis.backlogUnassigned || 0);
      totalHighPriority += (kpis.highPriority || 0);
      totalBugs += (kpis.bugCount || 0);
      if (typeof kpis.healthScore === 'number') {
        healthScores.push(kpis.healthScore);
      }

      // Check team members at risk
      (snap.team || []).forEach(m => {
        if (m.status === 'At Risk' || m.status === 'Overloaded' || (m.blocked && m.blocked > 1)) {
          atRiskDevSet.add(`${m.name} (${comp})`);
        }
      });

      // Collect risks & blockers from DB analysis object
      const dbRisks = snap.analysis?.risks || [];
      const dbBlockers = snap.analysis?.blockers || [];

      dbRisks.forEach((rText, rIdx) => {
        const idNum = (projIdx * 10) + rIdx + 101;
        const lower = rText.toLowerCase();
        const sev = lower.includes('critical') || lower.includes('delay') || lower.includes('severe') ? 'Critical'
                  : lower.includes('high') || lower.includes('blocked') || lower.includes('risk') ? 'High'
                  : 'Medium';

        aggregatedRiskItems.push({
          id: `RSK-${idNum}`,
          project: comp,
          category: 'Delivery Risk',
          severity: sev,
          title: rText,
          affected: snap.team?.[0]?.name || 'Engineering Team',
          impact: 'Potential sprint completion delay and velocity drag',
          action: 'Re-assign blocked tickets and initiate daily escalation sync',
          status: sev === 'Critical' ? 'Active' : 'Monitoring'
        });
      });

      dbBlockers.forEach((bText, bIdx) => {
        const idNum = (projIdx * 10) + bIdx + 501;
        aggregatedRiskItems.push({
          id: `BLK-${idNum}`,
          project: comp,
          category: 'Technical Blocker',
          severity: 'Critical',
          title: bText,
          affected: snap.team?.[1]?.name || 'Sprint Lead',
          impact: 'Dependency impasse halting task progress',
          action: 'Immediate senior engineer code review & unblock',
          status: 'Active'
        });
      });

      // If DB analysis is empty, generate dynamic risk items from KPIs
      if (!dbRisks.length && !dbBlockers.length) {
        if (kpis.blocked > 0) {
          aggregatedRiskItems.push({
            id: `BLK-${projIdx * 10 + 201}`,
            project: comp,
            category: 'Technical Blocker',
            severity: 'Critical',
            title: `${kpis.blocked} Critical blocker tickets halting execution in ${snap.sprintName || 'Active Sprint'}`,
            affected: snap.team?.[0]?.name || 'Sprint Team',
            impact: 'Core release deliverable held up',
            action: 'Prioritize daily standup blocker resolution',
            status: 'Active'
          });
        }
        if (kpis.overdue > 0) {
          aggregatedRiskItems.push({
            id: `RSK-${projIdx * 10 + 301}`,
            project: comp,
            category: 'Overdue Tasks',
            severity: 'High',
            title: `${kpis.overdue} Tasks exceeded committed sprint SLA timeframe`,
            affected: snap.team?.[1]?.name || 'QA Lead',
            impact: 'Release date target risk',
            action: 'Re-estimate remaining work items',
            status: 'Active'
          });
        }
        if (kpis.bugCount > 3) {
          aggregatedRiskItems.push({
            id: `BUG-${projIdx * 10 + 401}`,
            project: comp,
            category: 'Quality & Bugs',
            severity: 'Medium',
            title: `${kpis.bugCount} Open bug reports impacting sprint stabilization`,
            affected: 'QA Team',
            impact: 'Acceptance testing delay',
            action: 'Initiate bug triage sprint block',
            status: 'Monitoring'
          });
        }
      }
    });

    // Default baseline risk items if still empty
    if (!aggregatedRiskItems.length) {
      aggregatedRiskItems = [
        {
          id: 'RSK-101',
          project: selectedProject !== 'ALL' ? selectedProject : (projectsList[0] || 'Barena ERP'),
          category: 'Technical Blocker',
          severity: 'Critical',
          title: 'Database connection pool saturation blocking API response',
          affected: 'Backend Squad',
          impact: 'Sprint completion rate delayed by 18%',
          action: 'Optimize connection pool & add indexes',
          status: 'Active'
        },
        {
          id: 'RSK-102',
          project: selectedProject !== 'ALL' ? selectedProject : (projectsList[1] || 'DevOps Tasks'),
          category: 'Developer Burnout',
          severity: 'High',
          title: 'Senior Engineers loaded over 115% capacity threshold',
          affected: 'DevOps Lead',
          impact: 'High risk of sprint scope rollover',
          action: 'Re-balance pending story points to available capacity',
          status: 'Active'
        },
        {
          id: 'RSK-103',
          project: selectedProject !== 'ALL' ? selectedProject : (projectsList[2] || 'FLEXA ERP'),
          category: 'Overdue Tasks',
          severity: 'Medium',
          title: 'High-priority bug tickets past SLA resolution target',
          affected: 'QA Team',
          impact: 'Customer QA acceptance pending',
          action: 'Prioritize bug fixing sprint backlog',
          status: 'Monitoring'
        }
      ];
    }

    // Filter aggregated risks by severity
    let filteredRiskItems = aggregatedRiskItems;
    if (selectedSeverity !== 'ALL') {
      filteredRiskItems = aggregatedRiskItems.filter(r =>
        r.severity.toUpperCase() === selectedSeverity.toUpperCase()
      );
    }

    const meanHealth = healthScores.length
      ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length)
      : 82;

    const totalRisksCount = filteredRiskItems.length;

    // 8 Executive KPI Cards
    const executiveKpis = {
      totalActiveRisks: {
        name: 'Total Active Risks',
        value: `${totalRisksCount} Risks`,
        trend: `${totalRisksCount > 4 ? 'High Alert' : 'Normal'}`,
        trendDir: totalRisksCount > 4 ? 'down' : 'up',
        variant: 'rose'
      },
      criticalBlockers: {
        name: 'Critical Blockers',
        value: `${totalBlocked} Blocked`,
        trend: totalBlocked > 0 ? `+${totalBlocked} Action Req` : 'Zero Blockers',
        trendDir: totalBlocked > 0 ? 'down' : 'up',
        variant: 'rose'
      },
      overdueTasks: {
        name: 'Overdue Delivery Tasks',
        value: `${totalOverdue} Overdue`,
        trend: totalOverdue > 2 ? 'Past SLA' : 'On Track',
        trendDir: totalOverdue > 2 ? 'down' : 'up',
        variant: 'amber'
      },
      atRiskEngineers: {
        name: 'At-Risk Engineers',
        value: `${atRiskDevSet.size} Devs`,
        trend: atRiskDevSet.size > 0 ? 'Capacity Alert' : 'Balanced',
        trendDir: atRiskDevSet.size > 0 ? 'down' : 'up',
        variant: 'amber'
      },
      unassignedPriority: {
        name: 'Unassigned Sprint Items',
        value: `${totalUnassigned} Unassigned`,
        trend: totalUnassigned > 5 ? 'High Backlog' : 'Well Assigned',
        trendDir: totalUnassigned > 5 ? 'down' : 'up',
        variant: 'purple'
      },
      highPriorityVulns: {
        name: 'High Priority Issues',
        value: `${totalHighPriority} Issues`,
        trend: `${totalHighPriority} Open`,
        trendDir: 'down',
        variant: 'indigo'
      },
      bugCountImpact: {
        name: 'Open Bug Impact',
        value: `${totalBugs} Bugs`,
        trend: totalBugs > 5 ? 'Quality Risk' : 'Stable',
        trendDir: totalBugs > 5 ? 'down' : 'up',
        variant: 'cyan'
      },
      avgHealthScore: {
        name: 'Overall Health Index',
        value: `${meanHealth} / 100`,
        trend: meanHealth >= 80 ? 'Healthy' : 'Needs Support',
        trendDir: meanHealth >= 80 ? 'up' : 'down',
        variant: 'emerald'
      }
    };

    // Project Risk Heatmap
    const projectRiskHeatmap = activeSnapshots.map(snap => {
      const kpis = snap.kpis || {};
      const blocked = kpis.blocked || 0;
      const overdue = kpis.overdue || 0;
      const health = kpis.healthScore || 80;
      const riskScore = Math.min(100, Math.max(10, Math.round((100 - health) + (blocked * 12) + (overdue * 8))));

      const level = riskScore >= 60 ? 'Critical'
                  : riskScore >= 40 ? 'High'
                  : riskScore >= 20 ? 'Medium'
                  : 'Low';

      return {
        companyName: snap.companyName || 'Project',
        riskScore,
        level,
        blocked,
        overdue,
        healthScore: health,
        sprintName: snap.sprintName || 'Active Sprint'
      };
    }).sort((a, b) => b.riskScore - a.riskScore);

    // Dynamic Risk Trend Points for SVG Chart
    const trendRecords = records.slice(0, range).reverse();
    const riskTrendPoints = trendRecords.map((rec, idx) => {
      const k = rec.kpis || {};
      const blocked = k.blocked || 0;
      const overdue = k.overdue || 0;
      const riskIndex = Math.min(100, Math.max(15, Math.round((blocked * 18) + (overdue * 12) + ((100 - (k.healthScore || 80)) * 0.5) + 15)));
      return {
        sprint: rec.sprintName ? rec.sprintName.replace('Sprint ', 'S') : `S${idx + 1}`,
        blocked,
        overdue,
        riskIndex
      };
    });

    // AI Risk Intelligence Summary
    const targetProjName = selectedProject !== 'ALL' ? selectedProject : 'All Active Projects';
    const aiRiskIntelligence = {
      summaryHeadline: `Risk Assessment (${targetProjName}): ${totalBlocked} critical blockers and ${atRiskDevSet.size} overloaded engineers require capacity rebalancing.`,
      keyRisks: [
        `Dependency Deadlock: ${totalBlocked} tasks blocked in ${targetProjName} workflows`,
        `Capacity Strain: ${atRiskDevSet.size} engineers operating above safe bandwidth thresholds`,
        `SLA Exposure: ${totalOverdue} tickets exceeded target delivery SLA window`
      ],
      mitigationActions: [
        `Reassign unblocked backlog items in ${targetProjName} to engineers with under 80% utilization`,
        'Hold emergency blocker resolution standup with tech lead',
        'Enforce code review turnaround SLAs to prevent PR bottlenecking'
      ]
    };

    return {
      success: true,
      projectsList,
      executiveKpis,
      projectRiskHeatmap,
      riskTrendPoints,
      riskItems: filteredRiskItems,
      allRiskItemsCount: totalRisksCount,
      aiRiskIntelligence,
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching risk monitor data:', error);
    return {
      success: false,
      message: 'Failed to fetch risk monitor data',
      error: error.message
    };
  }
});
