export function divideWithScale(dividend: number, divisor: number, scale: number): number {
  const result = dividend / divisor;
  const roundedResult = Number(result.toFixed(scale));
  return roundedResult;
}
// const result = divideWithScale(10, 3, 2); // Divide 10 by 3 and round the result to 2 decimal places
// console.log(result); // Output: 3.33
export function getFormattedDate(): string {
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');

    return `${year}${month}${day}`;
}

export function isNonEmptyString(str: any): boolean {
    return typeof str === 'string' && str.trim() !== '';
}