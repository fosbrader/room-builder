import { UnitSystem } from '../types/schema';

const INCHES_PER_FOOT = 12;
const INCHES_PER_METER = 39.3701;

/**
 * Format a dimension value (in inches) to a display string
 */
export function formatDimension(inches: number, units: UnitSystem): string {
  if (units === 'ft-in') {
    const totalInches = Math.abs(inches);
    const feet = Math.floor(totalInches / INCHES_PER_FOOT);
    const remainingInches = Math.round(totalInches % INCHES_PER_FOOT);
    
    const sign = inches < 0 ? '-' : '';
    
    if (feet === 0) {
      return `${sign}${remainingInches}"`;
    }
    if (remainingInches === 0) {
      return `${sign}${feet}'`;
    }
    return `${sign}${feet}'-${remainingInches}"`;
  }
  
  // Meters
  const meters = inches / INCHES_PER_METER;
  return `${meters.toFixed(2)}m`;
}

/**
 * Parse a dimension string back to inches
 */
export function parseDimension(value: string, units: UnitSystem): number | null {
  const cleanValue = value.trim();
  
  if (units === 'ft-in') {
    // Try to match feet and inches: 5'-6" or 5' 6" or 5'6"
    const feetInchesMatch = cleanValue.match(/^(-?)(\d+)'[\s-]*(\d+)"?$/);
    if (feetInchesMatch) {
      const sign = feetInchesMatch[1] === '-' ? -1 : 1;
      const feet = parseInt(feetInchesMatch[2], 10);
      const inches = parseInt(feetInchesMatch[3], 10);
      return sign * (feet * INCHES_PER_FOOT + inches);
    }
    
    // Try feet only: 5'
    const feetMatch = cleanValue.match(/^(-?)(\d+)'$/);
    if (feetMatch) {
      const sign = feetMatch[1] === '-' ? -1 : 1;
      return sign * parseInt(feetMatch[2], 10) * INCHES_PER_FOOT;
    }
    
    // Try inches only: 6" or 6
    const inchesMatch = cleanValue.match(/^(-?)(\d+)"?$/);
    if (inchesMatch) {
      const sign = inchesMatch[1] === '-' ? -1 : 1;
      return sign * parseInt(inchesMatch[2], 10);
    }
    
    // Try decimal feet: 5.5'
    const decimalFeetMatch = cleanValue.match(/^(-?)(\d+\.?\d*)'$/);
    if (decimalFeetMatch) {
      const sign = decimalFeetMatch[1] === '-' ? -1 : 1;
      return sign * parseFloat(decimalFeetMatch[2]) * INCHES_PER_FOOT;
    }
  } else {
    // Meters: 2.5m or 2.5
    const metersMatch = cleanValue.match(/^(-?)(\d+\.?\d*)m?$/);
    if (metersMatch) {
      const sign = metersMatch[1] === '-' ? -1 : 1;
      return sign * parseFloat(metersMatch[2]) * INCHES_PER_METER;
    }
  }
  
  // Fallback: try parsing as raw number (inches for ft-in, meters for metric)
  const numValue = parseFloat(cleanValue);
  if (!isNaN(numValue)) {
    return units === 'ft-in' ? numValue : numValue * INCHES_PER_METER;
  }
  
  return null;
}

/**
 * Convert inches to the display unit (feet for ft-in, meters for metric)
 */
export function toDisplayUnit(inches: number, units: UnitSystem): number {
  if (units === 'ft-in') {
    return inches / INCHES_PER_FOOT;
  }
  return inches / INCHES_PER_METER;
}

/**
 * Convert display unit back to inches
 */
export function fromDisplayUnit(value: number, units: UnitSystem): number {
  if (units === 'ft-in') {
    return value * INCHES_PER_FOOT;
  }
  return value * INCHES_PER_METER;
}

/**
 * Get the grid size label
 */
export function getGridSizeLabel(gridSizeInches: number, units: UnitSystem): string {
  if (units === 'ft-in') {
    if (gridSizeInches === 12) return '1 ft';
    if (gridSizeInches === 6) return '6 in';
    if (gridSizeInches === 3) return '3 in';
    if (gridSizeInches === 1) return '1 in';
    return formatDimension(gridSizeInches, units);
  }
  
  const meters = gridSizeInches / INCHES_PER_METER;
  if (meters === 1) return '1 m';
  if (meters === 0.5) return '50 cm';
  if (meters === 0.1) return '10 cm';
  return `${(meters * 100).toFixed(0)} cm`;
}
