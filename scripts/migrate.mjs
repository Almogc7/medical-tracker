// Runs `prisma migrate deploy` only for Production builds on Vercel. Fails closed otherwise.
//   Production build (VERCEL=1, VERCEL_ENV=production) -> run migrations
//   Preview build    (VERCEL=1, VERCEL_ENV=preview)    -> skip migrations, continue the build
//   anything else, missing, or contradictory           -> stop the build; no migration, no later build step runs
import { execSync } from "node:child_process";

const { VERCEL, VERCEL_ENV, VERCEL_TARGET_ENV } = process.env;
const show = (v) => (v === undefined ? "not set" : `"${v}"`);

function refuse(reason) {
  console.error(`Refusing to continue: ${reason}`);
  console.error(
    'The environment could not be identified safely. Builds must run on Vercel with system environment variables enabled (Project Settings > Environment Variables > "Enable access to System Environment Variables"), so that VERCEL=1 and VERCEL_ENV is "production" or "preview".',
  );
  process.exit(1);
}

if (VERCEL !== "1") refuse(`VERCEL is ${show(VERCEL)} (expected "1"); this does not look like a Vercel build.`);
if (VERCEL_ENV !== "production" && VERCEL_ENV !== "preview") refuse(`VERCEL_ENV is ${show(VERCEL_ENV)} (expected "production" or "preview").`);

// VERCEL_TARGET_ENV names the exact target (a custom environment keeps VERCEL_ENV=preview). It must not contradict VERCEL_ENV.
if (VERCEL_ENV === "production" && VERCEL_TARGET_ENV !== undefined && VERCEL_TARGET_ENV !== "production") {
  refuse(`VERCEL_ENV is "production" but VERCEL_TARGET_ENV is ${show(VERCEL_TARGET_ENV)}.`);
}
if (VERCEL_ENV === "preview" && VERCEL_TARGET_ENV === "production") {
  refuse('VERCEL_ENV is "preview" but VERCEL_TARGET_ENV is "production".');
}

if (VERCEL_ENV === "preview") {
  console.log("Preview build: skipping prisma migrate deploy");
  process.exit(0);
}

console.log("Production build: running prisma migrate deploy");
execSync("npx prisma migrate deploy", { stdio: "inherit" });
