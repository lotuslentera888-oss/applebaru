import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigationType, useNavigate, useOutlet } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const BackContext = createContext((callback) => callback());
const NavigationStateContext = createContext({ scrollTop: 0, searchPortal: null });
export const useIosBack = () => useContext(BackContext);
export const useIosNavigationState = () => useContext(NavigationStateContext);
export const useIosSearchPortal = () => useContext(NavigationStateContext).searchPortal;

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
  const [scrollTop, setScrollTop] = useState(0);
  const [searchPortal, setSearchPortal] = useState(null);

  useEffect(() => {
    const visual = window.visualViewport;
    const update = () => {
      const node = viewport.current;
      if (!node) return;
      const bounds = node.getBoundingClientRect();
      const visibleBottom = visual ? visual.height + visual.offsetTop : window.innerHeight;
      const occluded = Math.max(0, bounds.bottom - visibleBottom);
      const visibleHeight = Math.max(0, Math.min(bounds.height, visibleBottom - bounds.top));
      node.style.setProperty("--ios-keyboard-offset", `${occluded}px`);
      node.style.setProperty("--ios-visible-height", `${visibleHeight}px`);
    };
    update();
    window.addEventListener("resize", update);
    visual?.addEventListener("resize", update);
    visual?.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      visual?.removeEventListener("resize", update);
      visual?.removeEventListener("scroll", update);
    };
  }, []);

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
  const originBack = ["/about", "/edit"].includes(location.pathname) && location.state?.from === "/account"
    ? "/account"
    : location.pathname.startsWith("/account/") && location.state?.from === "/settings"
      ? "/settings"
      : null;
  const fallback = originBack || parentPath(location.pathname);
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
  const setViewport = useCallback((node) => {
    viewport.current = node;
    setSearchPortal(node);
  }, []);
  const onPageScroll = (event) => {
    const nextScrollTop = event.currentTarget.scrollTop;
    positions.current.set(location.pathname, nextScrollTop);
    setScrollTop(nextScrollTop);
  };
  const restorePage = useCallback((node) => {
    if (!node) return;
    const saved = positions.current.get(location.pathname) || 0;
    node.scrollTop = saved;
    setScrollTop(saved);
  }, [location.pathname]);

  return (
    <BackContext.Provider value={back}>
      <NavigationStateContext.Provider value={{ scrollTop, searchPortal }}>
        <div ref={setViewport} className="ios-navigation-viewport" data-testid="ios-navigation"
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          onTouchCancel={() => { gesture.current = null; }}>
          <AnimatePresence initial={false} custom={direction}>
            <motion.div key={location.key} custom={direction} variants={variants}
              initial="enter" animate="active" exit="leave"
              transition={{ duration: reducedMotion ? 0 : 0.34, ease: [0.32, 0.72, 0, 1] }}
              className="ios-navigation-page" data-navigation-direction={direction < 0 ? "back" : "forward"}
              ref={restorePage}
              onScroll={onPageScroll}>
              {outlet}
            </motion.div>
          </AnimatePresence>
        </div>
      </NavigationStateContext.Provider>
    </BackContext.Provider>
  );
}
