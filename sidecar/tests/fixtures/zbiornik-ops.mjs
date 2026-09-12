#!/usr/bin/env node
/**
 * Mock runner fixture for sidecar ZbiornikOpsManager subprocess tests.
 * Mirrors the single-line JSON stdout contract of zbiornik-ops.mjs.
 */
const args = process.argv.slice(2);
const op = args[0] || "me";
const isDry = args.includes("--dry");
const isConfirm = args.includes("--confirm-run");

const WRITE_OPS = ["post-topic", "comment", "send-priv"];

if (op === "timeout-test") {
  // Hang to test timeout handling
  setTimeout(() => {}, 100000);
} else if (WRITE_OPS.includes(op)) {
  if (isDry) {
    console.log(
      JSON.stringify({
        ok: true,
        op,
        data: { dry_run: true, validated: true },
        message: "Dry run validation successful",
      })
    );
    process.exit(0);
  } else if (isConfirm) {
    console.log(
      JSON.stringify({
        ok: true,
        op,
        data: { published: true, item_id: "mock-pub-999" },
        message: "Operation executed successfully",
      })
    );
    process.exit(0);
  } else {
    console.log(
      JSON.stringify({
        ok: false,
        op,
        code: "CONFIRM_REQUIRED",
        message: "Write op requires --confirm-run or --dry",
      })
    );
    process.exit(2);
  }
} else if (op === "me") {
  console.log(
    JSON.stringify({
      ok: true,
      op: "me",
      data: { nick: "operator_test", unread: 3, session_active: true },
      message: "Session OK",
    })
  );
  process.exit(0);
} else if (op === "status") {
  console.log(
    JSON.stringify({
      ok: true,
      op: "status",
      data: { cdp: true, port: 9333 },
      message: "CDP connected",
    })
  );
  process.exit(0);
} else if (op === "list-topics") {
  console.log(
    JSON.stringify({
      ok: true,
      op: "list-topics",
      data: {
        threads: [
          { id: "thr-1", title: "Cyber-Warszawa Spotkania", slug: "cyber-wawa", cntPosts: 42 },
          { id: "thr-2", title: "Techno Park Underground", slug: "techno-park", cntPosts: 15 },
        ],
      },
      message: "Threads list retrieved",
    })
  );
  process.exit(0);
} else if (op === "inbox") {
  console.log(
    JSON.stringify({
      ok: true,
      op: "inbox",
      data: {
        threads: [
          { portal_ref: "p-ref-1", msdata: "ms-1", nick: "neon_kat", unread: true, preview: "Hey there" },
        ],
      },
      message: "Inbox retrieved",
    })
  );
  process.exit(0);
} else if (op === "top-list") {
  console.log(
    JSON.stringify({
      ok: true,
      op: "top-list",
      data: {
        ranking: [
          { rank: 1, nick: "cyber_queen", score: 9980 },
          { rank: 2, nick: "synth_rider", score: 8750 },
        ],
      },
      message: "Ranking retrieved",
    })
  );
  process.exit(0);
} else {
  console.log(
    JSON.stringify({
      ok: true,
      op,
      data: { acknowledged: true, raw_args: args.slice(1) },
      message: `Op '${op}' executed`,
    })
  );
  process.exit(0);
}
