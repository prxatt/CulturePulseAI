/**
 * Vercel Analytics Integration for CulturePulse AI
 * Tracks page views and user interactions
 */

import { injectSpeedInsights, inject } from '@vercel/analytics';

// Initialize Vercel Analytics
// This will automatically track page views and route changes
if (typeof window !== 'undefined') {
  inject();
  
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
    window.trackCulturePulseEvent('trend_saved', {
      trendId: event.detail.trendId,
      category: event.detail.category
    });
  });

  // Track metric detail views
  window.addEventListener('metric:view', (event) => {
    window.trackCulturePulseEvent('metric_detail', {
      metricType: event.detail.metricType
    });
  });

  // Track report generations
  window.addEventListener('report:generated', (event) => {
    window.trackCulturePulseEvent('report_generated', {
      period: event.detail.period,
      trendsCount: event.detail.trendsCount
    });
  });

  console.log('✓ Vercel Analytics initialized for CulturePulse AI');
}

export {};
