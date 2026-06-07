// src/features/lecture/configs/toolbarConfig.js
import PenIcon from "../../../assets/icons/lecture/pen.svg?react";
import PenActiveIcon from "../../../assets/icons/lecture/pen_active.svg?react";

import EraserIcon from "../../../assets/icons/lecture/eraser.svg?react";
import EraserActiveIcon from "../../../assets/icons/lecture/eraser_active.svg?react";

import HighlighterIcon from "../../../assets/icons/lecture/highlighter.svg?react";
import HighlighterActiveIcon from "../../../assets/icons/lecture/highlighter_active.svg?react";

import ShapeIcon from "../../../assets/icons/lecture/shape.svg?react";
import LassoIcon from "../../../assets/icons/lecture/lasso.svg?react";
import ImageUploadIcon from "../../../assets/icons/lecture/image_upload.svg?react";
import KeyboardIcon from "../../../assets/icons/lecture/keyboard.svg?react";

import QuestionIcon from "../../../assets/icons/lecture/q_point.svg?react";
import QuestionActiveIcon from "../../../assets/icons/lecture/q_point_active.svg?react";

import QuestionListIcon from "../../../assets/icons/lecture/q_list.svg?react";

import ProfessorCheckIcon from "../../../assets/icons/lecture/professor_check.svg?react";
import ProfessorCheckActiveIcon from "../../../assets/icons/lecture/professor_check_active.svg?react";

import { TOOLS } from "../stores/useDrawingStore.js";

export function getToolbarList(mode = "student") {
  const roleSpecificTool =
    mode === "professor"
      ? {
          key: TOOLS.PROFESSOR_NOTE,
          Icon: ProfessorCheckIcon,
          ActiveIcon: ProfessorCheckActiveIcon,
          label: "수정사항 체크",
          toolClass: "tool-question",
          iconClass: "is-default",
        }
      : {
          key: TOOLS.QUESTION,
          Icon: QuestionIcon,
          ActiveIcon: QuestionActiveIcon,
          label: "질문 작성",
          toolClass: "tool-question",
          iconClass: "is-default",
        };

  return [
    {
      key: TOOLS.PEN,
      Icon: PenIcon,
      ActiveIcon: PenActiveIcon,
      label: "펜",
      toolClass: "tool-pen",
      iconClass: "is-pen",
    },
    {
      key: TOOLS.ERASER,
      Icon: EraserIcon,
      ActiveIcon: EraserActiveIcon,
      label: "지우개",
      toolClass: "tool-eraser",
      iconClass: "is-eraser",
    },
    {
      key: TOOLS.HIGHLIGHTER,
      Icon: HighlighterIcon,
      ActiveIcon: HighlighterActiveIcon,
      label: "형광펜",
      toolClass: "tool-highlighter",
      iconClass: "is-highlighter",
    },
    {
      key: TOOLS.SHAPE,
      Icon: ShapeIcon,
      label: "도형",
      toolClass: "tool-shape",
      iconClass: "is-default",
    },
    {
      key: TOOLS.LASSO,
      Icon: LassoIcon,
      label: "올가미",
      toolClass: "tool-lasso",
      iconClass: "is-default",
    },
    {
      key: TOOLS.IMAGE,
      Icon: ImageUploadIcon,
      label: "사진 추가",
      toolClass: "tool-image",
      iconClass: "is-default",
    },
    {
      key: TOOLS.KEYBOARD,
      Icon: KeyboardIcon,
      label: "키보드",
      toolClass: "tool-keyboard",
      iconClass: "is-default",
    },
    roleSpecificTool,
    {
      key: TOOLS.LIST,
      Icon: QuestionListIcon,
      label: "질문 목록",
      toolClass: "tool-list",
      iconClass: "is-default",
    },
  ];
}