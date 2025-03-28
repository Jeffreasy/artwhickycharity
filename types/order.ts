import { CartItem } from './product'

export interface OrderItem extends CartItem {
  order_id: string
}

export interface Order {
  id: string
  order_number: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_address: string
  customer_city: string
  customer_postal_code: string
  customer_country: string
  total_amount: number
  items: OrderItem[]
  status: 'pending' | 'paid' | 'completed' | 'cancelled'
  payment_reference?: string
  emails_sent?: boolean
  created_at: string
  updated_at: string
}

// SQL voor Supabase:
/*
create table orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text not null unique,
  customer_first_name text not null,
  customer_last_name text not null,
  customer_email text not null,
  customer_address text not null,
  customer_city text not null,
  customer_postal_code text not null,
  customer_country text not null,
  total_amount numeric not null,
  status text not null default 'pending',
  payment_reference text,
  emails_sent boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id text not null,
  quantity integer not null,
  price numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Functie om order_number te genereren
create or replace function generate_order_number()
returns text as $$
declare
  year text := extract(year from current_timestamp)::text;
  next_number integer;
begin
  -- Get the next number for this year
  select coalesce(max(substring(order_number from '\d+$')::integer), 0) + 1
  into next_number
  from orders
  where order_number like year || '/%';
  
  -- Format as YYYY/XX with leading zeros
  return year || '/' || lpad(next_number::text, 2, '0');
end;
$$ language plpgsql;

-- Trigger om automatisch order_number te genereren
create trigger set_order_number
before insert on orders
for each row
when (new.order_number is null)
execute function generate_order_number();

-- SQL voor het toevoegen van emails_sent kolom aan bestaande tabel:
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS emails_sent boolean default false;
*/ 