/**
 * Data Validator Utility
 * Validates and sanitizes data to prevent errors
 */

export class DataValidator {
  /**
   * Validate trend data structure
   * @param {Object} trend - Trend data object
   * @returns {Object} Validation result
   */
  static validateTrend(trend) {
    const errors = [];

    // Only validate critical fields, provide defaults for missing ones
    if (!trend.id) {
      errors.push('Missing id');
    }
    if (!trend.title) {
      errors.push('Missing title');
    }

    // Category is optional (use 'Uncategorized' if missing)
    if (!trend.category) {
      trend.category = 'Uncategorized';
    }

    // velocityScore can be undefined, we'll default it
    if (trend.velocityScore === undefined || trend.velocityScore === null) {
      trend.velocityScore = 0;
    }

    // Validate velocityScore is a number
    if (typeof trend.velocityScore !== 'number' || isNaN(trend.velocityScore)) {
      trend.velocityScore = 0;
    }

    // Validate arrays exist (always set defaults, don't fail)
    if (!Array.isArray(trend.sources)) trend.sources = [];
    if (!Array.isArray(trend.tags)) trend.tags = [];
    if (!Array.isArray(trend.jackMortonApplications)) {
      trend.jackMortonApplications = [];
    }

    // Only fail if ID or title are missing
    return {
      isValid: !errors.some(e => e.includes('id') || e.includes('title')),
      errors,
      trend
    };
  }

  /**
   * Sanitize trend data
   * @param {Object} trend - Raw trend data
   * @returns {Object} Sanitized trend
   */
  static sanitizeTrend(trend) {
    return {
      id: trend.id || `trend_${Date.now()}`,
      title: this.sanitizeString(trend.title, 'Untitled Trend'),
      category: this.sanitizeString(trend.category, 'Uncategorized'),
      velocityScore: this.sanitizeNumber(trend.velocityScore, 0),
      sources: Array.isArray(trend.sources) ? trend.sources : [],
      tags: Array.isArray(trend.tags) ? trend.tags : [],
      currentPhase: this.sanitizeString(trend.currentPhase, 'unknown'),
      peakExpected: this.sanitizeString(trend.peakExpected, 'Unknown'),
      shortDescription: this.sanitizeString(trend.shortDescription, 'No description available'),
      culturalAnalysis: trend.culturalAnalysis || {},
      experientialTranslation: trend.experientialTranslation || {},
      jackMortonApplications: trend.jackMortonApplications || [],
      primaryAudience: trend.primaryAudience || {
        gender: 'All',
        ageRange: '18-34',
        geographics: 'Global',
        psychographics: 'Tech-savvy'
      },
      metrics: trend.metrics || {}
    };
  }

  /**
   * Sanitize string input
   * @param {*} input - Input value
   * @param {string} fallback - Fallback value
   * @returns {string} Sanitized string
   */
  static sanitizeString(input, fallback = '') {
    if (typeof input === 'string') {
      return input.trim();
    }
    return fallback;
  }

  /**
   * Sanitize number input
   * @param {*} input - Input value
   * @param {number} fallback - Fallback value
   * @returns {number} Sanitized number
   */
  static sanitizeNumber(input, fallback = 0) {
    const num = Number(input);
    return !isNaN(num) ? num : fallback;
  }

  /**
   * Validate chart data
   * @param {Array} data - Chart data
   * @returns {boolean} Is valid
   */
  static validateChartData(data) {
    if (!Array.isArray(data)) return false;
    if (data.length === 0) return false;
    
    return data.every(item => 
      item && 
      typeof item === 'object' && 
      ('value' in item || 'x' in item && 'y' in item)
    );
  }

  /**
   * Validate modal data
   * @param {Object} data - Modal data
   * @returns {boolean} Is valid
   */
  static validateModalData(data) {
    return data && 
           typeof data === 'object' && 
           data.id && 
           data.title;
  }
}

