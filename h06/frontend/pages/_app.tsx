import type { AppProps } from "next/app";
import Link from "next/link";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="column">
      <header className="topbar">
        <Link href="/" className="brand">
          Posts
        </Link>
        <Link href="/posts/new" className="btn">
          New post
        </Link>
      </header>
      <main>
        <Component {...pageProps} />
      </main>
    </div>
  );
}
