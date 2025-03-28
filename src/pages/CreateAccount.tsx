//{/* scr/pages/CreateAccount.tsx */}
import { useIntl } from '@cookbook/solid-intl';
import { useNavigate } from '@solidjs/router';
import { Component, createEffect, createSignal, For, Match, onCleanup, onMount, Show, Switch } from 'solid-js';
import { APP_ID } from '../App';
import Avatar from '../components/Avatar/Avatar';
import PageCaption from '../components/PageCaption/PageCaption';
import PageTitle from '../components/PageTitle/PageTitle';
import { useToastContext } from '../components/Toaster/Toaster';
import { usernameRegex, Kind } from '../constants';
import { useAccountContext } from '../contexts/AccountContext';
import { useMediaContext } from '../contexts/MediaContext';
import { useProfileContext } from '../contexts/ProfileContext';
import { getProfileContactList, getRelays, getSuggestions, getUserProfiles, sendProfile, sendRelays } from '../lib/profile';
import {
  actions as tActions,
  account as tAccount,
  settings as tSettings,
  toast as tToast,
  upload as tUpload,
} from '../translations';
import { NostrRelays, NostrUserContent, PrimalUser } from '../types/primal';

import styles from './CreateAccount.module.scss';
import { createStore, reconcile } from 'solid-js/store';
import { generateKeys, setTempNsec } from '../lib/PrimalNostr';
import { hexToNsec } from '../lib/keys';
import { storeSec } from '../lib/localStore';
import CreatePinModal from '../components/CreatePinModal/CreatePinModal';
import { useSearchContext } from '../contexts/SearchContext';
import { sendContacts, triggerImportEvents } from '../lib/notes';
import ButtonSecondary from '../components/Buttons/ButtonSecondary';
import { convertToUser, nip05Verification, userName } from '../stores/profile';
import { subsTo } from '../sockets';
import ButtonPrimary from '../components/Buttons/ButtonPrimary';
import ButtonFlip from '../components/Buttons/ButtonFlip';
import Uploader from '../components/Uploader/Uploader';
import { useSettingsContext } from '../contexts/SettingsContext';
//import { createNIP05Record } from "../api/cloudflare";
//import CryptoJS from 'crypto-js'; 

import { bech32 } from 'bech32';

const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
};


const hexToNpub = (hex: string): string => {
  try {
    const pubkeyBytes = hexToBytes(hex); // Convert hex to Uint8Array
    const words = bech32.toWords(pubkeyBytes); // Convert bytes to Bech32 words
    return bech32.encode('npub', words); // Encode as npub
  } catch (error) {
    console.error("Failed to convert hex to npub:", error);
    return 'N/A';
  }
};

const [hasSavedKey, setHasSavedKey] = createSignal(false);

//for suggested users
const [userProfiles, setUserProfiles] = createStore<Record<string, { avatar?: string; about?: string }>>({});


type AutoSizedTextArea = HTMLTextAreaElement & { _baseScrollHeight: number };

const connectToRelay = async (url: string, retries = 3, delay = 1000): Promise<WebSocket | null> => {
  let relay: WebSocket | null = null;
  let attempts = 0;

  while (attempts < retries) {
    try {
      relay = new WebSocket(url);

      await new Promise((resolve, reject) => {
        relay!.onopen = () => resolve(true);
        relay!.onerror = (error) => reject(error);
        relay!.onclose = () => reject(new Error("WebSocket closed prematurely"));
      });

      console.log("📡 Successfully connected to relay:", url);
      return relay;
    } catch (error) {
      attempts++;
      console.error(`❌ Failed to connect to relay (attempt ${attempts}):`, url, error);

      if (attempts < retries) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  console.error("❌ Max retries reached. Could not connect to relay:", url);
  return null;
};










const CreateAccount: Component = () => {  
  const intl = useIntl();
  const profile = useProfileContext();
  const media = useMediaContext();
  const account = useAccountContext();
  const search = useSearchContext();
  const toast = useToastContext();
  const settings = useSettingsContext();
  const navigate = useNavigate();

  let textArea: HTMLTextAreaElement | undefined;
  let fileUploadAvatar: HTMLInputElement | undefined;
  let fileUploadBanner: HTMLInputElement | undefined;
  let nameInput: HTMLInputElement | undefined;

  const [isBannerCached, setIsBannerCached] = createSignal(false);
  const [isMoreVisible, setIsMoreVisible] = createSignal(false);

  const [avatarPreview, setAvatarPreview] = createSignal<string>();
  const [bannerPreview, setBannerPreview] = createSignal<string>();

  const [accountName, setAccountName] = createSignal('');
  const [isNameValid, setIsNameValid] = createSignal<boolean>(false);

  const [fileToUpload, setFileToUpload] = createSignal<File | undefined>();
  const [uploadTarget, setUploadTarget] = createSignal<'picture' | 'banner' | 'none'>('none');
  



  const [currentStep, setCurrentStep] = createSignal<'name' | 'info' | 'follow' | 'key'>('name');
  //const [currentStep, setCurrentStep] = createSignal<'name' | 'info' | 'follow'>('name');
  const [openSockets, setOpenSockets] = createSignal(false);

  const [createdAccount, setCreatedAccount] = createStore<{ sec?: string, pubkey?: string, relays?: NostrRelays }>({});

  


{/*
  const createNIP05Record = async (username: string, pubkey: string) => {
    try {
      const response = await fetch('/api/client/v4/zones/...', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any required authentication headers here
        },
        body: JSON.stringify({ username, pubkey }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response was not ok');
      }
  
      return await response.json();
    } catch (error) {
      console.error("❌ Failed to create NIP-05 record:", error);
      throw error;
    }
  };
  
  const handleNIP05Registration = async () => {
    const username = accountName();
    const nostrPubKey = account?.publicKey;
  
    if (!usernameRegex.test(username)) {
      toast?.sendWarning("⚠️ Érvénytelen felhasználónév!");
      return;
    }
  
    if (!nostrPubKey) {
      toast?.sendWarning("⚠️ Nincs nyilvános kulcs!");
      return;
    }
  
    try {
      await createNIP05Record(username, nostrPubKey);
      toast?.sendSuccess(`✅ NIP-05 rekord létrehozva: ${username}@maganszovetseg.net`);
    } catch (error) {
      console.error("❌ Failed to create NIP-05 record:", error);
      toast?.sendWarning("⚠️ Nem sikerült létrehozni a NIP-05 rekordot.");
    }
  };

*/}

 // createEffect(() => {
 //   setOpenSockets(() => currentStep() === 'name');
 // });
 createEffect(() => {
  const shouldOpenSockets = currentStep() === 'name';
  if (openSockets() !== shouldOpenSockets) {
    setOpenSockets(shouldOpenSockets);
  }
});

  onCleanup(() => {
    setOpenSockets(false);
  });

  const flagBannerForWarning = () => {
    const dev = localStorage.getItem('devMode') === 'true';

    // @ts-ignore
    if (isBannerCached() || !dev) {
      return '';
    }

    return styles.cacheFlag;
  }

  const imgError = (event: any) => {
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

  const getScrollHeight = (elm: AutoSizedTextArea) => {
    var savedValue = elm.value
    elm.value = ''
    elm._baseScrollHeight = elm.scrollHeight
    elm.value = savedValue
  }

  const onExpandableTextareaInput: () => void = () => {
    const maxHeight = document.documentElement.clientHeight || window.innerHeight || 0;

    const elm = textArea as AutoSizedTextArea;

    const minRows = parseInt(elm.getAttribute('data-min-rows') || '0');

    !elm._baseScrollHeight && getScrollHeight(elm);

    if (elm.scrollHeight >= (maxHeight / 3)) {
      return;
    }

    elm.rows = minRows;
    const rows = Math.ceil((elm.scrollHeight - elm._baseScrollHeight) / 20);
    elm.rows = minRows + rows;
  }

  const onNameInput = () => {
    const value = nameInput?.value || '';

    setAccountName(() => value);
    setIsNameValid(usernameRegex.test(value))
  };






  const resetUpload = () => {
    fileUploadAvatar?.value && (fileUploadAvatar.value = '');
    fileUploadBanner?.value && (fileUploadBanner.value = '');
    
    setFileToUpload(undefined);
    setUploadTarget('none');
  };
 




const onUpload = (target: 'picture' | 'banner', fileUpload?: HTMLInputElement) => {
    const file = fileUpload?.files?.[0];
    
    if (!file) {
      console.error("Error: No file selected for upload.");
      return;
    }
  
    setUploadTarget(target);
    setFileToUpload(file);
  };






  

  


  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    console.log("✅ Submit event triggered");

    if (!e.target || !account) {
      console.error("❌ Form target or account context is missing");
      return false;
    }

  
    const pubkey = account.publicKey;
    console.log("🔑 Public key:", pubkey);
    const form = e.target as HTMLFormElement;

    const data = new FormData(form);

    const name = data.get('name')?.toString() || '';

    if (!usernameRegex.test(name)) {
      console.error("❌ Invalid username:", name);
      toast?.sendWarning(intl.formatMessage(tSettings.profile.name.formError));
      return false;
    }


    console.log("✅ Username is valid:", name);
    
     // Handle NIP-05 registration
//    await handleNIP05Registration();


    let relaySettings = account.defaultRelays.reduce<NostrRelays>((acc, r) => ({ ...acc, [r]: { write: true, read: true }}), {});
    console.log("🔗 Default relay settings:", relaySettings);

    const recommendedRelays = [
      //https://next.nostr.watch/relays

      "wss://nostr.huszonegy.world", //21
      "wss://relay.snort.social", // Snort relay
      "wss://purplepag.es",
      "wss://relay.nostr.brand",
      "wss://nostrelites.org",
      "wss://nos.lol",
      "wss://nostr.oxtr.dev",
      "wss://nostr-pub.wellorder.net",
      "wss://relay.shawnyeager.com/private",
      "wss://relay.nostraddress.com",
      "wss://relay.verified-nostr.com",
      "wss://sendit.nosflare.com",
      "wss://cfrelay.royalgarter.workers.dev",
      "wss://relay.czas.xyz",
      "wss://nostrelay.mamory-art.xyz",
      "wss://cfrelay.snowcait.workers.dev",
      "wss://nostr-relay.wlvs.space",
      "wss://aliens.contact.nostr/",
      "wss://nostr.vision/",
      "wss://Tesla.legacy.nostr/",
      "wss://psychology.healing.nostr/",
      "wss://systems.integration.nostr/",
      "wss://global.healthinitiative.nostr/",
      "wss://philosophical.debates.nostr/",
      "wss://mentalpeace.nostr/",
      "wss://global.consciousness.nostr/",
      "wss://science.frontiers.nostr/",
      "wss://nostr.buddhistnetwork.nostr/",
      "wss://esoteric.knowledge.nostr/",
      "wss://primal.b-cdn.net", // Primal's default relay
      "wss://relay.damus.io",   // Damus relay
      "wss://nostr-relay.wlvs.space", // 
      //"wss://wallet.primal.net/v1", // BTC out
    ];

    // MERGING THE RELAYS
    recommendedRelays.forEach((relay) => {
      relaySettings[relay] = { write: true, read: true };
    });

    console.log("🔗 Updated relay settings with recommended relays:", relaySettings);

//adding the supportLink to the metadata object
    let metadata: Record<string, string> = {};

    [ 'displayName',
      'name',
      'website',
      'about',
      'lud16',
      'nip05',
      'picture',
      'banner',

      // msn_ = maganszovetseg.Net Client metatags
      'msn_country',  // user country, optional
      'msn_mapaddress',  // user address for map display, optional, used in a map component, so that can also physically connect and purchase from each other
      'msn_ismapaddressvisible',  // user address for map display, stores, if the address is visible for followers in the network on the map or not
      'msn_ismapaddressvisible_tosecondlevel',  //Shall the address and/or the live location be visible anytime for socondary aquaintances (the ones followed by the ones i follow)
      'msn_mapliveaddress',  // actual geolocation of the browser for map display, so when are on the road/out, they can meet for a coffee
      'msn_language', // user language, so that we can show them the content they understand
      'msn_clientregurl', //url of nostr client, where the user initially registered, as all clients have their own communities to reach
      'msn_myrss', // the rss feed of the user so that serious publicists from eg. Substack can share their content
      'msn_donationlink', // the FIAT donation link of the users to utilize also the FIAT world
      'msn_btc', // because many people still have traditional BTC wallets that they wish to use, as well
      'msn_mobileappusername', // Telegram/ Signal / Threema username for voice calls and video chat, let us let them talk to each other 
      'msn_email', // if they need to send files to each other, in the css we recommend secure mails, like protonmail, tutanota, etc.
      'msn_isMediumSupported', // does the user support the Médium Value declaration
      'msn_isOptimumSupported', // does the user support the Optimum Value declaration
      'msn_WantsToHelp', // does the user support the Optimum Value declaration
    ]
	.forEach(key => {
        if (data.get(key)) {
          metadata[key] = data.get(key) as string;
          if (key === 'displayName') {
            metadata['display_name'] = data.get(key) as string;
          }
        }
      }
    );

    //defaults in MaganSzovetseg.Net
    metadata['msn_country'] = "Magyarország"; 
    metadata['msn_mapaddress'] = "";
    metadata['msn_ismapaddressvisible'] = "false";
    metadata['msn_ismapaddressvisible_tosecondlevel'] = "false";
    metadata['msn_mapliveaddress'] = "";    
    metadata['msn_language'] = "Magyar";
    metadata['msn_clientregurl'] = "MaganSzovetseg.Net";
    metadata['msn_myrss'] = "";
    metadata['msn_donationlink'] = "";
    metadata['msn_btc'] = "";
    metadata['msn_mobileappusername'] = "";
    metadata['msn_email'] = "";
    metadata['msn_isMediumSupported'] = "false";
    metadata['msn_isOptimumSupported'] = "false";
    metadata['msn_WantsToHelp'] = "false";

    console.log("📝 Metadata to be sent:", metadata);

    const { success } = await sendProfile(metadata as Record<string, string>, account?.proxyThroughPrimal || false, account.relays, relaySettings);
    console.log("📤 Profile send result:", success);


    if (success) {
      console.log("✅ Profile successfully sent");
      await (new Promise((res) => setTimeout(() => res(true), 100)));

      toast?.sendSuccess(intl.formatMessage(tToast.updateProfileSuccess));
      pubkey && account.actions.updateAccountProfile(pubkey);
      // pubkey && getUserProfiles([pubkey], `user_profile_${APP_ID}`);
      console.log("🔄 Updated account profile");

    // Automatically follow "MagánSzövetség Ügyfélszolgálat" and "MagánSzövetség Mozgalom"
    const supportUserPubkey1 = 'abf9805b9b554058587d7f938ee2b52c8c41f51c5d311842da02efbec52cc7d5'; // Ügyfélszolgálat
    const supportUserPubkey2 = 'd774c995c768c89c0e21862a37a778010bff576b9649a8144acc3beea2801273'; // Mozgalom
    let contactTags = [
      ['p', supportUserPubkey1],
      ['p', supportUserPubkey2],
      ...followed.map(pk => ['p', pk]),
    ];

      if (pubkey) {
        // Follow himself
        contactTags.push(['p', pubkey]);
      }

      console.log("📇 Contact tags to be sent:", contactTags);


      const date = Math.floor((new Date()).getTime() / 1000);
      const sendResult = await sendContacts(contactTags, date, '', account.proxyThroughPrimal, account.relays, relaySettings);
      console.log("📤 Contacts send result:", sendResult);


      if (sendResult.success && sendResult.note) {
        console.log("✅ Contacts successfully sent");
        triggerImportEvents([sendResult.note], `import_contacts_${APP_ID}`, () => {
          account.actions.updateContactsList()
          // getProfileContactList(pubkey, `user_contacts_${APP_ID}`);
          console.log("🔄 Updated contacts list");
        });
      } else {
        console.error("❌ Failed to send contacts!");
      }

      const relayResult = await sendRelays(account.relays, relaySettings, account.proxyThroughPrimal);
      console.log("📤 Relays send result:", relayResult);
      
      if (relayResult.success && relayResult.note) {
        console.log("✅ Relays successfully updated.");
        triggerImportEvents([relayResult.note], `import_relays_${APP_ID}`, () => {
          // getRelays(pubkey, `user_relays_${APP_ID}`);
          account.actions.updateRelays()
          console.log("🔄 Updated relays");
        });
      } else {
        console.error("❌ Failed to update relays!");
      }

      form.reset();
      console.log("✅ Form reset");

      setShowCreatePin(true);
      console.log("🔄 Show create pin modal");

      return false;
    }
    
    console.error("❌ Failed to send profile");
    toast?.sendWarning(intl.formatMessage(tToast.updateProfileFail))

    return false;
  };

  //const [createdAccount, setCreatedAccount] = createStore<{ sec?: string, pubkey?: string, relays?: NostrRelays }>({});
 // const [currentStep, setCurrentStep] = createSignal<'name' | 'info' | 'follow'>('name');
  const [showCreatePin, setShowCreatePin] = createSignal(false);



  
    const toNext = () => {
      switch (currentStep()) {
      case 'name':
        setCurrentStep('info');
        break;
      case 'info':
        setCurrentStep('follow');
        break;
      case 'follow':
        setCurrentStep('key'); // Navigate to the final step
        break;
      case 'key':
        // No further steps, so do nothing
        break;
       default:
        break;
      }
    };

    const toPrevious = () => {
    switch (currentStep()) {
      case 'info':
        setCurrentStep('name');
        break;
      case 'follow':
        setCurrentStep('info');
        break;
      case 'key':
        setCurrentStep('follow'); // Go back from the final step
        break;
      default:
        break;
      }
    };

  type SuggestedUserData = {
    users: Record<string, PrimalUser>,
    groupNames: string[],
    groups: Record<string, string[]>,
  }

  const [suggestedData, setSuggestedData] = createStore<SuggestedUserData>({
    users: {},
    groupNames: [],
    groups: {},
  });



  const getSuggestedUsers = async () => {
    console.log("🔍 Fetching profile data for MagánSzövetség users...");
  
    // Hardcoded pubkeys and default data
    const users = [
      {
        pubkey: "abf9805b9b554058587d7f938ee2b52c8c41f51c5d311842da02efbec52cc7d5", // Ügyfélszolgálat
        npub: "npub140ucqkum24q9skra07fcac449jxyragut5c3ssk6qthma3fvcl2svfvky2",
        name: "MagánSzövetség.Net Ügyfélszolgálat",
        picture: "/assets/images/default_avatar.png", // Default profile picture
        //picture: "https://cdnwin.maganszovetseg.net/src/assets/images/default_avatar.png", // Default profile picture
        //picture: "https://cdnwin.maganszovetseg.net/src/assets/icons/logo_fire.png",
        about: "MagánSzövetség.Net Ügyfélszolgálat - Kérdésed van? Írj nekünk!",
      },
      {
        pubkey: "d774c995c768c89c0e21862a37a778010bff576b9649a8144acc3beea2801273", // Mozgalom
        npub: "npub16a6vn9w8dryfcr3psc4r0fmcqy9l74mtjey6s9z2esa7ag5qzfes2ml3w6",
        name: "MagánSzövetség Mozgalom - Szabadság, Béke, Élet!",
        picture: "/assets/images/default_avatar.png", // Default profile picture
        //picture: "https://cdnwin.maganszovetseg.net/src/assets/icons/logo_fire.png",
        about: "MagánSzövetség Mozgalom - Közösségi szervezet a szabadságért és a békéért!",
      },
      {
        pubkey: "42e0cc5327274c3376322528d014f0e33a9d4a71fb448624fc7c3587043b115e", // Mozgalom
        npub: "npub1gtsvc5e8yaxrxa3jy55dq98suvaf6jn3ldzgvf8u0s6cwppmz90qdacmmq",
        name: "Szkíta TV",
        //picture: "/assets/images/default_avatar.png", // Default profile picture
        picture: "https://primal.b-cdn.net/media-cache?s=m&a=1&u=https%3A%2F%2Fm.primal.net%2FOatV.png",
        about: "Szent Korona Igazsága Tanácsadó és Jogvédő Egyesület TV-je",
      },



    ];

  
    const relays = [
      "wss://relay.damus.io", // Primary relay
      "wss://nostr-relay.wlvs.space", // Fallback relay 1
      "wss://primal.b-cdn.net", // Fallback relay 2
    ];
  
    // Use the new `connectToRelay` function
const relay = await connectToRelay("wss://relay.damus.io");
if (!relay) {
  toast?.sendWarning("Failed to connect to relay. Please try again later.");
  return;
}

// Create a filter for both users
const filter = {
  kinds: [0], // Kind 0 = metadata
  authors: users.map((user) => user.pubkey), // Fetch metadata for both users
};

// Send the request to the relay
relay.send(JSON.stringify(["REQ", `fetch_profiles_${APP_ID}`, filter]));

relay.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data[0] === "EVENT" && data[2].kind === 0) {
    console.log("✅ Profile metadata received:", data[2]);

    // Find the corresponding user and update their metadata
    const user = users.find((u) => u.pubkey === data[2].pubkey);
    if (user) {
      const content = JSON.parse(data[2].content);
      user.name = content.name || user.name;
      user.picture = content.picture || user.picture;
      user.about = content.about || user.about;
    }
  }
};

relay.onclose = () => {
  console.log("📡 Relay connection closed.");
};





    // **Ensure "Follow" buttons are ON by default**
    setFollowed(() => users.map((user) => user.pubkey)); // ✅ Both users are marked as already followed
  
    // **Update suggested data**
    setSuggestedData({
      users: users.reduce((acc, user) => ({ ...acc, [user.pubkey]: user }), {}),
      groupNames: ["Ajánlott Kapcsolatok"],
      groups: { "Ajánlott Kapcsolatok": users.map((user) => user.pubkey) },
    });
  
    console.log("✅ Suggested users updated:", users);
  };

















  onMount(() => {
    const { sec, pubkey } = generateKeys(true);
  
    // @ts-ignore
    const nsec = hexToNsec(sec);
  
    account?.actions.setSec(nsec);
    setTempNsec(nsec);
  
    // Ensure pubkey is set correctly
    setCreatedAccount({ sec: nsec, pubkey });
    getSuggestedUsers();
  });

  const onStoreSec = (sec: string | undefined) => {
    storeSec(sec);
    setTempNsec(undefined);
    setCreatedAccount(reconcile({}));
    onAbort();
    navigate('/home');
  }

  const onAbort = () => {
    //setShowCreatePin(false);
        console.log("🚪 Mégsem... Vissza a főoldalra.");
        navigate('/');  // Redirect to root instead of an invalid route
  }

  const clearNewAccount = () => {
    console.log("🗑️ Clearing new account data...");
    account?.actions.setSec(undefined);
    setTempNsec(undefined);
    setCreatedAccount(reconcile({}));

    //navigate('/home');
    navigate('/');  // Redirect safely
  }





//ADAT LETÖLTÉS GOMB, TXT FILE-BA

const downloadPrivateKeyFile = () => {
  const displayName = (document.querySelector('input[name="displayName"]') as HTMLInputElement)?.value || 'N/A';
  const npub = hexToNpub(createdAccount.pubkey || '');

  const filename = "MagánSzövetség.Net__Azonosítóim-SZIGORÚAN_BIZALMAS.txt";
  const content = `
MaganSzovetseg.Net

belépéshez használt hosszú jelszavam (privát kulcsom):

${createdAccount.sec}
  

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
*****     MagánSzövetség.Net     *****
        Szabadság, Béke, Élet!

    - Edward Snowden ajánlásával -

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


*** Szeretettel üdvözlünk a MagánSzövetség.Net-en!*** 🚀🎉


A regisztrációkor beállított adatok a következők:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   
🔹 👤 Felhasználónevem: ${accountName()}
  
🔹 📝 Megjelenített nevem: ${displayName}
    
🔹 🛡️ Másokkal megosztható hosszú felhasználónevem (nyilvános kulcs):
${npub}
    
🔹 🔑 Belépéshez használandó hosszú jelszavam (privát kulcs) -ismételten-:
${createdAccount.sec}

⚠️❗  Fontos: Kérlek, őrizd meg ezt a hosszú jelszót biztonságos helyen! A MagánSzövetség.Net-be csak ezzel a jelszóval tudsz belépni.
Mentsd jó helyre, mert ha elvész, nem tudsz belépni, mert a rendszer biztonsági felépítése miatt nem ad új jelszót.
Ha elvész, akkor fiókod mindörökre úgy marad ahogy hagytad. Sose küldd el sehova az interneten ezt a file-t, vagy a jelszavadat - hacsak nem https://ProtonMail.com díjmentes titkosított emailt használsz -, mert az egyenlő a kiszivárogtatással.



További információk:
━━━━━━━━━━━━━━━━━━━━
🔹 🔐 PIN KÓD: Belépéshez megadhattál opcionálisan egy PIN kódot is. Ha nem adtál meg, a következő belépésnél a rendszer ismét felkínálja lehetőségét. Azzal egyszerűen beléphesz. Viszont, nem változtatható. Ha a PIN kódodat elveszted, még mindig beléphetsz a hosszú jelszavaddal (privát kulcsoddal).

🔹 📧 ÜGYFÉLSZOLGÁLAT: A MagánSzövetség Ügyfélszolgálatnak bármikor írhatsz, ha kérdésed van. Kérlek vedd figyelembe, hogy hobbi-időnkben üzemeltetjük ezt az oldalt, azért, hogy egy biztonságos kommunikációs platformunk lehessen - és összefogja magán-megállapodással a pozitivitást támogató embereket (Értékrend Minimum) -. Nem fizet ezért nekünk senki - ezzel ellentétbe nekünk kerül pénzbe az üzemeltetés / szerver fenntartás és a kapcsolódó technikai előfizetések -, így az esetleges kéréseidet, javaslataidat ennek figyelembevételével formáld.

🔹 💰 FELAJÁNLÁS: Hívj meg minket egy kávéra, vagy támogass minket egy liter benzin árával. Felajánlásod nagyon jól jönne, hogy társadalmi munkánk mellett ne kelljen még az oldal üzemeletését is finanszíroznunk saját zsebből.
Felajánló link (kártyás felajánláshoz): 💳 https://www.donably.com/maganszovetseg  Bitcoin (BTC) tárcánk:⚡ bc1q88wqru8g7gwsvctennvhuuvlc4kzyn7qdvty3p
Minden apró felajánlásnak nagyon örülünk! Sok kicsi sokra megy!

🔹 ⚡ BITCOIN: Hasonlóképp, a rendszerbe már be van építve a bitcoin fizetés és felajánlás lehetősége, viszont egyelőre a megjelenése nincs engedélyezve, mert egy pénzügyi manővert készítünk elő.

🔹 📢 OSZD MEG!: Oszd meg a jót! Értesítsd rokonaidat, barátaidat a MagánSzövetség.Net-ről! Értesítsd őket, hogy a megfigyelhetetlen üzenetek és cenzúrázhatatlansága miatt a szakértők azt mondják róla, hogy ez a jövő közösségi hálója. Edvard Snowden, az Amerikai Információ-Biztonsági intézet volt munkatársa, ki 2013-ban 29 évesen kiszivárogtatta a sajtónak, a PRISM (prizma) rendszer létrejöttét, ezért Moszkvába kellett menekülnie. A PRISM egy adatgyüjtő és megfigyelő rendszer. Az Obama adminisztráció összekötötte a Facebook/Meta (/Fb Messenger), Google/Gmail, Yahoo/YahooMail, Microsoft (Whatsapp, Skype), Viber, Apple stb. adatait, és automatikus keresőszavakkal megfigyeli azt. Ezt hozta nyilvánosságra Edward Snowden, aki a mi biztonságos közösségi hálónk tagja és ajánlja azt cenzúrázhatatlansága és kommunikációs adatbiztonsága miatt. Nem csoda, hogy az oldal angol nyelvű verzióját már több mint 2 millió szabadság-szerető ember használja világszerte, hogy megszabaduljon a megfigyelés és a cenzúra háttér-rendszeréből! Mondd el nekik, hogy ráadásul mindez, díjmentes! (Közösségi finanszírozás tartja fenn.)
Alább találsz egy bővebb tájékoztató dokumentumot az oldalról. https://mega.nz/file/pvgFHD7A#y3YLNJ54HPHrnMzocC2CJpitg2KUekQY8R5BmW2RHZM

🔹 📱 TEL APP : Telefonos appunk programkódja elkészült, már csak le kell fordítanunk magyarra. Hamarosan ez is várható.
Emellett, telefonodon kommunikálj Signal App-al vagy Mega.nz App-al, mely radar alatt tart. A többi vagy nem-titkosított, vagy kiskaput adott hatalmi nyomásra (Viber, Telegram, Messenger, Whatsapp). A MagánSzövetség.Net rendszere úgy van felépítve, hogy egyrészt offshore környezetben működik, másrészt, még ha kiskaput is kellene biztosítania, üzeneteidet a most letöltött privát kulcsod nélkül - melyet a rendszer nem tárol el és CSAK a Te kezedben van - még a rendszer sem tudja elolvasni; így üzeneteid tökéletes biztonságban vannak a MagánSzövetség.Net-en.

🔹 MAGÁNSZÖVETSÉG MOZGALOM: A MagánSzövetség nem csupán egy közösségi háló, hanem egy magánjogi alapú mozgalom is. Ez annyit tesz, hogy támogat minden egyéb véleményformálót vagy közösséget, kik regisztrálnak az oldalra. A sokszínűség egységét a közös Értékrend Minimum adja, melynek lényege nem más, mint hogy egyetértünk abban, hogy a pozitivitás jó/támogatandó és a negativitás pedig nem-jó/nem támogatandó. A szocio-pszichológia tudományának Spirál Dinamika nevű módszerére alapozva az Értékrend Minimumban felsoroltuk az egyén és a közösség fejlődésének különböző fázisait és az azon szinteken megjelenő pozitív és negatív látásmódokat. Ez a tudományos módszer garantálja az egyéni /csoportos színezettől-, stílustól-, észjárástól-, szokásoktól mentességet; ezáltal, megkérdőjelezhetetlen. Így összeírtuk -ahogy Plátó fejezte ki- az univerzalitásokat (túlélés, család, erő, igazság, hatékonyság, közösség stb.), hogy végül megegyezhessünk, hogy ezek pozitív oldalát támogatjuk, a hibáit és negatív megközelítéseit pedig nem. Érdemes megjegyezni, hogy a különböző közösségek különböző módokon és stílusban igyekezhetnek céljaik elérése fele, miközben mindannyian egyetértünk azon univerzalitásban, hogy ami pozitív az támogatjuk, ami negatív, azt nem. Ez a tudomány szekuláris iránytűje, mely azoknak mutat irányt, kik a pozitivitásnak nem feltétlenül a különböző vallási szemüvegeken keresztül megfogalmazott irányelveket követik (pl. a Tízparancsolat pozitív látásmódját), hanem a pozitív vallásokat átívelő és azzal összhangban levő bár független/ szekuláris /univerzális jót / pozitivitást (is) támogatják. Ez a szekuláris pozitivitás képes összefogni egy országot, egy nemzetet. Ez azért van, mert pl. Magyarország 42 százaléka hivatalosan keresztény (mely megoszlik protestantizmusra, és katolicizmusra), ezen kívül vannak nem keresztények, egyistenhitűek, többistenhitűek és ateisták. A teljes országot csak egy pozitízan univerzális rendszer tudja összefogni. A pozitív vallások támogatóit maga a pozitivitás elfogadása/ támogatása köti össze. Emellett pedig, a szólásszabadság támogatóit egy megfigyelhetetlen kommunikációt nyujtó rendszer (MagánSzövetség.Net). A MagánSzövetség e kettőt nyújtja, támogatva mindazokat, ki a pozitivitás mint olyan csoportokon/vallásokon/nézőpontokon átívelő egységével egyetértenek.


Köszönjük, hogy velünk tartasz! 💙

Tisztelettel,
MagánSzövetség Ügyfélszolgálat

Nyilvános kulcsunk (melyre rákereshetsz a rendszerben jobbra fennt a Keresés mezőben):
npub140ucqkum24q9skra07fcac449jxyragut5c3ssk6qthma3fvcl2svfvky2



___________________________________________________________________________________________________________________
📜 FONTOS DOKUMENTUMOK
Amiben mindannyian egyetértünk a MagánSzövetség.Net -en, és a regisztrációnkkor digitálisan aláírjuk hosszú jelszavunkkal:

* Értékrend Minimum: https://maganszovetseg.net/assets/docs/I._%C3%89RT%C3%89KREND_MINIMUM.pdf
* Felhasználói Feltételek: https://maganszovetseg.net/Terms
* Adatvédelem és adatbiztonság: https://maganszovetseg.net/Privacy
* Bővebb tájékoztató dokumentum az oldalról: https://mega.nz/file/pvgFHD7A#y3YLNJ54HPHrnMzocC2CJpitg2KUekQY8R5BmW2RHZM



    `;
    
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setHasSavedKey(true); // Mark that the key has been saved or downloaded
  };


















  const [followed, setFollowed] = createStore<string[]>([])

  const isFollowingAllInGroup = (group: string) => {
    const pubkeys = suggestedData.groups[group] || [];
    return !pubkeys.some((p) => !followed.includes(p));
  };

  const toggleFollowGroup = (group: string) => {
    if (isFollowingAllInGroup(group)) {
      onUnfollowGroup(group);
    }
    else {
      onFollowGroup(group)
    }
  };

  const onFollowGroup = (group: string) => {
    const pubkeys = suggestedData.groups[group] || [];
    let newFollows = pubkeys.filter(p => !followed.includes(p));
    setFollowed((fs) => [ ...fs, ...newFollows ]);
  };

  const onUnfollowGroup = (group: string) => {
    const pubkeys = suggestedData.groups[group] || [];

    const newFollows = followed.filter(p => !pubkeys.includes(p));

    setFollowed(() => [ ...newFollows ]);
  };

  const toggleFollowAccount = (pubkey: string) => {
    setFollowed((prev) => {
      if (prev.includes(pubkey)) {
        return prev.filter((key) => key !== pubkey);
      } else {
        return [...prev, pubkey];
      }
    });
  };

  const onFollow = (pubkey: string) => {
    setFollowed(followed.length, () => pubkey);
  }

  const onUnfollow = (pubkey: string) => {
    const follows = followed.filter(f => f !== pubkey);
    setFollowed(() => [...follows]);
  }
















  const suggestedUser = (pubkey: string) => suggestedData.users[pubkey];

  return (

    <div class={styles.container}>
      <PageTitle title={intl.formatMessage(tAccount.create.title)} />

      <PageCaption title={intl.formatMessage(tAccount.create.title)} />

      <div class={styles.creationContent}>

          <div class={styles.stepIndicator}>
          <div class={`${styles.indicate} ${styles.light}`}></div>
          <div class={`${styles.indicate} ${currentStep() !== 'name' ? styles.light : styles.dark}`}></div>
          <div class={`${styles.indicate} ${currentStep() === 'follow' ? styles.light : styles.dark}`}></div>
          <div class={`${styles.indicate} ${currentStep() === 'key' ? styles.light : styles.dark}`}></div>
        </div>

        <div class={['name', 'info'].includes(currentStep()) ? '' : 'invisible'}>

          <div id="central_header" class={styles.fullHeader}>
            <Switch>

              <Match when={currentStep() === 'name'}>
                <div class={styles.stepIntro}>
                  {intl.formatMessage(tAccount.create.descriptions.step_one)}
                </div>
              </Match>

              <Match when={currentStep() === 'info'}>
                <div class={styles.stepIntro}>
                  {intl.formatMessage(tAccount.create.descriptions.step_two)}
                </div>
              </Match>

            </Switch>

            <div id="profile_banner" class={`${styles.banner} ${flagBannerForWarning()}`}>
              <Show when={fileToUpload() !== undefined}>
                <div class={styles.uploadingOverlay}></div>
              </Show>




              <Show
                when={banner()}
                fallback={
                  <div class={styles.bannerPlaceholder}>
                    <label for="upload-banner">
                      <div>{intl.formatMessage(tSettings.profile.uploadBanner)}</div>
                    </label>
                  </div>
                }
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

            <div class={styles.userImage}>
              <div class={styles.avatar}>
                <Show when={fileToUpload() !== undefined}>
                  <div class={styles.uploadingOverlay}></div>
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

            <Show
              when={currentStep() === 'name'}
              fallback={
                <div class={styles.blankActions}></div>
              }
            >
              <div class={styles.uploadActions}>
                <div class={styles.uploader}>
                  <Uploader
                    hideLabel={true}
                    publicKey={account?.publicKey}
                    openSockets={openSockets()}
                    file={fileToUpload()}
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
            </Show>
          </div>
        </div>



        <form onSubmit={onSubmit}>








  <Show
    when={currentStep() === 'name'}
        >
        <br/>
        <div>Értékrend Minimum
          <span style={{ "font-size": "6px", "font-weight": "bold", display: "block" }}></span>
        </div>
        <div class={styles.qrContainer} style={{ display: "flex", "flex-direction": "row", "align-items": "flex-start", gap: "20px" }}>
        </div>
        
        <div class="qrContainer" style={{ display: "flex", "flex-direction": "row", "align-items": "flex-start", gap: "20px" }}>

          <div class="qrCode" style={{ flex: "0 1 auto", "text-align": "center" }}>
          <div class={styles.inputLabel} style={{ flex: "1", display: "flex", "align-items": "flex-start" }}>

            <a href="/assets/docs/I._ÉRTÉKREND_MINIMUM.pdf" download>
            <img
              class="downloadPdfImg"
               src="/icons/DownloadPdf_nh.png"
               width={100}
              alt="Download PDF"
              style={{ transition: "all 0.3s ease" }}
            />
            </a>

          </div>
        </div>
    
    

        {/* Right Column: Long Text (Aligned to Top) */}
        <div class={styles.inputLabel} style={{ flex: "1", display: "flex", "align-items": "flex-start" }}>


          <label>
            <span class={styles.help}>
            Kattins az ikonra, hogy letöltsd az Értékrend Minimum dokumentumot. Ez tartalmazza azt a pozitív értékrend-felsorolást, mellyel mindannyian egyetértünk a MagánSzövetség.Net-en.
            Lényege, hogy elkerüljük vagy negligáljuk a rosszat/ a negativitást, és támogatjuk a jót/ a pozitivitást.
            Fiókod létrehozásával digitálisan aláírod e dokumentumot. Töltsd le, és olvasd el legalább a dokumentum elején levő összefoglalót, mielőtt regisztrálsz!
            </span>
          </label>
        </div>

      </div>
  </Show>







        <br></br>


          <div class={currentStep() === 'name' ? '' : 'invisible'}>
            <div class={styles.inputLabel}>
              <label for='name'>
                {intl.formatMessage(tSettings.profile.name.label)}
                <span class={styles.help}>
                  {intl.formatMessage(tSettings.profile.name.help)}
                </span>
              </label>
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
                onInput={onNameInput}
              />
            </div>
            <Show when={accountName().length > 0 && !isNameValid()}>
              <div class={styles.inputError}>
                {intl.formatMessage(tSettings.profile.name.error)}
              </div>
            </Show>

            <div class={styles.inputLabel}>
              <label for='displayName'>
                {intl.formatMessage(tSettings.profile.displayName.label)}
                <span class={styles.help}>
                  {intl.formatMessage(tSettings.profile.displayName.help)}
                </span>
              </label>
            </div>

            <input
              name='displayName'
              type='text'
              placeholder={intl.formatMessage(tSettings.profile.displayName.placeholder)}
            />







    <div class={styles.inputLabel}>
    <br></br>
              <label>
                <span class={styles.help}>
                A "Következő" zöld gomb megnyomásával a világot összekötő Noszter nevű (ang.: nostr) kapcsolati hálózatba regisztrálsz, melyben már majdnem 2 millió olyan ember van kinek szívügye a szólásszabadság és az információ-biztonság. Ehhez, a Maganszövetseg.Net csupán hozzáférési felületet (klienst) biztosít. Regisztrációddal automatikusan létrehozol egy hosszú kód-szerű felhasználónevet (Nyilvános kulcsot), mely nyilvánosan azonosít téged a Noszter hálózatban. Emellett, regisztrációddal létrehozol egy Privát kulcsot is (mely hasonlatos egy nagyon hosszú és biztonságos jelszóhoz). Ezt követően a bejegyzéseidet semmilyen illetéktelen személy/szervezet/hivatal nem tudja megnyitni az internetes hálózatban (és annak szerverein). Nem tudja adataidat és üzeneteidet elolvasni, csak az, akinek e Privát kulcs a birtokában van. Még mi a MagánSzövetség.Net üzemeltetői sem tudjuk megtekinteni adataidat, üzeneteidet, csak Te magad. A Privát kulcsod mentsd el, tárold biztonságos helyen, és ne add oda senkinek. A Nyilvános kulcsodat (hosszú felhasználónevedet) megoszthatod bátran.               
                </span>
              </label>
    </div>

   <div class={styles.inputLabel}>
   <label>
                <span class={styles.help}>
                
                A <strong><a href="https://MaganSzovetseg.Net/Terms" target="_blank">Felhasználói és Szolgáltatási Feltételeket</a></strong>
                , valamint az 
                <strong><a href="https://MaganSzovetseg.Net/Privacy" target="_blank">Adatvédelmi Nyilatkozatot </a></strong>
                 itt találod. A regisztrációddal automatikusan elfogadod őket.
                </span>

              </label>

   <br></br>
   </div>





            <div class={`${styles.moreInputs} ${isMoreVisible() ? styles.show : styles.hide}`}>
              
              <div class={styles.inputLabel}>
                <label for='picture'>{intl.formatMessage(tSettings.profile.picture.label)}</label>
              </div>

              <input
                name='picture'
                type='text'
                placeholder={intl.formatMessage(tSettings.profile.picture.placeholder)}
                value={avatarPreview() || ''}
                onChange={(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  target.value && setAvatarPreview(target.value);
                }}
              />

              <div class={styles.inputLabel}>
                <label for='banner'>{intl.formatMessage(tSettings.profile.banner.label)}</label>
              </div>

              <input
                name='banner'
                type='text'
                placeholder={intl.formatMessage(tSettings.profile.banner.placeholder)}
                value={bannerPreview() || ''}
                onChange={(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  target.value && setBannerPreview(target.value);
                }}
              />
              
            </div>





          </div>

          <div class={currentStep() === 'info' ? '' : 'invisible'}>
            <div class={styles.inputLabel}>
              <label for='website'>{intl.formatMessage(tSettings.profile.website.label)}</label>
            </div>
            <input
              name='website'
              type='text'
              placeholder={intl.formatMessage(tSettings.profile.website.placeholder)}
            />

            <div class={styles.inputLabel}>
              <label for='about'>{intl.formatMessage(tSettings.profile.about.label)}</label>
            </div>
            <textarea
              name='about'
              placeholder={intl.formatMessage(tSettings.profile.about.placeholder)}
              ref={textArea}
              rows={1}
              data-min-rows={1}
              onInput={onExpandableTextareaInput}
            />





            {/* BTC lightning out 
            <div class={styles.inputLabel}>
            <label for='lud16'>{intl.formatMessage(tSettings.profile.lud16.label)}</label>
            
            </div>
            <input
              name='lud16'
              type='text'
            />

            <div class={styles.inputLabel}>
              <label for='nip05'>{intl.formatMessage(tSettings.profile.nip05.label)}</label>
            </div>
            <input
              name='nip05'
              type='text'
            />
            
            */}

          </div>


          <div class={currentStep() === 'follow' ? '' : 'invisible'}>
            <div class={styles.stepIntro}>
              {intl.formatMessage(tAccount.create.descriptions.step_three)}
            </div>
            <div class={styles.suggestions}>
              <For each={suggestedData.groupNames}>
                {(groupName) => (
                  <>
                    <div class={styles.recomendedFollowsCaption}>
                      <div class={styles.caption}>
                        {groupName}
                      </div>
                      <div class={styles.action}>
                        <ButtonFlip
                          when={isFollowingAllInGroup(groupName)}
                          fallback={intl.formatMessage(tAccount.followAll)}
                          onClick={() => toggleFollowGroup(groupName)}
                        >
                          {intl.formatMessage(tAccount.unfollowAll)}
                        </ButtonFlip>
                      </div>
                    </div>

                    <div class={styles.suggestedUsers}>
                      <For each={suggestedData.groups[groupName]}>
                        {pubkey => (
                          <div class={styles.userToFollow}>
                            <div class={styles.info}>
                              <Avatar user={suggestedUser(pubkey)} />
                              <div class={styles.nameAndNip05}>
                                <div class={styles.name}>
                                  {userName(suggestedUser(pubkey))}
                                </div>
                                <div class={styles.nip05}>
                                  {nip05Verification(suggestedUser(pubkey))}
                                </div>
                              </div>
                            </div>
                            <div class={styles.action}>
                              <ButtonFlip
                                when={followed.includes(pubkey)}
                                fallback={intl.formatMessage(tAccount.follow)}
                                onClick={() => toggleFollowAccount(pubkey)}
                              >
                                {intl.formatMessage(tAccount.unfollow)}
                              </ButtonFlip>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  </>
                )}

              </For>
            </div>
          </div>

          <div class={styles.formSubmit}>
            <Show when={currentStep() === 'info'}>
              <ButtonSecondary
                onClick={toPrevious}
              >
                {intl.formatMessage(tActions.previous)}
              </ButtonSecondary>
            </Show>



            <Show
              //when={currentStep() !== 'follow' && currentStep() !== 'key'}
              when={currentStep() === 'follow'}
              fallback={

              <Show when={currentStep() !== 'key'}>
                <ButtonPrimary
                  disabled={(currentStep() === 'name' && !isNameValid())}
                  onClick={toNext}
                  >
                  {intl.formatMessage(tActions.next)}
                </ButtonPrimary>
              </Show>
              }
              >
              <ButtonSecondary onClick={toPrevious}>
                {intl.formatMessage(tActions.previous)}
              </ButtonSecondary>

              <ButtonPrimary onClick={toNext}>
                {intl.formatMessage(tActions.next)}
              </ButtonPrimary>

              <ButtonSecondary onClick={clearNewAccount}>
                {intl.formatMessage(tActions.cancel)}
              </ButtonSecondary>

            </Show>



 {/* Step 4: Key Generation */}
    <Show when={currentStep() === 'key'}>
    	<div class={styles.stepFourContainer}>



 {/* Large Bold Title */}
    <div class={styles.stepFourTitle}>
      {intl.formatMessage(tAccount.create.descriptions.step_four)}
    </div>
    

    <br />
    {/* Normal Text */}
    <div class={styles.stepFourText}>
      {intl.formatMessage(tAccount.create.privateKey.saveMessage)}

    </div>
    
    <br />
    {/* Bold Emphasized Text */}
    <div class={styles.stepFourBold}>
      {intl.formatMessage(tAccount.create.privateKey.label)}
    </div>

    {/* Textarea a privát kulccsal */}
    <div class={styles.privateKeyWrapper}>  {/* ✅ Only use the SCSS class */}
    <textarea 
    id="privateKey" 
    value={createdAccount.sec || ''} 
    readonly 
    class={styles.readOnlyTextBox} 
    onClick={() => setHasSavedKey(true)}
    onCopy={() => setHasSavedKey(true)}
    />

    {/* Másolás gomb (Most ButtonPrimary) */}
    {/*   <ButtonPrimary 
    style={{ marginTop: "10px", width: "150px" }} 
    onClick={() => {
      if (createdAccount.sec) {
        navigator.clipboard.writeText(createdAccount.sec);
        setHasSavedKey(true);
      }
    }}
    >
    {intl.formatMessage(tActions.copy)}
    </ButtonPrimary>
      */}



    </div>

    <ButtonPrimary
      onClick={downloadPrivateKeyFile}
      style={{ marginTop: "20px", width: "100%" }}
    >
      {intl.formatMessage(tActions.downloadKey)}
    </ButtonPrimary>

    


 	<div 
      		class={styles.buttonGroup} 
      		style={{ 
      		display: "flex", 
      		"flex-direction": "row",  // ✅ Use kebab-case
      		"justify-content": "center", 
      		gap: "10px", 
      		"margin-top": "20px" 
      		}}
      		>

		<ButtonSecondary onClick={toPrevious}>
        		{intl.formatMessage(tActions.previous)}
      		</ButtonSecondary>



        	{/*Finish Button - Enabled only when key is saved */}
        	<ButtonPrimary 
        		type="submit" 
        		disabled={!hasSavedKey()}  // Only enabled when key is copied/downloaded
        		style={{ backgroundColor: hasSavedKey() ? "green" : "gray" }}
        		>
        		{intl.formatMessage(tActions.finish)}
        	</ButtonPrimary>



          	<Show when={currentStep() !== 'follow'}>
            		<ButtonSecondary onClick={clearNewAccount}>
           		 	{intl.formatMessage(tActions.cancel)}
            		</ButtonSecondary>
         	 </Show>


	</div>
	</div>
    </Show>
















              {/* Cancel button always available */}
              <Show when={currentStep() !== 'follow' && currentStep() !== 'key'}>
              <ButtonSecondary onClick={clearNewAccount}>
                {intl.formatMessage(tActions.cancel)}
                </ButtonSecondary>
              </Show>






          </div>
        </form>

      </div>


      <CreatePinModal
        open={showCreatePin()}
        onAbort={() => {
          onStoreSec(createdAccount.sec);
        }}
        valueToEncrypt={createdAccount.sec}
        onPinApplied={onStoreSec}
      />
    </div>
  );
}

export default CreateAccount;