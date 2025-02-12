// C:\Users\JJALa\Desktop\W4CWebsite\artwhickycharity\types\product.ts

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    cloudinary_id: string;
    stock: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type CartItem = Product & {
    quantity: number;
}
  