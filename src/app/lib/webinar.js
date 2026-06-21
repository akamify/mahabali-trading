// src/app/lib/webinar.js
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
const SUNDAY = 0;
const WEBINAR_HOUR_IST = 20;
const WEBINAR_MINUTE_IST = 0;
const SUNDAY_CUTOFF_HOUR_IST = 17;
const INDIA_TIME_ZONE = "Asia/Kolkata";

export function getNextWebinarDate() {
  const nowUtcMs = Date.now();
  const nowIst = new Date(nowUtcMs + IST_OFFSET_MS);
  const istWeekday = nowIst.getUTCDay();
  const isSundayCutoffReached =
    istWeekday === SUNDAY && nowIst.getUTCHours() >= SUNDAY_CUTOFF_HOUR_IST;

  let dayDiff = (SUNDAY - istWeekday + 7) % 7;

  // Sunday submissions at/after 5 PM go to next week's webinar.
  if (isSundayCutoffReached) dayDiff = 7;

  const targetIstDate = new Date(
    Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth(), nowIst.getUTCDate()) +
      dayDiff * 24 * 60 * 60 * 1000
  );

  const targetUtcMs =
    Date.UTC(
      targetIstDate.getUTCFullYear(),
      targetIstDate.getUTCMonth(),
      targetIstDate.getUTCDate(),
      WEBINAR_HOUR_IST,
      WEBINAR_MINUTE_IST
    ) - IST_OFFSET_MS;

  return new Date(targetUtcMs);
}

export function formatWebinarParts(webinarDT) {
  const webinarDay = webinarDT.toLocaleDateString("en-IN", {
    timeZone: INDIA_TIME_ZONE,
    weekday: "long",
  });

  const webinarDate = webinarDT.toLocaleDateString("en-IN", {
    timeZone: INDIA_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const webinarTime = webinarDT.toLocaleTimeString("en-IN", {
    timeZone: INDIA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return { webinarDay, webinarDate, webinarTime };
}
