import * as React from "react"
import { ChevronRight } from "lucide-react"

import { Caret, ToolApproval, ToolStatusBadge } from "@/ui/chat-parts"
import { toolStatus, type ToolCallPart, type ToolResultPart } from "@/ui/chat-types"
import { cn } from "@/ui/cn"

/** Les arguments d'un appel, lus en JSON (vide si le JSON est absent ou pas encore complet). */
type StepArgs = Record<string, unknown>

/**
 * Une table de titres : le nom technique d'un outil, ou un préfixe suivi de `*`
 * (`mcp__browser__*`), vers un titre en clair, ou une fonction des arguments.
 */
type StepTitles = Record<string, string | ((args: StepArgs) => string)>

/** Le libellé d'un outil qu'aucune table ne connaît : rien de technique tant qu'on ne déplie pas. */
const unknownStepTitle = "Utilise un outil"

/** La table par défaut, pour les outils d'un agent de code. Passez la vôtre à `titles` pour la remplacer ou la compléter. */
const defaultStepTitles: StepTitles = {
  Read: "Lit un fichier",
  Grep: "Cherche dans le code",
  Glob: "Cherche dans le code",
  Edit: "Modifie un fichier",
  MultiEdit: "Modifie un fichier",
  Write: "Modifie un fichier",
  NotebookEdit: "Modifie un fichier",
  Bash: (args) => (/^\s*ponos(\s|$)/.test(String(args.command ?? "")) ? "Cherche dans les tickets" : "Regarde sur le disque"),
  WebFetch: "Consulte une page web",
  WebSearch: "Cherche sur le web",
  Task: "Confie une tâche à un assistant",
  Agent: "Confie une tâche à un assistant",
  TodoWrite: "Met à jour sa liste de tâches",
  "mcp__claude-in-chrome__*": "Regarde dans le navigateur",
  "mcp__chrome-devtools__*": "Regarde dans le navigateur",
  "mcp__playwright__*": "Regarde dans le navigateur",
}

/** Les outils dont la `description` écrite par le modèle sert de sous-titre. */
const shellTools = new Set(["Bash", "bash", "shell"])

function parseArgs(text: string): StepArgs {
  try {
    const value = JSON.parse(text)
    return value && typeof value === "object" && !Array.isArray(value) ? (value as StepArgs) : {}
  } catch {
    return {}
  }
}

/** Le titre en clair d'un outil, ou `unknownStepTitle`. Une clé exacte prime sur un préfixe. */
function stepTitle(name: string, args: StepArgs, titles: StepTitles = defaultStepTitles): string | undefined {
  let entry = titles[name]
  if (entry === undefined) {
    const prefix = Object.keys(titles).find((key) => key.endsWith("*") && name.startsWith(key.slice(0, -1)))
    if (prefix) entry = titles[prefix]
  }
  return typeof entry === "function" ? entry(args) : entry
}

function pretty(text: string) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return text
  }
}

/**
 * Une étape d'agent : l'appel d'un outil et son résultat dans un seul item repliable,
 * fermé par défaut, même en erreur (le badge rouge suffit à la repérer). Fermée, elle
 * tient en une ligne : un titre en clair et l'état. Dépliée, elle montre le nom technique,
 * les arguments, puis le résultat.
 */
function AgentStep({
  part,
  result,
  titles = defaultStepTitles,
  defaultOpen = false,
  onApprove,
  className,
}: {
  part: ToolCallPart
  /** Le résultat de cet appel, s'il est déjà arrivé : il fixe l'état affiché. */
  result?: ToolResultPart
  /** La table des titres par outil ; `defaultStepTitles` si absente. */
  titles?: StepTitles
  defaultOpen?: boolean
  /** Appelée avec l'identifiant de la demande de validation et la réponse. */
  onApprove?: (approvalId: string, approved: boolean) => void
  className?: string
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  const id = React.useId()
  const status = toolStatus(part, result)
  const args = parseArgs(part.arguments)
  const known = stepTitle(part.name, args, titles)
  const description = shellTools.has(part.name) && typeof args.description === "string" ? args.description : undefined
  const failed = status === "error"

  return (
    <div
      data-slot="chat-step"
      data-status={status}
      className={cn("overflow-hidden rounded-xl border bg-card text-sm", failed ? "border-destructive/50" : "border-border", className)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left outline-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground motion-safe:transition-transform", open && "rotate-90")} aria-hidden />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium">{known ?? unknownStepTitle}</span>
          {description && <span className="truncate text-xs text-muted-foreground">{description}</span>}
        </span>
        <ToolStatusBadge status={status} />
      </button>
      {open && (
        <div id={id} className="space-y-2 border-t border-border bg-muted/40 px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Outil : <code className="font-mono">{part.name}</code>
          </p>
          {part.arguments && (
            <section aria-label="Arguments">
              <h4 className="mb-1 text-xs font-medium text-muted-foreground">Arguments</h4>
              <pre
                tabIndex={0}
                className="max-h-48 overflow-auto rounded-md border border-border bg-card px-2 py-1.5 font-mono text-xs leading-relaxed whitespace-pre-wrap outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                {pretty(part.arguments)}
              </pre>
            </section>
          )}
          {result && (
            <section aria-label={failed ? "Erreur" : "Résultat"}>
              <h4 className={cn("mb-1 text-xs font-medium", failed ? "text-destructive" : "text-muted-foreground")}>{failed ? "Erreur" : "Résultat"}</h4>
              <pre
                tabIndex={0}
                className={cn(
                  "max-h-64 overflow-auto rounded-md border px-2 py-1.5 font-mono text-xs leading-relaxed whitespace-pre-wrap outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                  failed ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border bg-card"
                )}
              >
                {failed ? result.error || result.content : pretty(result.content)}
                {result.state === "streaming" && <Caret />}
              </pre>
            </section>
          )}
        </div>
      )}
      {status === "approval" && part.approval && onApprove && (
        <ToolApproval toolName={part.name} onRespond={(approved) => onApprove(part.approval!.id, approved)} />
      )}
    </div>
  )
}

export { AgentStep, defaultStepTitles, stepTitle, unknownStepTitle }
export type { StepTitles }
