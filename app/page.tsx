import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>KithGrid</h1>
          <p>
            Connect with your community. Manage your HOA, organize events, and get to know your neighbors.
          </p>
        </div>
        <div className={styles.ctas}>
          <a className={styles.primary} href="/dashboard">
            Get Started
          </a>
          <a className={styles.secondary} href="#">
            Learn More
          </a>
        </div>
      </main>
    </div>
  );
}
