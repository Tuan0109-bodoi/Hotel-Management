/**
 * Check if two date ranges overlap
 * Overlap condition: existingStart < newEnd AND existingEnd > newStart
 */
export function datesOverlap(existingStart, existingEnd, newStart, newEnd) {
  return new Date(existingStart) < new Date(newEnd) && new Date(existingEnd) > new Date(newStart);
}

/**
 * Calculate number of nights between two dates
 */
export function calculateNights(checkInDate, checkOutDate) {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = checkOut - checkIn;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}
