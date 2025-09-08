/**
 * Utility functions for color handling in the application
 */

/**
 * Converts hex color to RGB values
 * @param hex - Hex color string (e.g., "#3B82F6")
 * @returns RGB object with r, g, b values
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Converts RGB values to hex color
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Hex color string
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Validates if a string is a valid hex color
 * @param hex - String to validate
 * @returns Boolean indicating if the string is a valid hex color
 */
export const isValidHexColor = (hex: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
};

/**
 * Gets a contrasting text color (black or white) for a given background color
 * @param backgroundColor - Hex color string
 * @returns "black" or "white" for optimal contrast
 */
export const getContrastingTextColor = (backgroundColor: string): string => {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return "black";
  
  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  
  return luminance > 0.5 ? "black" : "white";
};

/**
 * Applies opacity to a hex color
 * @param hex - Hex color string
 * @param opacity - Opacity value (0-1)
 * @returns RGBA color string
 */
export const hexWithOpacity = (hex: string, opacity: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};