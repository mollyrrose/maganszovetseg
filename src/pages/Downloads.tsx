import { Component, createSignal, createEffect, onMount } from 'solid-js';
import { useIntl } from '@cookbook/solid-intl';
import { useSettingsContext } from '../contexts/SettingsContext';
//import { useProfileContext } from '../contexts/ProfileContext';
//import { useAccountContext } from '../contexts/AccountContext';

import Wormhole from '../components/Wormhole/Wormhole';
import Search from '../components/Search/Search';
import ExternalLink from '../components/ExternalLink/ExternalLink';
import PageTitle from '../components/PageTitle/PageTitle';
import PageCaption from '../components/PageCaption/PageCaption';
import StickySidebar from '../components/StickySidebar/StickySidebar';

/*
import gitHubLight from '../assets/icons/github_light.svg';
import gitHubDark from '../assets/icons/github.svg';
import copyNoteLink from '../assets/icons/bookmark_empty.svg';
*/
const gitHubLight = 'https://cdnwin.maganszovetseg.net/src/assets/icons/github_light.svg';
const gitHubDark = 'https://cdnwin.maganszovetseg.net/src/assets/icons/github.svg';
const copyNoteLink = 'https://cdnwin.maganszovetseg.net/src/assets/icons/bookmark_empty.svg';

import { downloads as t } from '../translations';
import styles from './Downloads.module.scss';
import { PrimalUser } from '../types/primal';

// Extend the PrimalUser type to include custom metadata fields
/*
type ExtendedPrimalUser = {
  msn_isMediumSupported?: string;
  msn_isOptimumSupported?: string;
  msn_WantsToHelp?: string;
} & PrimalUser;
*/
const Downloads: Component = () => {
  const intl = useIntl();
  const settings = useSettingsContext();

  /*
  const profile = useProfileContext();
  const account = useAccountContext();
*/


  // State for Button 2 and Button 3
  const [secondButtonActive, setSecondButtonActive] = createSignal(false);
  const [thirdButtonActive, setThirdButtonActive] = createSignal(false);
  // State for Long Button
  const [longButtonActive, setLongButtonActive] = createSignal(false);
  // Derived state to check if both Button 2 and Button 3 are active
  const [allButtonsActive, setAllButtonsActive] = createSignal(false);

 // State for notification
  const [notification, setNotification] = createSignal<string | null>(null);

  // Update allButtonsActive whenever secondButtonActive or thirdButtonActive changes
  /*
  createEffect(() => {
    if (profile?.userProfile) {
      const metadata = profile.userProfile as ExtendedPrimalUser;
      const mediumActive = metadata.msn_isMediumSupported === "true";
      const optimumActive = metadata.msn_isOptimumSupported === "true";
  
      setAllButtonsActive(mediumActive && optimumActive); // Derived state
      setSecondButtonActive(mediumActive);
      setThirdButtonActive(optimumActive);
      setLongButtonActive(metadata.msn_WantsToHelp === "true");
  
      console.log("ðŸ”„ Syncing button states with profile metadata:", {
        secondButtonActive: mediumActive,
        thirdButtonActive: optimumActive,
        longButtonActive: metadata.msn_WantsToHelp === "true",
      });
    }
  });
*/

  // Logging profile fetch status
  /*
  console.log('Step 1: Checking if profile context is available...');
  if (!profile) {
    console.error('Step 1: Profile context is not available. Check the ProfileContext provider.');
    return null;
  }
  console.log('Step 1: Profile context is available.');
*/


  // Fetch profile data on mount
  /*
  createEffect(() => {
    if (account?.publicKey && !profile?.userProfile && !profile?.isLoading) {
      console.log('Step 2: Fetching profile data...');
      profile.actions.setProfileKey(account.publicKey);
      console.log('Step 2: Profile data fetched successfully.');
    }
  });
*/

  // Log metadata fields// Profile Data and Metadata Sync
  /*
  createEffect(() => {
    if (!profile?.userProfile) {
      console.warn("âš ï¸  Profile data is missing! Requesting update...");
      profile.actions.setProfileKey(account?.publicKey);
  
      // Ensure metadata fields are initialized
      const checkMetadata = async (maxRetries = 20, retryDelay = 1000) => {
        let retries = 0;
  
        while (retries < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Wait before checking
          const metadata = profile?.userProfile as ExtendedPrimalUser;
  
          if (
            metadata?.msn_isMediumSupported !== undefined &&
            metadata?.msn_isOptimumSupported !== undefined &&
            metadata?.msn_WantsToHelp !== undefined
          ) {
            console.log("âœ… Metadata fields are now available.");
            return; // Exit if all metadata fields are defined
          }
  
          retries++;
          console.log(`ðŸ”„ Retry ${retries}/${maxRetries}: Waiting for metadata fields...`);
          await profile.actions.setProfileKey(account?.publicKey); // Re-fetch profile data
        }
  
        console.error("â Œ Failed to fetch metadata fields after multiple retries.");
      };
  
      checkMetadata(); // Start checking metadata fields
    }
  });
*/
/*
  createEffect(() => {
    if (profile?.userProfile) {
      const metadata = profile.userProfile as ExtendedPrimalUser;
      console.log("🔄 Syncing button states with profile metadata:", {
        msn_isMediumSupported: metadata.msn_isMediumSupported,
        msn_isOptimumSupported: metadata.msn_isOptimumSupported,
        msn_WantsToHelp: metadata.msn_WantsToHelp,
      });
  
      setSecondButtonActive(metadata.msn_isMediumSupported === "true");
      setThirdButtonActive(metadata.msn_isOptimumSupported === "true");
      setLongButtonActive(metadata.msn_WantsToHelp === "true");
    }
  });
*/
  /*
  const waitForProfileData = async () => {
    console.log("ðŸ”„ Step 4: Waiting for profile data to load...");
    const interval = 500; // Check every 500ms
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (profile?.userProfile && account?.publicKey) {
          console.log("âœ… Step 4: Profile data is now available.");
          clearInterval(intervalId);
          resolve(profile.userProfile);
        }
      }, interval);
    });
  };
*/





  // Initialize metadata fields and set button states on page load
/* 
  onMount(async () => {
    console.log('â ³ Step 4: Waiting for profile data to load...');
    if (!profile?.userProfile || !account?.publicKey) {
      console.warn("âš ï¸  Step 4: Profile data or account public key is missing! Skipping metadata check...");
      return;
    }
  
    console.log("âœ… Step 4: Profile data is available. Checking metadata fields...");
    const metadata = profile.userProfile as ExtendedPrimalUser;
    let needsUpdate = false;
    const updatedProfile = { ...metadata };
  
    // Initialize missing metadata fields
    if (metadata.msn_isMediumSupported === undefined) {
      updatedProfile.msn_isMediumSupported = "false";
      needsUpdate = true;
    }
    if (metadata.msn_isOptimumSupported === undefined) {
      updatedProfile.msn_isOptimumSupported = "false";
      needsUpdate = true;
    }
    if (metadata.msn_WantsToHelp === undefined) {
      updatedProfile.msn_WantsToHelp = "false";
      needsUpdate = true;
    }
  
    if (needsUpdate) {
      console.log("ðŸ“¡ Step 4: Saving missing metadata fields:", updatedProfile);
      await profile.actions.updateProfile(JSON.stringify(updatedProfile));
      console.log("ðŸ”„ Step 4: Re-fetching profile after metadata save...");
      await profile.actions.setProfileKey(account.publicKey);
  
      // Wait for the profile to reflect the changes
      await waitForMetadataToPropagate("msn_isMediumSupported", "true");
    }
  
    // Sync button states after ensuring metadata is initialized
    const updatedMetadata = profile.userProfile as ExtendedPrimalUser;
    setSecondButtonActive(updatedMetadata.msn_isMediumSupported === "true");
    setThirdButtonActive(updatedMetadata.msn_isOptimumSupported === "true");
    setLongButtonActive(updatedMetadata.msn_WantsToHelp === "true");
  
    console.log("âœ… Step 4: Metadata ensured & buttons updated:", {
      secondButtonActive: secondButtonActive(),
      thirdButtonActive: thirdButtonActive(),
      longButtonActive: longButtonActive(),
    });
  });
*/

/*
  const waitForMetadataToPropagate = async (
    key: string,
    value: string,
    maxRetries = 10,
    retryDelay = 500
  ): Promise<boolean> => { // Explicitly define the return type
    let retries = 0;
  
    while (retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      const metadata = profile?.userProfile as ExtendedPrimalUser;
  
      if ((metadata as any)[key] === value) {
        console.log(`✅ ${key} propagated successfully with value: ${value}`);
        return true; // Return true if the metadata matches the expected value
      }
  
      retries++;
      console.log(`🔄 Retry ${retries}/${maxRetries}: Waiting for ${key}=${value}`);
    }
  
    console.error(`❌ Failed to propagate ${key} after ${maxRetries} retries.`);
    return false; // Return false if the retries are exhausted
  };
*/


// Handle Button 2 Click
/*
const handleSecondButtonClick = async () => {


  const newState = !secondButtonActive();
  console.log("ðŸ–±ï¸  Step 5: Updating msn_isMediumSupported to:", newState);

  if (!profile?.userProfile || !account?.publicKey) {
    console.error("â Œ Step 5: Profile data or account public key is missing! Cannot update.");
    return;
  }

  const metadata = profile.userProfile as ExtendedPrimalUser;
  const updatedProfile = { ...metadata, msn_isMediumSupported: newState ? "true" : "false" };

  try {
  
    console.log("ðŸ“¡ Step 5: Sending updated profile:", updatedProfile);
    await profile.actions.updateProfile(JSON.stringify(updatedProfile));

     //Wait for the updated metadata to reflect
    const success = await waitForMetadataToPropagate("msn_isMediumSupported", newState ? "true" : "false");
    if (success) {
      //setSecondButtonActive(newState); // Update the button state only after confirmation
    }
  } catch (error) {
    console.error("❌ Step 5: Failed to update msn_isMediumSupported:", error);
  }
};
*/



  // Update metadata when Button 3 is clicked
/*
  const handleThirdButtonClick = async () => {
    const newState = !thirdButtonActive();
    console.log('Step 6: Attempting to update msn_isOptimumSupported to:', newState);
  
    // Ensure Button 2 is enabled before allowing Button 3 to be enabled
    if (newState && !secondButtonActive()) {
      console.error("❌ Step 6: Button 2 (msn_isMediumSupported) must be enabled before enabling Button 3.");
      return;
    }
  
    if (!profile?.userProfile || !account?.publicKey) {
      console.error("❌ Step 6: Profile data or account public key is missing! Cannot update.");
      return;
    }
  
    const metadata = profile.userProfile as ExtendedPrimalUser;
    const updatedProfile = { ...metadata, msn_isOptimumSupported: newState ? "true" : "false" };
  
    try {
      console.log("📤 Step 6: Sending updated profile:", updatedProfile);
      await profile.actions.updateProfile(JSON.stringify(updatedProfile));
  
      // Wait for the updated metadata to propagate
      const success = await waitForMetadataToPropagate("msn_isOptimumSupported", newState ? "true" : "false");
      if (success) {
        console.log('✅ Step 6: msn_isOptimumSupported updated successfully to:', newState);
        setThirdButtonActive(newState); // Update the button state only after confirmation
      }
    } catch (error) {
      console.error('❌ Step 6: Failed to update msn_isOptimumSupported:', error);
    }
  };
*/




  // Update metadata when Long Button is clicked
/*
  const handleLongButtonClick = async () => {
    const newState = !longButtonActive();
    console.log('Step 7: Attempting to update msn_WantsToHelp to:', newState);
  
    if (!profile?.userProfile || !account?.publicKey) {
      console.error("â Œ Step 7: Profile data or account public key is missing! Cannot update.");
      return;
    }
  
    const metadata = profile.userProfile as ExtendedPrimalUser;
    const updatedProfile = { ...metadata, msn_WantsToHelp: newState ? "true" : "false" };
  
    try {
      console.log("ðŸ“¡ Step 7: Sending updated profile:", updatedProfile);
      await profile.actions.updateProfile(JSON.stringify(updatedProfile));
  
      // Wait for the updated metadata to propagate
      await waitForMetadataToPropagate("msn_WantsToHelp", newState ? "true" : "false");
  
      console.log('Step 7: msn_WantsToHelp updated successfully to:', newState);
      setLongButtonActive(newState); // Update the button state only after confirmation
    } catch (error) {
      console.error('Step 7: Failed to update msn_WantsToHelp:', error);
    }
  };

*/

  

  // Handle the special case where the long button disappears
/*
  createEffect(() => {
    if (!allButtonsActive() && longButtonActive()) {
        console.log('Step 8: Long button disappeared. Attempting to set msn_WantsToHelp to false.');

        if (profile?.userProfile) {
            console.log("🔄 Step 8: Current Profile Metadata (Before Update):", profile.userProfile);
            
            const metadata = profile.userProfile as ExtendedPrimalUser;
            const updatedProfile = {
                ...metadata,
                msn_WantsToHelp: 'false',
            };

            try {
                profile.actions.updateProfile(JSON.stringify(updatedProfile));
                console.log("✅ Step 8: msn_WantsToHelp set to false successfully.");
                setLongButtonActive(false);
            } catch (error) {
                console.error("❌ Step 8: Failed to set msn_WantsToHelp to false:", error);
            }
        }
    }
});
*/

  // updating CreateEffect to not depend on the Metadata update
  createEffect(() => {
    setAllButtonsActive(secondButtonActive() && thirdButtonActive());
  });


  return (
    <div class={styles.downloadsContainer}>
      <Wormhole to="search_section">
        <Search />
      </Wormhole>

      <StickySidebar>
        <div class={styles.downloadsSidebar}>
          <div class={styles.title}>
            {intl.formatMessage(t.links.title)}
          </div>

          <div class={styles.list}>
            <ExternalLink
              darkIcon={gitHubLight}
              lightIcon={gitHubDark}
              label={intl.formatMessage(t.links.webApp)}
              href='https://github.com/PrimalHQ/primal-web-app'
            />
            
            <br /><br />

            <div class={styles.title}>
              {intl.formatMessage(t.links.title3)}
            </div>


            <ExternalLink
              darkIcon={copyNoteLink}
              label={intl.formatMessage(t.links.TermsDoc)}
              href="./Terms"
            />
            <ExternalLink
              darkIcon={copyNoteLink}
              label={intl.formatMessage(t.links.PrivacyDoc)}
              href="./Privacy"
            />
            <br /><br />

            <div class={styles.title}>
             {intl.formatMessage(t.links.title4)}
            </div>
            <ExternalLink
              darkIcon={copyNoteLink}
              label={intl.formatMessage(t.links.IntroDoc)}
              href="https://mega.nz/file/UuwRhZ5Q#T_0ZCfvPwxrga2ioW0gj7zaKBp0X7xyiivPvKGmJLcw"
            />
            <br /><br />

            <div class={styles.title}>
              {intl.formatMessage(t.links.title2)}
            </div>

            <div class={styles.list}>
              {/* Donation Button */}
              <div class={styles.donationButtonContainer}>
                <button
                  class={styles.secondaryButton}
                  onClick={() => window.open('https://www.donably.com/maganszovetseg', '_blank')}
                >
                  Forintban kártyával
                </button>
              </div>

              {/* Bitcoin Button */}
              <div class={styles.bitcoinButtonContainer}>
                <button
                  class={styles.bitcoinButton}
                  onClick={() => navigator.clipboard.writeText('bc1qry8c2sdqg2sq80gle2d0l7e6gy0hx2pxzlzmv8')}
                >
                  Bitcoin cím másolása
                </button>
              </div>
            </div>
          </div>
        </div>
      </StickySidebar>

      <PageTitle title={intl.formatMessage(t.title)} />
      <PageCaption title={intl.formatMessage(t.title)} />

      {/* Content Frame */}
      <div class={styles.frameContainer}>
        <div class={styles.centeredContent}>
          <div class={styles.inputLabel}>
            <p style={{ "font-size": "100%", "line-height": "1.4", "text-align": "justify" }}>
              A <strong>MagánSzövetség</strong> egy magánjog alapján szerveződő <strong>magánemberek szövetsége</strong>, kik kijelentik, hogy élő emberként <strong>az életet, a szabadságot és a békét</strong> támogatják.
              <br /><br />MagánSzövetség.Net fiókod létrehozásával kijelented, hogy <strong>egyetértesz értékrendünkkel</strong>.
              Ennek lényege, hogy éberséggel és örömteli látásmóddal támogatjuk a pozitivitást, a pozitív értékeket.
              A negativitást nem támogatjuk. Rámutatunk annyira finoman és intelligensen, ahogy lehetséges,
              de azon túl nem foglalkozunk vele. Mi egyszerűen tesszük a saját dolgunkat a világ jövője és minden lény javára.
              <br /><br />Az <strong>I. Értékrend MINIMUM</strong>, melyben mindannyian egyetértünk a MagánSzövetség.Net-en. Ezt írod alá digitálisan, amikor
              létrehozod a fiókodat a regisztrációkor. A II. Értékrend MÉDIUM és III. Értékrend OPTIMUMOT opcionálisan elfogadhatod.
              Amennyiben letöltötted és egyetértesz velük, részt vehetsz munkánkban, akár regionális nagykövetként. Bármilyen nagyszerű közösségnek is vagy tagja, őrizd meg tagságod! Minden magyar közösségért is teszel egyben, amikor velük együtt a MagánSzövetséget is támogatod egyben.
            </p>
          </div>

          {/* Download Section */}
          <div class={styles.qrWrapper}>
            {/* Értékrend MINIMUM */}
            <div class={styles.qrCode}>
            <a href="https://mega.nz/file/JyYFiTqL#daaSm0WobM1zxDqNxBwzZdrKLsqsiTaDaDioM1bH-1U" target="_blank" rel="noopener noreferrer">
                <img
                  // src="/icons/DownloadPdf_nh.png"
                  src="https://cdnwin.maganszovetseg.net/public/icons/DownloadPdf_nh.png"
                  width={100}
                  alt="Töltsd le a PDF-et!"
                  /*
                  onMouseEnter={(e) => e.currentTarget.src = "/icons/DownloadPdf.png"}
                  onMouseLeave={(e) => e.currentTarget.src = "/icons/DownloadPdf_nh.png"}
                  */
                  onMouseEnter={(e) => e.currentTarget.src = "https://cdnwin.maganszovetseg.net/public/icons/DownloadPdf.png"}
                  onMouseLeave={(e) => e.currentTarget.src = "https://cdnwin.maganszovetseg.net/public/icons/DownloadPdf_nh.png"}
                />
              </a>
              <div class={styles.qrCaption}>
                <strong>I. Értékrend MINIMUM</strong>
              </div>

              {/* Button 1 (Always Active and Disabled) */}
              <div class={`${styles.slideButtonContainer} ${styles.active}`}>
                <div class={styles.slideButton}>
                  <span class={styles.slideButtonText}>Egyetértek</span>
                </div>
              </div>
            </div>

            {/* Értékrend MÉDIUM */}
            <div class={styles.qrCode}>
            <a href="https://mega.nz/file/Ynxg2RxB#jPUlblTQcMveZrFnBG545brZZQlvSSjc6Sjgy2iBpmg" target="_blank" rel="noopener noreferrer">
                <img
                 // src="/icons/DownloadPdf_nh.png"
                  src="https://cdnwin.maganszovetseg.net/public/icons/DownloadPdf_nh.png"
                  width={100}
                  alt="Töltsd le a PDF-et!"
                  /*
                  onMouseEnter={(e) => e.currentTarget.src = "/icons/DownloadPdf.png"}
                  onMouseLeave={(e) => e.currentTarget.src = "/icons/DownloadPdf_nh.png"}
                  */
                  onMouseEnter={(e) => e.currentTarget.src = "https://cdnwin.maganszovetseg.net/public/icons/DownloadPdf.png"}
                  onMouseLeave={(e) => e.currentTarget.src = "https://cdnwin.maganszovetseg.net/public/icons/DownloadPdf_nh.png"}

                />
              </a>
              <div class={styles.qrCaption}>
                <strong>II. Értékrend MÉDIUM</strong>
              </div>

              {/* Button 2 (Clickable) */}
              <div
                class={`${styles.slideButtonContainer} ${secondButtonActive() ? styles.active : ''}`}
                //onClick={handleSecondButtonClick} //no action regarding Metadata
                onClick={() => setSecondButtonActive(!secondButtonActive())} // Toggle the state
              >
                <div class={styles.slideButton}>
                  <span class={styles.slideButtonText}>Egyetértek</span>
                </div>
              </div>
            </div>

            {/* Értékrend OPTIMUM */}
            <div class={styles.qrCode}>
            <a href="https://mega.nz/file/InhFgToY#6aO_l2iajc86HcqoVuCFEfno37RMTR7N1Ud3k6J9aN8" target="_blank" rel="noopener noreferrer">
                <img
                  //src="/icons/DownloadPdf_nh.png"
                  src="https://cdnwin.maganszovetseg.net/public/icons/DownloadPdf_nh.png"
                  width={100}
                  alt="Töltsd le a PDF-et!"
                  /*
                  onMouseEnter={(e) => e.currentTarget.src = "/icons/DownloadPdf.png"}
                  onMouseLeave={(e) => e.currentTarget.src = "/icons/DownloadPdf_nh.png"}
                  */
                  onMouseEnter={(e) => e.currentTarget.src = "https://cdnwin.maganszovetseg.net/public/icons/DownloadPdf.png"}
                  onMouseLeave={(e) => e.currentTarget.src = "https://cdnwin.maganszovetseg.net/public/icons/DownloadPdf_nh.png"}

                />
              </a>
              <div class={styles.qrCaption}>
                <strong>III. Értékrend OPTIMUM</strong>
              </div>

              {/* Button 3 (Clickable) */}
              <div
                class={`${styles.slideButtonContainer} ${thirdButtonActive() ? styles.active : ''}`}
                //onClick={handleThirdButtonClick} //no action regarding Metadata
                onClick={() => {
                  if (secondButtonActive()) { // Only allow toggling if Button 2 is active
                    setThirdButtonActive(!thirdButtonActive());
                  } else {
                    console.log("❌ Button 2 must be enabled before enabling Button 3.");
                    setNotification("❌ Előbb a MÉDIUM-ot kell elfogadni.");
                    setTimeout(() => setNotification(null), 3000); // Clear the notification after 3 seconds
                  }
                }}
                >
                <div class={styles.slideButton}>
                  <span class={styles.slideButtonText}>Egyetértek</span>
                </div>
              </div>
            </div>
          </div>

          {/* Long Button (Conditionally Rendered) */}
{/* Long Button (Conditionally Rendered) */}
{/* Long Button (Conditionally Rendered) */}
{allButtonsActive() && (
  <div class={styles.fullWidthButtonContainer}>
    <div class={styles.buttonLinkWrapper}> {/* New wrapper to align both elements */}
      <button
        class={`${styles.slideButton} ${longButtonActive() ? styles.active : ''}`}
        onClick={() => setLongButtonActive(!longButtonActive())} // Toggle the state
      >
        <span class={styles.slideButtonText}>
          {longButtonActive()
            ? <>Köszönjük, hogy segítesz! Légy kedves írj egy üzenetet a MagánSzövetség Ügyfélszolgálatnak, kifejtve hogy miben vagy jó-, miben tudsz/ szeretnél segíteni! 🙏</>
            : <>IGEN! Szeretnék segíteni is! Felajánlok időmből, energia-többletemből, hogy egy jobb világot teremtsünk mindannyiunk számára! [KATT]</>}
        </span>
      </button>

      {/* Ensure link box is aligned and sized like button */}

      {longButtonActive() && (
        <div class={styles.inputLabel}>
         <div class={styles.linkBox}>
          <a 
            href="https://maganszovetseg.net/p/npub140ucqkum24q9skra07fcac449jxyragut5c3ssk6qthma3fvcl2svfvky2" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Írok a MagánSzövetség Ügyfélszolgálatnak! [KATT]
          </a>
         </div>
        </div>
      )}



    </div>
  </div>
)}







        </div>
      </div>
    </div>
  );
};

export default Downloads;