# theta-livestream-api-mcp

An [MCP](https://modelcontextprotocol.io) server for [Theta EdgeCloud](https://www.thetaedgecloud.com)'s Livestream APIs. It lets you set up and manage a livestream — get a server URL and stream key, fetch the playback URL, list your streams, and release the ingestor — directly from Claude Desktop, Claude Code, Codex, Cursor, and other MCP-compatible clients.

## How it works

Theta EdgeCloud runs livestreams on a decentralized network of **EdgeIngestors**. To go live you select an available ingestor, which gives you an RTMP server URL and stream key to plug into streaming software like OBS. This MCP server wraps that flow into a handful of natural-language tools:

1. **select-ingestor** — picks an available ingestor and returns its stream server, stream key, and ingestor ID. If you don't pass a stream, it reuses an existing idle stream or creates one for you.
2. Copy the server URL and stream key into OBS (or any RTMP encoder) and start broadcasting.
3. **get-playback-url** — returns the playback URL so viewers can watch.

When you stop the livestream (e.g. from OBS), the ingestor is released automatically — you don't need to do anything. The optional **cancel-ingestor** tool is only useful if you selected an ingestor but then decided *not* to start streaming: calling it releases the ingestor immediately instead of leaving it idle until the selection expires.

## Tools

| Tool | Description | Input |
| --- | --- | --- |
| `list-streams` | List your livestreams in Theta EdgeCloud. | `status` *(optional)* — filter by `"on"` or `"off"`. |
| `select-ingestor` | Select an available EdgeIngestor and return its server URL and stream key. | `stream_id` *(optional)* — the stream to attach; otherwise an idle stream is reused or created. |
| `get-playback-url` | Get the playback URL of a livestream. | `ingestor_id` — the ingestor ID returned by `select-ingestor`. |
| `cancel-ingestor` | Release a selected EdgeIngestor *before* starting a livestream. Optional — see [How it works](#how-it-works). | `ingestor_id` — the ingestor ID to release. |

> **Note:** The server/key pair returned by `select-ingestor` expires after 5 minutes if you don't start streaming. You can only run one livestream at a time.

## Prerequisites

- Node.js >= 18
- A Theta EdgeCloud account with a project ID and API key:
  - **Project ID** — from the [projects settings page](https://www.thetaedgecloud.com/dashboard/settings/projects).
  - **API key** — from your project's settings page at `https://www.thetaedgecloud.com/dashboard/settings/project/<project-id>`.

## Configuration

Add the server to your MCP client's config, supplying your Theta EdgeCloud credentials as environment variables.

### Claude Desktop

Edit `claude_desktop_config.json` (Settings → Developer → Edit Config):

```json
{
  "mcpServers": {
    "theta-livestream": {
      "command": "npx",
      "args": ["-y", "@qinwei-gong/theta-livestream-api-mcp"],
      "env": {
        "THETA_PROJECT_ID": "your-project-id-here",
        "THETA_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add theta-livestream \
  --env THETA_PROJECT_ID=your-project-id-here \
  --env THETA_API_KEY=your-api-key-here \
  -- npx -y @qinwei-gong/theta-livestream-api-mcp
```

The same `command`/`args`/`env` shape works for other MCP clients (Codex, Cursor, etc.).

## Usage

Once configured, just talk to your MCP client in plain language:

- *"Start a livestream on Theta"* → calls `select-ingestor` and hands you the server URL and stream key for OBS.
- *"What's the playback URL?"* → calls `get-playback-url`.
- *"List my streams"* → calls `list-streams`.
- *"Actually, never mind — release that ingestor"* (before going live) → calls `cancel-ingestor`.

## Development

```bash
git clone https://github.com/qinwei-gong/theta-livestream-api-mcp.git
cd theta-livestream-api-mcp
npm install

# Build TypeScript -> dist/
npm run build

# Build and run locally, loading credentials from a .env file
npm run dev
```

Create a `.env` file in the project root for local runs:

```
THETA_PROJECT_ID=your-project-id-here
THETA_API_KEY=your-api-key-here
```

The server communicates over stdio, so it's launched and managed by your MCP client rather than run as a standalone service.

### Project structure

```
src/
  index.ts            # MCP server entry point; registers the four tools
  api/client.ts       # HTTP client for the Theta EdgeCloud / Theta Video APIs
  types/index.ts      # Shared TypeScript types
  tools/
    list-streams.ts
    select-ingestor.ts
    get-playback-url.ts
    cancel-ingestor.ts
```

## License

[MIT](LICENSE)
