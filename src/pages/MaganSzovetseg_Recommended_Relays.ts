export const MaganSzovetseg_Recommended_Relays = [
  //CHECK https://next.nostr.watch/relays
  //wscat -c wss://nos.lol //csatlakozás teszt
  /* // relé sebesség teszt
$start = Get-Date
$ws = New-Object System.Net.WebSockets.ClientWebSocket
$uri = [System.Uri]::new("wss://nostr.ovia.to")
$ws.ConnectAsync($uri, [System.Threading.CancellationToken]::None).Wait()
$end = Get-Date
Write-Output ("Relé válaszidő: " + ($end - $start).TotalMilliseconds + " ms")
  */

"wss://nostr.oxtr.dev",//202
"wss://cfrelay.snowcait.workers.dev",//205
"wss://cfrelay.royalgarter.workers.dev",//218
"wss://relay.nostraddress.com",//230
"wss://nostr.jfischer.org",//292
"wss://purplepag.es",//371
"wss.//nostr.ovia.to",//390
//"wss://relay.czas.xyz",//429
//"wss://nostr-relay.amethyst.name",//543
//"wss://relay.snort.social",//603
//"wss://nostr-pub.wellorder.net",//750
//"wss://nostr.hekster.org",//1003
//"wss://nostrelites.org",//8608

  //nem kapcsolódnak:
  //"wss://nostr.huszonegy.world",
  //"wss://relay.nostr.brand",
  //"wss://nostr-relay.wlvs.space",
  //"wss://relay.verified-nostr.com",
  //"wss://nostrelay.mamory-art.xyz",
  //"wss://aliens.contact.nostr",
  //"wss://nostr.vision",
  //"wss://tesla.legacy.nostr",
  //"wss://psychology.healing.nostr",
  //"wss://systems.integration.nostr",
  //"wss://global.healthinitiative.nostr",
  //"wss://philosophical.debates.nostr",
  //"wss://mentalpeace.nostr",
  //"wss://global.consciousness.nostr",
  //"wss://science.frontiers.nostr",
  //"wss://nostr.buddhistnetwork.nostr",
  //"wss://esoteric.knowledge.nostr",
  //"wss://primal.b-cdn.net",
  //"wss://relay.roli.social",
  //"wss://relay.iris.to",
  //"wss://nostr.8k-lab.com",
  //"wss://nostr-relay.wlvs.space",
  //"wss://global.consciousness.nostr",
  //"wss://science.frontiers.nostr",
  //"wss://nostr.buddhistnetwork.nostr",
  //"wss://esoteric.knowledge.nostr",
  //"wss://primal.b-cdn.net",

] as const;

export type MaganSzovetsegRelay = typeof MaganSzovetseg_Recommended_Relays[number];