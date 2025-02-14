import { Component, createSignal, onMount } from "solid-js";
import { hookForDev } from "../../lib/devTools";
import { useAccountContext } from "../../contexts/AccountContext";
import Avatar from "../Avatar/Avatar";
import { TopZap } from "../../types/primal";
import styles from "./Note.module.scss";

const NoteTopZapsCompact: Component<{
  note: PrimalNote;
  action: () => void;
  topZaps: TopZap[];
  topZapLimit: number;
  id?: string;
  hideMessage?: boolean;
}> = (props) => {
  const account = useAccountContext();
  const [dontAnimate, setDontAnimate] = createSignal(true);

  // This computes the top zaps from either the props or the note itself
  const topZaps = () => {
    const zaps = props.topZaps ? [...props.topZaps] : [...props.note.topZaps];
    return zaps.slice(0, 4);
  };

  const zapSender = (zap: TopZap) => {
    if (zap.pubkey === account?.publicKey) return account.activeUser;
    return (props.note.mentionedUsers || {})[zap.pubkey];
  };

  onMount(() => {
    setTimeout(() => {
      setDontAnimate(() => false);
    }, 600);
  });

  
};

export default hookForDev(NoteTopZapsCompact);
