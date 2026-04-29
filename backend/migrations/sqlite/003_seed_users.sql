-- Known accounts for local dev / household (INSERT OR IGNORE = idempotent)
INSERT OR IGNORE INTO users (
    id, username, email, password_hash, first_name, last_name,
    is_active, created_at, updated_at
) VALUES (
    'b822cae1-4030-42ff-907a-b4333fde84c7',
    'admin',
    'admin@monman.com',
    '$2a$12$boQg.hcI1uYIMm/Y68A8teMUSNy3/PL8b8csVXdWkSn56eH6x2t7K',
    'Admin',
    'User',
    1,
    datetime('now'),
    datetime('now')
);

INSERT OR IGNORE INTO users (
    id, username, email, password_hash, first_name, last_name,
    is_active, created_at, updated_at
) VALUES (
    'd5f55c34-51f3-4543-93d9-ba05b7221f8f',
    'testuser',
    'test@example.com',
    '$2a$12$egbf9JeH4.hjsEMgNFdKdubNt8E/CqGHKSKJ8rYGOxEpCJMPK8KGG',
    'Test',
    'User',
    1,
    datetime('now'),
    datetime('now')
);

INSERT OR IGNORE INTO users (
    id, username, email, password_hash, first_name, last_name,
    is_active, created_at, updated_at
) VALUES (
    '9bfd4c32-c412-47be-9cba-f7197bedd876',
    'demo',
    'demo@monman.com',
    '$2a$12$tqrLYCxtyyPrhzXFOysv6uRGIFoeO6XMkGJxLoIS6QXmNaF3Zd4b.',
    'Demo',
    'User',
    1,
    datetime('now'),
    datetime('now')
);

INSERT OR IGNORE INTO users (
    id, username, email, password_hash, first_name, last_name,
    is_active, created_at, updated_at
) VALUES (
    '106e568f-9706-4a9d-80f3-e5db78ee0d01',
    'budi',
    'budi@example.com',
    '$2a$12$csFO24P7r9.1QII8/yKF/Oq4HTTJdGRQnejoUbnCBdePmEFMG9cR6',
    'Budi',
    'Santoso',
    1,
    datetime('now'),
    datetime('now')
);
