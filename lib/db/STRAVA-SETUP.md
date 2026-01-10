# Strava Integration Guide

## 🏃 Overview

การเชื่อมต่อ Strava ช่วยให้คุณสามารถ sync ข้อมูลการวิ่งจาก Strava อัตโนมัติเข้าสู่ Rarity Runner

## 📋 Pre-requisites

1. บัญชี Strava (ฟรี หรือ Premium)
2. Database ที่รัน Strava tables migration แล้ว

## 🔧 Setup Strava OAuth App

### 1. สร้าง Strava API Application

1. ไปที่ https://www.strava.com/settings/api
2. คลิก **"Create Application"** หรือ **"My API Application"**
3. กรอกข้อมูล:

   - **Application Name:** Rarity Runner
   - **Category:** Training
   - **Club:** (เว้นว่างได้)
   - **Website:** `http://localhost:3000` (สำหรับ development)
   - **Authorization Callback Domain:** `localhost` (สำหรับ development)
   - **Application Description:** Running tracking app

4. คลิก **"Create"** เพื่อสร้าง application

### 2. คัดลอก API Credentials

หลังจากสร้าง application แล้ว คุณจะเห็น:

- **Client ID** (เลขหลายหลัก)
- **Client Secret** (แสดงเมื่อคลิก "show")

### 3. เพิ่ม Environment Variables

เพิ่มค่าเหล่านี้ใน `.env.local`:

```env
# Strava OAuth Credentials
STRAVA_CLIENT_ID=your_client_id_here
STRAVA_CLIENT_SECRET=your_client_secret_here

# Next Auth URL (สำหรับ callback)
NEXTAUTH_URL=http://localhost:3000
```

**⚠️ สำหรับ Production:**

```env
STRAVA_CLIENT_ID=your_production_client_id
STRAVA_CLIENT_SECRET=your_production_client_secret
NEXTAUTH_URL=https://yourdomain.com
```

และอัพเดท Authorization Callback Domain ใน Strava API settings เป็น `yourdomain.com`

## 🗄️ Database Migration

รัน migration เพื่อสร้างตาราง Strava:

```bash
npx tsx lib/db/migrate-strava.ts
```

คำสั่งนี้จะสร้าง 2 ตาราง:

1. **strava_connections** - เก็บ OAuth tokens
2. **running_activities** - เก็บข้อมูลการวิ่ง

## 🚀 การใช้งาน

### 1. เชื่อมต่อ Strava Account

1. Login เข้า dashboard
2. คลิกปุ่ม **"Connect Strava"**
3. อนุญาตการเข้าถึงใน Strava authorization page
4. ระบบจะ redirect กลับมาที่ dashboard พร้อมสถานะ "Connected"

### 2. ระบบจะเก็บข้อมูลอะไรบ้าง?

เมื่อเชื่อมต่อแล้ว ระบบจะเก็บ:

- ✅ Access/Refresh tokens (สำหรับเรียกข้อมูลจาก Strava)
- ✅ ข้อมูลโปรไฟล์ athlete
- ✅ ข้อมูลการวิ่งทั้งหมด (รอการ sync)

### 3. ตัดการเชื่อมต่อ

คลิกปุ่ม **"Disconnect"** ในหน้า dashboard เพื่อลบการเชื่อมต่อ

## 📊 Database Schema

### Table: `strava_connections`

| Column         | Type      | Description                |
| -------------- | --------- | -------------------------- |
| id             | SERIAL    | Primary key                |
| user_id        | VARCHAR   | Foreign key to users       |
| strava_user_id | BIGINT    | Strava athlete ID (unique) |
| access_token   | TEXT      | OAuth access token         |
| refresh_token  | TEXT      | OAuth refresh token        |
| expires_at     | TIMESTAMP | Token expiration time      |
| athlete_data   | JSONB     | Athlete profile data       |
| connected_at   | TIMESTAMP | Connection timestamp       |
| updated_at     | TIMESTAMP | Last update timestamp      |

### Table: `running_activities`

| Column               | Type      | Description                 |
| -------------------- | --------- | --------------------------- |
| id                   | SERIAL    | Primary key                 |
| user_id              | VARCHAR   | Foreign key to users        |
| strava_activity_id   | BIGINT    | Strava activity ID (unique) |
| name                 | VARCHAR   | Activity name               |
| distance             | DECIMAL   | Distance in meters          |
| moving_time          | INTEGER   | Moving time in seconds      |
| elapsed_time         | INTEGER   | Total time in seconds       |
| total_elevation_gain | DECIMAL   | Elevation in meters         |
| activity_type        | VARCHAR   | Run, Trail Run, etc.        |
| start_date           | TIMESTAMP | Activity start time (UTC)   |
| start_date_local     | TIMESTAMP | Activity start time (local) |
| average_speed        | DECIMAL   | Average speed (m/s)         |
| max_speed            | DECIMAL   | Max speed (m/s)             |
| average_heartrate    | DECIMAL   | Average HR                  |
| max_heartrate        | INTEGER   | Max HR                      |
| calories             | DECIMAL   | Calories burned             |
| map_polyline         | TEXT      | Route polyline              |
| raw_data             | JSONB     | Full Strava JSON            |
| created_at           | TIMESTAMP | Record created              |
| updated_at           | TIMESTAMP | Record updated              |

## 🔒 Security & Privacy

- ✅ OAuth tokens เก็บใน database แบบ encrypted connection
- ✅ Client Secret ไม่ควร commit ลง Git
- ✅ ใช้ HTTPS ใน production
- ✅ Tokens จะ refresh อัตโนมัติเมื่อหมดอายุ

## 🛠️ API Endpoints

| Endpoint                 | Method | Description            |
| ------------------------ | ------ | ---------------------- |
| `/api/strava/connect`    | GET    | เริ่มต้น OAuth flow    |
| `/api/strava/callback`   | GET    | OAuth callback handler |
| `/api/strava/disconnect` | POST   | ตัดการเชื่อมต่อ        |

## 📝 Next Steps

1. ✅ สร้าง Strava API application
2. ✅ เพิ่ม environment variables
3. ✅ รัน database migration
4. ✅ ทดสอบการเชื่อมต่อใน dashboard
5. 🔜 เพิ่มระบบ sync activities อัตโนมัติ
6. 🔜 แสดงข้อมูลสถิติจริงจากฐานข้อมูล

## 🐛 Troubleshooting

### ปัญหา: "Strava client ID not configured"

- ตรวจสอบว่าเพิ่ม `STRAVA_CLIENT_ID` ใน `.env.local` แล้ว
- Restart dev server: `npm run dev`

### ปัญหา: "Callback domain mismatch"

- ตรวจสอบว่า Authorization Callback Domain ใน Strava ตรงกับ domain ที่ใช้
- Development: `localhost`
- Production: `yourdomain.com`

### ปัญหา: "Failed to connect"

- ตรวจสอบ Client ID และ Client Secret
- ดู console logs สำหรับ error details
- ตรวจสอบว่า database migration รันสำเร็จแล้ว

## 📚 Resources

- [Strava API Documentation](https://developers.strava.com/docs/)
- [OAuth 2.0 Guide](https://developers.strava.com/docs/authentication/)
- [Activity Data Structure](https://developers.strava.com/docs/reference/#api-models-DetailedActivity)
