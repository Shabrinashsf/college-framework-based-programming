import type { AppProps } from "next/app";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" href="/">
            Posts App
          </Link>
          <div className="navbar-nav">
            <Link className="nav-link" href="/">
              All Posts
            </Link>
            <Link className="nav-link" href="/posts/new">
              New Post
            </Link>
          </div>
        </div>
      </nav>
      <div className="container mt-4">
        <Component {...pageProps} />
      </div>
    </>
  );
}
