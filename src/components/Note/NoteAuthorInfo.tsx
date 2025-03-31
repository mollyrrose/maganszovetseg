import { Component, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { PrimalUser } from '../../types/primal';
import { useThreadContext } from '../../contexts/ThreadContext';
import { useAppContext } from '../../contexts/AppContext';
import { useIntl } from '@cookbook/solid-intl';
import { authorName, nip05Verification } from '../../stores/profile';
import { hookForDev } from '../../lib/devTools';
import { date } from '../../lib/dates';
import VerificationCheck from '../VerificationCheck/VerificationCheck';
import styles from './Note.module.scss';

const NoteAuthorInfo: Component<{
  author: PrimalUser,
  time: number,
  id?: string,
}> = (props) => {
  const threadContext = useThreadContext();
  const app = useAppContext();
  const intl = useIntl();

  //console.log('Author pubkey:', props.author.pubkey);
  //console.log('Profile link:', app?.actions.profileLink(props.author.pubkey) || 'empty');

  return (
    <div class={styles.authorInfo}>
      <A href={app?.actions.profileLink(props.author.pubkey) || ''}>
        <span class={styles.userName}>
          {authorName(props.author)}
        </span>
      </A>
 {/*
      <VerificationCheck user={props.author} fallback={
        <div class={styles.verificationFailed}></div>
      } />

      <Show when={props.author.nip05}>
        <span
          class={styles.verification}
          title={props.author.nip05}
        >

           {nip05Verification(props.author)} 
        </span>
      </Show>
*/}
      <span
        class={styles.time} //MAGYAR IDŐ
        //title={date(props.time).date.toLocaleString()}
        title={date(props.time).label}
      >
        <div class={styles.ellipsisIcon}></div>
        {date(props.time).label}
      </span>
    </div>
  );
};

export default hookForDev(NoteAuthorInfo);