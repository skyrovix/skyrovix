import http from "http";

async function fetchPublicSettings() {
  return new Promise((resolve, reject) => {
    // The tanstack react-start server function endpoint for getPublicFeeSettings
    const req = http.request(
      "http://localhost:3000/_serverFn/getPublicFeeSettings",
      { method: "GET" },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: data });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function fetchPage(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, html: data }));
    }).on("error", reject);
  });
}

async function run() {
  console.log("=== VERIFYING REAL-TIME PAGES & ENDPOINTS ===");

  console.log("\n1. Fetching Full Stack Internship Detail page (/internship/fullstack)...");
  const fullstackPage = await fetchPage("/internship/fullstack");
  console.log("Status:", fullstackPage.status);
  const mentions200 = fullstackPage.html.includes("₹200");
  const mentionsIntensiveTrack = fullstackPage.html.includes("Intensive Track");
  console.log("Mentions '₹200':", mentions200 ? "YES (Needs attention)" : "NO (Clean!)");
  console.log("Mentions 'Intensive Track':", mentionsIntensiveTrack ? "YES" : "NO (Clean!)");

  console.log("\n2. Fetching Internship Application page (/internship)...");
  const internPage = await fetchPage("/internship");
  console.log("Status:", internPage.status);

  console.log("\n3. Fetching Student Guide page (/guide)...");
  const guidePage = await fetchPage("/guide");
  console.log("Status:", guidePage.status);

  console.log("\n✅ Verification complete!");
}

run().catch(console.error);
