# Quick Reference - User Database

## 🚀 Quick Start

```bash
# สร้างตาราง users (ครั้งแรก)
npx tsx lib/db/migrate.ts

# ทดสอบระบบ
npx tsx lib/db/test-user-model.ts

# รันแอพ
npm run dev
```

## 💾 Database Schema

```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,      -- Google User ID
  email VARCHAR(255) UNIQUE,        -- Email (unique)
  name VARCHAR(255),                -- Display name
  image TEXT,                       -- Profile image URL
  email_verified BOOLEAN,           -- Email verified status
  created_at TIMESTAMP,             -- Created timestamp
  updated_at TIMESTAMP,             -- Auto-updated timestamp
  last_login TIMESTAMP              -- Last login timestamp
);
```

## 📝 Common Operations

### Get Current User (in API/Server Component)

```typescript
import { auth } from "@/auth";
import { getUserById } from "@/lib/db/models/user";

// In API Route or Server Component
const session = await auth();
if (session?.user?.id) {
  const user = await getUserById(session.user.id);
}
```

### Get User Profile

```typescript
import { getUserById } from "@/lib/db/models/user";

const user = await getUserById("google-user-id-123");
// Returns: { id, email, name, image, ... } or null
```

### Update User Info

```typescript
import { upsertUser } from "@/lib/db/models/user";

await upsertUser({
  id: user.id,
  email: user.email,
  name: "New Display Name",
  image: "https://new-avatar.jpg",
});
```

### Search by Email

```typescript
import { getUserByEmail } from "@/lib/db/models/user";

const user = await getUserByEmail("user@example.com");
```

### Track Last Login

```typescript
import { updateLastLogin } from "@/lib/db/models/user";

await updateLastLogin(userId);
```

## 🔍 Query Examples

### Check if User Exists

```typescript
const user = await getUserByEmail(email);
if (user) {
  console.log("User exists:", user.name);
} else {
  console.log("User not found");
}
```

### Get Recent Users (Custom Query)

```typescript
import { query } from "@/lib/db";

const result = await query(
  "SELECT * FROM users ORDER BY created_at DESC LIMIT 10"
);
const recentUsers = result.rows;
```

### Count Users (Custom Query)

```typescript
import { query } from "@/lib/db";

const result = await query("SELECT COUNT(*) FROM users");
const userCount = result.rows[0].count;
```

## 📊 Table Info

| Feature                 | Status     |
| ----------------------- | ---------- |
| Auto-save on login      | ✅ Enabled |
| UPSERT support          | ✅ Yes     |
| Email unique constraint | ✅ Yes     |
| Auto-update timestamp   | ✅ Yes     |
| Index on email          | ✅ Yes     |
| Type-safe queries       | ✅ Yes     |

## 🎯 Tips

1. **UPSERT ทำงานอย่างไร:**

   - User ใหม่ → INSERT ข้อมูล
   - User เดิม → UPDATE ข้อมูล + last_login

2. **ระบบบันทึกอัตโนมัติ:**

   - Login ด้วย Google → บันทึกลง DB อัตโนมัติ
   - ไม่ต้องเรียก upsertUser เอง

3. **ความปลอดภัย:**
   - ใช้ parameterized queries เสมอ
   - TypeScript type checking
   - Connection pooling

## 🛠️ Useful Commands

```bash
# ดูโครงสร้างตาราง (ถ้ามี psql)
psql -U tonkawzaa -d rarity_runner -c "\d users"

# ดูข้อมูลในตาราง
psql -U tonkawzaa -d rarity_runner -c "SELECT * FROM users;"

# นับจำนวน users
psql -U tonkawzaa -d rarity_runner -c "SELECT COUNT(*) FROM users;"
```

## 📁 Files

- **Schema:** `lib/db/schema/users.sql`
- **Model:** `lib/db/models/user.ts`
- **Migration:** `lib/db/migrate.ts`
- **Auth Integration:** `auth.ts`
- **Docs:** `lib/db/README.md`
