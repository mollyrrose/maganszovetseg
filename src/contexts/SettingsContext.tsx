import { createStore } from "solid-js/store";
import { useToastContext } from "../components/Toaster/Toaster";
import { andRD, andVersion, contentScope, defaultContentModeration, defaultFeeds, defaultNotificationSettings, defaultZap, defaultZapOptions, iosRD, iosVersion, nostrHighlights, themes, trendingFeed, trendingScope } from "../constants";
import {
  createContext,
  createEffect,
  onCleanup,
  onMount,
  useContext
} from "solid-js";
import {
  isConnected,
  refreshSocketListeners,
  removeSocketListeners,
  socket,
  subsTo
} from "../sockets";
import {
  ContentModeration,
  ContextChildren,
  PrimalArticleFeed,
  PrimalFeed,
  PrimalTheme,
  ZapOption,
} from "../types/primal";
import {
  initHomeFeeds,
  initReadsFeeds,
  loadHomeFeeds,
  loadReadsFeeds,
  removeFromAvailableFeeds,
  replaceAvailableFeeds,
  updateAvailableFeeds,
  updateAvailableFeedsTop
} from "../lib/availableFeeds";
import { useAccountContext } from "./AccountContext";
import { saveAnimated, saveHomeFeeds, saveNWC, saveNWCActive, saveReadsFeeds, saveTheme } from "../lib/localStore";
import { getDefaultSettings, getHomeSettings, getNWCSettings, getReadsSettings, getSettings, sendSettings, setHomeSettings, setReadsSettings } from "../lib/settings";
import { APP_ID } from "../App";
import { useIntl } from "@cookbook/solid-intl";
import { feedProfile, feedProfileDesription, settings as t } from "../translations";
import { getMobileReleases } from "../lib/releases";
import { logError } from "../lib/logger";
import { fetchDefaultArticleFeeds, fetchDefaultHomeFeeds } from "../lib/feed";

export type MobileReleases = {
  ios: { date: string, version: string },
  android: { date: string, version: string },
}

export type SettingsContextStore = {
  locale: string,
  theme: string,
  themes: PrimalTheme[],
  isAnimated: boolean,
  availableFeeds: PrimalFeed[],
  readsFeeds: PrimalArticleFeed[],
  homeFeeds: PrimalArticleFeed[],
  defaultFeed: PrimalFeed,
  defaultZap: ZapOption,
  availableZapOptions: ZapOption[],
  defaultZapAmountOld: number,
  zapOptionsOld: number[],
  notificationSettings: Record<string, boolean>,
  applyContentModeration: boolean,
  contentModeration: ContentModeration[],
  mobileReleases: MobileReleases,
  actions: {
    setTheme: (theme: PrimalTheme | null) => void,
    addAvailableFeed: (feed: PrimalFeed, addToTop?: boolean) => void,
    removeAvailableFeed: (feed: PrimalFeed) => void,
    setAvailableFeeds: (feedList: PrimalFeed[]) => void,
    moveAvailableFeed: (fromIndex: number, toIndex: number) => void,
    renameAvailableFeed: (feed: PrimalFeed, newName: string) => void,
    saveSettings: () => void,
    loadSettings: (pubkey: string) => void,
    setDefaultZapAmount: (option: ZapOption, temp?: boolean) => void,
    setZapOptions: (option: ZapOption, index: number, temp?: boolean) => void,
    resetZapOptionsToDefault: (temp?: boolean) => void,
    updateNotificationSettings: (key: string, value: boolean, temp?: boolean) => void,
    restoreDefaultFeeds: () => void,
    setApplyContentModeration: (flag: boolean) => void,
    modifyContentModeration: (name: string, content?: boolean, trending?: boolean) => void,
    refreshMobileReleases: () => void,
    setProxyThroughPrimal: (shouldProxy: boolean, temp?: boolean) => void,
    getDefaultReadsFeeds: () => void,
    getDefaultHomeFeeds: () => void,
    restoreReadsFeeds: () => void,
    restoreHomeFeeds: () => void,
    addProfileHomeFeed: ( name: string, pubkey: string | undefined) => void,
    removeProfileHomeFeed: (pubkey: string | undefined) => void,
    hasProfileFeedAtHome: (pubkey: string | undefined) => boolean,
    moveHomeFeed: (fromIndex: number, toIndex: number) => void,
    renameHomeFeed: (feed: PrimalArticleFeed, newName: string) => void,
    moveFeed: (fromIndex: number, toIndex: number, feedType: FeedType) => void,
    renameFeed: (feed: PrimalArticleFeed, newName: string, feedType: FeedType) => void,
    enableFeed: (feed: PrimalArticleFeed, enabled: boolean, feedType: FeedType) => void,
    addFeed: (feed: PrimalArticleFeed, feedType: FeedType) => void,
    removeFeed: (feed: PrimalArticleFeed, feedType: FeedType) => void,
    isFeedAdded: (feed: PrimalArticleFeed, destination: 'home' | 'reads') => boolean,
    setAnimation: (isAnimated: boolean, temp?: boolean) => void,
  }
}

export const initialData = {
  locale: 'en-us',
  theme: 'sunrise',
  themes,
  isAnimated: true,
  availableFeeds: [],
  readsFeeds: [],
  homeFeeds: [],
  defaultFeed: defaultFeeds[0],
  defaultZap: defaultZap,
  availableZapOptions: defaultZapOptions,
  defaultZapAmountOld: 21,
  zapOptionsOld: [21, 420, 1_000, 5_000, 10_000, 100_000],
  notificationSettings: { ...defaultNotificationSettings },
  applyContentModeration: true,
  contentModeration: [...defaultContentModeration],
  mobileReleases: {
    ios: { date: `${iosRD}`, version: iosVersion },
    android: { date: `${andRD}`, version: andVersion },
  },
};

export type FeedType = 'home' | 'reads';

interface FeedSettings {
  id: string;
  name: string;
  // add other properties your feed objects have
}

export const SettingsContext = createContext<SettingsContextStore>();

export const SettingsProvider = (props: { children: ContextChildren }) => {

  const toaster = useToastContext();
  const account = useAccountContext();
  const intl = useIntl();

// ACTIONS --------------------------------------

  const setProxyThroughPrimal = (shouldProxy: boolean, temp?: boolean) => {
    account?.actions.setProxyThroughPrimal(shouldProxy);

    !temp && saveSettings();
  }

  const setDefaultZapAmount = (option: ZapOption, temp?: boolean) => {
    updateStore('defaultZap', () => option);

    !temp && saveSettings();
  };

  const setZapOptions = (option: ZapOption, index: number, temp?: boolean) => {
    updateStore('availableZapOptions', index, () => ({ ...option }));


    !temp && saveSettings();
  };

  const resetZapOptionsToDefault = (temp?: boolean) => {
    const subid = `restore_default_${APP_ID}`;

    const unsub = subsTo(subid, {
      onEvent: (_, content) => {
        if (!content) return;
        try {
          const settings = JSON.parse(content?.content || '{}');

          let options = settings.zapConfig;
          let amount = settings.zapDefault;

          updateStore('availableZapOptions', () => options);
          updateStore('defaultZap', () => amount);


          !temp && saveSettings();
        }
        catch (e) {
          logError('Error parsing settings response: ', e);
        }
      },
      onNotice: () => {
        toaster?.sendWarning(intl.formatMessage({
          id: 'settings.loadFail',
          defaultMessage: 'Nem tudtuk betölteni a beállításokat. Az offline beállításokat fogjuk használni.',
          description: 'A beállításokat követően nem tudtuk letölteni az üzenetet a szerverről.',
        }));
      },
      onEose: () => {
        unsub();
      },
    });

    getDefaultSettings(subid);
  }

  const setTheme = (theme: PrimalTheme | null, temp?: boolean) => {
    const forced = localStorage.getItem('forceTheme');

    if (forced && ['sunrise', 'sunset', 'midnight', 'ice'].includes(forced)) {
      updateStore('theme', () => forced);
      return;
    }

    if (!theme) {
      return;
    }

    saveTheme(account?.publicKey, theme.name);
    updateStore('theme', () => theme.name);

    !temp && saveSettings();
  }

  const setThemeByName = (name: string | null, temp?: boolean) => {
    if (!name) {
      return;
    }

    const availableTheme = store.themes.find((t: { name: string }) => t.name === name);
    availableTheme && setTheme(availableTheme, temp);
  }

  const setAnimation = (isAnimated: boolean, temp?: boolean) => {

    saveAnimated(account?.publicKey, isAnimated);
    updateStore('isAnimated', () => isAnimated);

    !temp && saveSettings();
  };

  const setApplyContentModeration = (flag = true) => {
    updateStore('applyContentModeration', () => flag);


    saveSettings();
  };

  const addAvailableFeed = (feed: PrimalFeed, addToTop = false, temp?: boolean) => {
    if (!feed) {
      return;
    }
    if (account?.hasPublicKey()) {
      const add = addToTop ? updateAvailableFeedsTop : updateAvailableFeeds;

      updateStore('availableFeeds', (feeds) => add(account?.publicKey, feed, feeds));


      !temp && saveSettings();
    }
  };

  const removeAvailableFeed = (feed: PrimalFeed, temp?: boolean) => {
    if (!feed) {
      return;
    }

    if (account?.hasPublicKey()) {
      updateStore('availableFeeds',
        (feeds) => removeFromAvailableFeeds(account?.publicKey, feed, feeds),
      );


      !temp && saveSettings();
    }
  };

  const setAvailableFeeds = (feedList: PrimalFeed[], temp?: boolean) => {
    if (account?.hasPublicKey()) {
      updateStore('availableFeeds',
        () => replaceAvailableFeeds(account?.publicKey, feedList),
      );

      !temp && saveSettings();
    }
  };

  const moveAvailableFeed = (fromIndex: number, toIndex: number) => {

    let list = [...store.availableFeeds];

    list.splice(toIndex, 0, list.splice(fromIndex, 1)[0]);

    setAvailableFeeds(list);

  };

  const renameAvailableFeed = (feed: PrimalFeed, newName: string) => {
    const list = store.availableFeeds.map((af: PrimalFeed) => {
      return af.hex === feed.hex && af.includeReplies === feed.includeReplies 
        ? { ...af, name: newName } 
        : { ...af };
    });
    setAvailableFeeds(list);
  };

  const specifyUserFeed = (pubkey: string) => JSON.stringify({ id: "feed", kind: "notes", pubkey });

  const addProfileHomeFeed = (name: string, pubkey: string | undefined) => {
    if (!pubkey) return;


    const feed: PrimalArticleFeed = {
      name: intl.formatMessage(feedProfile, { name }),
      spec: specifyUserFeed(pubkey),
      description: intl.formatMessage(feedProfileDesription, { name }),
      enabled: true,
      feedkind: 'user',
    };

    const list = [ ...store.homeFeeds, { ...feed }];

    updateHomeFeeds(list);
  }

  const removeProfileHomeFeed = (pubkey: string | undefined) => {
    if (!pubkey) return;

    const spec = specifyUserFeed(pubkey);

    const list = (store.homeFeeds ?? []).filter((f: PrimalFeed) => f.spec !== spec);

    updateHomeFeeds(list);
  }

  const removeFeed = (feed: PrimalArticleFeed, feedType: FeedType) => {

    if (feedType === 'home') {
      const updated = store.homeFeeds.filter((f: PrimalFeed) => f.spec !== feed.spec);
      updateHomeFeeds(updated);
    }

    if (feedType === 'reads') {
      const updated = (store.readsFeeds ?? []).filter((f: PrimalFeed) => 
        f.spec !== undefined && 
        feed?.spec !== undefined && 
        f.spec !== feed.spec
      );
      updateReadsFeeds(updated);
    }
  }

  const moveFeed = (fromIndex: number, toIndex: number, feedType: FeedType) => {

    if (feedType === 'home') {
      moveHomeFeed(fromIndex, toIndex);
    }

    if (feedType === 'reads') {
      moveReadsFeed(fromIndex, toIndex);
    }
  };

  const renameFeed = (feed: PrimalArticleFeed, newName: string, feedType: FeedType) => {
    if (feedType === 'home') {
      renameHomeFeed(feed, newName);
    }

    if (feedType === 'reads') {
      renameReadsFeed(feed, newName);
    }
  };

  const enableFeed = (feed: PrimalArticleFeed, enabled: boolean, feedType: FeedType) => {
    if (feedType === 'home') {
      enableHomeFeed(feed, enabled);
    }

    if (feedType === 'reads') {
      enableReadsFeed(feed, enabled);
    }
  }

  const addFeed = (feed: PrimalArticleFeed, feedType: FeedType) => {
    if (feedType === 'home') {
      addHomeFeed(feed);
    }

    if (feedType === 'reads') {
      addReadsFeed(feed);
    }
  }

  const hasProfileFeedAtHome = (pubkey: string | undefined): boolean => {
    if (!pubkey) return false;
  
    const spec = specifyUserFeed(pubkey);
    return (store.homeFeeds ?? []).some((f: PrimalFeed) => f.spec === spec);
  }

  const restoreHomeFeeds = () => {
    const subId = `restore_feeds_${APP_ID}`;

    let feeds: PrimalArticleFeed[] = []

    const unsub = subsTo(subId, {
      onEvent: (_, content) => {
        feeds = JSON.parse(content.content || '[]') as PrimalArticleFeed[];

        updateStore('homeFeeds', () => [...feeds]);
      },
      onEose: () => {
        unsub();
        updateHomeFeeds(feeds)
      },
    });

    fetchDefaultHomeFeeds(subId);
  }

  const restoreReadsFeeds = () => {
    const subId = `restore_feeds_${APP_ID}`;

    let feeds: PrimalArticleFeed[] = []

    const unsub = subsTo(subId, {
      onEvent: (_, content) => {
        feeds = JSON.parse(content.content || '[]') as PrimalArticleFeed[];

        updateStore('readsFeeds', () => [...feeds]);
      },
      onEose: () => {
        unsub();
        updateReadsFeeds(feeds)
      },
    });

    fetchDefaultArticleFeeds(subId);
  }

  const updateHomeFeeds = (feeds: PrimalArticleFeed[]) => {
    updateStore('homeFeeds', () => [...feeds]);
    saveHomeFeeds(account?.publicKey, feeds);

    const subId = `set_home_feeds_${APP_ID}`;

    const unsub = subsTo(subId, {
      onEose: () => { unsub(); }
    })

    setHomeSettings(subId, store.homeFeeds)
  }

  const updateReadsFeeds = (feeds: PrimalArticleFeed[]) => {
    updateStore('readsFeeds', () => [...feeds]);
    saveHomeFeeds(account?.publicKey, feeds);

    const subId = `set_home_feeds_${APP_ID}`;

    const unsub = subsTo(subId, {
      onEose: () => { unsub(); }
    })

    setReadsSettings(subId, store.readsFeeds)
  }

  const moveHomeFeed = (fromIndex: number, toIndex: number) => {

    let list = [...store.homeFeeds];

    list.splice(toIndex, 0, list.splice(fromIndex, 1)[0]);

    updateHomeFeeds(list);
  };

  const moveReadsFeed = (fromIndex: number, toIndex: number) => {

    let list = [...store.readsFeeds];

    list.splice(toIndex, 0, list.splice(fromIndex, 1)[0]);

    updateReadsFeeds(list);
  };

  const renameHomeFeed = (feed: PrimalArticleFeed, newName: string) => {
    const list = (store.homeFeeds ?? []).map((f: PrimalArticleFeed) => {
      return f.spec === feed.spec ? { ...f, name: newName } : { ...f };
    });
    updateHomeFeeds(list);
  };

  const renameReadsFeed = (feed: PrimalArticleFeed, newName: string) => {
    const list = (store.readsFeeds ?? []).map((f: PrimalArticleFeed) => 
      f.spec === feed.spec ? { ...f, name: newName } : { ...f }
    );
    
    updateReadsFeeds(list);
  };

  const enableHomeFeed = (feed: PrimalArticleFeed, enabled: boolean) => {
    const list = (store.homeFeeds ?? []).map((f: PrimalArticleFeed) => 
      f.spec === feed.spec ? { ...f, enabled } : { ...f }
    );
    
    updateHomeFeeds(list);
  };

  const enableReadsFeed = (feed: PrimalArticleFeed, enabled: boolean) => {
    const list = (store.readsFeeds ?? []).map((f: PrimalArticleFeed) =>
      f.spec === feed.spec ? { ...f, enabled } : { ...f }
    );
  
    updateReadsFeeds(list);
  };

  const isFeedAdded: (f: PrimalArticleFeed, d: 'home' | 'reads') => boolean = (
    feed: PrimalArticleFeed, 
    destination: 'home' | 'reads'
  ) => {
    const feeds = destination === 'reads' 
      ? store.readsFeeds ?? [] 
      : store.homeFeeds ?? [];
      
    return feeds.some((f: PrimalArticleFeed) => f.spec === feed.spec);
  };

  const addHomeFeed = (feed: PrimalArticleFeed) => {
    const list = [ ...store.homeFeeds, {...feed}];

    updateHomeFeeds(list);
  };

  const addReadsFeed = (feed: PrimalArticleFeed) => {
    const list = [ ...store.readsFeeds, {...feed}];

    updateReadsFeeds(list);
  };

  const updateNotificationSettings = (key: string, value: boolean, temp?: boolean) => {
    updateStore('notificationSettings', () => ({ [key]: value }));


    !temp && saveSettings();
  };

  const restoreDefaultFeeds = () => {

    // const subid = `restore_default_${APP_ID}`;

    // const unsub = subscribeTo(subid, async (type, subId, content) => {

    //   if (type === 'EVENT' && content?.content) {
    //     try {
    //       const settings = JSON.parse(content?.content);

    //       let feeds = settings.feeds as PrimalFeed[];

    //       if (account?.hasPublicKey()) {
    //         feeds.unshift({
    //           name: feedLatestWithRepliesLabel,
    //           hex: account?.publicKey,
    //           npub: hexToNpub(account?.publicKey),
    //           includeReplies: true,
    //         });
    //         feeds.unshift({
    //           name: feedLatestLabel,
    //           hex: account?.publicKey,
    //           npub: hexToNpub(account?.publicKey),
    //         });
    //       }

    //       updateStore('availableFeeds',
    //         () => replaceAvailableFeeds(account?.publicKey, feeds),
    //       );

    //       updateStore('defaultFeed', () => store.availableFeeds[0]);

    //       saveSettings();
    //     }
    //     catch (e) {
    //       logError('Error parsing settings response: ', e);
    //     }
    //   }

    //   if (type === 'NOTICE') {
    //     toaster?.sendWarning(intl.formatMessage({
    //       id: 'settings.loadFail',
    //       defaultMessage: 'Failed to load settings. Will be using local settings.',
    //       description: 'Toast message after settings have failed to be loaded from the server',
    //     }));
    //   }

    //   unsub();
    //   return;
    // });

    // getDefaultSettings(subid)
  };

  const modifyContentModeration = (name: string, content = true, trending = true) => {
    let scopes: string[] = [];
    if (content) scopes.push(contentScope);
    if (trending) scopes.push(trendingScope);

    updateStore('contentModeration', x => x.name === name, () => ({ scopes }));


    saveSettings();
  };

  const saveSettings = (then?: () => void) => {
    const settings = {
      theme: store.theme,
      feeds: store.availableFeeds,
      zapDefault: store.defaultZap,
      zapConfig: store.availableZapOptions,
      defaultZapAmount: store.defaultZapAmountOld,
      zapOptions: store.zapOptionsOld,
      notifications: store.notificationSettings,
      applyContentModeration: store.applyContentModeration,
      contentModeration: store.contentModeration,
      proxyThroughPrimal: account?.proxyThroughPrimal || false,
      animated: store.isAnimated,
    };

    const subid = `save_settings_${APP_ID}`;

    const unsub = subsTo(subid, {
      onNotice: () => {
        toaster?.sendWarning(intl.formatMessage({
          id: 'settings.saveFail',
          defaultMessage: 'Failed to save settings',
          description: 'Toast message after settings have failed to be saved on the server',
        }));
      },
      onEose: () => {
        unsub();
      }
    });

    sendSettings(settings, subid);
  }

  const loadDefaults = () => {

    const subid = `load_defaults_${APP_ID}`;

    const unsub = subsTo(subid, {
      onEvent: (_, content) => {
        if (!content) return;

        try {
          const settings = JSON.parse(content.content || '{}');

          const feeds = settings.feeds as PrimalFeed[];
          const notificationSettings = settings.notifications as Record<string, boolean>;

          updateStore('availableFeeds',
            () => replaceAvailableFeeds(account?.publicKey, feeds),
          );

          updateStore('defaultFeed', () => 
            (store.availableFeeds ?? []).find((x: PrimalFeed) => x.hex === nostrHighlights) ?? 
            (store.availableFeeds?.[0] ?? null)
          );

          updateStore('notificationSettings', () => ({
            ...(notificationSettings ?? defaultNotificationSettings)
          }));
          updateStore('applyContentModeration', () => true);

          let zapOptions = settings.zapConfig;
          let zapAmount = settings.zapDefault;

          updateStore('defaultZap', () => zapAmount);
          updateStore('availableZapOptions', () => zapOptions);
        }
        catch (e) {
          logError('Error parsing settings response: ', e);
        }
      },
      onNotice: () => {
        toaster?.sendWarning(intl.formatMessage({
          id: 'settings.loadFail',
          defaultMessage: 'Nem tudtuk betölteni a beállításokat. Az offline beállításokat fogjuk használni.',
          description: 'Toast message after settings have failed to be loaded from the server',
        }));
      },
      onEose: () => {
        unsub();
      },
    });

    getDefaultSettings(subid);
    getDefaultHomeFeeds();
    getDefaultReadsFeeds();
  };

  const loadSettings = (pubkey: string | undefined, then?: () => void) => {

    if (!pubkey) {
      return;
    }

    updateStore('homeFeeds', () => [ ...loadHomeFeeds(pubkey) ])
    updateStore('readsFeeds', () => [ ...loadReadsFeeds(pubkey) ])

    const settingsSubId = `load_settings_${APP_ID}`;
    const settingsHomeSubId = `load_home_settings_${APP_ID}`;
    const settingsReadsSubId = `load_reads_settings_${APP_ID}`;
    const settingsNWCSubId = `load_nwc_settings_${APP_ID}`;

    const unsubSettings = subsTo(settingsSubId, {
      onEvent: (_, content) => {
        if (!content) return;

        try {
          const {
            animated,
            theme,
            zapDefault,
            zapConfig,
            defaultZapAmount,
            zapOptions,
            notifications,
            applyContentModeration,
            contentModeration,
            proxyThroughPrimal,
          } = JSON.parse(content.content || '{}');

          theme && setThemeByName(theme, true);

          setAnimation(animated, true);

          // If new setting is missing, merge with the old setting
          if (zapDefault) {
            setDefaultZapAmount(zapDefault, true);
          }
          else {
            setDefaultZapAmount({ ...defaultZap, amount: defaultZapAmount }, true);
          }

          // If new setting is missing, merge with the old setting
          if (zapConfig) {
            updateStore('availableZapOptions', () => [...zapConfig]);
          }
          else {
            const newConfig = defaultZapOptions.map((o, i) => ({ ...o, amount: zapOptions[i]}));
            updateStore('availableZapOptions', () => [...newConfig]);
          }

          updateStore('defaultZapAmountOld' , () => defaultZapAmount);
          updateStore('zapOptionsOld', () => zapOptions);

          if (notifications) {
            updateStore('notificationSettings', () => ({ ...notifications }));
          }
          else {
            updateStore('notificationSettings', () => ({ ...defaultNotificationSettings}));
          }

          updateStore('applyContentModeration', () => applyContentModeration === false ? false : true);

          if (Array.isArray(contentModeration) && contentModeration.length === 0) {
            updateStore('contentModeration', () => [...defaultContentModeration]);
          }
          else if (Array.isArray(contentModeration)) {
            for (let i=0; i < contentModeration.length; i++) {
              const m = contentModeration[i];
              const index = (store.contentModeration ?? []).findIndex((x: { name: string }) => x.name === m.name);

              updateStore(
                'contentModeration',
                index < 0 ? store.contentModeration.length : index,
                () => ({...m}),
              );
            }
          }

          account?.actions.setProxyThroughPrimal(proxyThroughPrimal);
        }
        catch (e) {
          logError('Error parsing settings response: ', e);
        }
      },
      onNotice: () => {
        toaster?.sendWarning(intl.formatMessage({
          id: 'settings.loadFail',
          defaultMessage: 'Nem tudtuk betölteni a beállításokat. Az offline beállításokat fogjuk használni.',
          description: 'A beállítást követően nem tudtuk letölteni az üzenetet a szerverről.',
        }));
      },
      onEose: () => {
        then && then();
        unsubSettings();
      },
    });

    pubkey && getSettings(pubkey, settingsSubId);

    const unsubHomeSettings = subsTo(settingsHomeSubId, {
      onEvent: (_, content) => {
        const feeds = JSON.parse(content?.content || '[]');

        updateStore('homeFeeds', () => [...feeds]);
      },
      onEose: () => {
        if (store.homeFeeds.length === 0) {
          getDefaultHomeFeeds();
        }
        saveHomeFeeds(pubkey, store.homeFeeds);
        unsubHomeSettings();
      }
    });

    pubkey && getHomeSettings(settingsHomeSubId);

    const unsubReadsSettings = subsTo(settingsReadsSubId, {
      onEvent: (_, content) => {
        const feeds = JSON.parse(content?.content || '[]');

        updateStore('readsFeeds', [...feeds])
      },
      onEose: () => {
        if (store.readsFeeds.length === 0) {
          getDefaultReadsFeeds();
        }
        saveReadsFeeds(pubkey, store.readsFeeds);
        unsubReadsSettings();
      }
    });

    pubkey && getReadsSettings(settingsReadsSubId);

    let nwcList: string[][] = [];
    let activeNWC: string[] = [];

    const unsubNWCSettings = subsTo(settingsNWCSubId, {
      onEvent: (_, content) => {
        const nwcSettings = JSON.parse(content?.content || '{}');

        nwcList = nwcSettings.nwcList;
        activeNWC = nwcSettings.nwcActive;
      },
      onEose: () => {
        if (store.readsFeeds.length === 0) {
          getDefaultReadsFeeds();
        }
        saveNWC(pubkey, nwcList)
        activeNWC.length > 0 && saveNWCActive(pubkey, activeNWC[0], activeNWC[1]);
        unsubNWCSettings();
      }
    });

    pubkey && getNWCSettings(settingsNWCSubId);
  }

  const refreshMobileReleases = () => {
    const subid = `mobile_releases_${APP_ID}`;

    const unsub = subsTo(subid, {
      onEvent: (_, content) => {
        const releases = JSON.parse(content?.content || '{}') as MobileReleases;
        updateStore('mobileReleases', () => ({ ...releases }));
      },
      onEose: () => {
        unsub();
      },
    });

    getMobileReleases(subid);
  };





// A felhasználó böngészőnyelvének meghatározása
//var userLang = navigator.language || navigator.userLanguage;
var userLang = 'hu';

// Nyelv alapú fordítás (ez egy alap példa, amit bővíthetsz egy API-val)
function translateContent() {
    if (userLang.startsWith('en')) {
        // Ha angol nyelvet használ, angol szöveget mutat
        console.log("English content");
    } else if (userLang.startsWith('hu')) {
        // Ha magyar nyelvet használ, magyar szöveget mutat
        console.log("Magyar tartalom");
    } else {
        console.log("Default content");
    }
}

// A tartalom fordítása
translateContent();



const translateToHungarian = (text: string): string => {
    const translations: Record<string, string> = {
      "Latest": "Legfrissebbek",
      "Latest notes by your follows": "Legfrissebb bejegyzések az általad követettektől",
      "Latest with Replies": "Legfrissebbek hozzászólásokkal",
      "Latest notes and replies by your follows": "Legfrissebb bejegyzések és hozzászólások az általad követettektől",
      "Trending 7d": "Népszerű (az elmúlt 7 napban)",
      "Global trending notes in the past 7 days": "Népszerű bejegyzések az elmúlt 7 napban",
      "Trending 48h": "Népszerű (az elmúlt 48 órában)",
      "Global trending notes in the past 48 hours": "Népszerű bejegyzések az elmúlt 48 órában",
      "Trending 24h": "Népszerű (az elmúlt 24 órában)",
      "Global trending notes in the past 24 hours": "Népszerű bejegyzések az elmúlt 24 órában",
      "Trending 12h": "Népszerű (az elmúlt 12 órában)",
      "Global trending notes in the past 12 hours": "Népszerű bejegyzések az elmúlt 12 órában",
      "Trending 4h": "Népszerű (az elmúlt 4 órában)",
      "Global trending notes in the past 4 hours": "Népszerű bejegyzések az elmúlt 4 órában",
      "Trending 1h": "Népszerű (az elmúlt 1 órában)",
      "Global trending notes in the past 1 hour": "Népszerű bejegyzések az elmúlt 1 órában",
      "Nostr Firehose": "Tűzfészek",
      "Latest global notes; be careful!": "Legfrissebb bejegyzések világszerte, légy óvatos!",
      "Nostr Reads": "Cikkek a nagyvilágból",
      "Latest reads from your network": "Legfrissebbek cikkek a nemzetközi hálózatodból",
      "All reads": "Minden cikk",
      "Latest global reads": "Legfrissebb cikkek a világ minden részéről",
      "Art Reads": "Művészet",
      "Art Topic Reads from Primal": "Művészeti témájú cikkek a MagánSzövetség.Net-ben",
      "Bitcoin Reads": "Bitcoin",
      "Bitcoin Topic Reads from Primal": "Bitcoin témájú cikkek a MagánSzövetség.Net-ben",
      "Finance Reads": "Pénzügyek",
      "Finance Topic Reads from Primal": "Pénzügyi témájú cikkek a MagánSzövetség.Net-ben",
      "Food Reads": "Táplálkozás",
      "Food Topic Reads from Primal": "Táplálkozás témájú cikkek a MagánSzövetség.Net-ben",
      "Gaming Reads": "Játék – Gaming",
      "Gaming Topic Reads from Primal": "Játék témájú cikkek a MagánSzövetség.Net-ben",
      "Human Rights Reads": "Emberi jogok",
      "Human Rights Reads from Primal": "Emberi jogi témájú cikkek a MagánSzövetség.Net-ben",
      "Music Reads": "Zene",
      "Music Topic Reads from Primal": "Zenei témájú cikkek a MagánSzövetség.Net-ben",
      "News Topic Reads": "Hírtémák",
      "News Topic Reads from Primal": "Hírek, cikkek a MagánSzövetség.Net-ben",
      "Nostr Topic Reads from Primal": "Cikkek a biztonságos kapcsolati hálók világából a MagánSzövetség.Net-ben",
      "Philosophy Reads": "Filozófia",
      "Philosophy Topic Reads from Primal": "Filozófia témájú cikkek a MagánSzövetség.Net-ben",
      "Photography Reads": "Fotográfia",
      "Photography Topic Reads from Primal": "Fényképezés témájú cikkek a MagánSzövetség.Net-ben",
      "Podcasts Reads": "Podcast-ok",
      "Podcasts Topic Reads from Primal": "Podcast témájú cikkek a MagánSzövetség.Net-ben",
      "Sports Reads": "Sport",
      "Sports Topic Reads from Primal": "Sport témájú cikkek a MagánSzövetség.Net-ben",
      "Technology Reads": "Technológia",
      "Technology Topic Reads from Primal": "Technológia témájú cikkek a MagánSzövetség.Net-ben",
      "Travel Reads": "Utazás",
      "Travel Topic Reads from Primal": "Utazás témájú cikkek a MagánSzövetség.Net-ben",
    };

    return translations[text] || text;
  };

  const getDefaultReadsFeeds = () => {
    const subId = `article_feeds_${APP_ID}`;

    const unsub = subsTo(subId, {
      onEvent: (_, content) => {
        // Parse and immediately convert to the right type
        const feeds = JSON.parse(content.content || '[]').map((f: any) => ({
          ...f,
          spec: f.spec || '',
          enabled: f.enabled !== undefined ? f.enabled : true
        })) as PrimalArticleFeed[];
    
        const translatedFeeds = feeds.map(feed => ({
          ...feed,
          name: feed.description === "Nostr Topic Reads from Primal" 
            ? "Kapcsolati hálók témájú cikkek" 
            : translateToHungarian(feed.name),
          description: translateToHungarian(feed.description)
        }));
    
        updateStore('readsFeeds', () => translatedFeeds);
      },
      onEose: () => {
        unsub();
        initReadsFeeds(account?.publicKey, store.readsFeeds);
      },
    });

    fetchDefaultArticleFeeds(subId);
  }

  const getDefaultHomeFeeds = () => {
    const subId = `home_feeds_${APP_ID}`;

    const unsub = subsTo(subId, {
      onEvent: (_, content) => {
        const feeds = JSON.parse(content.content || '[]');

        const translatedFeeds = feeds.map((feed: PrimalFeed) => ({
          ...feed,
          name: translateToHungarian(feed.name),
          description: translateToHungarian(feed.description),
        }));

        updateStore('homeFeeds', () => [...translatedFeeds]);
      },
      onEose: () => {
        unsub();
        initHomeFeeds(account?.publicKey, store.homeFeeds)
      },
    });

    fetchDefaultHomeFeeds(subId);
  }


// EFFECTS --------------------------------------

  onMount(() => {
    const forced = localStorage.getItem('forceTheme');

    if (forced && ['sunrise', 'sunset', 'midnight', 'ice'].includes(forced)) {
      updateStore('theme', () => forced);
      return;
    }

    // Set global theme, this is done to avoid changing the theme
    // when waiting for pubkey (like when reloading a page).
    const storedTheme = localStorage.getItem('theme');
    setThemeByName(storedTheme, true);
    const storedAnimated = localStorage.getItem('animated') || 'true';
    const anim = storedAnimated === 'true' ? true : false;
    setAnimation(anim, true);

    refreshMobileReleases();
  });

  // Initial setup for a user with a public key
  createEffect(() => {
    if (!account?.hasPublicKey() && account?.isKeyLookupDone) {
      loadDefaults();
      return;
    }

    const publicKey = account?.publicKey;

    loadSettings(publicKey, () => {
    });
  });

  createEffect(() => {
    const html: HTMLElement | null = document.querySelector('html');
    localStorage.setItem('theme', store.theme);
    html?.setAttribute('data-theme', store.theme);
  });

  createEffect(() => {
    const html: HTMLElement | null = document.querySelector('html');
    localStorage.setItem('animated', `${store.isAnimated}`);
    html?.setAttribute('data-animated', `${store.isAnimated}`);
  });

// STORES ---------------------------------------


  const [store, updateStore] = createStore<SettingsContextStore>({
    ...initialData,
    actions: {
      setTheme,
      addAvailableFeed,
      removeAvailableFeed,
      setAvailableFeeds,
      moveAvailableFeed,
      renameAvailableFeed,
      addProfileHomeFeed,
      removeProfileHomeFeed,
      hasProfileFeedAtHome,
      moveHomeFeed,
      renameHomeFeed,
      saveSettings,
      loadSettings,
      restoreDefaultFeeds,
      setDefaultZapAmount,
      setZapOptions,
      resetZapOptionsToDefault,
      updateNotificationSettings,
      setApplyContentModeration,
      modifyContentModeration,
      refreshMobileReleases,
      setProxyThroughPrimal,
      getDefaultReadsFeeds,
      getDefaultHomeFeeds,
      restoreReadsFeeds,
      restoreHomeFeeds,

      moveFeed,
      renameFeed,
      enableFeed,
      addFeed,
      removeFeed,
      isFeedAdded,

      setAnimation,
    },
  });

// RENDER ---------------------------------------

  return (
    <SettingsContext.Provider value={store}>
      {props.children}
    </SettingsContext.Provider>
  );
}

export const useSettingsContext = () => useContext(SettingsContext);
