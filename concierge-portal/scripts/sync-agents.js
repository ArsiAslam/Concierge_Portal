// ---------------------------
// sync-agents.js
// Run locally:  node scripts/sync-agents.js
// In CI:        GitHub Actions runs this automatically every 40 minutes
// ---------------------------

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BP_BASE = "https://biggerpockets.com";
const PARTNER_ID = "bnbcalc";

// ---------------------------
// HELPERS
// ---------------------------

function log(msg) {
  const time = new Date().toISOString();
  console.log(`[${time}] ${msg}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------
// GET AGENT COUNT FOR ONE MARKET
// ---------------------------

async function getAgentCount(market) {
  const baseUrl = `${BP_BASE}/api/v3/pbbp/supply/businesses`;
  const perPage = 25;
  let page = 1;
  let totalActive = 0;

  log(`  → Fetching agents for market: "${market}"`);

  while (true) {
    const params = new URLSearchParams({
      market,
      vendor_type: "Agent",
      page: String(page),
      per_page: String(perPage),
    });

    const fullUrl = `${baseUrl}?${params}`;

    let response;
    try {
      response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          "X-BP-Partner-Id": PARTNER_ID,
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
        },
      });
    } catch (err) {
      log(`  [ERROR] Network error on "${market}" page ${page}: ${err.message}`);
      return null;
    }

    if (response.status !== 200) {
      const body = await response.text();
      log(`  [ERROR] BP API returned ${response.status} for "${market}" page ${page}`);
      log(`  [ERROR] Response: ${body.slice(0, 200)}`);
      return null;
    }

    let data;
    try {
      data = await response.json();
    } catch (err) {
      log(`  [ERROR] Failed to parse JSON for "${market}" page ${page}: ${err.message}`);
      return null;
    }

    const businesses = data?.data || [];

    log(`  → "${market}" page ${page}: received ${businesses.length} businesses`);

    if (!Array.isArray(businesses) || businesses.length === 0) {
      break;
    }

    // Count only non-paused businesses
    let activeThisPage = 0;
    for (const biz of businesses) {
      const isPaused =
        biz?.business_paused === true ||
        biz?.business_paused === "true" ||
        biz?.business_paused === 1;

      if (!isPaused) {
        activeThisPage++;
        totalActive++;
      }
    }

    log(`  → "${market}" page ${page}: ${activeThisPage} active agents (running total: ${totalActive})`);

    const totalPages = data?.total_pages || page;
    if (page >= totalPages) {
      break;
    }

    page++;
    await sleep(500); // avoid BP rate limits
  }

  log(`  ✓ "${market}" final active agent count: ${totalActive}`);
  return totalActive;
}

// ---------------------------
// FETCH ALL ROWS FROM SUPABASE
// ---------------------------

async function fetchRows() {
  const url = `${SUPABASE_URL}/rest/v1/agent_supply?select=id,market`;

  log("Fetching markets from Supabase...");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase fetch failed (${response.status}): ${body}`);
  }

  const rows = await response.json();
  log(`Fetched ${rows.length} markets from Supabase`);
  return rows;
}

// ---------------------------
// UPDATE ONE ROW IN SUPABASE
// ---------------------------

async function updateRow(id, market, agentCount) {
  const url = `${SUPABASE_URL}/rest/v1/agent_supply?id=eq.${id}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ agents: agentCount }),
  });

  if (!response.ok) {
    const body = await response.text();
    log(`  [ERROR] Supabase update failed for "${market}" (${response.status}): ${body}`);
    return false;
  }

  log(`  ✓ Pushed ${agentCount} agents → market: "${market}"`);
  return true;
}

// ---------------------------
// MAIN
// ---------------------------

async function run() {
  log("=== sync-agents started ===");

  // Validate env vars
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error(
      "[FATAL] Missing environment variables.\n" +
        "  Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running.\n" +
        "  Local:  copy .env.local.example to .env.local and fill in values\n" +
        "  CI:     add them as GitHub Actions secrets"
    );
    process.exit(1);
  }

  let rows;
  try {
    rows = await fetchRows();
  } catch (err) {
    log(`[FATAL] Could not fetch rows from Supabase: ${err.message}`);
    process.exit(1);
  }

  log(`Starting sync for ${rows.length} markets...\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const { id, market } = rows[i];

    log(`--- [${i + 1}/${rows.length}] Processing market: "${market}" ---`);

    const agentCount = await getAgentCount(market);

    if (agentCount === null) {
      log(`  [SKIP] Failed to get agent count for "${market}"`);
      failCount++;
    } else {
      const ok = await updateRow(id, market, agentCount);
      if (ok) successCount++;
      else failCount++;
    }

    log(""); // blank line between markets for readability

    await sleep(1000); // 1s between markets to avoid rate limits
  }

  log("=== sync-agents finished ===");
  log(`Results: ${successCount} updated, ${failCount} failed, ${rows.length} total`);
}

run();
