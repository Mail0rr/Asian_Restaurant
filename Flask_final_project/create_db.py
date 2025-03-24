import sqlite3
from routes.food import dishes, drinks, desserts


conn = sqlite3.connect('database.db')
cursor = conn.cursor()


cursor.execute('''
CREATE TABLE IF NOT EXISTS dishes (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    ingredients TEXT NOT NULL
)
''')


cursor.execute('''
CREATE TABLE IF NOT EXISTS drinks (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    ingredients TEXT NOT NULL
)
''')


cursor.execute('''
CREATE TABLE IF NOT EXISTS desserts (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    ingredients TEXT NOT NULL
)
''')


for dish in dishes:
    cursor.execute('''
    INSERT INTO dishes (id, name, image, description, price, ingredients) VALUES (?, ?, ?, ?, ?, ?)
    ''', (dish['id'], dish['name'], dish['image'], dish['description'], dish['price'], ', '.join(dish['ingredients'])))

for drink in drinks:
    cursor.execute('''
    INSERT INTO drinks (id, name, image, description, price, ingredients) VALUES (?, ?, ?, ?, ?, ?)
    ''', (drink['id'], drink['name'], drink['image'], drink['description'], drink['price'], ', '.join(drink['ingredients'])))

for dessert in desserts:
    cursor.execute('''
    INSERT INTO desserts (id, name, image, description, price, ingredients) VALUES (?, ?, ?, ?, ?, ?)
    ''', (dessert['id'], dessert['name'], dessert['image'], dessert['description'], dessert['price'], ', '.join(dessert['ingredients'])))

conn.commit()
conn.close()