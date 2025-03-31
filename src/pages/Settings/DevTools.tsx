import { Component, Show, createEffect, createSignal, onMount } from 'solid-js';
import styles from './Settings.module.scss';

import { useIntl } from '@cookbook/solid-intl';
import { settings as t } from '../../translations';
import PageCaption from '../../components/PageCaption/PageCaption';
import { A } from '@solidjs/router';
import PageTitle from '../../components/PageTitle/PageTitle';
import Checkbox from '../../components/Checkbox/Checkbox';
import ButtonLink from '../../components/Buttons/ButtonLink';
import { storageName } from '../../lib/localStore';
import { useAccountContext } from '../../contexts/AccountContext';
import CheckBox2 from '../../components/Checkbox/CheckBox2';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';

const DevTools: Component = () => {
  const account = useAccountContext();
  const intl = useIntl();

  const [isDevMode, setIsDevMode] = createSignal<boolean>(localStorage.getItem('devMode') === 'true');
  const [isStorageAvailable, setIsStorageAvailable] = createSignal<boolean>(true);
  const [hasNsec, setHasNsec] = createSignal<boolean>(false);
  const [confirmLSReset, setConfirmLSReset] = createSignal(false);
  const [confirmNsecReset, setConfirmNsecReset] = createSignal(false);

  onMount(() => {
    checkLocalStorage();
    checkNsec();
  });

  createEffect(() => {
    localStorage.setItem('devMode', `${isDevMode()}`)
  })

  const checkLocalStorage = () => {
    if (!account) return false;

    const name = storageName(account.publicKey);

    const isAvailable = localStorage.getItem(name) !== null;

    setIsStorageAvailable(() => isAvailable);
  }

  const checkNsec = () => {
    if (!account) return false;

    const isAvailable = localStorage.getItem('primalSec') !== null;

    setHasNsec(() => isAvailable);
  }

  const clearLocalStore = () => {
    if (!account) return;

    const name = storageName(account.publicKey);

    localStorage.removeItem(name);

    window.location.reload();
  };

  const clearAllStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <>
      <PageTitle title={`${intl.formatMessage(t.devTools)} ${intl.formatMessage(t.title)}`} />

      <PageCaption>
        <A href='/settings' >{intl.formatMessage(t.index.title)}</A>:&nbsp;
        <div>{intl.formatMessage(t.devTools)}</div>
      </PageCaption>
      <div class={styles.settingsContent}>
        <div style="display: flex; flex-direction: column; gap:12px;">
          <div class={styles.moderationDescription}>
            Ezek a beállítások a műszakilag hozzáértő felhasználók számára készültek. Kérjük, ne változtassa meg őket, hacsak nem fejlesztő vagy Nostr-szakértő.
          </div>

          <div class={styles.devToolsList}>
            <div class={styles.devToolsItem}>
              <div>Local Storage</div>
              <ButtonLink
                onClick={() => setConfirmLSReset(true)}
                disabled={!isStorageAvailable()}
              >
                Reset Local Storage
              </ButtonLink>
            </div>

            <div class={styles.devToolsItem}>
              <div>Developer Mode</div>
              <CheckBox2
                checked={isDevMode()}
                onChange={() => setIsDevMode((v) => !v)}
                label="Enable Dev Mode"
              />
            </div>

            <Show when={hasNsec()}>
              <div class={styles.devToolsItem}>
                <div>Remove Locally Stored nsec (logout)</div>
                <ButtonLink onClick={() => setConfirmNsecReset(true)} >
                  Remove nsec
                </ButtonLink>
              </div>
            </Show>

            <Show when={isDevMode()}>
              <div class={styles.devToolsItem}>
                <div>Local Storage</div>
                <ButtonLink
                  onClick={clearAllStorage}
                >
                  Clear Local Storage
                </ButtonLink>
              </div>
            </Show>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmLSReset()}
        title="Helyi tárhely alaphelyzetbe állítása"
        description="Biztosan visszaállítja a helyi tárhelyet?"
        consfirmLabel="Igen"
        abortLabel="Nem"
        onConfirm={() => { clearLocalStore(); setConfirmLSReset(false); }}
        onAbort={() => setConfirmLSReset(false)}
      />
      <ConfirmModal
        open={confirmNsecReset()}
        title="Remove Local Nsec"
        description="Ha nem használsz nostr kiterjesztést, akkor ez a művelet a kijelentkezést eredményezi. Biztosan eltávolítja a helyileg tárolt nsec-et?"
        consfirmLabel="Igen"
        abortLabel="Nem"
        onConfirm={() => {
          account?.actions.logout();
          setHasNsec(() => false);
          setConfirmNsecReset(false);
          location.reload();
        }}
        onAbort={() => setConfirmNsecReset(false)}
      />
    </>
  )
}

export default DevTools;
