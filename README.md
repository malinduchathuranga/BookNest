# Online Bookstore

## Requirements
- Node.js v18+
- MongoDB Atlas account

## Steps

**Windows PowerShell fix (run once as admin)**
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

**Server**
```bash
cd server
copy .env.example .env
npm install
npm run dev
```

**Client**
```bash
cd client
npm install
npm run dev
```

Open `.env` and update these two lines:
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/online-bookstore
JWT_SECRET=anything
```

App runs at http://localhost:5173

## MongoDB Atlas
Go to Network Access and add `0.0.0.0/0` so any IP can connect.
