/**
 * Modal Component
 * Deep analysis modal for trend details
 * Based on PRD Section 5 specifications
 */

class Modal {
  /**
   * @param {Object} trendData - Complete trend data object
   * @param {string} initialSection - Initial section to display (default: 'overview')
   */
  constructor(trendData, initialSection = 'overview') {
    this.data = trendData;
    this.currentSection = initialSection;
    this.element = null;
    this.contentElement = null;
    this.animationComplete = false;
  }

  /**
   * Show modal with GSAP animation
   */
  show() {
    this.render();
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Lock scroll position
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    
    // Animate in with GSAP if available, otherwise use CSS
    if (typeof gsap !== 'undefined') {
      gsap.from(this.contentElement, {
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          this.animationComplete = true;
        }
      });
      
      gsap.from('.modal-overlay', {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.out'
      });
    } else {
      // Fallback CSS animation
      requestAnimationFrame(() => {
        if (this.element) {
          this.element.classList.add('modal-overlay--visible');
          this.contentElement.classList.add('modal-content--visible');
        }
      });
    }
  }

  /**
   * Hide modal with GSAP animation
   */
  hide() {
    // Restore body scroll
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    // Animate out
    if (typeof gsap !== 'undefined') {
      gsap.to(this.element, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          this.cleanup();
        }
      });
      
      gsap.to(this.contentElement, {
        opacity: 0,
        scale: 0.95,
        duration: 0.2,
        ease: 'power2.in'
      });
    } else {
      // Fallback CSS animation
      if (this.element) {
        this.element.classList.remove('modal-overlay--visible');
        this.contentElement.classList.remove('modal-content--visible');
        
        setTimeout(() => {
          this.cleanup();
        }, 300);
      }
    }
  }

  /**
   * Render complete modal HTML
   */
  render() {
    this.element = document.createElement('div');
    this.element.className = 'modal-overlay';
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-labelledby', 'modal-title');
    
    this.element.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <button class="btn-back" data-action="close" aria-label="Close modal">
            ← Back to Dashboard
          </button>
          <button class="btn-icon" data-action="close" aria-label="Close modal">
            ✕
          </button>
        </div>
        
        <div class="modal-body">
          ${this.renderTrendHeader()}
          ${this.renderLifecycleChart()}
          ${this.renderCulturalAnalysis()}
          ${this.renderExperientialTranslation()}
          ${this.renderJackMortonApplications()}
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" data-action="download" aria-label="Download PDF report">
            Download PDF Report
          </button>
          <button class="btn-secondary" data-action="share" aria-label="Share trend">
            Share Link
          </button>
          <button class="btn-primary ${this.isSaved() ? 'saved' : ''}" data-action="save" aria-label="Save to library">
            ${this.isSaved() ? 'Saved to Library' : 'Save to Library'}
          </button>
        </div>
      </div>
    `;
    
    this.contentElement = this.element.querySelector('.modal-content');
    this.attachEventListeners();
    document.body.appendChild(this.element);
    
    // Focus trap
    this.trapFocus();
  }

  /**
   * Attach event listeners to modal elements
   */
  attachEventListeners() {
    // Close buttons
    const closeButtons = this.element.querySelectorAll('[data-action="close"]');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.hide());
    });

    // Escape key
    this.escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.hide();
      }
    };
    document.addEventListener('keydown', this.escapeHandler);

    // Click outside to close
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) {
        this.hide();
      }
    });

    // Footer buttons
    const downloadBtn = this.element.querySelector('[data-action="download"]');
    const shareBtn = this.element.querySelector('[data-action="share"]');
    const saveBtn = this.element.querySelector('[data-action="save"]');

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.handleDownload());
    }

    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.handleShare());
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.handleSave());
    }
  }

  /**
   * Render trend header section
   * @returns {string} HTML for trend header
   */
  renderTrendHeader() {
    const status = this.getPhaseLabel(this.data.currentPhase);
    const platforms = this.data.sources.map(s => s.platform).join(', ');
    
    return `
      <div class="modal-section modal-section--header">
        <div class="modal-section__category">
          <span class="modal-section__icon">${this.getCategoryIcon()}</span>
          <h1 id="modal-title" class="modal-section__title">${this.escapeHtml(this.data.title)}</h1>
        </div>
        <div class="modal-section__status">
          <span class="status-badge status-badge--${this.data.currentPhase}">
            Status: ${status}
          </span>
          <span class="status-badge status-badge--confidence">
            Confidence: ${this.data.confidence}%
          </span>
        </div>
        <div class="modal-section__meta">
          <span class="modal-section__growth">+${this.data.velocityScore}% growth</span>
          <span class="modal-section__divider">·</span>
          <span class="modal-section__platforms">${platforms}</span>
          <span class="modal-section__divider">·</span>
          <span class="modal-section__peak">Peak expected: ${this.data.peakExpected}</span>
        </div>
      </div>
    `;
  }

  /**
   * Render lifecycle chart section
   * @returns {string} HTML for lifecycle chart
   */
  renderLifecycleChart() {
    const phaseLabel = this.getPhaseLabel(this.data.currentPhase);
    const phasePercent = this.getPhasePercent(this.data.currentPhase);
    const peakWindow = this.data.peakExpected;
    
    // Map phase labels to chart positions
    const phaseMapping = {
      'Innovators': { position: 5, label: 'Innovators' },
      'Early Adopters': { position: 15, label: 'Early Adopt' },
      'Early Majority': { position: 30, label: 'Early Majority' },
      'Late Majority': { position: 50, label: 'Late Majority' },
      'Laggards': { position: 70, label: 'Laggards' }
    };
    
    const phases = ['Innovators', 'Early Adopt', 'Early Majority', 'Late Majority', 'Laggards', 'Decline'];
    const phasePositions = [5, 15, 30, 50, 70, 90];
    
    // Find current phase index using the mapping
    const currentPhaseData = phaseMapping[phaseLabel];
    const currentPhaseIndex = currentPhaseData ? phases.findIndex(p => p === currentPhaseData.label) : -1;
    const currentPosition = currentPhaseData ? currentPhaseData.position : parseInt(phasePercent);
    
    // Calculate projected position (typically current + 1 phase, or extrapolated)
    let projectedPosition = currentPosition + 20;
    if (projectedPosition > 90) projectedPosition = 90;
    if (projectedPosition < currentPosition) projectedPosition = currentPosition + 15;
    
    return `
      <div class="modal-section modal-section--chart">
        <h2 class="modal-section__heading">Trend Lifecycle</h2>
        <div class="lifecycle-chart">
          <div class="lifecycle-chart__graph">
            <div class="lifecycle-timeline">
              ${phases.map((phase, i) => `
                <div class="lifecycle-phase-marker" style="left: ${phasePositions[i]}%">
                  <div class="lifecycle-phase-dot ${i === currentPhaseIndex ? 'lifecycle-phase-dot--active' : ''}"></div>
                  <div class="lifecycle-phase-label">${phase}</div>
                </div>
              `).join('')}
              ${currentPhaseIndex >= 0 ? `
                <div class="lifecycle-indicator lifecycle-indicator--current" style="left: ${currentPosition}%">
                  <div class="lifecycle-indicator-dot lifecycle-indicator-dot--current"></div>
                  <div class="lifecycle-indicator-label">NOW</div>
                </div>
                <div class="lifecycle-indicator lifecycle-indicator--projected" style="left: ${projectedPosition}%">
                  <div class="lifecycle-indicator-dot lifecycle-indicator-dot--projected"></div>
                  <div class="lifecycle-indicator-label">PROJECTED</div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
        <div class="lifecycle-info">
          <div class="lifecycle-info-item">
            <div class="lifecycle-info-label">Current Phase</div>
            <div class="lifecycle-info-value">${phaseLabel.toUpperCase()}</div>
            <div class="lifecycle-info-sub">${phasePercent}% market penetration</div>
          </div>
          <div class="lifecycle-info-item">
            <div class="lifecycle-info-label">Launch Window</div>
            <div class="lifecycle-info-value">${peakWindow}</div>
            <div class="lifecycle-info-sub">Optimal timing for activation</div>
          </div>
          <div class="lifecycle-info-item">
            <div class="lifecycle-info-label">Risk Assessment</div>
            <div class="lifecycle-info-value">${this.getRiskLevel()}</div>
            <div class="lifecycle-info-sub">${this.getRiskDescription()}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render cultural analysis section
   * @returns {string} HTML for cultural analysis
   */
  renderCulturalAnalysis() {
    const analysis = this.data.culturalAnalysis;
    const psychology = analysis.psychology || [];
    const subcultureMap = analysis.subcultureMap || {};
    
    return `
      <div class="modal-section modal-section--analysis">
        <h2 class="modal-section__heading">Cultural Deep Dive</h2>
        
        <div class="analysis-section">
          <h3 class="analysis-section__title">The Origin Story</h3>
          <p class="analysis-section__content">${this.escapeHtml(analysis.origin)}</p>
        </div>
        
        <div class="analysis-section">
          <h3 class="analysis-section__title">Why It's Resonating Now</h3>
          <p class="analysis-section__content">${this.escapeHtml(analysis.whyNow)}</p>
        </div>
        
        <div class="analysis-section">
          <h3 class="analysis-section__title">Psychological Drivers</h3>
          <ul class="analysis-section__list">
            ${psychology.map(p => `<li>${this.escapeHtml(p)}</li>`).join('')}
          </ul>
        </div>
        
        <div class="analysis-section">
          <h3 class="analysis-section__title">SUBCULTURAL MAPPING</h3>
          <div class="subculture-map">
            <div class="subculture-map__influences">
              <strong>Influences:</strong>
              <div class="subculture-map__items">
                ${(subcultureMap.influences || []).map(item => 
                  `<span class="subculture-map__item">${this.escapeHtml(item)}</span>`
                ).join(' → ')}
              </div>
            </div>
            <div class="subculture-map__related">
              <strong>Related:</strong>
              <div class="subculture-map__items">
                ${(subcultureMap.related || []).map(item => 
                  `<span class="subculture-map__item">${this.escapeHtml(item)}</span>`
                ).join(', ')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render experiential translation section
   * @returns {string} HTML for experiential translation
   */
  renderExperientialTranslation() {
    const translation = this.data.experientialTranslation || {};
    const brandFit = translation.brandFit || {};
    const concepts = translation.activationConcepts || [];
    
    return `
      <div class="modal-section modal-section--translation">
        <h2 class="modal-section__heading">Experiential Translation</h2>
        
        <div class="brand-fit-section">
          <h3 class="brand-fit-section__title">Brand Fit Analysis</h3>
          <div class="brand-fit-grid">
            <div class="brand-fit-card brand-fit-card--perfect">
              <div class="brand-fit-card-header">
                <span class="brand-fit-icon">✓</span>
                <span class="brand-fit-title">Optimal Alignment</span>
              </div>
              <div class="brand-fit-brands">
                ${(brandFit.perfect || []).map(item => `
                  <span class="brand-tag">${this.escapeHtml(item)}</span>
                `).join('')}
              </div>
            </div>
            <div class="brand-fit-card brand-fit-card--good">
              <div class="brand-fit-card-header">
                <span class="brand-fit-icon">○</span>
                <span class="brand-fit-title">Strong Potential</span>
              </div>
              <div class="brand-fit-brands">
                ${(brandFit.good || []).map(item => `
                  <span class="brand-tag">${this.escapeHtml(item)}</span>
                `).join('')}
              </div>
            </div>
            <div class="brand-fit-card brand-fit-card--avoid">
              <div class="brand-fit-card-header">
                <span class="brand-fit-icon">✕</span>
                <span class="brand-fit-title">Low Alignment</span>
              </div>
              <div class="brand-fit-brands">
                ${(brandFit.avoid || []).map(item => `
                  <span class="brand-tag">${this.escapeHtml(item)}</span>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
        
        <div class="concepts-section">
          ${concepts.map((concept, index) => `
            <div class="concept-card">
              <h3 class="concept-card__title">ACTIVATION CONCEPT ${index + 1}: "${this.escapeHtml(concept.title)}"</h3>
              <p class="concept-card__description">${this.escapeHtml(concept.description)}</p>
              <div class="concept-card__details">
                <div class="concept-card__detail">
                  <strong>Budget:</strong> $${concept.budget.min.toLocaleString()} - $${concept.budget.max.toLocaleString()}
                </div>
                <div class="concept-card__detail">
                  <strong>Capacity:</strong> ${concept.capacity || 'TBD'}
                </div>
                <div class="concept-card__detail">
                  <strong>Timeline:</strong> ${concept.timeline}
                </div>
                <div class="concept-card__detail">
                  <strong>Ideal for:</strong> ${(concept.idealBrands || []).join(', ')}
                </div>
              </div>
              ${concept.elements ? `
                <div class="concept-card__elements">
                  <strong>Experience Elements:</strong>
                  <ul class="concept-card__list">
                    ${concept.elements.map(el => `<li>${this.escapeHtml(el)}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render Jack Morton applications section
   * @returns {string} HTML for JM applications
   */
  renderJackMortonApplications() {
    const applications = this.data.jackMortonApplications || {};
    const clients = applications.clients || [];
    
    return `
      <div class="modal-section modal-section--applications">
        <h2 class="modal-section__heading">💼 Jack Morton Client Applications</h2>
        
        ${clients.map(client => `
          <div class="jm-application">
            <h3 class="jm-application__title">IF PITCHING TO: ${this.escapeHtml(client.name)}</h3>
            <div class="jm-application__details">
              <div class="jm-application__detail">
                <strong>→ Position as:</strong> ${this.escapeHtml(client.positioning)}
              </div>
              <div class="jm-application__detail">
                <strong>→ Key message:</strong> "${this.escapeHtml(client.keyMessage)}"
              </div>
              <div class="jm-application__detail">
                <strong>→ Differentiator:</strong> ${this.escapeHtml(client.differentiator)}
              </div>
            </div>
          </div>
        `).join('')}
        
        ${clients.length === 0 ? `
          <div class="jm-application jm-application--empty">
            <p>No specific Jack Morton client applications available for this trend.</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Trap focus within modal for accessibility
   */
  trapFocus() {
    const focusableElements = this.element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    this.element.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
    
    // Focus first element
    if (firstElement) {
      setTimeout(() => firstElement.focus(), 100);
    }
  }

  /**
   * Clean up modal elements and event listeners
   */
  cleanup() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
    }
  }

  /**
   * Handle download action
   */
  handleDownload() {
    console.log('Download PDF report for:', this.data.title);
    // Implement PDF generation logic
  }

  /**
   * Handle share action
   */
  handleShare() {
    console.log('Share trend:', this.data.title);
    // Implement share logic
  }

  /**
   * Handle save action
   */
  handleSave() {
    console.log('Save to library:', this.data.title);
    
    // Get saved trends from localStorage
    const saved = JSON.parse(localStorage.getItem('savedTrends') || '[]');
    
    // Check if already saved
    const isSaved = saved.some(t => t.id === this.data.id);
    
    if (isSaved) {
      // Already saved - remove it
      const updated = saved.filter(t => t.id !== this.data.id);
      localStorage.setItem('savedTrends', JSON.stringify(updated));
      
      // Update button text
      const saveBtn = this.element.querySelector('[data-action="save"]');
      if (saveBtn) {
        saveBtn.textContent = 'Save to Library';
        saveBtn.classList.remove('saved');
      }
      
      console.log('Removed from saved trends');
    } else {
      // Save it
      saved.push(this.data);
      localStorage.setItem('savedTrends', JSON.stringify(saved));
      
      // Update button text
      const saveBtn = this.element.querySelector('[data-action="save"]');
      if (saveBtn) {
        saveBtn.textContent = 'Saved to Library';
        saveBtn.classList.add('saved');
      }
      
      console.log('Saved to library');
    }
    
    // Notify app to refresh saved trends if that section is visible
    window.dispatchEvent(new CustomEvent('trendSaved'));
  }

  /**
   * Check if trend is saved
   */
  isSaved() {
    const saved = JSON.parse(localStorage.getItem('savedTrends') || '[]');
    return saved.some(t => t.id === this.data.id);
  }

  /**
   * Get category icon
   * @returns {string} Emoji or icon code
   */
  getCategoryIcon() {
    return ''; // Icons removed for clean minimal design
  }

  /**
   * Get phase label
   * @param {string} phase - Phase identifier
   * @returns {string} Human-readable phase name
   */
  getPhaseLabel(phase) {
    const labels = {
      innovators: 'Innovators',
      early_adopters: 'Early Adopters',
      early_majority: 'Early Majority',
      late_majority: 'Late Majority',
      laggards: 'Laggards'
    };
    return labels[phase] || phase;
  }

  /**
   * Get phase percent
   * @param {string} phase - Phase identifier
   * @returns {string} Percentage string
   */
  getPhasePercent(phase) {
    const percents = {
      innovators: '10',
      early_adopters: '35',
      early_majority: '65',
      late_majority: '85',
      laggards: '95'
    };
    return percents[phase] || '50';
  }

  /**
   * Get risk level
   * @returns {string} Risk level
   */
  getRiskLevel() {
    const score = this.data.velocityScore;
    const confidence = this.data.confidence;
    
    if (score > 200 && confidence > 80) return 'LOW';
    if (score > 100 && confidence > 70) return 'MEDIUM';
    return 'HIGH';
  }

  /**
   * Get risk description
   * @returns {string} Risk description
   */
  getRiskDescription() {
    const score = this.data.velocityScore;
    const confidence = this.data.confidence;
    
    if (score > 200 && confidence > 80) return 'authentic emerging trend';
    if (score > 100 && confidence > 70) return 'moderate trend with some validation';
    return 'emerging trend requiring validation';
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped HTML
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default Modal;

