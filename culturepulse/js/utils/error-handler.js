/**
 * Error Handler Utility
 * Comprehensive error handling and logging system for CulturePulse AI
 */

export class ErrorHandler {
  constructor() {
    this.errors = [];
    this.isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
  }

  /**
   * Log and handle errors gracefully
   * @param {Error} error - The error object
   * @param {string} context - Where the error occurred
   * @param {Object} metadata - Additional context
   */
  handle(error, context = 'Unknown', metadata = {}) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context,
      metadata,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    this.errors.push(errorInfo);

    // Log to console (only in development)
    if (!this.isProduction) {
      console.error(`[${context}]`, error, metadata);
    }

    // Show user-friendly message in production
    if (this.isProduction) {
      this.showUserMessage(`Something went wrong. ${context} error.`);
    }

    // Return safe default to prevent crashes
    return null;
  }

  /**
   * Show user-friendly error message
   * @param {string} message - Message to display
   */
  showUserMessage(message) {
    // Create error notification if not exists
    let notification = document.getElementById('error-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'error-notification';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 14px;
        max-width: 400px;
      `;
      document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      notification.style.display = 'none';
    }, 5000);
  }

  /**
   * Safe data retrieval with fallback
   * @param {Function} fn - Function to execute
   * @param {*} fallback - Fallback value
   * @returns {*} Result or fallback
   */
  safe(fn, fallback = null) {
    try {
      return fn();
    } catch (error) {
      this.handle(error, 'Safe execution');
      return fallback;
    }
  }

  /**
   * Validate trend data structure
   * @param {Object} trend - Trend data to validate
   * @returns {boolean} Is valid
   */
  validateTrend(trend) {
    const required = ['id', 'title', 'category', 'velocityScore'];
    return required.every(field => trend && trend[field] !== undefined && trend[field] !== null);
  }

  /**
   * Get error count
   * @returns {number} Number of errors
   */
  getErrorCount() {
    return this.errors.length;
  }

  /**
   * Get error logs
   * @returns {Array} Error logs
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Clear errors
   */
  clear() {
    this.errors = [];
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

/**
 * Global error handler
 */
window.addEventListener('error', (event) => {
  errorHandler.handle(event.error, 'Global error');
});

/**
 * Unhandled promise rejection handler
 */
window.addEventListener('unhandledrejection', (event) => {
  errorHandler.handle(event.reason, 'Unhandled promise rejection');
  event.preventDefault();
});

