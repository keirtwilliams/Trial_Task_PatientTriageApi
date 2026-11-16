/**
 * Patient Triage Queue API (triage-api.js)
 * 
 * A clean, readable Priority Queue implementation based on the 
 * Emergency Severity Index (ESI) 5-level clinical triage standard:
 *   Level 1: Resuscitation (Immediate life threat)
 *   Level 2: Emergent (High risk, severe pain)
 *   Level 3: Urgent (Stable, needs multiple resources)
 *   Level 4: Less Urgent (Stable, simple single resource)
 *   Level 5: Non-Urgent (Routine, no resources needed)
 */

class TriageQueue {
  constructor() {
    this.queue = [];
    this.counter = 100;
  }

  /**
   * Adds a patient to the queue and re-sorts by priority.
   * Priority rule: Lower triage level number = higher priority.
   * Tie-breaker: Earlier arrival time = higher priority (FIFO).
   * 
   * @param {Object} data - { name, age, level, complaint }
   * @returns {Object} The enqueued patient with ID and arrival timestamp.
   */
  enqueue(data) {
    this.counter++;
    const patient = {
      id: `PT-${this.counter}`,
      name: data.name.trim(),
      age: Number(data.age),
      level: Number(data.level),
      complaint: data.complaint.trim(),
      arrivalTime: new Date()
    };

    this.queue.push(patient);
    this._sort();
    return patient;
  }

  /**
   * Dequeues (calls) the highest priority waiting patient.
   * @returns {Object|null} The called patient or null if queue is empty.
   */
  dequeue() {
    return this.queue.shift() || null;
  }

  /**
   * Previews the next patient in line without removing them.
   * @returns {Object|null}
   */
  peek() {
    return this.queue[0] || null;
  }

  /**
   * Returns a copy of the current waiting queue.
   * @returns {Array<Object>}
   */
  getQueue() {
    return [...this.queue];
  }

  /**
   * Removes a patient by their ID (e.g. if patient left or was transferred).
   * @param {string} id 
   * @returns {boolean} True if removed, false if not found.
   */
  remove(id) {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(p => p.id !== id);
    return this.queue.length < initialLength;
  }

  /**
   * Clears the entire queue.
   */
  clear() {
    this.queue = [];
  }

  /**
   * Internal sorting algorithm:
   * 1. Primary: Triage level ascending (1 is highest priority)
   * 2. Secondary: Arrival timestamp ascending (FIFO within same level)
   */
  _sort() {
    this.queue.sort((a, b) => {
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      return a.arrivalTime.getTime() - b.arrivalTime.getTime();
    });
  }
}

// Make accessible globally in the browser
window.TriageQueue = TriageQueue;
