import { Tabs } from '@kobalte/core/tabs';
import { Component, createEffect, createSignal, For, Match, onCleanup, onMount, Show, Switch } from 'solid-js';
import AdvancedSearchDialog from '../../components/AdvancedSearch/AdvancedSearchDialog';
import ButtonSecondary from '../../components/Buttons/ButtonSecondary';
import HelpTip from '../../components/HelpTip/HelpTip';

import styles from './Premium.module.scss';
import { A, useNavigate } from '@solidjs/router';
import ButtonLink from '../../components/Buttons/ButtonLink';

export type FetureComparison = {
  name: string,
  free: string,
  premium: string,
  help?: string,
}

const premiumFeatures = [
  {
    name: 'Web és mobil-alkalmazások (iOS, Android)',
    free: 'true',
    premium: 'true',
  },
  {
    name: 'Beépített bitcoin villámtárca (Lightning wallet)',
    free: 'true',
    premium: 'true',
  },
  {
    name: 'Globalális Nostr szöveg- és felhasználó-keresés',
    free: 'true',
    premium: 'true',
  },
  {
    name: 'Médiatároló kapacitás',
    free: '1 GB',
    premium: '10 GB',
  },
  {
    name: 'A média maximális fájlmérete',
    free: '100 mb',
    premium: '1 GB',
  },
  // {
  //   name: 'Ellenőrzött Nostr cím',
  //   free: 'false',
  //   premium: 'true',
  //   help: 'e. g. alice@MaganSzovetseg.net',
  // },
  // {
  //   name: 'Egyedi email cím (a Lightning tárcához) (később)',
  //   free: 'false',
  //   premium: 'true',
  //   help: 'e. g. aliz@maganszovetsed.net',
  // },
  {
    name: 'VIP profil a MaganSzovetseg.net oldalon',
    free: 'false',
    premium: 'true',
    help: 'e. g. maganszovetseg.net/aliz',
  },
  {
    name: 'Speciális/fejlettebb Nostr keresés',
    free: 'false',
    premium: 'true',
    help: 'Találj bármit a Nostr-on! Keresés kulcsszavak és kifejezések, tartalom típusa, ki posztolt, ki válaszolt, ki zökkentett, közzétett idő, hálózati hatókör és egy csomó szűrő alapján.',
   },
  // {
  //   name: 'Prémium fizetős relé (később)',
  //   free: 'false',
  //   premium: 'true',
  //   help: 'wss://premium.MaganSzovetseg.net',
  // },
  // {
  //   name: 'Nostr névjegyzék biztonsági mentés (később)',
  //   free: 'false',
  //   premium: 'true',
  //   help: 'A Primal biztonsági másolatot készít a Nostr követőlista 100+ legújabb verziójáról. Ha a követési listát egy másik Nostr alkalmazás törli vagy megsérti, visszaállíthatja azt a Primal Premium felhasználók Nostr Tools szakaszában található Contact List Backup eszközzel. (Még nem elérhető, később vezetjük be.)',
  // },
  // {
  //   name: 'Nostr fiók tartalmának biztonsági mentése',
  //   free: 'false',
  //   premium: 'true',
  //   help: 'A Primal archiválja az összes Nostr-tartalom teljes történetét. Bármikor újrasugározhatja a tartalom bármely részhalmazát a kiválasztott közvetítők számára a Tartalom biztonsági mentése eszközzel a Nostr Tools részben a Primal Premium felhasználók számára. (Még nem elérhető, később vezetjük be.',
  // },
  // {
  //   name: 'Premium feeds',
  //   free: 'false',
  //   premium: 'true',
  //   help: 'Some advanced feeds will be accessible only to Primal Premium users. You will be able to access these feeds through other Nostr clients that support DVM feeds.',
  // },
  // {
  //   name: 'Private beta access',
  //   free: 'false',
  //   premium: 'true',
  //   help: 'Get early exclusive access to Primal Beta releases.',
  // },
  {
    name: 'Még sok minden érkezik!',
    free: 'false',
    premium: 'true',
    help: 'Rengeteg új és izgalmas funkción dolgozunk a Primal Premium számára. Amint közelebb kerülünk a megjelenésükhöz, bejelentjük őket. Addig is forduljon hozzánk bizalommal, és tudassa velünk, mit szeretne látni a Primal Premium szolgáltatásban. Minden javaslatot szívesen fogadunk!',
  },
]

const faq = [
  {
    question: 'Hogyan kaphatok támogatást?',
    answer: 'Egyszerűen írjon nekünk e-mailt a support@MaganSzovetseg.net címre, és tüntesse fel az elsődleges nevét az üzenetben. A prémium felhasználók támogatási kérelmei prioritást élveznek, és általában ugyanazon a munkanapon kezelik őket.',
  },
  {
    question: 'Megváltoztathatom a Magánszövetség alapnevemet?',
    answer: 'Igen! Ha meg szeretné változtatni az elsődleges nevét, egyszerűen használja az Elsődleges név módosítása opciót bármely Primal alkalmazás Prémium kezelése szakaszában. Az új neve azonnal működőképes lesz, a régi neve pedig felszabadul, és más felhasználók számára elérhető lesz a regisztrációhoz.',
  },
  {
    question: 'Használnom kell a MaganSzovetseg.Net ellenőrzött nevemet és villámcímemet (Lightning Address)?',
    answer: 'No. As a Primal Premium user you are able to reserve a Primal Name, but you are not required to use it as your nostr verified address (NIP-05), nor the bitcoin lightning address. Simply set any nostr verified address and/or the bitcoin lightning address you wish to use in your Nostr account profile settings.',
  },
  {
    question: 'Határozatlan ideig birtokomban van a MagánSzövetség felhasználónevem?',
    answer: 'Önnek joga van az elsődleges név használatára a MagánSzövetség Premium előfizetés időtartama alatt. Az előfizetés lejárta után 30 nap türelmi időszak áll rendelkezésre, amely alatt az Ön elsődleges neve nem lesz elérhető mások számára a regisztrációhoz. A Primal Legend felhasználók nem lejáró előfizetésekkel rendelkeznek, így korlátlan ideig használhatják az elsődleges nevüket. Kérjük, vegye figyelembe, hogy az összes elsődleges név a Primal tulajdonában van, és bérelhető a felhasználóknak. A Primal fenntartja a jogot bármely név visszavonására, ha azt állapítjuk meg, hogy a név valaki más védjegye, hogy fennáll a személyi adatokkal való visszaélés lehetősége, vagy a Primal által meghatározott egyéb visszaélések miatt. A részletekért tekintse meg a <a data-link="terms">Szolgáltatási feltételeket</a>.',
  },
  {
    question: 'Vásárolhatok több MagánSzövetség nevet?',
    answer: 'Egyelőre nem, de dolgozunk rajta.',
  },
  {
    question: 'A fizetési információim a Nostr-fiókommal vannak társítva?',
    answer: 'Nem. A Magánszövetség Premium megvásárolható iOS App Store alkalmazáson belüli vásárlással, Google Play alkalmazáson belüli vásárlással, vagy közvetlenül a bitcoin Lightningen keresztül a MagánSzövetség webalkalmazáson keresztül. A fizetési módtól függetlenül az Ön fizetési információi nincsenek társítva Nostr-fiókjához.',
  },
  {
    question: 'Meghosszabbíthatom az előfizetésemet? Hogyan működik ez?',
    answer: 'Igen, meghosszabbíthatja előfizetését az általunk támogatott fizetési módok bármelyikével: iOS App Store alkalmazáson belüli vásárlás, Google Play alkalmazáson belüli vásárlás, vagy közvetlenül a bitcoin Lightningen keresztül a Primal webalkalmazáson keresztül. Bármilyen fizetés meghosszabbítja az előfizetést a vásárolt hónapok számával. Például, ha a Primal webalkalmazással vásárol 3 hónapos MagánSzövetség Prémiumot, majd újra előfizet mobileszközén, akkor az előfizetés lejárati dátuma a jövőben négy hónap lesz, és továbbra is minden további havi rendszerességgel kitolódik. fizetés.',
  },
  {
    question: 'If I buy MagánSzövetség Prémium on my phone, will I have access to it on the web?',
    answer: 'Yes. Your MagánSzövetség Prémium subscription is assigned to your Nostr account. Therefore, regardless of the way you choose to subscribe, your Primal Premium subscription will be available to you in all Primal apps: web, iOS, Android.',
  },
  {
    question: 'Hogyan működik a Nostr névjegylista biztonsági mentési funkciója?',
    answer: 'A MagánSzövetség biztonsági másolatot készít a Nostr követőlista 100+ legújabb verziójáról. Ha a követési listát egy másik Nostr alkalmazás törli vagy megsérti, visszaállíthatja azt a Primal Premium felhasználók Nostr Tools szakaszában található Contact List Backup eszközzel.',
  },
  {
    question: 'Hogyan működik a Nostr-fióktartalom biztonsági mentési funkciója?',
    answer: 'A MagánSzövetség archiválja az összes Nostr-tartalom teljes történetét. A tartalom bármely részhalmazát bármikor újra sugározhatja a kiválasztott közvetítőkhöz a Tartalom biztonsági mentése eszközzel a Nostr Tools részben a MagánSzövetség Prémium felhasználók számára.',
  },
  {
    question: 'Milyen egyéb prémium funkciók lesznek elérhetők a jövőben?',
    answer: 'Rengeteg új és izgalmas funkción dolgozunk a MagánSzövetség Prémium számára. Amint közelebb kerülünk a megjelenésükhöz, bejelentjük őket. Addig is forduljon bizalommal hozzánk, és tudassa velünk, mit szeretne látni a MagánSzövetség Prémiumban. Minden javaslatot szívesen fogadunk!',
  },
  {
    question: 'Szeretném támogatni a MagánSzövetséget. Tehetek többet?',
    answer: 'A MagánSzövetségnél nem bízunk a reklámokban. Nem használunk bevételt a felhasználói adatokból. A Nostr ökoszisztéma felvirágoztatása érdekében végzett munkánkat nyílt forráskóddal látjuk el. Ha segíteni szeretne nekünk ennek a munkának a folytatásában, kérjük, tekintse meg, hogyan <a data-link="support">támogasson minket</a>. Köszönjük a teljes MagánSzövetség Csapat nevében! 🙏❤️',
  },
]

const PremiumFeaturesDialog: Component<{
  open: 'features' | 'faq' | undefined,
  setOpen: (v: boolean) => void,
}> = (props) => {

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = createSignal<'features' | 'faq'>('features');

  const onClick = (e: MouseEvent) => {
    const t = e.target;

    // @ts-ignore
    const link = t?.getAttribute('data-link');

    if (!link) return;

    if (link === 'support') {
      props.setOpen(false);
      navigate('/premium/support');
      return;
    }

    if (link === 'terms') {
      props.setOpen(false);
      // @ts-ignore
      window.open(`${location.origin}/terms`, '_blank').focus();
      return;
    }
  };

  onMount(() => {
    window.addEventListener('click', onClick);
  });

  onCleanup(() => {
    window.removeEventListener('click', onClick);
  })

  createEffect(() => {
    const open = props.open;

    if (open !== undefined) {
      setActiveTab(() => open);
    }
  })

  const featureInfo = (featureTik: string) => {
    if (featureTik === 'true') {
      return <div class={styles.checkIcon}></div>
    }

    if (featureTik === 'false') return <></>;

    return <>{featureTik}</>;
  }

  return (
    <AdvancedSearchDialog
      open={props.open !== undefined}
      setOpen={props.setOpen}
      triggerClass="hidden"
      title={
        <Tabs value={activeTab()} onChange={setActiveTab}>
          <Tabs.List class={styles.premiumFeaturesTabs}>
            <Tabs.Trigger class={styles.premiumFeaturesTab} value="features">
              Premium Features
            </Tabs.Trigger>
            <Tabs.Trigger class={styles.premiumFeaturesTab} value="faq">
              Premium FAQ
            </Tabs.Trigger>
            <Tabs.Indicator class={styles.premiumFeaturesTabIndicator} />
          </Tabs.List>
        </Tabs>
      }
    >
      <div class={styles.premiumFeatures}>

        <Tabs value={activeTab()} >
          <Tabs.Content value="features" >
            <div class={styles.tabContentPremiumFeatures}>
              <table>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Primal Free</th>
                    <th>Primal Premium</th>
                  </tr>
                </thead>

                <tbody>
                  <For each={premiumFeatures}>
                    {(feature, index) => (
                      <tr>
                        <td class={styles.fname}>
                          <span>{feature.name}</span>
                          <Show when={feature.help}>
                            <HelpTip above={true} zIndex={index() + 1}>
                              <span>{feature.help}</span>
                            </HelpTip>
                          </Show>
                        </td>
                        <td class={styles.ftick}>{featureInfo(feature.free)}</td>
                        <td class={styles.ftick}>{featureInfo(feature.premium)}</td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Tabs.Content>
          <Tabs.Content value="faq" >
            <div class={styles.tabContentPremiumFeatures}>
                <For each={faq}>
                  {q => (
                    <div class={styles.faq}>
                      <div class={styles.question}>
                        {q.question}
                      </div>
                      <div class={styles.answer} innerHTML={q.answer}>
                      </div>
                    </div>
                  )}
                </For>
              </div>
          </Tabs.Content>
        </Tabs>

        <div class={styles.premiumFeaturesFooter}>
          <ButtonSecondary
            light={true}
            onClick={() => props.setOpen(false)}
          >
            Close
          </ButtonSecondary>
        </div>
      </div>
    </AdvancedSearchDialog>
  );
}

export default PremiumFeaturesDialog
