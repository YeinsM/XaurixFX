import cron from 'node-cron';
import type { FastifyInstance } from 'fastify';
import { santoDomingoDate } from './service.js';

const TIME_ZONE = 'America/Santo_Domingo';

interface SchedulerTask {
  stop(): void | Promise<void>;
}

interface SchedulerOptions {
  run(date: string): Promise<unknown>;
  onError(error: unknown): void;
  clock?: () => Date;
  schedule?: (
    expression: string,
    callback: () => void,
    options: { timezone: string; noOverlap: boolean },
  ) => SchedulerTask;
}

export function startDailyAnalysisScheduler({
  run,
  onError,
  clock = () => new Date(),
  schedule = cron.schedule,
}: SchedulerOptions): SchedulerTask {
  let stopped = false;
  let activeRun: Promise<void> | undefined;
  const runForToday = (): Promise<void> => {
    if (stopped) return Promise.resolve();
    if (activeRun) return activeRun;
    activeRun = (async () => {
      try {
        await run(santoDomingoDate(clock()));
      } catch (error) {
        onError(error);
      }
    })().finally(() => { activeRun = undefined; });
    return activeRun;
  };
  const task = schedule('0 8 * * *', () => { void runForToday(); }, {
    timezone: TIME_ZONE,
    noOverlap: true,
  });
  if (localHour(clock()) >= 8) void runForToday();
  return {
    async stop() {
      if (!stopped) {
        stopped = true;
        task.stop();
      }
      await activeRun;
    },
  };
}

export function registerAnalysisScheduler(
  app: Pick<FastifyInstance, 'addHook'>,
  scheduler: SchedulerTask,
  closeDatabase?: () => Promise<void>,
): void {
  app.addHook('onClose', async () => {
    try {
      await scheduler.stop();
    } finally {
      await closeDatabase?.();
    }
  });
}

function localHour(date: Date): number {
  const hour = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date).find(part => part.type === 'hour')?.value;
  if (hour === undefined) throw new RangeError('clock must return a valid date');
  return Number(hour);
}
