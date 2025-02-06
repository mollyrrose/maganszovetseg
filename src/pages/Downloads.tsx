import { Component, onMount, Show } from 'solid-js';
import Branding from '../components/Branding/Branding';
import Wormhole from '../components/Wormhole/Wormhole';
import Search from '../components/Search/Search';

import appstoreImg from '../assets/images/appstore_download.svg';
import playstoreImg from '../assets/images/playstore_download.svg';
import primalQR from '../assets/images/primal_qr.png';

import gitHubLight from '../assets/icons/github_light.svg';
import gitHubDark from '../assets/icons/github.svg';

import primalDownloads from '../assets/images/video_placeholder.png';

import styles from './Downloads.module.scss';
import { downloads as t } from '../translations';
import { useIntl } from '@cookbook/solid-intl';
import StickySidebar from '../components/StickySidebar/StickySidebar';
import { appStoreLink, playstoreLink, apkLink } from '../constants';
import ExternalLink from '../components/ExternalLink/ExternalLink';
import PageCaption from '../components/PageCaption/PageCaption';
import PageTitle from '../components/PageTitle/PageTitle';
import { useSettingsContext } from '../contexts/SettingsContext';
import { isAndroid, isIOS } from '@kobalte/utils';

const Downloads: Component = () => {

  const intl = useIntl();
  const settings = useSettingsContext();

  const iosRD = () => stringToDate(settings?.mobileReleases.ios.date || '0');
  const iosVersion = () => settings?.mobileReleases.ios.version || '0';

  const andRD = () => stringToDate(settings?.mobileReleases.android.date || '0');
  const andVersion = () => settings?.mobileReleases.android.version || '0';

  const today = () => (new Date()).getTime();

  onMount(() => {
    if (today() > iosRD()) {
      localStorage.setItem('iosDownload', iosVersion());
    }

    if (today() > andRD()) {
      localStorage.setItem('andDownload', andVersion());
    }
  });

  const displayDate = (dateValue: number) => {
    if (isNaN(dateValue)) return '';

    const date = new Date(dateValue);

    return new Intl.DateTimeFormat("en-US", {
      year: 'numeric', month: 'short', day: 'numeric',
    }).format(date);
  }

  const stringToDate = (dateString: string) => {
    return (new Date(dateString)).getTime();
  }

  return (
    <div class={styles.downloadsContainer}>
      <Wormhole
        to="search_section"
      >
        <Search />
      </Wormhole>

      <StickySidebar>
        <div class={styles.downloadsSidebar}>

          <div class={styles.title}>
            {intl.formatMessage(t.links.title)}
          </div>
          <div class={styles.list}>
            <ExternalLink
              darkIcon={gitHubLight}
              lightIcon={gitHubDark}
              label={intl.formatMessage(t.links.webApp)}
              href='https://github.com/PrimalHQ/primal-web-app'
            />


          </div>
        </div>
      </StickySidebar>

      <PageTitle title={intl.formatMessage(t.title)} />

      <PageCaption title={intl.formatMessage(t.title)} />

      <div class={styles.downloadsContent}>

      <br></br>
        <div class={styles.qrCaption}>
            A <strong>MagánSzövetség</strong> egy <strong>Magánjog</strong> alapján szerveződő <strong>természetes személyek szövetsége</strong>.
             MagánSzövetség.Net fiókod létrehozásával kijelented, hogy span <strong>egyetértesz értékrendünkkel</strong>.
             Ennek lényege, hogy éberséggel és örömteli látásmóddal támogatjuk a pozitivitást, a pozitív értékeket.
             A negativitást nem támogatjuk. Rámutatunk annyira finoman és intelligensen ahogy lehetséges, de azon túl nem foglalkozunk vele. Mi egyszerűen tesszük a saját dolgunkat a világ jövője és minden lény javára.
             </div>


        <div class={`${styles.appInfo} ${isIOS() ? styles.appInfoReverse : ''}`}>

          <Show when={!isAndroid() && !isIOS()}>
          <div class={styles.downloadContainer}>

          <div class={styles.qrCode}>
           <a href="./src/assets/docs/I._ÉRTÉKREND_MINIMUM.pdf" download>
           <img src="./src/assets/icons/DownloadPdf.png" width={180} />
          </a>
           <div class={styles.qrCaption}>
             I. Értékrend Minimum <br></br><br></br>
             Amiben mindannyian egyetértenünk a Magánszövetség.Net-en.
          </div>
          </div>
          <br></br>
          <div class={styles.qrCode}>
            <a href="./src/assets/docs/II._ÉRTÉKREND_MÉDIUM.pdf" download>
            <img src="./src/assets/icons/DownloadPdf.png" width={180} />
             </a>
             <div class={styles.qrCaption}>
             II. Értékrend Médium <br></br><br></br>
             Amivel egyetérthetsz, ha szeretnél. (Opcionálisan)
             </div>
            </div>
          </div>

          </Show>



        </div>
      </div>






    </div>
  );
}

export default Downloads;
