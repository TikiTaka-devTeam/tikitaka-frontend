// src/features/lecture/hooks/useScale.js
import { useEffect, useState } from "react";

const BASE_WIDTH = 1210;
const BASE_HEIGHT = 845;
const MAX_SCALE = 1.5;
const MIN_SCALE = 0.25;

function getViewportScale() {
  if (typeof window === "undefined") {
    return 1;
  }

  const widthScale = window.innerWidth / BASE_WIDTH;
  const heightScale = window.innerHeight / BASE_HEIGHT;

  return Math.min(Math.max(Math.min(widthScale, heightScale), MIN_SCALE), MAX_SCALE);
}

function px(value, scale) {
  return `${Math.round(value * scale * 1000) / 1000}px`;
}

export default function useScale() {
  const [scale, setScale] = useState(getViewportScale);

  useEffect(() => {
    function handleResize() {
      setScale(getViewportScale());
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    "--ui-scale": scale,

    "--topnav-h": px(96, scale),
    "--tabs-h": px(45, scale),
    "--toolbar-h": px(55, scale),

    "--topnav-pad-x": px(14, scale),
    "--topnav-pad-b": px(17, scale),
    "--topnav-title-size": px(24, scale),
    "--topnav-back-size": px(30, scale),
    "--topnav-action-size": px(44, scale),
    "--topnav-action-icon": px(27, scale),

    "--tab-h": px(40, scale),
    "--tab-active-h": px(45, scale),
    "--tab-radius": px(10, scale),
    "--tab-pad-x": px(40, scale),
    "--tab-font": px(15, scale),
    "--tab-close-size": px(20, scale),
    "--tab-close-right": px(16, scale),

    "--toolbar-tools-left": px(131, scale),
    "--tool-wrap": px(33, scale),
    "--tool-btn": px(33, scale),
    "--tool-icon": px(25, scale),
    "--tool-radius": px(7, scale),
    "--tool-gap": px(22, scale),
    "--tool-list-gap": px(34, scale),
    "--tool-top": px(13, scale),
    "--toolbar-divider-w": px(1.5, scale),
    "--toolbar-divider-h": px(35, scale),
    "--toolbar-divider-mt": px(10, scale),
    "--toolbar-divider-mr": px(24, scale),
    "--toolbar-right-w": px(356, scale),
    "--thickness-field-w": px(59, scale),
    "--colors-field-w": px(297, scale),
    "--question-all-w": px(140, scale),
    "--question-all-h": px(33, scale),
    "--question-all-font": px(16, scale),

    "--stage-pad-x": px(22, scale),
    "--stage-pad-b": px(22, scale),

    "--pager-h": px(34, scale),
    "--pager-bottom": px(10, scale),
    "--pager-pad-x": px(12, scale),
    "--pager-gap": px(10, scale),
    "--pager-btn": px(26, scale),
    "--pager-font": px(14, scale),

    "--question-panel-w": px(306, scale),
    "--question-panel-header-h": px(47, scale),
    "--question-panel-title-icon": px(20, scale),
    "--question-panel-title-font": px(16, scale),
    "--question-panel-divider-w": px(280, scale),
    "--question-panel-divider-h": px(1.5, scale),
    "--question-panel-body-gap": px(6.5, scale),
    "--question-panel-pad-top": px(17, scale),
    "--question-panel-pad-left": px(12, scale),
    "--question-card-w": px(240, scale),
    "--question-card-min-h": px(50, scale),
    "--question-card-radius": px(10, scale),
    "--question-card-pad-y": px(14, scale),
    "--question-card-pad-left": px(12, scale),
    "--question-card-pad-right": px(42, scale),
    "--question-card-gap": px(16, scale),
    "--question-card-font": px(12, scale),
    "--question-more-top": px(14, scale),
    "--question-more-right": px(14, scale),
    "--question-more-w": px(15.54, scale),
    "--question-more-h": px(2.8, scale),

    "--bubble-min-w": px(150, scale),
    "--bubble-max-w": px(350, scale),
    "--bubble-min-h": px(39, scale),
    "--bubble-pad-y": px(10, scale),
    "--bubble-pad-x": px(20, scale),
    "--bubble-radius": px(20, scale),
    "--bubble-font": px(13, scale),
    "--bubble-arrow": px(26, scale),
    "--bubble-arrow-left": px(-22, scale),
    "--bubble-arrow-top": px(-24, scale),

    "--professor-icon": px(41, scale),
    "--professor-icon-left": px(-55, scale),
    "--professor-icon-top": px(-32, scale),
    "--professor-done": px(18, scale),
  };
}