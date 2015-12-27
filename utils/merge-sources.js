
/**
 * Helper to merge sources
 */
module.exports = function mergeSources() {
  var sources = arguments;
  var merged = [];
  for (var s = 0; s < sources.length; s++) {
    if (sources[s]) {
      if (Array.isArray(sources[s])) {
        merged = merged.concat(merged, sources[s]);
      }
      else if (typeof sources[s] === 'string') {
        merged.push(sources[s]);
      }
    }
  }
  return merged;
};
