import { Component, onMount } from 'solid-js';
import styles from './Terms.module.scss';


const Terms: Component = () => {

  onMount(() => {
    const container = document.querySelector('#root');
    container && container.setAttribute('style', 'background-color: black');
  })

  return (
    <div class={styles.terms} >
      <h1>
        MagánSzövetség Felhasználói Feltételek
      </h1>
      <p>
      Utolsó frissítés: 2025. február 1
      </p>
      <p>
      Ez a Szerződés Ön és a MagánSzövetség.Net („MGSz”, „mi”, „mi” vagy „mieink”) között jön létre, amely a MagánSzövetség.Net alkalmazásainak és szolgáltatásainak Ön általi használatára vonatkozik, beleértve, de nem kizárólagosan a MagánSzövetség.Net webet. alkalmazás, agánSzövetség.Net iOS alkalmazás, MagánSzövetség.Net Android alkalmazás, MagánSzövetség.Net böngészőbővítmény, MagánSzövetség.Net Prémium Service, vagy MagánSzövetség.Net Hosted Wallet Service (együttesen „Szolgáltatások”). Jelen Szerződés kötelező érvényű kötelezettséget jelent Ön és a MagánSzövetség.Net között. A szolgáltatásokat a MagánSzövetség.Net, ideértve adott esetben leányvállalatainkat is. Szolgáltatásaink használatával Ön magára nézve kötelezőnek ismeri el a jelen Szerződést, az Elfogadható használati Szabályzatot, valamint a Szolgáltatások használatára vonatkozó további rendelkezéseket és feltételeket (együttesen a „Szabályzat”), amelyek magukban foglalhatják a harmadik féltől származó feltételeket és feltételeket. felek. Ha nem fogadja el az összes megadott feltételt, nem használhatja Szolgáltatásainkat.
      </p>
      <p>
      A jelen Szerződést időszakonként felülvizsgáljuk és frissítjük, és a frissített változatot közzétesszük a MagánSzövetség.Net weboldalán, a 9. szakaszban (Szerződés vagy szolgáltatások változásai) leírtak szerint.
      </p>

      <section>
        <h2>
        1. Felhasználási feltételek és szabályzat
        </h2>

        <section>
          <h3>1.1 Jogosultság és fiók létrehozása.</h3>
          Szolgáltatásaink használatával Ön kijelenti és szavatolja, hogy betöltötte a 18. életévét, és jogilag elfogadhatja a jelen Szerződést. A MagánSzövetség nem vállal felelősséget az Ön életkorának megtévesztéséért.
        </section>

        <section>
          <h3>1.2 Az Ön fiókjogai és kötelezettségei.</h3>
          A MagánSzövetség.Net-en keresztüli fiók létrehozása során hozzárendelünk egy kriptográfiai kulcspárt, amely az Ön privát kulcsából (nsec-vel kezdődően) és nyilvános kulcsából (npub-val kezdődik) áll. Az Ön privát kulcsa teljes és kizárólagos ellenőrzést biztosít Önnek a nyilvános Nostr hálózaton lévő fiókja felett. Az Ön felelőssége, hogy titkos kulcsát titokban tartsa és biztonságosan tárolja. A MagánSzövetség.Net nem vállal felelősséget az elveszett vagy ellopott kulcsokért. A MagánSzövetség.Net nem fér hozzá az Ön privát kulcsához, és nem tudja visszaállítani, ha elveszíti. Önnek joga van Nostr-fiókját harmadik fél szolgáltatásaiban használni, ha bejelentkezik privát kulcsával. Ha ezt szeretné, teljesen felhagyhat a MagánSzövetség.Net használatával, és továbbra is használhatja Nostr fiókját harmadik fél szolgáltatásaiban. Nostr-fiókja szuverén tulajdonosaként nincs szüksége a MagánSzövetség.Net engedélyére vagy együttműködésére ahhoz, hogy Nostr-fiókját úgy használja, ahogyan jónak tartja.
        </section>

        <section>
          <h3>1.3 A tartalom tulajdonjoga.</h3>
          Ön fenntartja az Ön által létrehozott tartalomra vonatkozó összes tulajdonjogát. A MagánSzövetség.Net-hez való tartalom beküldésével azonban ezennel világméretű, nem kizárólagos, jogdíjmentes, továbbengedélyezhető és átruházható engedélyt ad a tartalom felhasználására, reprodukálására, terjesztésére, származékos munkáinak elkészítésére, megjelenítésére és előadására. Szolgáltatások és a MagánSzövetség.Net (és utódjai és leányvállalatai) üzletága.
        </section>

        <section>
          <h3>1.4 Tiltott tartalom.</h3>
          Ön vállalja, hogy nem használja Szolgáltatásainkat illegális, jogsértő, csaló, káros, fenyegető, sértő, gyűlöletkeltő, zaklató, rágalmazó, obszcén vagy mások magánéletét sértő tartalom létrehozására, feltöltésére, közzétételére, küldésére, tárolására vagy megosztására. Ilyen tartalmak közé tartoznak többek között a kiskorúakra káros tartalmak, a pornográf anyagok, az erőszakos képek, a gyűlöletbeszéd, a diszkriminatív tartalom, valamint a terrorizmust vagy más bűncselekményeket népszerűsítő tartalom.
        </section>

        <section>
          <h3>1.5 Tiltott magatartás.</h3>
          Ön beleegyezik abba, hogy nem használja Szolgáltatásainkat olyan magatartásra, amely másokat zaklat, mások személyes adatait adja ki, célja mások megfélemlítése vagy fenyegetése, illetve az erőszak előmozdítása vagy felbujtása.
        </section>

        <section>
          <h3>1.6 Médiatárolási korlátok az Ingyenes Fiókok számára.</h3>
          Ha Ön ingyenesen használja Szolgáltatásainkat a Free Tier-en keresztül, akkor a MagánSzövetség.Net weboldalán meghatározott Free Tier fiókok tárhely- és fájlméret-korlátjáig tölthet fel médiafájlokat (képeket és videókat). A megadott korlát túllépése azt jelenti, hogy a régebbi adathordozók törlődnek, hogy helyet adjanak az újonnan feltöltött fájloknak. A Primal bármikor módosíthatja a Free Tier tárolási és fájlméret-korlátokat. Ezt a szolgáltatást a lehető legjobban nyújtjuk. A MagánSzövetség.Net semmilyen garanciát nem vállal azért, hogy az Ingyenes Felhasználói Fiókokon keresztül tárolt médiát bármennyi ideig megőrzi.
        </section>
      </section>

      <section>
        <h2>
        2. Adatvédelmi nyilatkozat
        </h2>

        <section>
        Kérjük, olvassa el a www.primal.net/privacy webhelyen elérhető "Elsődleges adatvédelmi szabályzatot" az információk gyűjtésével, felhasználásával és közzétételével kapcsolatos információkért, beleértve az Ön személyes adatait is. Ön tudomásul veszi és elfogadja, hogy a Szolgáltatások használatával hozzájárul adatainak gyűjtéséhez, felhasználásához és közzétételéhez, az Adatvédelmi szabályzatban meghatározottak szerint. Bármely olyan személy személyes adatainak megadásával (kivéve Önt), aki tranzakciókat fogadhat Öntől a Szolgáltatások használatának részeként, Ön beleegyezik abba, hogy az adott személytől beleegyezését szerezte ahhoz, hogy személyes adatait, valamint hozzájárul ahhoz, hogy ezeket a személyes adatokat gyűjtsük, felhasználjuk, tároljuk és nyilvánosságra hozzuk, az Adatvédelmi szabályzatunkban meghatározott módon és célokra.
        </section>
      </section>

      <section>
        <h2>
        3. Prémium Felhasználók Számára Nyújtott Szolgáltatás
        </h2>

        <section>
          <h3>3.1 Prémium szolgáltatás meghatározása.</h3>
          A MagánSzövetség.Net Prémium szolgáltatás egy opcionális, előfizetéses, fizetős szint, amelyet az Ön számára kínálnak, amely magában foglalja a jelen Szerződés 3.2 pontjában meghatározott MagánSzövetség.Net Orange Check-et, megnövelt médiatárolást és bizonyos prémium szolgáltatásokat, a MagánSzövetség.Net oldalán meghatározottak szerint.
        </section>

        <section>
          <h3>3.2 MagánSzövetség "Narancs-Ellenőrzés"</h3>
          A MagánSzövetség.Net Narancs-Ellenőrzés egy olyan szolgáltatás, amely személyre szabott felhasználónevet biztosít a primal.net-en („Primal név”) minden MagánSzövetség.Net Prémium szolgáltatás felhasználójának. A Primal Narancsellenőrzés tartalmaz egy ellenőrzött Nostr-címet a primal.net-en, egy Bitcoin Villámcímet a primal.net-en és egy VIP profilcímet a MagánSzovetseg.Net-en. Példaként egy olyan felhasználó, aki a MagánSzövetség.Net névként a „zsoka”-t választotta, az ellenőrzött Nostr-címe „zsoka@MaganSzovetseg.Net”, a Bitcoin Lightning-címe „zsoka@MaganSzovetseg.Net”, a VIP-profilcíme pedig „MaganSzovetseg.Net/zsoka” lenne.
        </section>

        <section>
          <h3>3.3 MagánSzövetség Név Tulajdonjoga</h3>
          A MagánSzövetség.Net marad a MagánSzövetség.Net Név kizárólagos tulajdonosa. A MagánSzövetség.Net Név bérbeadásra kerül, nem pedig eladásra, az Ön számára az Ön előfizetésének időtartamára, a jelen Szerződés 3.4. pontjában meghatározottak szerint. A MagánSzövetség.Net fenntartja a jogot, hogy bármikor, előzetes értesítés nélkül visszavonja bármely MagánSzövetség.Net Nevet, ha megállapítjuk, hogy a név más által védett, vagy ha a személyleírás lehetséges esete áll fenn, vagy bármely más okból, saját belátásunk szerint. A MagánSzövetség.Net prémium szolgáltatási előfizetés megvásárlása jogot biztosít Önnek a MagánSzövetség.Net Név használatára az előfizetés időtartamára, de a MagánSzövetség.Net nem vállal garanciát arra, hogy az Ön által kiválasztott név az előfizetés időtartama alatt elérhető marad az Ön számára. Amennyiben az Ön által kiválasztott nevet a MagánSzövetség.Net az előfizetés időtartama alatt visszavonja, Ön jogosult egy másik nevet választani, feltéve, hogy ez az új név elérhető és elfogadható a MagánSzövetség.Net számára.
        </section>

        <section>
          <h3>3.4 Prémium szolgáltatás időtartama.</h3>
          A MagánSzövetség.Net Prémium szolgáltatás a vásárlási folyamat során megadott időtartamra vehető igénybe. A MagánSzövetség.Net a Prémium profil beállításaiban egyértelműen jelzi az előfizetés lejárati dátumát. Ön bármikor megújíthatja és meghosszabbíthatja előfizetését. A MagánSzövetség.Net fenntartja magának a jogot, hogy a jelen Szerződés 5. szakaszában (A szolgáltatások törlése, felfüggesztése vagy megszüntetése) leírt okból megszüntesse előfizetését.
        </section>

        <section>
          <h3>3.5 Lejárt Prémium Előfizetés.</h3>
          Ha hagyja, hogy a Prémium szolgáltatás előfizetése lejárjon, elveszíti a Prémium szolgáltatás minden előnyét. Lejáratkor a MagánSzövetség.Net hét napos türelmi időszakot biztosít, amely alatt a Prémium Szolgáltatás előnyei továbbra is ingyenesen elérhetőek az Ön számára. A türelmi idő lejárta után a MagánSzövetség.Net Neve nem lesz többé a Nostr-fiókjához társítva, és egy másik felhasználó számára elérhetővé válik, hogy lefoglalja. A Free Tier felhasználóknak kínált keretet meghaladó médiatárolása törlésre kerül a MagánSzövetség.Net szervereiről.
        </section>
      </section>

      <section>
        <h2>
        4. Kripto-Pénztárca szolgáltatás
        </h2>

        <section>
          <h3>4.1 Prémium szolgáltatás meghatározása.</h3>
          A MagánSzövetség.Net Hosted Wallet szolgáltatás egy Önnek kínált opcionális szolgáltatás, amely magában foglalja az Ön nevében történő kis mennyiségű bitcoin tárolását, a 4.3. szakaszban meghatározott maximális tárcaegyenleg, a bitcoin tranzakciók küldésének és fogadásának lehetőségét az Ön nevében, a tranzakciós előzmények megjelenítését, valamint az Önhöz rendelt Bitcoin Lightning Address tárolását.
        </section>

        <section>
          <h3>4.2 MagánSzövetség.Net "Narancs-Ellenőrzés".</h3>
          A Bitcoin őrzési, küldési és fogadási műveleteket a Primal, Inc. leányvállalata, a Zap Solutions, Inc. („Strike”) végzi. A Hosted Wallet szolgáltatásunk használatával Ön elfogadja, hogy a jelen megállapodás, valamint a Strike szolgáltatási feltételei, a https://strike.me/legal/tos/ weboldalon meghatározottak szerint, kötelező érvényűek. A Magánszövetség.Net és a Primal fenntartja magának a jogot, hogy előzetes értesítés nélkül megváltoztassa a tárca harmadik fél szolgáltatóját, vagy egyes vagy valamennyi szolgáltatást házon belülre hozza. Minden ilyen változás a jelen Megállapodás frissítésében jelenik meg, a 9. szakaszban (A megállapodás vagy a szolgáltatások módosítása) leírtak szerint.
        </section>

        <section>
          <h3>4.3 Maximális tárcaegyenleg.</h3>
          Hosted Wallet szolgáltatásunk célja, hogy egy könnyen használható, minimális telepítési erőfeszítéssel rendelkező bitcoin pénztárcát biztosítson. A MagánSzövetség.Net és a Primal Hosted Wallet Service-t nem szabad olyan összegek tárolására használni, amelyek meghaladják azt az értéket, amelyet egy fizikai költőpénztárcában tartana. Nagyobb összegek esetén a MagánSzövetség.Net és a Primal saját letétbe helyezést javasol, lehetőleg bitcoinra specializálódott hardveres pénztárcában. A MagánSzövetség.Net és a Primal érvényre juttatja a maximális tárcaegyenleget annak biztosítása érdekében, hogy minden felhasználó arra a célra használja a Hosted Wallet szolgáltatásunkat, amire azt tervezték. A maximális tárcaegyenleg a tárca beállításaiban látható. Ha olyan összeget próbál pénztárcáján jóváírni, amely meghaladja a maximális pénztárcaegyenlegét, akkor a visszatérítés érdekében kapcsolatba kell lépnie a MagánSzövetség.Net ügyfélszolgálatával a support@maganszovetseg.net címen.
        </section>

        <section>
          <h3>4.4 Pénztárca aktiválása és ellenőrzése.</h3>
          Amikor aktiválja a MagánSzövetség-Primal tárcáját és regisztrál a Hosted Wallet szolgáltatásra, Ön vállalja, hogy a regisztrációs űrlapon kért pontos, aktuális és teljes körű adatokat ad meg. Pénztárcáját a Nostr privát kulcsa (amely „nsec”-vel kezdődik) és a regisztráció során megadott, ellenőrzött e-mail címe vezérli. Az Ön felelőssége, hogy a Nostr privát kulcsát titokban tartsa és biztonságosan tárolja, valamint hogy biztosítsa, hogy senki más ne férjen hozzá ahhoz az e-mail fiókhoz, amelyet a Hosted Wallet szolgáltatásra való regisztrációhoz használt. Ha akár a Nostr privát kulcsa, akár az e-mail fiókja veszélybe kerül, az a MagánSzövetség-Primal tárcájában lévő pénzeszközök elvesztését eredményezheti. A MagánSzövetség és a Primal nem vállal felelősséget és felelősséget a veszélyeztetett privát kulcs és/vagy e-mail fiókból eredő pénzeszközök elvesztéséért.
        </section>

        <section>
          <h3>4.5 Tranzakciós díjak.</h3>
          A MagánSzövetség-Primal tárcán belüli bejövő és kimenő fizetések tranzakciós díjai a bitcoin hálózati díjak, a Primal kapcsolt vállalkozásai által felszámított díjak (ha vannak ilyenek) és a Primal által felszámított díjak (ha vannak ilyenek) kombinációjából állnak. A tranzakciós díjpolitika előzetes értesítés nélkül változhat. A Primal Wallet a Tranzakció részletei képernyőn egyértelműen megjeleníti az egyes tranzakciókért felszámított díjakat.
        </section>

        <section>
          <h3>4.6 Alkalmazáson belüli vásárlási díjak.</h3>
          A Magánszövetség.Net-Primal Wallet lehetőséget kínál kis mennyiségű bitcoin vásárlására, jellemzően 5 USD-s lépésekben, az Apple/Google alkalmazáson belüli vásárláson keresztül. Az Apple és a Google jelentős díjat számít fel ezekért a tranzakciókért. A vásárlás előtt a Magánszövetség.Net-Primal egyértelműen megjeleníti a pontos bitcoin-összeget (szatoszkiban kifejezve), amelyet az Ön által fizetendő konkrét fiat-összegért kap. A Magánszövetség.Net-Primal nem szerez bevételt az alkalmazáson belüli vásárlásokból. Minden alkalmazáson belüli vásárlás végleges, a Magánszövetség.Net és a Primal nem nyújt visszatérítést.
        </section>

        <section>
          <h3>4.7 Téves és jogosulatlan tranzakciók.</h3>
          Minden, a MagánSzövetség.Net-Primal Hosted Wallet szolgáltatáson keresztül történő fizetés végleges. Ha téves vagy jogosulatlan tranzakció történik, közvetlenül a kedvezményezetthez kell fordulnia a pénzösszegek visszaszerzése érdekében. A MagánSzövetség.Net és a Primal nem vállal felelősséget a téves vagy jogosulatlan tranzakciókért.
        </section>

        <section>
          <h3>4.8 Adók.</h3>
          Az Ön felelőssége meghatározni, hogy a bitcoin-tranzakciókkal kapcsolatban - beleértve a bitcoin elköltését, vásárlását és eladását - milyen adókkal tartozik, ha tartozik egyáltalán. Az Ön felelőssége, hogy minden ilyen adót bejelentsen és befizessen a megfelelő adóhatóságnak. Ön elfogadja, hogy a MagánSzövetség.net nem felelős annak meghatározásáért, hogy a Szolgáltatások Ön általi használatára, beleértve az Ön tranzakcióit is, vonatkoznak-e adók, illetve a Szolgáltatások Ön általi használatából eredő bármely adó beszedéséért, bejelentéséért, visszatartásáért vagy átutalásáért.
        </section>
      </section>

      <section>
        <h2>
        5. A szolgáltatások törlése, felfüggesztése vagy megszüntetése
        </h2>

        <section>
          <h3>5.1 Fiók törlése.</h3>
          Saját belátásunk szerint és az Önnel szemben felmerülő költségek vagy felelősség nélkül, előzetes értesítéssel vagy anélkül, bármikor felfüggeszthetjük, módosíthatjuk vagy megszüntethetjük ideiglenesen vagy véglegesen a Szolgáltatásaink egészét vagy bármely részét, bizonyos tranzakciós vagy kereskedési korlátokat állapíthatunk meg, vagy megszüntethetjük a Fiókját, akár indoklással, akár anélkül, beleértve azt is, ha indokoltan úgy véljük, hogy: (i) Ön kockázatot vagy lehetséges jogi kockázatot jelent számunkra; (ii) a Szolgáltatások nyújtása az Ön számára üzletileg már nem életképes; vagy (iii) Ön megszegte a jelen Megállapodás bármely feltételét.
        </section>

        <section>
          <h3>5.2 Fiók felfüggesztése.</h3>
          Jogunkban áll azonnal felfüggeszteni az Ön felhasználi fiókját, és a fiókján lévő pénzeszközöket és eszközöket befagyasztani, ha: (i) saját belátásunk szerint azt gyanítjuk, hogy az Ön Számlája megsérti a jelen Megállapodást vagy a pénzmosás elleni programunkat; (ii) kormányzati vagy szabályozó hatóság, alkalmazandó törvény, bírósági végzés vagy jogerős idézés kötelez minket erre; (iii) az Ön Fiókjának egyenlege negatív; (iv) az Ön Fiókjára történő átutalást visszautalták az Ön bankszámlájára; (v) úgy véljük, hogy szokatlan tevékenység folyik a számláján, vagy hogy Ön jogosulatlanul vagy nem megfelelő módon használja a Hitelesítési adatokat vagy a fiókját; vagy (vi) ha Ön több mint két éve nem lépett be a fiókjába. Az Ön Fiókja felfüggesztve marad, és a fiókján/számláján lévő pénzeszközök és eszközök befagyasztva maradnak mindaddig, amíg a MagánSzövetség.Net meg nem állapítja a vizsgálat eredményét, és ekkor a MagánSzövetség.Net dönthet úgy, hogy megszünteti az Ön Fiókját.
        </section>
      </section>

      <section>
        <h2>
          6. Jótállási nyilatkozat
        </h2>

        <p>
        Ön tudomásul veszi, hogy Szolgáltatásainkat „ahogy van” és „ahogy rendelkezésre áll” alapon nyújtjuk, bármiféle kifejezett vagy hallgatólagos garancia nélkül. Nem vállalunk garanciát arra, hogy Szolgáltatásaink hibátlanok lesznek, vagy megszakítások nélkül fognak működni, és nem vállalunk semmilyen garanciát Szolgáltatásaink minőségére, pontosságára, megbízhatóságára, vagy arra vonatkozóan, hogy azok bármilyen konkrét célra alkalmasak.
        </p>
      </section>

      <section>
        <h2>
        7. Kártalanítás
        </h2>

        <p>
        Ön kártalanítja és mentesíti a MagánSzövetség.Net-et, a Primal-t és annak kapcsolt vállalkozásait, valamint azok tisztviselőit, igazgatóit, alkalmazottait és ügynökeit minden olyan követelés, vita, követelés, felelősség, kár, veszteség, költség és kiadás (beleértve, de nem kizárólagosan az ésszerű jogi és könyvelési költségeket) alól, amely (a) a Szolgáltatásokhoz való helytelen vagy jogosulatlan hozzáféréséből vagy azok használatából, valamint (b) a jelen Megállapodás megsértéséből ered, vagy azzal bármilyen módon összefügg.
        </p>
      </section>

      <section>
        <h2>
        8. A felelősség korlátozása
        </h2>

        <section>
          <h3>8.1 LEMONDÁS A KÖVETKEZMÉNYES KÁROKRÓL.</h3>
          A JELEN MEGÁLLAPODÁS BÁRMELY MÁS SZAKASZÁTÓL FÜGGETLENÜL SEM A MAGÁNSZÖVETSÉG.NET, SEM A PRIMAL, SEM A TÁRSULT VÁLLALKOZÁSAI, SEM HARMADIK FÉL SZOLGÁLTATÓK, SEM A SZOLGÁLTATÁSOK LÉTREHOZÁSÁBAN, ELŐÁLLÍTÁSÁBAN VAGY NYÚJTÁSÁBAN RÉSZT VEVŐ BÁRMELY MÁS FÉL NEM VÁLLAL FELELŐSSÉGET SEMMILYEN VÉLETLEN, KÜLÖNLEGES, PÉLDAMUTATÓ VAGY KÖVETKEZMÉNYES KÁRÉRT, ILLETVE AZ ELMARADT NYERESÉG, BEVÉTELKIESÉS, KERESKEDELMI VESZTESÉG, MEGTAKARÍTÁSKIESÉS, ELVESZTETT ÜZLETI LEHETŐSÉG, ADATVESZTÉS VAGY JÓ HÍRNÉV ELVESZTÉSE, A SZOLGÁLTATÁS MEGSZAKADÁSA MIATTI KÁROKÉRT, SZÁMÍTÓGÉPES KÁROKÉRT VAGY RENDSZERHIBÁKÉRT, ILLETVE A HELYETTESÍTŐ SZOLGÁLTATÁSOK KÖLTSÉGEIÉRT, AMELYEK A JELEN SZERZŐDÉSBŐL VAGY AZZAL ÖSSZEFÜGGÉSBEN, ILLETVE A SZOLGÁLTATÁSOK HASZNÁLATÁBÓL VAGY HASZNÁLATÁNAK LEHETETLENSÉGÉBŐL EREDNEK, FÜGGETLENÜL ATTÓL, HOGY GARANCIÁN, SZERZŐDÉSEN, JOGELLENES KÁROKOZÁSON (BELEÉRTVE A GONDATLANSÁGOT IS), TERMÉKFELELŐSSÉGEN VAGY BÁRMELY MÁS JOGI ELMÉLETEN ALAPULNAK, ÉS FÜGGETLENÜL ATTÓL, HOGY A PRIMAL, ANNAK LEÁNYVÁLLALATAI VAGY BÁRMELY MÁS FÉL TÁJÉKOZTATÁST KAPOTT-E AZ ILYEN KÁROK LEHETŐSÉGÉRŐL. EGYES JOGHATÓSÁGOK NEM TESZIK LEHETŐVÉ A KÖVETKEZMÉNYES VAGY VÉLETLEN KÁROKÉRT VALÓ FELELŐSSÉG KIZÁRÁSÁT VAGY KORLÁTOZÁSÁT, ÍGY A FENTI KORLÁTOZÁS NEM FELTÉTLENÜL VONATKOZIK ÖNRE.
        </section>

        <section>
          <h3>8.2 FELELŐSSÉGI FELSŐ HATÁR.</h3>
          A JELEN SZERZŐDÉS BÁRMELY MÁS SZAKASZA ELLENÉRE A MAGÁNSZÖVETSÉG.NET, A PRIMAL ÉS KAPCSOLT VÁLLALKOZÁSAI TELJES FELELŐSSÉGE, AMELY A JELEN SZERZŐDÉSBŐL VAGY AZZAL KAPCSOLATBAN, ILLETVE A SZOLGÁLTATÁSOK HASZNÁLATÁBÓL VAGY HASZNÁLATÁNAK ELLEHETETLENÜLÉSÉBŐL ERED, SEMMILYEN ESETBEN SEM HALADJA MEG A SZÁZ AMERIKAI DOLLÁRT ($100).
        </section>

        <section>
          <h3>8.3 AZ ALKU ALAPJA ÉS A LÉNYEGES CÉL HIÁNYA.</h3>
          A FENTIEKBEN MEGHATÁROZOTT KÁRTÉRÍTÉSI KIZÁRÁSOK ÉS KORLÁTOZÁSOK A PRIMAL ÉS ÖN KÖZÖTTI ALKU ALAPJÁNAK ALAPVETŐ ELEMEI. A JELEN 8. SZAKASZBAN FOGLALT LEMONDÁSOK ÉS KORLÁTOZÁSOK A KERESET FORMÁJÁTÓL FÜGGETLENÜL ALKALMAZANDÓK, FÜGGETLENÜL ATTÓL, HOGY SZERZŐDÉS, DELIKTUM (BELEÉRTVE A GONDATLANSÁGOT IS), SZIGORÚ FELELŐSSÉG VAGY BÁRMELY MÁS JOGI ELMÉLET ALAPJÁN, ÉS AKKOR IS FENNMARADNAK ÉS ALKALMAZANDÓK, HA A JELEN FELTÉTELEKBEN FOGLALT BÁRMELY KORLÁTOZOTT JOGORVOSLAT ALAPVETŐ CÉLJÁT ELVESZTETTE.
        </section>
      </section>

      <section>
        <h2>
        9. A megállapodás vagy a szolgáltatások módosítása
        </h2>

        <p>
        A jelen Megállapodást saját belátásunk szerint bármikor frissíthetjük. Ha így teszünk, értesítést küldünk a frissített Megállapodásnak a MaganSzovetseg weboldalán, a www.MaganSzovetseg.net/terms címen történő közzétételével, valamint esetlegesen más, általunk megfelelőnek ítélt kommunikáció(k)n keresztül. Ennek megfelelően fontos, hogy a jelen Megállapodást a Primal weboldalán rendszeresen áttekintse a frissítések tekintetében, többek között a Szolgáltatások használata során. Ha Ön továbbra is használja a Szolgáltatásokat, miután frissített Megállapodást tettünk közzé, akkor Ön elfogadja, hogy a frissített Megállapodás kötelező érvényű. Ha nem ért egyet a frissített Megállapodással, akkor a továbbiakban nem használhatja a Szolgáltatásokat. A Szolgáltatásaink fejlődésével párhuzamosan saját belátásunk szerint bármikor, előzetes értesítés nélkül megváltoztathatjuk vagy megszüntethetjük a Szolgáltatások egészét vagy bármely részét.
        </p>
      </section>

      <section>
        <h2>
        10. Irányadó jog
        </h2>

        <p>
        E megállapodásra a kanadai Ontario állam törvényei vonatkoznak, és azokkal összhangban kell eljárni.
        </p>
      </section>

      <section>
        <h2>
        11. A feltételek elfogadása
        </h2>

        <p>
        Szolgáltatásaink használatával Ön jelzi, hogy elfogadja a jelen Megállapodást. Ha nem ért egyet a jelen Megállapodás feltételeivel, nem használhatja Szolgáltatásainkat.
        </p>
      </section>

      <section>
        <h2>
        12. Kapcsolattartási információk
        </h2>

        <p>
        Ha bármilyen kérdése van a jelen megállapodással kapcsolatban, forduljon hozzánk a support@MaganSzovetseg.net e-mail címen.
        </p>
      </section>
    </div>
  );
}

export default Terms;
