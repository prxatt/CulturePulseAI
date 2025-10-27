/**
 * Vercel Analytics Integration for CulturePulse AI
 * Tracks page views and user interactions
 */

// Initialize Vercel Analytics using CDN script
// The Vercel Analytics script is loaded via script tag in index.html
if (typeof window !== 'undefined') {
  // Vercel Analytics is loaded via CDN, no manual inject needed
  
  // Track custom events for CulturePulse AI
  window.trackCulturePulseEvent = function(eventName, properties = {}) {
    if (window.va) {
      window.va.track(eventName, properties);
    }
  };

  // Track trend card views
  window.addEventListener('trend:view', (event) => {
    const detail = event.detail || {};
    window.trackCulturePulseEvent('trend_view', {
      trendId: detail.trendId,
      category: detail.category,
      source: detail.source
    });
  });

  // Track trend saves
  window.addEventListener('trend:saved', (event) => {
    const detail = event.detail || {};
    window.trackCulturePulseEvent('trend_saved', {
      trendId: detail.trendId,
      category: detail.category
    });
  });

  // Track metric detail views
  window.addEventListener('metric:view', (event) => {
    const detail = event.detail || {};
    window.trackCulturePulseEvent('metric_detail', {
      metricType: detail.metricType
    });
  });

  // Track report generations
  window.addEventListener('report:generated', (event) => {
    const detail = event.detail || {};
    window.trackCulturePulseEvent('report_generated', {
      period: detail.period,
      trendsCount: detail.trendsCount
    });
  });

  // console.log('✓ Vercel Analytics initialized for CulturePulse AI');
}

export {};
