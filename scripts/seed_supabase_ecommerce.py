import re
import sys
import os
import psycopg2
from dotenv import load_dotenv

# Load env from khin-ticketing-system for the working pooler DSN
load_dotenv('/home/sondre/repos/khin-ticketing-system/.env')
dsn = os.getenv("DATABASE_URL")
if not dsn:
    print("No DATABASE_URL found!")
    sys.exit(1)

with open('src/data/mock-data.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Parse products
products = []
raw_products = re.split(r'\n\s*\{\s*\n\s*id:\s*[\'\"](prod-[^\'\"]+)[\'\"]', text)

for i in range(1, len(raw_products), 2):
    prod_id = raw_products[i]
    chunk = raw_products[i+1]
    
    title_m = re.search(r'title:\s*[\'\"]([^\'\"]+)[\'\"]', chunk)
    desc_m = re.search(r'description:\s*[\'\"]([^\'\"]+)[\'\"]', chunk)
    cat_m = re.search(r'category:\s*[\'\"]([^\'\"]+)[\'\"]', chunk)
    retailer_m = re.search(r'retailerName:\s*[\'\"]([^\'\"]+)[\'\"]', chunk)
    source_m = re.search(r'sourceUrl:\s*[\'\"]([^\'\"]+)[\'\"]', chunk)
    weight_m = re.search(r'weightLbs:\s*([0-9\.]+)', chunk)
    base_m = re.search(r'basePriceUsd:\s*([0-9\.]+)', chunk)
    stock_m = re.search(r'stockQuantity:\s*([0-9]+)', chunk)
    
    # image urls
    imgs_m = re.search(r'imageUrls:\s*\[(.*?)\]', chunk, re.DOTALL)
    img_urls = []
    if imgs_m:
        img_urls = re.findall(r'[\'\"]([^\'\"]+)[\'\"]', imgs_m.group(1))
    
    title = title_m.group(1) if title_m else "US Item"
    desc = desc_m.group(1) if desc_m else ""
    cat = cat_m.group(1) if cat_m else "Clothes"
    retailer = retailer_m.group(1) if retailer_m else "US Outlets"
    source = source_m.group(1) if source_m else ""
    weight = float(weight_m.group(1)) if weight_m else 1.0
    base_usd = float(base_m.group(1)) if base_m else 25.0
    stock = int(stock_m.group(1)) if stock_m else 10
    
    # Landed cost approx: USD * 59 * 1.3 + weight * 7.5 * 59 + handling
    selling_php = round((base_usd * 1.15 * 59) + (weight * 7.5 * 59) + (3.0 * 59))
    
    products.append({
        'id': prod_id,
        'title': title,
        'description': desc,
        'category': cat,
        'retailer_name': retailer,
        'source_url': source,
        'image_urls': img_urls,
        'weight_lbs': weight,
        'base_price_usd': base_usd,
        'selling_price_php': selling_php,
        'stock_quantity': stock
    })

print(f"Extracted {len(products)} products from mock-data.ts")

conn = psycopg2.connect(dsn, connect_timeout=15)
conn.autocommit = True
cur = conn.cursor()

# 1. Insert Head Admin & Sample Users
users_to_seed = [
    {
        'id': 'usr-admin-khinag',
        'email': 'khinag@usgoodspasabuy.ph',
        'password_hash': 'admin_authenticated',
        'full_name': 'Khin Andrei Gamboa',
        'phone_number': '+63 917 888 9999',
        'role': 'ADMIN',
        'shipping_address': '{"street": "Tower 1 Fort Bonifacio", "city": "Taguig", "province": "Metro Manila"}'
    },
    {
        'id': 'usr-cust-maria',
        'email': 'maria.santos@gmail.com',
        'password_hash': 'otp_verified',
        'full_name': 'Maria Santos',
        'phone_number': '+63 917 123 4567',
        'role': 'CUSTOMER',
        'shipping_address': '{"street": "Unit 14B Tower 2 One Serendra", "barangay": "Fort Bonifacio", "city": "Taguig", "province": "Metro Manila", "postalCode": "1634"}'
    },
    {
        'id': 'usr-cust-juan',
        'email': 'juan.delacruz@yahoo.com',
        'password_hash': 'otp_verified',
        'full_name': 'Juan Dela Cruz',
        'phone_number': '+63 918 555 7890',
        'role': 'CUSTOMER',
        'shipping_address': '{"street": "123 Mabini St", "barangay": "Poblacion", "city": "Makati", "province": "Metro Manila", "postalCode": "1210"}'
    }
]

for u in users_to_seed:
    cur.execute('''
        INSERT INTO "khin-ecommerce".users (id, email, password_hash, full_name, phone_number, role, shipping_address, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, NOW())
        ON CONFLICT (email) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            shipping_address = EXCLUDED.shipping_address,
            updated_at = NOW();
    ''', (u['id'], u['email'], u['password_hash'], u['full_name'], u['phone_number'], u['role'], u['shipping_address']))

print(f"Successfully seeded {len(users_to_seed)} users into 'khin-ecommerce'.users")

# 2. Insert Products
for p in products:
    cur.execute('''
        INSERT INTO "khin-ecommerce".products (
            id, title, description, category, retailer_name, source_url, image_urls,
            weight_lbs, base_price_usd, selling_price_php, is_custom_request, is_active, stock_quantity, updated_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, FALSE, TRUE, %s, NOW())
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            category = EXCLUDED.category,
            retailer_name = EXCLUDED.retailer_name,
            source_url = EXCLUDED.source_url,
            image_urls = EXCLUDED.image_urls,
            weight_lbs = EXCLUDED.weight_lbs,
            base_price_usd = EXCLUDED.base_price_usd,
            selling_price_php = EXCLUDED.selling_price_php,
            stock_quantity = EXCLUDED.stock_quantity,
            updated_at = NOW();
    ''', (
        p['id'], p['title'], p['description'], p['category'], p['retailer_name'],
        p['source_url'], p['image_urls'], p['weight_lbs'], p['base_price_usd'],
        p['selling_price_php'], p['stock_quantity']
    ))

print(f"Successfully seeded {len(products)} products into 'khin-ecommerce'.products")

# 3. Insert Restock Requests
restocks = [
    {
        'id': 'req-101',
        'product_id': 'prod-ck-01',
        'product_title': "Calvin Klein Men's Classic Monogram Crewneck T-Shirt",
        'customer_email': 'maria.santos@gmail.com',
        'customer_name': 'Maria Santos',
        'status': 'PENDING',
        'seller_notes': 'Checking next weekend drop at Woodbury Common.'
    },
    {
        'id': 'req-102',
        'product_id': 'prod-th-02',
        'product_title': "Tommy Hilfiger Classic Oxford Button-Down Shirt",
        'customer_email': 'juan.delacruz@yahoo.com',
        'customer_name': 'Juan Dela Cruz',
        'status': 'SELLER_CONTACTED',
        'seller_notes': 'Messaged customer on Viber, confirmed Medium fit.'
    }
]

for r in restocks:
    cur.execute('''
        INSERT INTO "khin-ecommerce".restock_requests (
            id, product_id, product_title, customer_email, customer_name, status, seller_notes, updated_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
        ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            seller_notes = EXCLUDED.seller_notes,
            updated_at = NOW();
    ''', (r['id'], r['product_id'], r['product_title'], r['customer_email'], r['customer_name'], r['status'], r['seller_notes']))

print(f"Successfully seeded {len(restocks)} restock requests into 'khin-ecommerce'.restock_requests")

# Refresh PostgREST schema cache
cur.execute("NOTIFY pgrst, 'reload schema';")
cur.close()
conn.close()

print("\nAll data successfully synchronized to 'khin-ecommerce' in Supabase!")
