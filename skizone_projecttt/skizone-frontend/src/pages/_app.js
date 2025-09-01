import Layout from '../components/Layout';
import '../styles/globals.css';
import '../styles/navbar.css';
import '../styles/AdminPage.css';
import '../styles/AuthForms.css';
import '../styles/CartPage.css';
import '../styles/HomePage.css';
import '../styles/OrderPage.css';
import '../styles/AccountPage.css';
import '../styles/ModalMessage.css';
import '../styles/WishlistPage.css';
function MyApp({ Component, pageProps }) {
    return (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    );
}

export default MyApp;
