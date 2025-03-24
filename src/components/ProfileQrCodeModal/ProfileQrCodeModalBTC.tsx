// src/components/ProfileQrCodeModal/ProfileQrCodeModalBTC.tsx // A BTC CÍMRE KÉSZÍTSEN EGY QR KODOT

import { useIntl } from '@cookbook/solid-intl';
import { Component, Show } from 'solid-js';
import { hookForDev } from '../../lib/devTools';
import { profile as tProfile } from '../../translations';
import AdvancedSearchDialog from '../AdvancedSearch/AdvancedSearchDialog';
import Avatar from '../Avatar/Avatar';
import ButtonCopy from '../Buttons/ButtonCopy';
import QrCodeBTC from '../QrCode/QrCodeBTC'; //QR code
import styles from './ProfileQrCodeModal.module.scss';

interface Profile {
  msn_btc?: string; // Optional Bitcoin address from the user's profile
}

const isValidBitcoinAddress = (address: string): boolean => {
  const btcRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/;
  return btcRegex.test(address);
};

const ProfileQrCodeModalBTC: Component<{
  open?: boolean;
  profile: Profile;
  onClose?: () => void;
}> = (props) => {
  const intl = useIntl();

  return (
    <AdvancedSearchDialog
      open={props.open}
      setOpen={(isOpen: boolean) => !isOpen && props.onClose && props.onClose()}
      title={
        <div class={styles.userInfo}>
          <div class={styles.details}>
            <div class={styles.name}>
              {intl.formatMessage({ id: 'profile.qrModalBTC.title', defaultMessage: 'Bitcoin (BTC) Tárca címem' })}{' '}
            </div>
          </div>
        </div>
      }
      triggerClass={styles.hidden}
    >
      <div class={styles.modalWrapper} role="dialog" aria-modal="true">
        <div class={styles.ProfileQrCodeModal}>
          <Show
            when={
              props.profile?.msn_btc &&
              typeof props.profile.msn_btc === 'string' &&
              props.profile.msn_btc.trim() !== '' &&
              isValidBitcoinAddress(props.profile.msn_btc)
            }
            fallback={
              <div class={styles.noData}>
                {intl.formatMessage({
                  id: 'profile.qrModalBTC.noBtcAddress',
                  defaultMessage: 'No valid Bitcoin address found in profile.',
                })}
              </div>
            }
          >
            {/* 
            <div class={styles.qrCode}>
              <QrCodeBTC data={`bitcoin:${props.profile.msn_btc}`} type="bitcoin" />
            </div>

            */}
            <div class={styles.keys}>
              <div class={styles.keyEntry}>
              <div class={styles.label}>
                {intl.formatMessage({ id: 'profile.qrModalBTC.btcAddress', defaultMessage: 'Másolás (katt rá)' })}{':\u00A0'}
              </div>
                <div class={styles.value}>
                  <ButtonCopy
                    light={true}
                    copyValue={props.profile.msn_btc}
                    labelBeforeIcon={true}
                    label={props.profile.msn_btc}
                  />
                </div>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </AdvancedSearchDialog>
  );
};

export default hookForDev(ProfileQrCodeModalBTC);
