import { Component, onMount, Show } from 'solid-js';
import { useIntl } from '@cookbook/solid-intl';
import { isAndroid, isIOS } from '@kobalte/utils';

import Branding from '../components/Branding/Branding';
import Wormhole from '../components/Wormhole/Wormhole';
import Search from '../components/Search/Search';

import appstoreImg from '../assets/images/appstore_download.svg';
import playstoreImg from '../assets/images/playstore_download.svg';
import primalQR from '../assets/images/primal_qr.png';

import gitHubLight from '../assets/icons/github_light.svg';
import gitHubDark from '../assets/icons/github.svg';

import primalDownloads from '../assets/images/video_placeholder.png';

import { downloads as t } from '../translations';
import StickySidebar from '../components/StickySidebar/StickySidebar';
import { appStoreLink, playstoreLink, apkLink } from '../constants';
import ExternalLink from '../components/ExternalLink/ExternalLink';
import PageCaption from '../components/PageCaption/PageCaption';
import PageTitle from '../components/PageTitle/PageTitle';
import { useSettingsContext } from '../contexts/SettingsContext';

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
  };

  const stringToDate = (dateString: string) => {
    return (new Date(dateString)).getTime();
  };

  return (
    <div class="downloadsContainer">
      <Wormhole to="search_section">
        <Search />
      </Wormhole>

      <StickySidebar>
        <div class="downloadsSidebar">
          <div class="title">
            {intl.formatMessage(t.links.title)}
          </div>

          <div class="list">
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

      

      <div class="downloadsContent">
        <br />
        <div class="qrCaption">
        
          A <strong>MagánSzövetség</strong> egy magánjog alapján szerveződő <strong>természetes személyek szövetsége</strong>.
          MagánSzövetség.Net fiókod létrehozásával kijelented, hogy<strong> egyetértesz értékrendünkkel </strong>.
          Ennek lényege, hogy éberséggel és örömteli látásmóddal támogatjuk a pozitivitást, a pozitív értékeket.
          A negativitást nem támogatjuk. Rámutatunk annyira finoman és intelligensen ahogy lehetséges, de azon túl nem foglalkozunk vele. Mi egyszerűen tesszük a saját dolgunkat a világ jövője és minden lény javára.
      
        </div>

        <div class="downloadContainer" style={{ display: 'flex', gap: '10px' }}>

          {/* Left QR Code with smaller font size */}
          <div class="qrCode" style={{ fontSize: '10px'  }}>
            <a href="/assets/docs/I._ÉRTÉKREND_MINIMUM.pdf" download>
              <img
                src="/icons/DownloadPdf_nh.png" // Default image
                width={100}
                alt="Töltsd le a PDF-et!"
                onMouseEnter={(e) => e.currentTarget.src = "/icons/DownloadPdf.png"} // Image on hover
                onMouseLeave={(e) => e.currentTarget.src = "/icons/DownloadPdf_nh.png"} // Reset to default
              />
            </a>
            <div class="qrCaption" style={{ fontSize: '10px', marginTop: '18px', textAlign: 'center' }}>
              <strong>I. Értékrend Minimum</strong><br /><br />
              <span style={{ fontSize: '10px' }}>
                Amiben mindannyian egyetértenünk a Magánszövetség.Net-en. 
                Ezt írod alá digitálisan amikor létrehozod a MaganSzövetség.Net fiókodat.
              </span>
            </div>
          </div>

          {/* Right QR Code with smaller font size */}
          <div class="qrCode" style={{ fontSize: '10px'  }}>
            <a href="/assets/docs/II._ÉRTÉKREND_MÉDIUM.pdf" download>
              <img
                src="/icons/DownloadPdf_nh.png" // Default image
                width={100}
                alt="Töltsd le a PDF-et!"
                onMouseEnter={(e) => e.currentTarget.src = "/icons/DownloadPdf.png"} // Image on hover
                onMouseLeave={(e) => e.currentTarget.src = "/icons/DownloadPdf_nh.png"} // Reset to default
              />
            </a>
            <div class="qrCaption" style={{ fontSize: '10px', marginTop: '18px', textAlign: 'center' }}>
              <strong>II. Értékrend Médium</strong><br /><br />
              <span style={{ fontSize: '10px' }}>
                Opcionálisan egyetérthetsz.
              </span>
            </div>
          </div>

        </div>
      </div>






    </div>
  );
};

export default Downloads;
