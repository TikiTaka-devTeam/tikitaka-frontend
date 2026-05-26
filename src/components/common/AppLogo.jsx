import logoSrc from "../../assets/images/tikitaka_logo.svg";

function AppLogo({ className = "", alt = "Tikitaka" }) {
  const classes = className ? `app-logo ${className}` : "app-logo";

  return <img className={classes} src={logoSrc} alt={alt} />;
}

export default AppLogo;
