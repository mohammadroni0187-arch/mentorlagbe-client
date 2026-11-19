"use client";

import { useSyncExternalStore } from "react";

// Server/prerender-er somoy ei value use hoy. Browser-e load hole asol year dekhay.
const FALLBACK_YEAR = 2026;

const subscribe = () => () => {}; // year live change hoy na, tai subscribe-er kichu korar nai
const getClientYear = () => new Date().getFullYear();
const getServerYear = () => FALLBACK_YEAR;

const CopyrightYear = () => {
  const year = useSyncExternalStore(subscribe, getClientYear, getServerYear);

  return <span>{year}</span>;
};

export default CopyrightYear;