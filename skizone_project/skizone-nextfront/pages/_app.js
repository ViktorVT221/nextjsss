// Цей файл є "глобальною обгорткою" всього додатка в Next.js
import '../styles/app.css'; // глобальні стилі
import NavBar from '../components/NavBar'; // твій компонент шапки

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <NavBar />
      <div className="app-container">
        <Component {...pageProps} />
      </div>
    </>
  );
}