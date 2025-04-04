import { Component, For, onMount, Show } from 'solid-js';

import {
  SelectionOption
} from '../../types/primal';

import styles from './HomeSidebar.module.scss';
import SmallNote from '../SmallNote/SmallNote';
import { useAccountContext } from '../../contexts/AccountContext';
import { hookForDev } from '../../lib/devTools';
import SelectionBox from '../SelectionBox/SelectionBox';
import Loader from '../Loader/Loader';
import { readHomeSidebarSelection, saveHomeSidebarSelection } from '../../lib/localStore';
import { useHomeContext } from '../../contexts/HomeContext';
import ShortNoteSkeleton from '../Skeleton/ShortNoteSkeleton';
import { Transition } from 'solid-transition-group';
import SelectionBox2 from '../SelectionBox/SelectionBox2';

const sidebarOptions = [
  {
    label: 'Népszerű (az elmúlt 24 órában)',
    value: 'trending_24h',
    id: 'trending_24h',
  },
  {
    label: 'Népszerű (az elmúlt 12 órában)',
    value: 'trending_12h',
    id: 'trending_12h',
  },
  {
    label: 'Népszerű (az elmúlt 4 órában)',
    value: 'trending_4h',
    id: 'trending_4h',
  },
  {
    label: 'Népszerű (az elmúlt 1 órában)',
    value: 'trending_1h',
    id: 'trending_1h',
  },
  {
    label: '',
    value: '',
    id: 'separator_trending',
    disabled: true,
    separator: true,
  },

  // BTC lightning out
  // Felajánlások kikommentelése (nem töröltük a kódot, csak kommentbe tettük)
  /* 
  {
    label: 'Legtöbb felajánlás (24 óra)',
    value: 'mostzapped_24h',
    id: 'mostzapped_24h',
  },
  {
    label: 'Legtöbb felajánlás (12 óra)',
    value: 'mostzapped_12h',
    id: 'mostzapped_12h',
  },
  {
    label: 'Legtöbb felajánlás (4 óra)',
    value: 'mostzapped_4h',
    id: 'mostzapped_4h',
  },
  {
    label: 'Legtöbb felajánlás (1 óra)',
    value: 'mostzapped_1h',
    id: 'mostzapped_1h',
  },
  */
];

const HomeSidebar: Component< { id?: string } > = (props) => {

  const account = useAccountContext();
  const home = useHomeContext();

  onMount(() => {
    const def = sidebarOptions.find(o => o.id === 'trending_4h') || sidebarOptions[0];
    if (account?.isKeyLookupDone && home?.sidebarNotes.length === 0) {
      let stored = readHomeSidebarSelection(account.publicKey) || { ...def };

      if (!stored.id) {
        stored = { ...def };
      }

      home?.actions.updateSidebarQuery(stored);
      home?.actions.doSidebarSearch(stored.value || '');
    }
  });

  return (
    <div id={props.id}>
      <div class={styles.headingTrending}>
        <SelectionBox2
          options={sidebarOptions}
          value={home?.sidebarQuery}
          initialValue={home?.sidebarQuery}
          onChange={(option: SelectionOption) => {
            if (option.value === home?.sidebarQuery?.value) return;
            home?.actions.updateSidebarQuery(option);
            saveHomeSidebarSelection(account?.publicKey, option);
            home?.actions.doSidebarSearch(option.value || '');
          }}
        />
      </div>

      <Transition name="slide-fade">
        <Show
          when={!home?.isFetchingSidebar}
          fallback={
            <div>
              <For each={new Array(24)}>
                {() => <ShortNoteSkeleton />}
              </For>
            </div>
          }
        >
          <div>
            <For each={home?.sidebarNotes}>
              {(note) => (
                <div class="animated">
                  <SmallNote note={note} />
                </div>
              )}
            </For>
          </div>
        </Show>
      </Transition>
    </div>
  );
}

export default hookForDev(HomeSidebar);
