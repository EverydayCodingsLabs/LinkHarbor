Build a **production-ready Next.js application** that works as a scalable file downloader service using **local filesystem storage inside Docker (VPS environment)**.

---

## 🧠 Core Idea

Users provide:

* A **single URL**, OR
* A **.txt file with multiple URLs**

System will:

* Download files to local disk (`/data` volume)
* If single → return direct download link
* If multiple → zip files → return ZIP download link
* Auto-delete after **24 hours**

---

## ⚙️ Tech Stack

* Next.js (App Router)
* TypeScript
* Node.js runtime (NOT edge)
* `fs/promises` + streams
* `axios` or `undici`
* `archiver` (for zip)
* `uuid`
* `p-limit` (for concurrency control)
* `node-cron` (cleanup)

---

## 📁 Storage Design (IMPORTANT)

Use a **Docker-mounted volume**:

* All files stored in:

  ```
  /data/{jobId}/
  ```

Example:

```
/data/
  ├── job-abc123/
  │     ├── file1.mp4
  │     ├── file2.mp4
  │     └── output.zip
```

* Each job has:

  * `meta.json` (timestamps, status)
  * downloaded files

---

## 🐳 Docker Requirements

### Dockerfile

* Use Node 20+
* Enable filesystem writes
* Set working dir `/app`

### docker-compose.yml

* Mount volume:

  ```
  volumes:
    - ./data:/data
  ```

---

## 🧱 Architecture

* `/app` → UI
* `/app/api/upload/route.ts` → handles URL or txt input
* `/app/api/download/[id]/route.ts` → serves file/zip
* `/lib/downloader.ts` → streaming download logic
* `/lib/zip.ts` → zip streaming
* `/lib/storage.ts` → file paths + helpers
* `/lib/cleanup.ts` → delete after 24h

---

## 🚀 Functional Flow

### 1. Upload/Input

* Accept:

  * URL string
  * `.txt` file
* Parse links
* Generate `jobId` (UUID)

---

### 2. Download Engine

* Create folder:

  ```
  /data/{jobId}
  ```
* Download using streams:

  * Do NOT buffer entire file
* Limit concurrency:

  * max 3–5 downloads at once

---

### 3. Multi-file Handling

* If multiple links:

  * Download all
  * Create:

    ```
    /data/{jobId}/output.zip
    ```
  * Use streaming zip (archiver)

---

### 4. File Serving

* Endpoint:

  ```
  /api/download/{jobId}
  ```
* Return:

  * single file OR zip
* Use proper headers:

  * Content-Disposition: attachment

---

### 5. Cleanup System (CRITICAL)

* Run cron every hour:
* Delete folders older than 24 hours:

  ```
  Date.now() - createdAt > 24h
  ```

---

## ⚡ Performance Considerations

* Use streams everywhere
* Avoid memory buffering
* Handle large files (GBs)
* Add timeout + retry logic
* Handle failed downloads gracefully

---

## 🔒 Security

* Validate URLs (ONLY http/https)
* Prevent SSRF:

  * Block localhost / private IP ranges
* Limit max file size (configurable)
* Rate limit requests

---

## 🎨 UI (shadcn/ui)

* Input field for URL
* File upload (.txt)
* Submit button
* Status:

  * Downloading
  * Zipping
  * Ready
* Show download button when done

---

## 🌐 Deployment Notes

* Designed for VPS (NOT serverless)
* Works with Docker
* Persistent storage via volume
* No external storage needed

---

## 📦 Output Required

* Full project code
* Dockerfile
* docker-compose.yml
* README.md
* .env.example

---

## 🧩 Bonus (if possible)

* Progress tracking (per file)
* Queue system
* WebSocket updates
* Resume downloads

---

Make the system modular, efficient, and capable of handling large files and multiple users.
