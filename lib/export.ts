import type { Game } from "@/core/types";
import { cardLabel } from "./content";

export function gameToMarkdown(game: Game): string {
  const lines: string[] = [];

  lines.push(`# ${game.frame.title}`);
  lines.push("");
  lines.push(`> ${game.frame.description}`);
  lines.push("");

  if (game.survivor?.name) {
    lines.push(`**Survivante :** ${game.survivor.name}`);
    lines.push("");
  }

  lines.push("---");
  lines.push("");

  for (const entry of game.entries) {
    lines.push(`## Jour ${entry.dayNumber} — ${cardLabel(entry.cardId)}`);
    lines.push("");
    if (entry.promptSnapshot) {
      lines.push(`*${entry.promptSnapshot}*`);
      lines.push("");
    }
    if (entry.pisteFollowed) {
      lines.push(`> Piste suivie : **${entry.pisteFollowed}**`);
      lines.push("");
    }
    lines.push(entry.journalText);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  lines.push(
    `*Partie créée le ${new Date(game.createdAt).toLocaleDateString("fr-FR")}.*`,
  );

  return lines.join("\n");
}

export function downloadMarkdown(game: Game): void {
  const content = gameToMarkdown(game);
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `apres-laccident-${game.id}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
