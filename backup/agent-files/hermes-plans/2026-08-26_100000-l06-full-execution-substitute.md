# L06 Full Execution Substitute — Configuration & Environment Variables

## Authorization

The user explicitly authorizes Hermes to execute the L06 hands-on and handle the complete workflow in this session because they are busy. All learner-substitute work must be disclosed; do not claim the user personally implemented code or answered quiz.

## Why no PR was visible

The L06 lesson-start and teach phases intentionally stopped before commit/push/PR. They created local docs and prepared the SPEC. The coder implementation wave had not been dispatched, so no PR existed yet.

## Execution sequence

1. Audit current L06 worktree, Linear state, GitHub PR/CI, and remotes.
2. Commit/push the VN lesson-start + teaching docs as a docs PR from the Linear branch, preserving execution-substitute boundaries and `Fixes NES-7`.
3. Dispatch Codex through herdr on a separate `codex/nes-7-l06-config-implementation` branch based on the merged VN docs. Implement only the SPEC: @nestjs/config, env validation, ConfigService wiring, tests, and teaching comments. No secrets; preserve existing API behavior.
4. Independently verify Codex diff, tests, `pnpm verify`, and local Claude review before opening the implementation PR.
5. Open and merge the implementation PR under the explicit session authorization; verify CI/review/merge commit.
6. Mirror VN source/test/dependency files and translate docs to `example/nestjs-training`; open/merge EN PR and verify zero Vietnamese characters in changed English content.
7. Sync GitHub EN tree to GitLab with `hienduong-agility <hien.duong@asnet.com.vn>`, no Co-authored-by; verify parity.
8. Have Claude complete L06 quiz/evidence with explicit execution-substitute disclosure, update Linear parent/children/checklists/comments, and update ROADMAP/tag only after all gates pass.
9. Create/push lesson/06 tag and run all final checks.

## Forbidden

Never read or expose `.env` values or credentials. Do not modify unrelated lessons. Do not claim personal learner evidence. Do not merge until independent verification and CI pass.
