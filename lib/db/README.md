# Database Connection Guide

## Quick Start

This project uses PostgreSQL for data persistence with a secure, pool-based connection system.

## 🔧 Setup

Database credentials are configured in `.env.local`:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=tonkawzaa
POSTGRES_PASSWORD=T045281842p
POSTGRES_DB=rarity_runner
```

## 📖 Usage

### Import the database module

```typescript
import { query, transaction, getClient } from "@/lib/db";
```

### Execute a query

**Always use parameterized queries** to prevent SQL injection:

```typescript
// ✅ Safe - parameterized query
const users = await query("SELECT * FROM users WHERE email = $1", [
  "user@example.com",
]);

// ❌ Unsafe - never do this
const users = await query(`SELECT * FROM users WHERE email = '${email}'`);
```

### Use transactions

The `transaction` helper automatically handles BEGIN, COMMIT, and ROLLBACK:

```typescript
await transaction(async (client) => {
  await client.query("INSERT INTO orders (user_id, total) VALUES ($1, $2)", [
    userId,
    100,
  ]);
  await client.query(
    "UPDATE inventory SET stock = stock - 1 WHERE product_id = $1",
    [productId]
  );
});
```

### Manual client management

For complex operations:

```typescript
const client = await getClient();
try {
  await client.query("BEGIN");
  // Your queries here
  await client.query("COMMIT");
} catch (e) {
  await client.query("ROLLBACK");
  throw e;
} finally {
  client.release();
}
```

## 🧪 Testing

Test the database connection:

```bash
npx tsx lib/db/test-connection.ts
```

## 🔒 Security Features

- ✅ Environment-based configuration
- ✅ Connection pooling (max 20 connections)
- ✅ Automatic idle connection cleanup (30s timeout)
- ✅ Parameterized query support
- ✅ Transaction support with auto-rollback
- ✅ TypeScript type safety

## 📁 Database Files

- `lib/db/db.ts` - Main database utilities
- `lib/db/db.config.ts` - Configuration settings
- `lib/db/types.ts` - TypeScript types
- `lib/db/index.ts` - Exports

## 🛠️ Utilities

**Setup database** (creates DB if it doesn't exist):

```bash
npx tsx lib/db/setup-db.ts
```

**Test connection**:

```bash
npx tsx lib/db/test-connection.ts
```

## 📚 Connection Pool Info

The connection pool maintains a shared pool of PostgreSQL connections for optimal performance:

- Maximum connections: 20
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

Get pool status:

```typescript
import { getPoolStatus } from "@/lib/db";

const status = getPoolStatus();
console.log(status); // { totalCount, idleCount, waitingCount }
```

## 🔐 Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Always use parameterized queries** - Prevents SQL injection
3. **Use transactions for multi-step operations** - Ensures data consistency
4. **Close the pool on shutdown** - Call `closePool()` when shutting down the app

---

## 👤 User Database

### ตาราง `users`

| Column         | Type         | Description                          |
| -------------- | ------------ | ------------------------------------ |
| id             | VARCHAR(255) | Primary Key (Google User ID)         |
| email          | VARCHAR(255) | Email (ต้องไม่ซ้ำ)                   |
| name           | VARCHAR(255) | ชื่อผู้ใช้                           |
| image          | TEXT         | URL รูปโปรไฟล์จาก Google             |
| email_verified | BOOLEAN      | ยืนยัน email แล้วหรือไม่             |
| created_at     | TIMESTAMP    | วันที่สร้างบัญชี                     |
| updated_at     | TIMESTAMP    | วันที่อัพเดตล่าสุด (อัพเดตอัตโนมัติ) |
| last_login     | TIMESTAMP    | วันที่ login ล่าสุด                  |

### การติดตั้ง

#### วิธีที่ 1: ใช้ Migration Script (แนะนำ)

```bash
npx tsx lib/db/migrate.ts
```

#### วิธีที่ 2: รัน SQL โดยตรง

```bash
psql -U tonkawzaa -d rarity_runner -f lib/db/schema/users.sql
```

### การใช้งาน User Model

**ดึงข้อมูล User:**

```typescript
import { getUserById, getUserByEmail } from "@/lib/db/models/user";

const user = await getUserById("google-user-id");
const user = await getUserByEmail("user@example.com");
```

**สร้าง/อัพเดต User (UPSERT):**

```typescript
import { upsertUser } from "@/lib/db/models/user";

const user = await upsertUser({
  id: "google-user-id",
  email: "user@example.com",
  name: "John Doe",
  image: "https://...",
  email_verified: true,
});
```

**อัพเดต Last Login:**

```typescript
import { updateLastLogin } from "@/lib/db/models/user";
await updateLastLogin("google-user-id");
```

**ลบ User:**

```typescript
import { deleteUser } from "@/lib/db/models/user";
const deleted = await deleteUser("google-user-id");
```

### ฟีเจอร์พิเศษ

- **UPSERT**: ระบบใช้ `ON CONFLICT` เพื่ออัพเดตข้อมูลหาก user มีอยู่แล้ว
- **Auto-Update**: `updated_at` จะถูกอัพเดตอัตโนมัติด้วย PostgreSQL trigger
- **Index**: มี index บน `email` column เพื่อการค้นหาที่รวดเร็ว
- **Auto-Save**: ระบบบันทึกข้อมูล user อัตโนมัติหลังจาก Google OAuth login

---

For more information, see the database module source code in `lib/db/`.
