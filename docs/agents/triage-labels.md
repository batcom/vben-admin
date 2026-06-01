# Triage labels

Issues pass through a five-role state machine. Each role maps to a GitHub label string.

## Vocabulary

| Role | Label string | Meaning |
|---|---|---|
| `needs-triage` | `needs-triage` | Maintainer needs to evaluate |
| `needs-info` | `needs-info` | Waiting on reporter for more details |
| `ready-for-agent` | `ready-for-agent` | Fully specified, an agent can pick it up with zero human context |
| `ready-for-human` | `ready-for-human` | Needs human implementation |
| `wontfix` | `wontfix` | Will not be actioned |

## Application

- **`gh issue edit <number> --add-label "<label>"`** to apply
- **`gh issue edit <number> --remove-label "<label>"`** to remove
