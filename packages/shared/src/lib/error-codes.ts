/**
 * Business status code system for graph-mind application
 *
 * Format: 5-digit number [Module 2 digits][Category 3 digits]
 *
 * Numbering Scheme:
 * - Module 10: AUTH (Authentication & Authorization)
 *   - 101XX: Sign-in/Authentication errors
 *   - 102XX: Account/User management errors
 *   - 103XX: Session management errors
 *   - 104XX: Password management errors
 *   - 105XX: Email management errors
 *   - 106XX: OAuth/Social authentication errors
 *   - 107XX: Token management errors
 *
 * Translations:
 * - All error codes have corresponding user-friendly messages in:
 *   - apps/web/messages/zh-CN.json (error_code namespace)
 *   - apps/web/messages/en-US.json (error_code namespace)
 * - When adding new error codes, ensure translations are added to both locale files
 */
export const ErrorCode = {
  SUCCESS: 0,
  UNAUTHORIZED: -1,
  INVALID_REQUEST: -2,
  INTERNAL_ERROR: -3,
  NOT_FOUND: -4,

  AUTH: {
    // 101XX - Sign-in/Authentication errors
    SIGN_IN: {
      INVALID_EMAIL_OR_PASSWORD: 10101,
      USER_NOT_FOUND: 10102,
      INVALID_EMAIL: 10103,
      INVALID_PASSWORD: 10104,
    },

    // 102XX - Account/User management errors
    ACCOUNT: {
      ACCOUNT_NOT_FOUND: 10201,
      CREDENTIAL_ACCOUNT_NOT_FOUND: 10202,
      USER_ALREADY_EXISTS: 10203,
      USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 10204,
      USER_EMAIL_NOT_FOUND: 10205,
      FAILED_TO_CREATE_USER: 10206,
      FAILED_TO_UPDATE_USER: 10207,
      FAILED_TO_UNLINK_LAST_ACCOUNT: 10208,
    },

    // 103XX - Session management errors
    SESSION: {
      SESSION_EXPIRED: 10301,
      FAILED_TO_CREATE_SESSION: 10302,
      FAILED_TO_GET_SESSION: 10303,
    },

    // 104XX - Password management errors
    PASSWORD: {
      PASSWORD_TOO_SHORT: 10401,
      PASSWORD_TOO_LONG: 10402,
      USER_ALREADY_HAS_PASSWORD: 10403,
    },

    // 105XX - Email management errors
    EMAIL: {
      EMAIL_NOT_VERIFIED: 10501,
      EMAIL_CAN_NOT_BE_UPDATED: 10502,
    },

    // 106XX - OAuth/Social authentication errors
    OAUTH: {
      PROVIDER_NOT_FOUND: 10601,
      SOCIAL_ACCOUNT_ALREADY_LINKED: 10602,
      FAILED_TO_GET_USER_INFO: 10603,
      ID_TOKEN_NOT_SUPPORTED: 10604,
    },

    // 107XX - Token management errors
    TOKEN: {
      INVALID_TOKEN: 10701,
    },
  },

  USER: {
    NOT_FOUND: 20101,
  },

  // Module 30: GRAPH (Knowledge Graph operations)
  GRAPH: {
    // 301XX - Node errors
    NODE_NOT_FOUND: 30101,
    NODE_ALREADY_EXISTS: 30102,

    // 302XX - Relationship errors
    RELATIONSHIP_NOT_FOUND: 30201,
    INVALID_RELATIONSHIP: 30202,

    // 303XX - Query errors
    GRAPH_QUERY_ERROR: 30301,
    GRAPH_CONNECTION_ERROR: 30302,
  },
} as const;

type ExtractErrorCodes<T> = T extends number
  ? T
  : T extends object
    ? { [K in keyof T]: ExtractErrorCodes<T[K]> }[keyof T]
    : never;

export type ErrorCodeValue = ExtractErrorCodes<typeof ErrorCode>;

export function isValidErrorCode(code: unknown): code is ErrorCodeValue {
  if (typeof code !== "number") return false;

  const codes = new Set<number>();
  const extractCodes = (obj: unknown): void => {
    if (typeof obj === "number") {
      codes.add(obj);
    } else if (typeof obj === "object" && obj !== null) {
      for (const value of Object.values(obj)) {
        extractCodes(value);
      }
    }
  };

  extractCodes(ErrorCode);
  return codes.has(code);
}
