//{/* scr/pages/EditProfile.tsx */}
import { Component, createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js';
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
import { useAccountContext } from '../contexts/AccountContext';
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
  
    // NEW: Initialize msn_ fields if they don't exist
    ['msn_country', 'msn_mapaddress', 'msn_mapliveaddress', 'msn_language', 'msn_clientregurl', 'msn_myrss', 'msn_donationlink', 'msn_btc', 'msn_mobileappusername', 'msn_email'].forEach((key) => {
      if (!('msn_mobileappusername' in profile?.userProfile)) {
        profile?.actions.updateProfile({ ...profile.userProfile, [key]: '' });
      }
  
      // Update the corresponding input field
      const inputElement = document.querySelector(`input[name="${key}"]`) as HTMLInputElement | null;
      if (inputElement) {
        inputElement.value = profile?.userProfile?.[key] || '';
        console.log('Re-populating input field:', key, 'with value:', profile?.userProfile?.[key]);
      }
    });
  };











  onMount(() => {
    setOpenSockets(true);
  });

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




  const onUpload = (target: 'picture' | 'banner', fileUpload: HTMLInputElement | undefined) => {

    if (!fileUpload) {
      return;
    }

    const file = fileUpload.files ? fileUpload.files[0] : null;

    if (file) {
      setUploadTarget(target);
      setFileToUpload(file);
    }
  }








  //new
  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    if (!e.target || !account) {
      return false;
    }

    const data = new FormData(e.target as HTMLFormElement);
    console.log("📝 Form Data Before Submit:");

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
    
    let metadata: Record<string, string> = {};

    // Loop through all keys to get values and set them to metadata
    ['displayName', 'name', 'website', 'about', 'lud16', 'nip05', 'picture', 'banner', 'msn_country', 'msn_mapaddress', 'msn_mapliveaddress', 'msn_language', 'msn_clientregurl', 'msn_myrss', 'msn_donationlink', 'msn_btc', 'msn_mobileappusername', 'msn_email'].forEach(key => {
      const value = data.get(key);
    
      if (value) {
        metadata[key] = value as string; // Set the value if it exists
      } else {
        // Apply default values only if the key doesn't have an updated value
        switch (key) {
          case 'msn_country':
            metadata['msn_country'] = "Magyarország";
            break;
          case 'msn_mapaddress':
            metadata['msn_mapaddress'] = "";
            break;
          case 'msn_ismapaddressvisible':
            metadata['msn_ismapaddressvisible'] = "false";
            break;          
          case 'msn_mapliveaddress':
            metadata['msn_mapliveaddress'] = "";
            break;
          case 'msn_ismapaddressvisible_tosecondlevel':
            metadata['msn_ismapaddressvisible_tosecondlevel'] = "false";
            break;   
          case 'msn_language':
            metadata['msn_language'] = "Magyar";
            break;
          case 'msn_clientregurl':
            metadata['msn_clientregurl'] = "MaganSzovetseg.Net";
            break;
          case 'msn_myrss':
            metadata['msn_myrss'] = "";
            break;
          case 'msn_donationlink':
            metadata['msn_donationlink'] = "";
            break;
          case 'msn_btc':
              metadata['msn_btc'] = "";
              break;
          case 'msn_mobileappusername':
            metadata['msn_mobileappusername'] = "";
            break;
          case 'msn_email':
            metadata['msn_email'] = "";
            break;
          case 'msn_isMediumSupported':
            metadata['msn_isMediumSupported'] = "false";
            break;
          case 'msn_isOptimumSupported':
            metadata['msn_isOptimumSupported'] = "false";
            break;
          case 'msn_WantsToHelp':
            metadata['msn_WantsToHelp'] = "false";
            break;
          default:
            // For other fields, you may want to leave them unchanged
            break;
        }
      }
  
      // Special case for 'displayName' to store as 'display_name'
      if (key === 'displayName') {
        metadata['display_name'] = value as string;
      }
    });


    // ✅ Ensure picture & banner are included
    metadata['picture'] = picture;
    metadata['banner'] = banner;

    console.log("🚀 Final Metadata Before Sending:", metadata);


    const oldProfile = profile?.userProfile || {};
    console.log("🚀 Sending Profile Data to Nostr:", { ...oldProfile, ...metadata });


    // Send the metadata to Nostr
    const { success, note } = await sendProfile({ ...oldProfile, ...metadata }, account?.proxyThroughPrimal || false, account.activeRelays, account.relaySettings);

    if (success) {
      console.log("✅ Profile successfully sent to Nostr!", metadata);

      note && triggerImportEvents([note], `import_profile_${APP_ID}`, () => {
        note && profile?.actions.updateProfile(note.pubkey);
        note && account.actions.updateAccountProfile(note.pubkey);
        note && navigate(app?.actions.profileLink(note.pubkey) || '/home')
        toast?.sendSuccess(intl.formatMessage(tToast.updateProfileSuccess))
  
        console.log('Metadata saved successfully:', metadata); // Log the saved metadata
        console.log('Form value for msn_mapaddress:', data.get('msn_mapaddress'));
        console.log('Constructed metadata for msn_mapaddress:', metadata['msn_mapaddress']);
      });
      return false;
    }

    console.error("❌ Profile update failed!");
    toast?.sendWarning(intl.formatMessage(tToast.updateProfileFail))

    return false;
  };

  














  
    const oldProfile = profile?.userProfile || {};



    //new
  
    const EditProfile: Component = async () => {  // Make this function async
      try {
        // Send the metadata to Nostr
        const { success, note } = await sendProfile(
          { ...oldProfile, ...metadata }, 
          account?.proxyThroughPrimal || false, 
          account.activeRelays, 
          account.relaySettings
        );
      
        if (success) {
          if (note) {
            triggerImportEvents([note], `import_profile_${APP_ID}`, () => {
              note && profile?.actions.updateProfile(note.pubkey);
              note && account.actions.updateAccountProfile(note.pubkey);
              note && navigate(app?.actions.profileLink(note.pubkey) || '/home');
              toast?.sendSuccess(intl.formatMessage(tToast.updateProfileSuccess));
      
              console.log('Metadata saved successfully:', metadata); // Log the saved metadata
              console.log('Form value for msn_mapaddress:', data.get('msn_mapaddress'));
              console.log('Constructed metadata for msn_mapaddress:', metadata['msn_mapaddress']);
            });
          }
          return false;
        }
      
        toast?.sendWarning(intl.formatMessage(tToast.updateProfileFail));
        return false;
      } catch (error) {
        console.error("Error saving metadata:", error);
        toast?.sendWarning(intl.formatMessage(tToast.updateProfileFail));
        return false;
      }
    };
    






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



export interface PrimalUser {
  pubkey: string;
  npub: string;
  displayName?: string;
  name?: string;
  about?: string;
  picture?: string;
  banner?: string;
  nip05?: string;
  lud16?: string;
  msn_country?: string;
  msn_mapaddress?: string;
  msn_mapliveaddress?: string;
  msn_language?: string;
  msn_clientregurl?: string;
  msn_myrss?: string;
  msn_donationlink?: string;
  msn_btc?: string;
  msn_mobileappusername?: string;
  msn_email?: string;
}


export default EditProfile;
