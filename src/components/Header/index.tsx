import { SignInButton } from "../SignInButton";
import styles from "./styles.module.scss";
import ActiveLink from "../ActiveLink";

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src="/images/logo.svg" alt="ig.news" />
        <nav>
          <ActiveLink activeClassname={styles.active} href="/">
            Home
          </ActiveLink>
          <ActiveLink activeClassname={styles.active} href="/posts">
            Posts
          </ActiveLink>
        </nav>
        <SignInButton />
      </div>
    </header>
  );
}
