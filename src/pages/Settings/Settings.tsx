import { Component } from 'solid-js';
import styles from './Settings.module.scss';
import styles2 from '../Downloads.module.scss';

import Wormhole from '../../components/Wormhole/Wormhole';
import { useIntl } from '@cookbook/solid-intl';
import Search from '../../components/Search/Search';
import { settings as t } from '../../translations';
import StickySidebar from '../../components/StickySidebar/StickySidebar';
import SettingsSidebar from '../../components/SettingsSidebar/SettingsSidebar';
import PageTitle from '../../components/PageTitle/PageTitle';
import { downloads as td } from '../../translations';

const Settings: Component<any> = (props) => {

  const intl = useIntl();

  return (
    <div class={styles.settingsContainer}>
      <PageTitle title={intl.formatMessage(t.title)} />

      <Wormhole to="search_section">
        <Search />
      </Wormhole>

      <StickySidebar>
        <SettingsSidebar />
      <div class={styles.downloadsSidebar}>
          <div class={styles.title}>
            {intl.formatMessage(td.links.title2)}
          </div>

          <div class={styles.list}>
  <div class={styles.buttonContainer}>
    <button
      class={styles.secondaryButton}
      onClick={() => window.open('https://www.donably.com/maganszovetseg', '_blank')}
    >
Forintban kártyával
    </button>

    <button
      class={styles.bitcoinButton}
      onClick={() => navigator.clipboard.writeText('bc1qry8c2sdqg2sq80gle2d0l7e6gy0hx2pxzlzmv8')}
    >
      Bitcoin cím másol.
    </button>
  </div>
</div>
          <div class={styles2.inputLabel}>
            <p style={{ "font-size": "100%", "line-height": "1.4", "text-align": "justify" }}>
              <strong>Miért</strong> segít felajánlásod? Mert a MagánSzövetség.Net-et hobbiból, a közös jó iránti elkötelezettségünkből tartjuk fenn, saját zsebből finanszírozva a szerver havidíját és az oldal fejlesztésének programozói költségét. Szervezni fogjuk magánerőből a MagánSzövetség Mozgalmat ország szerte előadásokat tartva. Terjesztjük a pozitivitás Értékrend Minimumát, a szabadságot, békét és életet támogató eszméket! <br/><br/>
              Segíts egy picivel! Csináljuk együtt! Sok kicsi sokra megy.
            </p>
          </div>



       </div>

      </StickySidebar>



      {props.children}
    </div>
  )
}

export default Settings;
