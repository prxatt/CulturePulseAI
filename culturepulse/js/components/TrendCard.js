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
   */
  getPlatformIcon(platform) {
    return ''; // Icons removed for clean minimal design
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
   * @returns {string} Emoji or icon code
   */
  getCategoryIcon() {
    return ''; // Icons removed for clean minimal design
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

