import { NextResponse } from 'next/server';

// Mock data - in a real app, this would come from a database
const products = [
  { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics' },
  { id: 2, name: 'Coffee Mug', price: 12.99, category: 'Home & Kitchen' },
  { id: 3, name: 'Running Shoes', price: 89.99, category: 'Sports' },
];

export async function GET() {
  try {
    // In a real app, you'd fetch from a database here
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, category } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    // In a real app, you'd save to a database here
    const newProduct = {
      id: products.length + 1,
      name,
      price: parseFloat(price),
      category,
    };

    products.push(newProduct);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
} 