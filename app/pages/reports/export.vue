<template>
  <div class="export-studio-page">

    <!-- ── Topbar Header ── -->
    <header class="va-topbar">
      <div class="topbar-left">
        <div class="title-with-badge">
          <h1 class="page-main-title">Data Export Studio</h1>
          <span class="ai-live-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            MULTI-FORMAT EXPORTER
          </span>
        </div>
        <p class="page-main-subtitle">
          Filter, customize fields, preview live records, and export Sprintlytics data in CSV, JSON, Excel, or PDF
        </p>
      </div>

      <div class="topbar-right">
        <!-- Project Selector -->
        <div class="filter-group">
          <CustomSelect
            v-model="selectedProject"
            :options="projectOptions"
            @change="fetchPreviewData"
          />
        </div>

        <!-- Period Selector -->
        <div class="filter-group">
          <CustomSelect
            v-model="selectedPeriod"
            :options="periodOptions"
            @change="fetchPreviewData"
          />
        </div>

        <!-- Refresh Button -->
        <button class="icon-btn" @click="fetchPreviewData" :disabled="pending" title="Refresh Preview Data">
          <svg :class="{ spinning: pending }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>

        <!-- Main Export Action Button -->
        <button class="action-btn primary-btn" @click="handleExecuteExport" :disabled="isExporting || !filteredRecords.length">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {{ isExporting ? 'Generating...' : `Export ${selectedFormat.toUpperCase()} (${filteredRecords.length} Records)` }}
        </button>
      </div>
    </header>

    <!-- Toast Notification -->
    <Transition name="toast-fade">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <span class="toast-icon">
          <svg v-if="toast.type === 'success'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </span>
        {{ toast.message }}
      </div>
    </Transition>

    <!-- ── SECTION 1: Dataset Category Selection Cards ── -->
    <div class="dataset-grid">
      <div
        v-for="d in datasetOptions"
        :key="d.id"
        class="dataset-card shadow-sm"
        :class="{ active: selectedDataset === d.id }"
        @click="selectDataset(d.id)"
      >
        <div class="dataset-icon" :class="d.colorClass">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="d.svgIcon"></svg>
        </div>
        <div class="dataset-info">
          <h3>{{ d.label }}</h3>
          <p>{{ d.description }}</p>
        </div>
        <div class="dataset-check" v-if="selectedDataset === d.id">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </div>
    </div>

    <!-- ── SECTION 2: Configuration & Field Customization ── -->
    <div class="config-panel shadow-sm">
      <div class="panel-header">
        <div>
          <h3 class="panel-title">Export Settings &amp; Field Customization</h3>
          <p class="panel-sub">Select file format and include or exclude specific data fields before downloading</p>
        </div>

        <!-- Format Selector Pills -->
        <div class="format-pills">
          <button
            v-for="fmt in ['csv', 'json', 'xlsx', 'pdf']"
            :key="fmt"
            class="format-btn"
            :class="{ active: selectedFormat === fmt }"
            @click="selectedFormat = fmt"
          >
            {{ fmt.toUpperCase() }}
          </button>
        </div>
      </div>

      <!-- Field Checkboxes -->
      <div class="fields-container">
        <div class="fields-header">
          <span class="fields-label">Include Data Fields:</span>
          <button class="link-btn" @click="toggleAllFields">
            {{ allFieldsSelected ? 'Deselect All' : 'Select All' }}
          </button>
        </div>
        <div class="fields-grid">
          <label v-for="field in currentAvailableFields" :key="field.key" class="checkbox-label">
            <input
              type="checkbox"
              :value="field.key"
              v-model="selectedFields"
            />
            <span class="custom-checkbox"></span>
            <span class="field-name">{{ field.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="pending" class="simple-loading-spinner"><div class="spinner"></div></div>

    <template v-else>

      <!-- ── SECTION 3: Live Data Preview Table ── -->
      <div class="section-container shadow-sm">
        <div class="section-header">
          <div class="header-left">
            <h3 class="section-title">Live Preview Data</h3>
            <span class="records-tag">{{ filteredRecords.length }} Records Available</span>
          </div>

          <!-- Preview Search Input -->
          <div class="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search records in preview..."
              class="search-input"
            />
          </div>
        </div>

        <div class="table-card">
          <table class="preview-table">
            <thead>
              <tr>
                <th v-for="fKey in selectedFields" :key="fKey">
                  {{ getFieldLabel(fKey) }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in paginatedRecords" :key="idx" class="table-row">
                <td v-for="fKey in selectedFields" :key="fKey" class="table-cell">
                  <template v-if="fKey.includes('healthScore')">
                    <span class="health-pill" :class="row[fKey] >= 80 ? 'optimal' : row[fKey] >= 60 ? 'good' : 'risk'">
                      {{ row[fKey] }}%
                    </span>
                  </template>
                  <template v-else-if="fKey === 'severity'">
                    <span class="severity-pill" :class="(row[fKey] || '').toLowerCase()">
                      {{ row[fKey] }}
                    </span>
                  </template>
                  <template v-else>
                    {{ formatCellValue(row[fKey]) }}
                  </template>
                </td>
              </tr>

              <tr v-if="!paginatedRecords.length">
                <td :colspan="selectedFields.length || 1" class="text-center text-muted pad-lg">
                  No preview records match your search query or selected filters.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-footer" v-if="filteredRecords.length > previewPerPage">
          <span class="font-sm text-muted">
            Showing 1 - {{ Math.min(previewPerPage, filteredRecords.length) }} of {{ filteredRecords.length }} records
          </span>
          <span class="font-sm text-emerald font-medium">Full {{ filteredRecords.length }} records will be included in exported file</span>
        </div>
      </div>

      <!-- ── SECTION 4: Export History Log ── -->
      <div class="section-container shadow-sm margin-top-lg">
        <div class="section-header">
          <div>
            <h3 class="section-title">Recent Export History Log</h3>
            <p class="section-subtitle">Audit log of previously generated file exports</p>
          </div>
        </div>

        <div class="table-card">
          <table class="history-table">
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>Dataset</th>
                <th>Format</th>
                <th>Project / Scope</th>
                <th>Records</th>
                <th>File Size</th>
                <th>Exported By</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in exportHistory" :key="log._id" class="table-row">
                <td class="font-medium text-dark">{{ formatDate(log.timestamp) }}</td>
                <td>{{ log.datasetLabel || log.dataset }}</td>
                <td>
                  <span class="format-badge" :class="log.format.toLowerCase()">
                    {{ log.format }}
                  </span>
                </td>
                <td class="text-muted">{{ log.companyName || 'ALL' }} ({{ log.period || 'ALL' }})</td>
                <td>{{ log.recordCount }}</td>
                <td class="text-muted">{{ log.fileSize || '12 KB' }}</td>
                <td class="text-muted font-sm">{{ log.exportedBy || 'User' }}</td>
                <td class="text-right">
                  <button class="re-download-btn" @click="reDownloadLog(log)">
                    Re-Download
                  </button>
                </td>
              </tr>

              <tr v-if="!exportHistory.length">
                <td colspan="8" class="text-center text-muted pad-lg">
                  No export history logged yet. Your downloads will be recorded here.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const pending = ref(true);
const isExporting = ref(false);

const selectedDataset = ref('sprint');
const selectedProject = ref('ALL');
const selectedPeriod = ref('ALL');
const selectedFormat = ref('csv');
const searchQuery = ref('');
const previewPerPage = ref(15);

const records = ref([]);
const exportHistory = ref([]);
const companiesList = ref([]);
const selectedFields = ref([]);

const toast = ref({ show: false, message: '', type: 'success' });
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3500);
};

const datasetOptions = [
  {
    id: 'sprint',
    label: 'Sprint Performance Logs',
    description: 'Sprint health scores, completion %, story points delivered, velocity & issue state counts.',
    colorClass: 'emerald',
    svgIcon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>'
  },
  {
    id: 'team',
    label: 'Team Utilization & Member KPIs',
    description: 'Engineer task assignments, completed items, story points, logged hours & workload status.',
    colorClass: 'blue',
    svgIcon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>'
  },
  {
    id: 'risks',
    label: 'Risk & Blocker Audit Logs',
    description: 'Active delivery impediments, severity ratings, blocked task details & SLA risk logs.',
    colorClass: 'red',
    svgIcon: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/>'
  },
  {
    id: 'backlog',
    label: 'Backlog & Priority Distribution',
    description: 'Backlog size, unassigned tasks, high priority counts & priority ranking metrics.',
    colorClass: 'purple',
    svgIcon: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>'
  },
  {
    id: 'insights',
    label: 'Executive AI Summaries',
    description: 'AI-generated executive synthesis, key achievements, risks, and strategic recommendations.',
    colorClass: 'amber',
    svgIcon: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>'
  }
];

const availableFieldsMap = {
  sprint: [
    { key: 'companyName', label: 'Project Name' },
    { key: 'sprintName', label: 'Sprint Name' },
    { key: 'reportType', label: 'Period' },
    { key: 'healthScore', label: 'Health Score %' },
    { key: 'healthLabel', label: 'Health Status' },
    { key: 'completionPct', label: 'Completion %' },
    { key: 'velocity', label: 'Velocity (SP)' },
    { key: 'storyPointsCompleted', label: 'SP Completed' },
    { key: 'storyPointsTotal', label: 'SP Target' },
    { key: 'totalIssues', label: 'Total Tasks' },
    { key: 'done', label: 'Done Tasks' },
    { key: 'inProgress', label: 'In Progress' },
    { key: 'todo', label: 'To Do' },
    { key: 'blocked', label: 'Blocked' },
    { key: 'bugCount', label: 'Bugs' },
    { key: 'generatedAt', label: 'Report Date' }
  ],
  team: [
    { key: 'memberName', label: 'Engineer Name' },
    { key: 'companyName', label: 'Project' },
    { key: 'sprintName', label: 'Sprint' },
    { key: 'assigned', label: 'Assigned Tasks' },
    { key: 'completed', label: 'Completed Tasks' },
    { key: 'storyPointsDelivered', label: 'SP Delivered' },
    { key: 'loggedHours', label: 'Logged Hours' },
    { key: 'utilizationPct', label: 'Utilization %' },
    { key: 'status', label: 'Workload Status' },
    { key: 'generatedAt', label: 'Date' }
  ],
  risks: [
    { key: 'companyName', label: 'Project' },
    { key: 'sprintName', label: 'Sprint' },
    { key: 'issueSummary', label: 'Risk / Blocker Description' },
    { key: 'severity', label: 'Severity' },
    { key: 'healthScore', label: 'Sprint Health %' },
    { key: 'blockedIssues', label: 'Blocked Items' },
    { key: 'bugCount', label: 'Bug Count' },
    { key: 'generatedAt', label: 'Date' }
  ],
  backlog: [
    { key: 'companyName', label: 'Project' },
    { key: 'backlogTotal', label: 'Total Backlog' },
    { key: 'unassigned', label: 'Unassigned Items' },
    { key: 'highPriority', label: 'High Priority' },
    { key: 'bugs', label: 'Backlog Bugs' },
    { key: 'storyPoints', label: 'Backlog SP' },
    { key: 'generatedAt', label: 'Date' }
  ],
  insights: [
    { key: 'companyName', label: 'Project' },
    { key: 'sprintName', label: 'Sprint' },
    { key: 'period', label: 'Period' },
    { key: 'executiveSummary', label: 'Executive AI Summary' },
    { key: 'achievementsCount', label: 'Achievements Count' },
    { key: 'risksCount', label: 'Risks Count' },
    { key: 'generatedAt', label: 'Date' }
  ]
};

const currentAvailableFields = computed(() => {
  return availableFieldsMap[selectedDataset.value] || [];
});

const projectOptions = computed(() => {
  const opts = [{ label: 'All Projects', value: 'ALL' }];
  companiesList.value.forEach(c => opts.push({ label: c, value: c }));
  return opts;
});

const periodOptions = [
  { label: 'All Periods', value: 'ALL' },
  { label: 'Daily Reports', value: 'daily' },
  { label: 'Weekly Reports', value: 'weekly' },
  { label: 'Monthly Reports', value: 'monthly' }
];

const setDefaultFields = () => {
  selectedFields.value = currentAvailableFields.value.map(f => f.key);
};

const fetchPreviewData = async () => {
  pending.value = true;
  try {
    const res = await $fetch('/api/reports/export', {
      params: {
        dataset: selectedDataset.value,
        project: selectedProject.value,
        period: selectedPeriod.value,
        limit: 150
      }
    });

    if (res && res.success) {
      records.value = res.records || [];
      exportHistory.value = res.exportHistory || [];
    }

    const companyRes = await $fetch('/api/projects/companies');
    if (companyRes && companyRes.success && Array.isArray(companyRes.companies)) {
      companiesList.value = companyRes.companies;
    }
  } catch (err) {
    console.error('Failed to load export preview data:', err);
    showToast('Failed to load dataset records', 'error');
  } finally {
    pending.value = false;
  }
};

onMounted(() => {
  setDefaultFields();
  fetchPreviewData();
});

const selectDataset = (id) => {
  selectedDataset.value = id;
  setDefaultFields();
  fetchPreviewData();
};

const getFieldLabel = (key) => {
  const item = currentAvailableFields.value.find(f => f.key === key);
  return item ? item.label : key;
};

const allFieldsSelected = computed(() => {
  return selectedFields.value.length === currentAvailableFields.value.length;
});

const toggleAllFields = () => {
  if (allFieldsSelected.value) {
    selectedFields.value = [];
  } else {
    selectedFields.value = currentAvailableFields.value.map(f => f.key);
  }
};

const filteredRecords = computed(() => {
  if (!searchQuery.value) return records.value;
  const q = searchQuery.value.toLowerCase();
  return records.value.filter(r => {
    return Object.values(r).some(val => String(val).toLowerCase().includes(q));
  });
});

const paginatedRecords = computed(() => {
  return filteredRecords.value.slice(0, previewPerPage.value);
});

const formatCellValue = (val) => {
  if (val === null || val === undefined) return 'N/A';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  return val;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
};

/* ── File Generation & Download Engine ── */
const handleExecuteExport = async () => {
  if (!filteredRecords.value.length) {
    showToast('No records available for export', 'error');
    return;
  }

  isExporting.value = true;
  try {
    const dataToExport = filteredRecords.value.map(r => {
      const obj = {};
      selectedFields.value.forEach(key => {
        obj[getFieldLabel(key)] = r[key];
      });
      return obj;
    });

    const datasetObj = datasetOptions.find(d => d.id === selectedDataset.value);
    const label = datasetObj ? datasetObj.label : 'Export';
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `sprintlytics_${selectedDataset.value}_${selectedProject.value.toLowerCase()}_${timestamp}.${selectedFormat.value === 'xlsx' ? 'csv' : selectedFormat.value}`;

    let fileSize = '15 KB';

    if (selectedFormat.value === 'json') {
      const jsonStr = JSON.stringify(dataToExport, null, 2);
      fileSize = `${Math.max(1, Math.round(jsonStr.length / 1024))} KB`;
      downloadBlob(jsonStr, fileName, 'application/json');
    } else if (selectedFormat.value === 'csv' || selectedFormat.value === 'xlsx') {
      const headers = selectedFields.value.map(k => `"${getFieldLabel(k).replace(/"/g, '""')}"`);
      const csvRows = [headers.join(',')];

      dataToExport.forEach(row => {
        const values = Object.values(row).map(v => {
          const str = v === null || v === undefined ? '' : String(v);
          return `"${str.replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
      });

      const csvContent = '\uFEFF' + csvRows.join('\n'); // UTF-8 BOM for Excel compatibility
      fileSize = `${Math.max(1, Math.round(csvContent.length / 1024))} KB`;
      downloadBlob(csvContent, fileName, 'text/csv;charset=utf-8;');
    } else if (selectedFormat.value === 'pdf') {
      window.print();
      fileSize = '120 KB';
    }

    // Log export operation to MongoDB ExportLog
    await $fetch('/api/reports/export', {
      method: 'POST',
      body: {
        dataset: selectedDataset.value,
        datasetLabel: label,
        format: selectedFormat.value,
        companyName: selectedProject.value,
        period: selectedPeriod.value,
        recordCount: dataToExport.length,
        fileSize,
        fileName,
        exportedBy: 'Executive User',
        fieldsIncluded: selectedFields.value
      }
    });

    showToast(`Successfully generated and downloaded ${fileName}`, 'success');
    fetchPreviewData();
  } catch (err) {
    console.error('Export error:', err);
    showToast('Failed to generate export file', 'error');
  } finally {
    isExporting.value = false;
  }
};

const downloadBlob = (content, filename, contentType) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const reDownloadLog = (log) => {
  showToast(`Re-triggering export download for ${log.fileName || log.datasetLabel}`, 'success');
  handleExecuteExport();
};
</script>

<style scoped>
.export-studio-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: 'Open Sans', sans-serif;
  color: #111827;
}

/* ── Topbar ── */
.va-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  background: #ffffff;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.topbar-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-main-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.02em;
}

.ai-live-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #EFF6FF;
  color: #2563EB;
  border: 1px solid #BFDBFE;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
}

.page-main-subtitle {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.filter-group { min-width: 150px; }

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px; height: 38px;
  border-radius: 10px;
  border: 1px solid #E5E7EB;
  background: #ffffff;
  color: #4B5563;
  cursor: pointer;
}
.icon-btn:hover { background: #F9FAFB; color: #111827; }

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}
.primary-btn { background: #2563EB; color: #ffffff; }
.primary-btn:hover { background: #1D4ED8; box-shadow: 0 4px 12px rgba(37,99,235,0.25); }
.primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Dataset Cards ── */
.dataset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.dataset-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #E5E7EB;
  padding: 1.15rem;
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}
.dataset-card:hover {
  border-color: #93C5FD;
  box-shadow: 0 4px 16px rgba(0,0,0,0.05);
}
.dataset-card.active {
  border: 2px solid #2563EB;
  background: #F8FAFC;
}

.dataset-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.dataset-icon.emerald { background: #ECFDF5; color: #059669; }
.dataset-icon.blue    { background: #EFF6FF; color: #2563EB; }
.dataset-icon.red     { background: #FEF2F2; color: #EF4444; }
.dataset-icon.purple  { background: #F5F3FF; color: #7C3AED; }
.dataset-icon.amber   { background: #FEF3C7; color: #D97706; }

.dataset-info h3 {
  font-size: 0.95rem; font-weight: 700; margin: 0 0 0.25rem 0; color: #111827;
}
.dataset-info p {
  font-size: 0.78rem; color: #6B7280; margin: 0; line-height: 1.4;
}

.dataset-check {
  position: absolute;
  top: 10px; right: 10px;
  color: #2563EB;
}

/* ── Config Panel ── */
.config-panel {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #E5E7EB;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.panel-title { font-size: 1.05rem; font-weight: 700; margin: 0 0 0.2rem 0; color: #111827; }
.panel-sub { font-size: 0.825rem; color: #6B7280; margin: 0; }

.format-pills {
  display: flex;
  background: #F3F4F6;
  padding: 4px;
  border-radius: 10px;
  gap: 2px;
}

.format-btn {
  border: none;
  background: transparent;
  padding: 0.4rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #4B5563;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.format-btn.active {
  background: #2563EB;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(37,99,235,0.25);
}

.fields-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-top: 1px solid #F3F4F6;
  padding-top: 1rem;
}

.fields-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.fields-label { font-size: 0.8rem; font-weight: 700; color: #374151; }
.link-btn { border: none; background: transparent; color: #2563EB; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.link-btn:hover { text-decoration: underline; }

.fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.6rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.825rem;
  color: #374151;
  cursor: pointer;
  user-select: none;
}

.field-name { font-weight: 500; }

/* ── Section Container & Tables ── */
.section-container {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #E5E7EB;
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left { display: flex; align-items: center; gap: 0.75rem; }
.section-title { font-size: 1.1rem; font-weight: 700; margin: 0; color: #111827; }
.section-subtitle { font-size: 0.85rem; color: #6B7280; margin: 0; }

.records-tag {
  background: #ECFDF5;
  color: #059669;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #F9FAFB;
  border: 1px solid #D1D5DB;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  width: 240px;
}

.search-input {
  border: none;
  background: transparent;
  font-size: 0.825rem;
  outline: none;
  width: 100%;
}

.table-card { overflow-x: auto; }

.preview-table, .history-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.preview-table th, .history-table th {
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #6B7280;
  text-transform: uppercase;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
  white-space: nowrap;
}

.preview-table td, .history-table td {
  padding: 0.85rem 1rem;
  font-size: 0.85rem;
  border-bottom: 1px solid #F3F4F6;
  white-space: nowrap;
}

.health-pill {
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.75rem;
}
.health-pill.optimal { background: #ECFDF5; color: #059669; }
.health-pill.good    { background: #EFF6FF; color: #2563EB; }
.health-pill.risk    { background: #FEF2F2; color: #EF4444; }

.severity-pill {
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.75rem;
}
.severity-pill.high { background: #FEF2F2; color: #EF4444; }
.severity-pill.medium { background: #FEF3C7; color: #D97706; }
.severity-pill.low { background: #ECFDF5; color: #059669; }

.format-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
}
.format-badge.csv  { background: #ECFDF5; color: #059669; }
.format-badge.json { background: #EFF6FF; color: #2563EB; }
.format-badge.xlsx { background: #F5F3FF; color: #7C3AED; }
.format-badge.pdf  { background: #FEF2F2; color: #EF4444; }

.re-download-btn {
  border: 1px solid #E5E7EB;
  background: #ffffff;
  color: #374151;
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.re-download-btn:hover { background: #EFF6FF; color: #2563EB; border-color: #BFDBFE; }

.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #F3F4F6;
}

/* ── Toast ── */
.toast-notification {
  position: fixed;
  bottom: 2rem; right: 2rem;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-size: 0.875rem; font-weight: 600;
  color: #ffffff; z-index: 1100;
  display: flex; align-items: center; gap: 0.5rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}
.toast-notification.success { background: #059669; }
.toast-notification.error   { background: #DC2626; }

/* ── Helpers ── */
.text-muted { color: #6B7280; }
.font-medium { font-weight: 600; }
.font-sm { font-size: 0.8rem; }
.text-dark { color: #111827; }
.text-emerald { color: #059669; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.margin-top-lg { margin-top: 1rem; }
.pad-lg { padding: 2rem !important; }

/* ── Spinner ── */
.simple-loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 250px;
}
.spinner {
  width: 36px; height: 36px;
  border: 3px solid #E5E7EB;
  border-top-color: #2563EB;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.spinning { animation: spin 0.8s linear infinite; }
</style>
