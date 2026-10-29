import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Steam Achievements MCP',
  description:
    'Connect your Steam achievements to an AI assistant and ask what is left to 100% your games.',
}

const MCP_URL = `${process.env.STEAM_MCP_ORIGIN ?? 'https://valentinpires.vercel.app'}/steam/mcp`

const examples = [
  'Which of my games am I closest to completing?',
  'What achievements am I missing in Hades?',
  'Give me a full guide to 100% Hollow Knight, missables first.',
]

export default function SteamMcpPage() {
  return (
    <main className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-lg font-medium text-zinc-100">
          Steam Achievements MCP
        </h1>
        <p className="text-zinc-400">
          An MCP server that lets your AI assistant read your Steam library and
          achievements, so you can ask what is missing on each game and get a
          guide to 100% it.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium text-zinc-100">Connect it</h2>
        <ol className="list-decimal space-y-2 pl-5 text-zinc-400">
          <li>
            Add a custom connector / remote MCP server with this URL:
            <code className="mt-1 block w-fit rounded bg-zinc-900 px-2 py-1 text-zinc-200">
              {MCP_URL}
            </code>
          </li>
          <li>Sign in through Steam when asked. Your password stays on Steam.</li>
          <li>
            Make sure your Steam profile and game details are public (Steam →
            Profile → Edit Profile → Privacy Settings).
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium text-zinc-100">Try asking</h2>
        <ul className="space-y-2 text-zinc-400">
          {examples.map((example) => (
            <li key={example}>“{example}”</li>
          ))}
        </ul>
      </section>
    </main>
  )
}
