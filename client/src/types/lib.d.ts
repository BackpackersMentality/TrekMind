declare module "../../../lib/treks" {
  export function getAllTreks(): any[];
  export function getTrekById(id: string): any;
  export function getItinerary(id: string): any[];
  export function getEditorialContent(id: string): any;
}

declare module "../../../lib/images" {
  export function getTrekHeroImage(filename: string): string;
}
