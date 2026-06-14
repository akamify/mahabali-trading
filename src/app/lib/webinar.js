// src/app/lib/webinar.js
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
const SATURDAY = 6;
const WEBINAR_HOUR_IST = 17;
const WEBINAR_MINUTE_IST = 0;
const INDIA_TIME_ZONE = "Asia/Kolkata";

export function getNextWebinarDate() {
  const nowUtcMs = Date.now();
  const nowIst = new Date(nowUtcMs + IST_OFFSET_MS);
  const dayDiff = (SATURDAY - nowIst.getUTCDay() + 7) % 7;

  const targetIstDate = new Date(
    Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth(), nowIst.getUTCDate()) +
      dayDiff * 24 * 60 * 60 * 1000
  );

  let targetUtcMs =
    Date.UTC(
      targetIstDate.getUTCFullYear(),
      targetIstDate.getUTCMonth(),
      targetIstDate.getUTCDate(),
      WEBINAR_HOUR_IST,
      WEBINAR_MINUTE_IST
    ) - IST_OFFSET_MS;

  if (nowUtcMs >= targetUtcMs) {
    targetUtcMs += 7 * 24 * 60 * 60 * 1000;
  }

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
