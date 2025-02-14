// scr/api/cloudflare.ts handling Cloudflare to create nip-05

const CLOUDFLARE_API_KEY = "6b6a41b98a6bea3959de31243cde45b53336b"; // 🔑 Cloudflare API kulcs
const ZONE_ID = "b0e14991d74d39b928478f12749f5847"; // 🌍 Cloudflare zóna ID

export const createNIP05Record = async (username: string, nostrPubKey: string) => {
  const recordName = `_nostr.maganszovetseg.net`;
  const recordValue = JSON.stringify({
    names: { [username]: nostrPubKey },
  });

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CLOUDFLARE_API_KEY}`,
      },
      body: JSON.stringify({
        type: "TXT",
        name: recordName,
        content: recordValue,
        ttl: 3600, // 1 óra
      }),
    }
  );

  const data = await response.json();
  if (data.success) {
    console.log("✅ NIP-05 rekord sikeresen létrehozva:", data.result);
    return true;
  } else {
    console.error("❌ Hiba történt a rekord létrehozásakor:", data.errors);
    return false;
  }
};
