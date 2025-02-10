import { useIntl } from '@cookbook/solid-intl';
import { Component, Show } from 'solid-js';
import ButtonLink from '../../components/Buttons/ButtonLink';
import { shortDate } from '../../lib/dates';

import { premium as t } from '../../translations';
import { formatStorage } from '../../utils';
import { PremiumStore } from './Premium';

import styles from './Premium.module.scss';


const PremiumSidebarInactve: Component<{
  onOpenFAQ?: () => void,
}> = (props) => {

  return (

    <div class={styles.premiumSidebar}>
    <div class={styles.premiumSidebarTitle}>
      Miért jó a Prémium Felhasználói előfizetés?
    </div>

    <div class={styles.premiumSidebarDescription}>
      <p>
      Legyen Noszter kiemelt-felhasználó és segítsen a jövő alakításában! Az olyan nyílt protokollok, mint a Nostr, lehetőséget adnak arra, hogy visszanyerjük az online életünk feletti irányítást.
      </p>

      <p>
      A MagánSzövetségnél nem támaszkodunk a reklámra. Nem használjuk pénzben a felhasználói adatokat. A felhasználóink a mi ügyfeleink. Kizárólag arra összpontosítunk, hogy a lehető legjobb terméket készítsük a felhasználóink számára. Minden munkánkat nyílt forráskódúvá tesszük, hogy segítsük a Nostr ökoszisztéma virágzását. A MagánSzövetség Premiumra való feliratkozással lehetővé teszed számunkra, hogy folytathassuk a Noszter fejlesztését.
      </p>

      <p>
      Légy az a változás, amit látni szeretnél a világban. Ha nem akarsz a termék lenni, fontold meg, hogy te leszel a vásárló.
      </p>

      <p>
        Kérdésed van?&nbsp;
        <ButtonLink onClick={props.onOpenFAQ}>Olvasd el a Kérdés-Válaszok listát.</ButtonLink>
      </p>
    </div>
  </div>
  );
}

export default PremiumSidebarInactve;
