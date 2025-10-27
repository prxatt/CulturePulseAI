/**
 * TrendCard Component
 * ES6 class for rendering individual trend cards
 * Based on PRD Section 5 specifications
 */

class TrendCard {
  /**
   * @param {Object} trendData - Complete trend data object from trends-sample.js
   * @param {HTMLElement} container - DOM container to append card to
   */
  constructor(trendData, container) {
    this.data = trendData;
    this.container = container;
    this.element = null;
    this.render();
  }

  /**
   * Render the card and append to container
   */
  render() {
    this.element = document.createElement('div');
    this.element.className = 'trend-card';
    this.element.setAttribute('data-trend-id', this.data.id);
    this.element.innerHTML = this.template();
    this.attachEventListeners();
    this.container.appendChild(this.element);
  }

  /**
   * Generate complete HTML template for trend card
   * @returns {string} HTML template
   */
  template() {
    return `
      <div class="trend-card__header">
        <div class="trend-card__category-container">
          <div class="trend-card__category-icon trend-card__category-icon--${this.getCategoryClass()}">
            ${this.getCategoryIcon()}
          </div>
        </div>
        <div class="trend-card__score ${this.getScoreBadgeClass()}">
          ${this.getScoreBadge()}
        </div>
      </div>
      
      <h3 class="trend-card__title">${this.escapeHtml(this.data.title)}</h3>
      
      <div class="trend-card__meta">
        ${this.getPlatformsList()} • 
        ${this.data.primaryAudience?.gender || 'All'} ${this.data.primaryAudience?.ageRange || 'All'} • 
        Peak: ${this.data.peakExpected || 'Unknown'}
      </div>
      
      <p class="trend-card__description">${this.escapeHtml(this.data.shortDescription)}</p>
      
      ${this.data.culturalAnalysis ? `
      <div class="trend-card__section trend-card__cultural-context">
        <div class="trend-card__section-header">
          <h4 class="trend-card__section-title">CULTURAL CONTEXT</h4>
        </div>
        <div class="trend-card__section-content">
          <p>${this.escapeHtml((this.data.culturalAnalysis.origin || '').substring(0, 200))}...</p>
        </div>
        <button class="btn-link" data-action="read-more" aria-label="Read full cultural analysis">
          Read Full Analysis <span aria-hidden="true">↓</span>
        </button>
      </div>
      ` : ''}
      
      ${this.data.experientialTranslation ? `
      <div class="trend-card__section trend-card__applications">
        <div class="trend-card__section-header">
          <h4 class="trend-card__section-title">FOR JACK MORTON CLIENTS</h4>
        </div>
        <ul class="trend-card__section-list">
          ${this.getClientApplicationsList()}
        </ul>
        <button class="btn-link" data-action="view-concepts" aria-label="View activation concepts">
          View Activation Concepts <span aria-hidden="true">→</span>
        </button>
      </div>
      ` : ''}
      
      <div class="trend-card__tags">
        ${this.getTagsList()}
      </div>
      
      ${this.data.isRedditTrend ? this.getSourcePills() : ''}
    `;
  }

  /**
   * Get source pills for Reddit trends
   */
  getSourcePills() {
    const sources = this.data.sources || [];
    
    return `
      <div class="trend-card__sources">
        <div class="source-pills">
          ${sources.map(source => `
            <a href="${source.url}" target="_blank" class="source-pill" rel="noopener noreferrer">
              <span class="source-pill__platform">${this.getPlatformIcon(source.platform)}</span>
              <span class="source-pill__label">r/${this.data.subreddit || 'unknown'}</span>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Get platform icon
   * @param {string} platform - Platform name
   * @returns {string} Platform initial
   */
  getPlatformIcon(platform) {
    const icons = {
      'LinkedIn': 'LI',
      'Reddit': 'R',
      'Articles/Blogs': 'AB',
      'Twitter': 'T',
      'TikTok': 'TT',
      'Instagram': 'IG',
      'YouTube': 'YT'
    };
    
    if (!platform || typeof platform !== 'string') {
      return 'NA'; // Not Available
    }
    return icons[platform] || platform.substring(0, 2).toUpperCase();
  }

  /**
   * Attach event listeners to card elements
   */
  attachEventListeners() {
    const readMoreBtn = this.element.querySelector('[data-action="read-more"]');
    const viewConceptsBtn = this.element.querySelector('[data-action="view-concepts"]');

    if (readMoreBtn) {
      readMoreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openModal();
      });
    }

    if (viewConceptsBtn) {
      viewConceptsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openModal('concepts');
      });
    }

    // Open modal on card click (excluding button clicks)
    this.element.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      this.openModal();
    });

    // Keyboard accessibility
    this.element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.openModal();
      }
    });

    // Set tabindex for keyboard navigation
    this.element.setAttribute('tabindex', '0');
    this.element.setAttribute('role', 'article');
    this.element.setAttribute('aria-label', `Trend: ${this.data.title}`);
  }

  /**
   * Open modal with trend details
   * @param {string} section - Initial section to show (overview, concepts, etc.)
   */
  openModal(section = 'overview') {
    // Dispatch custom event for modal opening
    // The main app will handle actual modal creation
    const event = new CustomEvent('trend:open', {
      detail: {
        trendData: this.data,
        section: section
      },
      bubbles: true
    });
    
    this.element.dispatchEvent(event);
  }

  /**
   * Get category icon based on trend category
   * @returns {string} SVG icon for category
   */
  getCategoryIcon() {
    if (!this.trend || !this.trend.category) {
      return this.getSVGIcon('other');
    }
    
    const categoryMap = {
      'Lifestyle': 'lifestyle',
      'Tech': 'tech',
      'Fashion': 'fashion',
      'Food': 'food',
      'Food & Beverage': 'food',
      'Music': 'music',
      'Gaming': 'gaming',
      'Sports': 'sports',
      'Wellness': 'wellness',
      'Design': 'design',
      'Entertainment': 'entertainment',
      'Social Media': 'social',
      'Finance': 'finance',
      'Travel': 'travel',
      'Education': 'education',
      'Health': 'health',
      'Automotive': 'automotive',
      'Hospitality': 'hospitality'
    };
    
    const iconType = categoryMap[this.trend.category] || 'other';
    return this.getSVGIcon(iconType);
  }
  
  /**
   * Get SVG icon by type
   * @param {string} type - Icon type
   * @returns {string} SVG markup
   */
  getSVGIcon(type) {
    const icons = {
      'lifestyle': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
      'tech': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 4v1.38c-.83-.33-1.72-.5-2.61-.5-1.79 0-3.58.68-4.95 2.05l3.33 3.33h1.11v1.11c.86.86 1.98 1.31 3.11 1.36V15H6v3c0 1.1.9 2 2 2h10c1.66 0 3-1.34 3-3V4H9zm-1.11 6.41V8.26H5.61L4.57 7.22a5.07 5.07 0 0 1 1.82-.34c1.34 0 2.59.52 3.54 1.46l1.41 1.41-2.47 2.47-1.27-1.27zM19 17c0 .55-.45 1-1 1s-1-.45-1-1v-2h-6v-2.59c.57-.23 1.1-.57 1.56-1.03l.2-.2L15.59 14H17v-1.41l-6-5.97V6h8v11z"/></svg>',
      'fashion': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
      'food': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/></svg>',
      'music': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>',
      'gaming': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 12c0-3.31-2.69-6-6-6s-6 2.69-6 6c0 2.22 1.21 4.15 3 5.19l1-1.74c-1.19-.7-2-1.97-2-3.45 0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.48-.81 2.75-2 3.45l1 1.74c1.79-1.04 3-2.97 3-5.19zm-5-3a1 1 0 0 0-1 1v2h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-2V10a1 1 0 0 0-1-1h-2z"/></svg>',
      'sports': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7.24 21.81l1.89.51 2.51-7.54 2.54 7.55 1.89-.51-1.77-10.46-2.51-2.95zM15.54 10.5L9.5 16.54l-1.06-1.06 6.04-6.04 1.06 1.06z"/></svg>',
      'wellness': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
      'design': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.71 4.63l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41zM7 14a3 3 0 0 0-3 3c0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2a4 4 0 0 0 4-4c0-1.66-1.34-3-3-3z"/></svg>',
      'entertainment': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>',
      'social': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/></svg>',
      'finance': '<svg viewBox="0 0 24 24" fill="currentColor capital"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>',
      'travel': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.56 3.44c.59-.59.59-1.54 0-2.13-.59-.59-1.54-.59-2.13 0L12 7.83 5.57 1.31c-.59-.59-1.54-.59-2.13 0-.59.59-.59 1.54 0 2.13L7.83 10l-1.79 1.79c-.59.59-.59 1.54 0 2.13.59.59 1.54.59 2.13 0L12 12.17l6.43 6.43c.59.59 1.54.59 2.13 0 .59-.59.59-1.54 0-2.13L16.17 10l4.39-4.56z"/></svg>',
      'education': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>',
      'health': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>',
      'automotive': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 10c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v8H6V8l5-5v.5c0 .28.22.5.5.5h.62c.16 0 .31-.08.41-.21L13.5 6H18c1.11 0 2 .89 2 2v2zm-2-2v2h-4V8h4z"/></svg>',
      'hospitality': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 10h-2v7h2v-7zm6 0h-2v7h2v-7zm8.5 9H2v2h19v-2zm-2.5-9h-2v7h2v-7zm-7-9L2 6v2h19V6l-4.5-5z"/></svg>',
      'other': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-6h2v6zm0-8h-2V7h2v4z"/></svg>'
    };
    
    return icons[type] || icons['other'];
  }

  /**
   * Get CSS class for category icon styling
   * @returns {string} Category class name
   */
  getCategoryClass() {
    const categoryMap = {
      'Lifestyle': 'lifestyle',
      'Tech': 'tech',
      'Fashion': 'fashion',
      'Food': 'food',
      'Music': 'music',
      'Gaming': 'gaming',
      'Sports': 'sports',
      'Wellness': 'lifestyle',
      'Design': 'lifestyle',
      'Entertainment': 'music',
      'Social Media': 'tech',
      'Finance': 'tech',
      'Travel': 'lifestyle',
      'Education': 'tech',
      'Health': 'lifestyle'
    };
    return categoryMap[this.data.category] || 'lifestyle';
  }

  /**
   * Get score badge with growth percentage and emoji
   * @returns {string} Score badge HTML
   */
  getScoreBadge() {
    const score = this.data.velocityScore;
    const emoji = this.getScoreEmoji(score);
    return `${emoji} +${score}%`;
  }

  /**
   * Get CSS class for score badge styling
   * @returns {string} Score level class
   */
  getScoreBadgeClass() {
    return `trend-card__score--${this.getScoreLevel()}`;
  }

  /**
   * Get emoji based on score level
   * @param {number} score - Velocity score
   * @returns {string} Emoji character
   */
  getScoreEmoji(score) {
    if (score > 300) return 'EXPLOSIVE';
    if (score > 150) return 'EXP';
    if (score > 50) return 'HOT';
    return 'RISING';
  }

  /**
   * Get score level classification
   * @returns {string} Score level (explosive, hot, rising, stable, declining)
   */
  getScoreLevel() {
    const score = this.data.velocityScore;
    if (score > 300) return 'explosive';
    if (score > 150) return 'hot';
    if (score > 50) return 'rising';
    if (score > 0) return 'stable';
    return 'declining';
  }

  /**
   * Get comma-separated list of platforms
   * @returns {string} Platform list
   */
  getPlatformsList() {
    if (!this.data.sources || this.data.sources.length === 0) return 'Unknown';
    return this.data.sources.map(s => s.platform).join(', ');
  }

  /**
   * Get client applications list for Jack Morton
   * @returns {string} HTML list items
   */
  getClientApplicationsList() {
    const concepts = this.data.experientialTranslation?.activationConcepts?.slice(0, 3) || [];
    return concepts
      .map(concept => `<li>✓ ${this.escapeHtml(concept.title)}</li>`)
      .join('');
  }

  /**
   * Get tags as HTML
   * @returns {string} Tags HTML
   */
  getTagsList() {
    if (!this.data.tags || this.data.tags.length === 0) return '';
    return this.data.tags
      .map(tag => `<span class="tag">#${this.escapeHtml(tag)}</span>`)
      .join('');
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

  /**
   * Remove card from DOM
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  /**
   * Update card with new data
   * @param {Object} newData - Updated trend data
   */
  update(newData) {
    this.data = newData;
    if (this.element) {
      this.element.innerHTML = this.template();
      this.attachEventListeners();
    }
  }

  /**
   * Get current card element
   * @returns {HTMLElement} Card element
   */
  getElement() {
    return this.element;
  }

  /**
   * Get current trend data
   * @returns {Object} Trend data
   */
  getData() {
    return this.data;
  }

  /**
   * Scroll card into view with animation
   */
  scrollIntoView() {
    if (this.element) {
      this.element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }
  }

  /**
   * Highlight card temporarily (for search results, etc.)
   */
  highlight() {
    if (this.element) {
      this.element.style.transition = 'all 0.3s ease';
      this.element.style.boxShadow = '0 20px 40px rgba(99, 102, 241, 0.3)';
      this.element.style.borderColor = 'var(--pulse-primary)';
      
      setTimeout(() => {
        this.element.style.boxShadow = '';
        this.element.style.borderColor = '';
      }, 2000);
      this.scrollIntoView();
    }
  }

  /**
   * Add fade-in animation on load
   */
  animateIn() {
    if (this.element) {
      this.element.style.opacity = '0';
      this.element.style.transform = 'translateY(30px)';
      
      requestAnimationFrame(() => {
        this.element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        this.element.style.opacity = '1';
        this.element.style.transform = 'translateY(0)';
      });
    }
  }

  /**
   * Add fade-out animation on remove
   */
  animateOut() {
    return new Promise((resolve) => {
      if (this.element) {
        this.element.style.transition = 'all 0.3s ease';
        this.element.style.opacity = '0';
        this.element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          resolve();
        }, 300);
      } else {
        resolve();
      }
    });
  }
}

export default TrendCard;

