# Deployment Notes

Use the systemd unit and Nginx config in this folder as templates for a Linux deployment.

The backend expects:
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `SECRET_KEY`
- optional `CORS_ORIGINS`

The frontend build works without environment variables unless you want to point it at a non-default backend origin with `VITE_API_URL`.
