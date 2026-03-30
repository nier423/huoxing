export type DebateTopicStatus = "not_started" | "ongoing" | "ended";

export interface SchedulableDebateTopic {
  id: string;
  startsAt: string | null;
}

export interface DebateTopicTiming {
  status: DebateTopicStatus;
  startMs: number;
  endMs: number;
  timeLeftMs: number;
}

export const DEBATE_TOPIC_DURATION_MS = 3 * 24 * 60 * 60 * 1000;
const DEBATE_TIME_ZONE = "Asia/Shanghai";

const monthDayFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: DEBATE_TIME_ZONE,
  month: "2-digit",
  day: "2-digit",
});

const monthDayTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: DEBATE_TIME_ZONE,
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function parseStartsAt(startsAt: string) {
  const startMs = Date.parse(startsAt);

  if (Number.isNaN(startMs)) {
    throw new Error(`Invalid debate topic startsAt: ${startsAt}`);
  }

  return startMs;
}

export function getDebateTopicEndMs(startsAt: string) {
  return parseStartsAt(startsAt) + DEBATE_TOPIC_DURATION_MS;
}

export function getDebateTopicTiming(
  startsAt: string,
  nowMs = Date.now()
): DebateTopicTiming {
  const startMs = parseStartsAt(startsAt);
  const endMs = startMs + DEBATE_TOPIC_DURATION_MS;

  if (nowMs < startMs) {
    return {
      status: "not_started",
      startMs,
      endMs,
      timeLeftMs: startMs - nowMs,
    };
  }

  if (nowMs < endMs) {
    return {
      status: "ongoing",
      startMs,
      endMs,
      timeLeftMs: endMs - nowMs,
    };
  }

  return {
    status: "ended",
    startMs,
    endMs,
    timeLeftMs: 0,
  };
}

export function selectDefaultDebateTopicId<T extends SchedulableDebateTopic>(
  topics: T[],
  preferredTopicId?: string | null,
  nowMs = Date.now()
) {
  if (preferredTopicId && topics.some((topic) => topic.id === preferredTopicId)) {
    return preferredTopicId;
  }

  const scheduledTopics = topics
    .filter((topic): topic is T & { startsAt: string } => Boolean(topic.startsAt))
    .map((topic) => ({
      ...topic,
      timing: getDebateTopicTiming(topic.startsAt, nowMs),
    }));

  const ongoingTopic = scheduledTopics
    .filter((topic) => topic.timing.status === "ongoing")
    .sort((left, right) => right.timing.startMs - left.timing.startMs)[0];

  if (ongoingTopic) {
    return ongoingTopic.id;
  }

  const upcomingTopic = scheduledTopics
    .filter((topic) => topic.timing.status === "not_started")
    .sort((left, right) => left.timing.startMs - right.timing.startMs)[0];

  if (upcomingTopic) {
    return upcomingTopic.id;
  }

  const latestEndedTopic = scheduledTopics.sort(
    (left, right) => right.timing.startMs - left.timing.startMs
  )[0];

  if (latestEndedTopic) {
    return latestEndedTopic.id;
  }

  return topics[0]?.id ?? null;
}

export function formatDebateTopicDateLabel(value: string | number | Date) {
  return monthDayFormatter.format(new Date(value));
}

export function formatDebateTopicDateTimeLabel(value: string | number | Date) {
  return monthDayTimeFormatter.format(new Date(value));
}
