export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: {
    url: string;
    alt: string;
  }[];
  brand: string;
  size: string;
  condition: string;
  externalUrl: string;
}