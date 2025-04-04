import {
  Component,
  createEffect,
  createSignal,
  For,
  Match,
  on,
  onCleanup,
  onMount,
  Show,
  Switch
} from 'solid-js';
import styles from './Home.module.scss'; // Adjust if Reads has its own styles
import { useIntl } from '@cookbook/solid-intl';
import { useAccountContext } from '../contexts/AccountContext';
import { useReadsContext } from '../contexts/ReadsContext';
import { useAppContext } from '../contexts/AppContext';
import { A, useNavigate, useParams } from '@solidjs/router';
import { reads, branding } from '../translations';
import PageTitle from '../components/PageTitle/PageTitle';
import PageCaption from '../components/PageCaption/PageCaption';
import Wormhole from '../components/Wormhole/Wormhole';
import Search from '../components/Search/Search';
import StickySidebar from '../components/StickySidebar/StickySidebar';
import ReadsSidebar from '../components/HomeSidebar/ReadsSidebar';
import ReadsHeader from '../components/HomeHeader/ReadsHeader';
import ArticlePreview from '../components/ArticlePreview/ArticlePreview';
import ArticlePreviewPhone from '../components/ArticlePreview/ArticlePreviewPhone';
import ArticlePreviewSkeleton from '../components/Skeleton/ArticlePreviewSkeleton';
import ArticlePreviewPhoneSkeleton from '../components/Skeleton/ArticlePreviewPhoneSkeleton';
import Paginator from '../components/Paginator/Paginator';
import { Transition } from 'solid-transition-group';
import { scrollWindowTo } from '../lib/scroll';
import { setIsHome } from '../components/Layout/Layout';
import { APP_ID } from '../App';
import { isPhone } from '../utils';
import { PrimalArticle, PrimalUser } from '../types/primal';
import { createStore } from 'solid-js/store';

const Reads: Component = () => {
  const context = useReadsContext();
  const account = useAccountContext();
  const intl = useIntl();
  const app = useAppContext();
  const params = useParams();
  const navigate = useNavigate();

  const isPageLoading = () => context?.isFetching;

  let checkNewNotesTimer: number = 0;

  const [hasNewPosts, setHasNewPosts] = createSignal(false);
  const [newNotesCount, setNewNotesCount] = createSignal(0);
  const [newPostAuthors, setNewPostAuthors] = createStore<PrimalUser[]>([]);

  const newPostCount = () => newNotesCount() < 100 ? newNotesCount() : 100;

  onMount(() => {
    scrollWindowTo(context?.scrollTop);
    if (!params.topic && !context?.selectedFeed) {
      context?.actions.selectFeed({
        spec: '{"kind":"reads"}',
        name: 'Default Reads',
        description: 'Default feed for reading articles',
        enabled: true,
      });
    }
  });

  createEffect(() => {
    if ((context?.future.notes.length || 0) > 99 || app?.isInactive) {
      clearInterval(checkNewNotesTimer);
      return;
    }

    const spec = context?.selectedFeed?.spec || '';

    if (checkNewNotesTimer) {
      clearInterval(checkNewNotesTimer);
      setHasNewPosts(false);
      setNewNotesCount(0);
      setNewPostAuthors(() => []);
    }

    const timeout = 25_000 + Math.random() * 10_000;

    checkNewNotesTimer = setInterval(() => {
      context?.actions.checkForNewNotes(spec);
    }, timeout);
  });

  createEffect(() => {
    const count = context?.future.notes.length || 0;
    if (count === 0) {
      return;
    }

    if (!hasNewPosts()) {
      setHasNewPosts(true);
    }

    if (newPostAuthors.length < 3) {
      const users = context?.future.notes.map(note => note.user) || [];
      const uniqueUsers = users.reduce<PrimalUser[]>((acc, user) => {
        const isDuplicate = acc.find(u => u && u.pubkey === user.pubkey);
        return isDuplicate ? acc : [...acc, user];
      }, []).slice(0, 3);
      setNewPostAuthors(() => [...uniqueUsers]);
    }

    setNewNotesCount(count);
  });

  onCleanup(() => {
    clearInterval(checkNewNotesTimer);
    setIsHome(false);
  });

  const loadNewContent = () => {
    if (newNotesCount() > 100 || app?.appState === 'waking') {
      context?.actions.getFirstPage();
      return;
    }

    context?.actions.loadFutureContent();
    scrollWindowTo(0, true);
    setHasNewPosts(false);
    setNewNotesCount(0);
    setNewPostAuthors(() => []);
  };

  createEffect(on(() => params.topic, (v, p) => {
    if (v && v.length > 0) {
      context?.actions.clearNotes();
      context?.actions.fetchNotes(`{\"kind\":\"reads\",\"topic\":\"${decodeURIComponent(params.topic)}\"}`);
      return;
    } else if (p && p.length > 0) {
      context?.actions.refetchSelectedFeed();
    }
  }));

  createEffect(on(() => account?.isKeyLookupDone, (v, p) => {
    if (v && v !== p && account?.publicKey && !params.topic) {
      const selected = context?.selectedFeed;
      if (selected) {
        context?.actions.selectFeed({ ...selected });
      }
    }
  }));

  const onArticleRendered = (article: PrimalArticle, el: HTMLAnchorElement | undefined) => {
    context?.actions.setArticleHeight(article.naddr, el?.getBoundingClientRect().height || 0);
  };

  return (
    <div class={styles.homeContent}>
      <PageTitle title={intl.formatMessage(branding)} />
      <Wormhole to="search_section">
        <Show when={!isPhone()}>
          <Search />
        </Show>
      </Wormhole>

      <PageCaption title={intl.formatMessage(reads.pageTitle)}>
        <Show
          when={params.topic}
          fallback={
            <div>
              <ReadsHeader
                hasNewPosts={hasNewPosts}
                loadNewContent={loadNewContent}
                newPostCount={newPostCount}
                newPostAuthors={newPostAuthors}
              />
            </div>
          }
        >
          <div class={styles.readsTopicHeader}>
            <div class={styles.backToReads}>témakör:</div>
            <A
              class={styles.topicBubble}
              href={'/reads'}
              onClick={() => context?.actions.refetchSelectedFeed()}
            >
              <div>{decodeURIComponent(params.topic)}</div>
              <div class={styles.closeIcon}></div>
            </A>
          </div>
        </Show>
      </PageCaption>

      <Show when={!isPhone()}>
        <StickySidebar>
          <ReadsSidebar />
        </StickySidebar>
      </Show>

      <div class={styles.readsFeed}>
        <Transition name="slide-fade">
          <Show
            when={context?.notes && context.notes.length > 0}
            fallback={
              <div>
                <For each={new Array(5)}>
                  {() => (isPhone() ? <ArticlePreviewPhoneSkeleton /> : <ArticlePreviewSkeleton />)}
                </For>
              </div>
            }
          >
            <div class={styles.feed}>
              <Show
                when={!isPhone()}
                fallback={
                  <For each={context?.notes}>
                    {(note) => (
                      <div class="animated">
                        <ArticlePreviewPhone
                          article={note}
                          height={context?.articleHeights[note.naddr]}
                          onRender={onArticleRendered}
                          hideFooter={true}
                        />
                      </div>
                    )}
                  </For>
                }
              >
                <For each={context?.notes}>
                  {(note) => (
                    <div class="animated">
                      <ArticlePreview
                        article={note}
                        height={context?.articleHeights[note.naddr]}
                        onRender={onArticleRendered}
                        onClick={navigate}
                      />
                    </div>
                  )}
                </For>
              </Show>
            </div>
          </Show>
        </Transition>

        <Switch>
          <Match when={!isPageLoading() && context?.notes && context?.notes.length === 0}>
            <div class={styles.noContent}></div>
          </Match>
          <Match when={isPageLoading()}>
            <div class={styles.noContent}></div>
          </Match>
        </Switch>
        <Paginator loadNextPage={() => context?.actions.fetchNextPage(params.topic)} />
      </div>
    </div>
  );
};

export default Reads;