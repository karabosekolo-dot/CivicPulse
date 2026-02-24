
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/auth/google/url", (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/auth/google/callback`;
    
    if (!clientId) {
      return res.status(500).json({ error: "Google Client ID not configured" });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    res.json({ url: authUrl });
  });

  app.get("/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
      return res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: 'No code provided' }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    }

    try {
      // In a real app, you'd exchange the code for tokens here
      // const tokens = await exchangeCodeForTokens(code);
      // const userData = await getUserData(tokens.access_token);
      
      // For this demo, we'll simulate a successful exchange
      // and send back some mock user data based on the fact that they authenticated
      
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS', 
                  provider: 'google',
                  user: {
                    email: 'user@gmail.com',
                    name: 'Google User',
                    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser'
                  }
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: 'Failed to exchange code' }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
