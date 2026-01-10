# Strava Webhook Setup Guide

## 🎯 Overview

Webhooks ช่วยให้ Rarity Runner รับการแจ้งเตือนแบบ real-time จาก Strava เมื่อมีการสร้าง/อัพเดต/ลบ activities

## 📋 Pre-requisites

1. ✅ Strava API Application (จาก STRAVA-SETUP.md)
2. ✅ Public accessible URL (production หรือ ngrok สำหรับ dev)
3. ✅ Webhook endpoint deployed (`/api/strava/webhook`)

## 🔧 Setting Up Webhook

### 1. เพิ่ม Environment Variable

เพิ่มใน `.env.local`:

```env
# Webhook Verify Token (สร้างเอง - ควรเป็น random string)
STRAVA_WEBHOOK_VERIFY_TOKEN=your_random_verify_token_here
```

**ตัวอย่าง generate token:**

```bash
openssl rand -hex 32
# หรือ
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. ทำให้ Webhook Endpoint เป็น Public

#### **Option A: Production (Recommended)**

Deploy แอพ production แล้วใช้ URL จริง:

```
https://yourdomain.com/api/strava/webhook
```

#### **Option B: Development with ngrok**

```bash
# Install ngrok
brew install ngrok  # macOS
# หรือ download จาก https://ngrok.com

# Run ngrok
ngrok http 3000

# จะได้ URL แบบนี้:
# https://abc123.ngrok.io
```

**Webhook URL จะเป็น:**

```
https://abc123.ngrok.io/api/strava/webhook
```

### 3. Subscribe Webhook กับ Strava

**Method 1: ใช้ API (Recommended)**

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=YOUR_CLIENT_ID \
  -F client_secret=YOUR_CLIENT_SECRET \
  -F callback_url=https://yourdomain.com/api/strava/webhook \
  -F verify_token=YOUR_VERIFY_TOKEN
```

**ตัวอย่างเต็ม:**

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=12345 \
  -F client_secret=abc123def456 \
  -F callback_url=https://rarity-runner.vercel.app/api/strava/webhook \
  -F verify_token=your_random_verify_token_here
```

**Response ที่สำเร็จ:**

```json
{
  "id": 123456,
  "resource_state": 2,
  "application_id": 12345,
  "callback_url": "https://yourdomain.com/api/strava/webhook",
  "created_at": "2026-01-10T12:00:00Z",
  "updated_at": "2026-01-10T12:00:00Z"
}
```

**Method 2: ดู Existing Subscriptions**

```bash
curl -G https://www.strava.com/api/v3/push_subscriptions \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET
```

**Method 3: Delete Subscription (ถ้าต้องการ)**

```bash
curl -X DELETE https://www.strava.com/api/v3/push_subscriptions/SUBSCRIPTION_ID \
  -F client_id=YOUR_CLIENT_ID \
  -F client_secret=YOUR_CLIENT_SECRET
```

## 🧪 Testing Webhook

### 1. ทดสอบการ Validate

Strava จะส่ง GET request มา validation ตอนสมัคร webhook:

```
GET /api/strava/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=123456
```

Endpoint ควร respond ด้วย:

```json
{
  "hub.challenge": "123456"
}
```

### 2. ทดสอบด้วยการสร้าง Activity

1. เปิด Strava app หรือ website
2. สร้าง activity ใหม่ (Run)
3. ตรวจสอบ logs ใน terminal:

```
Received Strava webhook event: {
  object_type: 'activity',
  object_id: 123456789,
  aspect_type: 'create',
  owner_id: 987654321,
  ...
}
Saved running activity: 123456789
```

4. ตรวจสอบใน database:

```sql
SELECT * FROM running_activities ORDER BY created_at DESC LIMIT 1;
```

### 3. ทดสอบด้วย Manual Request

```bash
# Simulate create event
curl -X POST http://localhost:3000/api/strava/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object_type": "activity",
    "object_id": 123456789,
    "aspect_type": "create",
    "owner_id": 987654321,
    "subscription_id": 12345,
    "event_time": 1516126040
  }'
```

## 📊 Webhook Event Types

### Create Event

```json
{
  "object_type": "activity",
  "object_id": 123456789,
  "aspect_type": "create",
  "owner_id": 987654321,
  "subscription_id": 12345,
  "event_time": 1516126040
}
```

### Update Event

```json
{
  "object_type": "activity",
  "object_id": 123456789,
  "aspect_type": "update",
  "updates": {
    "title": "Evening Run"
  },
  "owner_id": 987654321
}
```

### Delete Event

```json
{
  "object_type": "activity",
  "object_id": 123456789,
  "aspect_type": "delete",
  "owner_id": 987654321
}
```

## 🔍 Monitoring & Debugging

### ดู Webhook Logs

```bash
# Terminal ที่รัน npm run dev
# จะเห็น logs แบบนี้:

Received Strava webhook event: { ... }
Access token expired, refreshing...
Saved running activity: 123456789
```

### ตรวจสอบ Subscription Status

```bash
curl -G https://www.strava.com/api/v3/push_subscriptions \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET
```

### Common Issues

#### ❌ "Webhook validation failed"

- ตรวจสอบว่า `STRAVA_WEBHOOK_VERIFY_TOKEN` ตรงกับที่ส่งไปใน subscription
- ตรวจสอบ URL ที่เข้าถึงได้จากภายนอก

#### ❌ "No user found for Strava ID"

- ตรวจสอบว่า user ได้เชื่อมต่อ Strava แล้ว
- ตรวจสอบ `strava_connections` table

#### ❌ "Access token expired"

- Webhook จะ refresh token อัตโนมัติ
- ตรวจสอบว่า `STRAVA_CLIENT_SECRET` ถูกต้อง

## 🚀 Production Deployment

### 1. Deploy to Vercel/Railway/etc.

```bash
# ตั้งค่า Environment Variables ใน platform
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
STRAVA_WEBHOOK_VERIFY_TOKEN=...
```

### 2. Subscribe Webhook ด้วย Production URL

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=YOUR_CLIENT_ID \
  -F client_secret=YOUR_CLIENT_SECRET \
  -F callback_url=https://your-production-url.com/api/strava/webhook \
  -F verify_token=YOUR_VERIFY_TOKEN
```

### 3. Monitor

- ใช้ logging service (Vercel Analytics, Sentry, etc.)
- ตั้ง alerts สำหรับ errors
- Monitor database size

## 📝 Features

ระบบ Webhook ปัจจุบันรองรับ:

- ✅ รับ create/update/delete events
- ✅ Filter เฉพาะ running activities
- ✅ Auto-refresh expired tokens
- ✅ บันทึกข้อมูลครบถ้วน (18+ fields)
- ✅ Error handling ครอบคลุม
- ✅ ลบ activities ที่ถูกลบใน Strava

## 🔐 Security

- Verify token validation
- Environment variables สำหรับ secrets
- HTTPS required (Strava requirement)
- Rate limiting (Strava แนะนำ)

## 📚 References

- [Strava Webhooks Documentation](https://developers.strava.com/docs/webhooks/)
- [Webhook Events Reference](https://developers.strava.com/docs/webhooks/#event-data)
- [ngrok Documentation](https://ngrok.com/docs)

---

**Status:** ✅ Webhook Endpoint พร้อมใช้งาน  
**Next Step:** Subscribe webhook และทดสอบด้วยการสร้าง activity
