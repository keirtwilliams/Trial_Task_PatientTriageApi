/**
 * App Controller (app.js)
 * Bridges the UI, Defensive Form Validation, and the TriageQueue API.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Queue Instance
  const triage = new TriageQueue();

  // 2. DOM Elements - Form & Inputs
  const form = document.getElementById('triage-form');
  const errorBox = document.getElementById('error-box');

  const inpName = document.getElementById('inp-name');
  const inpAge = document.getElementById('inp-age');
  const inpLevel = document.getElementById('inp-level');
  const inpComplaint = document.getElementById('inp-complaint');

  const errName = document.getElementById('err-name');
  const errAge = document.getElementById('err-age');
  const errLevel = document.getElementById('err-level');
  const errComplaint = document.getElementById('err-complaint');

  // Queue & Action Elements
  const queueContainer = document.getElementById('queue-container');
  const queueCounter = document.getElementById('queue-counter');
  
  const calledSpotlight = document.getElementById('called-spotlight');
  const calledName = document.getElementById('called-name');
  const calledMeta = document.getElementById('called-meta');

  const btnCallNext = document.getElementById('btn-call-next');
  const btnClear = document.getElementById('btn-clear');

  // Severity Metadata (Labels for UI badges)
  const LEVEL_NAMES = {
    1: 'L1 Resuscitation',
    2: 'L2 Emergent',
    3: 'L3 Urgent',
    4: 'L4 Less Urgent',
    5: 'L5 Non-Urgent'
  };

  // Reusable inline alert SVG
  const ALERT_SVG = `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  `;

  // ==========================================
  // UI VALIDATION HELPERS
  // ==========================================

  function setFieldError(inputEl, errorEl, message) {
    inputEl.classList.add('is-invalid');
    inputEl.setAttribute('aria-invalid', 'true');
    errorEl.innerHTML = `${ALERT_SVG} <span>${escapeHtml(message)}</span>`;
    errorEl.style.display = 'flex';
  }

  function clearFieldError(inputEl, errorEl) {
    inputEl.classList.remove('is-invalid');
    inputEl.removeAttribute('aria-invalid');
    errorEl.innerHTML = '';
    errorEl.style.display = 'none';
  }

  function clearAllErrors() {
    clearFieldError(inpName, errName);
    clearFieldError(inpAge, errAge);
    clearFieldError(inpLevel, errLevel);
    clearFieldError(inpComplaint, errComplaint);
    errorBox.innerHTML = '';
    errorBox.style.display = 'none';
  }

  function checkAndHideSummaryBox() {
    const hasAnyInvalid = document.querySelector('.is-invalid');
    if (!hasAnyInvalid) {
      errorBox.style.display = 'none';
      errorBox.innerHTML = '';
    }
  }

  // Real-time input listeners: automatically clear error states as user types or adjusts
  inpName.addEventListener('input', () => {
    if (inpName.value.trim().length >= 2) {
      clearFieldError(inpName, errName);
      checkAndHideSummaryBox();
    }
  });

  inpAge.addEventListener('input', () => {
    const ageVal = Number(inpAge.value);
    if (inpAge.value !== '' && !isNaN(ageVal) && ageVal >= 0 && ageVal <= 120) {
      clearFieldError(inpAge, errAge);
      checkAndHideSummaryBox();
    }
  });

  inpLevel.addEventListener('change', () => {
    if ([1, 2, 3, 4, 5].includes(Number(inpLevel.value))) {
      clearFieldError(inpLevel, errLevel);
      checkAndHideSummaryBox();
    }
  });

  inpComplaint.addEventListener('input', () => {
    if (inpComplaint.value.trim().length >= 4) {
      clearFieldError(inpComplaint, errComplaint);
      checkAndHideSummaryBox();
    }
  });

  // ==========================================
  // QUEUE RENDERING
  // ==========================================

  function renderQueue() {
    const list = triage.getQueue();
    queueCounter.textContent = `${list.length} Patient${list.length === 1 ? '' : 's'} Waiting`;

    if (list.length === 0) {
      queueContainer.innerHTML = '<div class="empty-state">No patients currently waiting in queue.</div>';
      return;
    }

    queueContainer.innerHTML = list.map((patient, index) => {
      const timeStr = patient.arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `
        <div class="patient-item lvl-${patient.level}">
          <div class="patient-left">
            <span class="rank-badge">#${index + 1}</span>
            <div class="patient-info">
              <strong>${escapeHtml(patient.name)} (${patient.age}y) &bull; <small>${patient.id}</small></strong>
              <p>
                <span>${escapeHtml(patient.complaint)}</span>
                <span class="arrival-tag">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  ${timeStr}
                </span>
              </p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <span class="badge lvl-${patient.level}">${LEVEL_NAMES[patient.level]}</span>
            <button class="btn-remove" data-id="${patient.id}" title="Remove patient">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Remove
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // FORM SUBMIT & VALIDATION EXECUTION
  // ==========================================

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameVal = inpName.value.trim();
    const ageVal = inpAge.value.trim();
    const levelVal = inpLevel.value;
    const complaintVal = inpComplaint.value.trim();

    let firstInvalid = null;
    const errorSummaryList = [];

    // Validation 1: Patient Name
    if (!nameVal || nameVal.length < 2) {
      const msg = 'Patient name is required (minimum 2 characters).';
      setFieldError(inpName, errName, msg);
      errorSummaryList.push(msg);
      if (!firstInvalid) firstInvalid = inpName;
    } else {
      clearFieldError(inpName, errName);
    }

    // Validation 2: Patient Age
    const numAge = Number(ageVal);
    if (ageVal === '' || isNaN(numAge) || numAge < 0 || numAge > 120) {
      const msg = 'Please enter a valid age between 0 and 120.';
      setFieldError(inpAge, errAge, msg);
      errorSummaryList.push(msg);
      if (!firstInvalid) firstInvalid = inpAge;
    } else {
      clearFieldError(inpAge, errAge);
    }

    // Validation 3: Triage Urgency Level
    const numLevel = Number(levelVal);
    if (![1, 2, 3, 4, 5].includes(numLevel)) {
      const msg = 'Please select a valid triage urgency level (1 to 5).';
      setFieldError(inpLevel, errLevel, msg);
      errorSummaryList.push(msg);
      if (!firstInvalid) firstInvalid = inpLevel;
    } else {
      clearFieldError(inpLevel, errLevel);
    }

    // Validation 4: Chief Complaint
    if (!complaintVal || complaintVal.length < 4) {
      const msg = 'Please enter a chief complaint (minimum 4 characters).';
      setFieldError(inpComplaint, errComplaint, msg);
      errorSummaryList.push(msg);
      if (!firstInvalid) firstInvalid = inpComplaint;
    } else {
      clearFieldError(inpComplaint, errComplaint);
    }

    // Block submission if any check failed
    if (firstInvalid) {
      errorBox.innerHTML = `
        <div class="error-box-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>Please resolve the following input errors:</span>
        </div>
        ${errorSummaryList.map(err => `<div class="error-item">&bull; ${escapeHtml(err)}</div>`).join('')}
      `;
      errorBox.style.display = 'flex';
      firstInvalid.focus();
      return;
    }

    // All validations passed successfully
    clearAllErrors();

    // Enqueue into Priority Queue API
    triage.enqueue({
      name: nameVal,
      age: numAge,
      level: numLevel,
      complaint: complaintVal
    });

    // Reset form inputs & re-render queue
    form.reset();
    inpLevel.value = '3';
    renderQueue();
  });

  // ==========================================
  // QUEUE ACTIONS
  // ==========================================

  // Call Next Patient (Dequeue)
  btnCallNext.addEventListener('click', () => {
    const nextPatient = triage.dequeue();

    if (!nextPatient) {
      alert('The waiting queue is currently empty.');
      return;
    }

    calledSpotlight.style.display = 'flex';
    calledName.textContent = `${nextPatient.name} (${nextPatient.age}y) \u2014 ${nextPatient.id}`;
    calledMeta.textContent = `[${LEVEL_NAMES[nextPatient.level]}] Reason: ${nextPatient.complaint}`;

    renderQueue();
  });

  // Remove Individual Patient
  queueContainer.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.btn-remove');
    if (removeBtn) {
      const id = removeBtn.dataset.id;
      triage.remove(id);
      renderQueue();
    }
  });

  // Clear Entire Queue
  btnClear.addEventListener('click', () => {
    triage.clear();
    calledSpotlight.style.display = 'none';
    clearAllErrors();
    renderQueue();
  });

  // HTML entity escaper
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
  }

  // Initial render (empty state)
  renderQueue();
});
