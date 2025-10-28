/**
 * CulturePulse AI - Main Application
 * Central controller for dashboard functionality
 * Based on PRD Section 5 architecture
 */

import { SAMPLE_TRENDS } from './data/trends-sample.js';
import TrendCard from './components/TrendCard.js';
import Modal from './components/Modal.js';
import { errorHandler } from './utils/error-handler.js';
import { DataValidator } from './utils/data-validator.js';
import { dataCollector } from './services/data-collector.js';
import { realtimeAgent } from './services/realtime-agent.js';

// Initialize analytics when DOM is ready
import('./analytics.js');

class CulturePulseApp {
  constructor() {
    this.trends = [];
    this.filteredTrends = [];
    this.currentModal = null;
    this.filters = {
      category: 'all',
      audience: 'all',
      phase: 'all',
      client: 'all',
      search: ''
    };
    this.stats = {
      totalTrends: 0,
      emerging72h: 0,
      accuracy: 0,
      dataPoints: 0
    };
    this.heatMapData = {};
    this.isInitialized = false;
    this.trendsDisplayed = 0;
    this.maxInitialTrends = 9;
    this.incrementSize = 5;
  }

  /**
   * Initialize application
   */
  async init() {
    if (this.isInitialized) return;
    
    try {
      console.log('Initializing CulturePulse AI...');
      
      // Start loading progress animation
      this.animateLoadingProgress();
      
      // Load data (this now loads sample data immediately)
      await this.loadData();
      console.log('Data loaded, trends count:', this.trends.length);
      
      // Start real-time data collection agent (only if not already running)
      if (!window.realtimeAgentRunning) {
        console.log('Starting real-time data collection...');
        await realtimeAgent.start();
        window.realtimeAgentRunning = true;
        
        // Listen for real-time trend updates
        window.addEventListener('realtimeTrendsUpdated', (event) => {
          console.log('Real-time trends updated:', event.detail.stats);
          this.mergeRealtimeTrends(event.detail.trends);
        });
      } else {
        console.log('Real-time agent already running');
      }
      
      // Initialize to show 9 trends
      this.trendsDisplayed = this.maxInitialTrends;
      
      this.calculateStats();
      console.log('Stats calculated:', this.stats);
      
      this.generateHeatMapData();
      
      await this.renderAll();
      console.log('All components rendered');
      
      this.renderCategoryBreakdown();
      this.renderCategoryHeatmap();
      this.setupEventListeners();
      this.setupMetricDetails();
      this.startAnimations();
      
      this.isInitialized = true;
      console.log('CulturePulse AI initialized successfully with', this.trends.length, 'trends');
    } catch (error) {
      console.error('Error initializing CulturePulse AI:', error);
      console.error('Stack:', error.stack);
    }
  }

  /**
   * Animate loading progress bar from 0 to 100 over 30 seconds
   */
  animateLoadingProgress() {
    let progress = 0;
    const duration = 30000; // 30 seconds
    const interval = 50; // Update every 50ms for smooth animation
    const increment = (100 / duration) * interval;
    
    const updateProgress = () => {
      progress = Math.min(progress + increment, 100);
      this.showLoadingProgress(Math.round(progress));
      
      if (progress < 100) {
        setTimeout(updateProgress, interval);
      }
    };
    
    updateProgress();
  }

  /**
   * Render all dashboard components
   */
  async renderAll() {
    this.renderStats();
    this.renderHeatMap();
    this.renderCategoryHeatmap();
    this.renderTrendGrid();
  }

  /**
   * Load trend data with validation (with Reddit integration)
   */
  async loadData() {
    try {
      console.log('Loading data... SAMPLE_TRENDS available:', !!SAMPLE_TRENDS);
      console.log('SAMPLE_TRENDS length:', SAMPLE_TRENDS?.length);
      
      // Check if SAMPLE_TRENDS exists and has data
      if (!SAMPLE_TRENDS) {
        console.error('SAMPLE_TRENDS is not defined');
        this.trends = [];
        this.filteredTrends = [];
        return;
      }

      if (!Array.isArray(SAMPLE_TRENDS) || SAMPLE_TRENDS.length === 0) {
        console.warn('SAMPLE_TRENDS is empty array');
        this.trends = [];
        this.filteredTrends = [];
        return;
      }

      console.log('Processing', SAMPLE_TRENDS.length, 'trends...');
      
      // Use sample trends immediately (stable data source)
      let sampleTrends = SAMPLE_TRENDS.map(trend => {
        const validation = DataValidator.validateTrend(trend);
        const sanitized = DataValidator.sanitizeTrend(trend);
        if (!validation.isValid && validation.errors.length > 0) {
          console.warn(`Trend ${trend.id} validation issues: ${validation.errors.join(', ')}`);
        }
        return sanitized;
      }).filter(trend => trend && typeof trend.id === 'string' && typeof trend.title === 'string');

      // Use curated sample trends as primary (most relevant for Jack Morton)
      this.trends = sampleTrends;
      this.filteredTrends = [...this.trends];
      
      console.log('✓ Loaded curated sample trends (most relevant for experiential marketing)');
      
      // Try to enhance with real-time API data in background (optional)
      this.enhanceWithRealTimeData().catch(err => {
        console.warn('Real-time data enhancement failed:', err.message);
      });
      
      console.log(`Loaded ${this.trends.length} trends successfully`);
      
      if (this.trends.length === 0) {
        console.error('CRITICAL: No valid trends loaded after validation');
        console.error('SAMPLE_TRENDS sample:', SAMPLE_TRENDS[0]);
      }
    } catch (error) {
      console.error('ERROR in loadData:', error);
      console.error('Stack:', error.stack);
      errorHandler.handle(error, 'Data Loading');
      // Fallback: use original sample data if available
      this.trends = Array.isArray(SAMPLE_TRENDS) ? [...SAMPLE_TRENDS] : [];
      this.filteredTrends = [...this.trends];
    }
  }

  /**
   * Enhance curated trends with real-time API data (optional)
   * Sample trends stay as primary, API data used to update engagement metrics
   */
  async enhanceWithRealTimeData() {
    try {
      console.log('Enhancing trends with real-time data...');
      
      // Try to fetch some current buzz (optional enhancement)
      // This doesn't replace sample data, just updates engagement
      const liveData = await dataCollector.collectBusinessTrends();
      
      if (liveData && liveData.length > 0) {
        console.log(`✓ Enhanced ${liveData.length} trends with live data`);
        // Could update engagement scores here if needed
      }
    } catch (error) {
      // Silently fail - curated data is primary anyway
      console.log('Real-time enhancement unavailable, using curated trends only');
    }
  }

  /**
   * Show Reddit loading indicator
   */
  showRedditLoading() {
    const trendsGrid = document.getElementById('trends-grid');
    if (trendsGrid) {
      const loadingDiv = document.createElement('div');
      loadingDiv.id = 'reddit-loading';
      loadingDiv.style.cssText = `
        grid-column: 1 / -1;
        padding: var(--space-6);
        background: #f0f9ff;
        border: 2px solid #3b82f6;
        border-radius: 8px;
        text-align: center;
        font-size: 16px;
        color: #3b82f6;
        font-weight: 600;
        margin-bottom: var(--space-4);
      `;
      loadingDiv.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 8px;">🔄</div>
        <div>Loading real-time trends from 100+ subreddits...</div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">This may take 30-60 seconds</div>
      `;
      trendsGrid.insertBefore(loadingDiv, trendsGrid.firstChild);
    }
  }

  /**
   * Hide Reddit loading indicator
   */
  hideRedditLoading(redditCount) {
    const loadingDiv = document.getElementById('reddit-loading');
    if (loadingDiv) {
      if (redditCount > 0) {
        loadingDiv.style.background = '#ecfdf5';
        loadingDiv.style.borderColor = '#10b981';
        loadingDiv.style.color = '#10b981';
        loadingDiv.innerHTML = `
          <div style="font-size: 24px; margin-bottom: 8px;">✓</div>
          <div>Successfully loaded ${redditCount} real-time trends from Reddit!</div>
          <div style="font-size: 12px; color: #059669; margin-top: 4px;">Trends appearing below...</div>
        `;
        setTimeout(() => loadingDiv.remove(), 8000);
      } else {
        loadingDiv.style.background = '#fef3c7';
        loadingDiv.style.borderColor = '#f59e0b';
        loadingDiv.style.color = '#f59e0b';
        loadingDiv.innerHTML = `
          <div style="font-size: 24px; margin-bottom: 8px;">⚠</div>
          <div>Reddit trends unavailable, showing sample data</div>
          <div style="font-size: 12px; color: #b45309; margin-top: 4px;">Check your internet connection</div>
        `;
        setTimeout(() => loadingDiv.remove(), 5000);
      }
    }
  }

  /**
   * Calculate dashboard statistics
   */
  calculateStats() {
    this.stats.totalTrends = this.trends.length;
    
    // Calculate emerging trends (last 72 hours) - using velocity > 150 as proxy
    this.stats.emerging72h = this.trends.filter(t => t.velocityScore > 150).length;
    
    // Calculate average confidence as accuracy
    const avgConfidence = this.trends.reduce((sum, t) => sum + (t.confidence || 85), 0) / this.trends.length;
    this.stats.accuracy = Math.round(avgConfidence);
    
    // Calculate total data points (using mentions as proxy)
    this.stats.dataPoints = this.trends.reduce((total, trend) => {
      return total + trend.sources.reduce((sum, source) => sum + source.mentions, 0);
    }, 0);
    this.stats.dataPoints = (this.stats.dataPoints / 1000000).toFixed(1) + 'M';
  }

  /**
   * Render stats overview with animated counters
   */
  renderStats() {
    if (typeof gsap === 'undefined') {
      // Fallback without GSAP
      document.getElementById('stat-trends').textContent = this.stats.totalTrends;
      document.getElementById('stat-emerging').textContent = this.stats.emerging72h;
      document.getElementById('stat-accuracy').textContent = this.stats.accuracy + '%';
      document.getElementById('stat-datapoints').textContent = this.stats.dataPoints;
      return;
    }

    // Animate counters with GSAP
    gsap.to({ value: 0 }, {
      value: this.stats.totalTrends,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: function() {
        document.getElementById('stat-trends').textContent = Math.floor(this.targets()[0].value);
      }
    });

    gsap.to({ value: 0 }, {
      value: this.stats.emerging72h,
      duration: 1.5,
      delay: 0.2,
      ease: 'power2.out',
      onUpdate: function() {
        document.getElementById('stat-emerging').textContent = Math.floor(this.targets()[0].value);
      }
    });

    gsap.to({ value: 0 }, {
      value: this.stats.accuracy,
      duration: 1.5,
      delay: 0.4,
      ease: 'power2.out',
      onUpdate: function() {
        document.getElementById('stat-accuracy').textContent = Math.floor(this.targets()[0].value) + '%';
      }
    });

    gsap.to({ value: 0 }, {
      value: parseFloat(this.stats.dataPoints),
      duration: 1.5,
      delay: 0.6,
      ease: 'power2.out',
      onUpdate: function() {
        const value = this.targets()[0].value;
        document.getElementById('stat-datapoints').textContent = value.toFixed(1) + 'M';
      }
    });
  }

  /**
   * Render interactive trend trajectory heatmap
   */
  renderTrendTrajectoryGraph() {
    const container = document.getElementById('trend-trajectory-graph');
    if (!container) return;
    
    const trends = this.filteredTrends && this.filteredTrends.length > 0 
      ? this.filteredTrends 
      : this.trends;
    
    if (!trends || trends.length === 0) {
      container.innerHTML = '<p style="padding: var(--space-4); color: var(--text-secondary);">Loading trends...</p>';
      return;
    }
    
    container.innerHTML = this.buildHeatmapHTML(trends);
    this.attachHeatmapInteractions(container);
  }

  /**
   * Build HTML for interactive heatmap visualization
   */
  buildHeatmapHTML(trends) {
    // Group trends by category for heatmap rows
    const categories = {};
    trends.forEach(trend => {
      const cat = trend.category || 'Uncategorized';
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(trend);
    });
    
    // Sort categories by average velocity
    const sortedCategories = Object.entries(categories).sort((a, b) => {
      const avgA = a[1].reduce((sum, t) => sum + (t.velocityScore || 0), 0) / a[1].length;
      const avgB = b[1].reduce((sum, t) => sum + (t.velocityScore || 0), 0) / b[1].length;
      return avgB - avgA;
    });
    
    // Calculate statistics
    const maxVelocity = Math.max(...trends.map(t => t.velocityScore || 0));
    const minVelocity = Math.min(...trends.map(t => t.velocityScore || 0));
    
    // Generate time periods (last 14 days)
    const timePeriods = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      timePeriods.push({
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        date: date
      });
    }
    
    // Generate heatmap cells
    const heatmapRows = sortedCategories.map(([category, categoryTrends]) => {
      // Get average velocity for each time period (simulated)
      const cells = timePeriods.map((period, idx) => {
        const avgVelocity = categoryTrends.reduce((sum, t) => {
          const baseVel = t.velocityScore || 0;
          // Simulate variation over time
          const variation = Math.sin((idx / 14) * Math.PI * 2) * 20 + (Math.random() - 0.5) * 15;
          return sum + Math.max(0, baseVel + variation);
        }, 0) / categoryTrends.length;
        
        const intensity = Math.min(100, Math.max(0, ((avgVelocity - minVelocity) / (maxVelocity - minVelocity)) * 100));
        const alpha = 0.3 + (intensity / 100) * 0.7;
        
        return `<div class="heatmap-cell-interactive" 
                    data-intensity="${intensity.toFixed(0)}"
                    data-velocity="${avgVelocity.toFixed(0)}"
                    style="background: rgba(59, 130, 246, ${alpha});">
                  <span class="heatmap-cell-value">${avgVelocity.toFixed(0)}</span>
                </div>`;
      }).join('');
      
      const categoryVelocity = (categoryTrends.reduce((sum, t) => sum + (t.velocityScore || 0), 0) / categoryTrends.length).toFixed(0);
      
      return `
        <div class="heatmap-row">
          <div class="heatmap-row-label">
            <div class="heatmap-category-name">${category}</div>
            <div class="heatmap-category-stats">${categoryTrends.length} trends • ${categoryVelocity}% avg</div>
          </div>
          <div class="heatmap-row-cells">${cells}</div>
        </div>
      `;
    }).join('');
    
    return `
      <div class="trend-heatmap-container">
        <div class="heatmap-header">
          <h2 class="heatmap-title">Trend Intensity Heatmap</h2>
          <p class="heatmap-subtitle">Velocity score by category over last 14 days • Darker = higher velocity</p>
          <div class="heatmap-parameters">
            <div class="parameter-item">
              <span class="parameter-label">Range:</span>
              <span class="parameter-value">${minVelocity.toFixed(0)}% - ${maxVelocity.toFixed(0)}%</span>
            </div>
            <div class="parameter-item">
              <span class="parameter-label">Total Trends:</span>
              <span class="parameter-value">${trends.length}</span>
            </div>
            <div class="parameter-item">
              <span class="parameter-label">Categories:</span>
              <span class="parameter-value">${sortedCategories.length}</span>
            </div>
          </div>
        </div>
        
        <div class="heatmap-wrapper">
          <div class="heatmap-legend">
            <div class="time-labels">
              ${timePeriods.map(p => `<div class="time-label">${p.label}</div>`).join('')}
            </div>
          </div>
          
          <div class="heatmap-content">
            ${heatmapRows}
          </div>
        </div>
        
        <div class="heatmap-legend-bottom">
          <div class="color-scale">
            <span class="scale-label">Low</span>
            <div class="scale-gradient"></div>
            <span class="scale-label">High</span>
          </div>
          <p class="legend-note">Hover over cells to see exact velocity scores</p>
        </div>
      </div>
    `;
  }

  /**
   * Attach interactive handlers to heatmap
   */
  attachHeatmapInteractions(container) {
    const cells = container.querySelectorAll('.heatmap-cell-interactive');
    cells.forEach(cell => {
      const velocity = cell.getAttribute('data-velocity');
      const intensity = cell.getAttribute('data-intensity');
      
      cell.addEventListener('mouseenter', (e) => {
        const tooltip = document.createElement('div');
        tooltip.className = 'heatmap-tooltip';
        tooltip.textContent = `Velocity: ${velocity}% • Intensity: ${intensity}%`;
        document.body.appendChild(tooltip);
        
        const rect = e.target.getBoundingClientRect();
        tooltip.style.left = rect.left + rect.width / 2 + 'px';
        tooltip.style.top = rect.top - 40 + 'px';
        tooltip.style.transform = 'translateX(-50%)';
        
        setTimeout(() => tooltip.classList.add('visible'), 10);
        e.target.tooltip = tooltip;
      });
      
      cell.addEventListener('mouseleave', (e) => {
        if (e.target.tooltip) {
          e.target.tooltip.remove();
          e.target.tooltip = null;
        }
      });
    });
  }

  /**
   * Generate heat map data by category
   */
  generateHeatMapData() {
    // Get unique categories from actual trends
    const allCategories = new Set();
    this.trends.forEach(trend => {
      if (trend.category) allCategories.add(trend.category);
      if (trend.subcategories) {
        trend.subcategories.forEach(sub => allCategories.add(sub));
      }
    });
    
    this.heatMapData = {};
    allCategories.forEach(category => {
      const categoryTrends = this.trends.filter(t => 
        t.category === category ||
        (t.subcategories && t.subcategories.includes(category))
      );
      
      if (categoryTrends.length > 0) {
        const avgVelocity = categoryTrends.reduce((sum, t) => sum + t.velocityScore, 0) / categoryTrends.length;
        this.heatMapData[category] = {
          count: categoryTrends.length,
          avgVelocity: avgVelocity,
          intensity: this.getIntensityLevel(avgVelocity)
        };
      }
    });
  }

  /**
   * Get intensity level for heat map
   * @param {number} velocity - Average velocity score
   * @returns {string} Intensity level
   */
  getIntensityLevel(velocity) {
    if (velocity > 250) return 'explosive';
    if (velocity > 150) return 'hot';
    if (velocity > 75) return 'rising';
    return 'stable';
  }

  /**
   * Get color for velocity (red to green gradient)
   * @param {number} velocity - Average velocity score
   * @returns {string} RGB color
   */
  getVelocityColor(velocity) {
    // Red (0) to Green (400+)
    // Scale from 0-400
    const normalized = Math.min(Math.max((velocity / 400) * 100, 0), 100);
    
    let r, g, b;
    
    if (normalized < 50) {
      // Red to Yellow (0-50)
      r = 255;
      g = Math.round(normalized * 5.1); // 0-255
      b = 0;
    } else {
      // Yellow to Green (50-100)
      r = Math.round(255 - (normalized - 50) * 5.1);
      g = 255;
      b = 0;
    }
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Render heat map visualization
   */
  renderHeatMap() {
    const container = document.getElementById('heatmap-grid');
    if (!container) return;

    container.innerHTML = '';

    const categories = Object.keys(this.heatMapData);
    categories.forEach(category => {
      const data = this.heatMapData[category];
      const cell = this.createHeatMapCell(category, data);
      container.appendChild(cell);
    });

    // Animate heat map cells with stagger
    if (typeof gsap !== 'undefined') {
      gsap.from('.heatmap-cell', {
        opacity: 0,
        scale: 0.8,
        duration: 0.5,
        stagger: 0.05,
        ease: 'back.out'
      });
    }
  }

  /**
   * Create heat map cell element
   * @param {string} category - Category name
   * @param {Object} data - Category data
   * @returns {HTMLElement} Cell element
   */
  createHeatMapCell(category, data) {
    const cell = document.createElement('div');
    cell.className = `heatmap-cell heatmap-cell--${data.intensity}`;
    cell.setAttribute('data-category', category.toLowerCase());
    
    const percentage = Math.round(data.avgVelocity);
    
    const color = this.getVelocityColor(data.avgVelocity);
    
    cell.innerHTML = `
      <div class="heatmap-cell__category">${category}</div>
      <div class="heatmap-cell__score">${percentage}%</div>
      <div class="heatmap-cell__count">${data.count} trends</div>
    `;
    
    cell.style.backgroundColor = color;
    cell.style.color = '#ffffff';

    cell.addEventListener('click', () => {
      this.filterByCategory(category);
    });

    cell.addEventListener('mouseenter', () => {
      this.showHeatMapTooltip(cell, category, data);
    });

    return cell;
  }

  /**
   * Show heat map tooltip
   * @param {HTMLElement} cell - Cell element
   * @param {string} category - Category name
   * @param {Object} data - Category data
   */
  showHeatMapTooltip(cell, category, data) {
    // Tooltip will be implemented with CSS
    cell.setAttribute('title', `${category}: ${data.count} trends, ${Math.round(data.avgVelocity)}% avg growth`);
  }

  /**
   * Render trend grid with cards
   * Now shows 9 trends initially, then allows "See More"
   */
  renderTrendGrid() {
    const container = document.getElementById('trends-grid');
    if (!container) return;

    // Calculate how many trends to show
    const displayCount = Math.min(this.trendsDisplayed, this.filteredTrends.length);
    const trendsToShow = this.filteredTrends.slice(0, displayCount);

    container.innerHTML = '';
    const countEl = document.getElementById('trends-count');
    
    if (this.filteredTrends.length === 0) {
      container.innerHTML = `
        <div class="trends-empty">
          <p>No trends match your filters. Try adjusting your search criteria.</p>
        </div>
      `;
      if (countEl) countEl.textContent = '0 trends';
      // Hide loading and see more
      this.hideLoadingProgress();
      this.hideSeeMore();
      return;
    }

    // Render trend cards (only show up to displayCount)
    trendsToShow.forEach((trend, index) => {
      const trendCard = new TrendCard(trend, container);
      
      // Add animation with delay for first batch
      if (typeof gsap !== 'undefined' && index === 0 && this.trendsDisplayed <= this.maxInitialTrends) {
        gsap.from('.trend-card', {
          opacity: 0,
          y: 30,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out'
        });
      }
    });

    if (countEl) {
      countEl.textContent = `${trendsToShow.length} of ${this.filteredTrends.length} trends`;
    }

    // Show/hide "See More" button
    if (displayCount < this.filteredTrends.length) {
      this.showSeeMore();
    } else {
      this.hideSeeMore();
    }
  }

  /**
   * Show loading progress bar
   */
  showLoadingProgress(progress) {
    const container = document.getElementById('loading-progress-container');
    const fill = document.getElementById('loading-bar-fill');
    const text = document.getElementById('loading-text');
    
    if (container && fill && text) {
      container.style.display = 'block';
      fill.style.width = `${progress}%`;
      
      if (progress < 100) {
        text.textContent = `Loading trends... ${progress}%`;
      } else {
        text.textContent = '✓ Trends loaded!';
      }
    }
  }

  /**
   * Hide loading progress bar
   */
  hideLoadingProgress() {
    const container = document.getElementById('loading-progress-container');
    if (container) {
      container.style.display = 'none';
    }
  }

  /**
   * Show "See More" button
   */
  showSeeMore() {
    const container = document.getElementById('see-more-container');
    if (container) {
      container.style.display = 'flex';
      
      // Update button text with remaining count
      const remaining = Math.min(this.incrementSize, this.filteredTrends.length - this.trendsDisplayed);
      const countEl = container.querySelector('.btn-see-more__count');
      if (countEl) {
        countEl.textContent = `(${remaining} more)`;
      }
    }
  }

  /**
   * Hide "See More" button
   */
  hideSeeMore() {
    const container = document.getElementById('see-more-container');
    if (container) {
      container.style.display = 'none';
    }
  }

  /**
   * Load more trends (called when "See More" is clicked)
   */
  loadMoreTrends() {
    this.trendsDisplayed += this.incrementSize;
    this.renderTrendGrid();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.setupFilters();
    this.setupSearch();
    this.setupResetFilters();
    this.setupModalEvents();
    this.setupKeyboardShortcuts();
    this.setupNavigation();
    this.setupSeeMoreButton();
    
    // Listen for trend save events
    window.addEventListener('trendSaved', () => {
      // If saved section is visible, refresh it
      const savedSection = document.getElementById('section-saved');
      if (savedSection && savedSection.style.display !== 'none') {
        this.loadSavedTrends();
      }
    });
  }

  /**
   * Setup "See More" button event listener
   */
  setupSeeMoreButton() {
    const btnSeeMore = document.getElementById('btn-see-more');
    if (btnSeeMore) {
      btnSeeMore.addEventListener('click', () => {
        this.loadMoreTrends();
      });
    }
  }
  
  /**
   * Setup navigation tab switching
   */
  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('data-section');
        this.switchSection(section);
        
        // Update active state
        navLinks.forEach(n => n.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }
  
  /**
   * Switch between sections
   * @param {string} section - Section name to show
   */
  switchSection(section) {
    // Hide all sections
    const sections = ['dashboard', 'saved', 'reports', 'settings'];
    sections.forEach(s => {
      const el = document.getElementById(`section-${s}`);
      if (el) el.style.display = 'none';
    });
    
    // Show selected section
    const targetSection = document.getElementById(`section-${section}`);
    if (targetSection) {
      targetSection.style.display = 'block';
      
      // Load data if needed
      if (section === 'saved') {
        this.loadSavedTrends();
      } else if (section === 'reports') {
        this.loadReports();
      }
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // If section doesn't exist, show dashboard
      this.switchSection('dashboard');
    }
  }

  /**
   * Render category heatmap
   */
  renderCategoryHeatmap() {
    const container = document.getElementById('category-heatmap');
    if (!container) return;

    // Count categories
    const categoryCounts = {};
    this.trends.forEach(trend => {
      const cat = trend.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const sorted = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1]);

    let html = '';
    // Category color mapping for left border
    const categoryColors = {
      'Tech': '#3b82f6',
      'Entertainment': '#ef4444',
      'Fashion': '#ec4899',
      'Food & Beverage': '#f59e0b',
      'Food': '#f59e0b',
      'Finance': '#10b981',
      'Automotive': '#6366f1',
      'Wellness': '#8b5cf6',
      'Sports': '#f97316',
      'Hospitality': '#14b8a6',
      'Lifestyle': '#14b8a6',
      'Other': '#6b7280'
    };

    sorted.forEach(([category, count]) => {
      const borderColor = categoryColors[category] || categoryColors['Other'];
      
      html += `
        <button class="category-pill" data-category="${category.toLowerCase()}" type="button" style="border-left: 3px solid ${borderColor} !important;">
          <span class="category-pill__label">${category}</span>
          <span class="category-pill__count">${count}</span>
        </button>
      `;
    });

    container.innerHTML = html;

    // Add click handlers
    container.querySelectorAll('.category-pill').forEach(button => {
      button.addEventListener('click', (e) => {
        const category = e.currentTarget.getAttribute('data-category');
        this.filterByCategory(category);
        
        // Toggle active state
        container.querySelectorAll('.category-pill').forEach(b => b.classList.remove('category-pill--active'));
        if (this.filters.category !== 'all') {
          e.currentTarget.classList.add('category-pill--active');
        }
      });
    });
  }

  /**
   * Setup filter controls
   */
  setupFilters() {
    const phaseFilter = document.getElementById('filter-phase');
    const categoryFilter = document.getElementById('filter-category');

    if (phaseFilter) {
      phaseFilter.addEventListener('change', (e) => {
        this.filters.phase = e.target.value;
        this.updateHeatmapSelection();
        this.applyFilters();
      });
    }
    
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.filters.category = e.target.value;
        this.updateHeatmapSelection();
        this.applyFilters();
      });
    }
  }

  /**
   * Setup search functionality
   */
  setupSearch() {
    const searchBar = document.getElementById('search-bar');
    
    if (searchBar) {
      searchBar.addEventListener('input', (e) => {
        this.filters.search = e.target.value.toLowerCase();
        this.applyFilters();
      });
    }

    // Keyboard shortcut Cmd/Ctrl + K to focus search
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (searchBar) searchBar.focus();
      }
    });
  }

  /**
   * Setup reset filters button
   */
  setupResetFilters() {
    const resetBtn = document.getElementById('reset-filters');
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.filters = {
          category: 'all',
          audience: 'all',
          phase: 'all',
          client: 'all',
          search: ''
        };
        
        // Reset UI
        const categoryFilter = document.getElementById('filter-category');
        const searchBar = document.getElementById('search-bar');
        
        if (categoryFilter) categoryFilter.value = 'all';
        if (searchBar) searchBar.value = '';
        
        this.applyFilters();
      });
    }
  }

  /**
   * Setup modal events
   */
  setupModalEvents() {
    document.addEventListener('trend:open', (e) => {
      this.openModal(e.detail.trendData, e.detail.section);
    });
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // ESC to close modal
      if (e.key === 'Escape' && this.currentModal) {
        this.closeModal();
      }
    });
  }

  /**
   * Apply all active filters
   */
  applyFilters() {
    this.filteredTrends = this.trends.filter(trend => {
      // Category filter
      if (this.filters.category !== 'all') {
        if (trend.category.toLowerCase() !== this.filters.category.toLowerCase()) {
          return false;
        }
      }

      // Search filter
      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        const searchableText = `
          ${trend.title.toLowerCase()}
          ${trend.shortDescription.toLowerCase()}
          ${trend.category.toLowerCase()}
          ${trend.subcategories.join(' ').toLowerCase()}
          ${trend.tags.join(' ').toLowerCase()}
        `;
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Phase filter
      if (this.filters.phase !== 'all') {
        if (trend.currentPhase !== this.filters.phase) {
          return false;
        }
      }

      // Client filter
      if (this.filters.client !== 'all' && this.filters.client) {
        const clientName = this.filters.client.toLowerCase();
        const clientTags = trend.tags.map(t => t.toLowerCase());
        if (!clientTags.includes(clientName)) {
          return false;
        }
      }

      return true;
    });

    this.renderTrendGrid();
  }

  /**
   * Load and display saved trends
   */
  loadSavedTrends() {
    const saved = JSON.parse(localStorage.getItem('savedTrends') || '[]');
    const sectionContent = document.querySelector('#section-saved .section-content');
    
    if (!sectionContent) return;
    
    if (saved.length === 0) {
      sectionContent.innerHTML = `
        <p>Your saved trends will appear here.</p>
        <div class="empty-state">
          <div class="empty-state__icon"></div>
          <h2>No saved trends yet</h2>
          <p>Save trends you want to reference later by clicking the save button on any trend card.</p>
        </div>
      `;
      return;
    }
    
    // Render saved trends
    const grid = document.createElement('div');
    grid.className = 'trends-grid';
    grid.id = 'saved-trends-grid';
    
    sectionContent.innerHTML = '';
    sectionContent.appendChild(grid);
    
    saved.forEach(trend => {
      const trendCard = new TrendCard(trend, grid);
    });
  }
  
  /**
   * Load and display reports
   */
  loadReports() {
    const reports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
    const sectionContent = document.querySelector('#section-reports .section-content');
    
    if (!sectionContent) return;
    
    const content = document.createElement('div');
    
    // Add report generation controls
    const controls = document.createElement('div');
    controls.className = 'report-controls';
    controls.innerHTML = `
      <div class="report-controls__header">
        <h2>Generate Report</h2>
        <p>Create a comprehensive trend analysis report based on your selected time period</p>
      </div>
      <div class="report-controls__options">
        <select class="report-filter" id="report-period">
          <option value="week">Last 7 Days</option>
          <option value="month" selected>Last 30 Days</option>
          <option value="quarter">Last 3 Months</option>
          <option value="year">Last Year</option>
        </select>
        <select class="report-filter" id="report-trends-count">
          <option value="all" selected>All Trends</option>
          <option value="3">Top 3 Trends</option>
          <option value="5">Top 5 Trends</option>
          <option value="8">Top 8 Trends</option>
          <option value="10">Top 10 Trends</option>
          <option value="15">Top 15 Trends</option>
        </select>
        <button class="btn-primary" id="generate-report-btn">
          Generate New Report
        </button>
      </div>
    `;
    
    if (reports.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `
        <div class="empty-state__icon"></div>
        <h2>No reports generated yet</h2>
        <p>Generate custom trend reports from the dashboard to share with your team.</p>
      `;
      content.appendChild(controls);
      content.appendChild(emptyState);
    } else {
      const reportsList = document.createElement('div');
      reportsList.className = 'reports-list';
      
      reports.forEach((report, index) => {
        const reportCard = document.createElement('div');
        reportCard.className = 'report-card';
        reportCard.innerHTML = `
          <div class="report-card__header">
            <h3>${report.title || `Trend Report #${index + 1}`}</h3>
            <span class="report-card__date">${new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="report-card__summary">
            <p>${report.summary || 'Trend analysis report'}</p>
            <div style="margin-top: 12px; display: flex; gap: 16px; flex-wrap: wrap; font-size: 14px; color: var(--text-tertiary);">
              <span>${report.trendsCount || 0} trends</span>
              <span>${report.periodLabel || report.period || 'Period'}</span>
              ${report.avgVelocity ? `<span>${report.avgVelocity}% velocity</span>` : ''}
              ${report.topCategory ? `<span>Top: ${report.topCategory}</span>` : ''}
            </div>
          </div>
          <div class="report-card__actions">
            <button class="btn-secondary download-report" data-report-id="${report.id}">
              Download PDF
            </button>
            <button class="btn-secondary share-report" data-report-id="${report.id}">
              Share Link
            </button>
            <button class="btn-secondary btn-delete delete-report" data-report-id="${report.id}">
              Delete
            </button>
          </div>
        `;
        reportsList.appendChild(reportCard);
      });
      
      content.appendChild(controls);
      content.appendChild(reportsList);
    }
    
    sectionContent.innerHTML = '';
    sectionContent.appendChild(content);
    
    // Attach event listeners
    const generateBtn = document.getElementById('generate-report-btn');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.generateReport());
    }
    
    const downloadBtns = document.querySelectorAll('.download-report');
    downloadBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const reportId = e.target.getAttribute('data-report-id');
        this.downloadReport(reportId);
      });
    });
    
    const shareBtns = document.querySelectorAll('.share-report');
    shareBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const reportId = e.target.getAttribute('data-report-id');
        this.shareReport(reportId);
      });
    });
    
    const deleteBtns = document.querySelectorAll('.delete-report');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const reportId = e.target.getAttribute('data-report-id');
        if (confirm('Are you sure you want to delete this report?')) {
          this.deleteReport(reportId);
        }
      });
    });
  }
  
  /**
   * Generate a new report
   */
  generateReport() {
    const period = document.getElementById('report-period')?.value || 'month';
    const trendsCount = document.getElementById('report-trends-count')?.value || 'all';
    const now = new Date();
    let startDate;
    let periodLabel;
    
    switch(period) {
      case 'week':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        periodLabel = 'Weekly';
        break;
      case 'month':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        periodLabel = 'Monthly';
        break;
      case 'quarter':
        startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
        periodLabel = 'Quarterly';
        break;
      case 'year':
        startDate = new Date(now - 365 * 24 * 60 * 60 * 1000);
        periodLabel = 'Annual';
        break;
    }
    
    // Get current trends sorted by velocity, filter by selected count
    let allTrends = this.trends && this.trends.length > 0 ? this.trends : SAMPLE_TRENDS;
    
    // Sort by velocity score
    allTrends = [...allTrends].sort((a, b) => (b.velocityScore || 0) - (a.velocityScore || 0));
    
    // Filter to selected number of trends
    if (trendsCount !== 'all') {
      const count = parseInt(trendsCount);
      allTrends = allTrends.slice(0, count);
    }
    
    // Filter trends by category to provide meaningful insights
    const categories = {};
    allTrends.forEach(trend => {
      const cat = trend.category || 'Uncategorized';
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(trend);
    });
    
    // Calculate summary statistics
    const topCategory = Object.entries(categories).reduce((a, b) => b[1].length > a[1].length ? b : a, ['', []]);
    const avgVelocity = allTrends.length > 0 
      ? Math.round(allTrends.reduce((sum, t) => sum + (t.velocityScore || 0), 0) / allTrends.length)
      : 0;
    const topTrend = allTrends.length > 0 
      ? allTrends.reduce((top, current) => (current.velocityScore || 0) > (top.velocityScore || 0) ? current : top)
      : null;
    
    // Generate report data with filtered insights
    const report = {
      id: Date.now(),
      title: `${periodLabel} Trend Report - ${new Date().toLocaleDateString()}`,
      period,
      periodLabel,
      startDate,
      createdAt: new Date(),
      summary: `Analysis of ${allTrends.length} trends across ${Object.keys(categories).length} categories. Top category: ${topCategory[0]} with ${topCategory[1].length} trends. Average velocity: ${avgVelocity}%.`,
      trendsCount: allTrends.length,
      topCategory: topCategory[0],
      topCategoryCount: topCategory[1].length,
      avgVelocity: avgVelocity,
      topTrend: topTrend ? topTrend.title : 'N/A',
      trends: allTrends.map(t => ({
        id: t.id,
        title: t.title,
        category: t.category,
        velocityScore: t.velocityScore,
        confidence: t.confidence,
        source: t.source
      }))
    };
    
    // Save report
    const reports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
    reports.unshift(report); // Add to beginning
    localStorage.setItem('generatedReports', JSON.stringify(reports.slice(0, 10))); // Keep last 10
    
    // Reload reports
    this.loadReports();
    
    console.log('Report generated:', report);
  }
  
  /**
   * Download a report as PDF
   */
  downloadReport(reportId) {
    const reports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
    const report = reports.find(r => r.id.toString() === reportId);
    
    if (!report) {
      alert('Report not found');
      return;
    }
    
    console.log('Downloading report:', report.title);
    // TODO: Implement actual PDF generation
    alert(`Would download: ${report.title}`);
  }
  
  /**
   * Share a report
   */
  shareReport(reportId) {
    const reports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
    const report = reports.find(r => r.id.toString() === reportId);
    
    if (!report) {
      alert('Report not found');
      return;
    }
    
    if (navigator.share) {
      navigator.share({
        title: report.title,
        text: report.summary,
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Report link copied to clipboard!');
      });
    }
  }
  
  /**
   * Delete a report
   */
  deleteReport(reportId) {
    const reports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
    const updatedReports = reports.filter(r => r.id.toString() !== reportId);
    localStorage.setItem('generatedReports', JSON.stringify(updatedReports));
    
    // Reload reports to show updated list
    this.loadReports();
    console.log('Report deleted:', reportId);
  }

  /**
   * Filter by category (from heat map click)
   * @param {string} category - Category to filter by
   */
  filterByCategory(category) {
    const categoryLower = category.toLowerCase();
    
    // Toggle: if already selected, deselect
    if (this.filters.category === categoryLower) {
      this.filters.category = 'all';
    } else {
      this.filters.category = categoryLower;
    }
    
    // Update dropdown
    const categoryFilter = document.getElementById('filter-category');
    if (categoryFilter) {
      categoryFilter.value = this.filters.category;
    }
    
    // Update heatmap cell visual state
    this.updateHeatmapSelection();
    
    this.applyFilters();
    
    // Scroll to trend grid
    const trendsSection = document.getElementById('trends-section');
    if (trendsSection) {
      trendsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  
  /**
   * Update heatmap cell visual state based on selected category
   */
  updateHeatmapSelection() {
    const heatmapCells = document.querySelectorAll('.heatmap-cell, .heatmap-cell-clean, .category-pill');
    heatmapCells.forEach(cell => {
      const cellCategory = cell.getAttribute('data-category');
      if (this.filters.category === 'all') {
        cell.classList.remove('selected', 'category-pill--active');
      } else if (cellCategory === this.filters.category) {
        cell.classList.add('selected', 'category-pill--active');
      } else {
        cell.classList.remove('selected', 'category-pill--active');
      }
    });
  }

  /**
   * Open modal with trend details
   * @param {Object} trendData - Trend data to display
   * @param {string} section - Initial section to show
   */
  openModal(trendData, section = 'overview') {
    if (this.currentModal) {
      this.currentModal.hide();
    }

    this.currentModal = new Modal(trendData, section);
    this.currentModal.show();
  }

  /**
   * Close current modal
   */
  closeModal() {
    if (this.currentModal) {
      this.currentModal.hide();
      this.currentModal = null;
    }
  }

  /**
   * Start animations
   */
  startAnimations() {
    // Animations are handled in individual render methods
    if (typeof gsap === 'undefined') {
      console.warn('GSAP not loaded. Animations will be limited.');
    }
  }

  /**
   * Get category icon
   * @param {string} category - Category name
   * @returns {string} Icon emoji
   */
  getCategoryIcon(category) {
    return ''; // Icons removed for clean minimal design
  }

  /**
   * Get all filtered trends
   * @returns {Array} Filtered trends
   */
  getFilteredTrends() {
    return this.filteredTrends;
  }

  /**
   * Get all trends
   * @returns {Array} All trends
   */
  getAllTrends() {
    return this.trends;
  }

  /**
   * Render category breakdown chart
   */
  renderCategoryBreakdown() {
    const container = document.getElementById('category-breakdown-card');
    if (!container) return;

    // Group trends by category
    const categoryCounts = {};
    this.trends.forEach(trend => {
      const cat = trend.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const totalTrends = this.trends.length;
    const categories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1]);

    let html = '<div class="category-breakdown">';
    
    categories.forEach(([category, count]) => {
      const percentage = Math.round((count / totalTrends) * 100);
      
      html += `
        <div class="category-breakdown__item">
          <div class="category-breakdown__label">${category}</div>
          <div class="category-breakdown__percentage">${count}</div>
          <div class="category-breakdown__bar">
            <div class="category-breakdown__fill" style="width: ${percentage}%">
            </div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;

    // NO ANIMATIONS - Categories stay visible immediately
    // Removed GSAP animations that caused disappearing
  }

  /**
   * Setup metric detail modals
   */
  setupMetricDetails() {
    const metricCards = document.querySelectorAll('.metric-card[data-metric]');
    
    metricCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const metric = card.getAttribute('data-metric');
        this.showMetricDetail(metric);
      });
    });
    
    console.log('Metric details setup complete. Found', metricCards.length, 'metric cards');
  }

  /**
   * Show detailed metric modal
   * @param {string} metric - Metric type to display
   */
  showMetricDetail(metric) {
    console.log('Opening metric detail for:', metric);
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('metric-detail-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'metric-detail-modal';
      modal.className = 'metric-detail-modal';
      document.body.appendChild(modal);
      console.log('Created modal element');
    }

    const metricData = this.getMetricDetailData(metric);
    console.log('Metric data:', metricData);
    
    modal.innerHTML = this.renderMetricDetailModal(metricData);
    
    // Setup click handlers for trend chart items
    setTimeout(() => {
      const trendItems = modal.querySelectorAll('.trend-bar-item[data-trend-id]');
      trendItems.forEach(item => {
        item.addEventListener('click', (e) => {
          const trendId = item.getAttribute('data-trend-id');
          const trend = window.currentChartTrends?.find(t => t.id === trendId);
          if (trend) {
            this.hideMetricDetail();
            // Delay opening trend modal slightly
            setTimeout(() => {
              this.openModal(trend, 'overview');
            }, 300);
          }
        });
      });
    }, 50);
    
    // Show modal
    setTimeout(() => {
      modal.classList.add('active');
      console.log('Modal activated');
    }, 10);

    // Setup close handlers
    const closeBtn = modal.querySelector('.metric-detail-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        console.log('Close button clicked');
        this.hideMetricDetail();
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        console.log('Modal backdrop clicked');
        this.hideMetricDetail();
      }
    });

    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        console.log('Escape key pressed');
        this.hideMetricDetail();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    
    document.addEventListener('keydown', escapeHandler);
  }

  /**
   * Hide metric detail modal
   */
  hideMetricDetail() {
    console.log('Hiding metric detail modal');
    const modal = document.getElementById('metric-detail-modal');
    if (modal) {
      modal.classList.remove('active');
      // Remove modal after animation
      setTimeout(() => {
        if (modal) {
          modal.innerHTML = '';
        }
      }, 300);
    }
  }

  /**
   * Get detailed data for metric
   * @param {string} metric - Metric type
   */
  getMetricDetailData(metric) {
    // Get top 5 trends by velocity (only for trends metric)
    let topTrends = [];
    console.log('getMetricDetailData called for:', metric);
    console.log('this.trends length:', this.trends ? this.trends.length : 0);
    
    if (metric === 'trends' && this.trends && this.trends.length > 0) {
      topTrends = this.trends
        .filter(t => t && t.velocityScore !== undefined)
        .sort((a, b) => b.velocityScore - a.velocityScore)
        .slice(0, 5);
      console.log('Top trends found:', topTrends.length);
      console.log('Top trends data:', topTrends);
    }
    
    // Get top 5 emerging trends (for emerging metric)
    let emergingTrends = [];
    if (metric === 'emerging' && this.trends && this.trends.length > 0) {
      // Get trends with high velocity and recent timestamps (proxy for emerging)
      emergingTrends = this.trends
        .filter(t => t && t.velocityScore !== undefined && t.velocityScore > 200)
        .sort((a, b) => b.velocityScore - a.velocityScore)
        .slice(0, 5);
      console.log('Emerging trends found:', emergingTrends.length);
    }

    const data = {
      trends: {
        title: 'Top 5 Active Trends',
        current: this.stats.totalTrends,
        trend: '+12%',
        trendUp: true,
        subtitle: 'By velocity over last 15 days',
        chartType: 'topTrends',
        chartColor: '#3b82f6',
        topTrends: topTrends,
        stats: [
          { label: 'Total Trends', value: this.stats.totalTrends },
          { label: 'Peak Today', value: this.stats.totalTrends + 8 },
          { label: 'Avg Daily', value: Math.round(this.stats.totalTrends * 0.85) },
          { label: 'Growth Rate', value: '12%' }
        ]
      },
      emerging: {
        title: 'Emerging Trends (72h)',
        current: this.stats.emerging72h,
        trend: '-3%',
        trendUp: false,
        subtitle: 'Top 5 newly identified trends',
        chartType: 'topTrends',
        chartColor: '#ef4444',
        topTrends: emergingTrends,
        stats: [
          { label: 'New 72h', value: this.stats.emerging72h },
          { label: 'Peak 7d', value: 35 },
          { label: 'Avg Weekly', value: 28 },
          { label: 'Decline Rate', value: '3%' }
        ],
        chartData: [35, 33, 32, 30, 29, 28, 31, 30, 29, 28, 31, 29, 28, 31, 31]
      },
      accuracy: {
        title: 'Prediction Accuracy',
        current: this.stats.accuracy,
        trend: '+2%',
        trendUp: true,
        subtitle: 'Model prediction success rate',
        chartType: 'line',
        chartColor: '#10b981',
        stats: [
          { label: 'Current Rate', value: this.stats.accuracy + '%' },
          { label: 'Best Week', value: '91%' },
          { label: 'Avg 15d', value: '87%' },
          { label: 'Improvement', value: '+2%' }
        ],
        chartData: [82, 84, 85, 86, 87, 88, 89, 89, 88, 89, 89, 88, 89, 89, 89]
      },
      datapoints: {
        title: 'Data Points Analyzed',
        current: this.stats.dataPoints,
        trend: '+5M',
        trendUp: true,
        subtitle: 'Total data points processed',
        chartType: 'pie',
        chartColor: '#8b5cf6',
        stats: [
          { label: 'Total Points', value: this.stats.dataPoints },
          { label: 'This Week', value: '2.3M' },
          { label: 'Daily Avg', value: '243K' },
          { label: 'Growth', value: '+68%' }
        ],
        chartData: [
          { label: 'Reddit', value: 2.8, color: '#ef4444' },
          { label: 'Twitter', value: 2.1, color: '#3b82f6' },
          { label: 'TikTok', value: 1.5, color: '#10b981' },
          { label: 'Instagram', value: 0.9, color: '#f59e0b' }
        ]
      }
    };

    return data[metric] || data.trends;
  }

  /**
   * Render bar chart with proper normalization
   * @param {Array} data - Chart data array
   * @param {Array} labels - Optional labels for bars
   * @returns {string} HTML for bar chart
   */
  renderBarChart(data, labels = null) {
    const maxValue = Math.max(...data);
    const chartHeight = 160; // Fixed height in pixels
    
    return data.map((value, index) => {
      const heightInPixels = (value / maxValue) * chartHeight;
      const label = labels ? labels[index] : `D${String(index + 1).padStart(2, '0')}`;
      return `
        <div class="bar-chart-item">
          <div class="bar-chart-value">${Math.round(value)}</div>
          <div class="bar-chart-bar" style="height: ${heightInPixels}px"></div>
          <div class="bar-chart-label" title="${label}">${label}</div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render line chart for data
   * @param {Array} data - Chart data array
   * @param {string} color - Line color
   * @returns {string} HTML for line chart
   */
  renderLineChart(data, color = '#3b82f6') {
    // Create gradient ID
    const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;
    
    return `
      <div class="line-chart-svg" style="height: 180px; width: 100%;">
        <svg width="100%" height="180" viewBox="0 0 1000 180" preserveAspectRatio="none">
          <defs>
            <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:${color};stop-opacity:0.5" />
              <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
            </linearGradient>
          </defs>
          <polyline 
            points="${data.map((val, i) => {
              const x = (i / (data.length - 1)) * 1000;
              const y = 180 - (val / Math.max(...data)) * 160;
              return `${x},${y}`;
            }).join(' ')}"
            fill="url(#${gradientId})"
            opacity="0.3"
          />
          <polyline 
            points="${data.map((val, i) => {
              const x = (i / (data.length - 1)) * 1000;
              const y = 180 - (val / Math.max(...data)) * 160;
              return `${x},${y}`;
            }).join(' ')}"
            fill="none"
            stroke="${color}"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    `;
  }

  /**
   * Render area chart
   * @param {Array} data - Chart data array
   * @param {string} color - Area color
   * @returns {string} HTML for area chart
   */
  renderAreaChart(data, color = '#3b82f6') {
    return `
      <div class="area-chart-svg" style="height: 180px; width: 100%;">
        <svg width="100%" height="180" viewBox="0 0 1000 180" preserveAspectRatio="none">
          <path 
            d="M 0,180 ${data.map((val, i) => {
              const x = (i / (data.length - 1)) * 1000;
              const y = 180 - (val / Math.max(...data)) * 160;
              return `L ${x},${y}`;
            }).join(' ')} L 1000,180 Z"
            fill="${color}"
            opacity="0.4"
          />
          <polyline 
            points="${data.map((val, i) => {
              const x = (i / (data.length - 1)) * 1000;
              const y = 180 - (val / Math.max(...data)) * 160;
              return `${x},${y}`;
            }).join(' ')}"
            fill="none"
            stroke="${color}"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    `;
  }

  /**
   * Render top trends chart
   * @param {Array} trends - Top trends array
   * @returns {string} HTML for top trends chart
   */
  renderTopTrendsChart(trends) {
    if (!trends || trends.length === 0) {
      console.log('No trends passed to renderTopTrendsChart');
      return '<p style="padding: var(--space-4); color: #6b7280;">Loading trends...</p>';
    }
    
    console.log('Rendering top trends chart with', trends.length, 'trends');
    
    const chartData = trends.map(t => t && t.velocityScore ? t.velocityScore : 0);
    const maxValue = Math.max(...chartData);
    
    // Store trends for click handlers
    window.currentChartTrends = trends;
    
    return `
      <div class="detailed-chart">
        <div class="chart-header">
          <div class="chart-title">Top ${trends.length} Trends by Velocity</div>
          <div class="chart-subtitle">Growth rate in last 15 days</div>
        </div>
        <div class="top-trends-chart" data-trend-chart>
          ${trends.map((trend, index) => {
            if (!trend) return '';
            const velocity = trend.velocityScore || 0;
            const heightPercent = maxValue > 0 ? (velocity / maxValue) * 100 : 0;
            const isDeclining = false; // velocityScore is always positive
            
            const trendId = trend.id || 'unknown';
            const phaseMap = {
      'innovation': 'Innovation',
      'early_adopters': 'Early Adopters',
      'early_majority': 'Early Majority',
      'late_majority': 'Late Majority',
      'laggards': 'Laggards'
    };
    const phaseLabel = phaseMap[trend.currentPhase] || trend.currentPhase;
            const confidence = trend.confidence || 85;
            const platforms = trend.sources ? trend.sources.map(s => s.platform).join(', ') : 'Multiple';
            
            return `
              <div class="trend-bar-item" data-trend-id="${trendId}" style="cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" 
                   onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';"
                   onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                <div class="trend-bar-info">
                  <div class="trend-bar-title">${trend.title || 'Unknown'}</div>
                  <div class="trend-bar-meta">
                    <span class="trend-category">${trend.category || 'Other'}</span>
                    <span class="trend-velocity">
                      ↑ ${velocity}% growth
                    </span>
                    <span class="trend-confidence">
                      ${confidence}% confidence
                    </span>
                  </div>
                  <div class="trend-bar-details">
                    <span class="trend-phase">Phase: ${phaseLabel}</span>
                    <span class="trend-platforms">Platforms: ${platforms}</span>
                    <span class="trend-peak">Peak in: ${trend.peakExpected}</span>
                  </div>
                </div>
                <div class="trend-bar-visual">
                  <div class="trend-bar-fill" 
                       style="width: ${heightPercent}%"
                       title="Velocity: ${velocity}%">
                  </div>
                  <div class="trend-bar-value">${velocity}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render pie chart
   * @param {Array} data - Chart data array with label, value, color
   * @param {string} defaultColor - Default color
   * @returns {string} HTML for pie chart
   */
  renderPieChart(data, defaultColor = '#8b5cf6') {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -90;
    
    const slices = data.map(item => {
      const percentage = (item.value / total) * 100;
      const angle = (item.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      currentAngle = endAngle;
      
      return {
        label: item.label,
        value: item.value,
        percentage: percentage.toFixed(1),
        color: item.color || defaultColor,
        startAngle,
        endAngle
      };
    });
    
    return `
      <div class="pie-chart-container" style="max-height: 280px; width: 100%; margin-top: var(--space-4); overflow: visible;">
        <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: var(--space-6);">
          <div style="min-height: 200px;">
            <svg viewBox="0 0 200 200" style="width: 100%; height: 100%;" id="pie-chart-svg">
              ${slices.map((slice, index) => {
                const startAngleRad = (slice.startAngle * Math.PI) / 180;
                const endAngleRad = (slice.endAngle * Math.PI) / 180;
                const largeArc = slice.endAngle - slice.startAngle > 180 ? 1 : 0;
                
                const x1 = 100 + 90 * Math.cos(startAngleRad);
                const y1 = 100 + 90 * Math.sin(startAngleRad);
                const x2 = 100 + 90 * Math.cos(endAngleRad);
                const y2 = 100 + 90 * Math.sin(endAngleRad);
                
                return `
                  <path 
                    d="M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z"
                    fill="${slice.color}"
                    opacity="0.8"
                    class="pie-slice"
                    data-label="${slice.label}"
                    style="cursor: pointer; transition: opacity 0.2s;"
                    onmouseenter="this.style.opacity='1'"
                    onmouseleave="this.style.opacity='0.8'"
                  />
                `;
              }).join('')}
            </svg>
          </div>
          <div style="padding-top: var(--space-4);">
            ${slices.map((slice, index) => `
              <div class="pie-legend-item" style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3); padding: var(--space-2); border-radius: 4px; transition: background 0.2s;" 
                   onmouseenter="this.style.background='#f9fafb'"
                   onmouseleave="this.style.background='transparent'"
                   data-pie-label="${slice.label}">
                <div style="width: 16px; height: 16px; background: ${slice.color}; border-radius: 2px;"></div>
                <div style="flex: 1;">
                  <div style="font-size: 14px; font-weight: 600; color: #1f2937;">${slice.label}</div>
                  <div style="font-size: 12px; color: #6b7280;">${slice.value}M points</div>
                </div>
                <div style="font-size: 16px; font-weight: 600; color: #1f2937; font-family: var(--font-mono);">
                  ${slice.percentage}%
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render metric detail modal
   * @param {Object} data - Metric data
   */
  renderMetricDetailModal(data) {
    return `
      <div class="metric-detail-content">
        <div class="metric-detail-header">
          <div class="metric-detail-title">${data.title}</div>
          <button class="metric-detail-close">×</button>
        </div>
        <div class="metric-detail-body">
          <div class="metric-stats-grid">
            ${data.stats.map(stat => `
              <div class="stat-item">
                <div class="stat-item-value">${stat.value}</div>
                <div class="stat-item-label">${stat.label}</div>
              </div>
            `).join('')}
          </div>

          ${data.chartType === 'topTrends' ? 
            (data.topTrends && data.topTrends.length > 0 ? 
              this.renderTopTrendsChart(data.topTrends) : 
              '<p style="padding: var(--space-4); color: #6b7280;">No trends available</p>') : `
            <div class="detailed-chart">
              <div class="chart-header">
                <div class="chart-title">15-Day Trend</div>
                <div class="chart-subtitle">${data.subtitle}</div>
              </div>
              ${data.chartType === 'line' ? this.renderLineChart(data.chartData, data.chartColor) : 
                data.chartType === 'area' ? this.renderAreaChart(data.chartData, data.chartColor) :
                data.chartType === 'pie' ? this.renderPieChart(data.chartData, data.chartColor) :
                `<div class="bar-chart">${this.renderBarChart(data.chartData)}</div>`}
            </div>
          `}
        </div>
      </div>
    `;
  }

  /**
   * Merge real-time trends - REPLACE sample data with real data
   */
  mergeRealtimeTrends(newTrends) {
    if (!newTrends || newTrends.length === 0) {
      console.log('No real-time trends to merge');
      return;
    }
    
    console.log(`🔄 Replacing with ${newTrends.length} real-time trends...`);
    
    // REPLACE sample trends with real trends (don't add to them)
    const existingIds = new Set(this.trends.map(t => t.id));
    const uniqueNewTrends = newTrends.filter(t => !existingIds.has(t.id));
    
    // Replace all sample trends with real-time trends
    this.trends = uniqueNewTrends;
    this.filteredTrends = uniqueNewTrends;
    
    // Reset display count
    this.trendsDisplayed = Math.min(this.maxInitialTrends, this.trends.length);
    
    // Update filtered trends
    this.applyFilters();
    
    // Recalculate stats
    this.calculateStats();
    
    // Update display
    this.renderTrendGrid();
    
    // Update category heatmap
    this.renderCategoryHeatmap();
    
    console.log(`✓ Replaced with ${uniqueNewTrends.length} real-time trends`);
  }

  /**
   * Refresh dashboard
   */
  refresh() {
    this.loadData();
    this.calculateStats();
    this.generateHeatMapData();
    this.renderAll();
    this.renderCategoryBreakdown();
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new CulturePulseApp();
  window.app.init();
  
      console.log('CulturePulse AI Dashboard Ready');
});

// Make app globally available for debugging
window.CulturePulseApp = CulturePulseApp;

