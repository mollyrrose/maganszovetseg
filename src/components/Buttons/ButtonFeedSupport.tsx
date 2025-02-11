import { Component, JSXElement } from 'solid-js';
import styles from './Buttons.module.scss';

const ButtonFeedSupport: Component<{
  id?: string,
  onClick?: (e: MouseEvent) => void,
  children?: JSXElement,
  disabled?: boolean,
  title?: string,
  href?: string,
  target?: "_blank" | "_self" | "_parent" | "_top",
}> = (props) => {

  const handleClick = (e: MouseEvent) => {
    if (props.href) {
      window.open(props.href, props.target ?? "_self");
    } else if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <a 
      id={props.id}
      class={styles.feedSupportButton} // Stílus osztály
      href={props.href}
      target={props.target ?? "_self"}
      rel={props.target === "_blank" ? "noopener noreferrer" : undefined} 
      onClick={handleClick}
      title={props.title}
    >
      {props.children}
    </a>
  );
};

export default ButtonFeedSupport;