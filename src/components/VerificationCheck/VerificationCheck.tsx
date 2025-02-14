import styles from "./VerificationCheck.module.scss";

import { Component, createSignal, onMount } from "solid-js";
import { PrimalUser } from "../../types/primal";
import { isAccountVerified } from "../../lib/profile";
import { useAppContext } from "../../contexts/AppContext";

const VerificationCheck: Component<{
  user: PrimalUser | undefined,
  large?: boolean,
  fallback?: JSX.Element,
  id?: string,
  legendConfig?: any, // Adjust this type if needed
  mock?: boolean,
}> = (props) => {
  const app = useAppContext();

  const [isVerified, setIsVerified] = createSignal(false);

  // Check if the user is verified and return if they are or not
  const checkVerification = () => {
    const nip05 = props.user?.nip05;

    if (!nip05) {
      setIsVerified(false); // User is not verified
      return;
    }

    // Check the verification status using the isAccountVerified function
    isAccountVerified(nip05).then(profile => {
      if (profile) {
        setIsVerified(profile.pubkey === props.user?.pubkey); // Set verified status based on pubkey
      } else {
        setIsVerified(false); // No verification found
      }
    });
  }

  // Hook to check verification when the component is mounted
  onMount(() => {
    checkVerification();
  });

  // Return null to render nothing for both verified and non-verified users
  return null;
};

export default VerificationCheck;
