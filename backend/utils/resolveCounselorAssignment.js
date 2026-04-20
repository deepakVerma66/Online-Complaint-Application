const wardAreaMappings = require('../config/wardAreaMappings');

const normalizeArea = (value) => value?.trim().toLowerCase() || '';

const resolveCounselorAssignment = ({ area, ward }) => {
  if (Number.isInteger(ward) && ward > 0) {
    const wardMatch = wardAreaMappings.find((item) => item.ward === ward);

    if (wardMatch) {
      return wardMatch;
    }
  }

  const normalizedArea = normalizeArea(area);

  if (!normalizedArea) {
    return null;
  }

  const areaMatches = wardAreaMappings.filter((item) => normalizeArea(item.area) === normalizedArea);

  if (areaMatches.length === 1) {
    return areaMatches[0];
  }

  return null;
};

module.exports = {
  resolveCounselorAssignment
};
