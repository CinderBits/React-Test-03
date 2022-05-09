import styles from './header.module.scss'

export  function Header() {
  return(
    <header>
      <div>
        <a className={styles.home} href="">
          <img src="/images/vector.svg" alt="Logo DZ news" />
          <h1> spacetraveling<span>.</span></h1>
        </a>
      </div>
    </header>
  )
}
