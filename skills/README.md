# Required Skills — Install Guide

This scaffold does **not** vendor skill files. Install them yourself, or let your agent
install them, from the sources below. That keeps you on the upstream version instead of a
frozen copy that rots inside this folder.

`.agents/skills/` is the neutral skills path read by Antigravity, Codex, and Goose. Claude
Code reads `~/.claude/skills/` or plugin marketplaces.

Do this once per machine, before starting work.

---

## Required

| Skill | Purpose | Source |
|---|---|---|
| context7 | Live library docs. Never trained memory. | MCP server: `@upstash/context7-mcp` — https://github.com/upstash/context7 |
| ponytail | Code behaviour: simplest thing that works, YAGNI, no speculative abstractions. | https://github.com/DietrichGebert/ponytail |
| caveman | Communication behaviour: compressed output, full technical accuracy. | https://github.com/JuliusBrussee/caveman |
| clean-code | Invoked whenever writing, editing, reviewing, or refactoring code. | https://github.com/jackjin1997/ClawForge |

## Claude Code only

| Skill | Purpose | Source |
|---|---|---|
| frontend-design | Visual design guidance for new UI. | https://github.com/anthropics/claude-plugins-official |

**This skill does not exist on Antigravity or other agents.** Its substance is written out
in portable form in `.agents/rules/30-ui-ux.md`, which is the source of truth for everyone.
Claude Code users get both.

---

## Install — context7 (MCP, all tools)

An MCP server, not a skill. Register it in your tool's MCP config:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

- **Claude Code** — `claude mcp add context7 -- npx -y @upstash/context7-mcp@latest`
- **Antigravity** — add the same block to the IDE's MCP settings.

Verify it works before starting: ask the agent to fetch docs for a library in the stack and
confirm it returns current content.

## Install — ponytail and caveman

Both repos ship a `gemini-extension.json` alongside their Claude plugin manifest, so they
work on Gemini-family tools including Antigravity. Follow the install instructions in each
repo's own README — they are the authority, and the steps change between versions.

- ponytail: https://github.com/DietrichGebert/ponytail
- caveman: https://github.com/JuliusBrussee/caveman

For Claude Code both are installable as plugin marketplaces:

```
/plugin marketplace add DietrichGebert/ponytail
/plugin marketplace add JuliusBrussee/caveman
```

## Install — clean-code

Part of the ClawForge skill collection: https://github.com/jackjin1997/ClawForge

Copy the `clean-code` skill folder (containing `SKILL.md`) into your agent's skills
directory — `.agents/skills/clean-code/` for Antigravity, `~/.claude/skills/clean-code/`
for Claude Code.

---

## Verify before starting work

Ask your agent, in a fresh session:

```
Which of these do you have available: context7, ponytail, caveman, clean-code?
Confirm you have read AGENTS.md and .agents/rules/30-ui-ux.md.
```

If any are missing, install them before the kickoff workflow. The rules in `AGENTS.md`
assume they are present.

## If a skill is unavailable on your tool

The rules still apply. `AGENTS.md` and `.agents/rules/` are written to stand alone —
the skills make compliance automatic, they do not define it. An agent without ponytail is
still required to write the simplest thing that works.

## Optional

| Tool | Purpose |
|---|---|
| codebase-memory MCP | Structural code queries: find existing functions, trace call paths, spot duplicates before writing new code. Useful once the codebase outgrows `docs/memory/codebase-map.md`. |
| A browser automation tool | Required for the UI review loop in `30-ui-ux.md` §10. Must drive a real visible browser, not headless. |
