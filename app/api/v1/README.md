# API v1 Structure

This directory will contain the authenticated API routes. Current structure remains in `/api` for now.

Future endpoints will be:

```
/api/v1/
  ├── auth/
  │   ├── login
  │   ├── logout
  │   └── me
  ├── albums/
  │   ├── [id]/
  │   │   ├── tracks
  │   │   ├── comments
  │   │   └── photos
  │   └── route.ts
  └── users/
      └── [id]/
          └── route.ts
```

These endpoints will be added when authentication is implemented.
