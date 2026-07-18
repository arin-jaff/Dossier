"use client";

import { useEffect, useRef, useState } from "react";
import { Text } from "frosted-ui";
import { timeAgo } from "@/lib/types";

export interface TickerItem {
  who: string;
  verb: string;
  title: string;
  money: string;
  ts: number;
}

const ROW_PX = 24;
const STEP_MS = 2800;
const SLIDE_MS = 500;

export function ActivityTicker({ items }: { items: TickerItem[] }) {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const paused = useRef(false);

  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => {
      if (!paused.current) setIndex((i) => (i >= items.length ? i : i + 1));
    }, STEP_MS);
    return () => clearInterval(id);
  }, [items.length]);

  useEffect(() => {
    if (items.length < 2 || index !== items.length) return;
    const id = setTimeout(() => {
      setAnimate(false);
      setIndex(0);
    }, SLIDE_MS + 20);
    return () => clearTimeout(id);
  }, [index, items.length]);

  useEffect(() => {
    if (animate) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setAnimate(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [animate]);

  if (items.length === 0) return null;

  const rows = items.length > 1 ? [...items, items[0]] : items;

  return (
    <div
      className="overflow-hidden"
      style={{ height: ROW_PX }}
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
    >
      <div
        className={animate ? "transition-transform duration-500 ease-in-out" : undefined}
        style={{ transform: `translateY(-${index * ROW_PX}px)` }}
      >
        {rows.map((item, i) => (
          <div key={i} className="flex items-center" style={{ height: ROW_PX }}>
            <Text size="1" color="gray" className="min-w-0 truncate font-mono">
              {item.who} {item.verb}{" "}
              {item.verb === "extracted" ? (
                <>
                  <Text size="1" color="success" className="font-mono">
                    {item.money}
                  </Text>{" "}
                  {item.title}
                </>
              ) : (
                <>
                  {item.title}{" "}
                  <Text size="1" color="success" className="font-mono">
                    {item.money}
                  </Text>
                </>
              )}{" "}
              · {timeAgo(item.ts)}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
