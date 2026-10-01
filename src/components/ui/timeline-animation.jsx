import React from "react";
import { motion } from "motion/react";

export function TimelineContent({
  as: Component = "div",
  animationNum = 0,
  timelineRef,
  customVariants,
  className = "",
  children,
  ...props
}) {
  const MotionComponent = motion(Component);

  const defaultVariants = {
    visible: (i) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.15,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
    hidden: {
      filter: "blur(8px)",
      y: 20,
      opacity: 0,
    },
  };

  const variants = customVariants || defaultVariants;

  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      custom={animationNum}
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}
