
/**
 * Dependencies.
 */

var debug = require('debug')('token-bucket');

/**
 * Export.
 */

module.exports = Bucket;

/**
 * Creates a "bucket" with `capacity`.
 *
 * @param {Number} capacity
 * @constructor
 * @public
 */

function Bucket (options) {
  options = options || {};
  this.capacity = options.capacity || Infinity;
  this.refillRate = options.refillRate || 1;
  this.left = this.capacity;
  this.last = time();
}

/**
 * Invokes the `fn`, throttling accordingly.
 *
 * @param {Function} fn
 * @public
 */

Bucket.prototype.throttle = function (tokens, fn) {
  if (this.capacity === Infinity) return fn();

  var self = this;
  var now = time();
  var delta = Math.max(now - this.last, 0) / 1000;
  var amount = delta * this.refillRate; // Refill rate is per second

  this.last = now;
  this.left = Math.min(this.left + amount, this.capacity);

  if (this.left < 1) {
    debug('throttled');
    setTimeout(function () {
      self.throttle(fn);
    }, Math.ceil((1 - this.left) * 1000));
    return;
  }

  debug('calling');
  this.left -= tokens;
  fn.call(null);
};

/**
 * Now utility (for shotty browsers).
 *
 * @private
 * @return {Number}
 */

function time() {
  return new Date().getTime();
}
