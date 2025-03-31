import { Component, createEffect, createSignal, onCleanup, onMount, Show, useContext } from 'solid-js';
import styles from './EditProfile.module.scss';
import PageCaption from '../components/PageCaption/PageCaption';

import {
  actions as tActions,
  settings as tSettings,
  toast as tToast,
  upload as tUpload,
} from '../translations';
import { useIntl } from '@cookbook/solid-intl';
import Avatar from '../components/Avatar/Avatar';
import { useProfileContext } from '../contexts/ProfileContext';
import { useMediaContext } from '../contexts/MediaContext';
import { AccountContext, useAccountContext } from '../contexts/AccountContext';
import { sendProfile } from '../lib/profile';
import { useToastContext } from '../components/Toaster/Toaster';
import { usernameRegex } from '../constants';
import Loader from '../components/Loader/Loader';
import { useNavigate } from '@solidjs/router';
import PageTitle from '../components/PageTitle/PageTitle';
import ButtonPrimary from '../components/Buttons/ButtonPrimary';
import ButtonSecondary from '../components/Buttons/ButtonSecondary';
import Uploader from '../components/Uploader/Uploader';
import { triggerImportEvents } from '../lib/notes';
import { APP_ID } from '../App';
import { useSettingsContext } from '../contexts/SettingsContext';
import { useAppContext } from '../contexts/AppContext';

import { NostrRelays, NostrUserContent, PrimalUser } from '../types/primal';

// Adding relays on page open
import { sendRelays } from '../lib/profile';
import { Kind } from '../constants';
import { MaganSzovetseg_Recommended_Relays } from './MaganSzovetseg_Recommended_Relays';
import { saveRelaySettings } from "../lib/localStore";


const [isRelayTesting, setRelayTesting] = createSignal(false);
const [relayStatus, setRelayStatus] = createSignal("");

      // Define all MSN fields with explicit typing
const msnFields = [
        'msn_country',
        'msn_mapaddress',
        'msn_mapliveaddress',
        'msn_language',
        'msn_clientregurl',
        'msn_myrss',
        'msn_donationlink',
        'msn_btc',
        'msn_mobileappusername',
        'msn_email',
        'msn_isMediumSupported',
        'msn_isOptimumSupported',
        'msn_WantsToHelp',
        'msn_ismapaddressvisible',
        'msn_ismapaddressvisible_tosecondlevel'
] as const;

const getDefaultMSNValue = (field: string): string => {
  const defaults: Record<string, string> = {
    msn_country: "Magyarország",
    msn_language: "Magyar",
    msn_clientregurl: "MaganSzovetseg.Net",
    msn_isMediumSupported: "false",
    msn_isOptimumSupported: "false",
    msn_WantsToHelp: "false",
    msn_ismapaddressvisible: "false",
    msn_ismapaddressvisible_tosecondlevel: "false"
  };
  return defaults[field] || '';
};



{/*
import('../components/ProfileQrCodeModal/ProfileQrCodeModalBTC').then((module) => {
  console.log('Dynamic Import Success:', module.default);
  const ProfileQrCodeModalBTC = module.default;

  return (
    <ProfileQrCodeModalBTC
      open={openQrBTC()}
      onClose={() => setOpenQrBTC(false)}
      profile={profile?.userProfile || {}}
    />
  );
}).catch((error) => {
  console.error('Dynamic Import Failed:', error);
});
*/}





type AutoSizedTextArea = HTMLTextAreaElement & { _baseScrollHeight: number };


const EditProfile: Component = () => {

  const intl = useIntl();
  const profile = useProfileContext();
  const media = useMediaContext();
  const account = useAccountContext();
  const toast = useToastContext();
  const settings = useSettingsContext();
  const app = useAppContext();
  const navigate = useNavigate();

  let textArea: HTMLTextAreaElement | undefined;
  let fileUploadAvatar: HTMLInputElement | undefined;
  let fileUploadBanner: HTMLInputElement | undefined;
  let nameInput: HTMLInputElement | undefined;

  const [isBannerCached, setIsBannerCached] = createSignal(false);
  const [isMoreVisible, setIsMoreVisible] = createSignal(false);

  const [avatarPreview, setAvatarPreview] = createSignal<string>();
  const [bannerPreview, setBannerPreview] = createSignal<string>();

  const [isNameValid, setIsNameValid] = createSignal<boolean>(true);

  const [fileToUpload, setFileToUpload] = createSignal<File | undefined>();
  const [uploadTarget, setUploadTarget] = createSignal<'picture' | 'banner' | 'none'>('none');
  const [openSockets, setOpenSockets] = createSignal(false);

  const flagBannerForWarning = () => {
    const dev = localStorage.getItem('devMode') === 'true';

    // @ts-ignore
    if (isBannerCached() || !dev) {
      return '';
    }

    return styles.cacheFlag;
  }

  const imgError = (event: any) => {
    // Temprary solution until we decide what to to when banner is missing.

    // const image = event.target;
    // image.onerror = "";
    // image.src = defaultAvatar;

    const banner = document.getElementById('profile_banner');

    if (banner) {
      banner.innerHTML = `<div class="${styles.bannerPlaceholder}"></div>`;
    }

    return true;
  }

  const banner = () => {
    const src = bannerPreview();
    const url = media?.actions.getMediaUrl(src, 'm', true);

    setIsBannerCached(!!url);

    return url ?? src;
  }

  const setProfile = (hex: string | undefined) => {
    profile?.actions.setProfileKey(hex);
    profile?.actions.clearNotes();
  }

  const getScrollHeight = (elm: AutoSizedTextArea) => {
    var savedValue = elm.value
    elm.value = ''
    elm._baseScrollHeight = elm.scrollHeight
    elm.value = savedValue
  }




  //check if fields exist at load-in, if not, creat it
  const onExpandableTextareaInput = (): void => {
    // 1. First handle the textarea resizing logic
    const elm = textArea as AutoSizedTextArea | undefined;
    if (!elm) return;
  
    const maxHeight = document.documentElement.clientHeight || window.innerHeight || 0;
    const minRows = parseInt(elm.getAttribute('data-min-rows') || '0');
  
    if (!elm._baseScrollHeight) getScrollHeight(elm);
    if (elm.scrollHeight >= maxHeight / 3) return;
  
    elm.rows = minRows;
    const rows = Math.ceil((elm.scrollHeight - (elm._baseScrollHeight || 0)) / 20);
    elm.rows = minRows + rows;
  
    // 2. Safely handle MSN fields initialization
    const initializeMSNFields = (): void => {
      if (!profile || !profile.actions || !profile.actions.updateProfile) {
        console.warn('Profile context is not properly initialized');
        return;
      }
  
      const currentProfile = profile.userProfile ?? {};
      const updates: Partial<PrimalUser> = {};
      let needsUpdate = false;
  
      msnFields.forEach((field) => {
        if (!(field in currentProfile)) {
          updates[field] = '';
          needsUpdate = true;
        }
      });

      // Only update if there are changes
      if (needsUpdate && profile.actions.updateProfile) {
        // First update the profile data
        const updatedProfile = {
          ...(profile.userProfile || {}),
          ...updates
        };
        
        // Then trigger update - may only need the pubkey
        profile.actions.updateProfile(updatedProfile.pubkey || account?.publicKey || '');
      }
  
      // Update corresponding input fields
      msnFields.forEach((field) => {
        const input = document.querySelector<HTMLInputElement>(`input[name="${field}"]`);
        if (input) {
          input.value = (currentProfile as Record<string, string>)[field] || '';
        }
      });
    };
  
    initializeMSNFields();
  };






  // OnMount start ===============================================================================

  
  onMount(() => {
    setOpenSockets(true);
  
    /*
    const getAllRelays = (): string[] => {

      const normalizeUrl = (url: string) => {
        return url.toLowerCase().trim().replace(/\/+$/, ''); // Removes trailing slashes
      };

      const hardcodedRelays = [
        "wss://nos.lol",//208
        "wss://relay.primal.net",//252 Primary relay
        "wss://relay.damus.io", //391 
        "wss://nostr.wine"//453
      ].map(normalizeUrl);

      const userRelays = account?.relaySettings 
      ? Object.keys(account.relaySettings).map(normalizeUrl) 
      : [];

      const mergedRelays = [
        ...(account?.defaultRelays || []).map(normalizeUrl),
        ...MaganSzovetseg_Recommended_Relays.map(normalizeUrl),
        ...hardcodedRelays,
        ...userRelays
      ];

      return [...new Set(                          // Deduplicate AFTER normalization
        mergedRelays.map(r =>                      // Normalize FIRST:
          r.toLowerCase()                          // Lowercase
           .trim()                                 // Trim whitespace
           .replace(/\/+$/, '')                    // Remove trailing slashes
        )
      )].filter(r => r.startsWith('wss://'));      // Filter valid URLs last


    };
  
    const testRelayConnection = async (relayUrl: string, isHardcoded: boolean = false, timeoutMs: number = 2000): Promise<boolean> => {
      if (!relayUrl.startsWith('wss://')) {
        console.log(`[Relay Test] Érvénytelen URL (hiányzik a wss://): ${relayUrl}`);
        return false;
      }
  
      try {
        return await new Promise((resolve) => {
          console.log(`[Relay Test] Kapcsolódási kísérlet: ${relayUrl} ${isHardcoded ? '(hardcoded)' : ''}`);
          const socket = new WebSocket(relayUrl);
  
          const timeoutDuration = isHardcoded ? timeoutMs * 2 : timeoutMs;
          const timeout = setTimeout(() => {
            console.log(`[Relay Test] Időtúllépés (${timeoutDuration / 1000}s): ${relayUrl}`);
            socket.close();
            resolve(false);
          }, timeoutDuration);
  
          socket.onopen = () => {
            console.log(`[Relay Test] Sikeres kapcsolat: ${relayUrl}`);
            clearTimeout(timeout);
            socket.close();
            resolve(true);
          };
  
          socket.onerror = (error) => {
            console.error(`[Relay Test] Hiba a kapcsolódás során: ${relayUrl}`, error);
            clearTimeout(timeout);
            resolve(false);
          };
        });
      } catch (e) {
        console.error(`[Relay Test] Váratlan hiba a tesztelés során: ${relayUrl}`, e);
        return false;
      }
    };
  
    const saveRelaySettings = async (relaySettings: NostrRelays, cacheKey: string) => {
      if (Object.keys(relaySettings).length > 0) {
        console.log("[Save] RelaySettings mentése folyamatban:", relaySettings);
        console.log("[Save] CacheKey:", cacheKey);
        localStorage.setItem(cacheKey, JSON.stringify(relaySettings));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        console.log("[Save] LocalStorage-ba mentett érték:", localStorage.getItem(cacheKey));
        if (account) {
          await account.actions.connectToRelays(relaySettings);
          console.log("[Save] RelaySettings alkalmazva a kapcsolatokra");
        } else {
          console.warn("[Save] Az 'account' undefined, a Nostr kapcsolat nem frissült");
        }
      } else {
        console.log("[Save] Üres relaySettings, nincs mentés");
      }
    };
  
    const clearOldRelayCache = () => {
      const now = Date.now();
      const oneHourMs = 3600000;
  
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('workingRelays_')) {
          const timestampKey = `${key}_timestamp`;
          const timestamp = localStorage.getItem(timestampKey);
  
          if (timestamp && (now - parseInt(timestamp)) > oneHourMs) {
            localStorage.removeItem(key);
            localStorage.removeItem(timestampKey);
            console.log(`[Cache] Elavult relay cache törölve: ${key}`);
          }
        }
      }
    };
  
    const setupRelays = async () => {
      setOpenSockets(true);
      setRelayTesting(true);
  
      if (!account?.publicKey) {
        console.log("[Setup] Nincs elérhető fiók - a relay inicializálás kihagyva");
        setOpenSockets(false);
        return;
      }
  
      const cacheKey = `workingRelays_${account.publicKey}`;
      let relaySettings: NostrRelays = {};
      const allRelays = getAllRelays();
      const hardcodedRelays = [
        "wss://nos.lol",//208
        "wss://relay.primal.net",//252 Primary relay
        "wss://relay.damus.io", //391 
        "wss://nostr.wine"//453
      ];
      const TARGET_RELAY_COUNT = 7;
  
      try {
        console.log("[Setup] Relay inicializálás megkezdése");
        console.log("[Setup] Relay tesztelés megkezdése - összes relay:", allRelays);
        console.log("[Setup] Jelenlegi account.relaySettings (ha van):", account?.relaySettings || "Nincs meglévő");
  
        let workingRelays: string[] = [];
        const testPromises = allRelays.map(async (relay) => {
          const isHardcoded = hardcodedRelays.includes(relay);
          const isWorking = await testRelayConnection(relay, isHardcoded, 2000);
          if (isWorking) {
            workingRelays.push(relay);
            console.log(`[Relay Test] Működő relay ellenőrizve: ${relay}`);
          }
          return isWorking;
        });
  
        await Promise.all(testPromises);
        console.log(`[Setup] 1. kör utáni működő relék: ${workingRelays.length}/${allRelays.length}`);
        relaySettings = workingRelays.reduce((acc, relay) => ({
          ...acc,
          [relay]: { read: true, write: true }
        }), {});
        await saveRelaySettings(relaySettings, cacheKey);
  
        if (workingRelays.length < TARGET_RELAY_COUNT) {
          const failedRelays = allRelays.filter(r => !workingRelays.includes(r));
          console.log(`[Retry 1] Újrapróbálkozás ${failedRelays.length} sikertelen relay-vel...`);
  
          const retryPromises = failedRelays.map(async (relay) => {
            const isHardcoded = hardcodedRelays.includes(relay);
            const isWorking = await testRelayConnection(relay, isHardcoded, 2000);
            if (isWorking) {
              workingRelays.push(relay);
              console.log(`[Retry Success] Hozzáadott relay: ${relay}`);
            }
            return isWorking;
          });
  
          await Promise.all(retryPromises);
          console.log(`[Setup] 2. kör utáni működő relék: ${workingRelays.length}/${allRelays.length}`);
          relaySettings = workingRelays.reduce((acc, relay) => ({
            ...acc,
            [relay]: { read: true, write: true }
          }), {});
          await saveRelaySettings(relaySettings, cacheKey);
        } else {
          console.log("[Setup] Elértük vagy meghaladtuk a 7 működő relét a 2. kör előtt");
        }
  
        if (workingRelays.length < TARGET_RELAY_COUNT) {
          const failedRelays = allRelays.filter(r => !workingRelays.includes(r));
          console.log(`[Retry 2] Extra újrapróbálkozás ${failedRelays.length} sikertelen relay-vel, 5s timeouttal...`);
  
          const extraRetryPromises = failedRelays.map(async (relay) => {
            const isHardcoded = hardcodedRelays.includes(relay);
            const isWorking = await testRelayConnection(relay, isHardcoded, 5000);
            if (isWorking) {
              workingRelays.push(relay);
              console.log(`[Retry Success] Hozzáadott relay: ${relay}`);
            }
            return isWorking;
          });
  
          await Promise.all(extraRetryPromises);
          console.log(`[Setup] 3. kör utáni működő relék: ${workingRelays.length}/${allRelays.length}`);
          relaySettings = workingRelays.reduce((acc, relay) => ({
            ...acc,
            [relay]: { read: true, write: true }
          }), {});
          await saveRelaySettings(relaySettings, cacheKey);
        } else {
          console.log("[Setup] Elértük vagy meghaladtuk a 7 működő relét a 3. kör előtt");
        }
  
        console.log("[Setup] Végső relaySettings:", relaySettings);
        console.log("[Setup] Aktuális account.relaySettings a setup végén:", account?.relaySettings);
        await saveRelaySettings(relaySettings, cacheKey);
        if (account) {
          const relayList = Object.keys(relaySettings).map(relay => [relay, { read: true, write: true }]);
          const relayEvent = await sendRelays(
            relayList,
            account.relaySettings || {},
            account.proxyThroughPrimal || false
          );
          console.log("[Setup] Relay lista elküldve a Nostr-ra:", relayEvent);
        }
        setRelayStatus(`Kész! ${Object.keys(relaySettings).length} relé aktív`);
      } catch (error) {
        console.error("[Setup] Hiba a relay inicializálás során:", error);
        setRelayStatus("Hiba a relék frissítése közben");
  
        if (account?.relaySettings) {
          console.log("[Fallback] Visszaesés a meglévő account.relaySettings-re:", account.relaySettings);
          await account.actions.connectToRelays(account.relaySettings);
        } else {
          console.log("[Fallback] Nincs meglévő account.relaySettings, az aktuális relaySettings használata");
          await account.actions.connectToRelays(relaySettings);
        }
      } finally {
        setOpenSockets(false);
        setRelayTesting(false);
        console.log("[Setup] Relay inicializálás befejezve");
      }
    };
  
    console.log("[Setup] Relay inicializálás megkezdése");
    clearOldRelayCache();
  
    setTimeout(() => {
      setupRelays().catch(e => {
        console.error("[Setup] Kezdetlen hiba:", e);
      });
    }, 100);
  
    onCleanup(() => {
      console.log("[Cleanup] Relay kapcsolatok lezárása");
      setOpenSockets(false);
    });


    */





  });




  


// OnMount end ===============================================================================






  onCleanup(() => {
    setOpenSockets(false);
  })









  //form initialization logic
  createEffect(() => {
    if (account?.isKeyLookupDone) {
      account.publicKey && setProfile(account.publicKey);
    }
  });
//new
  createEffect(() => {
    if (profile?.userProfile?.about) {
      onExpandableTextareaInput();
    }
  });

  createEffect(() => {
    if (profile?.userProfile?.banner) {
      setBannerPreview(profile.userProfile.banner);
    }
  });

  createEffect(() => {
    if (profile?.userProfile?.picture) {
      setAvatarPreview(profile.userProfile.picture);
    }
  });

// NEW: Add effects for msn_ fields
/*
createEffect(() => {
  if (profile?.userProfile?.msn_country) {
    const countryInput = document.querySelector('input[name="msn_country"]') as HTMLInputElement;
    if (countryInput) {
      countryInput.value = profile.userProfile.msn_country || '';
    }
  }
});

createEffect(() => {
  if (profile?.userProfile?.msn_mapaddress) {
    const mapAddressInput = document.querySelector('input[name="msn_mapaddress"]') as HTMLInputElement;
    if (mapAddressInput) {
      mapAddressInput.value = profile.userProfile.msn_mapaddress || '';
    }
  }
});

createEffect(() => {
  if (profile?.userProfile?.msn_mapliveaddress) {
    const liveAddressInput = document.querySelector('input[name="msn_mapliveaddress"]') as HTMLInputElement;
    if (liveAddressInput) {
      liveAddressInput.value = profile.userProfile.msn_mapliveaddress || '';
    }
  }
});

createEffect(() => {
  if (profile?.userProfile?.msn_language) {
    const languageInput = document.querySelector('input[name="msn_language"]') as HTMLInputElement;
    if (languageInput) {
      languageInput.value = profile.userProfile.msn_language || '';
    }
  }
});

createEffect(() => {
  if (profile?.userProfile?.msn_clientregurl) {
    const clientRegUrlInput = document.querySelector('input[name="msn_clientregurl"]') as HTMLInputElement;
    if (clientRegUrlInput) {
      clientRegUrlInput.value = profile.userProfile.msn_clientregurl || '';
    }
  }
});

createEffect(() => {
  if (profile?.userProfile?.msn_myrss) {
    const rssInput = document.querySelector('input[name="msn_myrss"]') as HTMLInputElement;
    if (rssInput) {
      rssInput.value = profile.userProfile.msn_myrss || '';
    }
  }
});

createEffect(() => {
  if (profile?.userProfile?.msn_donationlink) {
    const donationLinkInput = document.querySelector('input[name="msn_donationlink"]') as HTMLInputElement;
    if (donationLinkInput) {
      donationLinkInput.value = profile.userProfile.msn_donationlink || '';
    }
  }
});


createEffect(() => {
  if (profile?.userProfile?.msn_btc) {
    const btcInput = document.querySelector('input[name="msn_btc"]') as HTMLInputElement | null;
    if (btcInput) {
      btcInput.value = profile.userProfile.msn_btc || '';
      console.log('Re-populating input field: msn_btc with value:', profile.userProfile.msn_btc);
    }
  }
});

createEffect(() => {
  if (profile?.userProfile?.msn_mobileappusername) {
    const mobileAppUsernameInput = document.querySelector('input[name="msn_mobileappusername"]') as HTMLInputElement;
    if (mobileAppUsernameInput) {
      mobileAppUsernameInput.value = profile.userProfile.msn_mobileappusername || '';
    }
  }
});

*/

createEffect(() => {
  if (!profile?.userProfile) return;

  msnFields.forEach(field => {
    const input = document.querySelector(`input[name="${field}"]`);
    if (!input) return;

    // Get value with fallback to default values
    const value = (profile.userProfile as PrimalUser)[field] || 
      getDefaultMSNValue(field);

    // Special handling for BTC field logging
    if (field === 'msn_btc' && value) {
      console.log('Re-populating input field: msn_btc with value:', value);
    }

    (input as HTMLInputElement).value = value;
  });
});

//----

  const onNameInput = () => {
    const value = nameInput?.value || '';

    setIsNameValid(usernameRegex.test(value))
  };



  const resetUpload = () => {
    if (fileUploadAvatar) {
      fileUploadAvatar.value = '';
    }

    if (fileUploadBanner) {
      fileUploadBanner.value = '';
    }

    setFileToUpload(undefined);
    setUploadTarget('none');
  };




  const onUpload = async (target: 'picture' | 'banner', fileUpload: HTMLInputElement | undefined) => {
    if (!fileUpload || !account?.relaySettings) {
      toast?.sendWarning("Please wait while we connect to relays...");
      return;
    }
  
    const file = fileUpload.files ? fileUpload.files[0] : null;
    if (file) {
      setUploadTarget(target);
      setFileToUpload(file);
    }
  }








  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
  
    if (!e.target || !account) {
      return false;
    }
  
    const data = new FormData(e.target as HTMLFormElement);
    console.log("📝 Form Data Before Submit:");
  
    // Log form data for debugging
    for (let [key, value] of data.entries()) {
      console.log(`${key}: ${value}`);
    }
  
    const picture = avatarPreview() || '';
    const banner = bannerPreview() || '';
  
    console.log("📷 Avatar URL:", picture);
    console.log("🎨 Banner URL:", banner);
  
    const name = data.get('name')?.toString() || '';
  
    if (!usernameRegex.test(name)) {
      toast?.sendWarning(intl.formatMessage(tSettings.profile.name.formError));
      return false;
    }
    
    // Build metadata object
    const metadata: Record<string, string> = {
      picture,
      banner,
      display_name: data.get('displayName')?.toString() || '',
      name,
      website: data.get('website')?.toString() || '',
      about: data.get('about')?.toString() || '',
      lud16: data.get('lud16')?.toString() || '',
      nip05: data.get('nip05')?.toString() || '',
    };
  
    // Process all MSN fields
    msnFields.forEach(field => {
      const value = data.get(field);
      metadata[field] = value !== null ? value.toString() : getDefaultMSNValue(field);
    });
  
    console.log("🚀 Final Metadata Before Sending:", metadata);
  
    const oldProfile = profile?.userProfile || {};
    console.log("🚀 Sending Profile Data to Nostr:", { ...oldProfile, ...metadata });
  
    // Send the metadata to Nostr
    const { success, note } = await sendProfile(
      { ...oldProfile, ...metadata }, 
      account?.proxyThroughPrimal || false, 
      account?.activeRelays || [], // Provide empty array as fallback
      account?.relaySettings || {} // Provide empty object as fallback
    );
    if (success) {
      console.log("✅ Profile successfully sent to Nostr!", metadata);
  
      note && triggerImportEvents([note], `import_profile_${APP_ID}`, () => {
        note && profile?.actions.updateProfile(note.pubkey);
        note && account.actions.updateAccountProfile(note.pubkey);
        note && navigate(app?.actions.profileLink(note.pubkey) || '/home');
        toast?.sendSuccess(intl.formatMessage(tToast.updateProfileSuccess));
      });
      return false;
    }
  
    console.error("❌ Profile update failed!");
    toast?.sendWarning(intl.formatMessage(tToast.updateProfileFail));
    return false;
  };
  

 
    const oldProfile = profile?.userProfile || {};

  
  return (
    <div class={styles.container}>
      <PageTitle title={intl.formatMessage(tSettings.profile.title)} />

      <PageCaption title={intl.formatMessage(tSettings.profile.title)} />

      <div id="central_header" class={styles.fullHeader}>
        <div id="profile_banner" class={`${styles.banner} ${flagBannerForWarning()}`}>
          <Show when={fileToUpload()}>
            <div class={styles.uploadingOverlay}><Loader /></div>
          </Show>
          <Show
            when={banner()}
            fallback={
            <div class={styles.bannerPlaceholder}>
              <label for="upload-banner">
                <div>{intl.formatMessage(tSettings.profile.uploadBanner)}</div>
              </label>
            </div>}
          >
            <label for="upload-banner">
              <img
                src={banner()}
                onerror={imgError}
              />
              <div>{intl.formatMessage(tSettings.profile.uploadBanner)}</div>
            </label>
          </Show>
        </div>

        <Show when={profile?.userProfile && !profile?.isFetching}>
          <div class={styles.userImage}>
            <div class={styles.avatar}>
              <Show when={fileToUpload()}>
                <div class={styles.uploadingOverlay}><Loader /></div>
              </Show>
              <label for="upload-avatar">
                <div class={styles.desktopAvatar}>
                  <Avatar src={avatarPreview()} size="xxl" />
                  <div class={styles.uploadAction}>
                    {intl.formatMessage(tSettings.profile.uploadAvatar)}
                  </div>
                </div>

                <div class={styles.phoneAvatar}>
                  <Avatar src={avatarPreview()} size="lg" />
                  <div class={styles.uploadAction}>
                    {intl.formatMessage(tSettings.profile.uploadAvatar)}
                  </div>
                </div>
              </label>
            </div>
          </div>
        </Show>

        <div class={styles.uploadActions}>
          <div class={styles.uploader}>
            <Uploader
              hideLabel={true}
              publicKey={account?.publicKey}
              nip05={account?.activeUser?.nip05}
              openSockets={openSockets()}
              file={fileToUpload()}
              //relays={account?.relaySettings} // Pass the relay settings
              onFail={() => {
                toast?.sendWarning(intl.formatMessage(tUpload.fail, {
                  file: fileToUpload()?.name,
                }));
                resetUpload();
              }}
              onRefuse={(reason: string) => {
                if (reason === 'file_too_big_100') {
                  toast?.sendWarning(intl.formatMessage(tUpload.fileTooBigRegular));
                }
                if (reason === 'file_too_big_1024') {
                  toast?.sendWarning(intl.formatMessage(tUpload.fileTooBigPremium));
                }
                resetUpload();
              }}
              onCancel={() => {
                resetUpload();
              }}
              onSuccsess={(url:string) => {
                if (uploadTarget() === 'picture') {
                  setAvatarPreview(url);
                }

                if (uploadTarget() === 'banner') {
                  setBannerPreview(url);
                }

                resetUpload();
              }}
            />
          </div>
          <div>
            <div class={styles.uploadButton}>
              <input
                id="upload-avatar"
                type="file"
                onChange={() => onUpload('picture', fileUploadAvatar)}
                ref={fileUploadAvatar}
                hidden={true}
                accept="image/*"
              />
              <label for="upload-avatar">
              {intl.formatMessage(tSettings.profile.uploadAvatar)}
              </label>
            </div>

            <div class={styles.uploadButton}>
              <input
                id="upload-banner"
                type="file"
                onchange={() => onUpload('banner', fileUploadBanner)}
                ref={fileUploadBanner}
                hidden={true}
                accept="image/*"
              />
              <label for="upload-banner">
              {intl.formatMessage(tSettings.profile.uploadBanner)}
              </label>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit}>

        
      <div class={styles.formSubmit}>
          <ButtonPrimary
            type='submit'
            disabled={!isNameValid()}
          >
            {intl.formatMessage(tActions.save)}
          </ButtonPrimary>
          <ButtonSecondary
            type='button'
            onClick={() => navigate(app?.actions.profileLink(account?.publicKey) || '')}
          >
            {intl.formatMessage(tActions.cancel)}
          </ButtonSecondary>
        </div>

        <br />

        <div class={styles.inputLabel_bold}>
          <label for='name'>{intl.formatMessage(tSettings.profile.name.label)}</label>
          <span class={styles.required}>
            <span class={styles.star}>*</span>
            {intl.formatMessage(tSettings.profile.required)}
          </span>
        </div>
        <div class={styles.inputWithPrefix}>
          <div class={styles.inputPrefix}>
            @
          </div>
          <input
            name='name'
            type='text'
            ref={nameInput}
            class={styles.inputWithPrefix}
            placeholder={intl.formatMessage(tSettings.profile.name.placeholder)}
            value={profile?.userProfile?.name || ''}
            onInput={onNameInput}
          />
        </div>
          <Show when={!isNameValid()}>
            <div class={styles.inputError}>
              {intl.formatMessage(tSettings.profile.name.error)}
            </div>
          </Show>



        <div class={styles.inputLabel_bold}>
          <label for='displayName'>{intl.formatMessage(tSettings.profile.displayName.label)}</label>
        </div>
        <input
          name='displayName'
          type='text'
          placeholder={intl.formatMessage(tSettings.profile.displayName.placeholder)}
          value={profile?.userProfile?.displayName || profile?.userProfile?.display_name || ''}
        />
        <br />

        <div class={styles.inputLabel_bold}>
          <label for='website'>{intl.formatMessage(tSettings.profile.website.label)}</label>
        </div>
        <input
          name='website'
          type='text'
          placeholder={intl.formatMessage(tSettings.profile.website.placeholder)}
          value={profile?.userProfile?.website || ''}
        />
        <br />     <br />

        <div class={styles.inputLabel_bold}>
          <label for='about'>{intl.formatMessage(tSettings.profile.about.label)}</label>
        </div>
        <textarea
          name='about'
          placeholder={intl.formatMessage(tSettings.profile.about.placeholder)}
          value={profile?.userProfile?.about || ''}
          ref={textArea}
          rows={1}
          data-min-rows={1}
          onInput={onExpandableTextareaInput}
        />

        <div class={styles.inputLabel_bold}>
          <label for='msn_mapaddress'>Címem</label>
        </div>
        <input
          name='msn_mapaddress'
          type='text'
          placeholder="Fizikai címem (v. napközbeni tartózkodási helyem)."
        />
          <div class={styles.inputLabel}>
          <label for="msn_mapaddress">Fizikai címem (napközbeni tartózkodási hely - pl. munkahely -, vagy lakcím), hogy a MagánSzövetség tagjai napközben a valós világban is elérhessenek. Profilodban nem látszik majd. A térképen - melyet fejlesztük - azok számára lesz látható akiket követsz (akik barátaid).
          </label>
          <br />
        </div>
        <br />


        <div class={styles.inputLabel_bold}>
  <label for="msn_email">Biztonságos E-mail címem</label>
</div>
<input
  name="msn_email"
  type="text"
  placeholder="Biztonságos, díjmentes ProtonMail. NEM Gmail, Freemail..."
  onInput={(event) => {
    const forbiddenWords = ["gmail", "outlook", "yahoo", "freemail", "citromail", "indamail"];
    let inputValue = event.target.value.toLowerCase();

    // Check if any forbidden word exists in the input
    forbiddenWords.forEach((word) => {
      if (inputValue.includes(word)) {
        inputValue = inputValue.replace(new RegExp(word, "gi"), ""); // Remove the forbidden word
      }
    });

    event.target.value = inputValue; // Update the field without forbidden words
  }}
/>
<div class={styles.inputLabel}>
  <label for="msn_email">
    Az email küldésnél a MagánSzövetség.Net-en belüli üzenetküldés sokkal bitonságosabb, mert direktben a másik felhasználóhoz érkezik és nem megy át internet szolgáltató szervereken (pl. Vodafone, Telekom); így nem megfigyelhető.
    Mindemellett Csak biztonságosnak számító email címet adj meg mely titkosítja az üzenetedet, pl. ProtonMail, Tutanota.
    Ne adj meg gmail, outlook, yahoo, freemail, citromail, indamail email címet, mert azt 'az egész világ' látja.
  </label>
</div>


{/*
        <div class={styles.inputLabel_bold}>
          <label for='msn_email'>Biztonságos E-mail címem</label>
        </div>
        <input
          name='msn_email'
          type='text'
          placeholder="Biztonságos, díjmentes ProtonMail. NEM Gmail, Freemail vagy a többi."
        />
        <div class={styles.inputLabel}>
          <label for="msn_email">Az email küldésnél a MagánSzövetség.Net-en belüli üzenetküldés sokkal bitonságosabb, mert direktben a másik felhasználóhoz érkezik és nem megy át internet szolgáltató szervereken (pl. Vodafone, Telekom); így nem megfigyelhető. Mindemellett Csak biztonságosnak számító email címet adj meg mely titkosítja az üzenetedet, pl. ProtonMail, Tutanota. Ne adj meg gmail, outlook, yahoo, freemail, citromail, indamail email címet, mert azt 'az egész világ' látja.</label>
        </div>
*/}
        <br />

        <div class={styles.inputLabel_bold}>
          <label for="msn_mobileappusername">Telefonos alkalmazás azonosítóm</label>
        </div>
        <input
        name="msn_mobileappusername"
        type="text"
        placeholder="Mega.nz alkalmazás email, vagy Signal felhasználónév"
        />
        <p class={styles.inputLabel}>
        <label for="msn_mobileappusername">A legbiztonságosabb telefonos beszélgető/ videóhívó alkalmazás a Mega.nz, mely naponta váltogatja a titkosítási kulcsát, file tárolást/megosztást is lehetővé tesz. Jónak számít még a Signal mobil alkalmazás, mely szintén nem ad 'hátsó kiskaput' nyomás hatására, mint a Telegram tette. Hozz létre egy Mega.nz fiókot a fennti biztonságos email-eddel, vagy hozz látre egy felhasználónevet a Signal-ban, mellyel a telefonszámod kiadása nélkül is tudsz hívásokat/videóhívásokat bonyolítani.</label>
        </p>
       <br />

        <div class={styles.inputLabel_bold}>
          <label for='msn_donationlink'>Felajánló linkem</label>
        </div>
        <input
          name='msn_donationlink'
          type='text'
          placeholder="Van felajánlási linked? (pl. Donably.com)"
        />
        <p class={styles.inputLabel}>
          <label for="msn_donationlink">Közösségi vezető vagy, vagy van egy projekted melyre gyűjtesz? Használd ki a magánSzövetség közösségi finanszírozási erejét. Hozz létre egy felajánló linket bármely támogatás-kiszolgáló fórumon, mint pl a Donably.com, és a MagánSzövetség.Net megjelenít profilodon egy "Felajánlás" gombot, melyre kattintva követőid felajánlásokat tehetnek. A MagánSzövetség nem kezel pénzt eközben, nem von le díjat és az adózásodért magad felelsz, melyről a felajánlás platformodon tudsz több információt találni.
        </label>
        </p>
        <br />




        <div class={styles.inputLabel_bold}>
          <label for='msn_btc'>Bitcoin (BTC) tárcám címe</label>
        </div>
        <input
          name='msn_btc'
          type='text'
          placeholder="Hasonló: bc1q3khvh3d3peshzu2nre3c6kx91esjet6gn1y2929hzfc5x8qk3w9s3wcsjr"
        />
        <p class={styles.inputLabel}>
          <label for="msn_btc">Add meg a Bitcoin (BTC) tárcád cím-kódját, hogy a kapcsolataid bitcoin felajánlásokat küldhessenek neked, vagy vásárolhassanak tőled bitcoint használva.
        </label>
        </p>
        <br />
{/*
       <div class={styles.inputLabel_bold}>
          <label for="msn_btc">
            {intl.formatMessage({ id: tSettingsBTC.profile.msn_btc.label.id, defaultMessage: tSettingsBTC.profile.msn_btc.label.defaultMessage })}
          </label>
        </div>
       <input
          name="msn_btc"
          type="text"
          placeholder={intl.formatMessage({ id: tSettingsBTC.profile.msn_btc.label.id, defaultMessage: tSettingsBTC.profile.msn_btc.label.placeholderText })} 
          value={profile?.userProfile?.msn_btc || ''}
        />
        <p class={styles.inputLabel}>
         <label for="msn_btc">
          {intl.formatMessage({ id: tSettingsBTC.profile.msn_btc.label.id, defaultMessage: tSettingsBTC.profile.msn_btc.label.description })}
          </label>
        </p>

        <br />
*/}



        <div class={styles.inputLabel_bold}>
          <label for='msn_myrss'>RSS hír/blog-csatorna linkem</label>
        </div>
        <input
          name='msn_myrss'
          type='text'
          placeholder="Van RSS hírfolyamod?"
        />
          <br />

        {/* BTC lightning out
        <div class={styles.inputLabel}>
          <label for='lud16'>{intl.formatMessage(tSettings.profile.lud16.label)}</label>
        </div>
        <input
          name='lud16'
          type='text'
          placeholder={intl.formatMessage(tSettings.profile.lud16.placeholder)}
          value={profile?.userProfile?.lud16 || ''}
        />

        <div class={styles.inputLabel}>
          <label for='nip05'>{intl.formatMessage(tSettings.profile.nip05.label)}</label>
        </div>
        <input
          name='nip05'
          type='text'
          placeholder={intl.formatMessage(tSettings.profile.nip05.placeholder)}
          value={profile?.userProfile?.nip05 || ''}
        />
        */}


        <div class={styles.formSubmit}>
          <ButtonPrimary
            type='submit'
            disabled={!isNameValid()}
          >
            {intl.formatMessage(tActions.save)}
          </ButtonPrimary>
          <ButtonSecondary
            type='button'
            onClick={() => navigate(app?.actions.profileLink(account?.publicKey) || '')}
          >
            {intl.formatMessage(tActions.cancel)}
          </ButtonSecondary>
        </div>

        <br></br>
        <br></br>



        <div class={styles.inputLabel}>
      <label>Kijelentkezés előtt <a href="MaganSzovetseg.Net/settings/account"><strong>MENTSD LE</strong> az általunk generált hosszú jelszavadat (Privát kulcsodat)</a> különben nem fogsz tudni visszajelentkezni a fiókodba, és a rendszer örök időkig úgy őrzi meg a fiókodat ahogy hagytad.</label>
      </div>
      <div class={styles.webVersion}>
          <ButtonSecondary onClick={() => {
            account?.actions.logout();
            navigate('/home');
          }}>
            {intl.formatMessage(tActions.logout)}
          </ButtonSecondary>
        </div>


      </form>
      </div>



    
  );
}

type SendRelaysResult = {
  success: boolean;
  note?: {
    id: string;
    pubkey: string;
    created_at: number;
    kind: number;
    tags: string[][];
    content: string;
    sig: string;
  };
  message?: string;
};


export default EditProfile;
