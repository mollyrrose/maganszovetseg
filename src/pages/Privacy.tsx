import { Component, onMount } from 'solid-js';
import styles from './Terms.module.scss';


const Privacy: Component = () => {

  onMount(() => {
    const container = document.querySelector('#root');
    container && container.setAttribute('style', 'background-color: black');
  })

  return (
    <div class={styles.terms} >
      <h1>
      MagánSzövetség.Net Adatvédelmi irányelvek
      </h1>
      <p>
        Last updated: February 21, 2024
      </p>
      <p>
      A jelen Adatvédelmi szabályzat ismerteti, hogy a MagánSzövetség.Net és kapcsolt szolgáltatásai („MagánSzövetség”, „mi”, „minket” vagy „miénk”) hogyan dolgozzák fel az Önre vonatkozó információkat. A jelen Adatvédelmi szabályzat akkor alkalmazandó, amikor Ön a MagánSzövetség.Net termékeket és szolgáltatásokat használja, beleértve, de nem kizárólagosan a MagánSzövetség.Net webes alkalmazást, MagánSzövetség.Net iOS alkalmazást, MagánSzövetség.Net Android alkalmazást, MagánSzövetség.Net böngészőbővítményt, MagánSzövetség.Net Prémium szolgáltatást vagy MagánSzövetség.Net Hosted Wallet szolgáltatást (a továbbiakban együttesen „Szolgáltatások”). Ez akkor is érvényes, amikor Ön kapcsolatba lép ügyfélszolgálatunkkal, kapcsolatba lép velünk a közösségi médiában, vagy más módon kapcsolatba lép velünk vagy Szolgáltatásainkkal.
      </p>

      <section>
        <h2>
          1. Irányelvek áttekintése
        </h2>

        <p>
        A MagánSzövetség.Net nem használja pénzben az Ön személyes adatait. Nem termelünk bevételt hirdetéseken keresztül, nem monetizáljuk a felhasználók figyelmét, és nem adjuk el a felhasználóinktól gyűjtött személyes adatokat. A MagánSzövetség.Net politikája az, hogy maximalizálja a felhasználói adatvédelmet azáltal, hogy csak a minimálisan szükséges mennyiségű személyes adatot gyűjti, hogy minőségi szolgáltatásokat nyújtson felhasználóinknak, és megfeleljen a vonatkozó törvényeknek.
        </p>
      </section>

      <section>
        <h2>
        2. Az általunk gyűjtött információk
        </h2>

        <section>
          <h3>2.1 Felhasználói fiók létrehozása.</h3>
          A MagánSzövetség.Net szolgáltatások lehetővé teszik, hogy fiókot hozzon létre a nyilvános Nostr hálózaton. A fiók létrehozásakor megadott összes információ nem kötelező, kivéve a kívánt felhasználónevet. Minden személyes adat, amelyet a fiók létrehozásának folyamata során közöl, a nyilvános Nostr hálózaton lévő relék számára a Nostr-fiókok szokásos módon kerülnek közzétételre. Ezek az információk nyilvánosak, és bárki láthatja őket a Nostr hálózaton. A MagánSzövetség.Net nem gyűjt további információkat Önről a fiók létrehozásának folyamata során.
        </section>

        <section>
          <h3>2.2 Magánszövetség Mobile App-ok.</h3>
          A MagánSzövetség.Net nem gyűjt adatokat a mobilalkalmazásainkon - MagánSzövetség.Net for iOS és MagánSzövetség.Net for Android - keresztül azon adatokon túl, amelyeket Ön kifejezetten a nyilvános Nostr-hálózaton való közzétételhez és az opcionális Hosted Wallet szolgáltatás aktiválásakor ad meg, a 2.4. pontban leírtak szerint. Az Apple App Store és a Google Play Store nyilvános listáin található adatvédelmi és adatgyűjtési hirdetmények a mobilalkalmazásaink adatgyűjtési beállításait mutatják.
        </section>

        <section>
          <h3>2.3 Prémium szolgáltatás.</h3>
          A MagánSzövetség.Net Prémium szolgáltatás egy opcionális, előfizetésen alapuló, fizetős szint, amelyet Önnek kínálunk, és amely magában foglalja a MagánSzövetség.Net Orange Check szolgáltatását, ahogyan azt a Szolgáltatási feltételekről szóló megállapodásunkban meghatározzuk, valamint bizonyos prémium funkciókat, ahogyan azt a MagánSzövetség.Net weboldalán meghatározzuk. Prémium szolgáltatásunk kifejezetten a felhasználói adatvédelem maximális védelmét szolgálja, és mint ilyen, nem igényli személyes adatok közlését.
        </section>

        <section>
          <h3>2.4 Hosted Wallet szolgáltatás.</h3>
          A MagánSzövetség.Net Hosted Wallet szolgáltatás egy Önnek kínált opcionális szolgáltatás, amely magában foglalja kis mennyiségű bitcoin tárolását az Ön nevében, a bitcoin tranzakciók küldésének és fogadásának lehetőségét az Ön nevében, a tranzakciós előzmények megjelenítését, valamint az Önhöz rendelt Bitcoin Lightning Address tárolását. A Hosted Wallet szolgáltatás jogszabálynak megfelelő aktiválásához a törvény által előírt minimális mennyiségű személyes adatot gyűjtünk, ahogyan az a Wallet aktiválási képernyőn látható.
        </section>

        <section>
          <h3>2.5 Támogatási szolgáltatások.</h3>
          A MagánSzövetség.Net e-mailben és a közösségi médián keresztül nyújt támogatást. A velünk való rendszeres kommunikáció során megadott információkat az e-mail rendszereinkben tároljuk, egyébként pedig az általunk használt különböző közösségi médiarendszerekben rögzítjük.
        </section>
      </section>

      <section>
        <h2>
        3. Hogyan használjuk fel az Ön adatait
        </h2>

        <p>
        Az Ön személyes adatait arra használjuk, hogy magas színvonalú szolgáltatást nyújtsunk Önnek, beleértve a Támogatási Szolgáltatások nyújtását, valamint a MagánSzövetség.Net Szolgáltatások általános működtetésére és az Önnel való kommunikációra, amennyiben szükséges.
        </p>
      </section>

      <section>
        <h2>
        4. Az Ön adatainak megosztása
        </h2>

        <p>
        A MagánSzövetség.Net nem osztja meg az Ön adatait harmadik féllel, kivéve, ha a törvény előírja. Személyes adatait megoszthatjuk a bűnüldöző, adatvédelmi hatóságokkal, kormányzati tisztviselőkkel és más hatóságokkal, ha: (i) idézés, bírósági végzés vagy más jogi eljárás kényszeríti; (ii) úgy véljük, hogy a közzététel szükséges a kár vagy pénzügyi veszteség megelőzéséhez; (iii) a közzététel szükséges a feltételezett illegális tevékenység bejelentéséhez; vagy (iv) a közzététel szükséges a Szolgáltatási feltételeink vagy Adatvédelmi szabályzatunk megsértésének kivizsgálásához.
        </p>

        <p>
        A MagánSzövetség.Net Hosted Wallet szolgáltatását a Zap Solutions, Inc. („Strike”) partnercégünkkel együttműködve kínáljuk. A jogszabályoknak megfelelő szolgáltatás nyújtása érdekében a Hosted Wallet szolgáltatással kapcsolatos adatait meg kell osztanunk a Strike-kal.
        </p>
      </section>

      <section>
        <h2>
        5. Az Ön jogai és választási lehetőségei
        </h2>

        <p>
        Személyes adataival kapcsolatban jogai és választási lehetőségei vannak, beleértve a következőket: (i) az adataihoz való hozzáférés és azok frissítése: személyes adatait a fiókjába bejelentkezve megtekintheti és módosíthatja; (ii) deaktiválás és törlés: fiókját deaktiválhatja vagy kérheti adatai törlését.
        </p>
      </section>

      <section>
        <h2>
        6. Az Ön adatainak biztonsága
        </h2>

        <p>
        A MagánSzövetség.Net a legjobb iparági gyakorlatokon alapuló, erőteljes biztonsági intézkedéseket alkalmaz az Ön személyes és pénzügyi adatainak bizalmas kezelése, integritása és rendelkezésre állása érdekében. Azonban egyetlen rendszer sem teljesen biztonságos, és nem tudjuk garantálni az Ön adatainak abszolút biztonságát.
        </p>
      </section>

      <section>
        <h2>
        7. Az Adatvédelmi szabályzat módosításai
        </h2>

        <p>
        Időről időre megváltoztathatjuk ezt az Adatvédelmi szabályzatot. Ha változtatásokat eszközlünk, a jelen tájékoztató tetején található dátum módosításával értesítjük Önt, és bizonyos esetekben további értesítést is küldhetünk Önnek (például egy nyilatkozat hozzáadásával a weboldalunkhoz vagy értesítés küldésével). Javasoljuk, hogy rendszeresen tekintse át ezt az Adatvédelmi szabályzatot, hogy tájékozott maradjon az adatkezelési gyakorlatunkról és az Ön rendelkezésére álló választási lehetőségekről.
        </p>
      </section>

      <section>
        <h2>
          8. Contact Us
        </h2>

        <p>
        Ha bármilyen kérdése van a jelen Adatvédelmi irányelvekkel kapcsolatban, forduljon hozzánk a support@MaganSzovetseg.Net e-mail címen.
        </p>
      </section>
    </div>
  );
}

export default Privacy;
