import { ErrorCode } from "@graph-mind/shared/lib/error-codes";
import { addMonths, addYears, differenceInSeconds } from "date-fns";
import { isSafeInteger } from "es-toolkit/compat";
import { SystemException } from "@/exceptions/system-exception";

type Unit = "second" | "minute" | "hour" | "day" | "month" | "season" | "year";

export class RedisTTLCalculator {
  raw(params: { ttl: number; unit?: Unit }): number {
    const { ttl, unit } = params;

    const now = new Date();
    let result: number = 0;
    switch (unit) {
      case "second":
        result = ttl;
        break;
      case "minute":
        result = ttl * this.$1_minute;
        break;
      case "hour":
        result = ttl * this.$1_hour;
        break;
      case "day":
        result = ttl * this.$1_day;
        break;
      case "month":
        result = differenceInSeconds(addMonths(now, ttl), now);
        break;
      case "season":
        result = differenceInSeconds(addMonths(now, ttl * 3), now);
        break;
      case "year":
        result = differenceInSeconds(addYears(now, ttl), now);
        break;
    }

    if (result <= 0 || !isSafeInteger(result)) {
      throw new SystemException({
        errcode: ErrorCode.INTERNAL_ERROR,
        message: "Redis ttl is invalid (too large or non-positive)",
      });
    }

    return result;
  }

  seconds(ttl: number) {
    return this.raw({ ttl, unit: "second" });
  }

  readonly $1_minute = 60;
  readonly $5_minutes = 300;
  readonly $10_minutes = 600;
  readonly $30_minutes = 1800;
  minutes(ttl: number) {
    return this.raw({ ttl, unit: "minute" });
  }

  readonly $1_hour = 3600;
  readonly $2_hours = 7200;
  readonly $6_hours = 21600;
  readonly $12_hours = 43200;
  hours(ttl: number) {
    return this.raw({ ttl, unit: "hour" });
  }

  readonly $1_day = 86400;
  readonly $3_days = 259200;
  readonly $7_days = 604800;
  readonly $14_days = 1209600;
  readonly $30_days = 2592000;
  readonly $60_days = 5184000;
  readonly $90_days = 7776000;
  readonly $180_days = 15552000;
  readonly $365_days = 31536000;
  days(ttl: number) {
    return this.raw({ ttl, unit: "day" });
  }

  months(ttl: number) {
    return this.raw({ ttl, unit: "month" });
  }

  seasons(ttl: number) {
    return this.raw({ ttl, unit: "season" });
  }

  years(ttl: number) {
    return this.raw({ ttl, unit: "year" });
  }
}
