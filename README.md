# AuraCare ED | Emergency Patient Triage Queue & API

[![Platform](https://img.shields.io/badge/Platform-Web%20(Pure%20Vanilla)-0D2B22?style=flat-square)](#)
[![Clinical Protocol](https://img.shields.io/badge/Clinical%20Standard-Emergency%20Severity%20Index%20(ESI)-E85D22?style=flat-square)](#)
[![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JavaScript-0D2B22?style=flat-square)](#)
[![Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(None)-246B54?style=flat-square)](#)

A focused, production-grade **Emergency Room (ER) Patient Triage Priority Queue** web application built with **pure HTML5, CSS3, and Vanilla JavaScript** (zero external frameworks or runtime dependencies).

---

## 1. Executive Summary & Clinical Context

### Why is this built specifically for an Emergency Room (ER)?
In an outpatient clinic, patients book fixed appointment slots and are seen in standard arrival order (**First-In, First-Out / FIFO**). 

In a **Hospital Emergency Department (ED)**, patients arrive unscheduled with conditions ranging from minor rashes to fatal cardiac arrests. A standard FIFO queue would cause preventable fatalities. Therefore, emergency departments require a **Dynamic Priority Queue** governed by the **Emergency Severity Index (ESI)**:

```
OUTPATIENT QUEUE (FIFO):
[Patient A: 10:00 AM] ──► [Patient B: 10:15 AM] ──► [Patient C: 10:30 AM]
(Strict arrival-time order; no clinical preemption)

EMERGENCY ROOM PRIORITY QUEUE (ESI Acuity Preemption):
[Rank #1: Level 1 (Cardiac Arrest)]   ◄── Preempts everyone immediately
[Rank #2: Level 2 (Severe Stroke)]     ◄── Evaluated within 15 minutes
[Rank #3: Level 3 (Appendicitis)]      ◄── Stable; evaluated within 60 minutes
[Rank #4: Level 4 (Wrist Sprain)]      ◄── Evaluated when acute cases clear
```

---

## 2. Clinical Urgency Framework (ESI 5-Level Standard)

Clinical priority is classified into five international standard tiers:

| ESI Level | Clinical Designation | Acuity Meaning | Target Max Wait | Typical ER Presentations |
|:---:|:---|:---|:---:|:---|
| **Level 1** | **Resuscitation** | Immediate life threat; patient dying | **Immediate (0m)** | Cardiac/respiratory arrest, severe trauma, anaphylaxis with airway loss |
| **Level 2** | **Emergent** | High risk of rapid collapse; severe distress | **< 15 mins** | Acute chest pain (heart attack), stroke symptoms, acute severe asthma |
| **Level 3** | **Urgent** | Stable vitals; needs **multiple resources** | **< 60 mins** | Acute appendicitis, kidney stones, fractures needing labs & X-rays |
| **Level 4** | **Less Urgent** | Stable vitals; needs **single resource** | **< 120 mins** | Simple laceration (sutures only), minor ankle sprain (X-ray only) |
| **Level 5** | **Non-Urgent** | Stable vitals; needs **zero resources** | **< 240 mins** | Prescription refills, suture removal, minor chronic skin rash |

### The Triage Decision Model (Clinical Flowchart)
```
[Arriving Patient]
        │
        ▼
Is the patient in immediate cardiac/respiratory collapse?
├── YES ──────────────────────────────────────────► LEVEL 1 (Resuscitation)
└── NO
    │
    ▼
Is this patient high-risk, confused, or in severe distress (9-10/10 pain)?
├── YES ──────────────────────────────────────────► LEVEL 2 (Emergent)
└── NO
    │
    ▼
How many diagnostic/therapeutic resources will they require?
├── Two or more resources (Labs + IV + Imaging) ─► LEVEL 3 (Urgent)
├── One resource (X-ray OR Sutures) ─────────────► LEVEL 4 (Less Urgent)
└── Zero resources (Exam / Prescription only) ───► LEVEL 5 (Non-Urgent)
```

---

## 3. Design System & Palette

The user interface adheres to a high-contrast healthcare design system:

| Token Name | Hex Code | Role in UI |
|:---|:---:|:---|
| **Primary Dark** | `#0D2B22` | Deep forest green for branding, structural headers, high-contrast typography, and primary submit buttons. |
| **Accent Orange** | `#E85D22` | Warm terracotta used for primary action buttons (*Call Next Patient*), Level 1 badges, active indicators, and input focus rings. |
| **Warm Canvas** | `#FBF3EE` | Warm linen cream used as the page background canvas and light high-contrast text. |
| **Vector Icons** | `SVG` | Clean, accessible inline SVG vector icons across all action buttons, field alerts, and timestamps. |

---

## 4. Project Architecture

The codebase is organized into four decoupled files:

```
patient_triage/
│
├── triage-api.js    # Data Structure: Standalone TriageQueue class & priority sort
├── app.js           # UI Controller: Defensive input validation & DOM updates
├── index.html       # Presentation: 2-column layout (Intake Form + Waiting Queue)
├── styles.css       # Design System: #0D2B22, #E85D22, #FBF3EE palette & tactile hover
└── README.md        # Technical Documentation & Walkthrough Script
```

---

## 5. Technical Implementation Details

### Part 1: Priority Queue Engine (`triage-api.js`)
The `TriageQueue` class manages all queue state and priority ordering:

* **`enqueue(data)`**: Registers arriving patients with a generated tracking ID (`PT-101`) and places them according to clinical urgency.
* **`dequeue()`**: Dispatches the highest priority patient from the front of the queue to be admitted into treatment.
* **`peek()`**: Previews the next patient in line without removing them from the queue.
* **`remove(id)`**: Removes a specific patient record if they depart prior to treatment.
* **`clear()`**: Resets the entire waiting list.

---

### Part 2: Defensive Validation & Reactive UI (`app.js`)
Form submission is strictly gated by client-side input validation:

1. **Full Name:** Mandatory, trimmed, minimum 2 characters.
2. **Patient Age:** Mandatory integer bounded between `0` and `120`.
3. **Severity Level:** Mandatory selection (`Level 1` through `Level 5`).
4. **Chief Complaint:** Mandatory clinical symptom description (minimum 4 characters).

**Interactive Validation Features:**
* **Field Highlighting (`.is-invalid`)**: Failing inputs receive an `#E85D22` terracotta border and a dedicated inline alert label with an SVG warning icon directly beneath the field.
* **Auto-Focusing**: Form submission automatically focuses the first invalid element for immediate correction.
* **Real-Time Error Clearing**: Attaches `input` and `change` listeners to inputs; as soon as the user starts typing or selects a valid option, the error state clears automatically.

---

### Part 3: UI Micro-Interactions (`styles.css`)
* **Input Hover & Focus**: Smooth transition from background canvas to crisp white on hover (`rgba(13, 43, 34, 0.4)` border) and an active terracotta glow on focus (`0 0 0 3px rgba(232, 93, 34, 0.18)`).
* **Tactile Buttons**:
  * Primary Enqueue (`#0D2B22`): Lifts on hover (`translateY(-1px)`) with drop shadow; depresses on active click (`translateY(0)`).
  * Call Next Patient (`#E85D22`): Vibrant glow shadow on hover; tactile click depression.
  * Clear Queue: Ghost button with dark green hover border and translucent fill.
  * Remove Item: Soft terracotta pill hover for quick cancellation.
* **Queue Item Elevation**: Patient cards subtly slide right (`translateX(4px)`) on hover.

---

## License

This project is licensed under the MIT License. Clinical triage standards are based on the Emergency Severity Index (ESI) Implementation Guidelines.
