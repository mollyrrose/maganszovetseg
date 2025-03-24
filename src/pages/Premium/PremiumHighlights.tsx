import { useIntl } from '@cookbook/solid-intl';
import { Component, Match, Show, Switch } from 'solid-js';
import ButtonLink from '../../components/Buttons/ButtonLink';
import ButtonPremium from '../../components/Buttons/ButtonPremium';

import { premium as t } from '../../translations';

import styles from './Premium.module.scss';
import { PrimalUser } from '../../types/primal';


const PremiumHighlights: Component<{
  onStart?: () => void,
  onMore?: () => void,
  pubkey?: string | undefined,
  user?: PrimalUser | undefined,
  isOG?: boolean,
}> = (props) => {
  const intl = useIntl();

  const isGuest = () => !props.pubkey;

  const hasNoMetadata = () => props.pubkey && !props.user;

  return (
    <div class={styles.premiumHighlights}>
      <div class={styles.ogCaption}>
      Válj Prémium Felhasználóvá!
      </div>
      <div class={styles.premiumHighlightInfo}>
        <div class={styles.highlights}>
          <div class={styles.highlight}>
            <div class={styles.purpleCheckBig}></div>
            <div class={styles.perk}>
              <div class={styles.perkTitle}>
                Prémium Felhasználói Előnyök
              </div>
              <ul class={styles.perkItems}>
                <li>Ellenőrzött noszter cím</li>
                <li>Bitcoin Lightning cím</li>
                <li>Prémium profil</li>
              </ul>
            </div>
          </div>

          <div class={styles.highlight}>
            <div class={styles.purpleOstrich}></div>

            <div class={styles.perk}>
              <div class={styles.perkTitle}>
                További Előnyök
              </div>
              <ul class={styles.perkItems}>
                <li>Nagyméretű média-tartalomfeltöltés</li>
                <li>Részletes globális keresés a noszter rendszerben</li>
                <br></br>
                <ButtonLink onClick={props.onMore}>És még jópár egyéb előny...
                <br></br>KATTINS IDE a részletekért!</ButtonLink>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class={styles.pricingSummary}>
        <div>
          <div class={styles.price}>1.500 Ft/hó</div>
          <div class={styles.duration}>3 hónapra</div>
        </div>
        <div class={styles.or}>v.</div>
        <div>
          <div class={styles.price}>18.000 Ft /hó</div>
          <div class={styles.duration}>12 hónapra</div>
        </div>
      </div>

      <div class={styles.premiumStart}>
        <Switch>
          <Match when={isGuest()}>
            <>Kezdd azzal, hogy létrehozol egy MagánSzövetség fiókot:</>
          </Match>
          <Match when={hasNoMetadata()}>
            <>Kezdd azzal, hogy elkezded a profilodat szerkeszteni:</>
          </Match>
          <Match when={true}>
            <>Kezdd azzal, hogy regisztrálsz egy Magánszövetség.Net nevet:</>
          </Match>
        </Switch>
      </div>

      <ButtonPremium
        onClick={props.onStart}
      >
        <Switch>
          <Match when={isGuest()}>
            <>Fiók Létrehozása</>
          </Match>
          <Match when={hasNoMetadata()}>
            <>Edit profile</>
          </Match>
          <Match when={true}>
            <>{intl.formatMessage(t.actions.start)}</>
          </Match>
        </Switch>
      </ButtonPremium>
    </div>
  );
}

export default PremiumHighlights;
