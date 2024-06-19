import { nanoid } from "nanoid";

export const fixTinaResults = <T>(data: T): T => {
  try {
    const serializedData = JSON.stringify(data);
    return JSON.parse(serializedData) as T;
  } catch (error) {
    console.error("Error in serializing/deserializing data:", error);
    throw new Error("Handling data failed");
  }
};

export function checkObjectIsEmpty(result: any) {
  return result === undefined || result === null || Object.keys(result).length === 0;
}

export function stringToFloat2(str: string): number {
  let floatNum = parseFloat(str);
  // Round the number to 2 decimal places
  return parseFloat(floatNum.toFixed(2));
}

export function numberWithScale(n: number, scale: number): number {
  return Number(n.toFixed(scale));
}

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

export function generateActivityCode(): string {
  return getFormattedDate() + nanoid(9);
}