import { useIntl } from '@cookbook/solid-intl';
import { batch, Component, createEffect, For, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { useAccountContext } from '../../contexts/AccountContext';
import { truncateNumber } from '../../lib/notifications';
import { DVMMetadata, NoteActions, PrimalDVM, PrimalUser, ZapOption } from '../../types/primal';
import Avatar from '../Avatar/Avatar';
import DvmFooterActionButton from '../Note/NoteFooter/DvmFooterActionButton';
import NoteFooterActionButton from '../Note/NoteFooter/NoteFooterActionButton';
import { useToastContext } from '../Toaster/Toaster';
import { toast as t } from '../../translations';
import styles from './FeedMarketPlace.module.scss';
import { canUserReceiveZaps, zapDVM } from '../../lib/zap';
import { CustomZapInfo, useAppContext } from '../../contexts/AppContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { lottieDuration } from '../Note/NoteFooter/NoteFooter';
import { A } from '@solidjs/router';
import ButtonFeedSupport from '../Buttons/ButtonFeedSupport'; // Importáljuk az új komponenst


// Feed-ekhez tartozó URL-ek
const feedUrls: Record<string, string> = {
  'Egyesítsük Erőinket Mozgalom (EEM)': 'https://example.com/szkitatv',
  'Nexus TV': 'https://nexustv.hu/tamogatas/',
  'B-Terv - Legyen B-terved az önellátás': 'https://www.donably.com/b-terv',
  'Szkíta Egyesület': 'https://www.donably.com/szkitatv',
  //'Fluffy Frens': 'https://example.com/fluffy-frens',
  // További feed-ek és URL-ek
};

const FeedMarketItem: Component<{
  dvm: PrimalDVM | undefined,
  author: PrimalUser | undefined,
  stats?: { likes: number, satszapped: number },
  metadata?: DVMMetadata,
  actions?: NoteActions,
  size?: 'header' | 'list',
  commonUsers?: PrimalUser[],
  onClick?: (dvm: PrimalDVM | undefined) => void,
}> = (props) => {
  const account = useAccountContext();
  const toast = useToastContext();
  const intl = useIntl();
  const app = useAppContext();
  const settings = useSettingsContext();

  const [state, setState] = createStore({
    likes: 0,
    satszapped: 0,
    liked: false,
    zapped: false,
    isZapping: false,
    zapFailed: false,
  });

  const size = () => props.size || 'list';

  // Feed nevének lekérése
  const feedName = () => props.dvm?.name || '';

  // Feed URL-ének lekérése
  const feedUrl = () => feedUrls[feedName()] || null;

  createEffect(() => {
    if (props.stats) {
      setState(() => ({
        likes: props.stats?.likes || 0,
        satszapped: props.stats?.satszapped || 0,
      }));
    }
    if (props.actions) {
      setState(() => ({
        liked: props.actions?.liked || false,
        zapped: props.actions?.zapped || false,
      }));
    }
  });

  const likes = () => state.likes;
  const satszapped = () => state.satszapped;

  const isPaid = () => {
    if (!props.dvm) return false;

    const { amount, primalVerifiedRequired } = props.dvm;
    const amountValue = parseInt(amount);
    return (amount !== 'free' && !isNaN(amountValue) && amountValue > 0) || primalVerifiedRequired;
  };

  const doLike = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!account || !props.dvm) {
      return;
    }

    if (!account.hasPublicKey()) {
      account.actions.showGetStarted();
      return;
    }

    if (!account.proxyThroughPrimal && account.relays.length === 0) {
      toast?.sendWarning(
        intl.formatMessage(t.noRelaysConnected),
      );
      return;
    }

    const success = await account.actions.addLike(props.dvm);

    if (success) {
      setState((state) => ({
        likes: state.likes + 1,
        liked: true,
      }));
    }
  };

  let quickZapDelay = 0;

  const customZapInfo: () => CustomZapInfo = () => ({
    dvm: props.dvm ? { ...props.dvm, user: props.author } : undefined,
    onConfirm: onConfirmZap,
    onSuccess: onSuccessZap,
    onFail: onFailZap,
    onCancel: onCancelZap,
  });

  const onConfirmZap = (zapOption: ZapOption) => {
    app?.actions.closeCustomZapModal();
    setState('satszapped', (sz) => sz + (zapOption.amount || 0));
    setState('zapped', () => true);
  };

  const onSuccessZap = (zapOption: ZapOption) => {
    app?.actions.closeCustomZapModal();
    app?.actions.resetCustomZap();
    setState('zapped', () => true);
  };

  const onFailZap = (zapOption: ZapOption) => {
    app?.actions.closeCustomZapModal();
    app?.actions.resetCustomZap();
    setState('satszapped', (sz) => sz - (zapOption.amount || 0));
    setState('zapped', () => props.actions?.zapped || false);
  };

  const onCancelZap = (zapOption: ZapOption) => {
    app?.actions.closeCustomZapModal();
    app?.actions.resetCustomZap();
    setState('satszapped', (sz) => sz - (zapOption.amount || 0));
    setState('zapped', () => props.actions?.zapped || false);
  };

  const startZap = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!account?.hasPublicKey()) {
      account?.actions.showGetStarted();
      setState('isZapping', () => false);
      return;
    }

    if (!account.proxyThroughPrimal && account.relays.length === 0) {
      toast?.sendWarning(
        intl.formatMessage(t.noRelaysConnected),
      );
      return;
    }

    if (!canUserReceiveZaps(props.author)) {
      toast?.sendWarning(
        intl.formatMessage(t.zapDVMUnavailable),
      );
      setState('isZapping', () => false);
      setState('zapFailed', () => true);
      return;
    }

    quickZapDelay = setTimeout(() => {
      app?.actions.openCustomZapModal(customZapInfo());
      setState('isZapping', () => true);
    }, 500);
  };

  const commitZap = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    clearTimeout(quickZapDelay);

    if (state.zapFailed) {
      setState('zapFailed', () => false);
      return;
    }

    if (!account?.hasPublicKey()) {
      account?.actions.showGetStarted();
      return;
    }

    if ((!account.proxyThroughPrimal && account.relays.length === 0)) {
      return;
    }

    if (app?.customZap === undefined) {
      doQuickZap();
    }
  };

  const doQuickZap = async () => {
    if (!account?.hasPublicKey()) {
      account?.actions.showGetStarted();
      return;
    }

    const amount = settings?.defaultZap.amount || 10;
    const message = settings?.defaultZap.message || '';
    const emoji = settings?.defaultZap.emoji;

    setState('satszapped', (sz) => sz + (amount || 0));
    setState('isZapping', () => true);

    setTimeout(async () => {
      if (!props.dvm || !props.author) return;
      const success = await zapDVM(props.dvm, props.author, account.publicKey, amount, message, account.activeRelays);

      setState('isZapping', () => false);

      if (success) {
        customZapInfo().onSuccess({
          emoji,
          amount,
          message,
        });
        return;
      }

      customZapInfo().onFail({
        emoji,
        amount,
        message,
      });
    }, lottieDuration());
  };

  return (
    <div
      data-id={props.dvm?.id}
      class={`${styles.feedMarketPlaceItem} ${size() === 'header' ? styles.header : ''}`}
      onClick={() => props.onClick && props.onClick(props.dvm)}
    >
      <div class={styles.left}>
        <div class={styles.avatar}>
          <Avatar size="vs2" src={props.dvm?.picture || props.dvm?.image || ''} />
        </div>
        <div class={styles.paid}>
          <Show
            when={isPaid()}
            fallback={<div class={styles.freeToken}>Díjmentes</div>}
          >
            <div class={styles.paidToken}>Fizetős</div>
          </Show>
        </div>
      </div>
      
      <div class={styles.right}>
        <div class={styles.info}>
          <div class={styles.title}>{feedName()}</div>
          <div class={styles.about}>{props.dvm?.about || ''}
          <br></br>
          
          <Show when={feedUrl()}>
           <div class={styles.feedButton}>
           <ButtonFeedSupport href={feedUrl()} target="_blank">Felajánlás</ButtonFeedSupport>
            </div>
          </Show>




          </div>
  

        </div>



        <Show when={props.metadata?.isPrimal && size() === 'header'}>
          <div class={styles.createdBy}>
            <div class={styles.primalLogo}></div>
            <span>Léterhozó:</span> <span class={styles.authorName}>MagánSzövetség</span>
          </div>
        </Show>

        <div class={styles.actions}>
          <div class={styles.commonUsersList}>
            <For each={props.commonUsers}>
              {user => (
                <A
                  href={app?.actions.profileLink(user.npub) || ''}
                  class={styles.avatar}
                  onClick={(e: MouseEvent) => {e.stopPropagation(); return true;}}
                >
                  <Avatar size="micro" user={user} />
                </A>
              )}
            </For>
          </div>

          <div class={styles.stats}>
            <DvmFooterActionButton
              dvm={props.dvm}
              onClick={doLike}
              type="like"
              highlighted={state.liked || account?.likes.includes(props.dvm?.id || '')}
              label={likes() === 0 ? '' : truncateNumber(likes(), 2)}
              title={likes().toLocaleString()}
            />
            <DvmFooterActionButton
              dvm={props.dvm}
              onClick={(e: MouseEvent) => e.stopPropagation()}
              onMouseDown={startZap}
              onMouseUp={commitZap}
              onTouchStart={startZap}
              onTouchEnd={commitZap}
              type="zap"
              highlighted={state.zapped || state.isZapping}
              label={satszapped() === 0 ? '' : truncateNumber(satszapped(), 2)}
              title={satszapped().toLocaleString()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedMarketItem;