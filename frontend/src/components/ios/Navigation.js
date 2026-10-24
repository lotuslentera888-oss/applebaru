import React, { createContext, useContext, useRef } from "react";
import { useLocation, useNavigationType, useNavigate, useOutlet } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const BackContext = createContext((callback) => callback());
export const useIosBack = () => useContext(BackContext);

function parentPath(path) {
  if (["/general", "/wifi", "/bluetooth", "/edit"].includes(path)) return "/settings";
  if (path === "/about") return "/general";
  if (path === "/account") return "/settings";
  if (path.startsWith("/account/")) return "/account";
  if (path.startsWith("/settings/") || path.startsWith("/general/")) {
    const parts = path.split("/");
    if (parts.length > 3) return parts.slice(0, -1).join("/");
    return path.startsWith("/general/") ? "/general" : "/settings";
  }
  return null;
}

// Each outgoing outlet retains its own router context during the transition.
// No DOM snapshots, delayed navigation, or duplicate interactive headers.
export default function AnimatedOutlet() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const navigate = useNavigate();
  const outlet = useOutlet();
  const reducedMotion = useReducedMotion();
  const nextDirection = useRef(1);
  const previousKey = useRef(location.key);
  const currentDirection = useRef(1);
  const positions = useRef(new Map());
  const viewport = useRef(null);
  const gesture = useRef(null);

  if (previousKey.current !== location.key) {
    currentDirection.current = navigationType === "POP" ? -1 : nextDirection.current;
    previousKey.current = location.key;
    nextDirection.current = 1;
  }
  const direction = currentDirection.current;
  const back = (callback) => {
    nextDirection.current = -1;
    callback();
  };
  const accountOrigin = ["/about", "/edit"].includes(location.pathname) && location.state?.from === "/account";
  const fallback = accountOrigin ? "/account" : parentPath(location.pathname);
  const variants = {
    enter: (d) => ({ x: reducedMotion ? 0 : d > 0 ? "100%" : "-28%", opacity: 1 }),
    active: { x: 0, opacity: 1 },
    leave: (d) => ({ x: reducedMotion ? 0 : d > 0 ? "-28%" : "100%", opacity: reducedMotion ? 0 : 1 }),
  };
  const onTouchStart = (event) => {
    if (!fallback || event.touches.length !== 1) return;
    const touch = event.touches[0];
    const left = viewport.current?.getBoundingClientRect().left || 0;
    if (touch.clientX - left > 24) return;
    gesture.current = { x: touch.clientX, y: touch.clientY, dx: 0, dy: 0 };
  };
  const onTouchMove = (event) => {
    if (!gesture.current || event.touches.length !== 1) return;
    gesture.current.dx = event.touches[0].clientX - gesture.current.x;
    gesture.current.dy = event.touches[0].clientY - gesture.current.y;
    if (Math.abs(gesture.current.dy) > 32 && Math.abs(gesture.current.dy) > gesture.current.dx) gesture.current = null;
  };
  const onTouchEnd = () => {
    const touch = gesture.current;
    gesture.current = null;
    if (touch && touch.dx > 70 && touch.dx > Math.abs(touch.dy) * 1.5) {
      back(() => navigate(fallback));
    }
  };
  return (
    <BackContext.Provider value={back}>
      <div ref={viewport} className="ios-navigation-viewport" data-testid="ios-navigation"
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        onTouchCancel={() => { gesture.current = null; }}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div key={location.key} custom={direction} variants={variants}
            initial="enter" animate="active" exit="leave"
            transition={{ duration: reducedMotion ? 0 : 0.34, ease: [0.32, 0.72, 0, 1] }}
            className="ios-navigation-page" data-navigation-direction={direction < 0 ? "back" : "forward"}
            ref={(node) => { if (node) node.scrollTop = positions.current.get(location.pathname) || 0; }}
            onScroll={(event) => positions.current.set(location.pathname, event.currentTarget.scrollTop)}>
            {outlet}
          </motion.div>
        </AnimatePresence>
      </div>
    </BackContext.Provider>
  );
}
