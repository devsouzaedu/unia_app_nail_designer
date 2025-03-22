"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="container">
      <main>
        <section className="intro">
          <h2 className="title">
            O Queridinho das Nails-designers{" "}
            <span role="img" aria-label="nail">
              💅
            </span>
          </h2>
          <p className="tagline">
            O canivete suiço para manicures, nail-designers e profissionais da unha.
          </p>
          <Link href="/auth">
            <button className="cta-button">Acesse as ferramentas 🛠️</button>
          </Link>
          <p className="users-count">Se junte a 400+ Nail designers</p>
        </section>

        <section className="gallery">
          <div className="images">
            {Array.from({ length: 8 }).map((_, index) => (
              <img
                key={index}
                src={`/gallery/img (${index + 1}).png`}
                alt={`Design ${index + 1}`}
              />
            ))}
          </div>
        </section>

        <section className="free-trial">
          <h2>Teste de graça por 10 dias</h2>
          <p>Logue agora e libere o teste grátis de 10 dias</p>
          <Link href="/auth">
            <button className="google-button">
              <img src="/gallery/google-logo.svg" alt="Google" width={20} height={20} style={{ marginRight: '8px' }} />
              Continuar com Google
            </button>
          </Link>
        </section>

        <section className="blog">
          <h2>Blog</h2>
          <div className="blog-posts">
            <div className="blog-post">
              <div className="blog-image" style={{ backgroundImage: 'url(/blog/post1.jpg)' }}></div>
              <h3>Tendências de unhas para 2023</h3>
              <p>Descubra as tendências mais quentes em nail art para este ano.</p>
              <a href="/blog/tendencias-2023">Ler mais</a>
            </div>
            <div className="blog-post">
              <div className="blog-image" style={{ backgroundImage: 'url(/blog/post2.jpg)' }}></div>
              <h3>5 dicas para unhas mais fortes</h3>
              <p>Aprenda como manter suas unhas saudáveis e fortes.</p>
              <a href="/blog/unhas-fortes">Ler mais</a>
            </div>
            <div className="blog-post">
              <div className="blog-image" style={{ backgroundImage: 'url(/blog/post3.jpg)' }}></div>
              <h3>Tutorial: Nail art minimalista</h3>
              <p>Aprenda a criar designs elegantes e minimalistas.</p>
              <a href="/blog/nail-art-minimalista">Ler mais</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Unia</h3>
            <p>Transformando suas ideias em designs de unhas incríveis com IA.</p>
          </div>
          <div className="footer-section">
            <h3>Links Rápidos</h3>
            <ul>
              <li><a href="/">Início</a></li>
              <li><a href="/sobre">Sobre</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/contato">Contato</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contato</h3>
            <p>Email: info@unia.com</p>
            <p>Telefone: (11) 9999-9999</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} Unia. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

        .container {
          background-color: #fdf4f9;
          color: #333;
          min-height: 100vh;
          font-family: 'Roboto', sans-serif;
          padding: 2rem;
        }

        main {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .intro {
          text-align: center;
          padding: 2rem 0;
        }
        .title {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          color: #000;
          font-weight: 700;
        }
        .tagline {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          color: #666;
        }
        .cta-button {
          background: #e62e69;
          border: none;
          padding: 1rem 3rem;
          border-radius: 8px;
          font-size: 1.2rem;
          cursor: pointer;
          color: #fff;
          transition: background 0.3s;
          min-width: 250px;
        }
        .cta-button:hover {
          background: #d0225e;
        }
        .users-count {
          margin-top: 1rem;
          font-size: 0.9rem;
          color: #666;
        }
        .gallery {
          text-align: center;
          padding: 2rem 0;
        }
        .images {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1.5rem;
        }
        .images img {
          width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .free-trial {
          text-align: center;
          padding: 3rem 0;
          background-color: #f8e8f2;
          border-radius: 12px;
          margin: 2rem 0;
        }
        .free-trial h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #e62e69;
        }
        .free-trial p {
          font-size: 1rem;
          margin-bottom: 1.5rem;
          color: #666;
        }
        .google-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #fff;
          border: 1px solid #ddd;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          color: #333;
          transition: background 0.3s;
          margin: 0 auto;
        }
        .google-button:hover {
          background: #f5f5f5;
        }
        
        .blog {
          padding: 3rem 0;
        }
        .blog h2 {
          font-size: 2rem;
          margin-bottom: 2rem;
          color: #e62e69;
          text-align: center;
        }
        .blog-posts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }
        .blog-post {
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .blog-image {
          width: 100%;
          height: 200px;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        .blog-post h3 {
          padding: 1rem 1rem 0.5rem;
          font-size: 1.2rem;
          color: #333;
        }
        .blog-post p {
          padding: 0 1rem;
          color: #666;
          font-size: 0.9rem;
        }
        .blog-post a {
          display: inline-block;
          margin: 1rem;
          color: #e62e69;
          text-decoration: none;
          font-weight: 500;
        }
        
        .footer {
          background-color: #f8e8f2;
          padding: 3rem 2rem 1rem;
          margin-top: 3rem;
          border-radius: 12px 12px 0 0;
        }
        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }
        .footer-section h3 {
          color: #e62e69;
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }
        .footer-section p {
          color: #666;
          margin-bottom: 0.5rem;
        }
        .footer-section ul {
          list-style: none;
          padding: 0;
        }
        .footer-section ul li {
          margin-bottom: 0.5rem;
        }
        .footer-section ul li a {
          color: #666;
          text-decoration: none;
        }
        .footer-section ul li a:hover {
          color: #e62e69;
        }
        .footer-bottom {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid #eee;
          color: #777;
        }
      `}</style>
    </div>
  );
}