import Link from 'next/link'
import styles from './header.module.scss'

export default function Header() {
  return(
    <header>
      <Link href="/">
        <a className={styles.header} >
          <img src="/images/vector.svg" alt="logo" />
          <h1> spacetraveling<span>.</span></h1>
        </a>
      </Link>
    </header>
  )
}
