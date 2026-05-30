import logoSrc from "../../assets/images/logo_tikitaka_blue.svg";

function AppLogo({ className = "", alt = "Tikitaka" }) {
  const classes = className ? `app-logo ${className}` : "app-logo";

  return <img className={classes} src={logoSrc} alt={alt} />;
}

export default AppLogo;
