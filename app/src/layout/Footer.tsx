import logo from '../assets/images/creator-logo.png?w=80;120&format=avif;webp;png&as=picture'
import { Picture } from '../components/Picture'
import { site } from '../content/site'
import s from './Footer.module.css'

export function Footer() {
  return (
    <footer className={s.footer} data-cursor="blend">
      <div className={s.container}>
        <div className={s.top}>
          <div className={s.start}>
            <div className={s.pair}>
              <p className="t-caption">Email :</p>
              <p className="t-label">
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </p>
            </div>
          </div>
          <div className={s.end}>
            <div className={`${s.pair} ${s.pairEnd}`}>
              <p className="t-caption">Call Today :</p>
              <p className="t-label">
                <a href={site.phoneHref}>{site.phoneDisplay}</a>
              </p>
            </div>
          </div>
        </div>
        <hr className={s.divider} />
        <div className={s.bottom}>
          <div className={s.copyright}>
            <p className="t-caption">© Copyright 2025. All Rights Reserved by LilDhan</p>
          </div>
          <div className={s.creditColumn}>
            <div className={s.credit}>
              <p className="t-caption">Created by</p>
              <span className={s.logo}>
                <Picture src={logo} alt="Creator Logo" sizes="40px" />
              </span>
              <p className="t-caption">Lil Dhan</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
